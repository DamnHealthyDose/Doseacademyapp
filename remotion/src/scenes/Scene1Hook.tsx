import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate, Img, staticFile } from "remotion";
import { nunitoFamily, dmSansFamily } from "../MainVideo";

export const Scene1Hook = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  const logoOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  const words = ["Four Tools.", "One Mission.", "Every ADHD Teen."];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
        <Img
          src={staticFile("images/dose-logo.png")}
          style={{
            width: 280,
            height: 280,
            objectFit: "contain",
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
          }}
        />
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
          {words.map((word, i) => {
            const delay = 30 + i * 18;
            const wordOpacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const wordY = interpolate(frame, [delay, delay + 20], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <span
                key={i}
                style={{
                  fontFamily: nunitoFamily,
                  fontWeight: 800,
                  fontSize: 52,
                  color: "#FFFFFF",
                  opacity: wordOpacity,
                  transform: `translateY(${wordY}px)`,
                  textShadow: "0 2px 20px rgba(0, 199, 199, 0.3)",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
