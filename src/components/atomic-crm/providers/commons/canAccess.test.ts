import { describe, expect, it } from "vitest";

import { canAccess } from "./canAccess";

describe("canAccess", () => {
  it("blocks proposal template resources for non-admin users", () => {
    expect(
      canAccess("sales", { resource: "proposal_templates", action: "list" }),
    ).toBe(false);
    expect(
      canAccess("sales", {
        resource: "proposal_template_items",
        action: "create",
      }),
    ).toBe(false);
  });

  it("allows admins to access proposal template resources", () => {
    expect(
      canAccess("admin", { resource: "proposal_templates", action: "list" }),
    ).toBe(true);
    expect(
      canAccess("admin", {
        resource: "proposal_template_items",
        action: "create",
      }),
    ).toBe(true);
  });
});
