--
-- Row Level Security
-- This file declares RLS policies for all tables.
--

-- Enable RLS on all tables
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.contact_notes enable row level security;
alter table public.pipelines enable row level security;
alter table public.deals enable row level security;
alter table public.deal_notes enable row level security;
alter table public.leads enable row level security;
alter table public.sales enable row level security;
alter table public.sales_goals enable row level security;
alter table public.tags enable row level security;
alter table public.automation_runs enable row level security;
alter table public.proposal_templates enable row level security;
alter table public.proposal_template_items enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_items enable row level security;
alter table public.automation_rules enable row level security;
alter table public.tasks enable row level security;
alter table public.configuration enable row level security;
alter table public.favicons_excluded_domains enable row level security;

-- Tenant CRUD resources
create policy "Tenant read" on public.companies for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.companies for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.companies for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.companies for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.contacts for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.contacts for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.contacts for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.contacts for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.contact_notes for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.contact_notes for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.contact_notes for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.contact_notes for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.pipelines for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.pipelines for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.pipelines for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.pipelines for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.deals for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.deals for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.deals for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.deals for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.deal_notes for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.deal_notes for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.deal_notes for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.deal_notes for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.leads for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.leads for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.leads for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.leads for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.tags for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.tags for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.tags for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.tags for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.automation_runs for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.automation_runs for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.automation_runs for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.automation_runs for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.proposals for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.proposals for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.proposals for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.proposals for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.proposal_items for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.proposal_items for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.proposal_items for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.proposal_items for delete to authenticated using (public.can_access_workspace(workspace_id));

create policy "Tenant read" on public.tasks for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Tenant insert" on public.tasks for insert to authenticated with check (public.can_access_workspace(workspace_id));
create policy "Tenant update" on public.tasks for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id));
create policy "Tenant delete" on public.tasks for delete to authenticated using (public.can_access_workspace(workspace_id));

-- Sales are readable by workspace members and writable only by workspace admins.
create policy "Tenant read" on public.sales for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Admin insert" on public.sales for insert to authenticated with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin update" on public.sales for update to authenticated using (public.is_admin_for_workspace(workspace_id)) with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin delete" on public.sales for delete to authenticated using (public.is_admin_for_workspace(workspace_id));

-- Admin-write resources
create policy "Tenant read" on public.sales_goals for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Admin insert" on public.sales_goals for insert to authenticated with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin update" on public.sales_goals for update to authenticated using (public.is_admin_for_workspace(workspace_id)) with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin delete" on public.sales_goals for delete to authenticated using (public.is_admin_for_workspace(workspace_id));

create policy "Tenant read" on public.proposal_templates for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Admin insert" on public.proposal_templates for insert to authenticated with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin update" on public.proposal_templates for update to authenticated using (public.is_admin_for_workspace(workspace_id)) with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin delete" on public.proposal_templates for delete to authenticated using (public.is_admin_for_workspace(workspace_id));

create policy "Tenant read" on public.proposal_template_items for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Admin insert" on public.proposal_template_items for insert to authenticated with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin update" on public.proposal_template_items for update to authenticated using (public.is_admin_for_workspace(workspace_id)) with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin delete" on public.proposal_template_items for delete to authenticated using (public.is_admin_for_workspace(workspace_id));

create policy "Tenant read" on public.automation_rules for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Admin insert" on public.automation_rules for insert to authenticated with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin update" on public.automation_rules for update to authenticated using (public.is_admin_for_workspace(workspace_id)) with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin delete" on public.automation_rules for delete to authenticated using (public.is_admin_for_workspace(workspace_id));

create policy "Tenant read" on public.configuration for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Admin insert" on public.configuration for insert to authenticated with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin update" on public.configuration for update to authenticated using (public.is_admin_for_workspace(workspace_id)) with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin delete" on public.configuration for delete to authenticated using (public.is_admin_for_workspace(workspace_id));

create policy "Tenant read" on public.favicons_excluded_domains for select to authenticated using (public.can_access_workspace(workspace_id));
create policy "Admin insert" on public.favicons_excluded_domains for insert to authenticated with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin update" on public.favicons_excluded_domains for update to authenticated using (public.is_admin_for_workspace(workspace_id)) with check (public.is_admin_for_workspace(workspace_id));
create policy "Admin delete" on public.favicons_excluded_domains for delete to authenticated using (public.is_admin_for_workspace(workspace_id));
