import { describe, expect, it, vi } from "vitest";
import { createClerkAuthProvider } from "./clerkAuthProvider";

const access = {
  token: "token",
  clerkUserId: "user_123",
  email: "ana@example.com",
  name: "Ana Silva",
  workspace: {
    id: "c6fcda6d-c60b-4cf7-8548-9230fed8d8b4",
    name: "Prymeira",
    type: "business",
    role: "owner",
  },
  decision: {
    allowed: true,
    workspace_id: "c6fcda6d-c60b-4cf7-8548-9230fed8d8b4",
    workspace_role: "owner",
    product_key: "operis",
    product_role: "admin",
    status: "active",
    reason: "active_entitlement",
  },
} as const;

describe("createClerkAuthProvider", () => {
  it("returns identity from Prymeira access context and sales row", async () => {
    const dataProvider = {
      getList: vi.fn().mockResolvedValue({
        data: [{ id: 7, first_name: "Ana", last_name: "Silva", avatar: null }],
        total: 1,
      }),
    } as any;
    const authProvider = createClerkAuthProvider({
      getAccess: () => access,
      signOut: vi.fn(),
      dataProvider,
    });

    await expect(authProvider.getIdentity?.()).resolves.toEqual({
      id: 7,
      fullName: "Ana Silva",
      avatar: undefined,
    });
    expect(dataProvider.getList).toHaveBeenCalledWith("sales", {
      filter: {
        workspace_id: access.workspace.id,
        clerk_user_id: access.clerkUserId,
      },
      pagination: { page: 1, perPage: 1 },
      sort: { field: "id", order: "ASC" },
    });
  });

  it("denies auth when access context is missing", async () => {
    const authProvider = createClerkAuthProvider({
      getAccess: () => null,
      signOut: vi.fn(),
      dataProvider: {} as any,
    });

    await expect(authProvider.checkAuth?.({})).rejects.toEqual({
      redirectTo: "/",
      message: false,
    });
  });

  it("signs out through Clerk on logout", async () => {
    const signOut = vi.fn().mockResolvedValue(undefined);
    const authProvider = createClerkAuthProvider({
      getAccess: () => access,
      signOut,
      dataProvider: {} as any,
    });

    await expect(authProvider.logout?.({})).resolves.toBe("/");
    expect(signOut).toHaveBeenCalledOnce();
  });
});
