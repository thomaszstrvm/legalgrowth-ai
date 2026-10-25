"""Original 20-second product launch score on a 120 BPM / 60 FPS grid.

No imported audio, prior score modification, external service or resampling.
The open-interval identity remains familiar; this arrangement is newly authored.
"""
from pathlib import Path
import hashlib
import json
import wave

import numpy as np

RATE = 48_000
SECONDS = 20
FPS = 60
BPM = 120
N = RATE * SECONDS
BEAT_SECONDS = 60 / BPM
BEAT_FRAMES = round(BEAT_SECONDS * FPS)
BEATS = list(range(40))
CUES = [(0, "opening"), (3, "campaign"), (6, "review_point"),
        (8, "evidence"), (12, "report"), (16, "closing")]


def tone(hz, duration=1.65, decay=1.55):
    t = np.arange(round(duration * RATE)) / RATE
    phase = 2 * np.pi * hz * t
    body = np.sin(phase + .15 * np.exp(-t * 5) * np.sin(phase * 2))
    body += .12 * np.sin(phase * 2) * np.exp(-t * 3)
    attack = np.sin(np.minimum(t / .04, 1) * np.pi / 2) ** 2
    release = np.sin(np.clip((duration - t) / .22, 0, 1) * np.pi / 2) ** 2
    return body * attack * np.exp(-t * decay) * release


def compose():
    track = np.zeros((N, 2), dtype=np.float64)

    def place(sound, seconds, gain, pan=0):
        start = round(seconds * RATE)
        if start < 0 or start + len(sound) > N:
            raise ValueError("Cue exceeds 20-second timeline")
        channel_gain = np.sqrt(np.array([1 - pan, 1 + pan]) / 2)
        track[start:start + len(sound)] += sound[:, None] * gain * channel_gain

    # Forty soft pulses make the tempo measurable. Their level remains below
    # the motif; they are a light rhythmic floor, not forty impacts.
    t = np.arange(round(.24 * RATE)) / RATE
    pulse = np.sin(2 * np.pi * 110 * t) + .18 * np.sin(2 * np.pi * 220 * t)
    pulse *= np.sin(np.minimum(t / .018, 1) * np.pi / 2) ** 2
    pulse *= np.exp(-t * 17) * np.clip((.24 - t) / .04, 0, 1)
    for beat in BEATS:
        gain = .07 if beat % 4 == 0 else .042
        if beat >= 32:
            gain *= 1 - (beat - 32) / 10
        place(pulse, beat * BEAT_SECONDS, gain)

    # Two related cells, always on the same half-second grid. Deliberate gaps
    # in the notes leave space for product actions, while decays keep continuity.
    cells = [((0, 220, .145), (1, 330, .095), (3, 220, .115)),
             ((0, 220, .135), (2, 440, .075), (3, 330, .085))]
    for cell_index in range(8):
        base_beat = cell_index * 4
        for offset, hz, level in cells[cell_index % 2]:
            if base_beat + offset >= 32:
                continue
            # Reading chapters have slightly lower density in level, not speed.
            level *= .82 if 12 <= base_beat < 24 else 1.0
            place(tone(hz), (base_beat + offset) * BEAT_SECONDS, level,
                  -.08 if hz == 220 else .08)

    # Soft landmarks reinforce six scene entries without noise sweeps.
    for seconds, _ in CUES:
        place(tone(165, .48, 7), seconds, .055)

    # Signature retains a real decaying tail; final pulse ends before 19.8 s.
    place(tone(220, 3.8, .65), 16, .13, -.05)
    place(tone(330, 2.8, .95), 17, .075, .05)
    place(tone(220, 1.8, 1.05), 18, .045)
    time = np.arange(N) / RATE
    fade = np.clip(time / .055, 0, 1) * np.clip((19.8 - time) / .40, 0, 1)
    track *= fade[:, None]
    # No peak-normalization boost. Only attenuate if the ceiling is exceeded.
    track *= min(1.0, .48 / max(float(np.max(np.abs(track))), 1e-9))
    return track


def main():
    folder = Path(__file__).resolve().parents[1] / "public/audio"
    wav_path = folder / "product-launch60-v1.wav"
    report_path = folder / "product-launch60-v1.json"
    if wav_path.exists() or report_path.exists():
        raise FileExistsError("Launch60 v1 exists; preserve it and use an explicitly approved new revision")
    samples = compose()
    assert samples.shape == (N, 2) and np.isfinite(samples).all()
    assert np.max(np.abs(samples)) <= .48
    assert np.all(samples[0] == 0) and np.all(samples[-1] == 0)
    assert np.array_equal(samples, compose())
    assert BEAT_FRAMES == 30 and len(BEATS) == 40
    assert all(round(i * BEAT_SECONDS * RATE) == i * 24000 for i in BEATS)
    # Check that continuity is not being claimed over an empty late soundtrack.
    for start in np.arange(.1, 19.6, .1):
        assert np.any(samples[round(start * RATE):round((start + .1) * RATE)] != 0), start
    pcm = np.round(samples * 32767).astype("<i2")
    with wave.open(str(wav_path), "wb") as stream:
        stream.setnchannels(2)
        stream.setsampwidth(2)
        stream.setframerate(RATE)
        stream.writeframes(pcm.tobytes())
    with wave.open(str(wav_path), "rb") as stream:
        assert (stream.getnframes(), stream.getframerate(), stream.getnchannels(), stream.getsampwidth()) == (N, RATE, 2, 2)
        assert stream.readframes(N) == pcm.tobytes()
    report = {
        "version": "product-launch60-v1", "origin": "Original deterministic offline NumPy synthesis; no imported music or external service",
        "license": "MIT, same as project", "duration_seconds": SECONDS,
        "video_fps": FPS, "video_frames": 1200, "sample_rate": RATE, "channels": 2,
        "bpm": BPM, "beat_seconds": BEAT_SECONDS, "beat_frames": BEAT_FRAMES,
        "beat_grid": [{"beat": i + 1, "frame": i * BEAT_FRAMES, "seconds": i * BEAT_SECONDS,
                       "sample": i * 24000} for i in BEATS],
        "cues": [{"name": name, "seconds": seconds, "frame": seconds * FPS} for seconds, name in CUES],
        "tail_end_seconds": 19.8,
        "peak_dbfs": float(20 * np.log10(np.max(np.abs(samples)))),
        "rms_dbfs": float(20 * np.log10(np.sqrt(np.mean(samples ** 2)))),
        "gain_policy": "Fixed moderate levels, attenuation-only ceiling .48; no target-LUFS normalization",
        "generator_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "wav": {"name": wav_path.name, "bytes": wav_path.stat().st_size, "sha256": hashlib.sha256(wav_path.read_bytes()).hexdigest()},
        "checks": {"finite": True, "no_sample_clipping": True, "silent_endpoints": True,
                   "deterministic_pcm": True, "metadata_readback": True, "forty_beat_grid": True,
                   "continuity": "Nonzero signal in each100ms window sampled from0.1 through19.6s"},
        "limitations": ["Not listened to; musical and perceived synchronization review pending",
                        "RMS is not LUFS; true peak not inferred from sample peak",
                        "Beat positions and video fps are timing metadata, not a rendered-video validation"],
    }
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({key: report[key] for key in ['version', 'peak_dbfs', 'rms_dbfs', 'wav', 'checks']}, ensure_ascii=False))


if __name__ == "__main__":
    main()
