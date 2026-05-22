import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { setTimeout as delay } from "node:timers/promises";

const workspaceId = "00000000-0000-4000-8000-000000000001";
const token = "smoke-token";
const postgresPassword = "postgres";
const postgresDatabase = "prymeira_crm";
const containerName = `atomic-crm-smoke-${Date.now()}`;

const children = new Set();

const run = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.stdio || "pipe",
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => {
      stdout += chunk;
      if (options.echo) process.stdout.write(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk;
      if (options.echo) process.stderr.write(chunk);
    });
    child.on("error", reject);
    const timer = options.timeoutMs
      ? setTimeout(() => {
          child.kill("SIGTERM");
          reject(
            new Error(
              `${command} ${args.join(" ")} timed out after ${options.timeoutMs}ms`,
            ),
          );
        }, options.timeoutMs)
      : null;
    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      if (code === 0) resolve({ stdout, stderr });
      else {
        const err = new Error(
          `${command} ${args.join(" ")} failed with ${code}\n${stderr || stdout}`,
        );
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      }
    });
  });

const startAccountApi = async () => {
  const server = createServer((req, res) => {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname === "/access-check") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          allowed: true,
          workspace_id: workspaceId,
          workspace_role: "owner",
          product_role: "admin",
        }),
      );
      return;
    }
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: { message: "not found" } }));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  return {
    url: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
};

const waitFor = async (name, fn, timeoutMs = 60_000) => {
  const startedAt = Date.now();
  let lastError;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await delay(500);
    }
  }
  throw new Error(`${name} did not become ready: ${lastError?.message}`);
};

const startPostgres = async () => {
  if (process.env.SMOKE_PGHOST || process.env.SMOKE_DATABASE_URL) {
    return {
      cleanup: async () => {},
      env: {
        DATABASE_URL: process.env.SMOKE_DATABASE_URL,
        PGHOST: process.env.SMOKE_PGHOST,
        PGPORT: process.env.SMOKE_PGPORT,
        PGDATABASE: process.env.SMOKE_PGDATABASE || postgresDatabase,
        PGUSER: process.env.SMOKE_PGUSER || "postgres",
        PGPASSWORD: process.env.SMOKE_PGPASSWORD || postgresPassword,
      },
    };
  }

  await run(
    "docker",
    [
      "run",
      "--rm",
      "-d",
      "--name",
      containerName,
      "-e",
      `POSTGRES_PASSWORD=${postgresPassword}`,
      "-e",
      `POSTGRES_DB=${postgresDatabase}`,
      "-p",
      "127.0.0.1::5432",
      "postgres:16-alpine",
    ],
    { timeoutMs: 45_000 },
  );

  const { stdout } = await run("docker", ["port", containerName, "5432/tcp"], {
    timeoutMs: 10_000,
  });
  const match = stdout.match(/127\.0\.0\.1:(\d+)/);
  if (!match)
    throw new Error(`Could not detect mapped Postgres port: ${stdout}`);
  return {
    cleanup: async () => {
      await run("docker", ["rm", "-f", containerName], {
        timeoutMs: 10_000,
      }).catch(() => {});
    },
    env: {
      PGHOST: "127.0.0.1",
      PGPORT: match[1],
      PGDATABASE: postgresDatabase,
      PGUSER: "postgres",
      PGPASSWORD: postgresPassword,
    },
  };
};

const startCrmApi = async ({ accountApiUrl, postgresEnv }) => {
  const port = 3400 + Math.floor(Math.random() * 1000);
  const child = spawn("node", ["server/index.js"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      PORT: String(port),
      PRYMEIRA_ACCOUNT_API_URL: accountApiUrl,
      PRYMEIRA_PRODUCT_KEY: "crm",
      ...Object.fromEntries(
        Object.entries(postgresEnv).filter(([, value]) => value !== undefined),
      ),
      DB_POOL_SIZE: "4",
      NODE_ENV: "test",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  children.add(child);
  child.stdout.on("data", (chunk) => process.stdout.write(`[api] ${chunk}`));
  child.stderr.on("data", (chunk) => process.stderr.write(`[api] ${chunk}`));
  child.on("exit", () => children.delete(child));

  const baseUrl = `http://127.0.0.1:${port}`;
  await waitFor("crm api", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    if (!response.ok) throw new Error(`health ${response.status}`);
  });
  return { baseUrl, child };
};

const apiClient = (baseUrl) => {
  const request = async (method, path, body) => {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = text;
    }
    if (!response.ok) {
      throw new Error(
        `${method} ${path} failed with ${response.status}: ${JSON.stringify(
          payload,
        )}`,
      );
    }
    return payload;
  };

  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body),
    patch: (path, body) => request("PATCH", path, body),
    delete: (path) => request("DELETE", path),
  };
};

const listPath = (resource, query = {}) => {
  const params = new URLSearchParams();
  params.set("pagination", JSON.stringify({ page: 1, perPage: 25 }));
  params.set(
    "sort",
    JSON.stringify(query.sort || { field: "id", order: "ASC" }),
  );
  params.set("filter", JSON.stringify(query.filter || {}));
  return `/api/records/${resource}?${params}`;
};

const ok = (label) => console.log(`[ok] ${label}`);

const main = async () => {
  let accountApi;
  let api;
  let postgres;
  try {
    postgres = await startPostgres();
    accountApi = await startAccountApi();
    api = await startCrmApi({
      accountApiUrl: accountApi.url,
      postgresEnv: postgres.env,
    });
    const client = apiClient(api.baseUrl);

    await client.get("/api/health");
    ok("health");

    const sale = (
      await client.post("/api/auth/sync-current-sale", {
        clerk_user_id: "user_smoke",
        email: "smoke@example.com",
        name: "Smoke Tester",
      })
    ).data;
    ok("sync-current-sale");

    await client.put("/api/configuration", {
      title: "Prymeira Vincula",
      theme: { mode: "dark" },
    });
    await client.get("/api/configuration");
    ok("configuration json");

    const defaultPipelines = await client.get(listPath("pipelines"));
    if (!defaultPipelines.data.length)
      throw new Error("default pipeline missing");
    const pipeline = (
      await client.post("/api/records/pipelines", {
        name: "Smoke Pipeline",
        stages: [
          { value: "opportunity", label: "Oportunidade" },
          { value: "proposal-sent", label: "Proposta enviada" },
        ],
      })
    ).data;
    await client.patch(`/api/records/pipelines/${pipeline.id}`, {
      stages: [...pipeline.stages, { value: "won", label: "Ganho" }],
    });
    ok("pipeline stages jsonb");

    const company = (
      await client.post("/api/records/companies", {
        name: "Smoke Empresa",
        sector: "technology",
        website: "https://example.com",
        phone_number: "+5511999999999",
        sales_id: sale.id,
        context_links: ["https://example.com/context"],
        logo: { src: "data:image/png;base64,AA==", title: "logo.png" },
      })
    ).data;
    await client.get(listPath("companies_summary"));
    ok("companies + companies_summary");

    const contact = (
      await client.post("/api/records/contacts", {
        first_name: "Ana",
        last_name: "Smoke",
        title: "Diretora",
        status: "active",
        tags: [],
        company_id: company.id,
        sales_id: sale.id,
        email_jsonb: [{ email: "ana@example.com", type: "work" }],
        phone_jsonb: [{ number: "+5511988887777", type: "work" }],
        avatar: { src: "data:image/png;base64,AA==", title: "avatar.png" },
      })
    ).data;
    await client.get(listPath("contacts_summary"));
    ok("contacts + contacts_summary");

    await client.post("/api/records/contact_notes", {
      contact_id: contact.id,
      text: "Nota smoke",
      sales_id: sale.id,
      status: "todo",
      attachments: [{ src: "data:text/plain;base64,SGk=", title: "note.txt" }],
    });
    ok("contact notes jsonb[] attachments");

    const lead = (
      await client.post("/api/records/leads", {
        first_name: "Lead",
        last_name: "Smoke",
        email: "lead@example.com",
        phone_number: "+5511977776666",
        company_name: "Lead Empresa",
        source: "site",
        interest: "crm",
        temperature: "warm",
        status: "new",
        sales_id: sale.id,
      })
    ).data;
    ok(`leads (${lead.id})`);

    const deal = (
      await client.post("/api/records/deals", {
        name: "Smoke Negocio",
        company_id: company.id,
        contact_ids: [contact.id],
        category: "design-interface",
        stage: "opportunity",
        description: "Negocio criado pelo smoke",
        amount: 300000,
        expected_closing_date: "2026-06-30",
        sales_id: sale.id,
        index: 0,
        deal_type: "consultative",
        probability: 33,
        pipeline_id: pipeline.id,
      })
    ).data;
    await client.get(
      listPath("deals", { filter: { pipeline_id: pipeline.id } }),
    );
    ok("deals in selected pipeline");

    await client.post("/api/records/deal_notes", {
      deal_id: deal.id,
      type: "note",
      text: "Nota do negocio",
      sales_id: sale.id,
      attachments: [{ src: "data:text/plain;base64,SGk=", title: "deal.txt" }],
    });
    ok("deal notes jsonb[] attachments");

    await client.post("/api/records/tags", { name: "VIP", color: "#22c55e" });
    await client.post("/api/records/sales_goals", {
      sales_id: sale.id,
      period_start: "2026-05-01",
      revenue_goal: 1000000,
      won_deals_goal: 2,
      sent_proposals_goal: 3,
    });
    ok("tags + sales goals");

    const template = (
      await client.post("/api/records/proposal_templates", {
        name: "Modelo Smoke",
        description: "Modelo para teste",
        default_scope: "Escopo",
        default_terms: "Termos",
        active: true,
      })
    ).data;
    await client.post("/api/records/proposal_template_items", {
      template_id: template.id,
      description: "Servico",
      quantity: 1,
      unit_price: 100000,
      discount_amount: 0,
      index: 0,
    });
    const proposal = (
      await client.post("/api/records/proposals", {
        deal_id: deal.id,
        company_id: company.id,
        contact_id: contact.id,
        sales_id: sale.id,
        template_id: template.id,
        number: "PROP-SMOKE-001",
        title: "Proposta Smoke",
        status: "draft",
        scope: "Escopo",
        terms: "Termos",
        currency: "BRL",
        subtotal: 100000,
        discount_amount: 0,
        tax_amount: 0,
        total: 100000,
        valid_until: "2026-06-30",
      })
    ).data;
    const proposalItem = (
      await client.post("/api/records/proposal_items", {
        proposal_id: proposal.id,
        description: "Servico",
        quantity: 1,
        unit_price: 100000,
        discount_amount: 0,
        total: 100000,
        index: 0,
      })
    ).data;
    await client.get(listPath("proposals"));
    ok("proposals full create flow");

    const rule = (
      await client.post("/api/records/automation_rules", {
        rule_key: "smoke.rule",
        name: "Smoke Rule",
        enabled: true,
        trigger_resource: "proposals",
        trigger_event: "created",
        action_key: "create_task",
        params: { dueInDays: 1, taskText: "Follow up" },
      })
    ).data;
    const runRecord = (
      await client.post("/api/records/automation_runs", {
        rule_key: rule.rule_key,
        trigger_resource: "proposals",
        trigger_record_id: proposal.id,
        status: "success",
        message: "ok",
        sales_id: sale.id,
      })
    ).data;
    await client.post("/api/records/tasks", {
      contact_id: contact.id,
      lead_id: lead.id,
      deal_id: deal.id,
      automation_run_id: runRecord.id,
      type: "call",
      text: "Follow up",
      due_date: "2026-06-01T12:00:00.000Z",
      sales_id: sale.id,
    });
    ok("automation rules/runs + tasks");

    await client.post("/api/records/favicons_excluded_domains", {
      domain: "example.com",
    });
    await client.get(listPath("activity_log"));
    ok("favicons + activity_log");

    await client.delete(`/api/records/proposal_items/${proposalItem.id}`);
    ok("delete route responds");
  } finally {
    for (const child of children) child.kill("SIGTERM");
    await accountApi?.close();
    if (postgres?.cleanup) {
      await postgres.cleanup();
    } else if (!process.env.SMOKE_PGHOST && !process.env.SMOKE_DATABASE_URL) {
      await run("docker", ["rm", "-f", containerName], {
        timeoutMs: 10_000,
      }).catch(() => {});
    }
  }
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
