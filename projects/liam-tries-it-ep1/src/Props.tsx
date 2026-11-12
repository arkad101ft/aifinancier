import React from "react";
import { AbsoluteFill } from "remotion";
import { C, OUT, TITLE_FONT, BODY_FONT, Layout, pop, prog, clamp01 } from "./lib";

const INK = C.ink;

/** Stand back layer: posts, back wall with hinged door, roof sign. Drawn behind Liam. */
export const StandBack: React.FC<{ L: Layout; doorOpen: number; interior?: React.ReactNode }> = ({ L, doorOpen, interior }) => {
  const s = L.stand;
  const wallTop = s.roofY + 150, doorTop = wallTop + 30;
  const dW = s.doorX1 - s.doorX0, dH = L.floorY - doorTop;
  const signX0 = s.wallX0 - 40, signX1 = s.wallX1 + 40, signW = signX1 - signX0;
  const big = Math.min(64, signW / 13.5);
  return (
    <>
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* back wall planks */}
        <rect x={s.wallX0} y={wallTop} width={s.wallX1 - s.wallX0} height={L.floorY - wallTop} fill={C.woodLight} stroke={INK} strokeWidth={OUT} />
        {Array.from({ length: Math.floor((s.wallX1 - s.wallX0) / 70) }).map((_, i) => (
          <line key={i} x1={s.wallX0 + 70 * (i + 1)} x2={s.wallX0 + 70 * (i + 1)} y1={wallTop} y2={L.floorY} stroke={C.woodDark} strokeWidth={3} opacity={0.5} />
        ))}
        {/* doorway: dark interior, then the door swinging open on its left hinge */}
        <rect x={s.doorX0} y={doorTop} width={dW} height={dH} fill="#3B2A1E" stroke={INK} strokeWidth={OUT} />
      </svg>
      {/* whatever stands in the doorway (Mum), clipped to the doorway */}
      {interior ? (
        <div style={{ position: "absolute", left: s.doorX0, top: doorTop, width: dW, height: dH, overflow: "hidden" }}>{interior}</div>
      ) : null}
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={`translate(${s.doorX0} 0) scale(${1 - 0.88 * doorOpen} 1) translate(${-s.doorX0} 0)`}>
          <rect x={s.doorX0} y={doorTop} width={dW} height={dH} fill={C.wood} stroke={INK} strokeWidth={OUT} />
          <rect x={s.doorX0 + 18} y={doorTop + 20} width={dW - 36} height={dH * 0.35} rx={6} fill="none" stroke={C.woodDark} strokeWidth={4} />
          <circle cx={s.doorX1 - 24} cy={doorTop + dH * 0.55} r={9} fill={C.gold} stroke={INK} strokeWidth={4} />
        </g>
        {/* posts */}
        <rect x={s.wallX0 - 34} y={s.roofY + 60} width={34} height={L.floorY - s.roofY - 60} fill={C.wood} stroke={INK} strokeWidth={OUT} />
        <rect x={s.wallX1} y={s.roofY + 60} width={34} height={L.floorY - s.roofY - 60} fill={C.wood} stroke={INK} strokeWidth={OUT} />
        {/* striped awning */}
        {Array.from({ length: 8 }).map((_, i) => {
          const w = signW / 8, x = signX0 + i * w;
          return <path key={i} d={`M${x} ${s.roofY + 140} h${w} v26 q${-w / 2} 26 ${-w} 0 Z`} fill={i % 2 ? C.paper : C.gold} stroke={INK} strokeWidth={4} />;
        })}
        {/* hand-painted sign */}
        <g transform={`rotate(-1.2 ${(signX0 + signX1) / 2} ${s.roofY + 70})`}>
          <rect x={signX0} y={s.roofY} width={signW} height={142} rx={14} fill={C.paper} stroke={INK} strokeWidth={OUT} />
          <text x={(signX0 + signX1) / 2} y={s.roofY + 64} textAnchor="middle" fontFamily={TITLE_FONT} fontWeight={900} fontSize={big} fill={C.navy}>LIAM'S LEMONADE FUND</text>
          <text x={(signX0 + signX1) / 2} y={s.roofY + 118} textAnchor="middle" fontFamily={TITLE_FONT} fontWeight={900} fontSize={big * 0.66} fill={C.woodDark}>20% EVERY WEEK – GUARANTEED</text>
        </g>
      </svg>
    </>
  );
};

/** Counter front (drawn in front of Liam). */
export const StandFront: React.FC<{ L: Layout }> = ({ L }) => {
  const s = L.stand, x0 = s.x - s.w / 2;
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect x={x0} y={s.counterTop} width={s.w} height={L.floorY - s.counterTop} fill={C.wood} stroke={INK} strokeWidth={OUT} />
      {Array.from({ length: 3 }).map((_, i) => (
        <line key={i} x1={x0} x2={x0 + s.w} y1={s.counterTop + (i + 1) * (L.floorY - s.counterTop) / 4} y2={s.counterTop + (i + 1) * (L.floorY - s.counterTop) / 4} stroke={C.woodDark} strokeWidth={4} opacity={0.6} />
      ))}
      <rect x={x0 - 22} y={s.counterTop - 22} width={s.w + 44} height={26} rx={6} fill={C.woodLight} stroke={INK} strokeWidth={OUT} />
      {/* little hand-drawn lemon on the front */}
      <ellipse cx={s.x} cy={(s.counterTop + L.floorY) / 2 + 6} rx={46} ry={32} fill={C.lemon} stroke={INK} strokeWidth={OUT} />
      <path d={`M${s.x + 30} ${(s.counterTop + L.floorY) / 2 - 22} q14 -14 30 -6 q-12 14 -30 6 Z`} fill="#7BB661" stroke={INK} strokeWidth={4} />
    </svg>
  );
};

/** Glass jar holding exactly three lemons. Bottom-centre at (x, y). */
export const LemonJar: React.FC<{ x: number; y: number; s?: number; highlight?: number }> = ({ x, y, s = 1, highlight = 0 }) => (
  <svg width={150 * s} height={190 * s} viewBox="0 0 150 190" style={{ position: "absolute", left: x - 75 * s, top: y - 190 * s, overflow: "visible" }}>
    {highlight > 0 ? <circle cx={75} cy={110} r={96 + 10 * Math.sin(highlight * 6)} fill="none" stroke={C.gold} strokeWidth={8} opacity={Math.min(1, highlight)} /> : null}
    <rect x={10} y={40} width={130} height={146} rx={22} fill={C.glass} stroke={INK} strokeWidth={OUT} />
    {[[48, 150], [100, 152], [74, 112]].map(([cx, cy], i) => (
      <g key={i}><ellipse cx={cx} cy={cy} rx={28} ry={21} fill={C.lemon} stroke={INK} strokeWidth={5} /><ellipse cx={cx - 9} cy={cy - 7} rx={7} ry={4} fill="#FFF6B0" /></g>
    ))}
    <rect x={20} y={20} width={110} height={26} rx={6} fill={C.gold} stroke={INK} strokeWidth={5} />
    <rect x={34} y={64} width={82} height={30} rx={5} fill={C.paper} stroke={INK} strokeWidth={3} />
    <text x={75} y={86} textAnchor="middle" fontFamily={TITLE_FONT} fontWeight={900} fontSize={19} fill={C.navy}>LEMONS</text>
  </svg>
);

/** Glass cash jar. fill 0..1 = notes inside. tip 0..1 = turned upside down. Bottom-centre at (x, y). */
export const CashJar: React.FC<{ x: number; y: number; s?: number; fill: number; tip?: number; lift?: number }> = ({ x, y, s = 1, fill, tip = 0, lift = 0 }) => {
  const h = 200, f = clamp01(fill);
  return (
    <div style={{ position: "absolute", left: x - 80 * s, top: y - h * s - lift, width: 160 * s, height: h * s,
      transform: `rotate(${180 * tip}deg)`, transformOrigin: "50% 50%" }}>
      <svg width="100%" height="100%" viewBox="0 0 160 200" style={{ overflow: "visible" }}>
        <rect x={10} y={38} width={140} height={158} rx={24} fill={C.glass} stroke={INK} strokeWidth={OUT} />
        {f > 0 ? Array.from({ length: Math.ceil(f * 6) }).map((_, i) => (
          <rect key={i} x={26 + (i % 2) * 10} y={176 - i * 20} width={98} height={26} rx={4} fill={C.money} stroke={INK} strokeWidth={3}
            transform={`rotate(${(i % 3 - 1) * 8} 80 ${186 - i * 20})`} />
        )) : null}
        <path d="M14 38 Q80 20 146 38" fill="none" stroke={INK} strokeWidth={5} />
        <rect x={40} y={98} width={80} height={44} rx={8} fill={C.paper} stroke={INK} strokeWidth={4} opacity={0.95} />
        <text x={80} y={132} textAnchor="middle" fontFamily={TITLE_FONT} fontWeight={900} fontSize={34} fill={C.navy}>$</text>
      </svg>
    </div>
  );
};

export const Note: React.FC<{ x: number; y: number; label: string; s?: number; rot?: number; opacity?: number }> = ({ x, y, label, s = 1, rot = 0, opacity = 1 }) => (
  <svg width={130 * s} height={64 * s} viewBox="0 0 130 64" style={{ position: "absolute", left: x - 65 * s, top: y - 32 * s, transform: `rotate(${rot}deg)`, opacity, overflow: "visible" }}>
    <rect x={3} y={3} width={124} height={58} rx={8} fill={C.money} stroke={INK} strokeWidth={5} />
    <circle cx={65} cy={32} r={16} fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />
    <text x={65} y={44} textAnchor="middle" fontFamily={TITLE_FONT} fontWeight={900} fontSize={label.length > 3 ? 30 : 34} fill={C.navy}>{label}</text>
  </svg>
);

export const Coin: React.FC<{ x: number; y: number; r?: number; spin?: number }> = ({ x, y, r = 22, spin = 0 }) => (
  <svg width={r * 2 + 8} height={r * 2 + 8} viewBox={`${-r - 4} ${-r - 4} ${2 * r + 8} ${2 * r + 8}`}
    style={{ position: "absolute", left: x - r - 4, top: y - r - 4, overflow: "visible" }}>
    <g transform={`scale(${Math.max(0.15, Math.abs(Math.cos(spin)))} 1)`}>
      <circle r={r} fill={C.gold} stroke={INK} strokeWidth={4} />
      <text y={r * 0.38} textAnchor="middle" fontFamily={TITLE_FONT} fontWeight={900} fontSize={r * 1.1} fill={C.navy}>$</text>
    </g>
  </svg>
);

export const Scoreboard: React.FC<{ L: Layout; t: number; t0: number; moneyIn: string; sold: string; bumpAt?: number }> = ({ L, t, t0, moneyIn, sold, bumpAt = -9 }) => {
  const p = pop(t, t0, 0.45), b = 1 + 0.08 * Math.max(0, 1 - Math.abs(t - bumpAt - 0.12) / 0.18);
  if (p <= 0) return null;
  const sb = L.scoreboard;
  return (
    <div style={{ position: "absolute", left: sb.x, top: sb.y, width: sb.w, transform: `scale(${Math.min(1.05, p) * b})`, transformOrigin: "100% 0%",
      background: C.navy, border: `6px solid ${C.gold}`, borderRadius: 20, padding: "16px 24px", fontFamily: TITLE_FONT, color: C.paper, boxShadow: `0 8px 0 ${INK}` }}>
      <div style={{ fontSize: sb.size * 0.55, color: C.gold, letterSpacing: 3 }}>SCOREBOARD</div>
      <div style={{ fontSize: sb.size, marginTop: 4 }}>Money in: <span style={{ color: C.gold }}>{moneyIn}</span></div>
      <div style={{ fontSize: sb.size }}>Lemonade sold: <span style={{ color: C.gold }}>{sold}</span></div>
    </div>
  );
};

export const Chalkboard: React.FC<{ L: Layout; t: number; t0: number; steps: [number, string][] }> = ({ L, t, t0, steps }) => {
  const p = pop(t, t0, 0.5);
  if (p <= 0) return null;
  const ch = L.chalk;
  const shown = steps.filter(([at]) => t >= at);
  const cur = shown.length ? shown[shown.length - 1] : null;
  const curPop = cur ? pop(t, cur[0], 0.35) : 0;
  return (
    <div style={{ position: "absolute", left: ch.x, top: ch.y, width: ch.w, height: ch.h, transform: `scale(${Math.min(1.05, p)})`, transformOrigin: "0% 0%",
      background: "#24453A", border: `12px solid ${C.wood}`, outline: `6px solid ${INK}`, borderRadius: 10, fontFamily: TITLE_FONT, color: "#F4F1E6",
      padding: "14px 22px", boxSizing: "border-box" }}>
      <div style={{ fontSize: ch.size * 0.8, opacity: 0.85 }}>Investors:</div>
      <div style={{ fontSize: ch.size * 2.6, lineHeight: 1, transform: `scale(${0.6 + 0.4 * Math.min(1.1, curPop)})`, transformOrigin: "0% 50%", color: C.gold }}>{cur ? cur[1] : ""}</div>
      <div style={{ fontSize: ch.size * 0.62, opacity: 0.8, marginTop: 8 }}>{shown.map(([, v]) => v).join(" → ")}</div>
    </div>
  );
};

export const Caption: React.FC<{ L: Layout; t: number; t0: number; t1: number; text: string; alarm?: boolean }> = ({ L, t, t0, t1, text, alarm }) => {
  const p = pop(t, t0, 0.4), out = prog(t, t1 - 0.25, 0.25);
  if (p <= 0 || out >= 1) return null;
  return (
    <div style={{ position: "absolute", left: L.caption.x, top: L.caption.y, transform: `scale(${Math.min(1.08, p)}) rotate(-3deg)`, transformOrigin: "0% 50%", opacity: 1 - out,
      background: alarm ? C.red : C.gold, color: alarm ? C.paper : C.navy, fontFamily: TITLE_FONT, fontSize: L.caption.size, padding: "6px 28px",
      borderRadius: 14, border: `6px solid ${INK}`, boxShadow: `0 8px 0 ${INK}`, letterSpacing: 2 }}>{text}</div>
  );
};

/** Speech bubble; (x, y) = tip of the tail (at the speaker's mouth). */
export const Bubble: React.FC<{ x: number; y: number; t: number; t0: number; t1: number; text: string; size: number; side?: "left" | "right"; maxW?: number }> = ({
  x, y, t, t0, t1, text, size, side = "right", maxW = 520 }) => {
  const p = pop(t, t0, 0.35), out = prog(t, t1 - 0.2, 0.2);
  if (p <= 0 || out >= 1) return null;
  const tail = 46;
  return (
    <div style={{ position: "absolute", left: side === "right" ? x + 10 : undefined, right: side === "left" ? -x + 10 : undefined, bottom: undefined, top: y - tail,
      transform: `translateY(-100%) scale(${Math.min(1.05, p)})`, transformOrigin: side === "right" ? "0% 100%" : "100% 100%", opacity: 1 - out, maxWidth: maxW }}>
      <div style={{ position: "relative", background: "#fff", border: `5px solid ${INK}`, borderRadius: 26, padding: "14px 22px",
        fontFamily: BODY_FONT, fontWeight: 600, fontSize: size, color: C.navy, lineHeight: 1.15, boxShadow: `0 6px 0 ${INK}` }}>
        {text}
        <svg width={50} height={tail + 8} viewBox="0 0 50 54" style={{ position: "absolute", top: "100%", marginTop: -6, [side === "right" ? "left" : "right"]: 10, transform: side === "left" ? "scaleX(-1)" : undefined } as React.CSSProperties}>
          <path d="M4 0 L40 0 L2 50 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <rect x={6} y={0} width={32} height={7} fill="#fff" />
        </svg>
      </div>
    </div>
  );
};

/** Liam's subtitles (he will be voiced by the owner). Anchored by its bottom edge so long lines grow upward. */
export const Subtitle: React.FC<{ L: Layout; t: number; lines: { start: number; end: number; text: string }[] }> = ({ L, t, lines }) => {
  const ln = lines.find((l) => t >= l.start - 0.1 && t < l.end + 0.15);
  if (!ln) return null;
  const o = Math.min(prog(t, ln.start - 0.1, 0.15), 1 - prog(t, ln.end, 0.15));
  const bottom = L.name === "9x16" ? L.H - L.tag.y + 12 : L.H - 1036;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottom, pointerEvents: "none" }}>
      <div style={{ maxWidth: L.subtitle.maxW, opacity: o, transform: `translateY(${(1 - o) * 12}px)`, background: "rgba(19,35,58,0.92)",
        border: `4px solid ${C.gold}`, borderRadius: 18, padding: "12px 28px", textAlign: "center", fontFamily: "'Inter Bold', Inter", fontWeight: 700,
        fontSize: L.subtitle.size, lineHeight: 1.22, color: "#fff" }}>
        <span style={{ color: C.gold, fontFamily: TITLE_FONT, fontSize: L.subtitle.size * 0.62, letterSpacing: 2, display: "block" }}>LIAM</span>
        {ln.text}
      </div>
    </AbsoluteFill>
  );
};

export const Tag: React.FC<{ L: Layout }> = ({ L }) => (
  <div style={{ position: "absolute", left: L.tag.x, top: L.tag.y, fontFamily: TITLE_FONT, fontSize: 22, letterSpacing: 4, color: C.paper,
    background: C.navy, padding: "6px 14px", borderRadius: 8, border: `3px solid ${C.gold}` }}>FINANCE DEN</div>
);

export const Paper: React.FC<{ L: Layout; opacity?: number }> = ({ L, opacity = 0.07 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply", opacity }}>
    <svg width={L.W} height={L.H}>
      <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width={L.W} height={L.H} filter="url(#paper)" />
    </svg>
  </AbsoluteFill>
);
