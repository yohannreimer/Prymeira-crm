import { describe, expect, it } from "vitest";
import {
  buildAttachmentStoragePath,
  buildSyncCurrentSaleRequestBody,
} from "./dataProvider";

describe("Supabase workspace data provider helpers", () => {
  it("builds current sale sync requests for the users edge function", () => {
    expect(
      buildSyncCurrentSaleRequestBody({
        clerk_user_id: "user_123",
        email: "ana@example.com",
        name: "Ana Maria",
        workspace_id: "5b95dfc7-6b63-4f19-8a20-17f83c748f38",
        workspace_role: "owner",
        product_role: "member",
      }),
    ).toEqual({
      action: "sync_current",
      clerk_user_id: "user_123",
      email: "ana@example.com",
      first_name: "Ana",
      last_name: "Maria",
      workspace_id: "5b95dfc7-6b63-4f19-8a20-17f83c748f38",
      workspace_role: "owner",
      product_role: "member",
    });
  });

  it("prefixes uploaded attachment paths with the workspace id", () => {
    expect(
      buildAttachmentStoragePath({
        workspaceId: "5b95dfc7-6b63-4f19-8a20-17f83c748f38",
        fileName: "contract.final.pdf",
        randomValue: 0.1234,
      }),
    ).toBe("5b95dfc7-6b63-4f19-8a20-17f83c748f38/0.1234.pdf");
  });
});
