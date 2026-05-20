import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTrustedPrymeiraAccess } from "./prymeiraAccess";

const env = new Map<string, string>();

describe("getTrustedPrymeiraAccess", () => {
  beforeEach(() => {
    env.clear();
    env.set("PRYMEIRA_ACCOUNT_API_URL", "https://account.test");
    env.set("PRYMEIRA_PRODUCT_KEY", "operis");
    vi.stubGlobal("Deno", {
      env: {
        get: (key: string) => env.get(key),
      },
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  it("derives workspace, email, and roles from Prymeira Account", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          customer: { email: "ana@example.com", name: "Ana" },
          products: [
            {
              product_key: "operis",
              allowed: true,
              workspace_id: "5b95dfc7-6b63-4f19-8a20-17f83c748f38",
              workspace_role: "owner",
              product_role: "admin",
            },
          ],
        }),
      ),
    );

    await expect(
      getTrustedPrymeiraAccess("token", { id: "user_123" }),
    ).resolves.toEqual({
      email: "ana@example.com",
      name: "Ana",
      workspace_id: "5b95dfc7-6b63-4f19-8a20-17f83c748f38",
      workspace_role: "owner",
      product_role: "admin",
    });

    expect(fetch).toHaveBeenCalledWith("https://account.test/me/products", {
      headers: { Authorization: "Bearer token" },
    });
  });

  it("rejects when the product is not allowed", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          customer: { email: "ana@example.com" },
          products: [{ product_key: "operis", allowed: false }],
        }),
      ),
    );

    await expect(
      getTrustedPrymeiraAccess("token", { id: "user_123" }),
    ).rejects.toThrow("Prymeira product access denied");
  });
});
