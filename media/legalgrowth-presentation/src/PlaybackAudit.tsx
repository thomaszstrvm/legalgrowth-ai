import { useEffect, useRef } from "react";
import {
  getRemotionEnvironment,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { audioAudit } from "./audioAudit";

type Sample = {
  frame: number;
  wall: number;
  hidden: boolean;
  audioContext: number | null;
  outputContext: number | null;
  outputWall: number | null;
};

// Opt-in Studio diagnostic. Never appears in an export or modifies the film clock.
export const PlaybackAudit = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, id } = useVideoConfig();
  const samples = useRef<Sample[]>([]);
  const report = useRef<HTMLOutputElement>(null);
  const enabled =
    !getRemotionEnvironment().isRendering &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("playbackQA");
  useEffect(() => {
    if (!enabled) return;
    const element = document.createElement("output");
    element.dataset.playbackAudit = id;
    element.style.cssText =
      "position:fixed;right:8px;bottom:8px;max-width:480px;max-height:100px;overflow:auto;z-index:10000;font:11px monospace;background:white;color:black;padding:8px";
    element.textContent = "Ready: play once from frame zero without seeking.";
    document.body.append(element);
    report.current = element;
    return () => {
      element.remove();
      report.current = null;
    };
  }, [enabled, id]);
  useEffect(() => {
    if (!enabled) return;
    const previous = samples.current[samples.current.length - 1];
    const finish = () => {
      const s = samples.current;
      if (s.length < 2 || !report.current) return;
      const gaps = s
        .slice(1)
        .map((v, i) => v.wall - s[i].wall)
        .sort((a, b) => a - b);
      report.current.textContent = JSON.stringify({
        composition: id,
        firstFrame: s[0].frame,
        lastFrame: s[s.length - 1].frame,
        observedFrames: s.length,
        expectedFrames: s[s.length - 1].frame - s[0].frame + 1,
        elapsedSeconds: (s[s.length - 1].wall - s[0].wall) / 1000,
        effectiveFps:
          ((s.length - 1) * 1000) / (s[s.length - 1].wall - s[0].wall),
        p95FrameGapMs: gaps[Math.floor(gaps.length * 0.95)],
        maxFrameGapMs: gaps[gaps.length - 1],
        hiddenSamples: s.filter((v) => v.hidden).length,
        samples: s,
        audioChunks: audioAudit.chunks,
        audioContexts: audioAudit.contexts.map((c) => ({
          sampleRate: c.sampleRate,
          baseLatency: c.baseLatency,
          outputLatency: c.outputLatency,
          state: c.state,
        })),
      });
    };
    if (frame === 0 && previous && previous.frame > durationInFrames - 10) {
      finish();
      samples.current = [];
      return;
    }
    if (frame <= 1) samples.current = [];
    if (samples.current.length === 0 && frame > 1) return;
    if (samples.current[samples.current.length - 1]?.frame === frame) return;
    const context = audioAudit.contexts[0];
    const output = context?.getOutputTimestamp();
    samples.current.push({
      frame,
      wall: performance.now(),
      hidden: document.hidden,
      audioContext: context?.currentTime ?? null,
      outputContext: output?.contextTime ?? null,
      outputWall: output?.performanceTime ?? null,
    });
    if (frame === durationInFrames - 1) finish();
  }, [frame, enabled, fps, durationInFrames, id]);
  return null;
};
