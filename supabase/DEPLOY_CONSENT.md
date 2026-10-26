# Deploy checklist: server-side age verification and parental consent

Order matters. Migration A is additive and safe first. Migration B is destructive and goes last.

Migration A: `supabase/migrations/20261021000000_add_consent_token_hash_columns.sql`
Migration B: `supabase/deferred/lock_profile_protected_columns.sql` (kept out of `migrations/` so
`supabase db push` can't apply it early)

## 0. Back up (Supabase dashboard, no Docker needed)

1. Dashboard → Database → Backups. Confirm a recent daily backup exists, or use
   "Create backup" / Point-in-Time Recovery if your plan offers it.
2. If your plan has no on-demand backup, export the affected tables instead: Table Editor →
   `profiles`, `barkley_memory`, `ignite_streaks` → Export to CSV.

## 1. Migration A (additive)

Apply with `supabase db push` (B is not in `migrations/`, so only A is applied) or paste the file
into the SQL editor.

Check:
```sql
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
  and column_name in ('consent_token_hash', 'parent_manage_token_hash', 'parent_manage_link_sent_at');
-- expect 3 rows
```

## 2. Secrets

Dashboard → Edge Functions → Secrets (or `supabase secrets set`):

- `RESEND_API_KEY`
- `CONSENT_EMAIL_FROM` (a sender verified in Resend)
- `APP_URL` (e.g. `https://yourapp.com`, no trailing slash; used in the emailed links)

## 3. Deploy functions

```
supabase functions deploy verify-age
supabase functions deploy parent-account-action
```

Between this step and step 4 the old frontend is live against the new functions. Old consent links
(plaintext token) stop working and new consent requests from the old frontend won't send emails.
Keep the gap short.

## 4. Deploy frontend

## 5. Test (Migration A applied, B not yet)

- 16+ signup: verify-age returns `verified`.
- 13-15 signup with a parent email: parent receives the email, the link opens, approval works, the
  "consent confirmed" email with a dashboard link arrives, and the child is then verified.
- Parent dashboard: data loads; "revoke" works; "resend link" works (cooldown 60 s).
- Parent dashboard "delete": the child's `profiles`, `barkley_memory`, `ignite_streaks` rows and auth
  user are all gone.
- Child browser can still load their own profile (no errors in the console).

## 6. Pre-migration counts (run just before B)

How many profiles B will reset (the widened rule), and why:
```sql
select
  count(*) filter (where parent_consent_given and (age_bracket = '13-15' or age_bracket is null)) as consent_given_13_15_or_null,
  count(*) filter (where age_bracket = '13-15' and age_verified)                                  as verified_13_15,
  count(*) filter (where age_bracket is null and age_verified)                                     as verified_null_bracket,
  count(*) filter (where
        (parent_consent_given and (age_bracket = '13-15' or age_bracket is null))
     or (age_bracket = '13-15' and age_verified)
     or (age_bracket is null and age_verified))                                                    as total_reset
from public.profiles;
```
(The first three overlap; `total_reset` is the number of distinct rows B will touch.)

Orphaned rows B will delete before adding the foreign keys:
```sql
select
  (select count(*) from public.barkley_memory where student_id not in (select id from auth.users)) as orphan_sessions,
  (select count(*) from public.ignite_streaks where user_id not in (select id from auth.users))     as orphan_streaks;
```

## 7. Migration B (destructive)

Move `supabase/deferred/lock_profile_protected_columns.sql` to
`supabase/migrations/20261021000001_lock_profile_protected_columns.sql` and run `supabase db push`
(or paste it into the SQL editor).

Check:
```sql
-- no 13-15 profile may be verified without a recorded consent
select count(*) from public.profiles
where (age_bracket = '13-15' and age_verified) and parent_consent_at is null;  -- expect 0

select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'profiles' and column_name = 'consent_token'; -- expect 0 rows

select conname from pg_constraint
where conname in ('barkley_memory_student_id_fkey', 'ignite_streaks_user_id_fkey'); -- expect 2 rows
```

## 8. Test again (B applied)

- Repeat everything in step 5. The frontend only selects granted columns, so a console error here
  means a query somewhere selects `*` or a hash column.
- From the browser console as a signed-in user, confirm self-service writes are blocked:
  `supabase.from('profiles').update({ age_verified: true }).eq('user_id', <your id>)` must error
  (permission denied).
- Previously consented 13-15 users are now unverified and must re-request consent. Expect support
  questions.

## Rollback

A is harmless to leave in place. B cannot be reverted cleanly (the dropped column and the resets are
gone), so restore from the step 0 backup if something is badly wrong.
