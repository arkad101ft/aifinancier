import React from "react";

// Original animals drawn to match Liam (public/liam.png): his proportions (big round head ≈45% of height,
// face drawn as a circle, short torso, short legs, arms hanging close), his face (small dot eyes set wide,
// cream muzzle oval, tiny dark nose, "w" smile + chin line), muted warm colours with soft shading,
// a medium black outline, and clothes. Geometry is measured off liam.png (612×987 → 300×484).
// Expressions: neutral | happy | angry.  Arms: down | reach (paw held out) | up.
export type Expr = "neutral" | "happy" | "angry";
export type Arms = "down" | "reach" | "up";

const INK = "#1E1E1E";
const SW = 4.2; // ≈ Liam's outline weight at this scale
export const VIEW_H = { zebra: 484, giraffe: 556, hippo: 484, mum: 484 };

const armAngles = (arms: Arms): [number, number] => (arms === "reach" ? [10, -80] : arms === "up" ? [152, -152] : [8, -8]);

/** soft radial shading like Liam's face (lighter centre, slightly darker rim) */
const Shade: React.FC<{ id: string; c: string; rim: string }> = ({ id, c, rim }) => (
  <radialGradient id={id} cx="50%" cy="42%" r="62%">
    <stop offset="0.55" stopColor={c} />
    <stop offset="1" stopColor={rim} />
  </radialGradient>
);

/** Liam-style face: dot eyes, cream muzzle, tiny nose, "w" mouth and chin line. */
const LiamFace: React.FC<{ cx: number; cy: number; expr: Expr; muzzle: string; muzzleRx?: number; muzzleRy?: number; nose?: string; t: number }> = ({
  cx, cy, expr, muzzle, muzzleRx = 62, muzzleRy = 44, nose = "#2A1E18", t }) => {
  const eyeY = cy - 8, L = cx - 34, R = cx + 34, mY = cy + 40;
  return (
    <g>
      <ellipse cx={cx} cy={cy + 40} rx={muzzleRx} ry={muzzleRy} fill={muzzle} />
      {expr === "happy" ? (
        <g stroke={INK} strokeWidth={4.2} fill="none" strokeLinecap="round">
          <path d={`M${L - 8} ${eyeY + 3} Q${L} ${eyeY - 7} ${L + 8} ${eyeY + 3}`} />
          <path d={`M${R - 8} ${eyeY + 3} Q${R} ${eyeY - 7} ${R + 8} ${eyeY + 3}`} />
        </g>
      ) : (
        <g fill={INK}><circle cx={L} cy={eyeY} r={6.2} /><circle cx={R} cy={eyeY} r={6.2} /></g>
      )}
      {expr === "angry" ? (
        <g stroke={INK} strokeWidth={4.6} strokeLinecap="round">
          <line x1={L - 12} y1={eyeY - 19} x2={L + 9} y2={eyeY - 10} />
          <line x1={R + 12} y1={eyeY - 19} x2={R - 9} y2={eyeY - 10} />
        </g>
      ) : null}
      {/* nose */}
      <path d={`M${cx - 10} ${mY - 16} Q${cx} ${mY - 21} ${cx + 10} ${mY - 16} Q${cx + 6} ${mY - 7} ${cx} ${mY - 6} Q${cx - 6} ${mY - 7} ${cx - 10} ${mY - 16} Z`} fill={nose} />
      {expr === "happy" ? (
        <path d={`M${cx - 22} ${mY - 2} Q${cx} ${mY + 24} ${cx + 22} ${mY - 2} Z`} fill="#8A3B3B" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      ) : expr === "angry" ? (
        <path d={`M${cx - 18} ${mY + 8} Q${cx - 9} ${mY - 2} ${cx} ${mY + 2} Q${cx + 9} ${mY - 2} ${cx + 18} ${mY + 8}`} fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      ) : (
        <g fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round">
          <path d={`M${cx} ${mY - 6} L${cx} ${mY - 1} M${cx - 22} ${mY - 2} Q${cx - 11} ${mY + 9} ${cx} ${mY - 1} Q${cx + 11} ${mY + 9} ${cx + 22} ${mY - 2}`} />
          <path d={`M${cx - 6} ${mY + 12} Q${cx + 2} ${mY + 15} ${cx + 9} ${mY + 11}`} strokeWidth={3} />
        </g>
      )}
      {expr === "angry" ? (
        <g opacity={0.92}>
          {[-1, 1].map((s) => {
            const k = (t * 1.6 + (s > 0 ? 0.5 : 0)) % 1;
            return <circle key={s} cx={cx + s * (98 + 26 * k)} cy={cy - 70 - 40 * k} r={9 + 9 * k} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} opacity={1 - k} />;
          })}
        </g>
      ) : null}
    </g>
  );
};

type BodyProps = {
  arms: Arms; skin: string; skinRim: string; shirt: string; outfit?: React.ReactNode; legStripes?: boolean; tail: React.ReactNode; id: string;
};
/** Liam's body plan: tail, legs + feet, torso in a shirt, optional outfit layer, hanging arms with sleeves and paws. */
const Body: React.FC<BodyProps> = ({ arms, skin, skinRim, shirt, outfit, legStripes, tail, id }) => {
  const [la, ra] = armAngles(arms);
  const Arm = ({ x, a }: { x: number; a: number }) => (
    <g transform={`translate(${x} 228) rotate(${a})`}>
      <rect x={-17} y={-12} width={34} height={102} rx={16} fill={shirt} stroke={INK} strokeWidth={SW} />
      <circle cx={0} cy={100} r={18} fill={skin} stroke={INK} strokeWidth={SW} />
      <path d="M-8 108 v8 M0 110 v8 M8 108 v8" stroke={INK} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
    </g>
  );
  return (
    <g>
      {tail}
      {[124, 176].map((x) => (
        <g key={x}>
          <rect x={x - 17} y={322} width={34} height={142} rx={15} fill={skin} stroke={INK} strokeWidth={SW} />
          {legStripes ? [356, 388, 420].map((y) => <path key={y} d={`M${x - 15} ${y} q15 8 30 0`} stroke="#3C3C3C" strokeWidth={7} fill="none" />) : null}
          <ellipse cx={x + (x < 150 ? -4 : 4)} cy={466} rx={24} ry={13} fill={skin} stroke={INK} strokeWidth={SW} />
        </g>
      ))}
      <path d="M80 222 Q150 196 220 222 L226 338 Q150 352 74 338 Z" fill={shirt} stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
      {outfit}
      <Arm x={84} a={la} />
      <Arm x={216} a={ra} />
      <defs><Shade id={id} c={skin} rim={skinRim} /></defs>
    </g>
  );
};

export const Zebra: React.FC<{ expr?: Expr; arms?: Arms; t?: number }> = ({ expr = "neutral", arms = "down", t = 0 }) => {
  const W = "#F4F1EA", rim = "#DCD6CA", ST = "#3C3C3C";
  return (
    <svg viewBox="0 0 300 484" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs><Shade id="zf" c={W} rim={rim} /></defs>
      <Body id="zb" arms={arms} skin={W} skinRim={rim} shirt="#E8B75F" legStripes
        tail={<g><path d="M206 330 Q248 342 248 372" fill="none" stroke={INK} strokeWidth={SW + 1} /><path d="M240 366 q10 8 16 22 q-14 2 -22 -8 Z" fill={ST} stroke={INK} strokeWidth={3} /></g>}
        outfit={<g>
          {/* hoodie pocket + drawstrings */}
          <path d="M108 292 h84 l-8 34 h-68 Z" fill="#DDA84E" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M136 222 v26 M164 222 v26" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </g>} />
      <g transform="translate(150 128) scale(1.2) translate(-150 -128)">
      {/* ears + mane tuft */}
      <ellipse cx={86} cy={44} rx={17} ry={33} transform="rotate(-26 86 44)" fill={W} stroke={INK} strokeWidth={SW} />
      <ellipse cx={86} cy={46} rx={7} ry={18} transform="rotate(-26 86 46)" fill={ST} />
      <ellipse cx={214} cy={44} rx={17} ry={33} transform="rotate(26 214 44)" fill={W} stroke={INK} strokeWidth={SW} />
      <ellipse cx={214} cy={46} rx={7} ry={18} transform="rotate(26 214 46)" fill={ST} />
      <path d="M118 44 q8 -26 18 -4 q8 -26 18 -4 q8 -26 18 -4 q8 -22 16 6 Z" fill={ST} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {/* face circle */}
      <circle cx={150} cy={122} r={92} fill="url(#zf)" stroke={INK} strokeWidth={SW} />
      <g stroke={ST} strokeWidth={9} fill="none" strokeLinecap="round">
        <path d="M66 98 Q88 102 96 84" /><path d="M62 126 Q86 128 94 112" />
        <path d="M234 98 Q212 102 204 84" /><path d="M238 126 Q214 128 206 112" />
        <path d="M134 40 Q150 52 166 40" /><path d="M128 58 Q150 70 172 58" />
      </g>
      <LiamFace cx={150} cy={122} expr={expr} muzzle="#E2DCD1" nose="#3A3A3A" t={t} />
      </g>
    </svg>
  );
};

export const Giraffe: React.FC<{ expr?: Expr; arms?: Arms; t?: number }> = ({ expr = "neutral", arms = "down", t = 0 }) => {
  const Y = "#E5C27E", rim = "#CFA662", P = "#B98450";
  const D = 72; // extra neck height (body sits D lower than Liam's)
  return (
    <svg viewBox="0 0 300 556" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs><Shade id="gf" c={Y} rim={rim} /></defs>
      <g transform={`translate(0 ${D})`}>
        <Body id="gb" arms={arms} skin={Y} skinRim={rim} shirt="#A9C3EC"
          tail={<g><path d="M206 330 Q248 342 248 372" fill="none" stroke={INK} strokeWidth={SW + 1} /><path d="M240 366 q10 8 16 22 q-14 2 -22 -8 Z" fill={P} stroke={INK} strokeWidth={3} /></g>}
          outfit={<path d="M150 230 v108" stroke="#8FA9D6" strokeWidth={4} />} />
      </g>
      {/* turtleneck covering the long neck */}
      <rect x={116} y={150} width={68} height={D + 92} rx={22} fill="#A9C3EC" stroke={INK} strokeWidth={SW} />
      {[178, 198, 218, 238].map((y) => <line key={y} x1={120} x2={180} y1={y} y2={y} stroke="#8FA9D6" strokeWidth={3} />)}
      <g transform="translate(150 118) scale(1.16) translate(-150 -118)">
      {/* ossicones + ears */}
      <g stroke={INK} strokeWidth={SW}>
        <line x1={124} y1={38} x2={118} y2={6} /><line x1={176} y1={38} x2={182} y2={6} />
        <circle cx={118} cy={5} r={10} fill={P} /><circle cx={182} cy={5} r={10} fill={P} />
      </g>
      <ellipse cx={58} cy={88} rx={30} ry={13} transform="rotate(-18 58 88)" fill={Y} stroke={INK} strokeWidth={SW} />
      <ellipse cx={242} cy={88} rx={30} ry={13} transform="rotate(18 242 88)" fill={Y} stroke={INK} strokeWidth={SW} />
      <circle cx={150} cy={112} r={88} fill="url(#gf)" stroke={INK} strokeWidth={SW} />
      {[[96, 70, 13], [204, 78, 11], [86, 128, 9], [214, 130, 10], [150, 40, 9]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={P} opacity={0.85} />)}
      <LiamFace cx={150} cy={112} expr={expr} muzzle="#F1DDB0" nose="#5A3A22" t={t} />
      </g>
    </svg>
  );
};

export const Hippo: React.FC<{ expr?: Expr; arms?: Arms; t?: number }> = ({ expr = "neutral", arms = "down", t = 0 }) => {
  const H = "#B9AFCB", rim = "#9F94B5";
  return (
    <svg viewBox="0 0 300 484" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs><Shade id="hf" c={H} rim={rim} /></defs>
      <Body id="hb" arms={arms} skin={H} skinRim={rim} shirt="#F1CBC5"
        tail={<path d="M206 330 q26 6 30 24" fill="none" stroke={INK} strokeWidth={SW + 1} strokeLinecap="round" />}
        outfit={<g>
          {/* navy dungarees */}
          <path d="M92 276 h116 l8 64 Q150 352 84 340 Z" fill="#3B4F72" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
          <rect x={120} y={252} width={60} height={34} rx={6} fill="#3B4F72" stroke={INK} strokeWidth={3.5} />
          <path d="M104 230 L122 256 M196 230 L178 256" stroke="#3B4F72" strokeWidth={9} strokeLinecap="round" />
          <circle cx={124} cy={260} r={4} fill="#E8B75F" /><circle cx={176} cy={260} r={4} fill="#E8B75F" />
        </g>} />
      <g transform="translate(150 130) scale(1.2) translate(-150 -130)">
      <ellipse cx={86} cy={44} rx={18} ry={15} fill={H} stroke={INK} strokeWidth={SW} />
      <ellipse cx={214} cy={44} rx={18} ry={15} fill={H} stroke={INK} strokeWidth={SW} />
      <circle cx={150} cy={124} r={94} fill="url(#hf)" stroke={INK} strokeWidth={SW} />
      <LiamFace cx={150} cy={124} expr={expr} muzzle="#D6CCE2" muzzleRx={74} muzzleRy={48} nose="#5C4F72" t={t} />
      <g fill="#5C4F72"><ellipse cx={128} cy={150} rx={6} ry={8} /><ellipse cx={172} cy={150} rx={6} ry={8} /></g>
      </g>
    </svg>
  );
};

/** Mum: an original lioness drawn like Liam (same face colours and features, no mane), in a cardigan,
 *  holding a clipboard reading "SEC". browUp 0..1 raises her right eyebrow. */
export const Mum: React.FC<{ browUp?: number; t?: number }> = ({ browUp = 1 }) => {
  const F = "#DCB883", rim = "#C79E66", M = "#EDD9AF";
  return (
    <svg viewBox="0 0 300 484" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs><Shade id="mf" c={F} rim={rim} /></defs>
      <Body id="mb" arms="down" skin={F} skinRim={rim} shirt="#8FB0E8"
        tail={<g><path d="M206 330 Q248 342 248 372" fill="none" stroke={INK} strokeWidth={SW + 1} /><path d="M240 366 q10 8 16 22 q-14 2 -22 -8 Z" fill="#C88A4E" stroke={INK} strokeWidth={3} /></g>}
        outfit={<g><path d="M150 214 L150 344" stroke={INK} strokeWidth={3} /><circle cx={140} cy={262} r={4} fill={INK} /><circle cx={140} cy={292} r={4} fill={INK} /></g>} />
      {/* clipboard held in front */}
      <g transform="translate(150 300) rotate(-4)">
        <rect x={-74} y={-56} width={148} height={118} rx={10} fill="#9C6535" stroke={INK} strokeWidth={SW} />
        <rect x={-61} y={-40} width={122} height={92} rx={4} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} />
        <rect x={-24} y={-68} width={48} height={20} rx={6} fill="#F5A623" stroke={INK} strokeWidth={3.5} />
        <text x={0} y={16} textAnchor="middle" fontFamily="'Inter Black', Inter" fontWeight={900} fontSize={46} fill="#13233A">SEC</text>
        <line x1={-42} x2={42} y1={34} y2={34} stroke="#9AA" strokeWidth={4} />
      </g>
      <circle cx={84} cy={300} r={17} fill={F} stroke={INK} strokeWidth={SW} />
      <circle cx={216} cy={300} r={17} fill={F} stroke={INK} strokeWidth={SW} />
      <g transform="translate(150 128) scale(1.2) translate(-150 -128)">
      {/* round lioness ears */}
      <circle cx={84} cy={50} r={24} fill={F} stroke={INK} strokeWidth={SW} /><circle cx={84} cy={50} r={11} fill="#C79E66" />
      <circle cx={216} cy={50} r={24} fill={F} stroke={INK} strokeWidth={SW} /><circle cx={216} cy={50} r={11} fill="#C79E66" />
      <circle cx={150} cy={122} r={92} fill="url(#mf)" stroke={INK} strokeWidth={SW} />
      <ellipse cx={150} cy={162} rx={62} ry={44} fill={M} />
      <g fill={INK}><circle cx={116} cy={114} r={6.2} /><circle cx={184} cy={114} r={6.2} /></g>
      <g stroke={INK} strokeWidth={4.6} strokeLinecap="round" fill="none">
        <line x1={102} y1={96} x2={128} y2={98} />
        <path d={`M170 ${96 - 12 * browUp} Q184 ${84 - 20 * browUp} 200 ${94 - 10 * browUp}`} />
      </g>
      <path d="M140 146 Q150 141 160 146 Q156 155 150 156 Q144 155 140 146 Z" fill="#2A1E18" />
      {/* unimpressed flat mouth */}
      <path d="M134 172 Q150 168 168 174" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </g>
    </svg>
  );
};
