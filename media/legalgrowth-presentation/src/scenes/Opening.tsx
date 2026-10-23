import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Brand, Cover, ease, Frame, Reveal, Title } from "../visuals";
export const Opening = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Frame>
      <div style={{ position: "absolute", left: 112, top: 94 }}>
        <Brand />
      </div>
      <div style={{ position: "absolute", left: 112, top: 330, zIndex: 10 }}>
        <Reveal>
          <Title style={{ fontSize: 96 }}>
            Gestão de
            <br />
            marketing
          </Title>
        </Reveal>
        <Reveal delay={0.18}>
          <Title style={{ fontSize: 96 }}>jurídico.</Title>
        </Reveal>
      </div>
      <div
        style={{
          position: "absolute",
          left: 1350,
          top: 510,
          perspective: 1800,
        }}
      >
        {["finance", "reports", "campaigns", "insights", "strategy"].map(
          (name, i) => {
            const offset = i - 2;
            const spread = interpolate(f, [0, 1.2 * fps], [0.25, 1], ease);
            return (
              <div
                key={name}
                style={{
                  position: "absolute",
                  left: -210,
                  top: -286,
                  zIndex: 5 - Math.abs(offset),
                  transform: `translate(${offset * 148 * spread}px,${Math.abs(offset) * 39 + interpolate(f, [0, 4 * fps], [22, -12], ease)}px) rotate(${offset * 9 * spread}deg) scale(${1.12 - Math.abs(offset) * 0.11})`,
                  opacity: interpolate(f, [0, 0.35 * fps], [0.2, 1], ease),
                }}
              >
                <Cover name={name} />
              </div>
            );
          },
        )}
      </div>
    </Frame>
  );
};
