import { describe, expect, it, vi } from "vitest";
import { createClerkAuthProvider } from "./clerkAuthProvider";
import { getAuthProvider } from "./authProvider";

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
    product_key: "crm",
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

  it("rejects identity when the current sales row is missing", async () => {
    const dataProvider = {
      getList: vi.fn().mockResolvedValue({
        data: [],
        total: 0,
      }),
    } as any;
    const authProvider = createClerkAuthProvider({
      getAccess: () => access,
      signOut: vi.fn(),
      dataProvider,
    });

    await expect(authProvider.getIdentity?.()).rejects.toThrow(
      "Current CRM user was not found",
    );
  });

  it("returns product role permissions and falls back to member", async () => {
    const authProvider = createClerkAuthProvider({
      getAccess: () => access,
      signOut: vi.fn(),
      dataProvider: {} as any,
    });
    const missingAccessAuthProvider = createClerkAuthProvider({
      getAccess: () => null,
      signOut: vi.fn(),
      dataProvider: {} as any,
    });

    await expect(authProvider.getPermissions?.({})).resolves.toBe("admin");
    await expect(missingAccessAuthProvider.getPermissions?.({})).resolves.toBe(
      "member",
    );
  });

  it("uses product admin role for access checks", async () => {
    const authProvider = createClerkAuthProvider({
      getAccess: () => ({
        ...access,
        workspace: { ...access.workspace, role: "member" },
        decision: { ...access.decision, product_role: "admin" },
      }),
      signOut: vi.fn(),
      dataProvider: {} as any,
    });

    await expect(
      authProvider.canAccess?.({ action: "list", resource: "sales" }),
    ).resolves.toBe(true);
  });

  it("uses workspace owner role for access checks", async () => {
    const authProvider = createClerkAuthProvider({
      getAccess: () => ({
        ...access,
        workspace: { ...access.workspace, role: "owner" },
        decision: { ...access.decision, product_role: "member" },
      }),
      signOut: vi.fn(),
      dataProvider: {} as any,
    });

    await expect(
      authProvider.canAccess?.({ action: "list", resource: "sales" }),
    ).resolves.toBe(true);
  });

  it("uses non-admin role for access checks", async () => {
    const authProvider = createClerkAuthProvider({
      getAccess: () => ({
        ...access,
        workspace: { ...access.workspace, role: "member" },
        decision: { ...access.decision, product_role: "member" },
      }),
      signOut: vi.fn(),
      dataProvider: {} as any,
    });

    await expect(
      authProvider.canAccess?.({ action: "list", resource: "sales" }),
    ).resolves.toBe(false);
    await expect(
      authProvider.canAccess?.({ action: "list", resource: "contacts" }),
    ).resolves.toBe(true);
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

describe("legacy Supabase auth provider stub", () => {
  it("fails closed when legacy checkAuth is used", async () => {
    const authProvider = getAuthProvider();

    await expect(authProvider.checkAuth?.({})).rejects.toThrow(
      "Supabase Auth login has been replaced by Prymeira Account",
    );
  });
});
