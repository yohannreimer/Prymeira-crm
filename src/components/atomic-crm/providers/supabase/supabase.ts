import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;
let accessTokenProvider: (() => Promise<string | null>) | null = null;

export const setSupabaseAccessTokenProvider = (
  provider: (() => Promise<string | null>) | null,
) => {
  accessTokenProvider = provider;
  supabaseClient = null;
};

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SB_PUBLISHABLE_KEY,
      {
        accessToken: async () => accessTokenProvider?.() ?? null,
      },
    );
  }
  return supabaseClient;
};
