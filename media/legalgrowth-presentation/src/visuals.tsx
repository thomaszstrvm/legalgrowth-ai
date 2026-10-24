import React from "react";
import {
  AbsoluteFill,
  Img,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
void loadFont({
  family: "Newsreader",
  url: staticFile("fonts/newsreader.ttf"),
  weight: "400",
});
void loadFont({
  family: "Instrument Sans",
  url: staticFile("fonts/instrument-sans-regular.ttf"),
  weight: "400",
});
void loadFont({
  family: "Instrument Sans",
  url: staticFile("fonts/instrument-sans-medium.ttf"),
  weight: "500",
});
export const ease = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};
export const light = {
  bg: "#f7f8f5",
  ink: "#292a29",
  muted: "#535c50",
  line: "#d8d9d4",
  accent: "#315747",
};
export const dark = {
  bg: "#181c19",
  ink: "#eeeee7",
  muted: "#b8bcb2",
  line: "#3d423b",
  accent: "#b8d4bc",
};
export const Mark = ({ size = 38 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path
      d="M7 17v16h16M15 10v16h16M23 3v16h10"
      stroke="currentColor"
      strokeWidth="3.5"
    />
  </svg>
);
export const Frame = ({
  children,
  darkMode = false,
}: {
  children: React.ReactNode;
  darkMode?: boolean;
}) => {
  const c = darkMode ? dark : light;
  return (
    <AbsoluteFill
      style={{
        background: c.bg,
        color: c.ink,
        fontFamily: "Instrument Sans",
        overflow: "hidden",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
export const Brand = ({ size = 44 }: { size?: number }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: size * 0.28,
      fontFamily: "Newsreader",
      fontSize: size,
      letterSpacing: "-.035em",
    }}
  >
    <Mark size={size * 0.85} />
    LegalGrowth
  </div>
);
export const Reveal = ({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const progress = interpolate(
    f,
    [delay * fps, (delay + 0.55) * fps],
    [0, 1],
    ease,
  );
  return (
    <div
      style={{
        ...style,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 36}px)`,
      }}
    >
      {children}
    </div>
  );
};
export const Title = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      fontFamily: "Instrument Sans",
      fontWeight: 500,
      fontSize: 100,
      lineHeight: 1.07,
      letterSpacing: "-.025em",
      ...style,
    }}
  >
    {children}
  </div>
);
// Crop original screenshots in source pixels; no UI values are reconstructed.
export const Detail = ({
  src,
  sourceWidth,
  crop,
  width,
  style,
}: {
  src: string;
  sourceWidth: number;
  crop: [number, number, number, number];
  width: number;
  style?: React.CSSProperties;
}) => {
  const [x, y, w, h] = crop;
  const scale = width / w;
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        position: "relative",
        width,
        height: h * scale,
        overflow: "hidden",
        ...style,
      }}
    >
      <Img
        src={staticFile("screens/" + src)}
        premountFor={fps}
        pauseWhenLoading
        style={{
          position: "absolute",
          maxWidth: "none",
          width: sourceWidth * scale,
          left: -x * scale,
          top: -y * scale,
        }}
      />
    </div>
  );
};
export const Cover = ({
  name,
  theme = "light",
  style,
}: {
  name: string;
  theme?: "light" | "dark";
  style?: React.CSSProperties;
}) => {
  const { fps } = useVideoConfig();
  return (
    <Img
      src={staticFile(`covers/${name}-${theme}.png`)}
      premountFor={fps}
      pauseWhenLoading
      style={{
        width: 420,
        height: 572,
        filter: "drop-shadow(0px 25px 22px rgba(0,0,0,.17))",
        ...style,
      }}
    />
  );
};
