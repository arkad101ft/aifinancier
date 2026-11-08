import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import {
  C, FONT, Shot, Big, Rise, Stamp, NameTag, Silhouette, useT, useTimeline, cueTime, prog, pop, countUp, fmt, vis,
} from "./lib";
import { Land, Pin, useProjection, MapSpec } from "./Maps";

const W = 1920, H = 1080;

// ── Shared illustrations ─────────────────────────────────────────────────────
export const Skyline: React.FC<{ t: number; mode: "night" | "dusk" }> = ({ t, mode }) => {
  const night = mode === "night";
  const sky = night ? C.navy : "#F2B866";
  const sky2 = night ? C.navy2 : "#F7D9A1";
  const bld = night ? "#0C1828" : "#2B3B57";
  const win = C.gold;
  const towers = [
    [180, 520, 120], [320, 430, 90], [430, 560, 140], [600, 470, 100], [1380, 450, 110], [1510, 380, 90],
    [1620, 520, 150], [1790, 440, 110],
  ];
  return (
    <svg width={W} height={H}>
      <defs>
        <linearGradient id={`sky-${mode}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky} />
          <stop offset="1" stopColor={sky2} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#sky-${mode})`} />
      {night ? [...Array(40)].map((_, i) => (
        <circle key={i} cx={(i * 397) % W} cy={(i * 131) % 420} r={i % 3 === 0 ? 2.6 : 1.6} fill={C.paper}
          opacity={0.35 + 0.35 * Math.abs(Math.sin(t * 1.3 + i))} />
      )) : <circle cx={1500} cy={560} r={90} fill="#FBE3B0" opacity={0.9} />}
      {/* generic towers */}
      {towers.map(([x, top, w], i) => (
        <g key={i}>
          <rect x={x} y={top} width={w} height={800 - top} fill={bld} />
          {[...Array(Math.floor((800 - top) / 34))].map((_, r) =>
            [...Array(Math.floor(w / 26))].map((__, c) => (
              <rect key={`${r}-${c}`} x={x + 9 + c * 26} y={top + 14 + r * 34} width={11} height={15} fill={win}
                opacity={((r * 7 + c * 3 + i) % 5 === 0) ? 0.25 : night ? 0.85 : 0.45} />
            )))}
        </g>
      ))}
      {/* three-tower hotel with a sky deck (architecture, no logo) */}
      <g fill={night ? "#16253A" : "#33445F"} stroke={night ? C.gold : C.navy} strokeWidth={3}>
        <path d="M800 800 L820 330 L880 330 L870 800 Z" />
        <path d="M930 800 L945 320 L1005 320 L1000 800 Z" />
        <path d="M1060 800 L1070 310 L1130 310 L1130 800 Z" />
        <path d="M770 300 Q960 270 1170 296 L1172 322 Q960 300 768 326 Z" fill={night ? C.gold : C.navy} />
      </g>
      {/* lotus-shaped museum */}
      <path d="M560 800 Q600 730 650 790 Q690 720 740 790 Q780 735 800 800 Z" fill={night ? "#E8E2D6" : C.paper} opacity={0.9} />
      {/* water */}
      <rect x={0} y={800} width={W} height={280} fill={night ? "#0E1B2E" : "#3F5E86"} />
      {[...Array(14)].map((_, i) => (
        <rect key={i} x={((i * 233 + t * 30) % (W + 200)) - 100} y={830 + (i % 5) * 46} width={120} height={5} rx={2}
          fill={C.gold} opacity={0.35} />
      ))}
    </svg>
  );
};

const Coin: React.FC<{ x: number; y: number; r?: number; label?: string }> = ({ x, y, r = 34, label = "$" }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={r} fill={C.gold} stroke={C.navy} strokeWidth={5} />
    <circle r={r * 0.72} fill="none" stroke={C.navy} strokeWidth={2.5} opacity={0.4} />
    <text y={r * 0.36} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={r} fill={C.navy}>{label}</text>
  </g>
);

const MoneyStack: React.FC<{ x: number; y: number; h: number; w?: number }> = ({ x, y, h, w = 150 }) => (
  <g>
    {[...Array(Math.max(0, Math.round(h)))].map((_, i) => (
      <g key={i}>
        <rect x={x} y={y - (i + 1) * 18} width={w} height={18} rx={3} fill="#A9D3A0" stroke={C.navy} strokeWidth={3} />
        <rect x={x + w / 2 - 14} y={y - (i + 1) * 18 + 2} width={28} height={14} fill={C.paper} opacity={0.7} />
      </g>
    ))}
  </g>
);

// ── Section 1: hook ─────────────────────────────────────────────────────────
export const S01: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s01_hook";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const tTypo = cu("That's not a typo");
  const tIsland = cu("On an island");
  const tPort = cu("Most people will tell");
  const tNotWhy = cu("But that's not why");
  const tThird = cu("It's not why Singapore");
  const tStory = cu("The real story");
  const tCount = cu("one and a half trillion");

  const SG: MapSpec = { width: 1500, height: 820, bounds: [[103.59, 1.15], [104.1, 1.48]], res: "10m" };
  const WORLD: MapSpec = { width: 1800, height: 900, bounds: [[-130, -45], [160, 72]], kind: "equalEarth", res: "110m" };

  return (
    <>
      <Shot a={sec.start - 0.6} b={tTypo} push={0.08} origin="50% 70%">
        <Skyline t={t} mode="night" />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 120 }}>
          <Big size={150} color={C.gold} style={{ fontVariantNumeric: "tabular-nums" }}>
            ${fmt(countUp(t, tCount - 0.2, 3.2, 0, 1485000000000))}
          </Big>
          <Rise t0={tCount + 2.2}><Big size={64} color={C.paper} weight={800}>every day</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tTypo} b={tIsland} bg={C.paper}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Big size={240} style={{ transform: `scale(${0.9 + 0.1 * pop(t, tTypo + 0.8)})` }}>TRILLION</Big>
          <div style={{ width: 1000 * prog(t, tTypo + 1.2, 0.8), height: 14, background: C.gold, borderRadius: 7, marginTop: 10 }} />
          <Rise t0={tTypo + 1.6}><Big size={60} weight={800} color={C.blue} style={{ marginTop: 30 }}>with a T · every day</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tIsland} b={tPort} bg={C.blueSoft}>
        <svg width={W} height={H}>
          <g transform="translate(210,130)">
            <Land spec={SG} only={["Singapore"]} fill={() => C.paper} strokeWidth={6} draw={prog(t, tIsland, 1.2)} />
          </g>
          {(() => {
            const k = prog(t, tIsland + 1.0, 3.2, (x) => x);
            const x = 420 + 1100 * k, y = 600 - 90 * Math.sin(k * Math.PI);
            return (
              <g transform={`translate(${x},${y})`} opacity={k > 0 ? 1 : 0}>
                <rect x={-46} y={-22} width={92} height={36} rx={12} fill={C.red === "" ? C.blue : C.blue} stroke={C.navy} strokeWidth={5} />
                <rect x={-26} y={-40} width={50} height={24} rx={8} fill={C.blueSoft} stroke={C.navy} strokeWidth={5} />
                <circle cx={-26} cy={16} r={11} fill={C.navy} /><circle cx={26} cy={16} r={11} fill={C.navy} />
              </g>
            );
          })()}
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
          <Rise t0={tIsland + 1.6}><Big size={72}>under an hour, coast to coast</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tPort} b={tNotWhy} bg={C.blueSoft}>
        <svg width={W} height={H}>
          <rect y={700} width={W} height={380} fill="#7FA6E8" />
          <g transform={`translate(${380 + 60 * prog(t, tPort, 6, (x) => x)},0)`}>
            <path d="M260 700 L360 820 L1100 820 L1200 700 Z" fill={C.navy} />
            {[...Array(12)].map((_, i) => (
              <rect key={i} x={380 + (i % 6) * 120} y={600 - Math.floor(i / 6) * 70} width={110} height={64}
                fill={[C.gold, C.blue, C.red === "" ? C.gold : "#E07A3F", C.goldSoft][i % 4]} stroke={C.navy} strokeWidth={4} />
            ))}
            <rect x={1000} y={520} width={90} height={180} fill={C.paper} stroke={C.navy} strokeWidth={5} />
          </g>
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
          <Rise t0={tPort + 1.2}><Big size={80}>Ships. Containers. Location.</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tNotWhy} b={tThird} bg={C.paper}>
        <svg width={W} height={H}>
          <g opacity={1 - prog(t, tNotWhy, 0.8)}>
            <path d="M560 760 L620 840 L1300 840 L1360 760 Z" fill={C.navy} />
          </g>
          {[0, 1, 2, 3, 4].map((i) => (
            <MoneyStack key={i} x={560 + i * 170} y={900} h={countUp(t, tNotWhy + 0.5 + i * 0.25, 1.6, 0, 6 + (i % 3) * 4)} />
          ))}
          {["Jakarta", "Beijing", "Mumbai"].map((c, i) => {
            const p = prog(t, cu(c) - 0.2, 0.6);
            const xs = [260, 960, 1660][i];
            return (
              <g key={c} opacity={p}>
                <text x={xs} y={200} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={56} fill={C.navy}>{c}</text>
                <path d={`M${xs} 230 Q${(xs + 960) / 2} 300 960 ${420 + 40 * (1 - p)}`} fill="none" stroke={C.gold}
                  strokeWidth={10} strokeLinecap="round" strokeDasharray="1 0" />
                <Coin x={xs + (960 - xs) * p} y={240 + 180 * p} r={30} />
              </g>
            );
          })}
        </svg>
      </Shot>

      <Shot a={tThird} b={tStory} bg={C.navy}>
        {(() => {
          const proj = useProjection(WORLD);
          const pts: [string, number, number, string][] = [["London", -0.13, 51.5, "1"], ["New York", -74, 40.7, "2"], ["Singapore", 103.8, 1.35, "3"]];
          return (
            <svg width={W} height={H}>
              <g transform="translate(60,120)">
                <Land spec={WORLD} fill={() => C.navy2} stroke="#2E4A70" strokeWidth={1.5} />
                {pts.map(([n, lon, lat, rank], i) => {
                  const [x, y] = proj([lon, lat])!;
                  const p = pop(t, cu(i === 0 ? "London" : i === 1 ? "New York" : "third-biggest") + (i === 2 ? 0 : 0.1));
                  return <Pin key={n} x={x} y={y} p={p} label={`${rank} · ${n}`} labelSide={i === 1 ? "l" : "r"}
                    pulse={p > 0 ? t * 0.8 + i * 0.3 : 0} color={i === 2 ? C.gold : C.blue} />;
                })}
              </g>
            </svg>
          );
        })()}
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 60 }}>
          <Rise t0={tThird + 0.6}><Big size={84} color={C.gold}>No. 3 in the world</Big></Rise>
          <Rise t0={tThird + 1.2}><Big size={34} color={C.paper} weight={700}>currency markets</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tStory} b={sec.end + 0.5} bg={C.paper}>
        <svg width={W} height={H}>
          {/* clock with a missing wedge = the gap */}
          <g transform="translate(700,520)">
            <circle r={300} fill={C.paper2} stroke={C.navy} strokeWidth={10} />
            {[...Array(12)].map((_, i) => (
              <line key={i} x1={0} y1={-262} x2={0} y2={-236} stroke={C.navy} strokeWidth={8} transform={`rotate(${i * 30})`} />
            ))}
            <path d={`M0 0 L${300 * Math.sin(Math.PI * 0.35)} ${-300 * Math.cos(Math.PI * 0.35)} A300 300 0 0 1 ${300 * Math.sin(Math.PI * 0.62)} ${-300 * Math.cos(Math.PI * 0.62)} Z`}
              fill={C.gold} opacity={prog(t, cu("a gap") , 0.6)} />
            <line x1={0} y1={0} x2={0} y2={-200} stroke={C.navy} strokeWidth={12} strokeLinecap="round"
              transform={`rotate(${t * 40})`} />
            <line x1={0} y1={0} x2={140} y2={0} stroke={C.navy} strokeWidth={14} strokeLinecap="round" transform={`rotate(${t * 4})`} />
            <circle r={16} fill={C.navy} />
          </g>
        </svg>
        <AbsoluteFill style={{ paddingLeft: 1080, paddingTop: 150 }}>
          {[["a banker", "a banker"], ["a globe", "a globe"], ["a gap in the clock", "a gap"]].map(([label, cue], i) => (
            <Rise key={label} t0={cu(cue)}><Big size={72} color={i === 2 ? C.gold : C.navy} style={{ marginBottom: 20 }}>{label}</Big></Rise>
          ))}
        </AbsoluteFill>
      </Shot>
    </>
  );
};

/** 3-second Finance Den title sting, between section 1 and 2. */
export const Sting: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const a = tl.sections[0].end + 0.2;
  const b = tl.sections[1].start - 0.1;
  if (t < a - 0.1 || t > b + 0.3) return null;
  const o = vis(t, a, b + 0.3, 0.25, 0.3);
  return (
    <AbsoluteFill style={{ background: C.navy, opacity: o, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${0.85 + 0.15 * pop(t, a, 0.5)})`, textAlign: "center" }}>
        <Big size={170} color={C.gold} style={{ letterSpacing: 8 }}>FINANCE DEN</Big>
        <div style={{ height: 10, width: 1100 * prog(t, a + 0.3, 0.9), background: C.gold, margin: "18px auto",
          borderRadius: 5 }} />
        <Rise t0={a + 0.7}><Big size={52} color={C.paper} weight={800}>Why Singapore Is So Rich</Big></Rise>
        <Rise t0={a + 1.0}><Big size={36} color={C.blueSoft} weight={700} style={{ marginTop: 10 }}>(It Was Never About Trade)</Big></Rise>
      </div>
    </AbsoluteFill>
  );
};

// ── Section 2: independence ──────────────────────────────────────────────────
const Icon: React.FC<{ kind: "farm" | "oil" | "mine"; x: number; y: number; crossed: number }> = ({ kind, x, y, crossed }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={110} fill={C.paper} stroke={C.navy} strokeWidth={8} />
    {kind === "farm" ? (
      <g stroke={C.navy} strokeWidth={8} fill={C.gold} strokeLinecap="round">
        <line x1={0} y1={70} x2={0} y2={-60} />
        {[-40, -10, 20].map((yy) => (
          <g key={yy}><ellipse cx={-22} cy={yy} rx={20} ry={11} transform={`rotate(-30 -22 ${yy})`} />
            <ellipse cx={22} cy={yy} rx={20} ry={11} transform={`rotate(30 22 ${yy})`} /></g>
        ))}
      </g>
    ) : kind === "oil" ? (
      <path d="M0 -70 C40 -10 56 20 56 40 A56 56 0 0 1 -56 40 C-56 20 -40 -10 0 -70 Z" fill={C.navy} />
    ) : (
      <g stroke={C.navy} strokeWidth={8} strokeLinejoin="round">
        <path d="M-50 -10 L0 -60 L50 -10 L0 60 Z" fill={C.blue} />
        <path d="M-50 -10 L50 -10 M0 -60 L-18 -10 L0 60 L18 -10 Z" fill="none" />
      </g>
    )}
    <g stroke={C.navy} strokeWidth={16} strokeLinecap="round" opacity={crossed}>
      <line x1={-80 * crossed} y1={-80 * crossed} x2={80 * crossed} y2={80 * crossed} />
    </g>
  </g>
);

export const S02: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s02_independence";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const tPos = cu("Think about the position");
  const tWater = cu("It even had to buy");
  const tAsk = cu("So ask yourself");
  const tTrust = cu("Singapore's leaders had");
  const tPushed = cu("pushed out");
  const tSmall = cu("A small population");

  const REGION: MapSpec = { width: 1500, height: 960, bounds: [[99.4, 0.6], [105.2, 6.9]] };
  const SGM: MapSpec = { width: 760, height: 400, bounds: [[103.55, 1.12], [104.15, 1.5]], res: "10m" };
  const drift = prog(t, tPushed, 2.5);

  return (
    <>
      <Shot a={sec.start - 0.2} b={tPos} bg={C.blueSoft}>
        <svg width={W} height={H}>
          <g transform="translate(420,60)">
            <Land spec={REGION} only={["Malaysia", "Indonesia", "Thailand"]} fill={(n) => (n === "Malaysia" ? C.paper : C.paper2)}
              strokeWidth={4} draw={prog(t, sec.start, 1.5)} />
            <g transform={`translate(${70 * drift},${110 * drift}) rotate(${8 * drift} 1050 900)`}>
              <Land spec={REGION} only={["Singapore"]} fill={() => C.gold} strokeWidth={4} />
            </g>
            {drift > 0 ? (
              <path d="M980 860 l30 20 l-20 14 l34 18" stroke={C.navy} strokeWidth={6} fill="none" opacity={1 - drift} />
            ) : null}
          </g>
          <text x={760} y={500} fontFamily="Inter" fontWeight={900} fontSize={60} fill={C.navy} opacity={prog(t, sec.start + 1, 0.6)}>MALAYSIA</text>
        </svg>
        <AbsoluteFill style={{ paddingLeft: 90, paddingTop: 80 }}>
          <Rise t0={sec.start + 0.3}><Big size={96}>9 August 1965</Big></Rise>
          <Rise t0={tPushed}><Big size={56} color={C.blue} weight={800} style={{ marginTop: 16 }}>pushed out, not fought for</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tPos} b={tWater} bg={C.paper}>
        <svg width={W} height={H}>
          <Icon kind="farm" x={500} y={560} crossed={prog(t, cu("No farmland"), 0.4)} />
          <Icon kind="oil" x={960} y={560} crossed={prog(t, cu("No oil"), 0.4)} />
          <Icon kind="mine" x={1420} y={560} crossed={prog(t, cu("No minerals"), 0.4)} />
          {["farmland", "oil", "minerals"].map((l, i) => (
            <text key={l} x={500 + i * 460} y={740} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={44} fill={C.navy}>{l}</text>
          ))}
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
          <Rise t0={cu("No minerals") + 0.3}><Big size={84}>No oil. No land. No minerals.</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tWater} b={tAsk} bg={C.blueSoft}>
        <svg width={W} height={H}>
          <rect x={0} y={0} width={W} height={360} fill={C.paper2} stroke={C.navy} strokeWidth={6} />
          <text x={120} y={120} fontFamily="Inter" fontWeight={900} fontSize={54} fill={C.navy}>the neighbour</text>
          <path d="M0 800 Q960 700 1920 800 L1920 1080 L0 1080 Z" fill={C.gold} stroke={C.navy} strokeWidth={6} />
          <text x={1500} y={990} fontFamily="Inter" fontWeight={900} fontSize={54} fill={C.navy}>Singapore</text>
          {/* pipe across the causeway */}
          <rect x={900} y={300} width={70} height={460} fill={C.grey} stroke={C.navy} strokeWidth={6} />
          {[...Array(6)].map((_, i) => {
            const yy = 330 + ((t * 160 + i * 75) % 420);
            return <path key={i} d={`M935 ${yy} q14 22 0 30 q-14 -8 0 -30 Z`} fill={C.blue} opacity={prog(t, tWater, 0.5)} />;
          })}
          <g opacity={prog(t, tWater + 1.4, 0.5)}><Coin x={1060} y={520} r={44} /></g>
          {/* people + harbour */}
          <g opacity={prog(t, tSmall, 0.5)}>
            {[0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${260 + i * 70},860)`}>
                <circle cy={-60} r={18} fill={C.navy} /><rect x={-20} y={-40} width={40} height={60} rx={14} fill={C.navy} />
              </g>
            ))}
            <path d="M1260 900 l120 0 l-20 30 l-80 0 Z" fill={C.navy} opacity={prog(t, cu("a harbour"), 0.4)} />
          </g>
        </svg>
        <AbsoluteFill style={{ alignItems: "flex-end", paddingTop: 420, paddingRight: 120 }}>
          <Rise t0={tWater + 0.8}><Big size={58} style={{ textAlign: "right" }}>even the water<br />was bought</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tAsk} b={tTrust} bg={C.paper}>
        <AbsoluteFill style={{ paddingLeft: 140, paddingTop: 300 }}>
          <Rise t0={tAsk}><Big size={66} weight={700} color={C.blue}>If you were handed this country…</Big></Rise>
          <Rise t0={cu("what would you sell")}><Big size={130} style={{ marginTop: 20 }}>what would<br />you sell?</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tTrust} b={sec.end + 0.6} bg={C.navy}>
        <svg width={W} height={H}>
          <g transform="translate(580,560)">
            <Land spec={SGM} only={["Singapore"]} fill={() => C.gold} stroke={C.paper} strokeWidth={5} />
          </g>
          {(() => {
            const p = prog(t, cu("trust"), 1.4);
            return (
              <g transform={`translate(960,${560 - 300 * p})`} opacity={p}>
                <circle r={190 + 20 * Math.sin(t * 3)} fill={C.gold} opacity={0.18} />
                <text textAnchor="middle" y={48} fontFamily="Inter" fontWeight={900} fontSize={170} fill={C.gold}
                  letterSpacing={10}>TRUST</text>
              </g>
            );
          })()}
          {(() => {
            const pg = prog(t, cu("with its goods"), 0.5);
            const pm = prog(t, cu("with its money"), 0.5);
            return (
              <g>
                <g opacity={pg * (1 - pm)}>
                  {[0, 1, 2].map((i) => <rect key={i} x={760 + i * 140} y={380} width={110} height={90} fill={C.blue} stroke={C.paper} strokeWidth={5} />)}
                </g>
                <g opacity={pm}>{[0, 1, 2].map((i) => <Coin key={i} x={820 + i * 140} y={430} r={50} />)}</g>
              </g>
            );
          })()}
        </svg>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 90 }}>
          <Rise t0={cu("unlike oil")}><Big size={70} color={C.paper}>Money doesn't need land.</Big></Rise>
        </AbsoluteFill>
      </Shot>
    </>
  );
};

// ── Section 3: the clock ─────────────────────────────────────────────────────
const WallClock: React.FC<{ x: number; y: number; label: string; hour: number; lit: boolean }> = ({ x, y, label, hour, lit }) => (
  <g transform={`translate(${x},${y})`}>
    <circle r={150} fill={lit ? C.gold : C.paper} stroke={C.navy} strokeWidth={10} />
    {[...Array(12)].map((_, i) => <line key={i} y1={-130} y2={-112} stroke={C.navy} strokeWidth={6} transform={`rotate(${i * 30})`} />)}
    <line y2={-70} stroke={C.navy} strokeWidth={12} strokeLinecap="round" transform={`rotate(${hour * 30})`} />
    <line y2={-110} stroke={C.navy} strokeWidth={8} strokeLinecap="round" transform={`rotate(${hour * 360})`} />
    <circle r={12} fill={C.navy} />
    <text y={220} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={48} fill={C.navy}>{label}</text>
  </g>
);

export const S03: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s03_clock";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const tGlobe = cu("made his point with a globe");
  const tSF = cu("When markets in San Francisco");
  const tSun = cu("The sun never sets");
  const tUp = cu("The idea went up");
  const t1968 = cu("launched what became");
  const tHow = cu("Here's how it worked");
  const tPlain = cu("In plain words");
  const tSame = cu("At the same time");
  const tWalls = cu("Most were building walls");

  const WORLD: MapSpec = { width: 1800, height: 860, bounds: [[-150, -50], [170, 72]], kind: "equalEarth", res: "110m" };

  return (
    <>
      <Shot a={sec.start - 0.2} b={tGlobe} bg={C.paper2}>
        <svg width={W} height={H}>
          <rect x={120} y={120} width={520} height={380} fill={C.blueSoft} stroke={C.navy} strokeWidth={8} />
          <line x1={380} y1={120} x2={380} y2={500} stroke={C.navy} strokeWidth={6} />
          <rect x={0} y={800} width={W} height={280} fill="#C9A77C" />
          <rect x={560} y={700} width={800} height={40} fill="#8A6A45" stroke={C.navy} strokeWidth={6} />
          <g transform="translate(960,600)">
            <circle r={90} fill={C.blue} stroke={C.navy} strokeWidth={7} />
            <path d="M-40 -60 q30 20 10 60 q-20 30 20 60 M30 -80 q-20 40 30 70" fill="none" stroke={C.paper} strokeWidth={9} />
            <path d="M0 90 L0 100 M-50 100 L50 100" stroke={C.navy} strokeWidth={10} />
          </g>
          <Silhouette x={560} y={1000} s={1.35} />
          <Silhouette x={1360} y={1000} s={1.35} color={C.navy2} />
        </svg>
        <NameTag t0={cu("Albert Winsemius")} name="Albert Winsemius" role="Dutch economist, adviser to Singapore" x={560} y={590} />
        <NameTag t0={cu("van Oenen")} name="J. D. van Oenen" role="Bank of America, Singapore branch" x={1360} y={590} />
        <AbsoluteFill style={{ alignItems: "flex-end", paddingTop: 130, paddingRight: 140 }}>
          <Rise t0={sec.start + 0.6}><Big size={64} color={C.navy}>late 1960s</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tGlobe} b={tSF} bg={C.paper}>
        <svg width={W} height={H}>
          <WallClock x={420} y={470} label="San Francisco" hour={5 + t * 0.02} lit={false} />
          <WallClock x={960} y={470} label="Singapore" hour={9 + t * 0.02} lit={prog(t, tGlobe + 1.5, 0.3) > 0.5} />
          <WallClock x={1500} y={470} label="Zurich" hour={2 + t * 0.02} lit={false} />
        </svg>
      </Shot>

      <Shot a={tSF} b={tSun + 2.2} bg={C.navy}>
        {(() => {
          const proj = useProjection(WORLD);
          const mk: [string, number, number, number][] = [
            ["San Francisco", -122.4, 37.8, tSF], ["Zurich", 8.5, 47.4, cu("Europe hasn't opened")], ["Singapore", 103.8, 1.35, cu("Put a market in Singapore")],
          ];
          // daylight band sweeps west → covers SG during the gap
          const sweep = interpolate(t, [tSF, tSun], [-40, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const [bx] = proj([sweep, 0])!;
          return (
            <svg width={W} height={H}>
              <g transform="translate(60,150)">
                <Land spec={WORLD} fill={() => C.navy2} stroke="#2E4A70" strokeWidth={1.5} />
                <rect x={bx - 260} y={-40} width={520} height={940} fill={C.paper} opacity={0.10} />
                <line x1={bx - 260} x2={bx - 260} y1={-40} y2={900} stroke={C.gold} strokeWidth={4} opacity={0.6} />
                <line x1={bx + 260} x2={bx + 260} y1={-40} y2={900} stroke={C.gold} strokeWidth={4} opacity={0.6} />
                {mk.map(([n, lon, lat, t0], i) => {
                  const [x, y] = proj([lon, lat])!;
                  const on = i === 2 ? prog(t, t0, 0.4) : 0;
                  const off = i === 0 ? prog(t, cu("close for the day"), 0.4) : 0;
                  const color = i === 2 ? (on > 0.5 ? C.gold : C.grey) : i === 0 ? (off > 0.5 ? C.grey : C.blue) : C.grey;
                  const state = i === 0 ? (off > 0.5 ? "closed" : "open") : i === 1 ? "not open yet" : on > 0.5 ? "OPEN" : "";
                  return (
                    <g key={n}>
                      <Pin x={x} y={y} p={pop(t, t0)} color={color} label={n} labelSide={i === 0 ? "r" : "r"}
                        pulse={i === 2 && on > 0.5 ? t : 0} size={i === 2 ? 1.3 : 1} />
                      <text x={x + 24} y={y + 48} fontFamily="Inter" fontWeight={800} fontSize={28} fill={C.paper}
                        opacity={pop(t, t0) > 0 ? 0.9 : 0}>{state}</text>
                    </g>
                  );
                })}
              </g>
            </svg>
          );
        })()}
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 50 }}>
          <Rise t0={cu("nowhere to trade")}><Big size={64} color={C.paper}>A gap in the trading day</Big></Rise>
        </AbsoluteFill>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 70 }}>
          <Rise t0={tSun}><Big size={60} color={C.gold}>The sun never sets on the trading day</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tSun + 2.2} b={tHow} bg={C.paper}>
        <svg width={W} height={H}>
          <g opacity={1 - prog(t, t1968 - 0.3, 0.4)}>
            <Silhouette x={560} y={760} s={1.1} back />
            <Silhouette x={1360} y={760} s={1.1} back color={C.navy2} />
            <path d={`M720 560 L${720 + 480 * prog(t, cu("then to Prime Minister"), 0.8)} 560`} stroke={C.gold} strokeWidth={14}
              strokeLinecap="round" />
          </g>
        </svg>
        <div style={{ opacity: 1 - prog(t, t1968 - 0.3, 0.4) }}>
          <NameTag t0={cu("Hon Sui Sen")} name="Hon Sui Sen" role="Finance Minister" x={560} y={790} />
          <NameTag t0={cu("Lee Kuan Yew")} name="Lee Kuan Yew" role="Prime Minister" x={1360} y={790} />
        </div>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: prog(t, t1968 - 0.3, 0.4) }}>
          <Big size={200} color={C.gold}>1968</Big>
          <Big size={90}>Asian Dollar Market</Big>
        </AbsoluteFill>
      </Shot>

      <Shot a={tHow} b={tPlain} bg={C.paper}>
        <svg width={W} height={H}>
          {/* vault */}
          <g transform="translate(1180,560)">
            <rect x={-260} y={-280} width={520} height={520} rx={30} fill={C.grey} stroke={C.navy} strokeWidth={10} />
            <circle r={170} fill={C.paper2} stroke={C.navy} strokeWidth={10} />
            <g transform={`rotate(${t * 20})`}>{[0, 60, 120].map((a) => <line key={a} x1={-120} x2={120} stroke={C.navy} strokeWidth={14} transform={`rotate(${a})`} />)}</g>
            <circle r={40} fill={C.navy} />
            <text y={-200} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={70} fill={C.paper}>ACU</text>
          </g>
          {[...Array(7)].map((_, i) => {
            const k = ((t - tHow) * 0.45 + i / 7) % 1;
            if (t < tHow + 0.5) return null;
            return (
              <g key={i} transform={`translate(${120 + 760 * k},${380 + 120 * Math.sin(k * 6 + i)}) rotate(${-10 + 20 * Math.sin(i)})`} opacity={k < 0.9 ? 1 : (1 - k) * 10}>
                <rect x={-60} y={-30} width={120} height={60} rx={6} fill="#A9D3A0" stroke={C.navy} strokeWidth={4} />
                <text y={14} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={38} fill={C.navy}>$</text>
              </g>
            );
          })}
          {/* local economy kept separate */}
          <g opacity={prog(t, cu("kept separate"), 0.5)}>
            <line x1={760} y1={840} x2={1600} y2={840} stroke={C.navy} strokeWidth={8} strokeDasharray="24 16" />
            <text x={1180} y={920} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} fill={C.navy}>local economy, kept apart</text>
          </g>
        </svg>
        <AbsoluteFill style={{ paddingLeft: 110, paddingTop: 110 }}>
          <Rise t0={cu("Asian Currency Unit")}><Big size={54} weight={800}>Asian Currency Unit</Big></Rise>
          <Rise t0={cu("mostly US dollars")}><Big size={40} weight={700} color={C.blue} style={{ marginTop: 8 }}>foreign-currency deposits + loans</Big></Rise>
        </AbsoluteFill>
        <Stamp t0={cu("concessionary")} color={C.gold} rot={-6} size={110} style={{ left: 150, top: 640 }}>10% tax</Stamp>
      </Shot>

      <Shot a={tPlain} b={tSame} bg={C.navy}>
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160 }}>
          {[["Bring us your dollars", "bring us"], ["We'll keep it simple", "keep it simple"], ["We'll keep the tax low", "keep the tax low"]].map(([l, c], i) => (
            <Rise key={l} t0={cu(c)}><Big size={92} color={i === 2 ? C.gold : C.paper} style={{ marginBottom: 26 }}>{l}</Big></Rise>
          ))}
        </AbsoluteFill>
      </Shot>

      <Shot a={tSame} b={sec.end + 0.6} bg={C.paper}>
        <svg width={W} height={H}>
          {/* left: other countries building walls */}
          <g opacity={prog(t, tWalls, 0.5)}>
            {[...Array(6)].map((_, r) => [...Array(4)].map((__, c) => {
              const p = prog(t, tWalls + (r * 4 + c) * 0.07, 0.3);
              return <rect key={`${r}${c}`} x={140 + c * 110 + (r % 2) * 55} y={880 - r * 70 - 40 * (1 - p)} width={104} height={64}
                fill={C.grey} stroke={C.navy} strokeWidth={4} opacity={p} />;
            }))}
            <text x={400} y={1000} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} fill={C.navy}>most new countries</text>
          </g>
          {/* right: Singapore's wall crumbles around the money */}
          {[...Array(6)].map((_, r) => [...Array(4)].map((__, c) => {
            const fall = prog(t, tSame + 1.2 + (r * 4 + c) * 0.09, 1.0, (x) => x * x);
            return <rect key={`s${r}${c}`} x={1180 + c * 110 + (r % 2) * 55} y={880 - r * 70 + fall * (500 + r * 20)} width={104} height={64}
              fill={C.gold} stroke={C.navy} strokeWidth={4} opacity={1 - fall} transform={`rotate(${fall * (c % 2 ? 40 : -40)} ${1230 + c * 110} ${900 - r * 70})`} />;
          }))}
          <g opacity={prog(t, tSame + 2, 0.6)}>{[0, 1, 2].map((i) => <Coin key={i} x={1340 + i * 120} y={700 - (i % 2) * 60} r={46} />)}</g>
          <text x={1440} y={1000} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={40} fill={C.navy}>Singapore</text>
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
          <Rise t0={tSame + 0.3}><Big size={70}>Exchange controls: coming down</Big></Rise>
        </AbsoluteFill>
      </Shot>
    </>
  );
};
