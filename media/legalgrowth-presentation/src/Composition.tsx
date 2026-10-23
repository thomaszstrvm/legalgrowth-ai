import { Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import {
  DashboardScene,
  FilmProps,
  IntelligenceScene,
  PromiseScene,
  ResultsScene,
  SceneMask,
  SignatureScene,
} from "./Cinematic";
export const LegalGrowthFilm = ({ theme }: FilmProps) => {
  const { fps } = useVideoConfig();
  // Twelve-frame overlaps keep the outgoing image under the incoming mask.
  // Absolute cue times keep the composition exactly 600 frames, not 648.
  return (
    <>
      <Audio
        src={staticFile("audio/legalgrowth-original.wav") + "?score=2"}
        premountFor={fps}
      />
      <Sequence
        name="01 · Clareza"
        durationInFrames={3.4 * fps}
        premountFor={fps}
      >
        <PromiseScene theme={theme} />
      </Sequence>
      <Sequence
        name="02 · O produto"
        from={3 * fps}
        durationInFrames={4.4 * fps}
        premountFor={fps}
      >
        <SceneMask>
          <DashboardScene theme={theme} />
        </SceneMask>
      </Sequence>
      <Sequence
        name="03 · Investimento e resultados"
        from={7 * fps}
        durationInFrames={4.4 * fps}
        premountFor={fps}
      >
        <SceneMask>
          <ResultsScene theme={theme} />
        </SceneMask>
      </Sequence>
      <Sequence
        name="04 · Análise e revisão"
        from={11 * fps}
        durationInFrames={5.4 * fps}
        premountFor={fps}
      >
        <SceneMask>
          <IntelligenceScene theme={theme} />
        </SceneMask>
      </Sequence>
      <Sequence
        name="05 · LegalGrowth AI"
        from={16 * fps}
        durationInFrames={4 * fps}
        premountFor={fps}
      >
        <SceneMask>
          <SignatureScene theme={theme} />
        </SceneMask>
      </Sequence>
    </>
  );
};
