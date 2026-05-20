import type { AuthProvider } from "ra-core";

export async function getIsInitialized() {
  return true;
}

export const getAuthProvider = (): AuthProvider => ({
  login: async () => {
    throw new Error("Supabase Auth login has been replaced by Prymeira Account");
  },
  logout: async () => "/",
  checkAuth: async () => undefined,
  checkError: async () => undefined,
  getPermissions: async () => undefined,
});
