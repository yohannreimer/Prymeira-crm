const DEFAULT_PRODUCTION_CORS_ORIGINS = [
  "https://vincula.prymeiradigital.com.br",
];

const DEFAULT_DEVELOPMENT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];

const ADMIN_ROLES = new Set(["admin", "administrator", "owner"]);
const ADMIN_WRITE_RESOURCES = new Set([
  "automation_rules",
  "configuration",
  "favicons_excluded_domains",
  "proposal_template_items",
  "proposal_templates",
  "sales_goals",
]);

const SALES_PROFILE_FIELDS = new Set([
  "avatar",
  "email",
  "first_name",
  "last_name",
]);

export const workspaceReferenceRules = {
  automation_runs: {
    single: { sales_id: "sales" },
    array: {},
  },
  companies: {
    single: { sales_id: "sales" },
    array: {},
  },
  contacts: {
    single: { company_id: "companies", sales_id: "sales" },
    array: { tags: "tags" },
  },
  contact_notes: {
    single: { contact_id: "contacts", sales_id: "sales" },
    array: {},
  },
  deals: {
    single: {
      company_id: "companies",
      pipeline_id: "pipelines",
      sales_id: "sales",
    },
    array: { contact_ids: "contacts", tags: "tags" },
  },
  deal_notes: {
    single: { deal_id: "deals", sales_id: "sales" },
    array: {},
  },
  leads: {
    single: { sales_id: "sales" },
    array: { tags: "tags" },
  },
  proposal_items: {
    single: { proposal_id: "proposals" },
    array: {},
  },
  proposal_template_items: {
    single: { template_id: "proposal_templates" },
    array: {},
  },
  proposals: {
    single: {
      company_id: "companies",
      contact_id: "contacts",
      deal_id: "deals",
      sales_id: "sales",
      template_id: "proposal_templates",
    },
    array: {},
  },
  sales_goals: {
    single: { sales_id: "sales" },
    array: {},
  },
  stage_task_templates: {
    single: { pipeline_id: "pipelines" },
    array: {},
  },
  tasks: {
    single: {
      automation_run_id: "automation_runs",
      contact_id: "contacts",
      deal_id: "deals",
      lead_id: "leads",
      sales_id: "sales",
    },
    array: {},
  },
};

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function configuredCorsOrigins(env = process.env) {
  const configured = parseCsv(env.CORS_ORIGINS);
  if (configured.length) return configured;
  return env.NODE_ENV === "production"
    ? DEFAULT_PRODUCTION_CORS_ORIGINS
    : DEFAULT_DEVELOPMENT_CORS_ORIGINS;
}

export function buildCorsHeaders(origin, env = process.env) {
  const headers = {
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "authorization,content-type",
    "access-control-max-age": "600",
    vary: "Origin",
  };

  if (!origin) return headers;
  if (configuredCorsOrigins(env).includes(origin)) {
    headers["access-control-allow-origin"] = origin;
  }
  return headers;
}

export function applyCorsHeaders(req, res, env = process.env) {
  const headers = buildCorsHeaders(req.headers.origin, env);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

export function bodyLimitForPath(pathname) {
  if (
    pathname.startsWith("/api/records/contact_notes") ||
    pathname.startsWith("/api/records/deal_notes")
  ) {
    return 35 * 1024 * 1024;
  }

  if (
    pathname === "/api/configuration" ||
    pathname.startsWith("/api/records/sales")
  ) {
    return 8 * 1024 * 1024;
  }

  return 2 * 1024 * 1024;
}

export async function readJsonBody(req, limitBytes) {
  const chunks = [];
  let received = 0;
  for await (const chunk of req) {
    received += chunk.length;
    if (received > limitBytes) {
      const err = new Error("Payload too large");
      err.status = 413;
      throw err;
    }
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw);
}

export function decodeJwtPayload(token) {
  const payloadSegment = String(token || "").split(".")[1];
  if (!payloadSegment) return {};
  try {
    return JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8"));
  } catch {
    return {};
  }
}

export function isAdminAccess(auth) {
  return ADMIN_ROLES.has(auth?.workspaceRole) || ADMIN_ROLES.has(auth?.productRole);
}

export function requireWriteAccess(auth, resource, action) {
  if (isAdminAccess(auth)) return;
  if (resource === "sales" && action === "update") return;

  if (resource === "sales" || ADMIN_WRITE_RESOURCES.has(resource)) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }
}

export function filterSalesUpdatePayload(auth, payload) {
  if (isAdminAccess(auth)) return payload;
  return Object.fromEntries(
    Object.entries(payload).filter(([field]) => SALES_PROFILE_FIELDS.has(field)),
  );
}
