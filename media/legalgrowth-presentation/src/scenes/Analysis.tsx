import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Cover, ease, Frame, Reveal, Title } from "../visuals";
import { ReviewIllustration } from "../illustrations";
export const Analysis = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  return (
    <Frame darkMode>
      <Cover
        name="insights"
        theme="dark"
        style={{
          position: "absolute",
          right: 160,
          top: 213,
          width: 430,
          height: 585,
          transform: `perspective(1600px) rotateY(${interpolate(f, [0, 4 * fps], [12, 6], ease)}deg) rotate(4deg)`,
        }}
      />
      <Reveal style={{ position: "absolute", left: 112, top: 243 }}>
        <Title style={{ fontSize: 96 }}>
          Entenda o que
          <br />
          pode melhorar.
        </Title>
      </Reveal>
      <Reveal
        delay={0.35}
        style={{ position: "absolute", left: 112, top: 652 }}
      >
        <ReviewIllustration />
      </Reveal>
    </Frame>
  );
};
