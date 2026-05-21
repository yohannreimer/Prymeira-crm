--
-- Storage
-- This file declares storage bucket policies.
--

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
