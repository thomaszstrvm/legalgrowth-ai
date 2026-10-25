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
  // Mask the opaque incoming stage itself: outgoing pixels stay visible until
  // replaced, instead of cutting to an empty background before every scene.
  return (
    <AbsoluteFill
      style={{
        background: colors(theme).bg,
        clipPath: `inset(0 0 0 ${(1 - motionProgress(f, 0, 0.4 * fps)) * 100}%)`,
      }}
    >
      {children}
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
  const fanLeft = motionProgress(f, 0.42 * fps, 0.8 * fps);
  const fanRight = motionProgress(f, 0.56 * fps, 0.8 * fps);
  return (
    <Stage theme={theme}>
      <div
        style={{ position: "absolute", left: 120, top: 88, opacity: 1 - exit }}
      >
        <Brand size={43} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 330,
          width: 880,
          translate: `0 ${-exit * 35}px`,
          opacity: 1 - exit,
        }}
      >
        <MaskText>{theme === "dark" ? "Como acompanhar" : "Campanhas e"}</MaskText>
        <MaskText delay={0.16}>{theme === "dark" ? "suas campanhas?" : "resultados."}</MaskText>
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
            rotate: `${-12 * fanLeft}deg`,
            translate: `${(1 - fanLeft) * 115}px 0`,
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
            rotate: `${14 * fanRight}deg`,
            translate: `${-(1 - fanRight) * 125}px 0`,
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
    camera = motionProgress(f, 0.65 * fps, 2.1 * fps);
  // Dark portfolio cut: focus the real summary, not the entire application.
  // The light branch below remains unchanged.
  if (theme === "dark") {
    return (
      <Stage theme={theme}>
        <div style={{ position: "absolute", left: 120, top: 110 }}>
          <MaskText size={96}>Contatos em contexto.</MaskText>
        </div>
        <div style={{ position: "absolute", left: 120, top: 320,
          width: 1400, overflow: "hidden", borderRadius: 12,
          clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
          scale: 0.97 + camera * 0.03, transformOrigin: "left center" }}>
          <Detail src="overview-dark.png" sourceWidth={2880}
            crop={[1030, 585, 850, 220]} width={1400} />
        </div>
        <div style={{ position: "absolute", left: 120, top: 780,
          fontSize: 64, color: dark.muted, opacity: reveal }}>
          Exemplo fictício · mesmo período
        </div>
      </Stage>
    );
  }
  return (
    <Stage theme={theme}>
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 88,
          opacity: 1 - motionProgress(f, 3.65 * fps, 0.3 * fps),
        }}
      >
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
          opacity: 1 - motionProgress(f, 3.75 * fps, 0.25 * fps),
          borderRadius: 12,
          boxShadow: "0 40px 90px #26332625",
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

// Product chapter, not a financial report: no axes, dates or disclaimers.
export const ResultsScene = ({ theme }: FilmProps) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const enter = motionProgress(f, 0.08 * fps, 0.95 * fps);
  const settle = motionProgress(f, 0.5 * fps, 1.6 * fps);
  const leave = motionProgress(f, 3.65 * fps, 0.3 * fps);
  return (
    <Stage theme={theme}>
      <div
        style={{
          position: "absolute",
          left: 302,
          top: 197,
          opacity: enter,
          transformOrigin: "50% 50%",
          transform: `perspective(2000px) translateX(${(1 - enter) * -110}px) rotateY(${-24 + settle * 18}deg) rotateZ(${-5 + settle * 3}deg) scale(${0.94 + settle * 0.06})`,
        }}
      >
        <Cover
          name="finance"
          theme={theme}
          style={{ width: 480, height: 654 }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 950,
          top: 433,
          width: 800,
          opacity: 1 - leave,
        }}
      >
        <MaskText size={112} delay={0.25}>
          Orçamento
        </MaskText>
      </div>
    </Stage>
  );
};

export const IntelligenceScene = ({ theme }: FilmProps) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const cover = motionProgress(f, 0.12 * fps, 1.15 * fps);
  const firstIn = motionProgress(f, 0.15 * fps, 0.65 * fps);
  const firstOut = motionProgress(f, 2.05 * fps, 0.2 * fps);
  const secondIn = motionProgress(f, 2.25 * fps, 0.55 * fps);
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
          opacity: 1 - motionProgress(f, 4.65 * fps, 0.3 * fps),
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
          {theme === "dark" ? <>Revisão por<br />outra IA</> : "Segunda revisão"}
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
      {theme === "dark" && (
        <div style={{ position: "absolute", left: 120, right: 120, top: 690,
          textAlign: "center", opacity: p, fontSize: 64, lineHeight: 1.35 }}>
          <div style={{ color: dark.muted }}>Projeto demonstrativo de Thomas Marques</div>
          <div style={{ marginTop: 30 }}>Conheça o projeto</div>
        </div>
      )}
    </Stage>
  );
};
