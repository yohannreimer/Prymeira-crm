# Prymeira Auth Multitenant CRM Design

Date: 2026-05-20

## 1. Goal

Replace the CRM's current Supabase Auth login with Prymeira Account as the only authentication and product-access layer, while making the CRM fully multitenant using the same workspace model already used by Prymeira Account.

The CRM remains a Supabase-backed React/ra-core application. Supabase Auth no longer owns user identity for the CRM. Clerk/Prymeira Account owns login, signup, password recovery, sessions, workspace membership, product entitlement, and product seat access. Supabase trusts Clerk session tokens through Supabase Third-Party Auth for Clerk.

## 2. Current State

The CRM currently uses:

- `ra-supabase-core` for auth provider behavior.
- Supabase Auth sessions for `auth.uid()`.
- `public.sales.user_id uuid references auth.users(id)` to connect a CRM seller to a Supabase Auth user.
- Auth triggers on `auth.users` to create/update `public.sales`.
- Broad RLS policies such as `to authenticated using (true)`.
- `sales_id` for ownership/assignment, but not for tenant isolation.

Prymeira Account currently uses:

- Clerk for identity and sessions.
- Account API for customers, workspaces, workspace memberships, entitlements, product seats, and access checks.
- `/customers/sync` to sync a Clerk user into Prymeira Account.
- `/access-check?product_key=...` to decide access for a product in a workspace.
- `/me/products` to return the current customer, workspace context, and product access list.

## 3. Design Decision

Use Prymeira Account as the CRM's auth and tenant authority:

- Clerk session token is the only browser auth token.
- Supabase client uses the Clerk token via `createClient(..., { accessToken })`.
- Supabase is configured with `[auth.third_party.clerk]` so PostgREST, Storage, Realtime, and Edge Functions trust Clerk JWTs.
- CRM data is scoped by Prymeira `workspace_id`.
- CRM users are represented by `sales` rows keyed by `(workspace_id, clerk_user_id)`.
- Product access is checked against Prymeira Account before the CRM renders.

The initial product key is `operis`, matching the current Prymeira Account seed, but the CRM must read it from configuration (`VITE_PRYMEIRA_PRODUCT_KEY`) so it can be renamed without code changes.

## 4. Tenant Model

The CRM follows these Prymeira Account concepts:

- `customer`: the authenticated Clerk/Prymeira user.
- `workspace`: the tenant boundary.
- `workspace_member`: the user's role inside the tenant.
- `entitlement`: the workspace-level license for a product.
- `workspace_product_member`: the user's product seat and product role.

The CRM does not duplicate entitlement rules. It stores the workspace memberships that Prymeira Account has already allowed for this CRM product, including `workspace_id`, `workspace_role`, and `product_role`. Prymeira Account remains the source of truth; CRM rows are a local authorization cache used by RLS and UI permissions.

## 5. Database Design

### Tenant Columns

Add `workspace_id uuid not null` to every CRM table whose data belongs to one tenant:

- `companies`
- `contacts`
- `contact_notes`
- `pipelines`
- `deals`
- `deal_notes`
- `leads`
- `sales`
- `sales_goals`
- `tags`
- `automation_runs`
- `proposal_templates`
- `proposal_template_items`
- `proposals`
- `proposal_items`
- `automation_rules`
- `tasks`
- `configuration`
- `favicons_excluded_domains`

Tables with child relationships should inherit workspace from their parent when possible. For example, proposal items inherit from proposals, notes inherit from contact/deal, and template items inherit from proposal templates.

### Sales Identity

Replace Supabase Auth ownership with Clerk/Prymeira ownership:

- Remove `sales.user_id uuid references auth.users(id)`.
- Add `sales.clerk_user_id text not null`.
- Add `sales.workspace_id uuid not null`.
- Add `sales.workspace_role text not null default 'member'`.
- Add `sales.product_role text not null default 'member'`.
- Keep `sales.administrator` for CRM-local admin behavior, but scope it per workspace.
- Add unique index on `(workspace_id, clerk_user_id)`.

Existing `sales_id` relationships remain useful for owner/assignee display and reporting. They are not the tenant boundary; `workspace_id` is.

### RLS Helpers

Add helper functions:

- `public.current_clerk_user_id()` returns `auth.jwt()->>'sub'`.
- `public.can_access_workspace(target_workspace_id uuid)` returns true when the current Clerk user has an enabled `sales` row for that workspace.
- `public.current_sale_id(target_workspace_id uuid)` returns the current `sales.id` for `(target_workspace_id, clerk_user_id)`.
- `public.is_admin_for_workspace(target_workspace_id uuid)` checks `sales.administrator = true` for the target workspace and current Clerk user.
- `public.is_admin()` may remain as a compatibility wrapper only when the calling SQL has an unambiguous workspace context.

RLS does not depend on a user-editable `workspace_id` filter. Each row's `workspace_id` is checked against server-side `sales` rows that were created only after Prymeira Account allowed the user's workspace/product access. This supports multiple authorized workspaces without trusting local storage or client headers as the security boundary.

### RLS Policies

Replace broad policies with tenant-scoped policies:

- Tenant tables: `using (public.can_access_workspace(workspace_id))`.
- Inserts: `with check (public.can_access_workspace(workspace_id))`.
- Admin-only writes: combine tenant check with `public.is_admin_for_workspace(workspace_id)`.
- Global read-only lookup tables should be explicitly identified. Until proven global, default to tenant-scoped.

## 6. Frontend Design

### App Shell

`src/App.tsx` wraps the CRM in Clerk:

- Load `VITE_CLERK_PUBLISHABLE_KEY`.
- Render `<ClerkProvider>`.
- Render a Prymeira access gate before `<CRM />`.

### Prymeira Access Gate

The gate is responsible for:

- Waiting for Clerk auth state.
- Showing Clerk sign-in/sign-up screens when signed out.
- Getting a Clerk token with `getToken()`.
- Calling Prymeira Account `/customers/sync`.
- Calling `/access-check` for `VITE_PRYMEIRA_PRODUCT_KEY`.
- Persisting the current workspace context in React context.
- Creating/updating the CRM `sales` row for the current Clerk user and allowed workspace through a safe Supabase path.
- Rendering the CRM only when access is allowed.
- Redirecting denied users to the Prymeira Hub access-denied flow with `product_key`, `reason`, and `return_url`.

### Auth Provider

Replace the Supabase Auth provider behavior with a Clerk-backed ra-core auth provider:

- `login`: redirects/opens Clerk sign-in instead of calling Supabase Auth.
- `logout`: signs out through Clerk and clears CRM caches.
- `checkAuth`: requires an active Clerk session and allowed Prymeira product access.
- `getIdentity`: returns CRM identity from the current `sales` row and Clerk user profile.
- `canAccess`: uses CRM-local role checks scoped to the active workspace.
- Remove Supabase password recovery, signup, set-password, and Supabase OAuth consent routes from the CRM flow.

### Supabase Client

Update `getSupabaseClient()` so the client uses Clerk tokens:

- Keep `VITE_SUPABASE_URL`.
- Keep publishable Supabase key.
- Provide `accessToken: async () => clerkSession?.getToken() ?? null`.
- Ensure token refresh does not require re-creating all data provider instances during normal app usage.

### Data Provider

The data provider must preserve tenant isolation ergonomics:

- Add `workspace_id` automatically on creates for tenant-scoped resources.
- Include `workspace_id` filters only as convenience; RLS remains the real boundary.
- Clear cached data when the active workspace changes in a future workspace switcher.
- Avoid leaking records across tenants in FakeRest/demo mode by adding equivalent workspace filtering there.

## 7. Backend and Edge Functions

Supabase Edge Functions that currently validate Supabase JWTs must accept the same Clerk-trusted token model or delegate verification consistently. Shared auth utilities should read Clerk identity from JWT claims and map to current workspace context.

Any function that mutates CRM data must enforce workspace context server-side, not only from request bodies.

## 8. Configuration

New CRM environment variables:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_PRYMEIRA_ACCOUNT_API_URL`
- `VITE_PRYMEIRA_HUB_URL`
- `VITE_PRYMEIRA_PRODUCT_KEY=operis`
- `VITE_SUPABASE_URL`
- `VITE_SB_PUBLISHABLE_KEY`

Supabase local config must add the Clerk third-party auth settings:

```toml
[auth.third_party.clerk]
enabled = true
domain = "<clerk-domain>"
```

The real Clerk domain must come from the Prymeira Clerk instance.

## 9. Migration Strategy

1. Add nullable `workspace_id` and `clerk_user_id` columns.
2. Backfill existing data into a default Prymeira workspace chosen for migration.
3. Backfill `sales.clerk_user_id` by email or an explicit migration map from existing Supabase users to Clerk users.
4. Add tenant indexes and uniqueness constraints.
5. Update functions and policies to support Clerk/workspace checks through server-side `sales` rows.
6. Make tenant columns non-null.
7. Remove the `sales.user_id` foreign key and auth user triggers.
8. Update frontend auth and data provider.
9. Verify local Supabase with Clerk third-party auth before production rollout.

Manual review is required for the Supabase migration because the schema source of truth is declarative, and column identity changes should avoid destructive drop/create behavior where data must be preserved.

## 10. Error Handling

Access decisions map to clear UI outcomes:

- `no_customer`: sync customer, then retry once.
- `no_workspace` or `no_workspace_membership`: redirect to Prymeira Hub.
- `no_product`, `inactive_product`, `no_entitlement`, `no_product_seat`: redirect to access-denied/upgrade.
- `workspace_suspended`, `blocked`, `cancelled`, `expired`, `trial_expired`: redirect to access-denied/upgrade with reason.
- Account API unavailable: show a blocking error screen; do not render CRM with cached access.

## 11. Testing

Required coverage:

- Unit tests for RLS helper SQL behavior where practical.
- Data provider tests confirming `workspace_id` is injected on creates.
- Auth provider tests for signed-out, allowed, denied, and logout flows.
- FakeRest tests or fixtures for workspace isolation.
- Manual local test with two Clerk users in different Prymeira workspaces confirming no cross-tenant reads.
- Typecheck, unit tests, lint, and production build.

## 12. Out of Scope

- Rebuilding Prymeira Account itself.
- Payment checkout implementation.
- Multi-workspace switcher UI inside the CRM beyond consuming the active workspace returned by Prymeira Account.
- Replacing all CRM role/permission UX beyond what is needed to honor `workspace_role`, `product_role`, and `sales.administrator`.

## 13. Security Constraint

Tenant isolation is enforced by Supabase RLS using trusted Clerk identity plus server-side CRM `sales` rows. The UI may keep an active workspace in React context for routing, filtering, and display, but that value is never the security boundary. A user can read or mutate a tenant row only when `public.can_access_workspace(row.workspace_id)` is true.

If a future CRM workspace switcher is added, it must only select among workspaces already allowed by Prymeira Account and represented by enabled CRM `sales` rows for the current Clerk user.
