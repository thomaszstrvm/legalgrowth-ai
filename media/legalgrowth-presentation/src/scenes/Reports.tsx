import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, Cover, dark, ease, Frame, Reveal, Title } from "../visuals";
import { ReportIllustration } from "../illustrations";
export const Reports = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const end = f >= 2 * fps;
  return (
    <Frame darkMode>
      {!end ? (
        <>
          <Reveal style={{ position: "absolute", left: 112, top: 180 }}>
            <Title style={{ fontSize: 100 }}>
              Compartilhe os
              <br />
              relatórios.
            </Title>
          </Reveal>
          <Reveal
            delay={0.1}
            style={{ position: "absolute", left: 112, top: 580 }}
          >
            <ReportIllustration />
          </Reveal>
          <Cover
            name="reports"
            theme="dark"
            style={{
              position: "absolute",
              right: 115,
              top: 215,
              width: 345,
              height: 470,
              rotate: "6deg",
            }}
          />
        </>
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 390,
              display: "flex",
              justifyContent: "center",
              opacity: interpolate(f, [2 * fps, 2.25 * fps], [0, 1], ease),
              transform: `translateY(${interpolate(f, [2 * fps, 2.4 * fps], [15, 0], ease)}px)`,
            }}
          >
            <Brand size={146} />
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 580,
              textAlign: "center",
              fontSize: 32,
              color: dark.accent,
            }}
          >
            Marketing jurídico.
          </div>
          <div
            style={{
              position: "absolute",
              left: 180,
              right: 180,
              top: 858,
              textAlign: "center",
              fontSize: 26,
              lineHeight: 1.6,
              color: dark.muted,
            }}
          >
            Cenas ilustrativas. A IA precisa ser configurada e pode errar.
          </div>
        </>
      )}
    </Frame>
  );
};
