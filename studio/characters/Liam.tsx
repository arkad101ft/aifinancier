import React from "react";
// Shared channel asset: copy into a project and keep the C.gold import pointing at its theme.
import { C } from "./lib";

// Liam the Lion — SVG puppet rebuilt from the owner's reference image.
// viewBox 0 0 300 400; origin of the figure's feet ≈ (150, 380).

export type Expression = "happy" | "smug" | "curious" | "wince" | "impressed" | "yawn" | "serious";
export type Pose = "idle" | "crossed" | "point" | "wave" | "head";

const OUT = "#1B1B1B";
const SW = 5;
const FUR = "#F3C78C";
const MUZZLE = "#F9E3BF";
const MANE = "#E8A04C";
const MANE_DARK = "#D98A35";
const SHIRT = "#AFCBEA";
const VEST = "#8F949A";
const VEST_LINE = "#A6ABB1";

function manePath(cx: number, cy: number, r: number, bumps: number, amp: number): string {
  // scalloped circle: quadratic bumps between points on radius r
  const pts: string[] = [];
  for (let i = 0; i <= bumps; i++) {
    const a = (i / bumps) * Math.PI * 2 - Math.PI / 2;
    const am = ((i - 0.5) / bumps) * Math.PI * 2 - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) {
      pts.push(`M${x.toFixed(1)} ${y.toFixed(1)}`);
    } else {
      const qx = cx + (r + amp) * Math.cos(am);
      const qy = cy + (r + amp) * Math.sin(am);
      pts.push(`Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
  }
  return pts.join(" ") + " Z";
}

const MANE_D = manePath(150, 120, 86, 15, 26);

const Arm: React.FC<{ x: number; y: number; angle: number; flip?: boolean }> = ({ x, y, angle }) => (
  <g transform={`translate(${x},${y}) rotate(${angle})`}>
    <rect x={-14} y={-8} width={28} height={70} rx={13} fill={SHIRT} stroke={OUT} strokeWidth={SW} />
    <circle cx={0} cy={70} r={15} fill={FUR} stroke={OUT} strokeWidth={SW} />
  </g>
);

const Eyes: React.FC<{ expr: Expression; blink: boolean }> = ({ expr, blink }) => {
  const L = 124, R = 176, Y = 120;
  if (expr === "yawn" || (blink && expr !== "wince")) {
    return (
      <g stroke={OUT} strokeWidth={4.5} strokeLinecap="round" fill="none">
        <path d={`M${L - 8} ${Y} Q${L} ${Y + 6} ${L + 8} ${Y}`} />
        <path d={`M${R - 8} ${Y} Q${R} ${Y + 6} ${R + 8} ${Y}`} />
      </g>
    );
  }
  if (expr === "wince") {
    return (
      <g stroke={OUT} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d={`M${L - 9} ${Y - 7} L${L + 6} ${Y} L${L - 9} ${Y + 7}`} />
        <path d={`M${R + 9} ${Y - 7} L${R - 6} ${Y} L${R + 9} ${Y + 7}`} />
      </g>
    );
  }
  if (expr === "smug") {
    return (
      <g>
        <path d={`M${L - 8} ${Y} A8 8 0 0 0 ${L + 8} ${Y} Z`} fill={OUT} />
        <path d={`M${R - 8} ${Y} A8 8 0 0 0 ${R + 8} ${Y} Z`} fill={OUT} />
        <g stroke={OUT} strokeWidth={4} strokeLinecap="round">
          <line x1={L - 11} y1={Y - 2} x2={L + 10} y2={Y - 1} />
          <line x1={R - 10} y1={Y - 1} x2={R + 11} y2={Y - 2} />
        </g>
      </g>
    );
  }
  const r = expr === "impressed" ? 9 : expr === "curious" ? 7.5 : 6.5;
  return (
    <g>
      <circle cx={L} cy={Y} r={r} fill={OUT} />
      <circle cx={R} cy={Y} r={r} fill={OUT} />
      {r > 7 ? (
        <g fill="#fff">
          <circle cx={L + 2.5} cy={Y - 3} r={2.6} />
          <circle cx={R + 2.5} cy={Y - 3} r={2.6} />
        </g>
      ) : null}
      {expr === "serious" ? (
        <g stroke={OUT} strokeWidth={4} strokeLinecap="round">
          <line x1={L - 11} y1={Y - 15} x2={L + 10} y2={Y - 13} />
          <line x1={R - 10} y1={Y - 13} x2={R + 11} y2={Y - 15} />
        </g>
      ) : null}
      {expr === "curious" ? (
        <g stroke={OUT} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d={`M${L - 12} ${Y - 18} Q${L} ${Y - 26} ${L + 11} ${Y - 19}`} />
          <path d={`M${R - 11} ${Y - 14} Q${R} ${Y - 17} ${R + 12} ${Y - 14}`} />
        </g>
      ) : null}
      {expr === "impressed" ? (
        <g stroke={OUT} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d={`M${L - 12} ${Y - 21} Q${L} ${Y - 28} ${L + 11} ${Y - 21}`} />
          <path d={`M${R - 11} ${Y - 21} Q${R} ${Y - 28} ${R + 12} ${Y - 21}`} />
        </g>
      ) : null}
    </g>
  );
};

const Mouth: React.FC<{ expr: Expression; talk: number }> = ({ expr, talk }) => {
  const nose = <path d="M141 140 Q150 136 159 140 Q156 149 150 150 Q144 149 141 140 Z" fill="#2B1D16" />;
  let m: React.ReactNode;
  if (expr === "yawn") {
    m = <ellipse cx={150} cy={170} rx={15} ry={17} fill="#6B2730" stroke={OUT} strokeWidth={4} />;
  } else if (expr === "impressed") {
    m = <ellipse cx={150} cy={167} rx={8 + talk * 2} ry={10 + talk * 3} fill="#6B2730" stroke={OUT} strokeWidth={4} />;
  } else if (expr === "wince") {
    m = (
      <g>
        <rect x={134} y={158} width={32} height={13} rx={5} fill="#fff" stroke={OUT} strokeWidth={4} />
        <line x1={150} y1={159} x2={150} y2={170} stroke={OUT} strokeWidth={2.5} />
        <line x1={142} y1={159} x2={142} y2={170} stroke={OUT} strokeWidth={2} />
        <line x1={158} y1={159} x2={158} y2={170} stroke={OUT} strokeWidth={2} />
      </g>
    );
  } else if (talk > 0.08) {
    const h = 4 + talk * 13;
    m = (
      <g>
        <path d={`M138 158 Q150 ${158 + h * 1.6} 162 158 Q150 ${161} 138 158 Z`} fill="#6B2730" stroke={OUT}
          strokeWidth={4} strokeLinejoin="round" />
        {h > 9 ? <ellipse cx={150} cy={158 + h * 0.95} rx={6} ry={3} fill="#E37A7A" /> : null}
      </g>
    );
  } else if (expr === "serious") {
    m = <path d="M139 161 L161 161" fill="none" stroke={OUT} strokeWidth={4.5} strokeLinecap="round" />;
  } else if (expr === "smug") {
    m = <path d="M137 160 Q147 166 163 156" fill="none" stroke={OUT} strokeWidth={4.5} strokeLinecap="round" />;
  } else {
    m = (
      <path d="M150 150 L150 156 M137 157 Q143.5 166 150 157 Q156.5 166 163 157" fill="none" stroke={OUT}
        strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" />
    );
  }
  return <g>{nose}{m}</g>;
};

export const Liam: React.FC<{
  expression?: Expression; pose?: Pose; talk?: number; t?: number; lean?: number;
}> = ({ expression = "happy", pose = "idle", talk = 0, t = 0, lean = 0 }) => {
  const breathe = Math.sin(t * 2.2) * 2.2;
  const blink = expression !== "yawn" && t % 3.7 < 0.11;
  const tailSwing = Math.sin(t * 1.6) * 6;
  const headTilt = (expression === "curious" ? -7 : 0) + Math.sin(t * 0.9) * 1.5;
  const wave = Math.sin(t * 9) * 16;

  let lArm = 14, rArm = -14; // idle: arms down, slightly out
  if (pose === "point") rArm = -118;
  if (pose === "wave") rArm = -138 + wave;
  if (pose === "head") { lArm = 171; rArm = -171; }

  return (
    <svg viewBox="0 0 300 400" width="100%" height="100%" style={{ overflow: "visible" }}>
      <g transform={`rotate(${lean} 150 380)`}>
        {/* tail */}
        <g transform={`rotate(${tailSwing} 172 330)`}>
          <path d="M170 332 C205 352 228 340 236 312" fill="none" stroke={OUT} strokeWidth={SW + 6} strokeLinecap="round" />
          <path d="M170 332 C205 352 228 340 236 312" fill="none" stroke={FUR} strokeWidth={SW + 1} strokeLinecap="round" />
          <path d="M236 312 q-14 -10 -6 -24 q8 6 10 0 q10 10 4 20 q8 2 4 12 q-6 -4 -12 -8 Z" fill={MANE}
            stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
        </g>
        {/* legs */}
        <g stroke={OUT} strokeWidth={SW} fill={FUR}>
          <rect x={124} y={282} width={24} height={86} rx={10} />
          <rect x={152} y={282} width={24} height={86} rx={10} />
          <ellipse cx={132} cy={370} rx={20} ry={11} />
          <ellipse cx={168} cy={370} rx={20} ry={11} />
        </g>
        <g transform={`translate(0 ${breathe * 0.4})`}>
          {/* back arm (viewer's left) */}
          {pose !== "crossed" && pose !== "head" ? <Arm x={104} y={204} angle={lArm} /> : null}
          {/* torso: shirt + vest */}
          <path d="M106 196 Q150 184 194 196 L198 290 Q150 300 102 290 Z" fill={SHIRT} stroke={OUT} strokeWidth={SW} />
          <path d="M108 198 Q132 190 146 196 L146 292 Q124 292 104 288 Z" fill={VEST} stroke={OUT} strokeWidth={SW}
            strokeLinejoin="round" />
          <path d="M192 198 Q168 190 154 196 L154 292 Q176 292 196 288 Z" fill={VEST} stroke={OUT} strokeWidth={SW}
            strokeLinejoin="round" />
          <g stroke={VEST_LINE} strokeWidth={3}>
            {[214, 230, 246, 262, 278].map((y) => (
              <g key={y}>
                <line x1={111} y1={y} x2={143} y2={y} />
                <line x1={157} y1={y} x2={189} y2={y} />
              </g>
            ))}
          </g>
          <line x1={150} y1={198} x2={150} y2={292} stroke={OUT} strokeWidth={3} />
          {/* shirt collar */}
          <path d="M134 194 L150 210 L166 194" fill={SHIRT} stroke={OUT} strokeWidth={4} strokeLinejoin="round" />
          {/* FD badge */}
          <circle cx={172} cy={218} r={10} fill={C.gold} stroke={OUT} strokeWidth={3} />
          <text x={172} y={222} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={9.5} fill={OUT}>FD</text>
          {/* front arm (viewer's right) or crossed arms */}
          {pose === "crossed" ? (
            <g>
              <rect x={98} y={226} width={104} height={30} rx={14} fill={SHIRT} stroke={OUT} strokeWidth={SW} />
              <circle cx={116} cy={241} r={14} fill={FUR} stroke={OUT} strokeWidth={SW} />
              <circle cx={184} cy={241} r={14} fill={FUR} stroke={OUT} strokeWidth={SW} />
            </g>
          ) : pose === "idle" ? (
            <Arm x={196} y={204} angle={rArm} />
          ) : null}
        </g>
        {/* head */}
        <g transform={`translate(0 ${breathe * 0.6}) rotate(${headTilt} 150 190)`}>
          <path d={MANE_D} fill={MANE} stroke={OUT} strokeWidth={SW} strokeLinejoin="round" />
          <path d={manePath(150, 122, 70, 15, 12)} fill={MANE_DARK} opacity={0.35} />
          <ellipse cx={150} cy={128} rx={64} ry={60} fill={FUR} stroke={OUT} strokeWidth={SW} />
          <ellipse cx={150} cy={156} rx={30} ry={22} fill={MUZZLE} />
          <Eyes expr={expression} blink={blink} />
          <Mouth expr={expression} talk={talk} />
          {expression === "wince" ? (
            <path d="M212 96 q8 14 0 20 q-8 -6 0 -20 Z" fill="#9BD3F5" stroke={OUT} strokeWidth={3} />
          ) : null}
          {expression === "happy" || expression === "impressed" ? (
            <g fill="#F2A08A" opacity={0.5}>
              <ellipse cx={108} cy={146} rx={10} ry={6} />
              <ellipse cx={192} cy={146} rx={10} ry={6} />
            </g>
          ) : null}
        </g>
        {/* raised arm drawn over the mane */}
        {pose === "point" || pose === "wave" ? (
          <g transform={`translate(0 ${breathe * 0.4})`}><Arm x={196} y={204} angle={rArm} /></g>
        ) : null}
        {pose === "head" ? (
          <g transform={`translate(0 ${breathe * 0.4})`}>
            <Arm x={104} y={204} angle={lArm} /><Arm x={196} y={204} angle={rArm} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
