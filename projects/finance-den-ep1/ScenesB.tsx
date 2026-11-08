import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import {
  C, Shot, Big, Rise, Stamp, NameTag, Silhouette, useT, useTimeline, cueTime, prog, pop, countUp, fmt,
} from "./lib";
import { Land, Pin, useProjection, MapSpec } from "./Maps";

const W = 1920, H = 1080;

const Building: React.FC<{ x: number; y: number; s?: number; label?: string; color?: string; cols?: number }> = ({
  x, y, s = 1, label, color = C.paper, cols = 5 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-230 -250 L0 -360 L230 -250 Z" fill={color} stroke={C.navy} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-210} y={-250} width={420} height={30} fill={color} stroke={C.navy} strokeWidth={8} />
    {[...Array(cols)].map((_, i) => (
      <rect key={i} x={-190 + i * (380 / (cols - 1)) - 16} y={-220} width={32} height={190} fill={color} stroke={C.navy} strokeWidth={6} />
    ))}
    <rect x={-240} y={-30} width={480} height={30} fill={color} stroke={C.navy} strokeWidth={8} />
    {label ? <text y={-275} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill={C.navy}>{label}</text> : null}
  </g>
);

const Vault: React.FC<{ x: number; y: number; label: string; year: string; p: number; t: number }> = ({ x, y, label, year, p, t }) => (
  <g transform={`translate(${x},${y + 60 * (1 - p)})`} opacity={p}>
    <rect x={-220} y={-220} width={440} height={440} rx={34} fill={C.navy} stroke={C.navy} strokeWidth={8} />
    <circle r={140} fill={C.navy2} stroke={C.gold} strokeWidth={10} />
    <g transform={`rotate(${t * 15})`}>{[0, 60, 120].map((a) => <line key={a} x1={-95} x2={95} stroke={C.gold} strokeWidth={12} transform={`rotate(${a})`} />)}</g>
    <circle r={30} fill={C.gold} />
    <text y={300} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={64} fill={C.navy}>{label}</text>
    <text y={360} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={48} fill={C.blue}>{year}</text>
  </g>
);

// ── Section 4: referee + boring currency ────────────────────────────────────
export const S04: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s04_referee";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const t1981 = cu("Then, in 1981");
  const tWhy = cu("Why does that matter");
  const tSame = cu("Around the same time");
  const tStep = cu("Step one");
  const tRef = cu("It needs a referee");
  const tMAS = cu("Singapore created the Monetary");
  const tChart = cu("Singapore decided to manage");

  // currency band chart
  const chart = (() => {
    const x0 = 160, x1 = 1760, yMid = 640;
    const draw = prog(t, tChart, 6, (x) => x);
    const pts: string[] = [], up: string[] = [], lo: string[] = [];
    const N = 120;
    for (let i = 0; i <= N; i++) {
      const k = i / N;
      const x = x0 + (x1 - x0) * k;
      const centre = yMid - 220 * k; // the band crawls upward
      up.push(`${x},${centre - 70}`);
      lo.push(`${x},${centre + 70}`);
      if (k <= draw) pts.push(`${x},${centre + 48 * Math.sin(k * 23) * Math.cos(k * 7)}`);
    }
    return { band: `M${up.join(" L")} L${lo.reverse().join(" L")} Z`, line: pts.length > 1 ? `M${pts.join(" L")}` : "" };
  })();

  return (
    <>
      <Shot a={sec.start - 0.2} b={t1981} bg={C.paper}>
        <svg width={W} height={H}>
          {/* whistle morphs into the central bank */}
          <g opacity={1 - prog(t, tMAS - 0.4, 0.5)} transform={`translate(960,520) scale(${0.6 + 0.4 * pop(t, tRef)})`}>
            <path d="M-160 -60 L120 -60 A90 90 0 1 1 30 60 L-160 60 Z" fill={C.gold} stroke={C.navy} strokeWidth={10} strokeLinejoin="round" />
            <circle cx={120} cy={30} r={30} fill={C.navy} />
            <path d="M-160 -60 L-220 -100" stroke={C.navy} strokeWidth={10} strokeLinecap="round" />
            {[0, 1, 2].map((i) => <path key={i} d={`M${-250 - i * 10} ${-150 + i * 40} l-60 -20`} stroke={C.navy} strokeWidth={8}
              strokeLinecap="round" opacity={Math.abs(Math.sin(t * 6 + i))} />)}
          </g>
          <g opacity={prog(t, tMAS - 0.4, 0.5)}>
            <Building x={960} y={860} s={1.25} label="" color={C.paper2} />
          </g>
        </svg>
        <Stamp t0={tMAS + 0.6} color={C.navy} rot={-7} size={96} style={{ left: 1240, top: 230 }}>MAS 1971</Stamp>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 60 }}>
          <Rise t0={cu("central bank and the financial regulator")}><Big size={60}>central bank + regulator, in one</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={t1981} b={tWhy} bg={C.paper} push={0.03}>
        <svg width={W} height={H}>
          <line x1={160} y1={900} x2={1760} y2={900} stroke={C.navy} strokeWidth={6} />
          <line x1={160} y1={900} x2={160} y2={240} stroke={C.navy} strokeWidth={6} />
          <path d={chart.band} fill={C.gold} opacity={0.3 * prog(t, cu("inside a band"), 0.6)} stroke={C.gold} strokeWidth={4} />
          <path d={chart.line} fill="none" stroke={C.blue} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" />
          <text x={1720} y={960} textAnchor="end" fontFamily="Inter" fontWeight={700} fontSize={32} fill={C.navy}>time →</text>
          <text x={190} y={250} fontFamily="Inter" fontWeight={700} fontSize={32} fill={C.navy}>S$ vs basket</text>
        </svg>
        <AbsoluteFill style={{ paddingLeft: 1080, paddingTop: 640, flexDirection: "row", gap: 40 }}>
          {[["Basket", "a basket"], ["Band", "inside a band"], ["Crawl", "slowly crawl"]].map(([l, c], i) => (
            <Rise key={l} t0={cu(c)}><Big size={74} color={i === 1 ? C.gold : C.navy}>{l}{i < 2 ? " ·" : ""}</Big></Rise>
          ))}
        </AbsoluteFill>
        <AbsoluteFill style={{ paddingLeft: 200, paddingTop: 80 }}>
          <Rise t0={t1981 + 0.3}><Big size={64}>1981: steer the currency,<br />not the interest rate</Big></Rise>
        </AbsoluteFill>
        <NameTag t0={cu("Goh Keng Swee")} name="Goh Keng Swee" role="MAS chairman" x={1640} y={110} />
      </Shot>

      <Shot a={tWhy} b={tSame} bg={C.paper2}>
        <svg width={W} height={H}>
          {/* fear: a coin cracking */}
          <g transform="translate(560,520)" opacity={1 - prog(t, cu("Singapore made its currency boring"), 0.5)}>
            <circle r={200} fill={C.gold} stroke={C.navy} strokeWidth={10} />
            <circle r={150} fill="none" stroke={C.navy} strokeWidth={4} opacity={0.4} />
            <text y={50} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={140} fill={C.navy}>S$</text>
            <path d={`M-40 -200 L10 -60 L-30 20 L30 120 L0 200`} stroke={C.navy} strokeWidth={10} fill="none"
              strokeDasharray="1" pathLength={1} strokeDashoffset={1 - prog(t, cu("suddenly collapses"), 0.8)} />
            <text y={300} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={44} fill={C.navy}>the investor's fear</text>
          </g>
          {/* boring: a flat, calm line */}
          <g opacity={prog(t, cu("Singapore made its currency boring"), 0.5)}>
            <path d={`M200 560 L${200 + 1500 * prog(t, cu("Singapore made its currency boring"), 2.5)} ${560 - 30 * prog(t, cu("Singapore made its currency boring"), 2.5)}`}
              stroke={C.blue} strokeWidth={14} strokeLinecap="round" />
          </g>
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 690 }}>
          <Rise t0={cu("boring is beautiful")}><Big size={108} color={C.gold}>Boring is beautiful</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tSame} b={tStep} bg={C.paper}>
        <svg width={W} height={H}>
          <Vault x={620} y={460} label="Temasek" year="1974" p={prog(t, cu("Temasek"), 0.6)} t={t} />
          <Vault x={1300} y={460} label="GIC" year="1981" p={prog(t, cu("GIC"), 0.6)} t={t} />
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 60 }}>
          <Rise t0={cu("It was becoming a serious investor")}><Big size={60}>not just a host: an investor</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tStep} b={sec.end + 0.6} bg={C.navy}>
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 180 }}>
          <Rise t0={tStep}><Big size={46} color={C.blueSoft} weight={800}>STEP ONE</Big><Big size={100} color={C.paper}>Invite the money.</Big></Rise>
          <div style={{ height: 50 }} />
          <Rise t0={cu("Step two")}><Big size={46} color={C.blueSoft} weight={800}>STEP TWO</Big><Big size={100} color={C.gold}>Prove you won't lose it.</Big></Rise>
        </AbsoluteFill>
      </Shot>
    </>
  );
};

// ── Section 5: Barings ───────────────────────────────────────────────────────
const Trader: React.FC<{ x: number; y: number; c: string; arm: number }> = ({ x, y, c, arm }) => (
  <g transform={`translate(${x},${y})`}>
    <circle cy={-150} r={34} fill="#3A3F4A" />
    <path d="M-60 40 L-50 -110 Q0 -125 50 -110 L60 40 Z" fill={c} stroke={C.navy} strokeWidth={5} />
    <path d={`M45 -100 L${80} ${-170 - arm}`} stroke={c} strokeWidth={22} strokeLinecap="round" />
    <rect x={-22} y={-90} width={44} height={30} fill={C.paper} stroke={C.navy} strokeWidth={3} />
  </g>
);

export const S05: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s05_barings";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const tFut = cu("Leeson was trading futures");
  const tQuake = cu("On the 17th of January");
  const tBill = cu("The final bill");
  const tOne = cu("One guy");
  const tThink = cu("You'd think");
  const tInsolv = cu("declared insolvent");
  const tPrison = cu("Leeson was sentenced");
  const JP: MapSpec = { width: 1100, height: 900, bounds: [[129, 30.5], [146, 45.5]] };

  return (
    <>
      <Shot a={sec.start - 0.2} b={tFut} bg="#E9E2D3">
        <svg width={W} height={H}>
          <rect x={160} y={80} width={1600} height={260} fill={C.navy} />
          {[...Array(12)].map((_, i) => (
            <text key={i} x={210 + (i % 6) * 260} y={170 + Math.floor(i / 6) * 110} fontFamily="Inter" fontWeight={800}
              fontSize={52} fill={i % 3 === 0 ? C.gold : C.green}>{(17000 + ((i * 377) % 900) + Math.floor(t * 3) % 40).toLocaleString()}</text>
          ))}
          {[[200, C.gold, 0], [380, C.blue, 20], [560, "#E07A3F", 5], [1360, C.green, 15], [1540, C.gold, 0], [1720, C.blue, 25]].map(([x, c, a], i) => (
            <Trader key={i} x={x as number} y={1000} c={c as string} arm={(a as number) + 14 * Math.sin(t * 4 + i)} />
          ))}
          <Silhouette x={960} y={1040} s={1.4} />
        </svg>
        <NameTag t0={cu("Nick Leeson")} name="Nick Leeson" role="trader, Barings futures office, Singapore" x={960} y={640} />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 380 }}>
          <Rise t0={sec.start + 0.4}><Big size={72}>1992 · Singapore</Big></Rise>
          <Rise t0={cu("Britain's oldest merchant bank")}><Big size={48} weight={800} color={C.navy2} style={{ marginTop: 10 }}>Barings: Britain's oldest merchant bank</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tFut} b={tQuake} bg={C.paper2}>
        <svg width={W} height={H}>
          {/* desk drawer labelled ERROR ACCOUNT */}
          <rect x={560} y={560} width={800} height={380} fill="#8A6A45" stroke={C.navy} strokeWidth={8} />
          <g transform={`translate(0,${-40 * prog(t, cu("he hid the losses"), 0.6)})`}>
            <rect x={640} y={620} width={640} height={200} fill="#A9835A" stroke={C.navy} strokeWidth={8} />
            <rect x={760} y={680} width={400} height={70} fill={C.paper} stroke={C.navy} strokeWidth={5} />
            <text x={960} y={730} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={44} fill={C.red}>ERROR ACCOUNT</text>
          </g>
          {[0, 1, 2].map((i) => {
            const k = prog(t, cu("he hid the losses") + 0.4 + i * 0.5, 0.9);
            return (
              <g key={i} transform={`translate(${880 + i * 40},${260 + 380 * k}) rotate(${-12 + i * 9})`} opacity={k < 1 ? 1 : 0}>
                <rect x={-90} y={-60} width={180} height={120} fill={C.paper} stroke={C.navy} strokeWidth={5} />
                <text y={18} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill={C.red}>− loss</text>
              </g>
            );
          })}
          {/* double down arrows */}
          <g opacity={prog(t, cu("doubled down"), 0.4)}>
            {[0, 1].map((i) => <path key={i} d={`M${1500 + i * 120} 420 l0 -180 l-40 40 M${1500 + i * 120} 240 l40 40`} stroke={C.red}
              strokeWidth={14} fill="none" strokeLinecap="round" transform={`scale(${1 + i * 0.3}) `} />)}
            <text x={1560} y={500} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={48} fill={C.red}>×2</text>
          </g>
        </svg>
        <AbsoluteFill style={{ paddingLeft: 120, paddingTop: 120 }}>
          <Rise t0={tFut + 0.3}><Big size={60}>Futures on Japan's stock market</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tQuake} b={tBill} bg={C.paper}>
        <svg width={W} height={H}>
          <g transform="translate(60,100)">
            <Land spec={JP} only={["Japan"]} fill={() => C.paper2} strokeWidth={5} />
            {(() => {
              const proj = useProjection(JP);
              const [x, y] = proj([135.2, 34.7])!;
              const p = prog(t, cu("a huge earthquake"), 0.6);
              return (
                <g transform={`translate(${x},${y})`} opacity={p}>
                  {[0, 1, 2].map((i) => <circle key={i} r={40 + ((t * 70 + i * 50) % 160)} fill="none" stroke={C.red} strokeWidth={6}
                    opacity={1 - ((t * 70 + i * 50) % 160) / 160} />)}
                  <path d="M-90 -40 l40 30 l-20 20 l50 30 l-10 30 l50 20" stroke={C.navy} strokeWidth={8} fill="none" />
                  <text x={30} y={-40} fontFamily="Inter" fontWeight={900} fontSize={44} fill={C.navy}>Kobe</text>
                </g>
              );
            })()}
          </g>
          {/* falling market line */}
          <g transform="translate(1180,240)">
            <rect width={620} height={460} fill={C.navy} rx={16} />
            {(() => {
              const k = prog(t, cu("The Japanese market fell"), 2.5, (x) => x);
              const pts = [...Array(40)].map((_, i) => {
                const u = i / 39;
                const y = 120 + (u < 0.35 ? 0 : (u - 0.35) * 420) + 20 * Math.sin(i * 1.7);
                return `${40 + u * 540},${y}`;
              }).slice(0, Math.max(2, Math.round(40 * Math.max(0.35, k))));
              return <path d={`M${pts.join(" L")}`} fill="none" stroke={k > 0 ? C.red : C.green} strokeWidth={9} strokeLinejoin="round" />;
            })()}
          </g>
        </svg>
        <AbsoluteFill style={{ paddingLeft: 1180, paddingTop: 760 }}>
          <Rise t0={tQuake + 0.3}><Big size={64}>17 January 1995</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tBill} b={tOne} bg={C.paper}>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 170 }}>
          <Big size={170} color={C.red} style={{ fontVariantNumeric: "tabular-nums" }}>£{fmt(countUp(t, tBill + 0.3, 2.4, 0, 827000000))}</Big>
          <Rise t0={cu("about 1.4 billion")}><Big size={64} weight={800}>(~US$1.4B)</Big></Rise>
          <Rise t0={cu("Around twice")}><Big size={46} weight={700} color={C.navy2} style={{ marginTop: 20 }}>about twice the trading capital Barings had</Big></Rise>
        </AbsoluteFill>
        <Stamp t0={tInsolv} size={120} style={{ left: 560, top: 640 }}>INSOLVENT</Stamp>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 50 }}>
          <Rise t0={tInsolv + 0.4}><Big size={48}>26 Feb 1995</Big></Rise>
        </AbsoluteFill>
        {/* prison bars shadow */}
        <AbsoluteFill style={{ opacity: 0.38 * prog(t, tPrison, 0.6), flexDirection: "row", justifyContent: "space-evenly",
          transform: `translateY(${-80 * (1 - prog(t, tPrison, 0.8))}px)` }}>
          {[...Array(9)].map((_, i) => <div key={i} style={{ width: 46, height: "100%", background: C.navy }} />)}
        </AbsoluteFill>
        <AbsoluteFill style={{ alignItems: "flex-end", justifyContent: "flex-end", paddingRight: 120, paddingBottom: 160 }}>
          <Rise t0={tPrison + 0.4}><Big size={54} color={C.paper} style={{ background: C.navy, padding: "8px 20px", borderRadius: 10 }}>6½ years, Changi Prison</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tOne} b={tThink} bg={C.navy}>
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160 }}>
          {[["One guy.", "One guy"], ["One office.", "One office"], ["A centuries-old bank, gone.", "A centuries-old bank"]].map(([l, c], i) => (
            <Rise key={l} t0={cu(c)}><Big size={96} color={i === 2 ? C.red : C.paper} style={{ marginBottom: 16 }}>{l}</Big></Rise>
          ))}
        </AbsoluteFill>
      </Shot>

      <Shot a={tThink} b={sec.end + 0.6} bg={C.paper}>
        <svg width={W} height={H}>
          {/* rule book under a magnifying glass */}
          <g transform="translate(700,560)">
            <rect x={-260} y={-180} width={520} height={360} rx={14} fill={C.blue} stroke={C.navy} strokeWidth={10} />
            <line x1={0} y1={-180} x2={0} y2={180} stroke={C.navy} strokeWidth={8} />
            {[...Array(5)].map((_, i) => <g key={i}><line x1={-220} x2={-40} y1={-110 + i * 50} y2={-110 + i * 50} stroke={C.paper} strokeWidth={10} />
              <line x1={40} x2={220} y1={-110 + i * 50} y2={-110 + i * 50} stroke={C.paper} strokeWidth={10} /></g>)}
            <text y={250} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={52} fill={C.navy}>THE RULES</text>
          </g>
          {(() => {
            const k = prog(t, cu("rules only work"), 1.2);
            const x = 1000 + 260 * Math.cos(t * 1.2) * k, y = 520 + 120 * Math.sin(t * 1.6) * k;
            return (
              <g transform={`translate(${x},${y})`} opacity={k}>
                <circle r={130} fill={C.paper} fillOpacity={0.35} stroke={C.navy} strokeWidth={16} />
                <line x1={92} y1={92} x2={230} y2={230} stroke={C.navy} strokeWidth={30} strokeLinecap="round" />
              </g>
            );
          })()}
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
          <Rise t0={cu("rules only work")}><Big size={62}>Rules only work if someone is checking.</Big></Rise>
        </AbsoluteFill>
      </Shot>
    </>
  );
};

// ── Section 6: Asian crisis → open, but careful ──────────────────────────────
const Door: React.FC<{ x: number; y: number; open: number; color: string; label: string }> = ({ x, y, open, color, label }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x={-110} y={-330} width={220} height={330} fill={open > 0 ? "#FFF3D6" : C.navy} stroke={C.navy} strokeWidth={8} />
    <g transform={`translate(-110,0) scale(${1 - 0.8 * open},1)`}>
      <rect x={0} y={-330} width={220} height={330} fill={color} stroke={C.navy} strokeWidth={8} />
      <circle cx={180} cy={-160} r={12} fill={C.navy} />
    </g>
    <text y={60} textAnchor="middle" fontFamily="Inter" fontWeight={800} fontSize={38} fill={C.navy}>{label}</text>
  </g>
);

export const S06: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s06_crisis";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const tOpp = cu("Singapore did the opposite");
  const tMerge = cu("And they merged");
  const tDoors = cu("When your neighbours lock");
  const tClever = cu("But, and this is the clever bit");
  const ASIA: MapSpec = { width: 1500, height: 900, bounds: [[94, -9], [132, 40]] };

  return (
    <>
      <Shot a={sec.start - 0.2} b={tOpp} bg={C.paper}>
        {(() => {
          const proj = useProjection(ASIA);
          const cur: [string, number, number, string][] = [["baht", 100.5, 14.5, "Thailand"], ["rupiah", 110, -6.5, "Indonesia"], ["won", 127.5, 36.5, "South Korea"]];
          return (
            <svg width={W} height={H}>
              <g transform="translate(380,110)">
                <Land spec={ASIA} res="50m" fill={(n) => (["Thailand", "Indonesia", "South Korea", "Malaysia", "Philippines"].includes(n) ? "#F2D2CF" : n === "Singapore" ? C.gold : C.paper2)} strokeWidth={2.5} />
                {cur.map(([c, lon, lat], i) => {
                  const [x, y] = proj([lon, lat])!;
                  const p = prog(t, cu("Currencies across the region") + i * 0.4, 0.5);
                  const fall = prog(t, cu("Currencies across the region") + i * 0.4 + 0.4, 1.4, (z) => z * z);
                  return (
                    <g key={c} transform={`translate(${x},${y + 50 * fall})`} opacity={p}>
                      <rect x={-120} y={-46} width={240} height={84} rx={14} fill={C.paper} stroke={C.red} strokeWidth={6} />
                      <text y={16} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={50} fill={C.red}>{c} ↓</text>
                    </g>
                  );
                })}
              </g>
            </svg>
          );
        })()}
        <AbsoluteFill style={{ paddingLeft: 80, paddingTop: 70 }}>
          <Rise t0={sec.start + 0.2}><Big size={70}>1997–98</Big><Big size={46} weight={800} color={C.red}>Asian Financial Crisis</Big></Rise>
        </AbsoluteFill>
        <AbsoluteFill style={{ paddingLeft: 80, paddingTop: 860 }}>
          <Rise t0={cu("closing up")}><Big size={50} weight={800}>The response: more controls, more protection</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tOpp} b={tMerge} bg={C.navy}>
        <AbsoluteFill style={{ paddingLeft: 150, paddingTop: 140 }}>
          <Rise t0={tOpp}><Big size={50} color={C.blueSoft} weight={800}>"turn adversity into opportunity"</Big></Rise>
          <div style={{ height: 50 }} />
          {[["Retail banking → open to foreign banks", "opened retail banking"], ["Insurers → foreign owners allowed", "lifted limits"],
            ["Fixed brokerage fees → scrapped", "scrapped fixed"]].map(([l, c]) => (
            <Rise key={l} t0={cu(c)}><Big size={64} color={C.paper} style={{ marginBottom: 34 }}><span style={{ color: C.gold }}>✓ </span>{l}</Big></Rise>
          ))}
        </AbsoluteFill>
      </Shot>

      <Shot a={tMerge} b={tDoors} bg={C.paper}>
        <svg width={W} height={H}>
          {(() => {
            const m = prog(t, tMerge + 0.8, 1.6);
            return (
              <g>
                <g opacity={1 - m}>
                  <Building x={600 + 360 * m} y={860} s={0.95} label="stock exchange" color={C.paper2} cols={4} />
                  <Building x={1320 - 360 * m} y={860} s={0.95} label="futures exchange" color={C.paper2} cols={4} />
                </g>
                <g opacity={m}><Building x={960} y={880} s={1.35} label="" color={C.goldSoft} cols={6} /></g>
              </g>
            );
          })()}
        </svg>
        <Stamp t0={cu("SGX")} color={C.navy} rot={0} size={120} style={{ left: 820, top: 170 }}>SGX</Stamp>
      </Shot>

      <Shot a={tDoors} b={tClever} bg={C.paper2}>
        <svg width={W} height={H}>
          <Door x={360} y={800} open={0} color={C.grey} label="neighbour" />
          <Door x={760} y={800} open={0} color={C.grey} label="neighbour" />
          <Door x={1160} y={800} open={prog(t, cu("you open yours"), 0.6)} color={C.gold} label="Singapore" />
          <Door x={1560} y={800} open={0} color={C.grey} label="neighbour" />
          {[...Array(8)].map((_, i) => {
            const k = ((t - cu("Guess where")) * 0.5 + i / 8) % 1;
            if (t < cu("Guess where")) return null;
            return <g key={i} transform={`translate(${1160 + (i % 2 ? 1 : -1) * 700 * (1 - k)},${400 + 220 * k})`}>
              <circle r={28} fill={C.gold} stroke={C.navy} strokeWidth={4} /></g>;
          })}
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 80 }}>
          <Rise t0={tDoors}><Big size={70}>They lock their doors. You open yours.</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tClever} b={sec.end + 0.6} bg={C.paper}>
        <svg width={W} height={H}>
          <g transform="translate(560,580)">
            <Door x={0} y={200} open={1} color={C.gold} label="" />
            {(() => {
              const p = prog(t, cu("opened up while staying strict"), 0.8);
              return <path d="M0 -330 C150 -300 220 -260 230 -200 C230 40 140 180 0 260 C-140 180 -230 40 -230 -200 C-220 -260 -150 -300 0 -330 Z"
                fill={C.blue} fillOpacity={0.18 * p} stroke={C.blue} strokeWidth={14} pathLength={1} strokeDasharray={`${p} 1`} />;
            })()}
          </g>
        </svg>
        <AbsoluteFill style={{ paddingLeft: 900, paddingTop: 250 }}>
          <Rise t0={cu("more capital than international rules")}><Big size={50} weight={800}>• capital above international rules</Big></Rise>
          <div style={{ height: 24 }} />
          <Rise t0={cu("Liquidity rules came in")}><Big size={50} weight={800}>• liquidity rules, early</Big></Rise>
          <div style={{ height: 70 }} />
          <Rise t0={cu("Open, but careful")}><Big size={92} color={C.blue}>Open, but careful</Big></Rise>
        </AbsoluteFill>
      </Shot>
    </>
  );
};
