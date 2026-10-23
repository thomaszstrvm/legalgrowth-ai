import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Cover, ease, Frame, Reveal, Title } from "../visuals";
import { CampaignIllustration } from "../illustrations";
export const Overview = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Frame>
      <Reveal style={{ position: "absolute", left: 112, top: 170 }}>
        <Title>
          Acompanhe suas
          <br />
          campanhas.
        </Title>
      </Reveal>
      <div style={{ position: "absolute", left: 112, top: 550 }}>
        <CampaignIllustration />
      </div>
      <Cover
        name="campaigns"
        style={{
          position: "absolute",
          right: 165,
          top: 105,
          width: 240,
          height: 327,
          transform: `rotate(${interpolate(f, [0, 4 * fps], [10, 5], ease)}deg)`,
        }}
      />
    </Frame>
  );
};
