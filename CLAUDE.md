# CLAUDE.md

Guidance for working in the dose-academy repo (React + Vite + Supabase).

## Working conventions

- **Never run git commands** (`add`, `commit`, `push`, `pull`, `rm`). The developer runs all git commands.
- **Show each diff one at a time** and wait for approval before applying.
- **Ask before running any bash command.**
- **Explain the plan before editing**, and keep changes scoped to the request.

## Environment variables

- `.env` is gitignored and must **never** be committed. See `.env.example` for the shape.
- Production values live in **Vercel → app-doseacademy → Environment Variables**:
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
- **Never** put a `service_role` or any other secret key in a `VITE_` variable — anything
  `VITE_`-prefixed is bundled into the client and publicly visible.

## Production domain

- The app is live at **https://learn.getdose.app** (not `app-doseacademy.vercel.app`).
- The Supabase `APP_URL` secret is set to `https://learn.getdose.app`.

## Sign-out

- All sign-out goes through `src/hooks/useSignOut.ts`, which calls `supabase.auth.signOut()`
  and then does a full-page reload to `/auth`.
- It **intentionally does not** clear localStorage progress keys (see known issue below) —
  the reload is what drops in-memory state and the React Query cache.

## Known issue / open follow-up: local-only progress

SPARK/WAVE/RSD/Squad progress (`dose-academy-state`, `dose-wave-*`, `dose-rsd-stats`,
`dose-squad-stats`) is stored **only in localStorage**, is **not tied to the signed-in user**,
and has **no Supabase copy**. Consequences:

- Students on a shared device see each other's progress.
- Progress is lost on a new device or when the browser is cleared.

This move to Supabase is in progress on the `feat/progress-to-supabase` branch —
see **Progress-to-Supabase status** below for current state and remaining work.
It must be finished **before any school pilot**.

## Progress-to-Supabase status

Tracks the migration of local-only progress to per-user Supabase rows.

**Done (schema + RLS, on `feat/progress-to-supabase`):**
- Migrations `20261030000000` (adds `teacher` to the `app_role` enum) and
  `20261030000100` (tables `student_progress`, `user_settings`, `enrollments`;
  the `is_teacher_of` helper; enrollment-scoped teacher/admin SELECT on
  `student_progress`, `ignite_streaks`, `barkley_memory`; explicit DML grants).
- RLS verified locally: **14/14 checks passing**.

**Decisions:**
- No import of old localStorage progress — the **server row is the source of
  truth**; a default row is created on first sign-in.
- `dose-wave-session` (the in-progress timer) **stays local**.
- Teachers can read `barkley_memory.task_input` (student-written task text) —
  clinical sign-off obtained.
- Parents read progress **only** via the `parent-account-action` edge function
  (token-validated), never directly.
- **No moderator access** to student data.

**How to test:** `supabase/tests/rls_progress_test.sql` (header explains how to
run it against the local stack).

**Next — client phase, stages 1–5:**
1. `AppContext` — hydrate from / upsert to `student_progress`.
2. `SettingsContext` — move prefs to `user_settings`.
3. Parent `get_progress` action in `parent-account-action`.
4. Teacher dashboard gated on the `teacher` role.
5. IGNITE notice: "Your teacher can see the tasks you add here."

**Known gap:** no admin UI for enrollments yet — create enrollment rows via SQL
for the pilot.

**Rule:** never `link` or `push` to a remote Supabase project from this branch;
all testing is local (`supabase start` / `supabase db reset --local`).

## Naming: `barkley_memory` is Slick's session table

The companion/chatbot in DOSE Academy is **Slick**. The Supabase table
`barkley_memory` is a **legacy name** from an earlier "Barkley" concept —
**do not rename it** (it would break the deployed schema, edge functions, and
`src/integrations/supabase/types.ts`). It stores IGNITE session rows written
**only** by `src/hooks/useIgnite.ts`: `student_id`, `age_group`, `task_input`
(the student's free-typed task), `steps_completed`, `spark_handoff`,
`session_completed`, `streak_day`, `created_at`. It is **not** a Slick chat log —
chat transcripts live in `chat_conversations` / `chat_messages`. The only
student-authored free text here is `task_input`.
