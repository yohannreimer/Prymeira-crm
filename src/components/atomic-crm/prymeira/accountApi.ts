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

export type PrymeiraTeamInviteRole = "admin" | "member";

export async function invitePrymeiraProductMember(
  token: string,
  payload: {
    email: string;
    name?: string;
    role: PrymeiraTeamInviteRole;
    product_key?: string;
  },
) {
  const response = await fetch(`${getPrymeiraAccountApiUrl()}/team/members/invite`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...payload,
      product_key: payload.product_key ?? getPrymeiraProductKey(),
    }),
  });

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Nao foi possivel convidar este membro."),
    );
  }

  return response.json() as Promise<
    | { status: "pending"; invitation: { id: string; email: string } }
    | { status: "active"; member: { customerId?: string; customer_id?: string } }
  >;
}

export async function updatePrymeiraProductMember(
  token: string,
  customerId: string,
  payload: {
    role?: PrymeiraTeamInviteRole;
    status?: "active" | "disabled";
    product_key?: string;
  },
) {
  const response = await fetch(
    `${getPrymeiraAccountApiUrl()}/team/members/${encodeURIComponent(
      customerId,
    )}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        product_key: payload.product_key ?? getPrymeiraProductKey(),
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      await readApiError(response, "Nao foi possivel atualizar este membro."),
    );
  }

  return response.json() as Promise<{ member: unknown }>;
}

export function buildPrymeiraAccessDeniedUrl(
  decision: Pick<PrymeiraAccessDecision, "product_key" | "reason" | "status">,
) {
  const params = new URLSearchParams({
    from_product: decision.product_key,
    reason: decision.reason,
    status: decision.status,
  });
  return `https://account.prymeira.com/acesso?${params.toString()}`;
}
