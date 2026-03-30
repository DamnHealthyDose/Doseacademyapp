import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate } from "remotion";
import { nunitoFamily, dmSansFamily } from "../MainVideo";

export const Scene5Squad = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const iconScale = spring({ frame, fps, config: { damping: 10, stiffness: 180 } });
  const titleSlide = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 120 } });
  const descOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Animated avatar dots
  const dots = [0, 1, 2, 3];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
        <div style={{ position: "relative", transform: `scale(${iconScale})` }}>
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 40,
              background: "linear-gradient(135deg, #33996B, #2D8A5E)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 20px 60px rgba(51, 153, 107, 0.4)",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 80, zIndex: 1 }}>👥</span>
            {dots.map((i) => {
              const dotScale = spring({ frame: frame - 20 - i * 8, fps, config: { damping: 12 } });
              const angle = (i / dots.length) * Math.PI * 2 - Math.PI / 2;
              const radius = 75;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    transform: `scale(${dotScale}) translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`,
                    opacity: 0.7,
                  }}
                />
              );
            })}
          </div>
        </div>
        <div style={{ maxWidth: 700 }}>
          <h2
            style={{
              fontFamily: nunitoFamily,
              fontWeight: 800,
              fontSize: 72,
              color: "#33996B",
              margin: 0,
              transform: `translateX(${interpolate(titleSlide, [0, 1], [-60, 0])}px)`,
              opacity: titleSlide,
            }}
          >
            Squad Focus
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
            Study together. Never alone.
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
            Accountability without judgment.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
