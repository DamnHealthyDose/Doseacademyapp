
# Authentication & Age Verification for Study with a Friend

## Overview
Add email/Google/Apple authentication and age verification so Mode B can be safely re-enabled in the future. Auth is only required for the "Study with a Friend" feature — the rest of the app stays open.

## Changes

### 1. Database: profiles table with age verification
- `profiles` table: `user_id`, `display_name`, `date_of_birth`, `age_verified` (boolean), `parent_email`, `parent_consent_given` (boolean), `parent_consent_at`
- RLS: users can read/update their own profile
- Auto-create profile on signup via trigger

### 2. Database: user_roles table (for future admin needs)
- Standard roles table following the security template

### 3. Configure auth
- Enable email + password (email confirmation required)
- Configure Google + Apple OAuth via Lovable Cloud

### 4. Create auth pages
- `/auth` — Login/Signup page with email + Google + Apple
- Age verification step after first login (collect date of birth)
- Parental consent flow for users 13-15 (collect parent email, show consent pending state)

### 5. Auth context & route protection
- Auth provider wrapping the app to track session state
- `useAuth` hook for components
- Protected route wrapper that checks auth + age verification before allowing Mode B access

### 6. Update Squad flow
- Re-enable the "Study with a Friend" button but gate it behind auth + age check
- If not logged in → redirect to `/auth`
- If logged in but no DOB → show age verification
- If 13-15 and no parental consent → show "Waiting for parent approval"
- If under 13 → block with friendly message
- If 16+ or 13-15 with consent → allow access

### 7. Parental consent edge function
- Edge function to send consent request email to parent (future — when email domain is set up)
- For now: parent consent will be a manual/placeholder flow

## What stays the same
- Mode A (ambient squad) remains fully open, no auth needed
- All other features remain open
- AI chat bubbles remain open
