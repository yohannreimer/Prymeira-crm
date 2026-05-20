import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";
import { createErrorResponse } from "../_shared/utils.ts";
import {
  AuthMiddleware,
  type AuthenticatedUser,
  getAuthToken,
  UserMiddleware,
} from "../_shared/authentication.ts";
import { getUserSale } from "../_shared/getUserSale.ts";
import { getTrustedPrymeiraAccess } from "../_shared/prymeiraAccess.ts";

type SaleBody = {
  action?: string;
  sales_id?: number | string;
  id?: number | string;
  workspace_id?: string;
  clerk_user_id?: string;
  email?: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar?: unknown;
  disabled?: boolean;
  administrator?: boolean;
  workspace_role?: string | null;
  product_role?: string | null;
};

const adminRoles = new Set(["admin", "administrator", "owner"]);

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const isAdminSale = (sale: any) =>
  sale?.administrator === true ||
  adminRoles.has(sale?.workspace_role) ||
  adminRoles.has(sale?.product_role);

const splitName = (body: SaleBody) => {
  if (body.first_name || body.last_name) {
    return {
      first_name: body.first_name || "Pending",
      last_name: body.last_name || " ",
    };
  }

  const [first_name, ...rest] = (body.name || body.email || "Pending").split(
    " ",
  );
  return {
    first_name: first_name || "Pending",
    last_name: rest.join(" ") || " ",
  };
};

const salePayloadFromBody = (
  body: SaleBody,
  currentUser?: AuthenticatedUser,
) => {
  const workspace_role = body.workspace_role || "member";
  const product_role = body.product_role || "member";

  return {
    ...splitName(body),
    workspace_id: body.workspace_id,
    clerk_user_id: body.clerk_user_id || body.email,
    email: body.email || currentUser?.email,
    workspace_role,
    product_role,
    administrator:
      body.administrator ??
      (adminRoles.has(workspace_role) || adminRoles.has(product_role)),
    disabled: body.disabled ?? false,
  };
};

const validateWorkspaceId = (body: SaleBody) => {
  if (!body.workspace_id) {
    return createErrorResponse(400, "Missing workspace_id");
  }
  return null;
};

async function syncCurrentUser(
  req: Request,
  body: SaleBody,
  user: AuthenticatedUser,
) {
  const workspaceError = validateWorkspaceId(body);
  if (workspaceError) return workspaceError;

  if (!body.clerk_user_id || body.clerk_user_id !== user.id) {
    return createErrorResponse(403, "Cannot sync another user");
  }

  let access;
  try {
    access = await getTrustedPrymeiraAccess(getAuthToken(req), user);
  } catch (error) {
    console.error("Prymeira access verification failed:", error);
    return createErrorResponse(403, "Prymeira access denied");
  }

  if (body.workspace_id !== access.workspace_id) {
    return createErrorResponse(403, "Workspace mismatch");
  }

  const payload = {
    ...splitName({ ...body, email: access.email, name: access.name }),
    workspace_id: access.workspace_id,
    clerk_user_id: user.id,
    email: access.email,
    workspace_role: access.workspace_role,
    product_role: access.product_role,
    administrator:
      adminRoles.has(access.workspace_role) || adminRoles.has(access.product_role),
    disabled: false,
  };

  const { data: existingSale, error: existingSaleError } = await supabaseAdmin
    .from("sales")
    .select("*")
    .eq("workspace_id", access.workspace_id)
    .eq("clerk_user_id", user.id)
    .maybeSingle();

  if (existingSaleError) {
    console.error("Error fetching current sale:", existingSaleError);
    return createErrorResponse(500, "Failed to sync current user");
  }

  if (existingSale?.disabled) {
    return createErrorResponse(403, "Account disabled");
  }

  if (!existingSale) {
    const { data: claimedPlaceholder, error: claimError } = await supabaseAdmin
      .from("sales")
      .update(payload)
      .eq("workspace_id", access.workspace_id)
      .eq("email", payload.email)
      .eq("clerk_user_id", payload.email)
      .eq("disabled", false)
      .select("*")
      .maybeSingle();

    if (claimError) {
      console.error("Error claiming placeholder sale:", claimError);
      return createErrorResponse(500, "Failed to sync current user");
    }

    if (claimedPlaceholder) {
      return jsonResponse({ data: claimedPlaceholder });
    }
  }

  const query = existingSale
    ? supabaseAdmin
        .from("sales")
        .update(payload)
        .eq("workspace_id", access.workspace_id)
        .eq("clerk_user_id", user.id)
        .eq("disabled", false)
        .select("*")
        .single()
    : supabaseAdmin
        .from("sales")
        .insert(payload)
        .select("*")
        .single();

  const { data, error } = await query;

  if (error || !data) {
    console.error("Error syncing current sale:", error);
    return createErrorResponse(500, "Failed to sync current user");
  }

  return jsonResponse({ data });
}

async function createSale(body: SaleBody, currentUserSale: any) {
  const workspaceError = validateWorkspaceId(body);
  if (workspaceError) return workspaceError;

  if (!isAdminSale(currentUserSale)) {
    return createErrorResponse(401, "Not Authorized");
  }

  if (!body.email) {
    return createErrorResponse(400, "Missing email");
  }

  const { data, error } = await supabaseAdmin
    .from("sales")
    .insert(salePayloadFromBody(body))
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error creating sale:", error);
    return createErrorResponse(500, "Failed to create sale", {
      code: error?.code,
    });
  }

  return jsonResponse({ data });
}

async function patchSale(body: SaleBody, currentUserSale: any) {
  const workspaceError = validateWorkspaceId(body);
  if (workspaceError) return workspaceError;

  const saleId = body.sales_id ?? body.id;
  if (!saleId) {
    return createErrorResponse(400, "Missing sales_id");
  }

  const { data: sale, error: fetchError } = await supabaseAdmin
    .from("sales")
    .select("*")
    .eq("id", saleId)
    .eq("workspace_id", body.workspace_id)
    .single();

  if (fetchError || !sale) {
    return createErrorResponse(404, "Not Found");
  }

  const isOwnProfile = currentUserSale.id === sale.id;
  const isAdmin = isAdminSale(currentUserSale);

  if (!isAdmin && !isOwnProfile) {
    return createErrorResponse(401, "Not Authorized");
  }

  const profileFields: Record<string, unknown> = {};
  for (const field of ["email", "first_name", "last_name", "avatar"] as const) {
    if (body[field] !== undefined) {
      profileFields[field] = body[field];
    }
  }

  const adminFields = isAdmin
    ? {
        administrator: body.administrator,
        disabled: body.disabled,
        workspace_role: body.workspace_role,
        product_role: body.product_role,
        clerk_user_id: body.clerk_user_id,
      }
    : {};

  const updatePayload = Object.fromEntries(
    Object.entries({ ...profileFields, ...adminFields }).filter(
      ([, value]) => value !== undefined,
    ),
  );

  const { data, error } = await supabaseAdmin
    .from("sales")
    .update(updatePayload)
    .eq("id", saleId)
    .eq("workspace_id", body.workspace_id)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error patching sale:", error);
    return createErrorResponse(500, "Failed to update sale", {
      code: error?.code,
    });
  }

  return jsonResponse({ data });
}

Deno.serve(async (req: Request) =>
  OptionsMiddleware(req, async (req) =>
    AuthMiddleware(req, async (req) =>
      UserMiddleware(req, async (req, user) => {
        if (!user) {
          return createErrorResponse(401, "Unauthorized");
        }

        const body = (await req.json()) as SaleBody;

        if (req.method === "POST" && body.action === "sync_current") {
          return syncCurrentUser(req, body, user);
        }

        const workspaceError = validateWorkspaceId(body);
        if (workspaceError) return workspaceError;

        const currentUserSale = await getUserSale(user, body.workspace_id!);
        if (!currentUserSale) {
          return createErrorResponse(401, "Unauthorized");
        }

        if (req.method === "POST") {
          return createSale(body, currentUserSale);
        }

        if (req.method === "PATCH") {
          return patchSale(body, currentUserSale);
        }

        return createErrorResponse(405, "Method Not Allowed");
      }),
    ),
  ),
);
