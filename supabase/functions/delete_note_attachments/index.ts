import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { AuthMiddleware, UserMiddleware } from "../_shared/authentication.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { getUserSale } from "../_shared/getUserSale.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";
import {
  getPayloadWorkspaceId,
  getWorkspaceScopedPathsToDelete,
  type AttachmentWebhookPayload,
} from "../_shared/attachmentPaths.ts";

const ATTACHMENTS_BUCKET =
  Deno.env.get("VITE_ATTACHMENTS_BUCKET") || "attachments";

const deleteNoteAttachments = async (req: Request, userId?: string) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405);
  }

  const payload = (await req.json()) as AttachmentWebhookPayload;
  const workspaceId = getPayloadWorkspaceId(payload);
  if (!workspaceId) {
    return jsonResponse({ error: "Missing workspace_id" }, 400);
  }

  const currentUserSale = await getUserSale(
    userId ? { id: userId } : undefined,
    workspaceId,
  );
  if (!currentUserSale) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const paths = getWorkspaceScopedPathsToDelete({
    bucketName: ATTACHMENTS_BUCKET,
    payload,
    workspaceId,
  });

  if (paths.length === 0) {
    return jsonResponse({
      status: "skipped",
      reason: "no_paths_to_delete",
    });
  }

  const { error } = await supabaseAdmin.storage
    .from(ATTACHMENTS_BUCKET)
    .remove(paths);

  if (error) {
    console.error("Failed to delete note attachments", {
      type: payload.type ?? null,
      paths,
      error,
    });
    return jsonResponse({ error: "Failed to delete note attachments" }, 500);
  }

  return jsonResponse({
    status: "ok",
  });
};

Deno.serve(async (req: Request) =>
  OptionsMiddleware(req, async (req) =>
    AuthMiddleware(req, async (req: Request) =>
      UserMiddleware(req, async (req, user) =>
        deleteNoteAttachments(req, user?.id),
      ),
    ),
  ),
);

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
