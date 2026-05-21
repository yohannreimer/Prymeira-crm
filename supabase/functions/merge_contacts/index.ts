import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";
import { createErrorResponse } from "../_shared/utils.ts";
import { AuthMiddleware, UserMiddleware } from "../_shared/authentication.ts";
import { getUserSale } from "../_shared/getUserSale.ts";

type Contact = {
  id: number;
};

async function getWorkspaceContact(id: number, workspaceId: string) {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .single();

  if (error || !data) return null;
  return data as Contact;
}

async function mergeContacts(
  loserId: number,
  winnerId: number,
  workspaceId: string,
) {
  const [winner, loser] = await Promise.all([
    getWorkspaceContact(winnerId, workspaceId),
    getWorkspaceContact(loserId, workspaceId),
  ]);

  if (!winner || !loser) {
    throw new Error("Contacts must both exist in the requested workspace");
  }

  const { data, error } = await supabaseAdmin.rpc("merge_contacts", {
    target_workspace_id: workspaceId,
    loser_id: loser.id,
    winner_id: winner.id,
  });

  if (error || !data) {
    throw error ?? new Error("Merge failed");
  }

  return { success: true, winnerId: data };
}

Deno.serve(async (req: Request) =>
  OptionsMiddleware(req, async (req) =>
    AuthMiddleware(req, async (req) =>
      UserMiddleware(req, async (req, user) => {
        if (req.method !== "POST") {
          return createErrorResponse(405, "Method Not Allowed");
        }

        try {
          const { loserId, winnerId, workspace_id } = await req.json();

          if (!loserId || !winnerId || !workspace_id) {
            return createErrorResponse(
              400,
              "Missing loserId, winnerId, or workspace_id",
            );
          }

          const currentUserSale = await getUserSale(user, workspace_id);
          if (!currentUserSale) {
            return createErrorResponse(401, "Unauthorized");
          }

          const result = await mergeContacts(
            Number(loserId),
            Number(winnerId),
            workspace_id,
          );

          return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (error) {
          console.error("Merge failed:", error);
          return createErrorResponse(
            500,
            `Failed to merge contacts: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          );
        }
      }),
    ),
  ),
);
