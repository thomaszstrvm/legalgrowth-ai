import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Brand, Cover, Detail, dark, light } from "./visuals";
export type FilmTheme = "light" | "dark";
export type FilmProps = { theme: FilmTheme };
const smooth = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
  easing: Easing.bezier(0.22, 1, 0.36, 1),
};

// Normalized progress is a pure function of the frame: seeking and export agree.
export function motionProgress(frame: number, start: number, length: number) {
  return interpolate(frame, [start, start + length], [0, 1], smooth);
}
const colors = (theme: FilmTheme) => (theme === "dark" ? dark : light);
export const Stage = ({
  theme,
  children,
}: FilmProps & { children: React.ReactNode }) => {
  const { width, height } = useVideoConfig();
  const c = colors(theme);
  // One logical 1920x1080 stage; portrait can supply a separate scene layout later.
  return (
    <AbsoluteFill
      style={{
        background: c.bg,
        color: c.ink,
        fontFamily: "Instrument Sans",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 1920,
          height: 1080,
          position: "absolute",
          left: (width - 1920 * Math.min(width / 1920, height / 1080)) / 2,
          top: (height - 1080 * Math.min(width / 1920, height / 1080)) / 2,
          transformOrigin: "top left",
          scale: Math.min(width / 1920, height / 1080),
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
export const SceneMask = ({
  children,
  theme,
}: FilmProps & { children: React.ReactNode }) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  // Opaque backing prevents pieces of the previous title leaking through the wipe.
  return (
    <AbsoluteFill style={{ background: colors(theme).bg }}>
      <AbsoluteFill
        style={{
          clipPath: `inset(0 0 0 ${(1 - motionProgress(f, 0, 0.4 * fps)) * 100}%)`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
const MaskText = ({
  children,
  delay = 0,
  size = 104,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  size?: number;
  style?: React.CSSProperties;
}) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const p = motionProgress(f, delay * fps, 0.72 * fps);
  return (
    <div style={{ overflow: "hidden", ...style }}>
      <div
        style={{
          fontFamily: "Instrument Sans",
          fontWeight: 500,
          fontSize: size,
          lineHeight: 1.12,
          letterSpacing: size >= 64 ? "-.025em" : "0em",
          paddingBottom: "0.1em",
          translate: `0 ${(1 - p) * 112}%`,
          opacity: p,
        }}
      >
        {children}
      </div>
    </div>
  );
};
export const PromiseScene = ({ theme }: FilmProps) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const p = motionProgress(f, 0.25 * fps, 0.9 * fps),
    exit = motionProgress(f, 2.65 * fps, 0.35 * fps);
  return (
    <Stage theme={theme}>
      <div style={{ position: "absolute", left: 120, top: 88 }}>
        <Brand size={43} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 330,
          width: 880,
          translate: `0 ${-exit * 35}px`,
        }}
      >
        <MaskText>Campanhas e</MaskText>
        <MaskText delay={0.16}>resultados.</MaskText>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1130,
          top: 176,
          perspective: 1800,
          translate: `${(1 - p) * 100}px 0`,
          opacity: p,
          transform: `rotateY(${-12 + p * 6}deg) rotateZ(-5deg)`,
        }}
      >
        <Cover
          name="reports"
          theme={theme}
          style={{
            position: "absolute",
            left: -85,
            top: 65,
            width: 390,
            height: 531,
            rotate: "-12deg",
          }}
        />
        <Cover
          name="campaigns"
          theme={theme}
          style={{
            position: "absolute",
            left: 155,
            top: 75,
            width: 390,
            height: 531,
            rotate: "14deg",
          }}
        />
        <Cover
          name="insights"
          theme={theme}
          style={{
            position: "absolute",
            left: 30,
            top: 0,
            width: 420,
            height: 572,
            translate: `0 ${-p * 22}px`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 104,
          bottom: 110,
          width: 380,
          height: 2,
          background: colors(theme).line,
          scale: `${p} 1`,
          transformOrigin: "left",
        }}
      />
    </Stage>
  );
};

export const DashboardScene = ({ theme }: FilmProps) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const reveal = motionProgress(f, 0, 0.8 * fps),
    camera = motionProgress(f, 0.7 * fps, 2.7 * fps);
  return (
    <Stage theme={theme}>
      <div style={{ position: "absolute", left: 120, top: 88 }}>
        <MaskText size={64}>Visão geral.</MaskText>
      </div>
      <div
        style={{
          position: "absolute",
          left: 165,
          top: 215,
          perspective: 2400,
          clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
          overflow: "hidden",
          width: 1590,
          height: 730,
          borderRadius: 12,
          boxShadow:
            theme === "dark" ? "0 40px 90px #0008" : "0 40px 90px #26332625",
        }}
      >
        <div
          style={{
            transformOrigin: "50% 20%",
            transform: `rotateX(${(1 - camera) * 5}deg) scale(${1 + camera * 0.075})`,
            translate: `0 ${-camera * 54}px`,
          }}
        >
          <Detail
            src={`overview-${theme}.png`}
            sourceWidth={2880}
            crop={[0, 0, 2880, 1700]}
            width={1590}
          />
        </div>
      </div>
    </Stage>
  );
};

export const ResultsScene = ({ theme }: FilmProps) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const reveal = motionProgress(f, 0.18 * fps, 1.25 * fps);
  const drift = motionProgress(f, 0, 4 * fps);
  return (
    <Stage theme={theme}>
      <div style={{ position: "absolute", left: 120, top: 386, width: 600 }}>
        <MaskText size={80}>Investimento.</MaskText>
        <div style={{ marginTop: 38, color: colors(theme).muted }}>
          <MaskText size={32} delay={0.35}>
            Acompanhe os gastos.
          </MaskText>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 790,
          top: 298,
          clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
          scale: 1 + drift * 0.025,
          transformOrigin: "left center",
        }}
      >
        <Detail
          src={`overview-${theme}.png`}
          sourceWidth={2880}
          crop={[1475, 2125, 1325, 640]}
          width={990}
        />
      </div>
    </Stage>
  );
};

export const IntelligenceScene = ({ theme }: FilmProps) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const cover = motionProgress(f, 0.12 * fps, 1.15 * fps);
  const firstIn = motionProgress(f, 0.15 * fps, 0.65 * fps);
  const firstOut = motionProgress(f, 2.05 * fps, 0.25 * fps);
  const secondIn = motionProgress(f, 2.35 * fps, 0.65 * fps);
  // Two short beats replace the former five-level heading/subtitle/excerpt stack.
  // Their opacity windows do not overlap, so words never cross over one another.
  return (
    <Stage theme={theme}>
      <div
        style={{
          position: "absolute",
          left: 144,
          top: 402,
          width: 1000,
          fontFamily: "Instrument Sans",
          fontSize: 104,
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: "-.025em",
        }}
      >
        <div
          style={{
            position: "absolute",
            opacity: firstIn * (1 - firstOut),
            translate: `0 ${(1 - firstIn) * 28 - firstOut * 18}px`,
          }}
        >
          Análise de IA
        </div>
        <div
          style={{
            position: "absolute",
            opacity: secondIn,
            translate: `0 ${(1 - secondIn) * 28}px`,
          }}
        >
          Segunda revisão
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1240,
          top: 214,
          transform: `perspective(1800px) rotateY(${-16 + cover * 10 + secondIn * 4}deg) rotateZ(${-8 + cover * 3}deg)`,
          translate: `${(1 - cover) * 70}px ${(1 - cover) * 16}px`,
          opacity: cover,
        }}
      >
        <Cover
          name="insights"
          theme={theme}
          style={{ width: 420, height: 572 }}
        />
      </div>
    </Stage>
  );
};

export const SignatureScene = ({ theme }: FilmProps) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const p = motionProgress(f, 0, 0.8 * fps),
    line = motionProgress(f, 0.3 * fps, 1.15 * fps);
  return (
    <Stage theme={theme}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 420,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
          opacity: p,
          translate: `0 ${(1 - p) * 30}px`,
        }}
      >
        <Brand size={146} />
        <span
          style={{
            fontFamily: "Instrument Sans",
            fontSize: 49,
            marginTop: 22,
            color: colors(theme).accent,
          }}
        >
          AI
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          left: 700,
          top: 625,
          width: 520,
          height: 2,
          background: colors(theme).accent,
          scale: `${line} 1`,
          transformOrigin: "center",
        }}
      />
    </Stage>
  );
};
