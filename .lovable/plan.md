

# Disable "Study with a Friend" & Add Coming Soon

## Why
Mode B (invite a friend) involves real peer-to-peer connections which pose safety risks without proper age verification and parental consent (COPPA). Disabling it now and marking it "Coming Soon" is the right call.

## Changes

### 1. Disable the invite button on SquadHome
**File: `src/pages/SquadHome.tsx`** (lines 78-86)
- Remove the `onClick` navigation to `/squad/setup?mode=invite`
- Add `opacity-50 cursor-not-allowed` styling
- Replace "Invite someone →" with a "Coming Soon" badge
- Add a short note: "Age verification required — coming soon"

### 2. Guard the invite route in SquadSetup
**File: `src/pages/SquadSetup.tsx`**
- If `mode=invite`, redirect back to `/squad` immediately (prevents direct URL access)

### 3. Guard the invite landing page
**File: `src/pages/SquadInvite.tsx`**
- Show a friendly "This feature is coming soon" message instead of the join flow
- Link back to `/squad`

### Future considerations for age verification
When ready to re-enable, the recommended approach would be:
- **Authentication required** — users must sign up/log in before accessing Mode B
- **Date-of-birth collection** at signup with parental consent flow for under-13 (COPPA)
- **Parental email verification** — parent confirms permission via email link
- **Backend enforcement** — edge function or RLS policy checks age-verified flag before allowing invite creation/acceptance

No database changes needed for this disable-only update.

