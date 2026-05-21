import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;
let accessTokenProvider: (() => Promise<string | null>) | null = null;
let cachedAccessToken: { value: string | null; expiresAt: number } | null =
  null;
let accessTokenPromise: Promise<string | null> | null = null;

const ACCESS_TOKEN_CACHE_MS = 30_000;

export const setSupabaseAccessTokenProvider = (
  provider: (() => Promise<string | null>) | null,
) => {
  accessTokenProvider = provider;
  cachedAccessToken = null;
  accessTokenPromise = null;
  supabaseClient = null;
};

export const getSupabaseAccessToken = async () => {
  if (!accessTokenProvider) return null;

  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now) {
    return cachedAccessToken.value;
  }

  accessTokenPromise ??= accessTokenProvider()
    .then((value) => {
      cachedAccessToken = {
        value,
        expiresAt: Date.now() + ACCESS_TOKEN_CACHE_MS,
      };
      return value;
    })
    .finally(() => {
      accessTokenPromise = null;
    });

  return accessTokenPromise;
};

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SB_PUBLISHABLE_KEY,
      {
        accessToken: getSupabaseAccessToken,
      },
    );
  }
  return supabaseClient;
};
