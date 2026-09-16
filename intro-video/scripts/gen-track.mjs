// Synthesizes an original 20s dark-electronic bed at 120 BPM (fpb = 0.5s).
// Structure: intro drone -> kick 2s -> riser 7.5s -> glitch gate 8.5-11s ->
// impact + drive 11-14s -> impact, half-time finale 14-18s -> outro.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const DUR = 20;
const N = SR * DUR;
const out = new Float32Array(N);
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx");
mkdirSync(OUT, { recursive: true });

const add = (start, dur, fn) => {
  const s0 = Math.floor(start * SR);
  const n = Math.floor(dur * SR);
  for (let i = 0; i < n && s0 + i < N; i++) out[s0 + i] += fn(i / SR, i / n);
};
// deterministic noise
let seed = 1;
const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647 - 0.5;
};

const kick = (t) =>
  add(t, 0.28, (ts, p) => {
    const f = 140 - 95 * Math.min(1, ts * 9);
    return Math.sin(2 * Math.PI * f * ts) * Math.exp(-p * 7) * 0.85;
  });
const hat = (t) =>
  add(t, 0.045, (ts, p) => rnd() * 2 * Math.exp(-p * 10) * 0.1);
const bass = (t, f, dur = 0.21) =>
  add(t, dur, (ts, p) => {
    const env = Math.min(1, ts * 90) * Math.exp(-p * 4);
    return (
      (Math.sin(2 * Math.PI * f * ts) + Math.sin(2 * Math.PI * f * 3 * ts) / 3.5) *
      env *
      0.3
    );
  });
const impact = (t) => {
  add(t, 0.9, (ts, p) => {
    const f = 60 - 25 * Math.min(1, ts * 3);
    return Math.sin(2 * Math.PI * f * ts) * Math.exp(-p * 4.5) * 0.9;
  });
  add(t, 0.35, (ts, p) => rnd() * 2 * Math.exp(-p * 6) * 0.35);
};

// pad drone, A minor, whole track
add(0, DUR, (ts, p) => {
  const attack = Math.min(1, ts / 2);
  const release = Math.min(1, (DUR - ts) / 2);
  return (
    (Math.sin(2 * Math.PI * 110 * ts) +
      Math.sin(2 * Math.PI * 130.81 * ts) +
      Math.sin(2 * Math.PI * 164.81 * ts)) *
    0.045 *
    attack *
    release
  );
});

const FPB = 0.5;
// kicks: 2s..8.5s every beat
for (let b = 4; b <= 16; b++) kick(b * FPB);
// glitch gate 8.5-11s: stuttered 8th-note kicks with gaps
for (const e of [17, 17.5, 18, 19, 19.5, 20.5, 21, 21.5]) kick(e * FPB);
// drive 11-14s every beat
for (let b = 22; b < 28; b++) kick(b * FPB);
// finale 14-18s half time
for (let b = 28; b <= 36; b += 2) kick(b * FPB);
// hats: offbeats 1s..18s
for (let b = 2; b < 36; b++) hat(b * FPB + 0.25);
// bass line 8ths, 1s..14s: A1 pattern with moves to C2/E2
const pat = [55, 55, 55, 55, 55, 55, 65.41, 82.41];
for (let e = 16; e < 224; e++) {
  const t = e * 0.125 + 1;
  if (t >= 14) break;
  const gl = t >= 8.5 && t < 11;
  bass(t, pat[e % 8] * (gl ? 2 : 1), 0.11);
}
// finale bass: whole notes
for (const [t, f] of [[14, 55], [16, 65.41], [17.9, 55]]) bass(t, f, 1.6);
// riser 7.5-8.5
add(7.5, 1.0, (ts, p) => rnd() * 2 * p * p * 0.4);
// impacts at glitch exit + finale entry
impact(11);
impact(14);

// normalize
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[i]));
const g = 0.9 / peak;
const buf = Buffer.alloc(44 + N * 2);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 2, 4);
buf.write("WAVE", 8);
buf.write("fmt ", 12);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 2, 28);
buf.writeUInt16LE(2, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++)
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * g)) * 32767), 44 + i * 2);
writeFileSync(join(OUT, "track.wav"), buf);
console.log("track.wav written, peak", peak.toFixed(2));
