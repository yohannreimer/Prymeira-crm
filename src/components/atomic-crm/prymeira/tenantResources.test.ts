import { describe, expect, it } from "vitest";
import {
  addWorkspaceToCreateParams,
  isTenantResource,
  tenantResources,
} from "./tenantResources";

describe("tenantResources", () => {
  it("marks CRM business resources as tenant scoped", () => {
    expect(tenantResources).toContain("contacts");
    expect(tenantResources).toContain("companies");
    expect(tenantResources).toContain("deals");
    expect(tenantResources).toContain("tasks");
    expect(isTenantResource("contacts_summary")).toBe(false);
  });

  it("adds workspace_id to tenant create params without changing non-tenant resources", () => {
    expect(
      addWorkspaceToCreateParams("contacts", {
        data: { first_name: "Ana" },
      } as any, "workspace-1"),
    ).toEqual({ data: { first_name: "Ana", workspace_id: "workspace-1" } });

    expect(
      addWorkspaceToCreateParams("activity_log", {
        data: { message: "ignored" },
      } as any, "workspace-1"),
    ).toEqual({ data: { message: "ignored" } });
  });

  it("does not overwrite an explicit workspace_id", () => {
    expect(
      addWorkspaceToCreateParams("contacts", {
        data: { workspace_id: "workspace-2", first_name: "Ana" },
      } as any, "workspace-1"),
    ).toEqual({ data: { workspace_id: "workspace-2", first_name: "Ana" } });
  });
});
