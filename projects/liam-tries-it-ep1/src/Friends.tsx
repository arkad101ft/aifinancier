import React from "react";
import { C } from "./lib";

// Original flat cartoon animals matching Liam: bold black outlines, round shapes, flat colours.
// Each: expressions neutral | happy | angry; arms down | reach (paw held out) | up.
export type Expr = "neutral" | "happy" | "angry";
export type Arms = "down" | "reach" | "up";
const INK = C.ink;
const SW = 6;

const Face: React.FC<{ cx: number; cy: number; gap: number; expr: Expr; mouthY: number; mouthW?: number; dark?: string }> = ({
  cx, cy, gap, expr, mouthY, mouthW = 26, dark = INK }) => {
  const L = cx - gap, R = cx + gap;
  return (
    <g>
      {expr === "happy" ? (
        <g stroke={dark} strokeWidth={5} fill="none" strokeLinecap="round">
          <path d={`M${L - 10} ${cy + 3} Q${L} ${cy - 9} ${L + 10} ${cy + 3}`} />
          <path d={`M${R - 10} ${cy + 3} Q${R} ${cy - 9} ${R + 10} ${cy + 3}`} />
        </g>
      ) : (
        <g fill={dark}><circle cx={L} cy={cy} r={7} /><circle cx={R} cy={cy} r={7} /></g>
      )}
      {expr === "angry" ? (
        <g stroke={dark} strokeWidth={6} strokeLinecap="round">
          <line x1={L - 14} y1={cy - 22} x2={L + 10} y2={cy - 11} />
          <line x1={R + 14} y1={cy - 22} x2={R - 10} y2={cy - 11} />
        </g>
      ) : null}
      {expr === "happy" ? (
        <path d={`M${cx - mouthW} ${mouthY - 4} Q${cx} ${mouthY + 26} ${cx + mouthW} ${mouthY - 4} Z`} fill="#7A2B33" stroke={dark} strokeWidth={5} strokeLinejoin="round" />
      ) : expr === "angry" ? (
        <path d={`M${cx - mouthW * 0.8} ${mouthY + 8} Q${cx} ${mouthY - 8} ${cx + mouthW * 0.8} ${mouthY + 8}`} fill="none" stroke={dark} strokeWidth={6} strokeLinecap="round" />
      ) : (
        <path d={`M${cx - mouthW * 0.7} ${mouthY} Q${cx} ${mouthY + 12} ${cx + mouthW * 0.7} ${mouthY}`} fill="none" stroke={dark} strokeWidth={5} strokeLinecap="round" />
      )}
    </g>
  );
};

/** limb: rounded capsule rotated about its top (shoulder/hip) */
const Limb: React.FC<{ x: number; y: number; len: number; w: number; angle: number; fill: string; end: string; stripes?: boolean }> = ({
  x, y, len, w, angle, fill, end, stripes }) => (
  <g transform={`translate(${x},${y}) rotate(${angle})`}>
    <rect x={-w / 2} y={-w / 2} width={w} height={len} rx={w / 2} fill={fill} stroke={INK} strokeWidth={SW} />
    {stripes ? [0.3, 0.55].map((k) => <line key={k} x1={-w / 2 + 3} x2={w / 2 - 3} y1={len * k} y2={len * k + 6} stroke={INK} strokeWidth={6} />) : null}
    <ellipse cx={0} cy={len - w / 2 + 2} rx={w / 2 + 3} ry={w / 2.2} fill={end} stroke={INK} strokeWidth={SW} />
  </g>
);

const armAngles = (arms: Arms): [number, number] =>
  arms === "reach" ? [12, -78] : arms === "up" ? [150, -150] : [12, -12];

/** Steam puffs for angry faces */
const Steam: React.FC<{ x: number; y: number; on: boolean; t: number }> = ({ x, y, on, t }) =>
  on ? (
    <g opacity={0.9}>
      {[-1, 1].map((s) => {
        const k = (t * 1.6 + (s > 0 ? 0.5 : 0)) % 1;
        return <circle key={s} cx={x + s * (40 + 30 * k)} cy={y - 20 - 50 * k} r={10 + 10 * k} fill="#fff" stroke={INK} strokeWidth={4} opacity={1 - k} />;
      })}
    </g>
  ) : null;

export const Zebra: React.FC<{ expr?: Expr; arms?: Arms; t?: number }> = ({ expr = "neutral", arms = "down", t = 0 }) => {
  const [la, ra] = armAngles(arms);
  const W = "#FFFFFF";
  return (
    <svg viewBox="0 0 300 420" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* tail */}
      <path d="M190 300 Q235 320 230 350" fill="none" stroke={INK} strokeWidth={SW} />
      <path d="M222 344 l18 22 l-22 -2 Z" fill={INK} />
      {/* legs */}
      <Limb x={128} y={318} len={92} w={34} angle={4} fill={W} end="#3A3A3A" stripes />
      <Limb x={172} y={318} len={92} w={34} angle={-4} fill={W} end="#3A3A3A" stripes />
      {/* body */}
      <rect x={96} y={210} width={108} height={128} rx={44} fill={W} stroke={INK} strokeWidth={SW} />
      {[240, 268, 296].map((y) => <path key={y} d={`M${100} ${y} Q150 ${y + 14} ${200} ${y}`} fill="none" stroke={INK} strokeWidth={7} />)}
      {/* arms */}
      <Limb x={104} y={228} len={86} w={30} angle={la} fill={W} end="#3A3A3A" stripes />
      <Limb x={196} y={228} len={86} w={30} angle={ra} fill={W} end="#3A3A3A" stripes />
      {/* ears + mane */}
      <ellipse cx={108} cy={62} rx={16} ry={34} transform="rotate(-24 108 62)" fill={W} stroke={INK} strokeWidth={SW} />
      <ellipse cx={192} cy={62} rx={16} ry={34} transform="rotate(24 192 62)" fill={W} stroke={INK} strokeWidth={SW} />
      <path d="M120 70 l10 -28 l10 22 l10 -28 l10 22 l10 -28 l10 26 Z" fill={INK} />
      {/* head */}
      <ellipse cx={150} cy={138} rx={64} ry={74} fill={W} stroke={INK} strokeWidth={SW} />
      <path d="M96 106 Q114 112 120 98 M92 132 Q110 138 116 124 M204 106 Q186 112 180 98 M208 132 Q190 138 184 124" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={150} cy={182} rx={46} ry={32} fill="#D4D4D4" stroke={INK} strokeWidth={SW} />
      <ellipse cx={134} cy={176} rx={6} ry={8} fill={INK} /><ellipse cx={166} cy={176} rx={6} ry={8} fill={INK} />
      <Face cx={150} cy={126} gap={30} expr={expr} mouthY={196} mouthW={20} />
      <Steam x={150} y={60} on={expr === "angry"} t={t} />
    </svg>
  );
};

export const Giraffe: React.FC<{ expr?: Expr; arms?: Arms; t?: number }> = ({ expr = "neutral", arms = "down", t = 0 }) => {
  const [la, ra] = armAngles(arms);
  const Y = "#F2C14E", P = "#B5651D", M = "#F8E1A4";
  return (
    <svg viewBox="0 0 300 560" width="100%" height="100%" style={{ overflow: "visible" }}>
      <path d="M192 450 Q236 468 230 498" fill="none" stroke={INK} strokeWidth={SW} />
      <path d="M222 492 l18 22 l-22 -2 Z" fill={P} stroke={INK} strokeWidth={3} />
      <Limb x={128} y={460} len={92} w={32} angle={4} fill={Y} end={P} />
      <Limb x={172} y={460} len={92} w={32} angle={-4} fill={Y} end={P} />
      {/* neck */}
      <rect x={124} y={150} width={52} height={230} rx={22} fill={Y} stroke={INK} strokeWidth={SW} />
      {[[150, 210, 14], [138, 262, 11], [160, 318, 13]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={P} />)}
      {/* body */}
      <rect x={94} y={350} width={112} height={130} rx={44} fill={Y} stroke={INK} strokeWidth={SW} />
      {[[122, 388, 16], [176, 402, 14], [146, 444, 15]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={P} />)}
      <Limb x={104} y={370} len={88} w={28} angle={la} fill={Y} end={P} />
      <Limb x={196} y={370} len={88} w={28} angle={ra} fill={Y} end={P} />
      {/* ossicones + ears */}
      <g stroke={INK} strokeWidth={SW}>
        <line x1={130} y1={52} x2={124} y2={18} /><line x1={170} y1={52} x2={176} y2={18} />
        <circle cx={124} cy={16} r={11} fill={P} /><circle cx={176} cy={16} r={11} fill={P} />
      </g>
      <ellipse cx={86} cy={84} rx={28} ry={13} transform="rotate(-20 86 84)" fill={Y} stroke={INK} strokeWidth={SW} />
      <ellipse cx={214} cy={84} rx={28} ry={13} transform="rotate(20 214 84)" fill={Y} stroke={INK} strokeWidth={SW} />
      {/* head */}
      <ellipse cx={150} cy={100} rx={58} ry={62} fill={Y} stroke={INK} strokeWidth={SW} />
      <circle cx={112} cy={70} r={9} fill={P} /><circle cx={190} cy={78} r={7} fill={P} />
      <ellipse cx={150} cy={138} rx={40} ry={28} fill={M} stroke={INK} strokeWidth={SW} />
      <ellipse cx={136} cy={132} rx={5} ry={6} fill={INK} /><ellipse cx={164} cy={132} rx={5} ry={6} fill={INK} />
      <Face cx={150} cy={92} gap={27} expr={expr} mouthY={150} mouthW={18} />
      <Steam x={150} y={20} on={expr === "angry"} t={t} />
    </svg>
  );
};

export const Hippo: React.FC<{ expr?: Expr; arms?: Arms; t?: number }> = ({ expr = "neutral", arms = "down", t = 0 }) => {
  const [la, ra] = armAngles(arms);
  const H = "#A9A0C8", B = "#C9C2E0", M = "#BDB3D8";
  return (
    <svg viewBox="0 0 300 420" width="100%" height="100%" style={{ overflow: "visible" }}>
      <Limb x={120} y={330} len={82} w={46} angle={3} fill={H} end={B} />
      <Limb x={180} y={330} len={82} w={46} angle={-3} fill={H} end={B} />
      <ellipse cx={150} cy={286} rx={92} ry={78} fill={H} stroke={INK} strokeWidth={SW} />
      <ellipse cx={150} cy={300} rx={56} ry={50} fill={B} />
      <Limb x={74} y={250} len={84} w={38} angle={la} fill={H} end={B} />
      <Limb x={226} y={250} len={84} w={38} angle={ra} fill={H} end={B} />
      {/* ears + eye bumps */}
      <ellipse cx={92} cy={70} rx={16} ry={14} fill={H} stroke={INK} strokeWidth={SW} />
      <ellipse cx={208} cy={70} rx={16} ry={14} fill={H} stroke={INK} strokeWidth={SW} />
      <ellipse cx={150} cy={130} rx={84} ry={72} fill={H} stroke={INK} strokeWidth={SW} />
      <ellipse cx={150} cy={170} rx={76} ry={44} fill={M} stroke={INK} strokeWidth={SW} />
      <ellipse cx={124} cy={160} rx={8} ry={10} fill={INK} /><ellipse cx={176} cy={160} rx={8} ry={10} fill={INK} />
      <Face cx={150} cy={104} gap={34} expr={expr} mouthY={190} mouthW={32} />
      <Steam x={150} y={50} on={expr === "angry"} t={t} />
    </svg>
  );
};

/** Mum: an original lioness (no mane), cardigan, clipboard reading "SEC", one eyebrow raised. */
export const Mum: React.FC<{ browUp?: number; t?: number }> = ({ browUp = 1 }) => {
  const F = "#EDBE83", M = "#F9E3BF", D = "#D9A266";
  return (
    <svg viewBox="0 0 320 460" width="100%" height="100%" style={{ overflow: "visible" }}>
      <Limb x={136} y={360} len={92} w={36} angle={3} fill={F} end={F} />
      <Limb x={184} y={360} len={92} w={36} angle={-3} fill={F} end={F} />
      {/* cardigan body */}
      <path d="M92 236 Q160 210 228 236 L238 372 Q160 392 82 372 Z" fill={C.blue} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M160 226 L160 380" stroke={INK} strokeWidth={4} />
      {/* arms holding the clipboard */}
      <Limb x={98} y={250} len={92} w={32} angle={-24} fill={C.blue} end={F} />
      <Limb x={222} y={250} len={92} w={32} angle={24} fill={C.blue} end={F} />
      {/* clipboard */}
      <g transform="translate(160 312) rotate(-4)">
        <rect x={-78} y={-58} width={156} height={124} rx={10} fill={C.woodDark} stroke={INK} strokeWidth={SW} />
        <rect x={-64} y={-40} width={128} height={96} rx={4} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
        <rect x={-26} y={-70} width={52} height={22} rx={6} fill={C.gold} stroke={INK} strokeWidth={4} />
        <text x={0} y={18} textAnchor="middle" fontFamily="'Inter Black', Inter" fontWeight={900} fontSize={48} fill={C.navy}>SEC</text>
        <line x1={-46} x2={46} y1={36} y2={36} stroke="#9AA" strokeWidth={4} />
      </g>
      {/* paws over the clipboard edge */}
      <ellipse cx={86} cy={334} rx={17} ry={15} fill={F} stroke={INK} strokeWidth={SW} />
      <ellipse cx={234} cy={334} rx={17} ry={15} fill={F} stroke={INK} strokeWidth={SW} />
      {/* ears */}
      <circle cx={100} cy={70} r={26} fill={F} stroke={INK} strokeWidth={SW} /><circle cx={100} cy={70} r={12} fill={D} />
      <circle cx={220} cy={70} r={26} fill={F} stroke={INK} strokeWidth={SW} /><circle cx={220} cy={70} r={12} fill={D} />
      {/* head */}
      <ellipse cx={160} cy={130} rx={78} ry={76} fill={F} stroke={INK} strokeWidth={SW} />
      <ellipse cx={160} cy={168} rx={36} ry={26} fill={M} />
      <path d="M150 152 Q160 147 170 152 Q166 162 160 163 Q154 162 150 152 Z" fill="#2B1D16" />
      <g fill={INK}><circle cx={128} cy={124} r={7} /><circle cx={192} cy={124} r={7} /></g>
      {/* brows: left flat, right raised */}
      <g stroke={INK} strokeWidth={6} strokeLinecap="round" fill="none">
        <line x1={114} y1={104} x2={140} y2={106} />
        <path d={`M178 ${104 - 14 * browUp} Q192 ${92 - 22 * browUp} 208 ${102 - 12 * browUp}`} />
      </g>
      {/* unimpressed mouth */}
      <path d="M146 182 Q160 178 176 184" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    </svg>
  );
};
