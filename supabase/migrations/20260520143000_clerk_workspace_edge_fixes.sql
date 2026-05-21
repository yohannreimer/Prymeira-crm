set check_function_bodies = off;

create or replace function public.storage_workspace_id(object_name text) returns uuid
  language plpgsql
  immutable
  set search_path to ''
as $$
declare
  workspace_segment text;
begin
  workspace_segment := split_part(object_name, '/', 1);
  if workspace_segment is null or workspace_segment = '' then
    return null;
  end if;

  return workspace_segment::uuid;
exception
  when invalid_text_representation then
    return null;
end;
$$;

create or replace function public.workspace_has_company(target_workspace_id uuid, target_id bigint) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_id is null or exists (
    select 1 from public.companies
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

create or replace function public.workspace_has_contact(target_workspace_id uuid, target_id bigint) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_id is null or exists (
    select 1 from public.contacts
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

create or replace function public.workspace_has_contacts(target_workspace_id uuid, target_ids bigint[]) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_ids is null or not exists (
    select 1
    from unnest(target_ids) as contact_id
    where not public.workspace_has_contact(target_workspace_id, contact_id)
  );
$$;

create or replace function public.workspace_has_deal(target_workspace_id uuid, target_id bigint) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_id is null or exists (
    select 1 from public.deals
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

create or replace function public.workspace_has_lead(target_workspace_id uuid, target_id bigint) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_id is null or exists (
    select 1 from public.leads
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

create or replace function public.workspace_has_pipeline(target_workspace_id uuid, target_id bigint) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_id is null or exists (
    select 1 from public.pipelines
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

create or replace function public.workspace_has_sale(target_workspace_id uuid, target_id bigint) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_id is null or exists (
    select 1 from public.sales
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

create or replace function public.workspace_has_automation_run(target_workspace_id uuid, target_id bigint) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_id is null or exists (
    select 1 from public.automation_runs
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

create or replace function public.workspace_has_proposal_template(target_workspace_id uuid, target_id bigint) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_id is null or exists (
    select 1 from public.proposal_templates
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

create or replace function public.workspace_has_proposal(target_workspace_id uuid, target_id bigint) returns boolean
  language sql
  stable
  security definer
  set search_path to ''
as $$
  select target_id is null or exists (
    select 1 from public.proposals
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

grant all on function public.storage_workspace_id(text) to anon, authenticated, service_role;
grant all on function public.workspace_has_company(uuid, bigint) to anon, authenticated, service_role;
grant all on function public.workspace_has_contact(uuid, bigint) to anon, authenticated, service_role;
grant all on function public.workspace_has_contacts(uuid, bigint[]) to anon, authenticated, service_role;
grant all on function public.workspace_has_deal(uuid, bigint) to anon, authenticated, service_role;
grant all on function public.workspace_has_lead(uuid, bigint) to anon, authenticated, service_role;
grant all on function public.workspace_has_pipeline(uuid, bigint) to anon, authenticated, service_role;
grant all on function public.workspace_has_sale(uuid, bigint) to anon, authenticated, service_role;
grant all on function public.workspace_has_automation_run(uuid, bigint) to anon, authenticated, service_role;
grant all on function public.workspace_has_proposal_template(uuid, bigint) to anon, authenticated, service_role;
grant all on function public.workspace_has_proposal(uuid, bigint) to anon, authenticated, service_role;

drop policy if exists "Attachments 1mt4rzk_0" on storage.objects;
drop policy if exists "Attachments 1mt4rzk_1" on storage.objects;
drop policy if exists "Attachments 1mt4rzk_3" on storage.objects;
drop policy if exists "Attachments tenant read" on storage.objects;
drop policy if exists "Attachments tenant insert" on storage.objects;
drop policy if exists "Attachments tenant delete" on storage.objects;

create policy "Attachments tenant read" on storage.objects for select to authenticated using (
  bucket_id = 'attachments'
  and public.can_access_workspace(public.storage_workspace_id(name))
);

create policy "Attachments tenant insert" on storage.objects for insert to authenticated with check (
  bucket_id = 'attachments'
  and public.can_access_workspace(public.storage_workspace_id(name))
);

create policy "Attachments tenant delete" on storage.objects for delete to authenticated using (
  bucket_id = 'attachments'
  and public.can_access_workspace(public.storage_workspace_id(name))
);

drop policy if exists "Tenant insert" on public.companies;
drop policy if exists "Tenant update" on public.companies;
create policy "Tenant insert" on public.companies for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Tenant update" on public.companies for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Tenant insert" on public.contacts;
drop policy if exists "Tenant update" on public.contacts;
create policy "Tenant insert" on public.contacts for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_company(workspace_id, company_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Tenant update" on public.contacts for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_company(workspace_id, company_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Tenant insert" on public.contact_notes;
drop policy if exists "Tenant update" on public.contact_notes;
create policy "Tenant insert" on public.contact_notes for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_contact(workspace_id, contact_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Tenant update" on public.contact_notes for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_contact(workspace_id, contact_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Tenant insert" on public.deals;
drop policy if exists "Tenant update" on public.deals;
create policy "Tenant insert" on public.deals for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_company(workspace_id, company_id) and public.workspace_has_contacts(workspace_id, contact_ids) and public.workspace_has_pipeline(workspace_id, pipeline_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Tenant update" on public.deals for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_company(workspace_id, company_id) and public.workspace_has_contacts(workspace_id, contact_ids) and public.workspace_has_pipeline(workspace_id, pipeline_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Tenant insert" on public.deal_notes;
drop policy if exists "Tenant update" on public.deal_notes;
create policy "Tenant insert" on public.deal_notes for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_deal(workspace_id, deal_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Tenant update" on public.deal_notes for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_deal(workspace_id, deal_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Tenant insert" on public.leads;
drop policy if exists "Tenant update" on public.leads;
create policy "Tenant insert" on public.leads for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Tenant update" on public.leads for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Tenant insert" on public.automation_runs;
drop policy if exists "Tenant update" on public.automation_runs;
create policy "Tenant insert" on public.automation_runs for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Tenant update" on public.automation_runs for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Tenant insert" on public.proposals;
drop policy if exists "Tenant update" on public.proposals;
create policy "Tenant insert" on public.proposals for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_deal(workspace_id, deal_id) and public.workspace_has_company(workspace_id, company_id) and public.workspace_has_contact(workspace_id, contact_id) and public.workspace_has_proposal_template(workspace_id, template_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Tenant update" on public.proposals for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_deal(workspace_id, deal_id) and public.workspace_has_company(workspace_id, company_id) and public.workspace_has_contact(workspace_id, contact_id) and public.workspace_has_proposal_template(workspace_id, template_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Tenant insert" on public.proposal_items;
drop policy if exists "Tenant update" on public.proposal_items;
create policy "Tenant insert" on public.proposal_items for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_proposal(workspace_id, proposal_id));
create policy "Tenant update" on public.proposal_items for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_proposal(workspace_id, proposal_id));

drop policy if exists "Tenant insert" on public.tasks;
drop policy if exists "Tenant update" on public.tasks;
create policy "Tenant insert" on public.tasks for insert to authenticated with check (public.can_access_workspace(workspace_id) and public.workspace_has_contact(workspace_id, contact_id) and public.workspace_has_lead(workspace_id, lead_id) and public.workspace_has_deal(workspace_id, deal_id) and public.workspace_has_automation_run(workspace_id, automation_run_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Tenant update" on public.tasks for update to authenticated using (public.can_access_workspace(workspace_id)) with check (public.can_access_workspace(workspace_id) and public.workspace_has_contact(workspace_id, contact_id) and public.workspace_has_lead(workspace_id, lead_id) and public.workspace_has_deal(workspace_id, deal_id) and public.workspace_has_automation_run(workspace_id, automation_run_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Admin insert" on public.sales_goals;
drop policy if exists "Admin update" on public.sales_goals;
create policy "Admin insert" on public.sales_goals for insert to authenticated with check (public.is_admin_for_workspace(workspace_id) and public.workspace_has_sale(workspace_id, sales_id));
create policy "Admin update" on public.sales_goals for update to authenticated using (public.is_admin_for_workspace(workspace_id)) with check (public.is_admin_for_workspace(workspace_id) and public.workspace_has_sale(workspace_id, sales_id));

drop policy if exists "Admin insert" on public.proposal_template_items;
drop policy if exists "Admin update" on public.proposal_template_items;
create policy "Admin insert" on public.proposal_template_items for insert to authenticated with check (public.is_admin_for_workspace(workspace_id) and public.workspace_has_proposal_template(workspace_id, template_id));
create policy "Admin update" on public.proposal_template_items for update to authenticated using (public.is_admin_for_workspace(workspace_id)) with check (public.is_admin_for_workspace(workspace_id) and public.workspace_has_proposal_template(workspace_id, template_id));
