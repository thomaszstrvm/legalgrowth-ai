import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Cover, ease, Frame, Reveal, Title } from "../visuals";
import { BudgetIllustration } from "../illustrations";
export const Investment = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Frame>
      <Cover
        name="finance"
        style={{
          position: "absolute",
          left: 140,
          top: 190,
          width: 460,
          height: 626,
          transform: `perspective(1500px) rotateY(${interpolate(f, [0, 4 * fps], [-12, -6], ease)}deg) rotate(-5deg)`,
        }}
      />
      <Reveal style={{ position: "absolute", left: 800, top: 185 }}>
        <Title>
          Organize seus
          <br />
          gastos.
        </Title>
      </Reveal>
      <div style={{ position: "absolute", left: 800, top: 510 }}>
        <BudgetIllustration />
      </div>
    </Frame>
  );
};
