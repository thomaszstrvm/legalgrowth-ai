import { Composition } from "remotion";
import { LegalGrowthFilm } from "./Composition";
export const RemotionRoot = () => (
  <>
    <Composition
      id="LegalGrowth20s"
      component={LegalGrowthFilm}
      defaultProps={{ theme: "light" as const }}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="LegalGrowth20sDark"
      component={LegalGrowthFilm}
      defaultProps={{ theme: "dark" as const }}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
