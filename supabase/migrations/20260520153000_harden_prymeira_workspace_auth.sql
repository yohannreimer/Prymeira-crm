set check_function_bodies = off;

drop function if exists public.merge_contacts(bigint, bigint);

create or replace function public.get_note_attachments_function_url() returns text
  language plpgsql
  set search_path to 'public'
as $$
declare
  issuer text;
  function_url text;
  configured_functions_url text;
  request_headers jsonb;
  request_host text;
  request_proto text;
begin
  configured_functions_url := nullif(
    current_setting('app.functions_base_url', true),
    ''
  );

  if configured_functions_url is not null then
    return rtrim(configured_functions_url, '/') || '/delete_note_attachments';
  end if;

  request_headers := coalesce(
    nullif(current_setting('request.headers', true), '')::jsonb,
    '{}'::jsonb
  );
  request_host := request_headers ->> 'host';
  request_proto := coalesce(
    request_headers ->> 'x-forwarded-proto',
    case
      when request_host like 'localhost:%' or request_host like '127.0.0.1:%'
        then 'http'
      else 'https'
    end
  );

  if request_host is not null and request_host <> '' then
    function_url := request_proto || '://' || request_host || '/functions/v1/delete_note_attachments';

    if function_url like 'http://127.0.0.1:%' then
      return replace(
        function_url,
        'http://127.0.0.1:',
        'http://host.docker.internal:'
      );
    end if;

    if function_url like 'http://localhost:%' then
      return replace(
        function_url,
        'http://localhost:',
        'http://host.docker.internal:'
      );
    end if;

    return function_url;
  end if;

  issuer := coalesce(
    nullif(current_setting('request.jwt.claim.iss', true), ''),
    (
      coalesce(
        nullif(current_setting('request.jwt.claims', true), ''),
        '{}'
      )::jsonb ->> 'iss'
    )
  );
  issuer := nullif(issuer, '');
  if issuer is not null then
    issuer := rtrim(issuer, '/');
    if right(issuer, 8) = '/auth/v1' then
      function_url :=
        left(issuer, length(issuer) - 8) || '/functions/v1/delete_note_attachments';

      if function_url like 'http://127.0.0.1:%' then
        return replace(
          function_url,
          'http://127.0.0.1:',
          'http://host.docker.internal:'
        );
      end if;

      if function_url like 'http://localhost:%' then
        return replace(
          function_url,
          'http://localhost:',
          'http://host.docker.internal:'
        );
      end if;

      return function_url;
    end if;
  end if;

  return 'http://host.docker.internal:54321/functions/v1/delete_note_attachments';
end;
$$;

create or replace function public.merge_contacts(
  target_workspace_id uuid,
  loser_id bigint,
  winner_id bigint
) returns bigint
  language plpgsql
  security definer
  set search_path to ''
as $$
declare
  winner_contact public.contacts%rowtype;
  loser_contact public.contacts%rowtype;
  deal_record record;
  merged_emails jsonb;
  merged_phones jsonb;
  merged_tags bigint[];
  winner_emails jsonb;
  loser_emails jsonb;
  winner_phones jsonb;
  loser_phones jsonb;
  email_map jsonb;
  phone_map jsonb;
begin
  select * into winner_contact
  from public.contacts
  where id = winner_id and workspace_id = target_workspace_id;

  select * into loser_contact
  from public.contacts
  where id = loser_id and workspace_id = target_workspace_id;

  if winner_contact is null or loser_contact is null then
    raise exception 'Contact not found';
  end if;

  update public.tasks
  set contact_id = winner_id
  where contact_id = loser_id and workspace_id = target_workspace_id;

  update public.contact_notes
  set contact_id = winner_id
  where contact_id = loser_id and workspace_id = target_workspace_id;

  for deal_record in
    select id, contact_ids
    from public.deals
    where workspace_id = target_workspace_id
      and contact_ids @> array[loser_id]
  loop
    update public.deals
    set contact_ids = (
      select array(
        select distinct unnest(
          array_remove(deal_record.contact_ids, loser_id) || array[winner_id]
        )
      )
    )
    where id = deal_record.id and workspace_id = target_workspace_id;
  end loop;

  winner_emails := coalesce(winner_contact.email_jsonb, '[]'::jsonb);
  loser_emails := coalesce(loser_contact.email_jsonb, '[]'::jsonb);
  email_map := '{}'::jsonb;

  if jsonb_array_length(winner_emails) > 0 then
    for i in 0..jsonb_array_length(winner_emails)-1 loop
      email_map := email_map || jsonb_build_object(
        winner_emails->i->>'email',
        winner_emails->i
      );
    end loop;
  end if;

  if jsonb_array_length(loser_emails) > 0 then
    for i in 0..jsonb_array_length(loser_emails)-1 loop
      if not email_map ? (loser_emails->i->>'email') then
        email_map := email_map || jsonb_build_object(
          loser_emails->i->>'email',
          loser_emails->i
        );
      end if;
    end loop;
  end if;

  merged_emails := (select jsonb_agg(value) from jsonb_each(email_map));
  merged_emails := coalesce(merged_emails, '[]'::jsonb);

  winner_phones := coalesce(winner_contact.phone_jsonb, '[]'::jsonb);
  loser_phones := coalesce(loser_contact.phone_jsonb, '[]'::jsonb);
  phone_map := '{}'::jsonb;

  if jsonb_array_length(winner_phones) > 0 then
    for i in 0..jsonb_array_length(winner_phones)-1 loop
      phone_map := phone_map || jsonb_build_object(
        winner_phones->i->>'number',
        winner_phones->i
      );
    end loop;
  end if;

  if jsonb_array_length(loser_phones) > 0 then
    for i in 0..jsonb_array_length(loser_phones)-1 loop
      if not phone_map ? (loser_phones->i->>'number') then
        phone_map := phone_map || jsonb_build_object(
          loser_phones->i->>'number',
          loser_phones->i
        );
      end if;
    end loop;
  end if;

  merged_phones := (select jsonb_agg(value) from jsonb_each(phone_map));
  merged_phones := coalesce(merged_phones, '[]'::jsonb);

  merged_tags := array(
    select distinct unnest(
      coalesce(winner_contact.tags, array[]::bigint[]) ||
      coalesce(loser_contact.tags, array[]::bigint[])
    )
  );

  update public.contacts set
    avatar = coalesce(winner_contact.avatar, loser_contact.avatar),
    gender = coalesce(winner_contact.gender, loser_contact.gender),
    first_name = coalesce(winner_contact.first_name, loser_contact.first_name),
    last_name = coalesce(winner_contact.last_name, loser_contact.last_name),
    title = coalesce(winner_contact.title, loser_contact.title),
    company_id = coalesce(winner_contact.company_id, loser_contact.company_id),
    email_jsonb = merged_emails,
    phone_jsonb = merged_phones,
    linkedin_url = coalesce(winner_contact.linkedin_url, loser_contact.linkedin_url),
    background = coalesce(winner_contact.background, loser_contact.background),
    has_newsletter = coalesce(winner_contact.has_newsletter, loser_contact.has_newsletter),
    first_seen = least(coalesce(winner_contact.first_seen, loser_contact.first_seen), coalesce(loser_contact.first_seen, winner_contact.first_seen)),
    last_seen = greatest(coalesce(winner_contact.last_seen, loser_contact.last_seen), coalesce(loser_contact.last_seen, winner_contact.last_seen)),
    sales_id = coalesce(winner_contact.sales_id, loser_contact.sales_id),
    tags = merged_tags
  where id = winner_id and workspace_id = target_workspace_id;

  delete from public.contacts
  where id = loser_id and workspace_id = target_workspace_id;

  return winner_id;
end;
$$;

revoke all on function public.merge_contacts(uuid, bigint, bigint) from public;
grant all on function public.merge_contacts(uuid, bigint, bigint) to service_role;
