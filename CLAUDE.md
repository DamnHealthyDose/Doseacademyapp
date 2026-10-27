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

This needs to move to Supabase, keyed by user, **before any school pilot**.
