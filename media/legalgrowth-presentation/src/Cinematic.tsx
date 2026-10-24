import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import { Brand, Cover, Detail, dark, light } from "./visuals";
void loadFont({
  family: "Manrope",
  url: staticFile("fonts/manrope.ttf"),
  weight: "100 900",
});
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
        fontFamily: "Manrope",
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
export const SceneMask = ({ children }: { children: React.ReactNode }) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
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
  size = 112,
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
          fontFamily: "Newsreader",
          fontSize: size,
          lineHeight: 1.02,
          letterSpacing: "-.035em",
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
      <div style={{ position: "absolute", left: 104, top: 82 }}>
        <Brand size={43} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 104,
          top: 310,
          width: 1000,
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
      <div style={{ position: "absolute", left: 104, top: 82 }}>
        <MaskText size={72}>Visão geral.</MaskText>
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
 const f=useCurrentFrame(),{fps}=useVideoConfig();
 const reveal=motionProgress(f,.18*fps,1.25*fps),drift=motionProgress(f,0,4*fps);
 return <Stage theme={theme}>
  <div style={{position:"absolute",left:104,top:94}}>
   <MaskText size={85}>Investimento e resultados.</MaskText>
  </div>
  <div style={{position:"absolute",left:104,top:470,width:590}}>
   <MaskText size={64} delay={.4}>Compare períodos.</MaskText>
  </div>
  <div style={{position:"absolute",left:750,top:340,clipPath:`inset(0 ${(1-reveal)*100}% 0 0)`,scale:1+drift*.025,transformOrigin:"left center"}}>
   <Detail src={`overview-${theme}.png`} sourceWidth={2880} crop={[1475,2125,1325,640]} width={1050}/>
  </div>
 </Stage>;
};

export const IntelligenceScene = ({ theme }: FilmProps) => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const p = motionProgress(f, 0, 0.8 * fps),
    reveal = motionProgress(f, 0.6 * fps, 0.9 * fps);
  return (
    <Stage theme={theme}>
      <div style={{ position: "absolute", left: 104, top: 100 }}>
        <MaskText size={93}>Análise de IA.</MaskText>
        <MaskText delay={0.14} size={93}>
          Segunda revisão.
        </MaskText>
      </div>
      <div
        style={{
          position: "absolute",
          right: 150,
          top: 62,
          transform: `perspective(1600px) rotateY(${-12 * (1 - p)}deg) rotateZ(7deg)`,
          opacity: p,
        }}
      >
        <Cover
          name="insights"
          theme={theme}
          style={{ width: 270, height: 368 }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 104,
          top: 455,
          width: 1712,
          height: 430,
          overflow: "hidden",
          clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)`,
          borderTop: `1px solid ${colors(theme).line}`,
          paddingTop: 70,
        }}
      >
        <Detail
          src={`insight-film-${theme}.png`}
          sourceWidth={1760}
          crop={[0, 0, 1760, 384]}
          width={1190}
          style={{ translate: `${(1 - reveal) * 35}px 0` }}
        />
        <div
          style={{
            position: "absolute",
            left: 1300,
            top: 110,
            fontFamily: "Newsreader",
            fontSize: 53,
            lineHeight: 1.05,
            width: 390,
          }}
        >
          Você decide.
        </div>
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
          alignItems: "baseline",
          gap: 30,
          opacity: p,
          translate: `0 ${(1 - p) * 30}px`,
        }}
      >
        <Brand size={146} />
        <span
          style={{
            fontFamily: "Manrope",
            fontSize: 49,
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
