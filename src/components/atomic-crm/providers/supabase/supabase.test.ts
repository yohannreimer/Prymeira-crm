import { describe, expect, it, vi } from "vitest";
import {
  getSupabaseAccessToken,
  setSupabaseAccessTokenProvider,
} from "./supabase";

describe("Supabase access token provider", () => {
  it("caches the Clerk token for concurrent Supabase requests", async () => {
    const provider = vi.fn().mockResolvedValue("clerk-token");
    setSupabaseAccessTokenProvider(provider);

    await expect(getSupabaseAccessToken()).resolves.toBe("clerk-token");
    await expect(getSupabaseAccessToken()).resolves.toBe("clerk-token");

    expect(provider).toHaveBeenCalledOnce();
    setSupabaseAccessTokenProvider(null);
  });

  it("clears the cached token when the provider changes", async () => {
    const firstProvider = vi.fn().mockResolvedValue("first-token");
    const secondProvider = vi.fn().mockResolvedValue("second-token");

    setSupabaseAccessTokenProvider(firstProvider);
    await expect(getSupabaseAccessToken()).resolves.toBe("first-token");

    setSupabaseAccessTokenProvider(secondProvider);
    await expect(getSupabaseAccessToken()).resolves.toBe("second-token");

    expect(firstProvider).toHaveBeenCalledOnce();
    expect(secondProvider).toHaveBeenCalledOnce();
    setSupabaseAccessTokenProvider(null);
  });
});
