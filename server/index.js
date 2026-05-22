import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Pool, types } = pg;

types.setTypeParser(20, (value) => Number(value));
types.setTypeParser(1700, (value) => Number(value));

const PORT = Number(process.env.PORT || 3001);
const PRODUCT_KEY = process.env.PRYMEIRA_PRODUCT_KEY || "crm";
const ACCOUNT_API_URL = (process.env.PRYMEIRA_ACCOUNT_API_URL || "").replace(
  /\/$/,
  "",
);
const DATABASE_URL = process.env.DATABASE_URL;
if (!ACCOUNT_API_URL) {
  throw new Error("PRYMEIRA_ACCOUNT_API_URL is required");
}

const databaseConfig = DATABASE_URL
  ? { connectionString: DATABASE_URL }
  : {
      host: process.env.PGHOST || "vincula_postgres",
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || "prymeira_crm",
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD,
    };

if (!DATABASE_URL && !process.env.PGPASSWORD) {
  throw new Error("DATABASE_URL or PGPASSWORD is required");
}

const pool = new Pool({
  ...databaseConfig,
  max: Number(process.env.DB_POOL_SIZE || 10),
});

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const tenantResources = new Set([
  "companies",
  "companies_summary",
  "contacts",
  "contacts_summary",
  "contact_notes",
  "pipelines",
  "deals",
  "deal_notes",
  "leads",
  "sales",
  "sales_goals",
  "tags",
  "automation_runs",
  "proposal_templates",
  "proposal_template_items",
  "proposals",
  "proposal_items",
  "automation_rules",
  "tasks",
  "configuration",
  "favicons_excluded_domains",
]);

const resources = {
  activity_log: { read: "activity_log", write: null },
  companies: { read: "companies_summary", write: "companies" },
  companies_summary: { read: "companies_summary", write: null },
  contacts: { read: "contacts_summary", write: "contacts" },
  contacts_summary: { read: "contacts_summary", write: null },
  contact_notes: { read: "contact_notes", write: "contact_notes" },
  pipelines: { read: "pipelines", write: "pipelines" },
  deals: { read: "deals", write: "deals" },
  deal_notes: { read: "deal_notes", write: "deal_notes" },
  leads: { read: "leads", write: "leads" },
  sales: { read: "sales", write: "sales" },
  sales_goals: { read: "sales_goals", write: "sales_goals" },
  tags: { read: "tags", write: "tags" },
  automation_runs: { read: "automation_runs", write: "automation_runs" },
  proposal_templates: {
    read: "proposal_templates",
    write: "proposal_templates",
  },
  proposal_template_items: {
    read: "proposal_template_items",
    write: "proposal_template_items",
  },
  proposals: { read: "proposals", write: "proposals" },
  proposal_items: { read: "proposal_items", write: "proposal_items" },
  automation_rules: { read: "automation_rules", write: "automation_rules" },
  tasks: { read: "tasks", write: "tasks" },
  configuration: { read: "configuration", write: "configuration" },
  favicons_excluded_domains: {
    read: "favicons_excluded_domains",
    write: "favicons_excluded_domains",
  },
};

const jsonColumnTypes = {
  companies: {
    context_links: "json",
    logo: "jsonb",
  },
  contacts: {
    avatar: "jsonb",
    email_jsonb: "jsonb",
    phone_jsonb: "jsonb",
  },
  sales: {
    avatar: "jsonb",
  },
  pipelines: {
    stages: "jsonb",
  },
  automation_rules: {
    params: "jsonb",
  },
  configuration: {
    config: "jsonb",
  },
};

const jsonArrayColumns = {
  contact_notes: new Set(["attachments"]),
  deal_notes: new Set(["attachments"]),
};

const searchableColumns = {
  contacts: [
    "first_name",
    "last_name",
    "company_name",
    "title",
    "email_fts",
    "phone_fts",
    "background",
  ],
  companies: [
    "name",
    "phone_number",
    "website",
    "zipcode",
    "city",
    "state_abbr",
  ],
  leads: [
    "first_name",
    "last_name",
    "email",
    "phone_number",
    "company_name",
    "source",
    "interest",
  ],
  deals: ["name", "category", "description"],
};

const defaultPipelineStages = [
  { value: "opportunity", label: "Oportunidade" },
  { value: "proposal-sent", label: "Proposta enviada" },
  { value: "in-negociation", label: "Em negociação" },
  { value: "won", label: "Ganho" },
  { value: "lost", label: "Perdido" },
  { value: "delayed", label: "Adiado" },
];

const accessCache = new Map();

const json = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(body);
};

const error = (res, status, message, details) =>
  json(res, status, { error: { message, details } });

const readBody = async (req) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
};

const isIdentifier = (value) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
const q = (identifier) => {
  if (!isIdentifier(identifier)) throw new Error(`Invalid identifier ${identifier}`);
  return `"${identifier}"`;
};

const tableName = (table) => `public.${q(table)}`;

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
};

const checkAccess = async (token) => {
  const cached = accessCache.get(token);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const response = await fetch(
    `${ACCOUNT_API_URL}/access-check?product_key=${encodeURIComponent(
      PRODUCT_KEY,
    )}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.allowed || !payload.workspace_id) {
    const message =
      payload?.error?.message ||
      payload?.reason ||
      "Acesso ao produto nao autorizado.";
    const err = new Error(message);
    err.status = response.ok ? 403 : response.status;
    throw err;
  }

  const value = {
    workspaceId: payload.workspace_id,
    workspaceRole: payload.workspace_role || "member",
    productRole: payload.product_role || "member",
  };
  accessCache.set(token, { value, expiresAt: Date.now() + 30_000 });
  return value;
};

const authenticate = async (req) => {
  const token = getBearerToken(req);
  if (!token) {
    const err = new Error("Missing bearer token");
    err.status = 401;
    throw err;
  }
  return { token, ...(await checkAccess(token)) };
};

const prepareSchemaSql = async () => {
  const tables = await readFile(
    path.join(repoRoot, "supabase/schemas/01_tables.sql"),
    "utf8",
  );
  const views = await readFile(
    path.join(repoRoot, "supabase/schemas/03_views.sql"),
    "utf8",
  );

  return [
    tables
      .replace(
        /create extension if not exists "http" with schema "extensions";/g,
        "",
      )
      .replace(
        /create extension if not exists "citext" with schema "extensions";/g,
        'create extension if not exists "citext";',
      )
      .replace(/extensions\.citext/g, "citext"),
    views.replace(/ with \(security_invoker = (?:on|off)\)/g, ""),
  ].join("\n");
};

const runMigrations = async () => {
  await pool.query(`
    create table if not exists public.crm_internal_migrations (
      name text primary key,
      applied_at timestamp with time zone not null default now()
    )
  `);

  const { rowCount } = await pool.query(
    "select 1 from public.crm_internal_migrations where name = $1",
    ["initial_schema"],
  );
  if (rowCount) return;

  const sql = await prepareSchemaSql();
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query(
      "insert into public.crm_internal_migrations (name) values ($1)",
      ["initial_schema"],
    );
    await client.query("commit");
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
};

const waitForDatabase = async () => {
  const startedAt = Date.now();
  while (true) {
    try {
      await pool.query("select 1");
      return;
    } catch (err) {
      if (err?.code === "28P01") {
        throw new Error(
          "Postgres rejected CRM_POSTGRES_PASSWORD for user postgres. If this is a blank Vincula database, remove the vincula_postgres_data volume and redeploy with the current password. If you need to keep the volume, change the postgres password inside the database to match CRM_POSTGRES_PASSWORD.",
        );
      }
      if (Date.now() - startedAt > 60_000) throw err;
      console.log("Waiting for Postgres...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

const parseMaybeJson = (value) => {
  if (value == null) return value;
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseInList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [value];
  const trimmed = value.trim();
  const body =
    (trimmed.startsWith("(") && trimmed.endsWith(")")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
      ? trimmed.slice(1, -1)
      : trimmed;
  if (!body) return [];
  return body.split(",").map((item) => item.trim().replace(/^"|"$/g, ""));
};

const buildCondition = (fieldAndOperator, value, values) => {
  const [field, operator = "eq"] = fieldAndOperator.split("@");
  if (!isIdentifier(field)) {
    throw new Error(`Invalid filter field ${field}`);
  }
  const col = q(field);
  const nextParam = (paramValue) => {
    values.push(paramValue);
    return `$${values.length}`;
  };

  if (operator === "is") {
    return value === null || value === "null" ? `${col} is null` : `${col} is not null`;
  }
  if (operator === "in") {
    const param = nextParam(parseInList(value));
    return `${col} = any(${param})`;
  }
  if (operator === "ilike") {
    const param = nextParam(`%${String(value)}%`);
    return `${col}::text ilike ${param}`;
  }
  if (operator === "neq") return `${col} <> ${nextParam(value)}`;
  if (operator === "gte") return `${col} >= ${nextParam(value)}`;
  if (operator === "lte") return `${col} <= ${nextParam(value)}`;
  if (operator === "gt") return `${col} > ${nextParam(value)}`;
  if (operator === "lt") return `${col} < ${nextParam(value)}`;
  if (operator === "cs") {
    const param = nextParam(parseInList(value).map((item) => Number(item)));
    return `${col} @> ${param}::bigint[]`;
  }
  return `${col} = ${nextParam(value)}`;
};

const buildWhere = ({ resource, filter = {}, workspaceId, values }) => {
  const clauses = [];
  if (tenantResources.has(resource)) {
    clauses.push(`workspace_id = ${(() => {
      values.push(workspaceId);
      return `$${values.length}`;
    })()}`);
  }

  const { q: search, "@or": orFilter, ...rest } = filter || {};
  for (const [key, rawValue] of Object.entries(rest)) {
    if (rawValue === undefined || rawValue === "") continue;
    clauses.push(buildCondition(key, parseMaybeJson(rawValue), values));
  }

  if (search && searchableColumns[resource]) {
    const searchClauses = searchableColumns[resource].map((column) =>
      buildCondition(`${column}@ilike`, search, values),
    );
    clauses.push(`(${searchClauses.join(" or ")})`);
  }

  if (orFilter && typeof orFilter === "object" && !Array.isArray(orFilter)) {
    const searchClauses = Object.entries(orFilter)
      .filter(([, rawValue]) => rawValue !== undefined && rawValue !== "")
      .map(([key, rawValue]) => buildCondition(key, rawValue, values));
    if (searchClauses.length) clauses.push(`(${searchClauses.join(" or ")})`);
  }

  return clauses.length ? `where ${clauses.join(" and ")}` : "";
};

const ensureResource = (resource, mode = "read") => {
  const config = resources[resource];
  if (!config || !config[mode]) {
    const err = new Error(`Unsupported resource ${resource}`);
    err.status = 404;
    throw err;
  }
  return config[mode];
};

const listRecords = async (auth, resource, query) => {
  const table = ensureResource(resource, "read");
  const filter = parseMaybeJson(query.get("filter")) || {};
  const sort = parseMaybeJson(query.get("sort")) || { field: "id", order: "ASC" };
  const pagination = parseMaybeJson(query.get("pagination")) || {
    page: 1,
    perPage: 25,
  };
  const values = [];
  const where = buildWhere({
    resource,
    filter,
    workspaceId: auth.workspaceId,
    values,
  });
  const countSql = `select count(*)::int as total from ${tableName(table)} ${where}`;
  const { rows: countRows } = await pool.query(countSql, values);

  const field = isIdentifier(sort.field || "") ? sort.field : "id";
  const order = String(sort.order || "ASC").toUpperCase() === "DESC" ? "desc" : "asc";
  const perPage = Math.max(1, Math.min(Number(pagination.perPage || 25), 1000));
  const page = Math.max(1, Number(pagination.page || 1));
  values.push(perPage, (page - 1) * perPage);
  const sql = `select * from ${tableName(table)} ${where} order by ${q(
    field,
  )} ${order} limit $${values.length - 1} offset $${values.length}`;
  const { rows } = await pool.query(sql, values);
  return { data: rows.map(normalizeRow), total: countRows[0]?.total || 0 };
};

const getRecord = async (auth, resource, id) => {
  const table = ensureResource(resource, "read");
  const values = [id];
  const tenantClause = tenantResources.has(resource)
    ? `and workspace_id = $${values.push(auth.workspaceId)}`
    : "";
  const { rows } = await pool.query(
    `select * from ${tableName(table)} where id = $1 ${tenantClause} limit 1`,
    values,
  );
  if (!rows[0]) {
    const err = new Error("Record not found");
    err.status = 404;
    throw err;
  }
  return { data: normalizeRow(rows[0]) };
};

const normalizeRow = (row) => {
  if (!row) return row;
  return {
    ...row,
    contactNote: row.contact_note ?? undefined,
    dealNote: row.deal_note ?? undefined,
  };
};

const sanitizeWriteData = (resource, data, auth) => {
  const copy = { ...data };
  delete copy.id;
  if (tenantResources.has(resource)) {
    copy.workspace_id = auth.workspaceId;
  }
  return copy;
};

const prepareWriteColumn = (table, column, value) => {
  const jsonType = jsonColumnTypes[table]?.[column];
  if (jsonType) {
    return {
      value: value == null ? null : JSON.stringify(value),
      cast: jsonType,
    };
  }

  if (jsonArrayColumns[table]?.has(column)) {
    return {
      value: Array.isArray(value)
        ? value.map((item) =>
            item == null || typeof item === "string"
              ? item
              : JSON.stringify(item),
          )
        : value,
      cast: "jsonb[]",
    };
  }

  return { value, cast: null };
};

const parameterForColumn = (index, cast) =>
  cast ? `$${index}::${cast}` : `$${index}`;

const insertRecord = async (auth, resource, data) => {
  const table = ensureResource(resource, "write");
  const payload = sanitizeWriteData(resource, data, auth);
  if (!Object.keys(payload).length) {
    throw new Error("Cannot create empty record");
  }
  const columns = Object.keys(payload).filter(isIdentifier);
  const preparedColumns = columns.map((column) =>
    prepareWriteColumn(table, column, payload[column]),
  );
  const values = preparedColumns.map((column) => column.value);
  const params = preparedColumns.map((column, index) =>
    parameterForColumn(index + 1, column.cast),
  );
  const sql = `insert into ${tableName(table)} (${columns
    .map(q)
    .join(", ")}) values (${params.join(", ")}) returning *`;
  const { rows } = await pool.query(sql, values);
  return { data: normalizeRow(rows[0]) };
};

const updateRecord = async (auth, resource, id, data) => {
  const table = ensureResource(resource, "write");
  const payload = sanitizeWriteData(resource, data, auth);
  delete payload.workspace_id;
  const columns = Object.keys(payload).filter(isIdentifier);
  if (!columns.length) return getRecord(auth, resource, id);
  const preparedColumns = columns.map((column) =>
    prepareWriteColumn(table, column, payload[column]),
  );
  const values = preparedColumns.map((column) => column.value);
  values.push(id);
  let where = `where id = $${values.length}`;
  if (tenantResources.has(resource)) {
    values.push(auth.workspaceId);
    where += ` and workspace_id = $${values.length}`;
  }
  const sql = `update ${tableName(table)} set ${columns
    .map(
      (column, index) =>
        `${q(column)} = ${parameterForColumn(
          index + 1,
          preparedColumns[index].cast,
        )}`,
    )
    .join(", ")} ${where} returning *`;
  const { rows } = await pool.query(sql, values);
  if (!rows[0]) {
    const err = new Error("Record not found");
    err.status = 404;
    throw err;
  }
  return { data: normalizeRow(rows[0]) };
};

const deleteRecord = async (auth, resource, id) => {
  const table = ensureResource(resource, "write");
  const values = [id];
  let where = "where id = $1";
  if (tenantResources.has(resource)) {
    values.push(auth.workspaceId);
    where += " and workspace_id = $2";
  }
  const { rows } = await pool.query(
    `delete from ${tableName(table)} ${where} returning *`,
    values,
  );
  return { data: normalizeRow(rows[0] || { id }) };
};

const ensureWorkspaceDefaults = async (client, workspaceId) => {
  await client.query(
    `insert into public.configuration (workspace_id, config)
     values ($1, '{}'::jsonb)
     on conflict (workspace_id) do nothing`,
    [workspaceId],
  );
  await client.query(
    `insert into public.pipelines (workspace_id, name, stages)
     select $1, 'Pipeline principal', $2::jsonb
     where not exists (
       select 1 from public.pipelines where workspace_id = $1
     )`,
    [workspaceId, JSON.stringify(defaultPipelineStages)],
  );
};

const syncCurrentSale = async (auth, body) => {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await ensureWorkspaceDefaults(client, auth.workspaceId);
    const fullName = body.name || body.email || "";
    const [firstName, ...rest] = fullName.split(" ");
    const first_name = body.first_name || firstName || "Usuario";
    const last_name = body.last_name || rest.join(" ") || " ";
    const administrator =
      auth.productRole === "admin" || auth.workspaceRole === "owner";
    const placeholder = await client.query(
      `update public.sales
      set
        clerk_user_id = $2,
        first_name = $3,
        last_name = $4,
        email = $5,
        administrator = $6,
        workspace_role = $7,
        product_role = $8,
        disabled = false
      where workspace_id = $1
        and lower(email::text) = lower($5::text)
        and clerk_user_id like 'manual:%'
        and not exists (
          select 1
          from public.sales existing
          where existing.workspace_id = $1
            and existing.clerk_user_id = $2
        )
      returning *`,
      [
        auth.workspaceId,
        body.clerk_user_id,
        first_name,
        last_name,
        body.email,
        administrator,
        auth.workspaceRole,
        auth.productRole,
      ],
    );

    const rows = placeholder.rows.length
      ? placeholder.rows
      : (
          await client.query(
            `insert into public.sales (
        workspace_id, clerk_user_id, first_name, last_name, email,
        administrator, workspace_role, product_role, disabled
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, false)
      on conflict (workspace_id, clerk_user_id)
      do update set
        first_name = excluded.first_name,
        last_name = excluded.last_name,
        email = excluded.email,
        administrator = excluded.administrator,
        workspace_role = excluded.workspace_role,
        product_role = excluded.product_role,
        disabled = false
      returning *`,
            [
              auth.workspaceId,
              body.clerk_user_id,
              first_name,
              last_name,
              body.email,
              administrator,
              auth.workspaceRole,
              auth.productRole,
            ],
          )
        ).rows;
    await client.query("commit");
    return { data: normalizeRow(rows[0]) };
  } catch (err) {
    await client.query("rollback");
    throw err;
  } finally {
    client.release();
  }
};

const getConfiguration = async (auth) => {
  await pool.query(
    `insert into public.configuration (workspace_id, config)
     values ($1, '{}'::jsonb)
     on conflict (workspace_id) do nothing`,
    [auth.workspaceId],
  );
  const { rows } = await pool.query(
    "select config from public.configuration where workspace_id = $1 limit 1",
    [auth.workspaceId],
  );
  return { data: rows[0]?.config || {} };
};

const updateConfiguration = async (auth, config) => {
  const { rows } = await pool.query(
    `insert into public.configuration (workspace_id, config)
     values ($1, $2::jsonb)
     on conflict (workspace_id) do update set config = excluded.config
     returning config`,
    [auth.workspaceId, JSON.stringify(config || {})],
  );
  return { data: rows[0]?.config || {} };
};

const handleApi = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "access-control-allow-headers": "authorization,content-type",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (url.pathname === "/api/health") {
    json(res, 200, { ok: true });
    return;
  }

  const auth = await authenticate(req);
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (url.pathname === "/api/auth/sync-current-sale" && req.method === "POST") {
    json(res, 200, await syncCurrentSale(auth, await readBody(req)));
    return;
  }
  if (url.pathname === "/api/configuration" && req.method === "GET") {
    json(res, 200, await getConfiguration(auth));
    return;
  }
  if (url.pathname === "/api/configuration" && req.method === "PUT") {
    const body = await readBody(req);
    json(res, 200, await updateConfiguration(auth, body.config || body));
    return;
  }

  if (pathParts[0] !== "api" || pathParts[1] !== "records" || !pathParts[2]) {
    error(res, 404, "Route not found");
    return;
  }

  const resource = pathParts[2];
  const id = pathParts[3];
  if (req.method === "GET" && id) {
    json(res, 200, await getRecord(auth, resource, id));
  } else if (req.method === "GET") {
    json(res, 200, await listRecords(auth, resource, url.searchParams));
  } else if (req.method === "POST") {
    json(res, 200, await insertRecord(auth, resource, await readBody(req)));
  } else if ((req.method === "PUT" || req.method === "PATCH") && id) {
    json(res, 200, await updateRecord(auth, resource, id, await readBody(req)));
  } else if (req.method === "DELETE" && id) {
    json(res, 200, await deleteRecord(auth, resource, id));
  } else {
    error(res, 405, "Method not allowed");
  }
};

await waitForDatabase();
await runMigrations();

const server = createServer(async (req, res) => {
  res.setHeader("access-control-allow-origin", "*");
  try {
    await handleApi(req, res);
  } catch (err) {
    console.error(err);
    error(res, err.status || 500, err.message || "Internal server error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Prymeira CRM API listening on ${PORT}`);
});
