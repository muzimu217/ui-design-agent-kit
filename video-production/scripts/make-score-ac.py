#!/usr/bin/env python3
"""
AC mashup score for the 165s UAK intro film.

Not a crossfade: A (analog pulse, 100 BPM) and C (deep techno, 124 BPM) have
different tempos, so layering the raw files would smear. Instead the two
identities are re-composed on ONE grid:

  rhythm / bass / stabs  <- C's language (124 BPM four-on-floor, sub bass)
  pads / arps / warmth   <- A's language (minor 9th chords, filtered saw arps)

The arrangement follows the film's 13 scene boundaries and actually breathes:
kick drops out under the two "breath" scenes (chain 32-42, knowledge 132-148),
half-time under taste (60-78), everything in for the 3D gates (96-115).

Usage: python3 scripts/make-score-ac.py out/scores/AC_mashup.wav
"""
import math
import os
import sys
import wave

import numpy as np

SR = 48000
DUR = 165.0
N = int(SR * DUR)

# scene boundaries of the film (seconds)
SC = [0, 4, 12, 22, 32, 42, 60, 78, 96, 115, 132, 148, 156, 165]

# --- arrangement map: what plays in each scene ------------------------------
# kick: 0 = none, 1 = four-on-floor, 0.5 = half-time (every 2 beats)
# pad:  0..1 pad level
# arp:  0..1 arp level
# stab: 0..1 filtered stab level
# sub:  0..1 sub bass level
ARR = [
    # hook
    dict(kick=0.0, pad=0.55, arp=0.0, stab=0.0, sub=0.0),
    # proof
    dict(kick=1.0, pad=0.7, arp=0.35, stab=0.0, sub=0.5),
    # workbench
    dict(kick=1.0, pad=0.75, arp=0.6, stab=0.25, sub=0.6),
    # wall
    dict(kick=1.0, pad=0.7, arp=0.5, stab=0.5, sub=0.6),
    # chain  (breath: kick out)
    dict(kick=0.0, pad=0.85, arp=0.7, stab=0.0, sub=0.2),
    # regressions (heavy return)
    dict(kick=1.0, pad=0.6, arp=0.4, stab=0.7, sub=0.75),
    # taste (half-time)
    dict(kick=0.5, pad=0.9, arp=0.55, stab=0.2, sub=0.45),
    # learning
    dict(kick=1.0, pad=0.7, arp=0.65, stab=0.35, sub=0.6),
    # gates 3d (peak)
    dict(kick=1.0, pad=0.8, arp=0.75, stab=0.8, sub=0.8),
    # guards
    dict(kick=1.0, pad=0.7, arp=0.5, stab=0.5, sub=0.6),
    # knowledge (breath)
    dict(kick=0.0, pad=0.9, arp=0.6, stab=0.0, sub=0.2),
    # mini
    dict(kick=1.0, pad=0.6, arp=0.45, stab=0.3, sub=0.55),
    # end
    dict(kick=0.0, pad=0.7, arp=0.15, stab=0.0, sub=0.0),
]

BPM = 124
BEAT = 60 / BPM
BAR = BEAT * 4


def gain_at(t_arr):
    """Per-sample gain envelope read off the arrangement map, with 0.35s ramps."""
    g = np.zeros(len(t_arr))
    for i in range(len(SC) - 1):
        a, b = SC[i], SC[i + 1]
        m = (t_arr >= a) & (t_arr < b)
        g[m] = 1.0
    return g


def ramp_between(key):
    """Build a piecewise-constant envelope for one arrangement key with ramps."""
    env = np.zeros(N)
    for i in range(len(SC) - 1):
        a, b = SC[i], SC[i + 1]
        i0, i1 = int(a * SR), min(N, int(b * SR))
        if i1 <= i0:
            continue
        env[i0:i1] = ARR[i][key]
    # smooth every transition over 0.35s so nothing clicks
    k = int(0.35 * SR)
    if k > 1:
        kernel = np.ones(k) / k
        env = np.convolve(env, kernel, mode='same')
    return env


def env_ad(n, attack, decay, curve=4.0):
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
    spec = np.fft.rfft(x)
    freqs = np.fft.rfftfreq(len(x), 1 / SR)
    spec *= 1.0 / (1.0 + (freqs / cutoff_hz) ** 2)
    return np.fft.irfft(spec, n=len(x))


def reverb(x, mix=0.24, delay=0.09, decay=0.55):
    out = x.copy()
    for k in range(1, 6):
        d = int(delay * k * SR)
        if d >= len(x):
            break
        out[d:] += x[:-d] * (decay ** k) * 0.5
    return x * (1 - mix) + out * mix


def build():
    left = np.zeros(N)
    right = np.zeros(N)

    # ---------------------------------------------------------------- pads (A)
    # A minor 9th family, re-timed onto the 124 BPM bar grid
    chords = [
        [220.0, 261.63, 329.63, 493.88],   # Am9
        [174.61, 220.0, 261.63, 329.63],   # Fmaj7
        [261.63, 329.63, 392.0, 493.88],   # Cmaj9
        [196.0, 246.94, 293.66, 392.0],    # G6
    ]
    pad_env = ramp_between('pad')
    for bi, start in enumerate(np.arange(0, DUR, BAR * 2)):
        n = min(int(BAR * 2 * SR), N - int(start * SR))
        if n <= 0:
            break
        i0 = int(start * SR)
        seg = np.zeros(n)
        for f in chords[bi % len(chords)]:
            seg += sine(f, n) * 0.15 + saw(f * 2.0, n) * 0.045
        seg = lowpass(seg, 950 + 500 * math.sin(bi * 0.55))
        seg *= env_ad(n, 0.4, 2.8, curve=2.0)
        g = pad_env[i0:i0 + n]
        left[i0:i0 + n] += seg * g * 0.85
        right[i0:i0 + n] += np.roll(seg, 150) * g * 0.85

    # ---------------------------------------------------------------- kick (C)
    kick_env = ramp_between('kick')
    for start in np.arange(0, DUR, BEAT):
        i0 = int(start * SR)
        n = min(int(BEAT * 0.85 * SR), N - i0)
        if n <= 0:
            break
        # half-time: skip odd beats where the map says 0.5
        g = kick_env[i0]
        if g < 0.2:
            continue
        f = 132 * np.exp(-np.arange(n) / (0.026 * SR)) + 44
        ph = np.cumsum(f) / SR
        k = np.sin(2 * np.pi * ph) * np.exp(-np.linspace(0, 8.5, n)) * 0.46 * min(1.0, g)
        left[i0:i0 + n] += k
        right[i0:i0 + n] += k

    # ---------------------------------------------------------------- sub (C)
    sub_env = ramp_between('sub')
    for i, start in enumerate(np.arange(0, DUR, BEAT / 2)):
        if i % 4 == 0:
            continue
        i0 = int(start * SR)
        n = min(int(BEAT * 0.42 * SR), N - i0)
        if n <= 0:
            break
        g = sub_env[i0]
        if g < 0.05:
            continue
        e = env_ad(n, 0.008, 0.5, curve=4)
        v = sine(55.0, n) * e * 0.3 * g
        left[i0:i0 + n] += v
        right[i0:i0 + n] += v

    # ---------------------------------------------------------------- arp (A)
    arp_env = ramp_between('arp')
    arp_notes = [880.0, 987.77, 1174.66, 1318.51, 1174.66, 987.77]
    for i, start in enumerate(np.arange(0, DUR, BEAT / 2)):
        i0 = int(start * SR)
        n = min(int(BEAT * 0.4 * SR), N - i0)
        if n <= 0:
            break
        g = arp_env[i0]
        if g < 0.05:
            continue
        note = arp_notes[i % len(arp_notes)]
        e = env_ad(n, 0.004, 0.15, curve=6)
        v = tri(note, n) * e * 0.052 * g
        left[i0:i0 + n] += v
        right[i0:i0 + n] += np.roll(v, 95)

    # ---------------------------------------------------------------- stabs (C)
    stab_env = ramp_between('stab')
    stabs = [[220.0, 261.63, 311.13], [196.0, 233.08, 293.66]]
    for bi, start in enumerate(np.arange(0, DUR, BAR * 2)):
        i0 = int(start * SR)
        n = min(int(BAR * 0.5 * SR), N - i0)
        if n <= 0:
            break
        g = stab_env[i0]
        if g < 0.05:
            continue
        seg = np.zeros(n)
        for f in stabs[bi % 2]:
            seg += saw(f, n) * 0.085 + saw(f * 1.005, n) * 0.055
        seg = lowpass(seg, 1400)
        seg *= env_ad(n, 0.01, 0.55, curve=3.4)
        left[i0:i0 + n] += seg * g
        right[i0:i0 + n] += np.roll(seg, 190) * g

    # ------------------------------------------------- risers into big cuts
    for cut in [SC[5], SC[8], SC[9]]:   # regressions / gates / guards
        i1 = int(cut * SR)
        nn = min(int(1.6 * SR), i1)
        i0 = i1 - nn
        sweep = np.linspace(220, 3400, nn)
        ph = np.cumsum(sweep) / SR
        v = np.sin(2 * np.pi * ph) * np.linspace(0, 0.10, nn) ** 2
        left[i0:i1] += v
        right[i0:i1] += v

    return reverb(left, 0.22), reverb(right, 0.22)


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


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'out/scores/AC_mashup.wav'
    os.makedirs(os.path.dirname(out), exist_ok=True)
    l, r = build()
    fade_in = int(0.7 * SR)
    fade_out = int(1.8 * SR)
    l[:fade_in] *= np.linspace(0, 1, fade_in)
    r[:fade_in] *= np.linspace(0, 1, fade_in)
    l[-fade_out:] *= np.linspace(1, 0, fade_out)
    r[-fade_out:] *= np.linspace(1, 0, fade_out)
    write_wav(out, l, r)


if __name__ == '__main__':
    main()
