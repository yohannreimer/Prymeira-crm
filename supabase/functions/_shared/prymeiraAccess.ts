import type { AuthenticatedUser } from "./authentication.ts";

type PrymeiraProductAccess = {
  product_key: string;
  allowed: boolean;
  workspace_id?: string | null;
  workspace_role?: string | null;
  product_role?: string | null;
};

type PrymeiraProductsResponse = {
  customer?: {
    email?: string | null;
    name?: string | null;
  } | null;
  products?: PrymeiraProductAccess[];
};

export type TrustedPrymeiraAccess = {
  email: string;
  name: string | null;
  workspace_id: string;
  workspace_role: string;
  product_role: string;
};

const getAccountApiUrl = () => {
  const url =
    Deno.env.get("PRYMEIRA_ACCOUNT_API_URL") ??
    Deno.env.get("VITE_PRYMEIRA_ACCOUNT_API_URL");
  if (!url) {
    throw new Error("Missing PRYMEIRA_ACCOUNT_API_URL");
  }
  return url.replace(/\/$/, "");
};

const getProductKey = () =>
  Deno.env.get("PRYMEIRA_PRODUCT_KEY") ??
  Deno.env.get("VITE_PRYMEIRA_PRODUCT_KEY") ??
  "operis";

export async function getTrustedPrymeiraAccess(
  token: string,
  user: AuthenticatedUser,
): Promise<TrustedPrymeiraAccess> {
  const response = await fetch(`${getAccountApiUrl()}/me/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error("Prymeira access verification failed");
  }

  const body = (await response.json()) as PrymeiraProductsResponse;
  const product = body.products?.find(
    (item) => item.product_key === getProductKey(),
  );

  if (!product?.allowed || !product.workspace_id) {
    throw new Error("Prymeira product access denied");
  }

  const email = body.customer?.email ?? user.email;
  if (!email) {
    throw new Error("Prymeira customer email missing");
  }

  return {
    email,
    name: body.customer?.name ?? null,
    workspace_id: product.workspace_id,
    workspace_role: product.workspace_role ?? "member",
    product_role: product.product_role ?? "member",
  };
}
