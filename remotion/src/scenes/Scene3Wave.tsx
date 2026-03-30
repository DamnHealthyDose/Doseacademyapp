import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { nunitoFamily, dmSansFamily } from "../MainVideo";

export const Scene3Wave = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconScale = spring({ frame, fps, config: { damping: 10, stiffness: 180 } });
  const titleSlide = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 120 } });
  const descOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Animated timer ring
  const ringProgress = interpolate(frame, [20, 120], [0, 0.75], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const circumference = 2 * Math.PI * 70;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        <div style={{ position: "relative", transform: `scale(${iconScale})` }}>
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 40,
              background: "linear-gradient(135deg, #00C7C7, #00A3A3)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 20px 60px rgba(0, 199, 199, 0.4)",
              position: "relative",
            }}
          >
            <svg width="160" height="160" style={{ position: "absolute" }}>
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - ringProgress)}
                strokeLinecap="round"
                transform="rotate(-90 80 80)"
              />
            </svg>
            <span style={{ fontSize: 60, zIndex: 1 }}>🌊</span>
          </div>
        </div>
        <div style={{ maxWidth: 700 }}>
          <h2
            style={{
              fontFamily: nunitoFamily,
              fontWeight: 800,
              fontSize: 72,
              color: "#00C7C7",
              margin: 0,
              transform: `translateX(${interpolate(titleSlide, [0, 1], [-60, 0])}px)`,
              opacity: titleSlide,
            }}
          >
            WAVE
          </h2>
          <p
            style={{
              fontFamily: dmSansFamily,
              fontSize: 36,
              color: "#FFFFFF",
              opacity: descOpacity,
              marginTop: 16,
              lineHeight: 1.4,
            }}
          >
            ADHD-friendly Pomodoro focus sessions.
          </p>
          <p
            style={{
              fontFamily: dmSansFamily,
              fontSize: 26,
              color: "rgba(255,255,255,0.6)",
              opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              marginTop: 12,
            }}
          >
            Short sprints. Real momentum.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
