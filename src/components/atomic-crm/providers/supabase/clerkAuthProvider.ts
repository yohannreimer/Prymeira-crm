import type { AuthProvider, DataProvider } from "ra-core";
import type { PrymeiraAccessContextValue } from "../../prymeira/types";
import { canAccess } from "../commons/canAccess";

type CreateClerkAuthProviderOptions = {
  getAccess: () => PrymeiraAccessContextValue | null;
  signOut: () => Promise<void>;
  dataProvider: Pick<DataProvider, "getList">;
};

export function createClerkAuthProvider({
  getAccess,
  signOut,
  dataProvider,
}: CreateClerkAuthProviderOptions): AuthProvider {
  return {
    async login() {
      return Promise.resolve();
    },
    async logout() {
      await signOut();
      return "/";
    },
    async checkAuth() {
      if (!getAccess()) {
        throw { redirectTo: "/", message: false };
      }
    },
    async checkError() {
      return Promise.resolve();
    },
    async getPermissions() {
      return getAccess()?.decision.product_role ?? "member";
    },
    async getIdentity() {
      const access = getAccess();
      if (!access) throw new Error("Missing Prymeira access context");

      const { data } = await dataProvider.getList("sales", {
        filter: {
          workspace_id: access.workspace.id,
          clerk_user_id: access.clerkUserId,
        },
        pagination: { page: 1, perPage: 1 },
        sort: { field: "id", order: "ASC" },
      });
      const sale = data[0] as any;
      if (!sale) throw new Error("Current CRM user was not found");

      return {
        id: sale.id,
        fullName:
          [sale.first_name, sale.last_name].filter(Boolean).join(" ") ||
          access.name ||
          access.email,
        avatar: sale.avatar?.src,
      };
    },
    async canAccess(params) {
      const access = getAccess();
      if (!access) return false;
      const role =
        access.decision.product_role === "admin" ||
        access.workspace.role === "owner"
          ? "admin"
          : "user";
      return canAccess(role, params);
    },
  };
}
