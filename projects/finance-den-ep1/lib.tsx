import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// ── Theme (from the owner's brief) ──────────────────────────────────────────
export const C = {
  paper: "#F7F4EE",
  paper2: "#EFE9DE",
  navy: "#13233A",
  navy2: "#1E3554",
  gold: "#F5A623",
  goldSoft: "#FBD58A",
  blue: "#5B8DEF",
  blueSoft: "#B9CEF7",
  red: "#D93A3F",
  ink: "#13233A",
  grey: "#8F949A",
  green: "#5DAE7B",
};
export const FONT = "Inter, 'Inter Display', sans-serif";
export const STROKE = 5;

// ── Timeline (temporary voice word timings) ─────────────────────────────────
export type Word = { w: string; s: number; e: number };
export type Para = { text: string; start: number; end: number; words: Word[] };
export type Section = { id: string; title: string; start: number; end: number; paragraphs: Para[] };
export type Timeline = { duration: number; sections: Section[] };

export const TimelineCtx = createContext<Timeline | null>(null);
export const useTimeline = () => {
  const t = useContext(TimelineCtx);
  if (!t) throw new Error("timeline missing");
  return t;
};

const norm = (s: string) =>
  s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

const cueCache = new Map<string, number>();

/** Global time (s) at which `phrase` is spoken inside section `secId`.
 *  Exact word match first; falls back to the phrase's position in the
 *  paragraph text (always works because phrases come from the script). */
export function cueTime(tl: Timeline, secId: string, phrase: string, nth = 0): number {
  const key = `${secId}|${phrase}|${nth}`;
  const hit = cueCache.get(key);
  if (hit !== undefined) return hit;
  const sec = tl.sections.find((s) => s.id === secId);
  if (!sec) throw new Error(`no section ${secId}`);
  const target = norm(phrase).split(" ");
  let seen = 0;
  for (const p of sec.paragraphs) {
    const nt = norm(p.text);
    let idx = nt.indexOf(norm(phrase));
    while (idx >= 0) {
      if (seen === nth) {
        // try exact word match inside this paragraph
        const ws = p.words.map((w) => norm(w.w));
        for (let i = 0; i < ws.length; i++) {
          if (ws[i] === target[0] && (target.length < 2 || ws[i + 1] === target[1])) {
            // confirm proximity to the textual position
            const approx = p.start + (idx / Math.max(1, nt.length)) * (p.end - p.start);
            if (Math.abs(p.words[i].s - approx) < 6) {
              cueCache.set(key, p.words[i].s);
              return p.words[i].s;
            }
          }
        }
        const t = p.start + (idx / Math.max(1, nt.length)) * (p.end - p.start);
        cueCache.set(key, t);
        return t;
      }
      seen++;
      idx = nt.indexOf(norm(phrase), idx + 1);
    }
  }
  throw new Error(`cue not found: ${secId} "${phrase}"`);
}

/** Is a narration word being spoken at time t? Returns 0..1 mouth openness. */
export function mouthOpen(tl: Timeline, t: number): number {
  for (const s of tl.sections) {
    if (t < s.start - 0.1 || t > s.end + 0.1) continue;
    for (const p of s.paragraphs) {
      if (t < p.start || t > p.end) continue;
      for (const w of p.words) {
        if (t >= w.s && t <= w.e) {
          const k = (t - w.s) / Math.max(0.08, w.e - w.s);
          return 0.35 + 0.65 * Math.abs(Math.sin(k * Math.PI * Math.max(1, Math.round((w.e - w.s) / 0.14))));
        }
      }
    }
  }
  return 0;
}

// ── Time helpers ─────────────────────────────────────────────────────────────
export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

/** 0→1 between t0 and t0+dur (eased, clamped). */
export const prog = (t: number, t0: number, dur = 0.6, e = ease) =>
  interpolate(t, [t0, t0 + dur], [0, 1], { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Overshoot pop 0→1 (for stamps / pins). */
export const pop = (t: number, t0: number, dur = 0.45) => {
  const x = Math.min(1, Math.max(0, (t - t0) / dur));
  if (x <= 0) return 0;
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export const between = (t: number, a: number, b: number) => t >= a && t < b;

/** Fade in at a, fade out at b. */
export const vis = (t: number, a: number, b: number, fi = 0.35, fo = 0.35) =>
  Math.min(prog(t, a, fi), 1 - prog(t, b - fo, fo));

// ── Shot: a full-frame layer shown between [a,b) with a slow push-in ────────
export const Shot: React.FC<{
  a: number; b: number; children: React.ReactNode; bg?: string; push?: number;
  origin?: string; fade?: number;
}> = ({ a, b, children, bg, push = 0.06, origin = "50% 50%", fade = 0.25 }) => {
  const t = useT();
  if (t < a - 0.01 || t >= b + fade) return null;
  const k = interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = Math.min(prog(t, a, fade, Easing.linear), 1 - prog(t, b, fade, Easing.linear));
  return (
    <AbsoluteFill style={{ background: bg, opacity: o }}>
      <AbsoluteFill style={{ transform: `scale(${1 + push * k})`, transformOrigin: origin }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Text ─────────────────────────────────────────────────────────────────────
export const Big: React.FC<{
  children: React.ReactNode; size?: number; color?: string; weight?: number;
  style?: React.CSSProperties;
}> = ({ children, size = 96, color = C.navy, weight = 900, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: weight, fontSize: size, color, letterSpacing: -1.5,
    lineHeight: 1.02, ...style }}>{children}</div>
);

/** Rises + fades in at t0. */
export const Rise: React.FC<{ t0: number; children: React.ReactNode; dy?: number; style?: React.CSSProperties }> = ({
  t0, children, dy = 40, style }) => {
  const t = useT();
  const p = prog(t, t0, 0.55);
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * dy}px)`, ...style }}>{children}</div>;
};

export const Stamp: React.FC<{ t0: number; children: React.ReactNode; color?: string; rot?: number;
  size?: number; style?: React.CSSProperties }> = ({ t0, children, color = C.red, rot = -8, size = 92, style }) => {
  const t = useT();
  const p = pop(t, t0, 0.35);
  if (p <= 0) return null;
  const sc = 1.8 - 0.8 * Math.min(1, p);
  return (
    <div style={{ position: "absolute", transform: `rotate(${rot}deg) scale(${sc})`, opacity: Math.min(1, p * 1.5),
      border: `10px solid ${color}`, color, fontFamily: FONT, fontWeight: 900, fontSize: size, padding: "8px 34px",
      borderRadius: 14, letterSpacing: 4, background: "rgba(247,244,238,0.85)", ...style }}>{children}</div>
  );
};

/** Number that counts up from `from` to `to` starting at t0 over dur. */
export const countUp = (t: number, t0: number, dur: number, from: number, to: number) => {
  const p = prog(t, t0, dur, Easing.bezier(0.16, 1, 0.3, 1));
  return from + (to - from) * p;
};
export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

// ── Paper grain overlay (static, deterministic) ─────────────────────────────
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply", opacity }}>
    <svg width="1920" height="1080">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1920" height="1080" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

/** Name caption for silhouettes (no real faces). */
export const NameTag: React.FC<{ t0: number; name: string; role?: string; x: number; y: number; dark?: boolean }> = ({
  t0, name, role, x, y, dark }) => {
  const t = useT();
  const p = prog(t, t0, 0.5);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: p, transform: `translateY(${(1 - p) * 16}px)`,
      fontFamily: FONT, textAlign: "center", width: 600, marginLeft: -300 }}>
      <div style={{ display: "inline-block", background: dark ? C.paper : C.navy, color: dark ? C.navy : C.paper,
        fontWeight: 800, fontSize: 30, padding: "6px 16px", borderRadius: 8 }}>{name}</div>
      {role ? <div style={{ marginTop: 6, fontWeight: 700, fontSize: 24, color: dark ? C.paper : C.navy, opacity: 0.9 }}>{role}</div> : null}
    </div>
  );
};

/** Flat silhouette of a person (head + shoulders, no face). */
export const Silhouette: React.FC<{ x: number; y: number; s?: number; color?: string; back?: boolean; suit?: boolean }> = ({
  x, y, s = 1, color = C.navy, back, suit = true }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={-150} rx={46} ry={54} fill={color} />
    {back ? null : <ellipse cx={0} cy={-150} rx={46} ry={54} fill="none" />}
    <path d="M-110 60 C-110 -40 -70 -80 0 -82 C70 -80 110 -40 110 60 Z" fill={color} />
    {suit ? <path d="M-18 -78 L0 -30 L18 -78" fill="none" stroke={C.paper} strokeOpacity={0.35} strokeWidth={5} /> : null}
  </g>
);
