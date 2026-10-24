"""Validate opt-in Studio telemetry against the original synthetic WAV.

Run with Python + NumPy. This checks browser delivery/scheduling, not speakers,
Bluetooth latency or artistic quality. Raw observations are never rewritten.
"""
import argparse
import json
import wave
from pathlib import Path

import numpy as np


def analyze(path, source):
    raw = json.loads(path.read_text(encoding="utf-8"))
    samples, chunks = raw["samples"], raw["audioChunks"]
    with wave.open(str(source)) as stream:
        rate = stream.getframerate()
        reference = np.frombuffer(stream.readframes(stream.getnframes()), dtype="<i2")
        reference = reference.reshape(-1, stream.getnchannels())[:, 0].astype(float) / 32768
    anchors, spans = [], []
    for chunk in chunks:
        fingerprint = np.array(chunk["fingerprint"])
        # Exact PCM fingerprints identify the source position independently of
        # the visual timeline. No assumption that scheduled sound is in sync.
        candidates = np.flatnonzero(reference[:len(reference)-len(fingerprint)+1] == fingerprint[0])
        matches = [int(i) for i in candidates if np.array_equal(reference[i:i+len(fingerprint)], fingerprint)]
        if len(matches) != 1:
            # The first 24 silent samples are ambiguous: the first chunk is
            # accepted only at the start, and all later chunks must be unique.
            if not anchors and 0 in matches:
                position = 0
            else:
                raise AssertionError(f"Ambiguous or missing audio fingerprint in {path}")
        else:
            position = matches[0]
        assert chunk["sampleRate"] == rate and chunk["rate"] == 1
        start = position/rate + chunk["offset"]
        anchors.append(chunk["when"] - start)
        spans.append((start, start + chunk["duration"]))
    assert spans and abs(spans[0][0]) < 1/rate
    assert abs(spans[-1][1] - 20) < 1/rate
    max_gap = max(abs(b[0]-a[1]) for a,b in zip(spans, spans[1:]))
    assert max_gap < 1/rate, "Audio chunks overlap or have a gap"
    anchor = float(np.median(anchors))
    assert np.ptp(anchors) < 1/rate, "Audio scheduling clock changed during playback"
    # getOutputTimestamp maps the audio device clock to performance.now().
    # Extrapolate it to the actual visual commit, then subtract the PCM anchor.
    drift = np.array([
        (s["outputContext"]+(s["wall"]-s["outputWall"])/1000-anchor-s["frame"]/30)*1000
        for s in samples if s["outputWall"] and s["outputContext"]
    ])
    assert len(drift) >= len(samples)*.99, "Insufficient audio-output timestamps"
    result = {k:raw[k] for k in ["composition","firstFrame","lastFrame","observedFrames",
        "expectedFrames","elapsedSeconds","effectiveFps","p95FrameGapMs","maxFrameGapMs","hiddenSamples"]}
    result.update(audioChunks=len(chunks), audioSeconds=spans[-1][1],
        audioP95AbsDriftMs=float(np.percentile(np.abs(drift),95)),
        audioMaxAbsDriftMs=float(np.max(np.abs(drift))),
        signedAudioDriftRangeMs=[float(drift.min()),float(drift.max())],
        maxChunkGapMs=max_gap*1000, matchedPcmFingerprints=len(chunks))
    checks = {
        "complete": raw["firstFrame"] <= 1 and raw["lastFrame"] == 599,
        "coverage": raw["observedFrames"] / raw["expectedFrames"] >= .99,
        "fps": 29.5 <= raw["effectiveFps"] <= 30.5,
        "frame_p95": raw["p95FrameGapMs"] <= 50,
        "no_long_stall": raw["maxFrameGapMs"] <= 100,
        "foreground": raw["hiddenSamples"] == 0,
        "audio_p95": result["audioP95AbsDriftMs"] <= 1000/30,
        "audio_max": result["audioMaxAbsDriftMs"] <= 50,
    }
    result.update(checks=checks, passed=all(checks.values()))
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("reports", nargs="+", type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    source = Path(__file__).resolve().parents[1]/"public/audio/legalgrowth-original.wav"
    results = [analyze(path, source) for path in args.reports]
    args.output.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, indent=2))
    raise SystemExit(0 if all(r["passed"] for r in results) else 1)
