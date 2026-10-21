#!/usr/bin/env python3
"""
Four alternative scores for the 165s UAK intro film.

Each track is fully synthesized (numpy) so there are no third-party licence
obligations. All four share the same timeline: 13 scene boundaries at
0/4/12/22/32/42/60/78/96/115/132/148/156/165 seconds, and all end with a
1.6s tail fade so the last card never gets cut mid-note.

  A_analog-pulse   : warm analog synth pulse, 100 BPM, minor 9th pads, sidechain
  B_glass-piano    : felt-piano arpeggios + soft strings, 72 BPM, major colour
  C_deep-techno    : 124 BPM four-on-floor, sub bass, filtered stabs, risers
  D_cinematic      : 60 BPM orchestral-ish swells, timpani hits, wide reverb

Usage: python3 scripts/make-scores.py out/
"""
import math
import os
import struct
import sys
import wave

import numpy as np

SR = 48000
DUR = 165.0
N = int(SR * DUR)
SCENES = [0.0, 4.0, 12.0, 22.0, 32.0, 42.0, 60.0, 78.0, 96.0, 115.0, 132.0, 148.0, 156.0, 165.0]

t = np.arange(N) / SR


def env_ad(n, attack, decay, curve=4.0):
    """Attack-decay envelope over n samples."""
    a = max(1, int(attack * SR))
    d = max(1, n - a)
    atk = np.linspace(0, 1, a) ** 0.6
    dec = np.exp(-np.linspace(0, curve, d))
    return np.concatenate([atk, dec])[:n]


def sine(freq, n, phase=0.0):
    return np.sin(2 * np.pi * freq * np.arange(n) / SR + phase)


def saw(freq, n, phase=0.0):
    ph = (freq * np.arange(n) / SR + phase / (2 * np.pi)) % 1.0
    return 2 * ph - 1


def tri(freq, n, phase=0.0):
    ph = (freq * np.arange(n) / SR + phase / (2 * np.pi)) % 1.0
    return 4 * np.abs(ph - 0.5) - 1


def lowpass(x, cutoff_hz):
    """One-pole lowpass, vectorised-ish via lfilter-free recursion in numpy."""
    a = math.exp(-2 * math.pi * cutoff_hz / SR)
    y = np.empty_like(x)
    acc = 0.0
    # chunked python loop is too slow for 8M samples; use FFT brickwall instead
    spec = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1.0 / (1.0 + (freqs / cutoff_hz) ** 2)
    return np.fft.irfft(spec, n=len(x))


def reverb(x, mix=0.25, delay=0.09, decay=0.55):
    """Cheap multi-tap reverb."""
    out = x.copy()
    for k in range(1, 6):
        d = int(delay * k * SR)
        if d >= len(x):
            break
        out[d:] += x[:-d] * (decay ** k) * 0.5
    return x * (1 - mix) + out * mix


def write_wav(path, left, right):
    peak = max(1e-9, float(np.max(np.abs(left))), float(np.max(np.abs(right))))
    g = 0.89 / peak
    left = np.clip(left * g, -1, 1)
    right = np.clip(right * g, -1, 1)
    data = np.empty((len(left), 2), dtype='<i2')
    data[:, 0] = (left * 32767).astype('<i2')
    data[:, 1] = (right * 32767).astype('<i2')
    with wave.open(path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f'wrote {path}  {DUR:.0f}s  peak_norm={peak:.2f}')


def scene_marks():
    return SCENES


# ---------------------------------------------------------------- A
def track_analog_pulse():
    """Warm analog pulse, 100 BPM. Minor 9th pad + filtered saw arps + sidechain."""
    left = np.zeros(N)
    right = np.zeros(N)
    bpm = 100
    beat = 60 / bpm
    # chord progression in A minor: Am9 - Fmaj7 - Cmaj9 - G6
    chords = [
        [220.0, 261.63, 329.63, 493.88],
        [174.61, 220.0, 261.63, 329.63],
        [261.63, 329.63, 392.0, 493.88],
        [196.0, 246.94, 293.66, 392.0],
    ]
    bar = beat * 4
    for bi, start in enumerate(np.arange(0, DUR, bar)):
        ch = chords[bi % len(chords)]
        n = min(int(bar * SR), N - int(start * SR))
        if n <= 0:
            continue
        i0 = int(start * SR)
        seg = np.zeros(n)
        for f in ch:
            seg += sine(f, n) * 0.16 + saw(f * 2, n) * 0.05
        # slow filter sweep per bar
        seg = lowpass(seg, 900 + 700 * math.sin(bi * 0.7))
        pad_env = env_ad(n, 0.35, 3.2, curve=2.2)
        seg *= pad_env
        left[i0:i0 + n] += seg * 0.85
        right[i0:i0 + n] += np.roll(seg, 140) * 0.85

        # sidechained pulse on every beat
        for b in range(4):
            bi0 = i0 + int(b * beat * SR)
            pn = min(int(beat * 0.9 * SR), N - bi0)
            if pn <= 0:
                continue
            k = np.exp(-np.linspace(0, 7, pn))
            thump = sine(56, pn) * k * 0.34
            left[bi0:bi0 + pn] += thump
            right[bi0:bi0 + pn] += thump

    # sparkle arp, 8ths, high register
    for i, start in enumerate(np.arange(0, DUR, beat / 2)):
        n = min(int(beat * 0.42 * SR), N - int(start * SR))
        if n <= 0:
            continue
        i0 = int(start * SR)
        note = [880.0, 987.77, 1174.66, 1318.51][i % 4]
        e = env_ad(n, 0.004, 0.16, curve=6)
        v = tri(note, n) * e * 0.055
        left[i0:i0 + n] += v
        right[i0:i0 + n] += np.roll(v, 90)

    return reverb(left, 0.22), reverb(right, 0.22)


# ---------------------------------------------------------------- B
def track_glass_piano():
    """Felt piano arpeggios + soft strings, 72 BPM, major colour (C Lydian)."""
    left = np.zeros(N)
    right = np.zeros(N)
    bpm = 72
    beat = 60 / bpm
    # C Lydian: C E G B D F# A
    scale = [261.63, 329.63, 392.0, 493.88, 587.33, 739.99, 880.0]
    # slow string bed: Cmaj9 -> Am9 -> Fmaj9 -> G6
    beds = [
        [130.81, 196.0, 246.94, 329.63],
        [110.0, 164.81, 220.0, 261.63],
        [174.61, 220.0, 261.63, 349.23],
        [196.0, 246.94, 293.66, 392.0],
    ]
    bar = beat * 4
    for bi, start in enumerate(np.arange(0, DUR, bar)):
        n = min(int(bar * SR), N - int(start * SR))
        if n <= 0:
            continue
        i0 = int(start * SR)
        bed = np.zeros(n)
        for f in beds[bi % len(beds)]:
            bed += sine(f, n) * 0.11 + sine(f * 2.0, n) * 0.03
        bed = lowpass(bed, 700)
        bed *= env_ad(n, 0.8, 2.4, curve=1.4)
        left[i0:i0 + n] += bed
        right[i0:i0 + n] += np.roll(bed, 260)

    # piano-ish arpeggio: fast attack, long exponential decay, slight detune
    idx = 0
    for start in np.arange(0, DUR, beat * 0.75):
        n = min(int(beat * 2.2 * SR), N - int(start * SR))
        if n <= 0:
            break
        i0 = int(start * SR)
        f = scale[idx % len(scale)] * (2 if (idx // 7) % 3 == 1 else 1)
        idx += 1
        e = env_ad(n, 0.006, 1.9, curve=5.2)
        v = (sine(f, n) * 0.5 + sine(f * 2.01, n) * 0.2 + sine(f * 3.0, n) * 0.06) * e * 0.13
        left[i0:i0 + n] += v
        right[i0:i0 + n] += np.roll(v, 180)

    return reverb(left, 0.34, 0.11, 0.6), reverb(right, 0.34, 0.11, 0.6)


# ---------------------------------------------------------------- C
def track_deep_techno():
    """124 BPM four-on-floor, sub bass, filtered stabs, risers at scene cuts."""
    left = np.zeros(N)
    right = np.zeros(N)
    bpm = 124
    beat = 60 / bpm
    bar = beat * 4

    # kick
    for start in np.arange(0, DUR, beat):
        n = min(int(beat * 0.85 * SR), N - int(start * SR))
        if n <= 0:
            break
        i0 = int(start * SR)
        f = 130 * np.exp(-np.arange(n) / (0.028 * SR)) + 44
        ph = np.cumsum(f) / SR
        k = np.sin(2 * np.pi * ph) * np.exp(-np.linspace(0, 8.5, n)) * 0.5
        left[i0:i0 + n] += k
        right[i0:i0 + n] += k

    # sub bass: A1 with offbeat pushes
    for i, start in enumerate(np.arange(0, DUR, beat / 2)):
        if i % 4 == 0:
            continue
        n = min(int(beat * 0.42 * SR), N - int(start * SR))
        if n <= 0:
            break
        i0 = int(start * SR)
        e = env_ad(n, 0.008, 0.55, curve=4)
        v = sine(55.0, n) * e * 0.3
        left[i0:i0 + n] += v
        right[i0:i0 + n] += v

    # filtered stabs, 3-note minor cluster, every 2 bars
    stabs = [[220.0, 261.63, 311.13], [196.0, 233.08, 293.66]]
    for bi, start in enumerate(np.arange(0, DUR, bar * 2)):
        n = min(int(bar * 0.55 * SR), N - int(start * SR))
        if n <= 0:
            break
        i0 = int(start * SR)
        seg = np.zeros(n)
        for f in stabs[bi % 2]:
            seg += saw(f, n) * 0.09 + saw(f * 1.005, n) * 0.06
        seg = lowpass(seg, 1500)
        seg *= env_ad(n, 0.01, 0.6, curve=3.4)
        left[i0:i0 + n] += seg
        right[i0:i0 + n] += np.roll(seg, 200)

    # risers into each scene cut
    for cut in SCENES[2:-1]:
        n = min(int(1.5 * SR), N - int(cut * SR))
        if n <= 0:
            continue
        i0 = max(0, int((cut - 1.5) * SR))
        nn = min(n, N - i0)
        sweep = np.linspace(200, 3200, nn)
        ph = np.cumsum(sweep) / SR
        v = np.sin(2 * np.pi * ph) * np.linspace(0, 0.11, nn) ** 2
        left[i0:i0 + nn] += v
        right[i0:i0 + nn] += v

    return reverb(left, 0.18, 0.07, 0.45), reverb(right, 0.18, 0.07, 0.45)


# ---------------------------------------------------------------- D
def track_cinematic():
    """60 BPM orchestral-ish swells, timpani hits on scene changes, wide reverb."""
    left = np.zeros(N)
    right = np.zeros(N)
    bpm = 60
    beat = 60 / bpm

    # low strings drone, slow harmonic movement every 8 beats
    progressions = [
        [65.41, 98.0, 130.81, 155.56],   # C minor
        [58.27, 87.31, 116.54, 174.61],  # Bb
        [77.78, 116.54, 155.56, 196.0],  # Eb
        [87.31, 130.81, 174.61, 220.0],  # F
    ]
    span = beat * 8
    for bi, start in enumerate(np.arange(0, DUR, span)):
        n = min(int(span * SR), N - int(start * SR))
        if n <= 0:
            break
        i0 = int(start * SR)
        seg = np.zeros(n)
        for f in progressions[bi % len(progressions)]:
            seg += saw(f, n) * 0.055 + sine(f * 0.5, n) * 0.05
        seg = lowpass(seg, 520)
        seg *= env_ad(n, 1.6, 3.4, curve=1.1)
        left[i0:i0 + n] += seg
        right[i0:i0 + n] += np.roll(seg, 420)

    # timpani hit on every scene boundary
    for cut in SCENES[:-1]:
        n = min(int(2.2 * SR), N - int(cut * SR))
        if n <= 0:
            continue
        i0 = int(cut * SR)
        f = 92 * np.exp(-np.arange(n) / (0.10 * SR)) + 48
        ph = np.cumsum(f) / SR
        hit = np.sin(2 * np.pi * ph) * np.exp(-np.linspace(0, 5.5, n)) * 0.42
        left[i0:i0 + n] += hit
        right[i0:i0 + n] += hit * 0.92

    # high string counter-melody, sparse
    melody = [523.25, 622.25, 698.46, 783.99, 622.25, 523.25]
    for i, start in enumerate(np.arange(beat * 2, DUR, beat * 4)):
        n = min(int(beat * 3.4 * SR), N - int(start * SR))
        if n <= 0:
            break
        i0 = int(start * SR)
        f = melody[i % len(melody)]
        e = env_ad(n, 0.55, 1.9, curve=1.6)
        v = (sine(f, n) * 0.07 + saw(f, n) * 0.022) * e
        left[i0:i0 + n] += v
        right[i0:i0 + n] += np.roll(v, 300)

    return reverb(left, 0.42, 0.13, 0.62), reverb(right, 0.42, 0.13, 0.62)


TRACKS = {
    'A_analog-pulse': track_analog_pulse,
    'B_glass-piano': track_glass_piano,
    'C_deep-techno': track_deep_techno,
    'D_cinematic': track_cinematic,
}


def main():
    outdir = sys.argv[1] if len(sys.argv) > 1 else 'out'
    os.makedirs(outdir, exist_ok=True)
    only = sys.argv[2] if len(sys.argv) > 2 else None
    for name, fn in TRACKS.items():
        if only and only != name:
            continue
        print(f'--- {name} ---')
        l, r = fn()
        # global fade in/out so cuts never click
        fade_in = int(0.7 * SR)
        fade_out = int(1.8 * SR)
        ramp = np.linspace(0, 1, fade_in)
        l[:fade_in] *= ramp
        r[:fade_in] *= ramp
        ramp2 = np.linspace(1, 0, fade_out)
        l[-fade_out:] *= ramp2
        r[-fade_out:] *= ramp2
        write_wav(os.path.join(outdir, f'{name}.wav'), l, r)


if __name__ == '__main__':
    main()
