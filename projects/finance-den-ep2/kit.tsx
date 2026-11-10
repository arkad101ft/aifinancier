import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, Easing } from "remotion";
import { C, FONT, Big, Rise, Stamp, useT, useTimeline, cueTime, prog, pop, countUp, fmt, Timeline } from "./lib";
import { Land, Pin, useProjection, MapSpec } from "./Maps";

// Studio kit: illustrated shots (public/img) with camera moves, caption chips, cards, name tags,
// and the cue-driven Section runner. Shared by Finance Den episodes.
const W = 1920, H = 1080;

export type Move = "in" | "out" | "left" | "right" | "up";
export type Ctx = { t: number; cu: (p: string, n?: number) => number; a: number; b: number };
export type ShotDef = { at: string | null; img?: string; move?: Move; dim?: number; bg?: string; render?: (c: Ctx) => React.ReactNode };

// ── Building blocks ──────────────────────────────────────────────────────────
export const Illo: React.FC<{ img: string; a: number; b: number; move: Move; dim: number; blur?: number }> = ({ img, a, b, move, dim, blur = 0 }) => {
  const t = useT();
  const k = interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.6, 1) });
  let s = 1.06, x = 0, y = 0;
  if (move === "in") s = 1.04 + 0.12 * k;
  if (move === "out") s = 1.16 - 0.12 * k;
  if (move === "left") { s = 1.12; x = 70 - 140 * k; }
  if (move === "right") { s = 1.12; x = -70 + 140 * k; }
  if (move === "up") { s = 1.12; y = 50 - 100 * k; }
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: C.navy }}>
      <Img src={staticFile(`img/${img}.jpg`)} style={{ width: W, height: 1097, objectFit: "cover", position: "absolute", top: -8,
        transform: `translate(${x}px, ${y}px) scale(${s})`, filter: blur ? `blur(${blur}px)` : undefined }} />
      {dim > 0 ? <AbsoluteFill style={{ background: `rgba(19,35,58,${dim})` }} /> : null}
    </AbsoluteFill>
  );
};

/** Caption chip: navy pill with paper text, readable on any illustration. */
export const Chip: React.FC<{ t0: number; children: React.ReactNode; size?: number; gold?: boolean; style?: React.CSSProperties }> = ({
  t0, children, size = 54, gold, style }) => (
  <Rise t0={t0} style={{ display: "inline-block", ...style }}>
    <div style={{ display: "inline-block", background: gold ? C.gold : "rgba(19,35,58,0.92)", color: gold ? C.navy : C.paper,
      fontFamily: FONT, fontWeight: 900, fontSize: size, padding: "14px 30px", borderRadius: 16, letterSpacing: -0.5,
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)", borderLeft: gold ? undefined : `10px solid ${C.gold}` }}>{children}</div>
  </Rise>
);

export const Pos: React.FC<{ x?: number; y?: number; right?: number; bottom?: number; center?: boolean; children: React.ReactNode }> = ({
  x, y, right, bottom, center, children }) => (
  <div style={{ position: "absolute", left: center ? 0 : x, right: center ? 0 : right, top: y, bottom,
    textAlign: center ? "center" : undefined, display: "flex", flexDirection: "column",
    alignItems: center ? "center" : right !== undefined ? "flex-end" : "flex-start", gap: 16 }}>{children}</div>
);

/** Big headline with a dark halo so it reads on illustrations. */
export const Head: React.FC<{ t0: number; size?: number; color?: string; children: React.ReactNode }> = ({ t0, size = 110, color = C.paper, children }) => (
  <Rise t0={t0}><Big size={size} color={color} style={{ textShadow: "0 6px 0 rgba(19,35,58,0.9), 0 0 40px rgba(19,35,58,0.8)" }}>{children}</Big></Rise>
);

export const Card: React.FC<{ t0: number; children: React.ReactNode; width?: number }> = ({ t0, children, width = 1150 }) => {
  const t = useT();
  const p = pop(t, t0, 0.5);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `translateY(${(1 - Math.min(1, p)) * 120}px) scale(${0.92 + 0.08 * Math.min(1.05, p)})`,
        opacity: Math.min(1, p * 1.4), background: "rgba(247,244,238,0.97)", borderRadius: 36, padding: "56px 84px",
        border: `8px solid ${C.navy}`, boxShadow: `18px 18px 0 ${C.gold}`, width, textAlign: "center" }}>{children}</div>
    </AbsoluteFill>
  );
};

export const NameChip: React.FC<{ t0: number; name: string; role: string; x: number; y: number }> = ({ t0, name, role, x, y }) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <Rise t0={t0}>
      <div style={{ fontFamily: FONT, background: "rgba(247,244,238,0.96)", borderRadius: 14, padding: "12px 22px",
        borderLeft: `10px solid ${C.gold}`, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>
        <div style={{ fontWeight: 900, fontSize: 40, color: C.navy }}>{name}</div>
        <div style={{ fontWeight: 700, fontSize: 26, color: C.navy2 }}>{role}</div>
      </div>
    </Rise>
  </div>
);

// ── Section runner ───────────────────────────────────────────────────────────
export const Section: React.FC<{ id: string; shots: ShotDef[]; last?: boolean }> = ({ id, shots, last }) => {
  const tl = useTimeline();
  const t = useT();
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const starts = shots.map((s) => (s.at === null ? sec.start - 0.3 : cu(s.at) - 0.15));
  const endOf = (i: number) => (i + 1 < shots.length ? starts[i + 1] : last ? tl.duration + 1 : sec.end + 0.7);
  return (
    <>
      {shots.map((s, i) => {
        const a = starts[i], b = endOf(i);
        if (t < a - 0.05 || t > b + 0.45) return null;
        const o = Math.min(prog(t, a, 0.4, Easing.linear), 1 - prog(t, b, 0.4, Easing.linear));
        return (
          <AbsoluteFill key={i} style={{ opacity: i === 0 ? Math.min(1, 1 - prog(t, b, 0.4, Easing.linear)) * Math.min(1, prog(t, a, 0.4, Easing.linear)) : o, background: s.bg }}>
            {s.img ? <Illo img={s.img} a={a} b={b + 0.4} move={s.move ?? "in"} dim={s.dim ?? 0} /> : null}
            {s.render ? s.render({ t, cu, a, b }) : null}
          </AbsoluteFill>
        );
      })}
    </>
  );
};

