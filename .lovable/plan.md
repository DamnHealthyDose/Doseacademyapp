

# AI Squad Members with Quick Chat Bubbles

## Overview

Add AI-powered squad members that look like real users in the ambient squad rail. Tapping one opens a small chat bubble overlay for quick, encouraging exchanges (study tips, motivation). Uses the existing Lovable AI edge function pattern.

## Plan

### 1. Create AI squad member data and personalities

**File: `src/lib/squadContent.ts`**
- Add an `aiSquadMembers` array with 6-8 AI members, each having initials, subject, and a personality trait (e.g., "encouraging math nerd", "chill study buddy")
- Add an `isAI` flag to distinguish them from ambient pool members
- Ensure 2-3 AI members always appear in the ambient squad

### 2. Create a new edge function for squad chat

**File: `supabase/functions/squad-chat/index.ts`**
- Lightweight edge function using Lovable AI (`google/gemini-3-flash-preview`)
- System prompt: short, teen-friendly, study-focused persona that varies per AI member personality
- Non-streaming responses (quick bubbles don't need streaming)
- Max 2-3 sentence replies to keep it snappy
- CORS headers, 429/402 error handling

### 3. Build the QuickChatBubble component

**File: `src/components/QuickChatBubble.tsx`**
- Small overlay anchored near the tapped avatar (bottom sheet on mobile)
- Shows the AI member's initials, subject, and a short greeting
- Simple input field + send button
- Displays last 4-5 messages in a mini scrollable area
- Close button / tap-outside-to-dismiss
- Loading indicator while AI responds
- Messages stored in component state only (no persistence needed)

### 4. Update SquadSession to support tappable AI avatars

**File: `src/pages/SquadSession.tsx`**
- Mix 2-3 AI members into the ambient squad rail alongside regular simulated members
- Make AI member avatars tappable (subtle visual indicator like a small chat icon or different border color)
- On tap, open `QuickChatBubble` with that AI member's personality context
- Non-AI ambient members remain non-interactive

### 5. Update SquadHome to show AI members

**File: `src/pages/SquadHome.tsx`**
- Include AI members in the "people studying right now" display
- No chat interaction from the home screen (only during active sessions)

## Safety Considerations

- AI members follow the same privacy rules: initials only, no real names
- Chat is ephemeral (no persistence) and resets each session
- AI responses are capped at 2-3 sentences to prevent over-engagement
- No personal data collection from the chat

## Technical Notes

- Reuses the same Lovable AI gateway pattern as the existing `slick-chat` edge function
- `LOVABLE_API_KEY` is already configured as a secret
- No database changes needed (chat is ephemeral)

