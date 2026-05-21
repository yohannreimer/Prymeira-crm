import { beforeEach, describe, expect, it, vi } from "vitest";

const fetchJson = vi.fn().mockResolvedValue({ json: {} });
const getSupabaseAccessToken = vi.fn();

vi.mock("ra-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ra-core")>();
  return {
    ...actual,
    fetchUtils: {
      ...actual.fetchUtils,
      fetchJson,
    },
  };
});

vi.mock("./supabase", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./supabase")>();
  return {
    ...actual,
    getSupabaseAccessToken,
  };
});

describe("createPrymeiraSupabaseHttpClient", () => {
  beforeEach(() => {
    fetchJson.mockClear();
    getSupabaseAccessToken.mockReset();
  });

  it("sends the Clerk JWT as the PostgREST bearer token", async () => {
    getSupabaseAccessToken.mockResolvedValue("clerk-jwt");
    const { createPrymeiraSupabaseHttpClient } = await import("./dataProvider");

    await createPrymeiraSupabaseHttpClient("sb_publishable_test")(
      "https://example.supabase.co/rest/v1/contacts",
    );

    const [, options] = fetchJson.mock.calls[0]!;
    expect(options.headers.get("apikey")).toBe("sb_publishable_test");
    expect(options.headers.get("Authorization")).toBe("Bearer clerk-jwt");
    expect(options.user).toEqual({
      authenticated: true,
      token: "Bearer clerk-jwt",
    });
  });

  it("does not send the publishable key as a bearer token", async () => {
    getSupabaseAccessToken.mockResolvedValue(null);
    const { createPrymeiraSupabaseHttpClient } = await import("./dataProvider");

    await createPrymeiraSupabaseHttpClient("sb_publishable_test")(
      "https://example.supabase.co/rest/v1/contacts",
    );

    const [, options] = fetchJson.mock.calls[0]!;
    expect(options.headers.get("apikey")).toBe("sb_publishable_test");
    expect(options.headers.get("Authorization")).toBeNull();
    expect(options.user).toBeUndefined();
  });
});
