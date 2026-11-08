import React from "react";
import { AbsoluteFill } from "remotion";
import { C, Shot, Big, Rise, Stamp, useT, useTimeline, cueTime, prog, pop, countUp, fmt } from "./lib";
import { Land, Pin, useProjection, MapSpec } from "./Maps";
import { Skyline } from "./ScenesA";

const W = 1920, H = 1080;

const Card: React.FC<{ t0: number; children: React.ReactNode; dark?: boolean }> = ({ t0, children, dark }) => {
  const t = useT();
  const p = pop(t, t0, 0.5);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `translateY(${(1 - Math.min(1, p)) * 120}px) scale(${0.92 + 0.08 * Math.min(1.05, p)})`,
        opacity: Math.min(1, p * 1.4), background: dark ? C.navy : "#FFFFFF", borderRadius: 36, padding: "60px 90px",
        border: `8px solid ${C.navy}`, boxShadow: `18px 18px 0 ${C.gold}`, minWidth: 1100, textAlign: "center" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

// ── Section 7: the numbers today ─────────────────────────────────────────────
export const S07: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s07_numbers";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const t1 = cu("Number one");
  const t2 = cu("Number two");
  const t3 = cu("Number three");
  const tIdx = cu("In the Global Financial Centres");
  const tThink = cu("Think about that");

  return (
    <>
      <Shot a={sec.start - 0.2} b={t1} bg={C.navy}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <Rise t0={sec.start}><Big size={110} color={C.paper}>So where did all that</Big></Rise>
          <Rise t0={sec.start + 0.5}><Big size={110} color={C.gold}>get Singapore?</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={t1} b={t2} bg={C.paper} push={0.03}>
        <Card t0={t1 + 0.2}>
          <Big size={40} weight={800} color={C.blue}>1 · FOREIGN EXCHANGE, APRIL 2025</Big>
          <Big size={170} style={{ fontVariantNumeric: "tabular-nums", margin: "10px 0" }}>
            ${countUp(t, t1 + 0.5, 2.6, 0, 1.485).toFixed(3)}T
          </Big>
          <Big size={56} weight={800}>a day</Big>
          <div style={{ display: "flex", gap: 60, justifyContent: "center", marginTop: 40 }}>
            <Rise t0={cu("up 60%")}><Big size={50} color={C.green}>+60% in 3 years</Big></Rise>
            <Rise t0={cu("about 12%")}><Big size={50} color={C.navy2}>~12% of the planet's FX</Big></Rise>
          </div>
          <Rise t0={cu("Only the UK and the US")}><Big size={40} weight={700} color={C.navy2} style={{ marginTop: 26 }}>only the UK and the US are bigger</Big></Rise>
        </Card>
      </Shot>

      <Shot a={t2} b={t3} bg={C.paper} push={0.03}>
        <svg width={W} height={H}>
          {(() => {
            const p = prog(t, cu("77%"), 1.6);
            const a = 2 * Math.PI * 0.77 * p;
            const r = 230, cx = 1380, cy = 560;
            const x = cx + r * Math.sin(a), y = cy - r * Math.cos(a);
            return (
              <g opacity={prog(t, cu("And here's the key detail"), 0.4)}>
                <circle cx={cx} cy={cy} r={r} fill={C.paper2} stroke={C.navy} strokeWidth={8} />
                {p > 0 ? <path d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x} ${y} Z`} fill={C.gold} stroke={C.navy} strokeWidth={8} /> : null}
                <circle cx={cx} cy={cy} r={120} fill={C.paper} stroke={C.navy} strokeWidth={8} />
                <text x={cx} y={cy + 30} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={84} fill={C.navy}>{Math.round(77 * p)}%</text>
                <text x={cx} y={cy + r + 80} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={54} fill={C.navy}>from abroad</text>
              </g>
            );
          })()}
        </svg>
        <AbsoluteFill style={{ paddingLeft: 140, paddingTop: 230 }}>
          <Rise t0={t2}><Big size={40} weight={800} color={C.blue}>2 · ASSETS MANAGED, 2024</Big></Rise>
          <Rise t0={cu("6 trillion")}><Big size={130} style={{ marginTop: 10 }}>S$6 trillion</Big></Rise>
          <Rise t0={cu("roughly 4.7 trillion")}><Big size={64} weight={800} color={C.navy2}>(~US$4.7T)</Big></Rise>
          <Rise t0={tThink}><Big size={56} color={C.gold} style={{ marginTop: 70 }}>Most of the money<br />isn't Singaporean.</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={t3} b={tIdx} bg={C.paper} push={0.03}>
        <svg width={W} height={H}>
          {(() => {
            const pA = prog(t, cu("1,650"), 0.8), pB = prog(t, cu("about 2,000"), 1.2);
            const base = 900, k = 0.26;
            return (
              <g>
                <rect x={1100} y={base - 1650 * k * pA} width={220} height={1650 * k * pA} fill={C.blueSoft} stroke={C.navy} strokeWidth={6} />
                <rect x={1420} y={base - 2000 * k * pB} width={220} height={2000 * k * pB} fill={C.gold} stroke={C.navy} strokeWidth={6} />
                <line x1={1040} x2={1700} y1={base} y2={base} stroke={C.navy} strokeWidth={6} />
                <text x={1210} y={base - 1650 * k * pA - 24} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={54} fill={C.navy} opacity={pA}>1,650</text>
                <text x={1530} y={base - 2000 * k * pB - 24} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={54} fill={C.navy} opacity={pB}>~2,000</text>
                <text x={1210} y={base + 60} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={36} fill={C.navy} opacity={pA}>months earlier</text>
                <text x={1530} y={base + 60} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={36} fill={C.navy} opacity={pB}>end of 2024</text>
              </g>
            );
          })()}
        </svg>
        <AbsoluteFill style={{ paddingLeft: 140, paddingTop: 260 }}>
          <Rise t0={t3}><Big size={40} weight={800} color={C.blue}>3 · SINGLE FAMILY OFFICES</Big></Rise>
          <Rise t0={cu("about 2,000")}><Big size={140} style={{ marginTop: 10 }}>~2,000</Big></Rise>
          <Rise t0={cu("Those are private firms")}><Big size={46} weight={700} color={C.navy2} style={{ marginTop: 10 }}>firms that manage one<br />wealthy family's fortune</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tIdx} b={sec.end + 0.6} bg={C.paper2}>
        <svg width={W} height={H}>
          {[["New York", 1, 520, 360, C.blueSoft], ["London", 2, 820, 300, C.blueSoft], ["Hong Kong", 3, 1120, 250, C.blueSoft], ["Singapore", 4, 1420, 210, C.gold]].map(
            ([n, r, x, h, c], i) => {
              const p = pop(t, cu(i === 3 ? "Singapore ranks fourth" : (n as string)) + 0.05, 0.5);
              return (
                <g key={n as string} transform={`translate(${x},920)`} opacity={Math.min(1, p)}>
                  <rect x={-130} y={-(h as number) * Math.min(1, p)} width={260} height={(h as number) * Math.min(1, p)} fill={c as string} stroke={C.navy} strokeWidth={7} />
                  <text y={-(h as number) * Math.min(1, p) + 90} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={96} fill={C.navy}>{r as number}</text>
                  <text y={70} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={44} fill={C.navy}>{n as string}</text>
                </g>
              );
            })}
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
          <Rise t0={cu("Singapore ranks fourth")}><Big size={110} color={C.navy}>#4 in the world</Big></Rise>
          <Rise t0={tIdx + 0.3}><Big size={38} weight={700} color={C.navy2}>Global Financial Centres Index · September 2025</Big></Rise>
          <Rise t0={cu("about a point")}><Big size={38} weight={800} color={C.blue} style={{ marginTop: 8 }}>about a point between each of the top four</Big></Rise>
        </AbsoluteFill>
      </Shot>
    </>
  );
};

// ── Section 8: the S$3 billion case ──────────────────────────────────────────
export const S08: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s08_scandal";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const tRaid = cu("In August 2023");
  const tTrade = cu("That's the trade-off");
  const tProduct = cu("Because being a safe place");
  const dark = "#0B1626";

  const Tag: React.FC<{ x: number; y: number; n: number; t0: number }> = ({ x, y, n, t0 }) => (
    <g transform={`translate(${x},${y}) rotate(${-8 + n * 5})`} opacity={prog(t, t0, 0.3)}>
      <rect x={0} y={-24} width={110} height={48} rx={6} fill={C.paper} stroke={C.navy} strokeWidth={4} />
      <text x={55} y={10} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={24} fill={C.red}>EVID {n}</text>
    </g>
  );

  return (
    <>
      <Shot a={sec.start - 0.2} b={tRaid} bg={dark}>
        <svg width={W} height={H}>
          <g transform="translate(960,560)">
            <rect x={-300} y={-300} width={600} height={600} rx={40} fill={C.navy2} stroke={C.paper} strokeWidth={8} />
            <circle r={200} fill={dark} stroke={C.gold} strokeWidth={10} />
            {[...Array(9)].map((_, i) => {
              const k = ((t - sec.start) * 0.35 + i / 9) % 1;
              const dirty = i % 3 === 0;
              return <circle key={i} cx={-700 + 700 * k} cy={-120 + (i % 4) * 80} r={30} fill={dirty ? "#6E7A5C" : C.gold}
                stroke={dirty ? C.red : C.navy} strokeWidth={dirty ? 6 : 4} opacity={k < 0.95 ? 1 : 0} />;
            })}
          </g>
        </svg>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 60 }}>
          <Rise t0={cu("some of that money will be dirty")}><Big size={64} color={C.paper}>some of that money will be dirty</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tRaid} b={tTrade} bg={dark}>
        <svg width={W} height={H}>
          {/* bungalow */}
          <g transform="translate(960,700)">
            <path d="M-420 -180 L0 -380 L420 -180 Z" fill={C.navy2} stroke={C.paper} strokeWidth={6} />
            <rect x={-380} y={-180} width={760} height={330} fill="#24395A" stroke={C.paper} strokeWidth={6} />
            {[-260, -40, 180].map((x) => <rect key={x} x={x} y={-120} width={120} height={110} fill={C.gold} opacity={0.6} />)}
          </g>
          {/* gold bars, car, cash */}
          <g opacity={prog(t, cu("luxury homes"), 0.4)}>
            <path d="M260 960 l40 -60 l140 0 l40 60 Z" fill={C.gold} stroke={C.navy} strokeWidth={5} />
            <path d="M320 900 l30 -45 l100 0 l30 45 Z" fill={C.gold} stroke={C.navy} strokeWidth={5} />
            <Tag x={300} y={1000} n={1} t0={cu("gold")} />
          </g>
          <g opacity={prog(t, cu("cars"), 0.4)}>
            <path d="M1350 970 l20 -70 q60 -50 180 -50 q120 0 170 60 l40 60 Z" fill={C.blue} stroke={C.navy} strokeWidth={6} />
            <circle cx={1440} cy={975} r={34} fill={C.navy} /><circle cx={1660} cy={975} r={34} fill={C.navy} />
            <Tag x={1560} y={860} n={2} t0={cu("cars") + 0.2} />
          </g>
          <g opacity={prog(t, cu("cash"), 0.4)}>
            {[0, 1, 2].map((i) => <rect key={i} x={760 + i * 14} y={930 - i * 22} width={200} height={70} rx={6} fill="#A9D3A0" stroke={C.navy} strokeWidth={4} />)}
            <Tag x={980} y={940} n={3} t0={cu("cash") + 0.2} />
          </g>
          {/* police tape */}
          {[0, 1].map((i) => {
            const p = prog(t, tRaid + 0.4 + i * 0.3, 0.6);
            return (
              <g key={i} transform={`rotate(${i ? -9 : 7} 960 ${420 + i * 240})`}>
                <rect x={-100} y={400 + i * 240} width={2200 * p} height={64} fill={C.gold} stroke={C.navy} strokeWidth={4} />
                {[...Array(5)].map((_, k) => <text key={k} x={-40 + k * 560} y={444 + i * 240} fontFamily="Inter" fontWeight={900} fontSize={34}
                  fill={C.navy} opacity={p}>POLICE LINE · DO NOT CROSS</text>)}
              </g>
            );
          })}
        </svg>
        <Stamp t0={cu("3 billion")} color={C.red} rot={-4} size={140} style={{ left: 480, top: 90 }}>S$3 BILLION</Stamp>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 290 }}>
          <Rise t0={cu("Ten foreign nationals")}><Big size={56} color={C.paper} style={{ background: C.red, padding: "10px 26px", borderRadius: 10 }}>
            10 convicted · S$2.8B surrendered</Big></Rise>
        </AbsoluteFill>
        <AbsoluteFill style={{ paddingLeft: 70, paddingTop: 60 }}>
          <Rise t0={tRaid + 0.2}><Big size={54} color={C.paper}>August 2023</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tTrade} b={tProduct} bg={C.paper2}>
        <svg width={W} height={H}>
          {/* one open door, two kinds of money walk in */}
          <g transform="translate(960,860)">
            <rect x={-150} y={-440} width={300} height={440} fill="#FFF3D6" stroke={C.navy} strokeWidth={10} />
            <path d="M-150 0 L-150 -440 L-260 -400 L-260 40 Z" fill={C.gold} stroke={C.navy} strokeWidth={8} />
          </g>
          {[...Array(10)].map((_, i) => {
            const k = ((t - tTrade) * 0.3 + i / 10) % 1;
            const dirty = i % 4 === 1;
            const fromLeft = i % 2 === 0;
            return <circle key={i} cx={fromLeft ? 200 + 760 * k : 1720 - 760 * k} cy={640 + (i % 3) * 60} r={34}
              fill={dirty ? "#6E7A5C" : C.gold} stroke={dirty ? C.red : C.navy} strokeWidth={dirty ? 7 : 4} opacity={k < 0.95 ? 1 : 0} />;
          })}
          <text x={360} y={520} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={48} fill={C.navy}
            opacity={prog(t, cu("honest investors"), 0.4)}>honest investors</text>
          <text x={1560} y={520} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={48} fill={C.red}
            opacity={prog(t, cu("people hiding money"), 0.4)}>people hiding money</text>
        </svg>
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 80 }}>
          <Rise t0={tTrade}><Big size={66}>The same open door</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tProduct} b={sec.end + 0.6} bg={C.paper}>
        <svg width={W} height={H}>
          <g transform="translate(960,560)">
            <rect x={-290} y={-290} width={580} height={580} rx={40} fill={C.navy} />
            <circle r={190} fill={C.navy2} stroke={C.gold} strokeWidth={12} />
            <circle r={40} fill={C.gold} />
            {(() => {
              const crack = prog(t, cu("If dirty money gets comfortable"), 1.0);
              const seal = prog(t, cu("the product breaks") + 1.0, 0.8);
              return (
                <g>
                  <path d="M-60 -290 L-10 -150 L-70 -60 L20 40 L-30 160 L40 290" stroke={C.red} strokeWidth={14} fill="none"
                    pathLength={1} strokeDasharray={`${crack * (1 - seal)} 1`} strokeLinejoin="round" />
                  <g opacity={seal}>
                    <rect x={-330} y={-40} width={660} height={80} fill={C.gold} stroke={C.navy} strokeWidth={6} transform="rotate(-45)" />
                    <rect x={-330} y={-40} width={660} height={80} fill={C.gold} stroke={C.navy} strokeWidth={6} transform="rotate(45)" />
                  </g>
                </g>
              );
            })()}
          </g>
        </svg>
        <AbsoluteFill style={{ paddingLeft: 90, paddingTop: 120 }}>
          <Rise t0={cu("is the product")}><Big size={70}>Safety is<br />the product.</Big></Rise>
        </AbsoluteFill>
      </Shot>
    </>
  );
};

// ── Section 9: lessons for Kigali ────────────────────────────────────────────
export const S09: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s09_kigali";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const tRec = cu("I'm recording this from Kigali");
  const tLook = cu("Because look at what Singapore");
  const tLesson = cu("The lesson isn't");
  const AF: MapSpec = { width: 1920, height: 1080, bounds: [[-30, -36], [75, 40]], res: "50m" };

  return (
    <>
      <Shot a={sec.start - 0.2} b={tRec} bg={C.blueSoft}>
        {(() => {
          const proj = useProjection(AF);
          const pins: [string, number, number, string][] = [["Kigali", 30.06, -1.95, "Kigali"], ["Nairobi", 36.82, -1.29, "Nairobi"],
            ["Lagos", 3.38, 6.52, "Lagos"], ["Dubai", 55.27, 25.2, "Dubai"]];
          return (
            <svg width={W} height={H}>
              <g transform="translate(0,0)">
                <Land spec={AF} fill={(n) => (["Rwanda", "Kenya", "Nigeria", "United Arab Emirates"].includes(n) ? C.goldSoft : C.paper)} strokeWidth={2} />
                {pins.map(([n, lon, lat, c], i) => {
                  const [x, y] = proj([lon, lat])!;
                  const p = pop(t, cu(c) - 0.1);
                  return <Pin key={n} x={x} y={y} p={p} label={n} labelSide={i === 0 ? "l" : "r"} pulse={p > 0 ? t * 0.9 + i * 0.25 : 0}
                    color={i === 0 ? C.gold : C.blue} />;
                })}
              </g>
            </svg>
          );
        })()}
        <AbsoluteFill style={{ paddingLeft: 90, paddingTop: 120, width: 700 }}>
          <Rise t0={cu("copy Singapore's playbook")}><Big size={74}>Copying the<br />playbook</Big></Rise>
          <Rise t0={cu("money capital")}><Big size={40} weight={800} color={C.navy2} style={{ marginTop: 20 }}>Africa and the Gulf want<br />their own money capital</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tRec} b={tLook} bg="#F4C27A" origin="40% 60%">
        <svg width={W} height={H}>
          <rect width={W} height={H} fill="#F4C27A" />
          <circle cx={1500} cy={330} r={110} fill="#FCE3AE" />
          <path d="M0 640 Q300 470 620 600 Q900 430 1240 590 Q1560 450 1920 560 L1920 1080 L0 1080 Z" fill="#C98C4E" />
          <path d="M0 760 Q360 620 760 740 Q1120 620 1500 730 Q1720 680 1920 720 L1920 1080 L0 1080 Z" fill="#9C6B3E" />
          {/* city: towers + a domed convention building */}
          {[[520, 520, 90], [640, 470, 70], [1240, 500, 80], [1350, 560, 70]].map(([x, y, w], i) => (
            <rect key={i} x={x} y={y} width={w} height={760 - y} fill={C.navy2} />
          ))}
          <path d="M800 760 L800 560 Q930 360 1060 560 L1060 760 Z" fill={C.navy2} />
          <path d="M840 560 Q930 410 1020 560" fill="none" stroke={C.gold} strokeWidth={8} />
          <rect x={0} y={760} width={W} height={320} fill="#7E5631" />
        </svg>
        <AbsoluteFill style={{ paddingLeft: 90, paddingTop: 90 }}>
          <Rise t0={tRec + 0.2}><Big size={80} color={C.navy}>Kigali, Rwanda</Big></Rise>
          <Rise t0={cu("Kigali International Financial Centre")}><Big size={44} weight={800} color={C.navy} style={{ marginTop: 10 }}>Kigali International Financial Centre</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tLook} b={tLesson} bg={C.paper}>
        <AbsoluteFill style={{ paddingLeft: 260, paddingTop: 150 }}>
          <Rise t0={tLook}><Big size={60} color={C.blue} weight={800}>What Singapore actually built</Big></Rise>
          <div style={{ height: 10, width: 1300 * prog(t, tLook + 0.3, 1.0), background: C.gold, borderRadius: 5, margin: "24px 0 50px" }} />
          {[["A reason to come", "a reason for money to come"], ["A trusted referee", "a referee people trusted"], ["A boring currency", "a currency that stayed boring"],
            ["Strict rules", "rules strict enough"]].map(([l, c]) => {
            const p = pop(t, cu(c), 0.4);
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 36, marginBottom: 34, opacity: Math.min(1, p * 2) }}>
                <div style={{ width: 84, height: 84, borderRadius: 16, border: `8px solid ${C.navy}`, background: p > 0.6 ? C.gold : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.max(0.01, p)})` }}>
                  <Big size={60} color={C.navy}>✓</Big>
                </div>
                <Big size={84}>{l}</Big>
              </div>
            );
          })}
        </AbsoluteFill>
      </Shot>

      <Shot a={tLesson} b={sec.end + 0.6} bg={C.navy}>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <Big size={70} color={C.blueSoft}>"cut taxes and build towers"</Big>
            <div style={{ position: "absolute", left: -20, right: -20, top: "50%", height: 10, background: C.gold,
              transform: `scaleX(${prog(t, cu("It's this"), 0.5)})`, transformOrigin: "left" }} />
          </div>
          <div style={{ height: 60 }} />
          <Rise t0={cu("money goes where")}><Big size={96} color={C.paper}>Money goes where it's</Big></Rise>
          <Rise t0={cu("treated fairly")}><Big size={96} color={C.gold}>treated fairly</Big></Rise>
          <div style={{ display: "flex", gap: 50, marginTop: 30 }}>
            <Rise t0={cu("move freely")}><Big size={50} color={C.paper} weight={800}>· moves freely</Big></Rise>
            <Rise t0={cu("won't disappear overnight")}><Big size={50} color={C.paper} weight={800}>· won't vanish overnight</Big></Rise>
          </div>
        </AbsoluteFill>
      </Shot>
    </>
  );
};

// ── Section 10: the answer + outro ───────────────────────────────────────────
export const S10: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const id = "s10_close";
  const sec = tl.sections.find((s) => s.id === id)!;
  const cu = (p: string, n = 0) => cueTime(tl, id, p, n);
  const tNext = cu("Next time in Money Cities");
  const end = tl.duration;

  return (
    <>
      <Shot a={sec.start - 0.2} b={tNext} push={0.05} origin="50% 80%">
        <Skyline t={t} mode="dusk" />
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
          <Rise t0={cu("The port got it started")}><Big size={54} color={C.navy} weight={800}>The port got it started.</Big></Rise>
          <Rise t0={cu("most trusted place")}><Big size={84} color={C.navy} style={{ marginTop: 14, textAlign: "center" }}>The world's most trusted<br />place to keep money.</Big></Rise>
        </AbsoluteFill>
      </Shot>

      <Shot a={tNext} b={end + 1} bg={C.paper} push={0.02}>
        {/* bottom-right kept clear for YouTube end-screen elements */}
        <AbsoluteFill style={{ paddingLeft: 110, paddingTop: 110 }}>
          <Rise t0={tNext}>
            <div style={{ background: C.navy, borderRadius: 30, padding: "40px 60px", width: 820, boxShadow: `16px 16px 0 ${C.gold}` }}>
              <Big size={40} color={C.blueSoft} weight={800}>NEXT IN MONEY CITIES</Big>
              <Big size={150} color={C.gold}>LONDON</Big>
              <Big size={36} color={C.paper} weight={700}>the city that trades more currency than anywhere on Earth</Big>
            </div>
          </Rise>
          <Rise t0={cu("subscribe")} style={{ marginTop: 60 }}>
            <div style={{ display: "inline-block", background: C.gold, color: C.navy, fontFamily: "Inter", fontWeight: 900, fontSize: 56,
              padding: "18px 44px", borderRadius: 16, transform: `scale(${1 + 0.04 * Math.sin(t * 5)})` }}>SUBSCRIBE</div>
          </Rise>
        </AbsoluteFill>
        <AbsoluteFill style={{ paddingLeft: 110, justifyContent: "flex-end", paddingBottom: 120 }}>
          <Rise t0={cu("This video is for education only")}><Big size={34} weight={700} color={C.navy2}>For education only. Not financial advice.</Big></Rise>
        </AbsoluteFill>
      </Shot>
    </>
  );
};
