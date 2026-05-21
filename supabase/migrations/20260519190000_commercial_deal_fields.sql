alter table public.deals
    add column deal_type text not null default 'consultative',
    add column probability smallint default 25,
    add column source text,
    add column lost_reason text,
    add column next_action_at timestamp with time zone,
    add column last_activity_at timestamp with time zone default now(),
    add constraint deals_probability_range check (
        probability is null or (probability >= 0 and probability <= 100)
    );
