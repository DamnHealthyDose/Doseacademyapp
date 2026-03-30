import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate, Img, staticFile } from "remotion";
import { nunitoFamily } from "../MainVideo";

const ICONS = ["⚡", "🌊", "💜", "👥"];
const COLORS = ["#F59E0B", "#00C7C7", "#EC4899", "#33996B"];

export const Scene6Closer = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        {/* Four icons converge */}
        <div style={{ display: "flex", gap: 30 }}>
          {ICONS.map((icon, i) => {
            const delay = i * 6;
            const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 150 } });
            const startX = (i - 1.5) * 200;
            const x = interpolate(s, [0, 1], [startX, 0]);
            return (
              <div
                key={i}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 24,
                  background: `linear-gradient(135deg, ${COLORS[i]}, ${COLORS[i]}dd)`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: 50,
                  transform: `translateX(${x}px) scale(${s})`,
                  boxShadow: `0 10px 30px ${COLORS[i]}66`,
                }}
              >
                {icon}
              </div>
            );
          })}
        </div>

        {/* Tagline */}
        <h2
          style={{
            fontFamily: nunitoFamily,
            fontWeight: 800,
            fontSize: 64,
            color: "#FFFFFF",
            opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(frame, [30, 50], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            textShadow: "0 4px 30px rgba(0, 199, 199, 0.4)",
            margin: 0,
          }}
        >
          Built for ADHD brains.
        </h2>

        {/* Logo */}
        <Img
          src={staticFile("images/dose-logo.png")}
          style={{
            width: 160,
            height: 160,
            objectFit: "contain",
            opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            transform: `scale(${interpolate(frame, [50, 70], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})`,
          }}
        />

        <p
          style={{
            fontFamily: nunitoFamily,
            fontWeight: 700,
            fontSize: 32,
            color: "#00C7C7",
            opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            margin: 0,
          }}
        >
          DOSE Academy
        </p>
      </div>
    </AbsoluteFill>
  );
};
