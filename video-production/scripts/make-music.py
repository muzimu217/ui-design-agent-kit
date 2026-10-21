#!/usr/bin/env python3
"""
Generates the music bed for the film. Everything is synthesized here, so the
result is original and carries no third-party license obligations (released as
CC0 by the project itself).

Design: a slow 60 BPM pad in A minor, plus a soft pulse on scene boundaries.
The film is 165s (extended cut); the bed fades in over 0.7s and out over the last 1.6s.

Usage: python3 scripts/make-music.py out/music.wav
"""
import math
import struct
import sys
import wave

SR = 48000
DUR = 165.0
N = int(SR * DUR)

# A minor pad voicing (Hz). Frequencies chosen to sit under speech-free captions.
CHORDS = [
    # (start_sec, [midi notes])
    (0.0, [45, 52, 57, 60]),   # Am
    (9.0, [41, 48, 53, 57]),   # Fmaj7
    (19.2, [43, 50, 55, 59]),  # G
    (24.6, [45, 52, 57, 64]),  # Am(add9)
    (31.2, [41, 48, 53, 60]),  # Fmaj7 -> resolve
]

def midi_hz(m):
    return 440.0 * (2.0 ** ((m - 69) / 12.0))

def envelope(t, start, dur, attack=1.2, release=1.6):
    if t < start or t > start + dur:
        return 0.0
    x = t - start
    a = min(1.0, x / attack) if attack > 0 else 1.0
    r = min(1.0, (dur - x) / release) if release > 0 else 1.0
    return max(0.0, min(a, r))

def main(path):
    # Pre-compute per-sample
    left = [0.0] * N
    right = [0.0] * N

    # --- pad: 4 voices per chord, detuned pairs for width ---
    for ci, (start, notes) in enumerate(CHORDS):
        end = CHORDS[ci + 1][0] if ci + 1 < len(CHORDS) else DUR
        dur = end - start + 2.2  # overlap into next chord
        for vi, note in enumerate(notes):
            f = midi_hz(note)
            for detune, pan in ((-0.7, 0.25), (0.7, 0.75)):
                fd = f * (2.0 ** (detune / 1200.0))
                phase = (ci * 0.37 + vi * 0.61) % 1.0
                amp = 0.055 / (1 + vi * 0.15)
                i0 = int(start * SR)
                i1 = min(N, int((start + dur) * SR))
                for i in range(i0, i1):
                    t = i / SR
                    e = envelope(t, start, dur, attack=1.6, release=2.0)
                    if e <= 0:
                        continue
                    # two harmonics, slow tremolo
                    trem = 1.0 + 0.12 * math.sin(2 * math.pi * 0.21 * t + vi)
                    s = (
                        math.sin(2 * math.pi * fd * t + phase * 6.283)
                        + 0.32 * math.sin(4 * math.pi * fd * t + phase * 3.1)
                        + 0.12 * math.sin(6 * math.pi * fd * t)
                    )
                    v = s * amp * e * trem
                    left[i] += v * (1.0 - pan)
                    right[i] += v * pan

    # --- sub bass: root of each chord, one octave down ---
    for ci, (start, notes) in enumerate(CHORDS):
        end = CHORDS[ci + 1][0] if ci + 1 < len(CHORDS) else DUR
        f = midi_hz(notes[0] - 12)
        i0, i1 = int(start * SR), min(N, int((end + 0.4) * SR))
        for i in range(i0, i1):
            t = i / SR
            e = envelope(t, start, end - start + 0.4, attack=0.5, release=0.6)
            v = math.sin(2 * math.pi * f * t) * 0.085 * e
            left[i] += v
            right[i] += v

    # --- pulse on scene boundaries: soft low thump, 0.35s ---
    for bt in (0.0, 4.0, 12.0, 30.0, 47.0, 64.0, 80.0, 99.0, 116.0, 132.0, 148.0):
        i0 = int(bt * SR)
        i1 = min(N, int((bt + 0.45) * SR))
        for i in range(i0, i1):
            t = (i - i0) / SR
            e = math.exp(-t * 11.0)
            f = 62.0 * math.exp(-t * 3.0) + 34.0
            v = math.sin(2 * math.pi * f * t) * 0.16 * e
            left[i] += v
            right[i] += v

    # --- gentle high shimmer, adds air without hiss ---
    for i in range(N):
        t = i / SR
        e = 0.012 * (0.6 + 0.4 * math.sin(2 * math.pi * 0.05 * t))
        v = math.sin(2 * math.pi * 2637.0 * t) * e
        left[i] += v * 0.6
        right[i] += v

    # --- master fade + soft clip ---
    fade_in = 0.7
    fade_out = 1.6
    peak = 1e-9
    for i in range(N):
        t = i / SR
        g = 1.0
        if t < fade_in:
            g *= t / fade_in
        if t > DUR - fade_out:
            g *= max(0.0, (DUR - t) / fade_out)
        left[i] *= g
        right[i] *= g
        peak = max(peak, abs(left[i]), abs(right[i]))

    norm = 0.72 / peak if peak > 0 else 1.0

    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for i in range(N):
            l = max(-1.0, min(1.0, left[i] * norm))
            r = max(-1.0, min(1.0, right[i] * norm))
            frames += struct.pack('<hh', int(l * 32767), int(r * 32767))
        w.writeframes(bytes(frames))

    print(f'wrote {path}  {DUR:.1f}s  peak_norm={norm:.2f}')

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out/music.wav')
