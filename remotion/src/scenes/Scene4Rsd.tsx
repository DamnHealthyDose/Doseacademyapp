import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { nunitoFamily, dmSansFamily } from "../MainVideo";

export const Scene4Rsd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconScale = spring({ frame, fps, config: { damping: 10, stiffness: 180 } });
  const titleSlide = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 120 } });
  const descOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Breathing circle
  const breatheScale = 1 + Math.sin(frame * 0.08) * 0.15;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        <div style={{ position: "relative", transform: `scale(${iconScale})` }}>
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 40,
              background: "linear-gradient(135deg, #EC4899, #DB2777)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 20px 60px rgba(236, 72, 153, 0.4)",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 180,
                height: 180,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                transform: `scale(${breatheScale})`,
              }}
            />
            <span style={{ fontSize: 80, zIndex: 1 }}>💜</span>
          </div>
        </div>
        <div style={{ maxWidth: 700 }}>
          <h2
            style={{
              fontFamily: nunitoFamily,
              fontWeight: 800,
              fontSize: 72,
              color: "#EC4899",
              margin: 0,
              transform: `translateX(${interpolate(titleSlide, [0, 1], [-60, 0])}px)`,
              opacity: titleSlide,
            }}
          >
            RSD Shield
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
            Crisis support when rejection hits.
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
            Breathe. Ground. Reframe. Recover.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
