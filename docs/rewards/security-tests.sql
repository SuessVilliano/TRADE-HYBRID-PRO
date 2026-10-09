begin;
create temporary table reward_test_members as select id,row_number() over(order by id) n from auth.users order by id limit 2;
grant select on reward_test_members to authenticated;
do $$begin if (select count(*) from reward_test_members)<2 then raise exception 'Two test identities required'; end if; end$$;
insert into public.member_reward_ledger(user_id,source_event,description,asset,amount,status)
select id,'rewards-test-'||gen_random_uuid(), 'Transient verification fixture','THC',1,'pending' from reward_test_members;
select set_config('request.jwt.claim.sub',(select id::text from reward_test_members where n=1),true);
set local role authenticated;
do $$declare own_code uuid; again uuid; snapshot jsonb; begin
 if (select count(*) from public.member_reward_ledger where description='Transient verification fixture')<>1 then raise exception 'RLS leaks another member ledger'; end if;
 if has_table_privilege('authenticated','public.member_reward_ledger','INSERT') then raise exception 'Member can award rewards'; end if;
 if has_table_privilege('authenticated','public.member_reward_referrals','UPDATE') then raise exception 'Member can qualify referrals'; end if;
 own_code:=public.rewards_invite_code(); again:=public.rewards_invite_code();
 if own_code<>again then raise exception 'Invite creation is not idempotent'; end if;
 begin perform public.rewards_accept_invite(own_code); raise exception 'Self referral accepted';
 exception when raise_exception then if sqlerrm <> 'You cannot refer yourself' then raise; end if; end;
 snapshot:=public.rewards_snapshot();
 if jsonb_array_length(snapshot->'ledger')<>1 then raise exception 'Snapshot leaks another member ledger'; end if;
end$$;
reset role;
select set_config('rewards.test_invite_code',(select code::text from public.member_reward_invites where user_id=(select id from reward_test_members where n=1)),true);
select set_config('request.jwt.claim.sub',(select id::text from reward_test_members where n=2),true);
set local role authenticated;
do $$begin
 if exists(select 1 from public.member_reward_invites) then raise exception 'Invite codes leak across users'; end if;
 perform public.rewards_invite_code();
 perform public.rewards_accept_invite(current_setting('rewards.test_invite_code')::uuid);
 perform public.rewards_accept_invite(current_setting('rewards.test_invite_code')::uuid);
end$$;
reset role;
do $$begin if (select count(*) from public.member_reward_referrals where referred_id=(select id from reward_test_members where n=2))<>1 then raise exception 'Duplicate referral created'; end if; end$$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$begin
 if has_function_privilege('anon','public.rewards_snapshot()','EXECUTE') then raise exception 'Anonymous snapshots allowed'; end if;
 if has_table_privilege('anon','public.member_reward_ledger','SELECT') then raise exception 'Anonymous ledger access allowed'; end if;
end$$;
reset role;
rollback;
select 'Rewards isolation, idempotency, self-referral, write restrictions, and anonymous denial passed; fixtures rolled back' as result;
