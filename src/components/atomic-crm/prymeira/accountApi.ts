import type {
  PrymeiraAccessDecision,
  PrymeiraSyncCustomerResponse,
} from "./types";

const readApiError = async (response: Response, fallback: string) => {
  const body = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  return body?.error?.message ?? fallback;
};

export const getPrymeiraAccountApiUrl = () => {
  const url = import.meta.env.VITE_PRYMEIRA_ACCOUNT_API_URL;
  if (!url) {
    throw new Error("Missing VITE_PRYMEIRA_ACCOUNT_API_URL");
  }
  return url.replace(/\/$/, "");
};

export const getPrymeiraProductKey = () =>
  import.meta.env.VITE_PRYMEIRA_PRODUCT_KEY || "crm";

export const getPrymeiraHubUrl = () =>
  (import.meta.env.VITE_PRYMEIRA_HUB_URL || "http://localhost:5174").replace(
    /\/$/,
    "",
  );

export async function syncPrymeiraCustomer(
  token: string,
  payload: { clerk_user_id: string; email: string; name?: string },
) {
  const response = await fetch(`${getPrymeiraAccountApiUrl()}/customers/sync`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Nao foi possivel sincronizar sua conta."),
    );
  }

  return response.json() as Promise<PrymeiraSyncCustomerResponse>;
}

export async function checkPrymeiraProductAccess(
  token: string,
  productKey = getPrymeiraProductKey(),
) {
  const response = await fetch(
    `${getPrymeiraAccountApiUrl()}/access-check?product_key=${encodeURIComponent(
      productKey,
    )}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Nao foi possivel verificar seu acesso."),
    );
  }

  return response.json() as Promise<PrymeiraAccessDecision>;
}

export function buildPrymeiraAccessDeniedUrl(
  decision: Pick<PrymeiraAccessDecision, "product_key" | "reason">,
  returnUrl = window.location.href,
) {
  const url = new URL("/access-denied", getPrymeiraHubUrl());
  url.searchParams.set("product_key", decision.product_key);
  url.searchParams.set("reason", decision.reason);
  url.searchParams.set("return_url", returnUrl);
  return url.toString();
}
