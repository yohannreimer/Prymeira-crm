import type { AuthenticatedUser } from "./authentication.ts";
import { supabaseAdmin } from "./supabaseAdmin.ts";

/**
 * Get the sale associated to the provided user.
 */
export const getUserSale = async (
  user: AuthenticatedUser | undefined,
  workspaceId: string,
) => {
  if (!user?.id || !workspaceId) return null;

  return (
    await supabaseAdmin
      .from("sales")
      .select("*")
      .eq("clerk_user_id", user.id)
      .eq("workspace_id", workspaceId)
      .eq("disabled", false)
      .maybeSingle()
  )?.data;
};
