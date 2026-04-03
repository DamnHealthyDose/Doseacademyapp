

# COPPA Compliance Gaps and Remediation Plan

## Current Status

The age-gating structure (under-13 block, 13-15 parental consent, 16+ pass) is a solid foundation, but several COPPA requirements are not yet met.

## Gaps and Fixes

### 1. Age gate at signup (not just at feature access)

COPPA regulates collecting personal information (email, name) from under-13s at any point — not just when they access peer features. Currently a 10-year-old can create an account freely.

**Fix:** Add a DOB screen *before* account creation. If under 13, block signup entirely. If 13-15, collect parent email before creating the account. Store DOB only temporarily for verification, then delete or redact it.

**Files:** New `src/pages/SignupAgeCheck.tsx`, update `AuthPage.tsx` signup flow.

### 2. Verifiable parental consent (not just email collection)

COPPA requires *verifiable* consent. Simply collecting a parent email is insufficient. The FTC accepts several methods; the simplest for a web app is "email-plus" — send parent an email with a consent link, then require a second confirmation (e.g., reply email, or a delayed confirmation code).

**Fix:** 
- Create an edge function that sends a consent request email with a unique token
- Create a `/parent-consent/:token` page where the parent confirms
- Update the `profiles` table: set `parent_consent_given = true` and `parent_consent_at` only after token confirmation
- Requires an email domain to be set up first

**Files:** New edge function `parent-consent`, new page `src/pages/ParentConsent.tsx`, migration to add `consent_token` column.

### 3. Parental rights (review, delete, refuse)

COPPA requires parents to review what data was collected, request deletion, and refuse further collection.

**Fix:** Create a `/parent-dashboard/:token` page (accessible via the consent email) that shows:
- What data is stored about their child
- A "Delete my child's account" button
- A "Revoke consent" button

**Files:** New `src/pages/ParentDashboard.tsx`, new edge function for account deletion.

### 4. Privacy policy COPPA additions

The current privacy policy needs:
- Operator contact info (name, mailing address, email, phone)
- Specific section on children's data practices
- What data is collected from under-13/under-16 users
- How parents can exercise their rights
- Data retention and deletion policies

**File:** Update `src/pages/PrivacyPolicy.tsx`.

### 5. Minimize DOB storage

After verifying age, store only the age bracket (e.g., "under-13", "13-15", "16+") rather than the exact DOB. This follows COPPA's data minimization principle.

**Fix:** After age verification, replace `date_of_birth` with an `age_bracket` enum and clear the raw DOB.

**Files:** Migration to add `age_bracket` column, update `AgeVerification.tsx`.

### 6. Block under-13 account creation entirely

If a user indicates they are under 13 during the pre-signup age check, do not create an account at all. Do not store their email or any PII.

**File:** Update signup flow in `AuthPage.tsx`.

## Priority Order

1. Age gate before signup (blocks the most critical compliance risk)
2. Privacy policy updates (legal requirement, low effort)
3. Verifiable parental consent flow (requires email domain setup)
4. DOB minimization (reduce stored PII)
5. Parent dashboard (review/delete rights)

## Prerequisites

- **Email domain setup** is required for sending parental consent emails. This needs to be configured before items 3 and 5 can work.

## What stays the same

- Mode A (ambient squad with AI members) remains open — no real peer interaction, no PII exchange
- AI chat bubbles remain open — no PII collected
- The three-tier age structure (under-13 / 13-15 / 16+) remains the same

