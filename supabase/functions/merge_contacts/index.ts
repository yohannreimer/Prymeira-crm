import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { supabaseAdmin } from "../_shared/supabaseAdmin.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";
import { createErrorResponse } from "../_shared/utils.ts";
import { AuthMiddleware, UserMiddleware } from "../_shared/authentication.ts";
import { getUserSale } from "../_shared/getUserSale.ts";

type Contact = {
  id: number;
  workspace_id: string;
  avatar?: any;
  gender?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  title?: string | null;
  company_id?: number | null;
  email_jsonb?: any[] | null;
  phone_jsonb?: any[] | null;
  linkedin_url?: string | null;
  background?: string | null;
  has_newsletter?: boolean | null;
  first_seen?: string | null;
  last_seen?: string | null;
  sales_id?: number | null;
  tags?: number[] | null;
};

function mergeArraysUnique<T>(arr1: T[], arr2: T[]): T[] {
  return [...new Set([...arr1, ...arr2])];
}

function mergeObjectArraysUnique<T>(
  arr1: T[],
  arr2: T[],
  getKey: (item: T) => string,
): T[] {
  const map = new Map<string, T>();

  arr1.forEach((item) => {
    const key = getKey(item);
    if (key) map.set(key, item);
  });

  arr2.forEach((item) => {
    const key = getKey(item);
    if (key && !map.has(key)) {
      map.set(key, item);
    }
  });

  return Array.from(map.values());
}

function mergeContactData(winner: Contact, loser: Contact) {
  const mergedEmails = mergeObjectArraysUnique(
    winner.email_jsonb || [],
    loser.email_jsonb || [],
    (email: any) => email.email,
  );

  const mergedPhones = mergeObjectArraysUnique(
    winner.phone_jsonb || [],
    loser.phone_jsonb || [],
    (phone: any) => phone.number,
  );

  const selectedAvatar =
    winner.avatar && winner.avatar.src ? winner.avatar : loser.avatar;

  return {
    avatar: selectedAvatar ?? null,
    gender: winner.gender ?? loser.gender,
    first_name: winner.first_name ?? loser.first_name,
    last_name: winner.last_name ?? loser.last_name,
    title: winner.title ?? loser.title,
    company_id: winner.company_id ?? loser.company_id,
    email_jsonb: mergedEmails,
    phone_jsonb: mergedPhones,
    linkedin_url: winner.linkedin_url || loser.linkedin_url,
    background: winner.background ?? loser.background,
    has_newsletter: winner.has_newsletter ?? loser.has_newsletter,
    first_seen: winner.first_seen ?? loser.first_seen,
    last_seen:
      winner.last_seen && loser.last_seen
        ? winner.last_seen > loser.last_seen
          ? winner.last_seen
          : loser.last_seen
        : (winner.last_seen ?? loser.last_seen),
    sales_id: winner.sales_id ?? loser.sales_id,
    tags: mergeArraysUnique(winner.tags || [], loser.tags || []),
  };
}

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

  await supabaseAdmin
    .from("tasks")
    .update({ contact_id: winnerId })
    .eq("workspace_id", workspaceId)
    .eq("contact_id", loserId);

  await supabaseAdmin
    .from("contact_notes")
    .update({ contact_id: winnerId })
    .eq("workspace_id", workspaceId)
    .eq("contact_id", loserId);

  const { data: deals, error: dealsError } = await supabaseAdmin
    .from("deals")
    .select("id, contact_ids")
    .eq("workspace_id", workspaceId)
    .contains("contact_ids", [loserId]);

  if (dealsError) {
    throw dealsError;
  }

  for (const deal of deals ?? []) {
    const contactIds = Array.isArray(deal.contact_ids) ? deal.contact_ids : [];
    const newContactIds = [
      ...new Set(contactIds.filter((id) => id !== loserId).concat(winnerId)),
    ];

    await supabaseAdmin
      .from("deals")
      .update({ contact_ids: newContactIds })
      .eq("workspace_id", workspaceId)
      .eq("id", deal.id);
  }

  const { error: updateWinnerError } = await supabaseAdmin
    .from("contacts")
    .update(mergeContactData(winner, loser))
    .eq("workspace_id", workspaceId)
    .eq("id", winnerId);

  if (updateWinnerError) {
    throw updateWinnerError;
  }

  const { error: deleteLoserError } = await supabaseAdmin
    .from("contacts")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", loserId);

  if (deleteLoserError) {
    throw deleteLoserError;
  }

  return { success: true, winnerId };
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
