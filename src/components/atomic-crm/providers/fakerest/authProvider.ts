import type { AuthProvider } from "ra-core";

import type { Sale } from "../../types";
import { canAccess } from "../commons/canAccess";
import { dataProvider } from "./dataProvider";
import { DEFAULT_WORKSPACE_ID } from "./dataGenerator";

export const DEFAULT_USER = {
  id: 0,
  first_name: "Marina",
  last_name: "Costa",
  email: "marina@prymeira.digital",
  password: "demo",
  administrator: true,
  clerk_user_id: "user_demo",
  workspace_id: DEFAULT_WORKSPACE_ID,
  workspace_role: "owner",
  product_role: "admin",
} as const;

export const USER_STORAGE_KEY = "user";

localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ ...DEFAULT_USER }));

async function getUser(email: string) {
  const sales = await dataProvider.getList("sales", {
    pagination: { page: 1, perPage: 200 },
    sort: { field: "name", order: "ASC" },
  });

  if (!sales.data.length) {
    return { ...DEFAULT_USER };
  }

  const user = sales.data.find((sale) => sale.email === email);
  if (!user || user.disabled) {
    return { ...DEFAULT_USER };
  }
  return user;
}

export const authProvider: AuthProvider = {
  login: async ({ email }) => {
    const user = await getUser(email);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    return Promise.resolve();
  },
  resetPassword: async () => {
    // FakeRest doesn't send real emails. Keep this async to mimic network latency.
    await new Promise((resolve) => setTimeout(resolve, 250));
    return;
  },
  setPassword: async () => {
    // FakeRest doesn't persist auth credentials. This is only for local UX testing.
    await new Promise((resolve) => setTimeout(resolve, 250));
    return;
  },
  logout: () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    return Promise.resolve();
  },
  checkError: () => Promise.resolve(),
  checkAuth: () =>
    localStorage.getItem(USER_STORAGE_KEY)
      ? Promise.resolve()
      : Promise.reject(),
  canAccess: async ({ signal: _signal, ...params }) => {
    const userItem = localStorage.getItem(USER_STORAGE_KEY);
    const localUser = userItem ? (JSON.parse(userItem) as Sale) : null;
    if (!localUser) return false;

    const role = localUser.administrator ? "admin" : "user";
    return canAccess(role, params);
  },
  getIdentity: () => {
    const userItem = localStorage.getItem(USER_STORAGE_KEY);
    const user = userItem ? (JSON.parse(userItem) as Sale) : null;
    return Promise.resolve({
      id: user?.id ?? 0,
      fullName: user ? `${user.first_name} ${user.last_name}` : "Marina Costa",
      avatar: user?.avatar?.src,
    });
  },
  async getAuthorizationDetails() {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      data: {
        authorization_id: "demo-prymeira",
        user: {
          id: "0",
          email: "marina@prymeira.digital",
        },
        client: {
          name: "Prymeira Demo",
        },
        scope: "openid profile email phone",
        redirect_uri: "https://prymeira.app/auth_callback",
      },
      error: null,
    };
  },
  async approveAuthorization() {
    return {
      data: {
        redirect_url: "https://prymeira.app/auth_callback",
      },
      error: null,
    };
  },
  async denyAuthorization() {
    return {
      data: {
        redirect_url: "https://prymeira.app/denied",
      },
      error: null,
    };
  },
};
