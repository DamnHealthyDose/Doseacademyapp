import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { nunitoFamily, dmSansFamily } from "../MainVideo";

export const Scene2Spark = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconScale = spring({ frame, fps, config: { damping: 10, stiffness: 180 } });
  const titleSlide = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 120 } });
  const descOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const descY = interpolate(frame, [40, 60], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pulseScale = 1 + Math.sin(frame * 0.1) * 0.05;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 40,
              background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: `scale(${iconScale * pulseScale})`,
              boxShadow: "0 20px 60px rgba(245, 158, 11, 0.4)",
            }}
          >
            <span style={{ fontSize: 100 }}>⚡</span>
          </div>
        </div>
        <div style={{ maxWidth: 700 }}>
          <h2
            style={{
              fontFamily: nunitoFamily,
              fontWeight: 800,
              fontSize: 72,
              color: "#F59E0B",
              margin: 0,
              transform: `translateX(${interpolate(titleSlide, [0, 1], [-60, 0])}px)`,
              opacity: titleSlide,
            }}
          >
            SPARK
          </h2>
          <p
            style={{
              fontFamily: dmSansFamily,
              fontSize: 36,
              color: "#FFFFFF",
              opacity: descOpacity,
              transform: `translateY(${descY}px)`,
              marginTop: 16,
              lineHeight: 1.4,
            }}
          >
            Emotional check-in in 60 seconds.
          </p>
          <p
            style={{
              fontFamily: dmSansFamily,
              fontSize: 26,
              color: "rgba(255,255,255,0.6)",
              opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [60, 80], [15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
              marginTop: 12,
            }}
          >
            Name it. Feel it. Move through it.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
