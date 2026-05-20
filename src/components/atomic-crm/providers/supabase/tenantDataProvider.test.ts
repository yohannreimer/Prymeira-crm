import { describe, expect, it, vi } from "vitest";
import { withTenantDataProvider } from "./tenantDataProvider";

describe("withTenantDataProvider", () => {
  it("injects workspace_id into tenant resource creates", async () => {
    const base = {
      create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    } as any;
    const provider = withTenantDataProvider(base, () => "workspace-1");

    await provider.create("contacts", { data: { first_name: "Ana" } });

    expect(base.create).toHaveBeenCalledWith("contacts", {
      data: { first_name: "Ana", workspace_id: "workspace-1" },
    });
  });

  it("does not inject workspace_id into non-tenant resource creates", async () => {
    const base = {
      create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    } as any;
    const provider = withTenantDataProvider(base, () => "workspace-1");

    await provider.create("activity_log", { data: { message: "Ana" } });

    expect(base.create).toHaveBeenCalledWith("activity_log", {
      data: { message: "Ana" },
    });
  });

  it("throws when creating tenant data without workspace context", async () => {
    const base = { create: vi.fn() } as any;
    const provider = withTenantDataProvider(base, () => null);

    await expect(
      provider.create("contacts", { data: { first_name: "Ana" } }),
    ).rejects.toThrow("Missing Prymeira workspace context");
  });
});
