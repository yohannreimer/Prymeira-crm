import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPrymeiraSupabaseHttpClient } from "./dataProvider";
import { setSupabaseAccessTokenProvider } from "./supabase";

const mocks = vi.hoisted(() => ({
  fetchJson: vi.fn().mockResolvedValue({ json: {} }),
}));

vi.mock("ra-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ra-core")>();
  return {
    ...actual,
    fetchUtils: {
      ...actual.fetchUtils,
      fetchJson: mocks.fetchJson,
    },
  };
});

describe("createPrymeiraSupabaseHttpClient", () => {
  beforeEach(() => {
    mocks.fetchJson.mockClear();
    setSupabaseAccessTokenProvider(null);
  });

  it("sends the Clerk JWT as the PostgREST bearer token", async () => {
    setSupabaseAccessTokenProvider(async () => "clerk-jwt");

    await createPrymeiraSupabaseHttpClient("sb_publishable_test")(
      "https://example.supabase.co/rest/v1/contacts",
    );

    const [, options] = mocks.fetchJson.mock.calls[0]!;
    expect(options.headers.get("apikey")).toBe("sb_publishable_test");
    expect(options.headers.get("Authorization")).toBe("Bearer clerk-jwt");
    expect(options.user).toEqual({
      authenticated: true,
      token: "Bearer clerk-jwt",
    });
  });

  it("does not send the publishable key as a bearer token", async () => {
    setSupabaseAccessTokenProvider(async () => null);

    await createPrymeiraSupabaseHttpClient("sb_publishable_test")(
      "https://example.supabase.co/rest/v1/contacts",
    );

    const [, options] = mocks.fetchJson.mock.calls[0]!;
    expect(options.headers.get("apikey")).toBe("sb_publishable_test");
    expect(options.headers.get("Authorization")).toBeNull();
    expect(options.user).toBeUndefined();
  });
});
