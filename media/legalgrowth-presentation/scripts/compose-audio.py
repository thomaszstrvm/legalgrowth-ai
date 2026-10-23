"""Original LegalGrowth score v2: music and restrained, frame-aligned sound design.
No samples, downloaded music, paid APIs or client data. Python + NumPy. MIT.
The stems share one master gain, so summing them recreates the master mix.
"""
from pathlib import Path
import hashlib
import json
import wave
import numpy as np

RATE = 48_000
DURATION = 20
SEED = 20261024
CUES = [0, 3, 7, 11, 16]
N = RATE * DURATION


def place(track, signal, at, pan=0.0):
    """Mix a mono event into stereo, clipping safely at the timeline boundaries.
    at: seconds, may be negative for a lead-in. pan: -1 left, +1 right.
    Mutates track; invalid shapes, non-finite samples or pan raise ValueError.
    """
    if signal.ndim != 1 or not np.isfinite(signal).all() or not -1 <= pan <= 1:
        raise ValueError("Expected finite mono samples and pan in [-1, 1]")
    start = round(at * RATE)
    source_start = max(0, -start)
    destination_start = max(0, start)
    count = min(len(signal) - source_start, len(track) - destination_start)
    if count <= 0:
        return
    gains = np.sqrt(np.array([1 - pan, 1 + pan]) / 2)
    track[destination_start:destination_start + count] += (
        signal[source_start:source_start + count, None] * gains
    )


def frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def soft_key(midi, length=2.8):
    t = np.arange(round(length * RATE)) / RATE
    f = frequency(midi)
    attack = 1 - np.exp(-t / .013)
    # Mild, decaying FM creates a rounded transient; no sampled instrument.
    fundamental = np.sin(2 * np.pi * f * t + .55 * np.exp(-t * 7) * np.sin(2 * np.pi * f * t))
    body = fundamental * np.exp(-t * 1.65)
    body += .16 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3.5)
    return body * attack * np.minimum((length - t) / .15, 1)


def compose():
    music = np.zeros((N, 2), dtype=np.float64)
    effects = np.zeros_like(music)
    rng = np.random.default_rng(SEED)
    # Fmaj9 -> Dm9 -> Bbmaj9 -> Csus -> Fadd9. A common harmonic vocabulary,
    # with this arrangement, motif and synthesized sounds authored for this film.
    harmony = [(0, 3, [53, 60, 64, 67]), (3, 4, [50, 57, 60, 64]),
               (7, 4, [46, 53, 57, 60]), (11, 5, [48, 55, 60, 62]),
               (16, 4, [53, 60, 65, 67])]
    for at, duration, chord in harmony:
        length = duration + .75
        t = np.arange(round(length * RATE)) / RATE
        env = np.minimum(t / .7, 1) * np.minimum((length - t) / .9, 1)
        # Inspired by the observed inhale/exhale pacing, not the source audio.
        breath = .91 - .09 * np.cos(2 * np.pi * (t + at) / 6)
        env *= breath
        for index, midi in enumerate(chord):
            f = frequency(midi)
            # Slow beating and balanced panning add depth without phase inversion.
            tone = np.sin(2 * np.pi * f * t) + .32 * np.sin(2 * np.pi * f * 1.0015 * t)
            tone += .075 * np.sin(2 * np.pi * 2 * f * t)
            place(music, tone * env * (.030 if at == 11 else .037), at, (index - 1.5) * .25)
        place(music, soft_key(chord[0] - 12, 3.5) * .065, at + .08)
    # Sparse recurring motif. Leave silence between gestures, especially during IA.
    melody = [(0.25, 69, .12), (1.15, 67, .075), (2.05, 65, .09),
              (3.15, 72, .11), (4.4, 69, .07), (5.65, 67, .07),
              (7.15, 69, .10), (8.4, 72, .08), (9.65, 74, .06),
              (11.25, 67, .065), (13.5, 62, .05),
              (16.15, 65, .15), (16.25, 72, .10), (16.7, 77, .07)]
    for index, (at, midi, gain) in enumerate(melody):
        sound = soft_key(midi) * gain
        place(music, sound, at, (-1) ** index * .18)
        place(music, sound * .16, at + .31, (-1) ** (index + 1) * .28)
        place(music, sound * .08, at + .56)
    # Soft 96 bpm pulse only while product/results are shown, absent during IA.
    for at in np.arange(3.125, 10.8, .625):
        t = np.arange(round(.23 * RATE)) / RATE
        pulse = np.sin(2 * np.pi * (62 * t + 7 * .045 * (1 - np.exp(-t / .045))))
        pulse *= (1 - np.exp(-t * 180)) * np.exp(-t * 24) * .035
        place(music, pulse, float(at))
    # Air on two large reveals only. Peak is at the transition midpoint (+.2 s).
    for at, level in [(3.2, .085), (7.2, .055)]:
        t = np.arange(round(.8 * RATE)) / RATE
        noise = rng.normal(0, 1, len(t))
        noise = np.convolve(noise, np.ones(49) / 49, mode="same")
        place(effects, noise * np.sin(np.pi * t / .8) ** 2 * level, at - .4)
    # A restrained paper-like contact accent for the IA cover, not a notification.
    t = np.arange(round(.13 * RATE)) / RATE
    texture = np.convolve(rng.normal(0, 1, len(t)), np.ones(9) / 9, mode="same")
    place(effects, texture * (1 - np.exp(-t * 250)) * np.exp(-t * 65) * .028, 11.2, .1)
    # Low tonal resolution supports the logo; no cinematic boom or harsh impact.
    place(effects, soft_key(41, 2.8) * .095, 16.2)
    time = np.arange(N) / RATE
    fade = np.minimum(time / .12, 1) * np.clip((DURATION - 1 / RATE - time) / 1.35, 0, 1)
    music *= fade[:, None]
    effects *= fade[:, None]
    master = music + effects
    gain = .63 / max(float(np.max(np.abs(master))), 1e-9)
    return music * gain, effects * gain


def save_wav(path, samples):
    if samples.shape != (N, 2) or not np.isfinite(samples).all() or np.max(np.abs(samples)) >= 1:
        raise ValueError("Invalid duration, channels or clipping in output")
    with wave.open(str(path), "wb") as stream:
        stream.setnchannels(2)
        stream.setsampwidth(2)
        stream.setframerate(RATE)
        stream.writeframes(np.round(samples * 32767).astype("<i2").tobytes())


def main():
    out = Path(__file__).resolve().parents[1] / "public/audio"
    out.mkdir(exist_ok=True)
    music, effects = compose()
    master = music + effects
    for name, data in [("legalgrowth-original.wav", master), ("music-stem.wav", music), ("effects-stem.wav", effects)]:
        save_wav(out / name, data)
    provenance = {
        "version": 2, "origin": "Original offline synthesis, no samples, downloads or AI audio service",
        "license": "MIT, same as project", "sample_rate": RATE, "duration_seconds": DURATION,
        "samples_per_channel": N, "seed": SEED, "cue_seconds": CUES,
        "effects_peak_seconds": [3.2, 7.2, 11.2, 16.2],
        "pacing_reference": "https://www.bluemarinefoundation.com/the-sea-we-breathe/",
        "adaptation": "Six-second smooth amplitude cycle on pads; no reference audio reused",
        "peak_dbfs": float(20 * np.log10(np.max(np.abs(master)))),
        "rms_dbfs": float(20 * np.log10(np.sqrt(np.mean(master ** 2)))),
        "sha256": hashlib.sha256((out / "legalgrowth-original.wav").read_bytes()).hexdigest(),
        "listening_review": "Not performed; technical verification does not certify musical taste or playback devices"
    }
    (out / "provenance.json").write_text(json.dumps(provenance, indent=2), encoding="utf-8")
    print(json.dumps(provenance))


if __name__ == "__main__":
    main()
