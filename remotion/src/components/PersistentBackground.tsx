import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

export const PersistentBackground = () => {
  const frame = useCurrentFrame();
  const hueShift = interpolate(frame, [0, 750], [0, 30]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 30% 40%, hsl(${180 + hueShift}, 40%, 12%) 0%, #0A1F1F 70%)`,
      }}
    >
      {[...Array(6)].map((_, i) => {
        const x = interpolate(
          frame,
          [0, 750],
          [10 + i * 15, 20 + i * 12],
        );
        const y = interpolate(
          frame,
          [0, 750],
          [15 + i * 10, 25 + i * 8],
        );
        const size = 80 + i * 40;
        const opacity = 0.04 + i * 0.01;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `hsl(${180 + i * 30}, 60%, 50%)`,
              opacity,
              filter: "blur(40px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
