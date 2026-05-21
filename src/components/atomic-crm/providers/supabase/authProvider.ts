import type { AuthProvider } from "ra-core";

const getReplacementError = () =>
  new Error("Supabase Auth login has been replaced by Prymeira Account");

export async function getIsInitialized() {
  return true;
}

export const getAuthProvider = (): AuthProvider => ({
  login: async () => {
    throw getReplacementError();
  },
  logout: async () => "/",
  checkAuth: async () => {
    throw getReplacementError();
  },
  checkError: async () => undefined,
  getPermissions: async () => undefined,
});
