--
-- Functions
-- This file declares all PL/pgSQL functions in the public schema.
--

CREATE OR REPLACE FUNCTION "public"."cleanup_note_attachments"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
    DECLARE
      payload jsonb;
      request_headers jsonb;
      auth_header text;
    BEGIN
      request_headers := coalesce(
        nullif(current_setting('request.headers', true), '')::jsonb,
        '{}'::jsonb
      );
      auth_header := request_headers ->> 'authorization';

      IF auth_header IS NULL OR auth_header = '' THEN
        IF TG_OP = 'DELETE' THEN
          RETURN OLD;
        END IF;

        RETURN NEW;
      END IF;

      payload := jsonb_build_object(
        'old_record', OLD,
        'record', NEW,
        'type', TG_OP
      );

      PERFORM net.http_post(
        url := public.get_note_attachments_function_url(),
        body := payload,
        params := '{}'::jsonb,
        headers := jsonb_build_object(
          'Content-Type',
          'application/json',
          'Authorization',
          auth_header
        ),
        timeout_milliseconds := 10000
      );

      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      END IF;

      RETURN NEW;
    END;
    $$;

CREATE OR REPLACE FUNCTION "public"."get_avatar_for_email"("email" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare email_hash text;
declare gravatar_url text;
declare gravatar_status int8;
declare email_domain text;
declare favicon_url text;
declare domain_status int8;

begin
    -- Try to fetch a gravatar image
    email_hash = encode(extensions.digest(email, 'sha256'), 'hex');
    gravatar_url = concat('https://www.gravatar.com/avatar/', email_hash, '?d=404');

    select status from extensions.http_get(gravatar_url) into gravatar_status;

    if gravatar_status = 200 then
        return gravatar_url;
    end if;

    -- Fallback to email's domain favicon if not excluded
    email_domain = split_part(email, '@', 2);
    return get_domain_favicon(email_domain);
exception
    when others then
        return 'ERROR';
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_domain_favicon"("domain_name" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare domain_status int8;

begin
    if exists (select from favicons_excluded_domains as fav where fav.domain = domain_name) then
        return null;
    end if;

    return concat(
        'https://favicon.show/',
        (regexp_matches(domain_name, '^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)', 'i'))[1]
    );
end;
$$;

CREATE OR REPLACE FUNCTION "public"."get_note_attachments_function_url"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
    DECLARE
      issuer text;
      function_url text;
      configured_functions_url text;
      request_headers jsonb;
      request_host text;
      request_proto text;
    BEGIN
      configured_functions_url := nullif(
        current_setting('app.functions_base_url', true),
        ''
      );

      IF configured_functions_url IS NOT NULL THEN
        RETURN rtrim(configured_functions_url, '/') || '/delete_note_attachments';
      END IF;

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

      IF request_host IS NOT NULL AND request_host <> '' THEN
        function_url := request_proto || '://' || request_host || '/functions/v1/delete_note_attachments';

        IF function_url LIKE 'http://127.0.0.1:%' THEN
          RETURN replace(
            function_url,
            'http://127.0.0.1:',
            'http://host.docker.internal:'
          );
        END IF;

        IF function_url LIKE 'http://localhost:%' THEN
          RETURN replace(
            function_url,
            'http://localhost:',
            'http://host.docker.internal:'
          );
        END IF;

        RETURN function_url;
      END IF;

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
      IF issuer IS NOT NULL THEN
        issuer := rtrim(issuer, '/');
        IF right(issuer, 8) = '/auth/v1' THEN
          function_url :=
            left(issuer, length(issuer) - 8) || '/functions/v1/delete_note_attachments';

          IF function_url LIKE 'http://127.0.0.1:%' THEN
            RETURN replace(
              function_url,
              'http://127.0.0.1:',
              'http://host.docker.internal:'
            );
          END IF;

          IF function_url LIKE 'http://localhost:%' THEN
            RETURN replace(
              function_url,
              'http://localhost:',
              'http://host.docker.internal:'
            );
          END IF;

          RETURN function_url;
        END IF;
      END IF;

      RETURN 'http://host.docker.internal:54321/functions/v1/delete_note_attachments';
    END;
    $$;

CREATE OR REPLACE FUNCTION "public"."handle_company_saved"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
declare company_logo text;

begin
    if new.logo is not null then
        return new;
    end if;

    company_logo = get_domain_favicon(new.website);
    if company_logo is null then
        return new;
    end if;

    new.logo = concat('{"src":"', company_logo, '","title":"Company favicon"}');
    return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."handle_contact_note_created_or_updated"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  update public.contacts
  set last_seen = new.date
  where contacts.id = new.contact_id
    and contacts.workspace_id = new.workspace_id
    and contacts.last_seen < new.date;
  return new;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."handle_contact_saved"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$declare contact_avatar text;
declare emails_length int8;
declare item jsonb;

begin
    if new.avatar is not null then
        return new;
    end if;

    select coalesce(jsonb_array_length(new.email_jsonb), 0) into emails_length;

    if emails_length = 0 then
        return new;
    end if;

    for item in select jsonb_array_elements(new.email_jsonb)
    loop
        select public.get_avatar_for_email(item->>'email') into contact_avatar;
        if (contact_avatar is not null) then
            exit;
        end if;
    end loop;

    if contact_avatar is null then
        return new;
    end if;

    new.avatar = concat('{"src":"', contact_avatar, '"}');
    return new;
end;$$;

CREATE OR REPLACE FUNCTION "public"."current_clerk_user_id"() RETURNS text
    LANGUAGE "sql"
    STABLE
    SET "search_path" TO ''
    AS $$
  select nullif(auth.jwt() ->> 'sub', '');
$$;

CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  return exists (
    select 1
    from public.sales
    where clerk_user_id = public.current_clerk_user_id()
      and disabled = false
      and (
        administrator = true
        or workspace_role in ('admin', 'administrator', 'owner')
        or product_role in ('admin', 'administrator', 'owner')
      )
  );
end;
$$;

CREATE OR REPLACE FUNCTION "public"."can_access_workspace"("target_workspace_id" uuid) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if target_workspace_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.sales
    where workspace_id = target_workspace_id
      and clerk_user_id = public.current_clerk_user_id()
      and disabled = false
  );
end;
$$;

CREATE OR REPLACE FUNCTION "public"."current_sale_id"("target_workspace_id" uuid) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  sale_id bigint;
begin
  if target_workspace_id is null then
    return null;
  end if;

  select id into sale_id
  from public.sales
  where workspace_id = target_workspace_id
    and clerk_user_id = public.current_clerk_user_id()
    and disabled = false
  order by id
  limit 1;

  return sale_id;
end;
$$;

CREATE OR REPLACE FUNCTION "public"."is_admin_for_workspace"("target_workspace_id" uuid) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  if target_workspace_id is null then
    return false;
  end if;

  return exists (
    select 1
    from public.sales
    where workspace_id = target_workspace_id
      and clerk_user_id = public.current_clerk_user_id()
      and disabled = false
      and (
        administrator = true
        or workspace_role in ('admin', 'administrator', 'owner')
        or product_role in ('admin', 'administrator', 'owner')
      )
  );
end;
$$;

CREATE OR REPLACE FUNCTION "public"."storage_workspace_id"("object_name" text) RETURNS uuid
    LANGUAGE "plpgsql"
    IMMUTABLE
    SET "search_path" TO ''
    AS $$
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

CREATE OR REPLACE FUNCTION "public"."workspace_has_company"("target_workspace_id" uuid, "target_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_id is null or exists (
    select 1 from public.companies
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION "public"."workspace_has_contact"("target_workspace_id" uuid, "target_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_id is null or exists (
    select 1 from public.contacts
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION "public"."workspace_has_contacts"("target_workspace_id" uuid, "target_ids" bigint[]) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_ids is null or not exists (
    select 1
    from unnest(target_ids) as contact_id
    where not public.workspace_has_contact(target_workspace_id, contact_id)
  );
$$;

CREATE OR REPLACE FUNCTION "public"."workspace_has_deal"("target_workspace_id" uuid, "target_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_id is null or exists (
    select 1 from public.deals
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION "public"."workspace_has_lead"("target_workspace_id" uuid, "target_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_id is null or exists (
    select 1 from public.leads
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION "public"."workspace_has_pipeline"("target_workspace_id" uuid, "target_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_id is null or exists (
    select 1 from public.pipelines
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION "public"."workspace_has_sale"("target_workspace_id" uuid, "target_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_id is null or exists (
    select 1 from public.sales
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION "public"."workspace_has_automation_run"("target_workspace_id" uuid, "target_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_id is null or exists (
    select 1 from public.automation_runs
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION "public"."workspace_has_proposal_template"("target_workspace_id" uuid, "target_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_id is null or exists (
    select 1 from public.proposal_templates
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION "public"."workspace_has_proposal"("target_workspace_id" uuid, "target_id" bigint) RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
  select target_id is null or exists (
    select 1 from public.proposals
    where id = target_id and workspace_id = target_workspace_id
  );
$$;

CREATE OR REPLACE FUNCTION "public"."merge_contacts"("target_workspace_id" uuid, "loser_id" bigint, "winner_id" bigint) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
DECLARE
  winner_contact public.contacts%ROWTYPE;
  loser_contact public.contacts%ROWTYPE;
  deal_record RECORD;
  merged_emails jsonb;
  merged_phones jsonb;
  merged_tags bigint[];
  winner_emails jsonb;
  loser_emails jsonb;
  winner_phones jsonb;
  loser_phones jsonb;
  email_map jsonb;
  phone_map jsonb;
BEGIN
  SELECT * INTO winner_contact
  FROM public.contacts
  WHERE id = winner_id AND workspace_id = target_workspace_id;

  SELECT * INTO loser_contact
  FROM public.contacts
  WHERE id = loser_id AND workspace_id = target_workspace_id;

  IF winner_contact IS NULL OR loser_contact IS NULL THEN
    RAISE EXCEPTION 'Contact not found';
  END IF;

  UPDATE public.tasks
  SET contact_id = winner_id
  WHERE contact_id = loser_id AND workspace_id = target_workspace_id;

  UPDATE public.contact_notes
  SET contact_id = winner_id
  WHERE contact_id = loser_id AND workspace_id = target_workspace_id;

  FOR deal_record IN
    SELECT id, contact_ids
    FROM public.deals
    WHERE workspace_id = target_workspace_id
      AND contact_ids @> ARRAY[loser_id]
  LOOP
    UPDATE public.deals
    SET contact_ids = (
      SELECT ARRAY(
        SELECT DISTINCT unnest(
          array_remove(deal_record.contact_ids, loser_id) || ARRAY[winner_id]
        )
      )
    )
    WHERE id = deal_record.id AND workspace_id = target_workspace_id;
  END LOOP;

  winner_emails := COALESCE(winner_contact.email_jsonb, '[]'::jsonb);
  loser_emails := COALESCE(loser_contact.email_jsonb, '[]'::jsonb);
  email_map := '{}'::jsonb;

  IF jsonb_array_length(winner_emails) > 0 THEN
    FOR i IN 0..jsonb_array_length(winner_emails)-1 LOOP
      email_map := email_map || jsonb_build_object(
        winner_emails->i->>'email',
        winner_emails->i
      );
    END LOOP;
  END IF;

  IF jsonb_array_length(loser_emails) > 0 THEN
    FOR i IN 0..jsonb_array_length(loser_emails)-1 LOOP
      IF NOT email_map ? (loser_emails->i->>'email') THEN
        email_map := email_map || jsonb_build_object(
          loser_emails->i->>'email',
          loser_emails->i
        );
      END IF;
    END LOOP;
  END IF;

  merged_emails := (SELECT jsonb_agg(value) FROM jsonb_each(email_map));
  merged_emails := COALESCE(merged_emails, '[]'::jsonb);

  winner_phones := COALESCE(winner_contact.phone_jsonb, '[]'::jsonb);
  loser_phones := COALESCE(loser_contact.phone_jsonb, '[]'::jsonb);
  phone_map := '{}'::jsonb;

  IF jsonb_array_length(winner_phones) > 0 THEN
    FOR i IN 0..jsonb_array_length(winner_phones)-1 LOOP
      phone_map := phone_map || jsonb_build_object(
        winner_phones->i->>'number',
        winner_phones->i
      );
    END LOOP;
  END IF;

  IF jsonb_array_length(loser_phones) > 0 THEN
    FOR i IN 0..jsonb_array_length(loser_phones)-1 LOOP
      IF NOT phone_map ? (loser_phones->i->>'number') THEN
        phone_map := phone_map || jsonb_build_object(
          loser_phones->i->>'number',
          loser_phones->i
        );
      END IF;
    END LOOP;
  END IF;

  merged_phones := (SELECT jsonb_agg(value) FROM jsonb_each(phone_map));
  merged_phones := COALESCE(merged_phones, '[]'::jsonb);

  merged_tags := ARRAY(
    SELECT DISTINCT unnest(
      COALESCE(winner_contact.tags, ARRAY[]::bigint[]) ||
      COALESCE(loser_contact.tags, ARRAY[]::bigint[])
    )
  );

  UPDATE public.contacts SET
    avatar = COALESCE(winner_contact.avatar, loser_contact.avatar),
    gender = COALESCE(winner_contact.gender, loser_contact.gender),
    first_name = COALESCE(winner_contact.first_name, loser_contact.first_name),
    last_name = COALESCE(winner_contact.last_name, loser_contact.last_name),
    title = COALESCE(winner_contact.title, loser_contact.title),
    company_id = COALESCE(winner_contact.company_id, loser_contact.company_id),
    email_jsonb = merged_emails,
    phone_jsonb = merged_phones,
    linkedin_url = COALESCE(winner_contact.linkedin_url, loser_contact.linkedin_url),
    background = COALESCE(winner_contact.background, loser_contact.background),
    has_newsletter = COALESCE(winner_contact.has_newsletter, loser_contact.has_newsletter),
    first_seen = LEAST(COALESCE(winner_contact.first_seen, loser_contact.first_seen), COALESCE(loser_contact.first_seen, winner_contact.first_seen)),
    last_seen = GREATEST(COALESCE(winner_contact.last_seen, loser_contact.last_seen), COALESCE(loser_contact.last_seen, winner_contact.last_seen)),
    sales_id = COALESCE(winner_contact.sales_id, loser_contact.sales_id),
    tags = merged_tags
  WHERE id = winner_id AND workspace_id = target_workspace_id;

  DELETE FROM public.contacts
  WHERE id = loser_id AND workspace_id = target_workspace_id;

  RETURN winner_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."lowercase_email_jsonb"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.email_jsonb IS NOT NULL THEN
    NEW.email_jsonb = COALESCE((
      SELECT jsonb_agg(
        jsonb_set(elem, '{email}', to_jsonb(LOWER(elem->>'email')))
      )
      FROM jsonb_array_elements(NEW.email_jsonb) AS elem
    ), '[]'::jsonb);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."set_sales_id_default"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO ''
    AS $$
BEGIN
  IF NEW.sales_id IS NULL AND NEW.workspace_id IS NOT NULL THEN
    NEW.sales_id := public.current_sale_id(NEW.workspace_id);
  END IF;
  RETURN NEW;
END;
$$;
