export type PrymeiraAccessReason =
  | "no_customer"
  | "no_workspace"
  | "no_workspace_membership"
  | "workspace_suspended"
  | "no_product"
  | "inactive_product"
  | "no_entitlement"
  | "no_product_seat"
  | "seats_limit_reached"
  | "expired"
  | "blocked"
  | "cancelled"
  | "trial_expired"
  | "active_entitlement"
  | "internal_access";

export type PrymeiraWorkspace = {
  id: string;
  name: string;
  type: string;
  role: string;
};

export type PrymeiraAccessDecision = {
  allowed: boolean;
  workspace_id?: string;
  workspace_role?: string;
  product_key: string;
  product_role?: string;
  status: string;
  plan?: string;
  source?: string;
  seats_limit?: number;
  limits?: Record<string, unknown>;
  reason: PrymeiraAccessReason;
  upgrade_url?: string;
};

export type PrymeiraSyncCustomerResponse = {
  customer_id: string;
  clerk_user_id: string;
  email: string;
  workspace: PrymeiraWorkspace;
};

export type PrymeiraAccessContextValue = {
  token: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  workspace: PrymeiraWorkspace;
  decision: PrymeiraAccessDecision & {
    allowed: true;
    workspace_id: string;
    workspace_role: string;
    product_role: string;
  };
};
