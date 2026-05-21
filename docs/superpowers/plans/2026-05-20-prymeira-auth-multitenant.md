# Prymeira Auth Multitenant CRM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Supabase Auth with Prymeira Account/Clerk and make all CRM business data tenant-isolated by Prymeira workspace.

**Architecture:** Clerk supplies the browser identity token. Supabase trusts Clerk through Third-Party Auth. Prymeira Account remains the source of truth for workspace/product access, while CRM `sales` rows cache allowed workspace membership for RLS and UI authorization.

**Tech Stack:** React 19, TypeScript, Vite, ra-core, ra-supabase-core data provider, Supabase/PostgREST/RLS, Supabase Edge Functions, Clerk React SDK.

---

## Scope Check

This plan implements one cohesive product migration: Prymeira Account identity plus workspace tenant isolation for the existing CRM. It touches several layers, but they are not independently shippable features because RLS, auth provider, and tenant data writes must agree on the same identity model.

## File Structure

Create:

- `src/components/atomic-crm/prymeira/types.ts` - shared Prymeira Account response and context types used by the CRM.
- `src/components/atomic-crm/prymeira/accountApi.ts` - small typed HTTP client for Prymeira Account endpoints used by the CRM.
- `src/components/atomic-crm/prymeira/PrymeiraAccessContext.tsx` - React context for allowed workspace/product access.
- `src/components/atomic-crm/prymeira/PrymeiraAccessGate.tsx` - Clerk-aware gate that syncs account, verifies product access, syncs local `sales`, and renders CRM only when allowed.
- `src/components/atomic-crm/prymeira/PrymeiraAccessDenied.tsx` - blocking denied/error screen.
- `src/components/atomic-crm/prymeira/tenantResources.ts` - resource list and helper for `workspace_id` injection.
- `src/components/atomic-crm/prymeira/tenantResources.test.ts` - unit tests for tenant resource behavior.
- `src/components/atomic-crm/providers/supabase/clerkAuthProvider.ts` - ra-core auth provider backed by Clerk/Prymeira context.
- `src/components/atomic-crm/providers/supabase/clerkAuthProvider.test.ts` - auth provider unit tests.
- `src/components/atomic-crm/providers/supabase/tenantDataProvider.ts` - wrapper that injects `workspace_id` into tenant-scoped creates.
- `src/components/atomic-crm/providers/supabase/tenantDataProvider.test.ts` - data provider wrapper tests.
- `supabase/migrations/20260520120000_prymeira_auth_multitenant.sql` - manual migration for tenant columns, Clerk identity, RLS helpers, and policies.

Modify:

- `package.json` and `package-lock.json` - add `@clerk/clerk-react`.
- `src/App.tsx` - wrap CRM with Clerk and Prymeira access gate.
- `src/components/atomic-crm/root/CRM.tsx` - remove Supabase login routes and accept Clerk-backed provider cleanly.
- `src/components/atomic-crm/providers/supabase/supabase.ts` - allow the Supabase client to use a Clerk token provider.
- `src/components/atomic-crm/providers/supabase/authProvider.ts` - retire Supabase Auth behavior or delegate to the new Clerk provider.
- `src/components/atomic-crm/providers/supabase/dataProvider.ts` - remove Supabase signup/password methods from the default path and wrap custom methods with tenant behavior.
- `src/components/atomic-crm/providers/fakerest/*` - add demo workspace identity and workspace filtering.
- `src/components/atomic-crm/types.ts` - replace `user_id` with `clerk_user_id`, add `workspace_id`, `workspace_role`, `product_role` on `Sale`, and add `workspace_id` on tenant records.
- `supabase/schemas/01_tables.sql` - declarative schema changes for tenant columns and sales identity.
- `supabase/schemas/02_functions.sql` - RLS helper and trigger function changes.
- `supabase/schemas/03_views.sql` - include `workspace_id` in summary/activity views and filter joins consistently.
- `supabase/schemas/04_triggers.sql` - remove `auth.users` triggers and ensure insert defaults use Clerk/workspace helpers.
- `supabase/schemas/05_policies.sql` - tenant-scoped policies.
- `supabase/schemas/06_grants.sql` - grants for new helper functions.
- `supabase/config.toml` and `supabase/config.e2e.toml` - Clerk third-party auth configuration.
- `supabase/functions/_shared/authentication.ts` - accept Clerk-trusted JWT identity.
- `supabase/functions/_shared/getUserSale.ts` - lookup by `clerk_user_id` and workspace.
- `supabase/functions/users/index.ts` - stop creating Supabase Auth users; manage CRM `sales` rows only.
- `supabase/functions/update_password/index.ts` - remove from the active CRM path; leave a 410 response if route remains deployed.
- `supabase/functions/merge_contacts/index.ts` - enforce same-workspace merge.
- `supabase/functions/delete_note_attachments/index.ts` - enforce workspace authorization.

## Task 1: Add Clerk Dependency and Prymeira Types

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/atomic-crm/prymeira/types.ts`
- Create: `src/components/atomic-crm/prymeira/accountApi.ts`
- Create: `src/components/atomic-crm/prymeira/tenantResources.ts`
- Create: `src/components/atomic-crm/prymeira/tenantResources.test.ts`

- [ ] **Step 1: Install Clerk React SDK**

Run:

```bash
npm install @clerk/clerk-react
```

Expected: `package.json` contains `@clerk/clerk-react` and `package-lock.json` is updated.

- [ ] **Step 2: Create Prymeira shared types**

Create `src/components/atomic-crm/prymeira/types.ts`:

```ts
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
```

- [ ] **Step 3: Create Prymeira Account API client**

Create `src/components/atomic-crm/prymeira/accountApi.ts`:

```ts
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
  import.meta.env.VITE_PRYMEIRA_PRODUCT_KEY || "operis";

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
```

- [ ] **Step 4: Write tenant resource tests**

Create `src/components/atomic-crm/prymeira/tenantResources.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  addWorkspaceToCreateParams,
  isTenantResource,
  tenantResources,
} from "./tenantResources";

describe("tenantResources", () => {
  it("marks CRM business resources as tenant scoped", () => {
    expect(tenantResources).toContain("contacts");
    expect(tenantResources).toContain("companies");
    expect(tenantResources).toContain("deals");
    expect(tenantResources).toContain("tasks");
    expect(isTenantResource("contacts_summary")).toBe(false);
  });

  it("adds workspace_id to tenant create params without changing non-tenant resources", () => {
    expect(
      addWorkspaceToCreateParams("contacts", {
        data: { first_name: "Ana" },
      } as any, "workspace-1"),
    ).toEqual({ data: { first_name: "Ana", workspace_id: "workspace-1" } });

    expect(
      addWorkspaceToCreateParams("activity_log", {
        data: { message: "ignored" },
      } as any, "workspace-1"),
    ).toEqual({ data: { message: "ignored" } });
  });

  it("does not overwrite an explicit workspace_id", () => {
    expect(
      addWorkspaceToCreateParams("contacts", {
        data: { workspace_id: "workspace-2", first_name: "Ana" },
      } as any, "workspace-1"),
    ).toEqual({ data: { workspace_id: "workspace-2", first_name: "Ana" } });
  });
});
```

- [ ] **Step 5: Run tenant resource test to verify it fails**

Run:

```bash
npx vitest --config vitest.config.ts run src/components/atomic-crm/prymeira/tenantResources.test.ts
```

Expected: FAIL because `tenantResources.ts` does not exist.

- [ ] **Step 6: Implement tenant resource helper**

Create `src/components/atomic-crm/prymeira/tenantResources.ts`:

```ts
import type { CreateParams } from "ra-core";

export const tenantResources = [
  "companies",
  "contacts",
  "contact_notes",
  "pipelines",
  "deals",
  "deal_notes",
  "leads",
  "sales",
  "sales_goals",
  "tags",
  "automation_runs",
  "proposal_templates",
  "proposal_template_items",
  "proposals",
  "proposal_items",
  "automation_rules",
  "tasks",
  "configuration",
  "favicons_excluded_domains",
] as const;

const tenantResourceSet = new Set<string>(tenantResources);

export function isTenantResource(resource: string) {
  return tenantResourceSet.has(resource);
}

export function addWorkspaceToCreateParams<TData extends Record<string, any>>(
  resource: string,
  params: CreateParams<TData>,
  workspaceId: string,
): CreateParams<TData> {
  if (!isTenantResource(resource)) return params;
  if (params.data.workspace_id) return params;

  return {
    ...params,
    data: {
      ...params.data,
      workspace_id: workspaceId,
    },
  };
}
```

- [ ] **Step 7: Run tenant resource test to verify it passes**

Run:

```bash
npx vitest --config vitest.config.ts run src/components/atomic-crm/prymeira/tenantResources.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit Task 1**

Run:

```bash
git add package.json package-lock.json src/components/atomic-crm/prymeira
git commit -m "feat: add prymeira account client primitives"
```

## Task 2: Add Clerk/Prymeira App Gate

**Files:**

- Create: `src/components/atomic-crm/prymeira/PrymeiraAccessContext.tsx`
- Create: `src/components/atomic-crm/prymeira/PrymeiraAccessDenied.tsx`
- Create: `src/components/atomic-crm/prymeira/PrymeiraAccessGate.tsx`
- Modify: `src/components/atomic-crm/providers/supabase/supabase.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create access context**

Create `src/components/atomic-crm/prymeira/PrymeiraAccessContext.tsx`:

```tsx
import { createContext, useContext } from "react";
import type { PrymeiraAccessContextValue } from "./types";

const PrymeiraAccessContext =
  createContext<PrymeiraAccessContextValue | null>(null);

export const PrymeiraAccessProvider = PrymeiraAccessContext.Provider;

export const usePrymeiraAccess = () => {
  const value = useContext(PrymeiraAccessContext);
  if (!value) {
    throw new Error("usePrymeiraAccess must be used inside PrymeiraAccessGate");
  }
  return value;
};
```

- [ ] **Step 2: Create denied screen**

Create `src/components/atomic-crm/prymeira/PrymeiraAccessDenied.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import { buildPrymeiraAccessDeniedUrl, getPrymeiraHubUrl } from "./accountApi";
import type { PrymeiraAccessDecision } from "./types";

export function PrymeiraAccessDenied(props: {
  decision?: PrymeiraAccessDecision;
  error?: Error;
}) {
  const href = props.decision
    ? buildPrymeiraAccessDeniedUrl(props.decision)
    : getPrymeiraHubUrl();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="w-full max-w-md space-y-5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Acesso nao liberado
        </h1>
        <p className="text-sm text-muted-foreground">
          {props.error?.message ??
            "A Prymeira Account nao encontrou uma liberacao ativa para este CRM."}
        </p>
        <Button asChild>
          <a href={href}>Abrir Prymeira Account</a>
        </Button>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Create access gate**

Create `src/components/atomic-crm/prymeira/PrymeiraAccessGate.tsx`:

```tsx
import { SignIn, useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  checkPrymeiraProductAccess,
  syncPrymeiraCustomer,
} from "./accountApi";
import { PrymeiraAccessDenied } from "./PrymeiraAccessDenied";
import { PrymeiraAccessProvider } from "./PrymeiraAccessContext";
import type {
  PrymeiraAccessContextValue,
  PrymeiraAccessDecision,
} from "./types";

type GateState =
  | { status: "loading" }
  | { status: "denied"; decision: PrymeiraAccessDecision }
  | { status: "error"; error: Error }
  | { status: "allowed"; value: PrymeiraAccessContextValue };

export function PrymeiraAccessGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [state, setState] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    let active = true;
    setState({ status: "loading" });

    async function loadAccess() {
      const token = await getToken();
      const email = user.primaryEmailAddress?.emailAddress;
      if (!token) throw new Error("Sessao Clerk sem token.");
      if (!email) throw new Error("Perfil Clerk sem email principal.");

      const sync = await syncPrymeiraCustomer(token, {
        clerk_user_id: user.id,
        email,
        name: user.fullName ?? user.firstName ?? undefined,
      });
      const decision = await checkPrymeiraProductAccess(token);

      if (!decision.allowed || !decision.workspace_id) {
        setState({ status: "denied", decision });
        return;
      }

      setState({
        status: "allowed",
        value: {
          token,
          clerkUserId: user.id,
          email,
          name: user.fullName ?? null,
          workspace: sync.workspace,
          decision: {
            ...decision,
            allowed: true,
            workspace_id: decision.workspace_id,
            workspace_role: decision.workspace_role ?? sync.workspace.role,
            product_role: decision.product_role ?? "member",
          },
        },
      });
    }

    loadAccess().catch((error: unknown) => {
      if (!active) return;
      setState({
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    });

    return () => {
      active = false;
    };
  }, [getToken, isLoaded, isSignedIn, user]);

  if (!isLoaded) return null;
  if (!isSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <SignIn routing="hash" />
      </main>
    );
  }
  if (state.status === "loading") return null;
  if (state.status === "error") {
    return <PrymeiraAccessDenied error={state.error} />;
  }
  if (state.status === "denied") {
    return <PrymeiraAccessDenied decision={state.decision} />;
  }

  return (
    <PrymeiraAccessProvider value={state.value}>
      {children}
    </PrymeiraAccessProvider>
  );
}
```

- [ ] **Step 4: Update Supabase client to accept Clerk token provider**

Modify `src/components/atomic-crm/providers/supabase/supabase.ts`:

```ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;
let accessTokenProvider: (() => Promise<string | null>) | null = null;

export const setSupabaseAccessTokenProvider = (
  provider: (() => Promise<string | null>) | null,
) => {
  accessTokenProvider = provider;
  supabaseClient = null;
};

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SB_PUBLISHABLE_KEY,
      {
        accessToken: async () => accessTokenProvider?.() ?? null,
      },
    );
  }
  return supabaseClient;
};
```

- [ ] **Step 5: Register token provider inside the gate**

Update `src/components/atomic-crm/prymeira/PrymeiraAccessGate.tsx` imports:

```tsx
import { setSupabaseAccessTokenProvider } from "../providers/supabase/supabase";
```

Add this effect below the state declaration:

```tsx
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setSupabaseAccessTokenProvider(null);
      return;
    }

    setSupabaseAccessTokenProvider(() => getToken());
    return () => setSupabaseAccessTokenProvider(null);
  }, [getToken, isLoaded, isSignedIn]);
```

- [ ] **Step 6: Wrap the app with Clerk and access gate**

Modify `src/App.tsx`:

```tsx
import { ClerkProvider } from "@clerk/clerk-react";
import { CRM } from "@/components/atomic-crm/root/CRM";
import { PrymeiraAccessGate } from "@/components/atomic-crm/prymeira/PrymeiraAccessGate";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function MissingClerkConfig() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <section className="max-w-md space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Configure a Prymeira Account
        </h1>
        <p className="text-sm text-muted-foreground">
          Defina VITE_CLERK_PUBLISHABLE_KEY para entrar no CRM.
        </p>
      </section>
    </main>
  );
}

const App = () => {
  if (!clerkPublishableKey) return <MissingClerkConfig />;

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <PrymeiraAccessGate>
        <CRM />
      </PrymeiraAccessGate>
    </ClerkProvider>
  );
};

export default App;
```

- [ ] **Step 7: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS. If the repository has pre-existing type errors from other active work, record those exact file paths in the task notes and fix every type error caused by files touched in this task before continuing.

- [ ] **Step 8: Commit Task 2**

Run:

```bash
git add src/App.tsx src/components/atomic-crm/prymeira src/components/atomic-crm/providers/supabase/supabase.ts
git commit -m "feat: gate crm with prymeira account"
```

## Task 3: Replace Supabase Auth Provider With Clerk-backed ra-core Provider

**Files:**

- Create: `src/components/atomic-crm/providers/supabase/clerkAuthProvider.test.ts`
- Create: `src/components/atomic-crm/providers/supabase/clerkAuthProvider.ts`
- Modify: `src/components/atomic-crm/root/CRM.tsx`
- Modify: `src/components/atomic-crm/providers/supabase/authProvider.ts`

- [ ] **Step 1: Write auth provider tests**

Create `src/components/atomic-crm/providers/supabase/clerkAuthProvider.test.ts`:

```ts
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
```

- [ ] **Step 2: Run auth provider tests to verify they fail**

Run:

```bash
npx vitest --config vitest.config.ts run src/components/atomic-crm/providers/supabase/clerkAuthProvider.test.ts
```

Expected: FAIL because `clerkAuthProvider.ts` does not exist.

- [ ] **Step 3: Implement Clerk auth provider**

Create `src/components/atomic-crm/providers/supabase/clerkAuthProvider.ts`:

```ts
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
```

- [ ] **Step 4: Run auth provider tests to verify they pass**

Run:

```bash
npx vitest --config vitest.config.ts run src/components/atomic-crm/providers/supabase/clerkAuthProvider.test.ts
```

Expected: PASS.

- [ ] **Step 5: Wire provider into CRM**

Modify `src/components/atomic-crm/root/CRM.tsx`:

- Keep the `authProvider` prop for tests and demo.
- Remove no-layout routes for Supabase signup/password recovery from the real Prymeira path.
- Continue rendering `<Admin requireAuth />`.

Use this routing block in `DesktopAdmin` and `MobileAdmin`:

```tsx
      <CustomRoutes>
        <Route path={ProfilePage.path} element={<ProfilePage />} />
        <Route path={SettingsPage.path} element={<SettingsPage />} />
        <Route path={ImportPage.path} element={<ImportPage />} />
        <Route path={ChangelogPage.path} element={<ChangelogPage />} />
      </CustomRoutes>
```

Remove these imports when unused:

```tsx
import { ForgotPasswordPage } from "@/components/supabase/forgot-password-page";
import { SetPasswordPage } from "@/components/supabase/set-password-page";
import { OAuthConsentPage } from "@/components/supabase/oauth-consent-page";
import { SignupPage } from "../login/SignupPage";
import { ConfirmationRequired } from "../login/ConfirmationRequired";
import { StartPage } from "../login/StartPage.tsx";
```

- [ ] **Step 6: Preserve default export compatibility**

Modify `src/components/atomic-crm/providers/supabase/authProvider.ts` so legacy imports fail clearly outside demo/test:

```ts
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
```

- [ ] **Step 7: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS. If the repository has pre-existing type errors from other active work, record those exact file paths in the task notes and fix every type error caused by files touched in this task before continuing.

- [ ] **Step 8: Commit Task 3**

Run:

```bash
git add src/components/atomic-crm/root/CRM.tsx src/components/atomic-crm/providers/supabase/authProvider.ts src/components/atomic-crm/providers/supabase/clerkAuthProvider.ts src/components/atomic-crm/providers/supabase/clerkAuthProvider.test.ts
git commit -m "feat: replace crm auth provider with prymeira auth"
```

## Task 4: Add Tenant Data Provider Wrapper and Sales Sync Method

**Files:**

- Create: `src/components/atomic-crm/providers/supabase/tenantDataProvider.test.ts`
- Create: `src/components/atomic-crm/providers/supabase/tenantDataProvider.ts`
- Modify: `src/components/atomic-crm/providers/supabase/dataProvider.ts`
- Modify: `src/components/atomic-crm/prymeira/PrymeiraAccessGate.tsx`
- Modify: `src/components/atomic-crm/types.ts`

- [ ] **Step 1: Write tenant data provider tests**

Create `src/components/atomic-crm/providers/supabase/tenantDataProvider.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { withTenantDataProvider } from "./tenantDataProvider";

describe("withTenantDataProvider", () => {
  it("injects workspace_id into tenant resource creates", async () => {
    const base = {
      create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    } as any;
    const provider = withTenantDataProvider(base, () => "workspace-1");

    await provider.create("contacts", { data: { first_name: "Ana" } });

    expect(base.create).toHaveBeenCalledWith("contacts", {
      data: { first_name: "Ana", workspace_id: "workspace-1" },
    });
  });

  it("does not inject workspace_id into non-tenant resource creates", async () => {
    const base = {
      create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    } as any;
    const provider = withTenantDataProvider(base, () => "workspace-1");

    await provider.create("activity_log", { data: { message: "Ana" } });

    expect(base.create).toHaveBeenCalledWith("activity_log", {
      data: { message: "Ana" },
    });
  });

  it("throws when creating tenant data without workspace context", async () => {
    const base = { create: vi.fn() } as any;
    const provider = withTenantDataProvider(base, () => null);

    await expect(
      provider.create("contacts", { data: { first_name: "Ana" } }),
    ).rejects.toThrow("Missing Prymeira workspace context");
  });
});
```

- [ ] **Step 2: Run tenant data provider tests to verify they fail**

Run:

```bash
npx vitest --config vitest.config.ts run src/components/atomic-crm/providers/supabase/tenantDataProvider.test.ts
```

Expected: FAIL because `tenantDataProvider.ts` does not exist.

- [ ] **Step 3: Implement tenant data provider wrapper**

Create `src/components/atomic-crm/providers/supabase/tenantDataProvider.ts`:

```ts
import type { CreateParams, DataProvider } from "ra-core";
import {
  addWorkspaceToCreateParams,
  isTenantResource,
} from "../../prymeira/tenantResources";

export function withTenantDataProvider<T extends DataProvider>(
  baseDataProvider: T,
  getWorkspaceId: () => string | null | undefined,
): T {
  return {
    ...baseDataProvider,
    async create(resource: string, params: CreateParams) {
      if (!isTenantResource(resource)) {
        return baseDataProvider.create(resource, params);
      }
      const workspaceId = getWorkspaceId();
      if (!workspaceId) {
        throw new Error("Missing Prymeira workspace context");
      }
      return baseDataProvider.create(
        resource,
        addWorkspaceToCreateParams(resource, params, workspaceId),
      );
    },
  };
}
```

- [ ] **Step 4: Run tenant data provider tests to verify they pass**

Run:

```bash
npx vitest --config vitest.config.ts run src/components/atomic-crm/providers/supabase/tenantDataProvider.test.ts
```

Expected: PASS.

- [ ] **Step 5: Add sales sync custom method**

Modify `src/components/atomic-crm/providers/supabase/dataProvider.ts` inside `getDataProviderWithCustomMethods()` return object:

```ts
    async syncCurrentSale(input: {
      clerk_user_id: string;
      email: string;
      name: string | null;
      workspace_id: string;
      workspace_role: string;
      product_role: string;
    }) {
      const [first_name, ...rest] = (input.name || input.email).split(" ");
      const last_name = rest.join(" ") || " ";
      const { data, error } = await getSupabaseClient()
        .from("sales")
        .upsert(
          {
            clerk_user_id: input.clerk_user_id,
            email: input.email,
            first_name,
            last_name,
            workspace_id: input.workspace_id,
            workspace_role: input.workspace_role,
            product_role: input.product_role,
            administrator:
              input.workspace_role === "owner" || input.product_role === "admin",
            disabled: false,
          },
          { onConflict: "workspace_id,clerk_user_id" },
        )
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Failed to sync current CRM user");
      }

      return data;
    },
```

Add the tenant wrapper to `getDataProvider()` after lifecycle callbacks are applied:

```ts
  const dataProvider = withLifecycleCallbacks(
    getDataProviderWithCustomMethods(),
    lifeCycleCallbacks,
  );

  return withTenantDataProvider(
    dataProvider,
    () => window.localStorage.getItem("prymeira.workspace_id"),
  );
```

Add import:

```ts
import { withTenantDataProvider } from "./tenantDataProvider";
```

- [ ] **Step 6: Sync sale from access gate**

Modify `src/components/atomic-crm/prymeira/PrymeiraAccessGate.tsx`:

```tsx
import { getDataProvider } from "../providers/supabase/dataProvider";
```

Inside the allowed branch before `setState({ status: "allowed", ... })`:

```tsx
      window.localStorage.setItem("prymeira.workspace_id", decision.workspace_id);
      await getDataProvider().syncCurrentSale({
        clerk_user_id: user.id,
        email,
        name: user.fullName ?? null,
        workspace_id: decision.workspace_id,
        workspace_role: decision.workspace_role ?? sync.workspace.role,
        product_role: decision.product_role ?? "member",
      });
```

- [ ] **Step 7: Update shared CRM types**

Modify `src/components/atomic-crm/types.ts`:

```ts
export type TenantRecord = {
  workspace_id: string;
};

export type Sale = {
  id: Identifier;
  first_name: string;
  last_name: string;
  email: string;
  administrator: boolean;
  clerk_user_id: string;
  workspace_id: string;
  workspace_role: string;
  product_role: string;
  avatar?: RAFile;
  disabled: boolean;
};
```

For existing business record types that are plain object exports, add `workspace_id: string` or intersect with `TenantRecord`.

- [ ] **Step 8: Run focused tests and typecheck**

Run:

```bash
npx vitest --config vitest.config.ts run src/components/atomic-crm/providers/supabase/tenantDataProvider.test.ts src/components/atomic-crm/prymeira/tenantResources.test.ts
npm run typecheck
```

Expected: tests PASS and typecheck PASS. If the repository has pre-existing type errors from other active work, record those exact file paths in the task notes and fix every type error caused by files touched in this task before continuing.

- [ ] **Step 9: Commit Task 4**

Run:

```bash
git add src/components/atomic-crm/providers/supabase/dataProvider.ts src/components/atomic-crm/providers/supabase/tenantDataProvider.ts src/components/atomic-crm/providers/supabase/tenantDataProvider.test.ts src/components/atomic-crm/prymeira/PrymeiraAccessGate.tsx src/components/atomic-crm/types.ts
git commit -m "feat: scope crm data provider by prymeira workspace"
```

## Task 5: Migrate Supabase Schema, RLS, and Views

**Files:**

- Create: `supabase/migrations/20260520120000_prymeira_auth_multitenant.sql`
- Modify: `supabase/schemas/01_tables.sql`
- Modify: `supabase/schemas/02_functions.sql`
- Modify: `supabase/schemas/03_views.sql`
- Modify: `supabase/schemas/04_triggers.sql`
- Modify: `supabase/schemas/05_policies.sql`
- Modify: `supabase/schemas/06_grants.sql`
- Modify: `supabase/config.toml`
- Modify: `supabase/config.e2e.toml`

- [ ] **Step 1: Create manual migration**

Create `supabase/migrations/20260520120000_prymeira_auth_multitenant.sql`:

```sql
alter table public.sales drop constraint if exists sales_user_id_fkey;
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;

alter table public.companies add column if not exists workspace_id uuid;
alter table public.contacts add column if not exists workspace_id uuid;
alter table public.contact_notes add column if not exists workspace_id uuid;
alter table public.pipelines add column if not exists workspace_id uuid;
alter table public.deals add column if not exists workspace_id uuid;
alter table public.deal_notes add column if not exists workspace_id uuid;
alter table public.leads add column if not exists workspace_id uuid;
alter table public.sales add column if not exists workspace_id uuid;
alter table public.sales add column if not exists clerk_user_id text;
alter table public.sales add column if not exists workspace_role text not null default 'member';
alter table public.sales add column if not exists product_role text not null default 'member';
alter table public.sales_goals add column if not exists workspace_id uuid;
alter table public.tags add column if not exists workspace_id uuid;
alter table public.automation_runs add column if not exists workspace_id uuid;
alter table public.proposal_templates add column if not exists workspace_id uuid;
alter table public.proposal_template_items add column if not exists workspace_id uuid;
alter table public.proposals add column if not exists workspace_id uuid;
alter table public.proposal_items add column if not exists workspace_id uuid;
alter table public.automation_rules add column if not exists workspace_id uuid;
alter table public.tasks add column if not exists workspace_id uuid;
alter table public.configuration add column if not exists workspace_id uuid;
alter table public.favicons_excluded_domains add column if not exists workspace_id uuid;

-- Local/dev backfill. Production must replace this value with the workspace id
-- selected during the migration run.
do $$
declare
  default_workspace_id uuid := '00000000-0000-0000-0000-000000000001';
begin
  update public.sales
  set
    workspace_id = coalesce(workspace_id, default_workspace_id),
    clerk_user_id = coalesce(clerk_user_id, email::text);

  update public.companies set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.contacts set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.contact_notes set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.pipelines set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.deals set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.deal_notes set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.leads set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.sales_goals set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.tags set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.automation_runs set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.proposal_templates set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.proposal_template_items set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.proposals set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.proposal_items set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.automation_rules set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.tasks set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.configuration set workspace_id = coalesce(workspace_id, default_workspace_id);
  update public.favicons_excluded_domains set workspace_id = coalesce(workspace_id, default_workspace_id);
end $$;

alter table public.sales alter column workspace_id set not null;
alter table public.sales alter column clerk_user_id set not null;
alter table public.companies alter column workspace_id set not null;
alter table public.contacts alter column workspace_id set not null;
alter table public.contact_notes alter column workspace_id set not null;
alter table public.pipelines alter column workspace_id set not null;
alter table public.deals alter column workspace_id set not null;
alter table public.deal_notes alter column workspace_id set not null;
alter table public.leads alter column workspace_id set not null;
alter table public.sales_goals alter column workspace_id set not null;
alter table public.tags alter column workspace_id set not null;
alter table public.automation_runs alter column workspace_id set not null;
alter table public.proposal_templates alter column workspace_id set not null;
alter table public.proposal_template_items alter column workspace_id set not null;
alter table public.proposals alter column workspace_id set not null;
alter table public.proposal_items alter column workspace_id set not null;
alter table public.automation_rules alter column workspace_id set not null;
alter table public.tasks alter column workspace_id set not null;
alter table public.configuration alter column workspace_id set not null;
alter table public.favicons_excluded_domains alter column workspace_id set not null;

drop index if exists public.uq__sales__user_id;
create unique index if not exists uq__sales__workspace_clerk_user
  on public.sales using btree (workspace_id, clerk_user_id);

alter table public.sales drop column if exists user_id;

create or replace function public.current_clerk_user_id()
returns text
language sql
stable
set search_path = ''
as $$
  select nullif(auth.jwt()->>'sub', '')
$$;

create or replace function public.can_access_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sales
    where workspace_id = target_workspace_id
      and clerk_user_id = public.current_clerk_user_id()
      and disabled = false
  )
$$;

create or replace function public.current_sale_id(target_workspace_id uuid)
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select id
  from public.sales
  where workspace_id = target_workspace_id
    and clerk_user_id = public.current_clerk_user_id()
    and disabled = false
  limit 1
$$;

create or replace function public.is_admin_for_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sales
    where workspace_id = target_workspace_id
      and clerk_user_id = public.current_clerk_user_id()
      and administrator = true
      and disabled = false
  )
$$;

create or replace function public.set_sales_id_default()
returns trigger
language plpgsql
set search_path = 'public'
as $$
begin
  if new.sales_id is null and new.workspace_id is not null then
    select public.current_sale_id(new.workspace_id) into new.sales_id;
  end if;
  return new;
end;
$$;
```

- [ ] **Step 2: Update declarative schemas to match migration**

Edit these schema files to match the SQL above:

- `supabase/schemas/01_tables.sql`: add every `workspace_id`, change `sales` columns, remove `sales_user_id_fkey`, add `(workspace_id, clerk_user_id)` unique index.
- `supabase/schemas/02_functions.sql`: replace `is_admin()` and `set_sales_id_default()` with helper functions from the migration.
- `supabase/schemas/04_triggers.sql`: delete `on_auth_user_created` and `on_auth_user_updated`.
- `supabase/schemas/06_grants.sql`: grant execute on `current_clerk_user_id`, `can_access_workspace`, `current_sale_id`, and `is_admin_for_workspace` to `authenticated` and `service_role`.

- [ ] **Step 3: Update RLS policies**

In `supabase/schemas/05_policies.sql`, replace tenant table policies with this pattern:

```sql
create policy "Enable read access for workspace members"
on public.contacts
for select
to authenticated
using (public.can_access_workspace(workspace_id));

create policy "Enable insert for workspace members"
on public.contacts
for insert
to authenticated
with check (public.can_access_workspace(workspace_id));

create policy "Enable update for workspace members"
on public.contacts
for update
to authenticated
using (public.can_access_workspace(workspace_id))
with check (public.can_access_workspace(workspace_id));

create policy "Enable delete for workspace members"
on public.contacts
for delete
to authenticated
using (public.can_access_workspace(workspace_id));
```

Apply the same pattern to `companies`, `contact_notes`, `pipelines`, `deals`, `deal_notes`, `leads`, `tags`, `automation_runs`, `proposals`, `proposal_items`, and `tasks`.

For admin-only resources use this pattern:

```sql
create policy "Enable insert for workspace admins"
on public.proposal_templates
for insert
to authenticated
with check (public.is_admin_for_workspace(workspace_id));
```

Apply admin-only writes to `sales_goals`, `proposal_templates`, `proposal_template_items`, `automation_rules`, and `configuration`.

- [ ] **Step 4: Update summary and activity views**

In `supabase/schemas/03_views.sql`, include `workspace_id` in every view that fronts tenant resources. For `contacts_summary`, ensure the selected row includes:

```sql
contacts.workspace_id,
```

For `companies_summary`, ensure the selected row includes:

```sql
companies.workspace_id,
```

For `activity_log`, include workspace id from the source table and do not union rows without a workspace:

```sql
select
  contact_notes.workspace_id,
  contact_notes.id,
  contact_notes.date,
  'contact_notes'::text as resource
from contact_notes
union all
select
  deal_notes.workspace_id,
  deal_notes.id,
  deal_notes.date,
  'deal_notes'::text as resource
from deal_notes
```

- [ ] **Step 5: Add Clerk third-party auth local config**

Modify both `supabase/config.toml` and `supabase/config.e2e.toml`:

```toml
[auth.third_party.clerk]
enabled = true
domain = "env(CLERK_DOMAIN)"
```

- [ ] **Step 6: Validate schema syntax**

Run:

```bash
npm run test:unit:functions
```

Expected: function tests PASS. If SQL parser tests fail because of schema text, fix syntax before continuing.

- [ ] **Step 7: Apply local migration**

Run:

```bash
npx supabase migration up --local
```

Expected: migration applies without errors. If local Supabase is not running, start it with `make start` and rerun.

- [ ] **Step 8: Commit Task 5**

Run:

```bash
git add supabase/migrations/20260520120000_prymeira_auth_multitenant.sql supabase/schemas supabase/config.toml supabase/config.e2e.toml
git commit -m "feat: add prymeira workspace rls"
```

## Task 6: Update Edge Functions for Clerk/Workspace Identity

**Files:**

- Modify: `supabase/functions/_shared/authentication.ts`
- Modify: `supabase/functions/_shared/getUserSale.ts`
- Modify: `supabase/functions/users/index.ts`
- Modify: `supabase/functions/update_password/index.ts`
- Modify: `supabase/functions/merge_contacts/index.ts`
- Modify: `supabase/functions/delete_note_attachments/index.ts`

- [ ] **Step 1: Update shared auth middleware**

Modify `supabase/functions/_shared/authentication.ts`:

```ts
import * as jose from "jsr:@panva/jose@6";
import { createErrorResponse } from "./utils.ts";

export type AuthenticatedUser = {
  id: string;
  email?: string;
};

const ISSUER = Deno.env.get("CLERK_JWT_ISSUER");
const JWKS_URL = Deno.env.get("CLERK_JWKS_URL");

const CLERK_JWT_KEYS = JWKS_URL
  ? jose.createRemoteJWKSet(new URL(JWKS_URL))
  : null;

function getAuthToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) throw new Error("Missing authorization header");
  const [bearer, token] = authHeader.split(" ");
  if (bearer !== "Bearer" || !token) {
    throw new Error("Auth header is not 'Bearer {token}'");
  }
  return token;
}

async function verifyClerkJWT(jwt: string) {
  if (!ISSUER || !CLERK_JWT_KEYS) {
    throw new Error("Missing CLERK_JWT_ISSUER or CLERK_JWKS_URL");
  }
  return jose.jwtVerify(jwt, CLERK_JWT_KEYS, { issuer: ISSUER });
}

export const AuthMiddleware = async (
  req: Request,
  next: (req: Request) => Promise<Response>,
) => {
  if (req.method === "OPTIONS") return await next(req);

  try {
    await verifyClerkJWT(getAuthToken(req));
    return await next(req);
  } catch (e) {
    return createErrorResponse(401, e?.toString() || "Unauthorized");
  }
};

export const UserMiddleware = async (
  req: Request,
  next: (req: Request, user?: AuthenticatedUser) => Promise<Response>,
) => {
  if (req.method === "OPTIONS") return await next(req);

  try {
    const { payload } = await verifyClerkJWT(getAuthToken(req));
    return next(req, {
      id: String(payload.sub),
      email: typeof payload.email === "string" ? payload.email : undefined,
    });
  } catch (err) {
    return createErrorResponse(401, err?.toString() || "Unauthorized");
  }
};
```

- [ ] **Step 2: Update sale lookup**

Modify `supabase/functions/_shared/getUserSale.ts`:

```ts
import { supabaseAdmin } from "./supabaseAdmin.ts";
import type { AuthenticatedUser } from "./authentication.ts";

export async function getUserSale(user?: AuthenticatedUser, workspaceId?: string) {
  if (!user?.id || !workspaceId) return null;

  const { data, error } = await supabaseAdmin
    .from("sales")
    .select("*")
    .eq("clerk_user_id", user.id)
    .eq("workspace_id", workspaceId)
    .eq("disabled", false)
    .single();

  if (error) return null;
  return data;
}
```

- [ ] **Step 3: Replace users function behavior**

Modify `supabase/functions/users/index.ts` so POST and PATCH only manage CRM `sales` rows in the caller workspace. Use request `workspace_id` and reject cross-workspace edits:

```ts
const workspaceId = body.workspace_id;
const currentUserSale = await getUserSale(user, workspaceId);
if (!currentUserSale?.administrator) {
  return createErrorResponse(401, "Not Authorized");
}
```

For POST, insert/upsert:

```ts
await supabaseAdmin.from("sales").upsert(
  {
    workspace_id: workspaceId,
    clerk_user_id: body.clerk_user_id,
    email: body.email,
    first_name: body.first_name,
    last_name: body.last_name,
    administrator: body.administrator,
    disabled: body.disabled ?? false,
    workspace_role: body.workspace_role ?? "member",
    product_role: body.product_role ?? "member",
  },
  { onConflict: "workspace_id,clerk_user_id" },
);
```

For PATCH, update only rows matching both `id` and `workspace_id`.

- [ ] **Step 4: Return 410 from update_password**

Modify `supabase/functions/update_password/index.ts`:

```ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders, OptionsMiddleware } from "../_shared/cors.ts";

Deno.serve(async (req: Request) =>
  OptionsMiddleware(
    req,
    async () =>
      new Response(
        JSON.stringify({
          message: "Password management moved to Prymeira Account.",
        }),
        {
          status: 410,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      ),
  ),
);
```

- [ ] **Step 5: Enforce workspace in merge contacts**

Modify `supabase/functions/merge_contacts/index.ts` so the request body includes `workspace_id`, current user sale is loaded with that workspace, and both contacts are selected with:

```ts
.eq("workspace_id", workspaceId)
```

Before invoking merge SQL, reject if source or target is missing:

```ts
if (!sourceContact || !targetContact) {
  return createErrorResponse(404, "Contacts not found in workspace");
}
```

- [ ] **Step 6: Enforce workspace in delete attachments**

Modify `supabase/functions/delete_note_attachments/index.ts` to require `workspace_id` in the request body and check the note row with:

```ts
.eq("workspace_id", workspaceId)
```

before deleting storage objects.

- [ ] **Step 7: Run function tests**

Run:

```bash
npm run test:unit:functions
```

Expected: PASS after updating tests that asserted Supabase Auth user behavior.

- [ ] **Step 8: Commit Task 6**

Run:

```bash
git add supabase/functions
git commit -m "feat: use clerk identity in edge functions"
```

## Task 7: Update FakeRest Demo for Workspace Isolation

**Files:**

- Modify: `src/components/atomic-crm/providers/fakerest/authProvider.ts`
- Modify: `src/components/atomic-crm/providers/fakerest/dataProvider.ts`
- Modify: `src/components/atomic-crm/providers/fakerest/dataGenerator/*`

- [ ] **Step 1: Add FakeRest identity workspace**

Modify `src/components/atomic-crm/providers/fakerest/authProvider.ts` so the default user includes:

```ts
clerk_user_id: "user_demo",
workspace_id: "00000000-0000-0000-0000-000000000001",
workspace_role: "owner",
product_role: "admin",
```

- [ ] **Step 2: Add workspace ids to generated records**

In each FakeRest generator, define:

```ts
export const DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";
```

and add `workspace_id: DEFAULT_WORKSPACE_ID` to every generated tenant record.

- [ ] **Step 3: Filter FakeRest reads by workspace**

Modify `src/components/atomic-crm/providers/fakerest/dataProvider.ts` before delegating list calls:

```ts
const workspaceId = DEFAULT_WORKSPACE_ID;
if (isTenantResource(resource)) {
  params = {
    ...params,
    filter: {
      ...params.filter,
      workspace_id: workspaceId,
    },
  };
}
```

Import `isTenantResource`.

- [ ] **Step 4: Run unit tests**

Run:

```bash
npm run test:unit:app
```

Expected: PASS. If the repository has pre-existing unit failures from other active work, record those exact test names in the task notes and fix every failure caused by FakeRest workspace changes before continuing.

- [ ] **Step 5: Commit Task 7**

Run:

```bash
git add src/components/atomic-crm/providers/fakerest
git commit -m "feat: add workspace isolation to demo provider"
```

## Task 8: Final Verification and Browser Smoke Test

**Files:**

- Verification normally creates no source edits. When a verification command fails, modify only the files responsible for that failure and list each modified path in the task notes before committing.

- [ ] **Step 1: Run full quality checks**

Run:

```bash
npm run typecheck
npm run test:unit:app
npm run test:unit:functions
npm run lint
npm run build
```

Expected: every command exits 0. If any command fails, fix the failing touched code and rerun the same command until it exits 0.

- [ ] **Step 2: Start local stack**

Run:

```bash
make start
```

Expected: Vite serves the CRM at `http://localhost:5173/` and Supabase starts locally.

- [ ] **Step 3: Verify signed-out state**

Open `http://localhost:5173/`.

Expected: Clerk sign-in screen appears. CRM content is not visible before sign-in.

- [ ] **Step 4: Verify allowed access**

Sign in with a Clerk test user that has an active Prymeira Account entitlement and product seat for `VITE_PRYMEIRA_PRODUCT_KEY`.

Expected:

- CRM dashboard renders.
- A `sales` row exists with the test user's `clerk_user_id` and Prymeira `workspace_id`.
- Creating a contact writes the same `workspace_id`.

- [ ] **Step 5: Verify denied access**

Sign in with a Clerk test user without a product seat.

Expected: CRM content does not render and the denied screen links to Prymeira Account with `product_key`, `reason`, and `return_url`.

- [ ] **Step 6: Verify tenant isolation**

Use two Clerk users in different workspaces. Create a contact as user A. Sign in as user B.

Expected: user B cannot see user A's contact in list, show, search, summary views, or activity log.

- [ ] **Step 7: Stop local stack**

Run:

```bash
make stop
```

Expected: local services stop.

- [ ] **Step 8: Commit verification fixes when files changed**

Run:

```bash
git status --short
```

If verification changed files, stage the exact paths shown by `git status --short` that belong to Prymeira auth/multitenancy work, then run:

```bash
git commit -m "fix: stabilize prymeira auth migration"
```

Expected: a commit is created only when verification produced source changes.

## Self-Review

- Spec coverage: auth replacement is covered in Tasks 2 and 3; Prymeira Account access checks are covered in Tasks 1 and 2; tenant schema/RLS is covered in Task 5; Edge Functions are covered in Task 6; FakeRest/demo isolation is covered in Task 7; verification is covered in Task 8.
- Placeholder scan: the plan avoids deferred implementation markers. The only environment-specific value is `CLERK_DOMAIN`, represented as an environment variable in Supabase config so the implementation does not hardcode secrets or instance domains.
- Type consistency: `workspace_id`, `clerk_user_id`, `workspace_role`, and `product_role` are used consistently across Prymeira context, `sales`, data provider, RLS, and Edge Functions.
