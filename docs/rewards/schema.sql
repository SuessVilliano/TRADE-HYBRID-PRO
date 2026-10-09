create schema if not exists rewards_private;
revoke all on schema rewards_private from public, anon;
grant usage on schema rewards_private to authenticated;
create table public.member_reward_invites (
 user_id uuid primary key references auth.users(id) on delete cascade default auth.uid(),
 code uuid not null unique default gen_random_uuid(), created_at timestamptz not null default now()
);
create table public.member_reward_referrals (
 id uuid primary key default gen_random_uuid(), inviter_id uuid not null references auth.users(id),
 referred_id uuid not null unique references auth.users(id),
 status text not null default 'awaiting_purchase' check(status in ('awaiting_purchase','refund_window','qualified','reversed')),
 created_at timestamptz not null default now(), check(inviter_id <> referred_id)
);
create index member_reward_referrals_inviter on public.member_reward_referrals(inviter_id);
create table public.member_reward_ledger (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id),
 source_event text not null unique, description text not null,
 asset text not null check(asset in ('THC','USDC','credit','perk')),
 amount numeric(20,9) not null check(amount > 0),
 status text not null check(status in ('pending','approved','paid','reversed')),
 created_at timestamptz not null default now(), transaction_signature text,
 check(status <> 'paid' or transaction_signature is not null or asset in ('credit','perk'))
);
create index member_reward_ledger_user_date on public.member_reward_ledger(user_id,created_at desc);
create table public.member_reward_campaigns (
 id uuid primary key default gen_random_uuid(), title text not null,
 status text not null default 'draft' check(status in ('draft','active','paused','closed')),
 goal integer not null check(goal > 0), funded_usdc numeric(20,6) not null default 0 check(funded_usdc >= 0),
 funded_thc numeric(20,9) not null default 0 check(funded_thc >= 0),
 description text not null, created_at timestamptz not null default now()
);
insert into public.member_reward_campaigns(title,goal,description) values
 ('Learn together',100,'Pilot goal: 100 members complete an Academy lesson. Rewards and activation await a funded campaign.');
alter table public.member_reward_invites enable row level security;
alter table public.member_reward_referrals enable row level security;
alter table public.member_reward_ledger enable row level security;
alter table public.member_reward_campaigns enable row level security;
revoke all on public.member_reward_invites,public.member_reward_referrals,public.member_reward_ledger,public.member_reward_campaigns from anon,authenticated;
grant select on public.member_reward_invites,public.member_reward_referrals,public.member_reward_ledger,public.member_reward_campaigns to authenticated;
grant insert(user_id) on public.member_reward_invites to authenticated;
grant all on public.member_reward_invites,public.member_reward_referrals,public.member_reward_ledger,public.member_reward_campaigns to service_role;
create policy invites_own_read on public.member_reward_invites for select to authenticated using(user_id=(select auth.uid()));
create policy invites_own_create on public.member_reward_invites for insert to authenticated with check(user_id=(select auth.uid()));
create policy referrals_own_read on public.member_reward_referrals for select to authenticated using(inviter_id=(select auth.uid()));
create policy ledger_own_read on public.member_reward_ledger for select to authenticated using(user_id=(select auth.uid()));
create policy campaigns_member_read on public.member_reward_campaigns for select to authenticated using(true);
create function public.rewards_invite_code() returns uuid language plpgsql security invoker set search_path='' as $$
declare result uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 insert into public.member_reward_invites(user_id) values(auth.uid()) on conflict(user_id) do nothing;
 select code into result from public.member_reward_invites where user_id=auth.uid(); return result;
end $$;
create function rewards_private.accept_invite(invite_code uuid) returns text language plpgsql security definer set search_path='' as $$
declare inviter uuid; member uuid := auth.uid();
begin
 if member is null then raise exception 'Sign in required'; end if;
 select user_id into inviter from public.member_reward_invites where code=invite_code;
 if inviter is null then raise exception 'Invitation not found'; end if;
 if inviter=member then raise exception 'You cannot refer yourself'; end if;
 insert into public.member_reward_referrals(inviter_id,referred_id) values(inviter,member) on conflict(referred_id) do nothing;
 return 'recorded';
end $$;
create function public.rewards_accept_invite(invite_code uuid) returns text language sql security invoker set search_path='' as $$select rewards_private.accept_invite(invite_code)$$;
create function rewards_private.snapshot() returns jsonb language plpgsql security definer set search_path='' as $$
declare member uuid := auth.uid();
begin
 if member is null then raise exception 'Sign in required'; end if;
 return jsonb_build_object(
  'onboarding',exists(select 1 from public.member_onboarding where user_id=member and completed_at is not null),
  'lessons',(select count(*) from public.academy_lesson_progress where user_id=member and status='completed'),
  'quizzes',(select count(distinct lesson_id) from public.academy_quiz_attempts where user_id=member and passed=true),
  'credentials',(select count(*) from public.academy_credentials_issued where user_id=member),
  'communityLearners',(select count(distinct user_id) from public.academy_lesson_progress where status='completed'),
  'inviteCode',(select code from public.member_reward_invites where user_id=member),
  'referrals',coalesce((select jsonb_agg(jsonb_build_object('id',id,'status',status,'created_at',created_at) order by created_at desc) from public.member_reward_referrals where inviter_id=member),'[]'::jsonb),
  'ledger',coalesce((select jsonb_agg(to_jsonb(l) - 'user_id' - 'source_event' order by created_at desc) from (select * from public.member_reward_ledger where user_id=member order by created_at desc limit 100) l),'[]'::jsonb),
  'campaigns',coalesce((select jsonb_agg(to_jsonb(c)) from public.member_reward_campaigns c where status <> 'closed'),'[]'::jsonb)
 );
end $$;
create function public.rewards_snapshot() returns jsonb language sql security invoker set search_path='' as $$select rewards_private.snapshot()$$;
revoke all on function public.rewards_invite_code(),public.rewards_accept_invite(uuid),public.rewards_snapshot(),rewards_private.accept_invite(uuid),rewards_private.snapshot() from public,anon;
grant execute on function public.rewards_invite_code(),public.rewards_accept_invite(uuid),public.rewards_snapshot(),rewards_private.accept_invite(uuid),rewards_private.snapshot() to authenticated;
