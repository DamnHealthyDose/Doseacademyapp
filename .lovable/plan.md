

# DOSE Academy Onboarding Video (MP4 via Remotion)

A polished 25-second motion graphics explainer rendered to MP4, introducing DOSE Academy's four tools to teens and parents.

---

## Creative Direction

**Vibe**: Playful/Pop meets Kinetic Energy — bold, teen-friendly, fast-paced but clear. Energetic springs, saturated brand colors, rounded typography.

**Color Palette** (from brand):
- Primary teal: `#00C7C7` (hsl 180 100% 39%)
- SPARK yellow/amber: `#F59E0B`
- RSD pink: `#EC4899` (hsl 330 90% 60%)
- Squad green: `#33996B` (hsl 160 64% 40%)
- Background dark: `#0A1F1F` (dark mode deep)
- Text white: `#FFFFFF`

**Fonts**: Nunito (headings, bold/extrabold) + DM Sans (body)

**Motion System**: Spring-in entrances with slight bounce (damping: 12), scale-fade exits, wipe transitions between scenes.

**Visual Motifs**: Rounded pill shapes, emoji icons matching the app (⚡🌊💜👥), floating accent circles.

---

## Scene Breakdown (~25 seconds at 30fps = 750 frames)

### Scene 1 — Hook (0-120 frames, 4s)
DOSE Academy logo animates in with spring scale. Tagline: "Four Tools. One Mission. Every ADHD Teen." fades up word-by-word.

### Scene 2 — SPARK (120-270 frames, 5s)
⚡ icon springs in. "SPARK — Emotional check-in in 60 seconds." Brief description with staggered text lines. Amber/yellow accent colors.

### Scene 3 — WAVE (270-420 frames, 5s)
🌊 icon springs in. "WAVE — ADHD-friendly Pomodoro focus sessions." Teal accent. Animated timer ring visual.

### Scene 4 — RSD (420-540 frames, 4s)
💜 icon springs in. "RSD — Crisis support when rejection hits." Pink/purple accent. Breathing circle animation.

### Scene 5 — Squad Focus (540-660 frames, 4s)
👥 icon springs in. "Squad — Study together. Never alone." Green accent. Animated avatar dots appearing.

### Scene 6 — Closer (660-750 frames, 3s)
All four icons converge. "Built for ADHD brains." Logo + "DOSE Academy" resolves with a glow.

---

## Technical Plan

1. **Set up Remotion project** in `remotion/` directory with bun, install deps, fix compositor binary
2. **Copy logo asset** (`src/assets/dose-logo.png`) to `remotion/public/images/`
3. **Load fonts** via `@remotion/google-fonts` (Nunito + DM Sans)
4. **Build 6 scene components** in `remotion/src/scenes/`
5. **Create persistent background layer** with animated gradient and floating accent shapes
6. **Wire scenes** with `TransitionSeries` and wipe/fade transitions
7. **Render** via programmatic script to `/mnt/documents/dose-onboarding.mp4`
8. **QA** — spot-check frames at key moments, verify output

The video will be a standalone MP4 file saved to `/mnt/documents/` for download and external use.

