import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT, Big, Rise, Stamp, useT, useTimeline, prog, pop, countUp, vis } from "./lib";
import { Land, Pin, useProjection, MapSpec } from "./Maps";
import { Section, Chip, Pos, Head, Card, Ctx } from "./kit";

// Crash Files Ep. 2: the 2008 financial crisis. Illustrated shots (public/img) + exact overlays.
// Every number on screen comes from the owner's research table and matches the narration.
const W = 1920, H = 1080;

const RedChip: React.FC<{ t0: number; size?: number; children: React.ReactNode }> = ({ t0, size = 54, children }) => (
  <Rise t0={t0}><div style={{ display: "inline-block", background: C.red, color: C.paper, fontFamily: FONT, fontWeight: 900, fontSize: size,
    padding: "12px 28px", borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}>{children}</div></Rise>
);

/** Small label row inside cards. */
const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => <Big size={38} weight={800} color={C.blue}>{children}</Big>;

// ── Title sting ──────────────────────────────────────────────────────────────
export const Sting: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const a = tl.sections[0].end + 0.2;
  const b = tl.sections[1].start - 0.1;
  if (t < a - 0.1 || t > b + 0.3) return null;
  return (
    <AbsoluteFill style={{ opacity: vis(t, a, b + 0.3, 0.25, 0.3) }}>
      <Img src={staticFile("img/s01_case_file.jpg")} style={{ position: "absolute", width: W, height: 1097, top: -8, transform: `scale(${1.05 + 0.04 * prog(t, a, 3)})` }} />
      <AbsoluteFill style={{ background: "rgba(19,35,58,0.6)", alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${0.85 + 0.15 * pop(t, a, 0.5)})`, textAlign: "center" }}>
          <Big size={170} color={C.gold} style={{ letterSpacing: 8, textShadow: "0 8px 0 #0B1626" }}>CRASH FILES</Big>
          <div style={{ height: 10, width: 1100 * prog(t, a + 0.3, 0.9), background: C.gold, margin: "18px auto", borderRadius: 5 }} />
          <Rise t0={a + 0.7}><Big size={56} color={C.paper} weight={800}>The 2008 Financial Crisis</Big></Rise>
          <Rise t0={a + 1.0}><Big size={38} color={C.blueSoft} weight={700} style={{ marginTop: 10 }}>How a House Broke the World</Big></Rise>
        </div>
        <Stamp t0={a + 1.2} color={C.red} rot={-10} size={64} style={{ right: 260, top: 230 }}>FILE 02</Stamp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Data overlays ────────────────────────────────────────────────────────────
const TeaserPayments: React.FC<{ t: number; a: number; cu: Ctx["cu"] }> = ({ t, a, cu }) => {
  const months = 36, jumpAt = 24;
  const p = prog(t, a + 0.3, 2.2, (x) => x);
  const jump = prog(t, cu("then jumped"), 0.6);
  return (
    <Card t0={a} width={1400}>
      <Kicker>A "TEASER" MORTGAGE</Kicker>
      <svg width={1200} height={460} style={{ marginTop: 20 }}>
        <line x1={40} y1={400} x2={1180} y2={400} stroke={C.navy} strokeWidth={5} />
        {[...Array(months)].map((_, i) => {
          const show = i / months <= p;
          const h = i < jumpAt ? 80 : 80 + 230 * jump;
          return show ? <rect key={i} x={50 + i * 31.5} y={400 - h} width={24} height={h} rx={4} fill={i < jumpAt ? C.blue : C.red} /> : null;
        })}
        <line x1={50 + jumpAt * 31.5 - 4} x2={50 + jumpAt * 31.5 - 4} y1={60} y2={400} stroke={C.navy} strokeWidth={4} strokeDasharray="10 8" />
        <text x={360} y={300} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill={C.navy}>tiny payments for 2 years</text>
        <text x={1000} y={50} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={40} fill={C.red} opacity={jump}>then they jump</text>
        <text x={40} y={445} fontFamily="Inter" fontWeight={700} fontSize={28} fill={C.navy}>monthly payment →</text>
      </svg>
    </Card>
  );
};

const WorldArcs: React.FC<{ t: number; cu: Ctx["cu"] }> = ({ t, cu }) => {
  const WORLD: MapSpec = { width: 1800, height: 900, bounds: [[-130, -40], [150, 72]], kind: "equalEarth", res: "110m" };
  const proj = useProjection(WORLD);
  const [nx, ny] = proj([-116.8, 38.8])!;
  const dests: [string, number, number, string, string][] = [
    ["Norway", 10.7, 59.9, "a pension fund in Norway", "pension fund"], ["Germany", 13.4, 52.5, "a bank in Germany", "bank"],
    ["Asia", 121.5, 25.0, "an insurer in Asia", "insurer"]];
  return (
    <AbsoluteFill style={{ background: "#9CC3EE" }}>
      <svg width={W} height={H}>
        <g transform="translate(60,110)">
          <Land spec={WORLD} fill={(n) => (n === "United States of America" ? C.goldSoft : "#B9D9A6")} strokeWidth={1.5} />
          <Pin x={nx} y={ny} p={pop(t, cu("a house in Nevada"))} color={C.red} label="Nevada" labelSide="l" />
          {dests.map(([n, lon, lat, cue, kind], i) => {
            const [x, y] = proj([lon, lat])!;
            const k = prog(t, cu(cue) - 0.3, 1.0);
            const mx = (nx + x) / 2, my = Math.min(ny, y) - 220 - i * 30;
            return (
              <g key={n}>
                <path d={`M${nx} ${ny} Q${mx} ${my} ${x} ${y}`} fill="none" stroke={C.navy} strokeWidth={7} strokeLinecap="round"
                  pathLength={1} strokeDasharray={`${k} 1`} />
                <Pin x={x} y={y} p={k >= 1 ? pop(t, cu(cue) + 0.7) : 0} color={C.gold} label={`${kind}, ${n}`} />
              </g>
            );
          })}
        </g>
      </svg>
      <Pos x={80} y={60}><Chip t0={cu("So a risky loan")} size={52}>A risky loan becomes a "safe" investment</Chip></Pos>
    </AbsoluteFill>
  );
};

const LeverageTower: React.FC<{ t: number; cu: Ctx["cu"]; a: number }> = ({ t, cu, a }) => {
  const pA = prog(t, cu("680 billion"), 1.4), pC = prog(t, cu("22.5 billion"), 0.8);
  const full = 560;
  return (
    <Card t0={a} width={1450}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 60 }}>
        <svg width={560} height={640}>
          <line x1={20} x2={540} y1={620} y2={620} stroke={C.navy} strokeWidth={6} />
          <rect x={60} y={620 - full * pA} width={200} height={full * pA} fill={C.blueSoft} stroke={C.navy} strokeWidth={6} />
          {[...Array(14)].map((_, i) => (620 - (i + 1) * 40 > 620 - full * pA ? <line key={i} x1={60} x2={260} y1={620 - (i + 1) * 40} y2={620 - (i + 1) * 40} stroke={C.navy} strokeWidth={2} opacity={0.35} /> : null))}
          <rect x={320} y={620 - (full * 22.5 / 680) * pC} width={200} height={(full * 22.5 / 680) * pC} fill={C.gold} stroke={C.navy} strokeWidth={6} />
          <text x={160} y={600 - full * pA} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={44} fill={C.navy} opacity={pA}>$680B</text>
          <text x={420} y={570} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={44} fill={C.navy} opacity={pC}>$22.5B</text>
        </svg>
        <div style={{ textAlign: "left", flex: 1 }}>
          <Kicker>LEHMAN BROTHERS, 2008</Kicker>
          <Rise t0={cu("680 billion")}><Big size={46} weight={800}>assets: about $680 billion</Big></Rise>
          <Rise t0={cu("22.5 billion")}><Big size={46} weight={800} color={C.navy2}>own capital: $22.5 billion</Big></Rise>
          <Rise t0={cu("31 dollars for every")}><Big size={200} color={C.red} style={{ marginTop: 20 }}>31 : 1</Big></Rise>
          <Rise t0={cu("31 dollars for every")}><Big size={36} weight={700} color={C.navy2}>borrowed per dollar owned (2007)</Big></Rise>
        </div>
      </div>
    </Card>
  );
};

const HousePriceChart: React.FC<{ t: number; cu: Ctx["cu"]; a: number }> = ({ t, cu, a }) => {
  // stylised index: rises to a 2006 peak, then falls about 30% by mid-2009
  const pts: [number, number][] = [[2000, 62], [2001, 67], [2002, 73], [2003, 80], [2004, 89], [2005, 97], [2006.5, 100], [2007.5, 90], [2008.5, 76], [2009.5, 70]];
  const x = (yr: number) => 90 + (yr - 2000) * 115, y = (v: number) => 560 - (v - 55) * 9;
  const draw = prog(t, a + 0.2, 3.2, (z) => z);
  const n = Math.max(2, Math.round(pts.length * draw));
  const d = "M" + pts.slice(0, n).map(([yr, v]) => `${x(yr)},${y(v)}`).join(" L");
  const drop = prog(t, cu("down about 30%"), 0.6);
  return (
    <Card t0={a} width={1400}>
      <Kicker>US HOME PRICES (STYLISED)</Kicker>
      <svg width={1250} height={620}>
        <line x1={80} y1={580} x2={1220} y2={580} stroke={C.navy} strokeWidth={5} />
        {[2000, 2002, 2004, 2006, 2008].map((yr) => <text key={yr} x={x(yr)} y={615} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={28} fill={C.navy}>{yr}</text>)}
        <path d={d} fill="none" stroke={draw > 0.65 ? C.red : C.blue} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
        <g opacity={drop}>
          <line x1={x(2006.5)} x2={x(2009.5) + 40} y1={y(100)} y2={y(100)} stroke={C.navy} strokeWidth={3} strokeDasharray="10 8" />
          <text x={x(2008)} y={y(100) - 20} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={34} fill={C.navy}>2006 peak</text>
          <text x={x(2009.5) - 10} y={y(70) + 70} textAnchor="end" fontFamily="Inter" fontWeight={900} fontSize={80} fill={C.red}>−30%</text>
        </g>
      </svg>
      <Big size={34} weight={700} color={C.navy2}>mid-2006 to mid-2009, on average</Big>
    </Card>
  );
};

const SeptemberCalendar: React.FC<{ t: number; cu: Ctx["cu"] }> = ({ t, cu }) => {
  const days: [string, string, string, string, string][] = [
    ["7", "SEP", "Fannie Mae & Freddie Mac", "TAKEN OVER", "On the 7th"],
    ["15", "SEP", "Lehman Brothers", "BANKRUPT", "On the 15th"],
    ["16", "SEP", "AIG rescued", "$85B for 80%", "On the 16th"],
    ["3", "OCT", "TARP approved", "$700 BILLION", "On the 3rd of October"]];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 34 }}>
      {days.map(([d, m, what, tag, cue], i) => {
        const p = pop(t, cu(cue), 0.45);
        return (
          <div key={d + m} style={{ width: 400, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - Math.min(1, p)) * 80}px) rotate(${(i % 2 ? 2 : -2) * Math.min(1, p)}deg)`,
            background: C.paper, border: `7px solid ${C.navy}`, borderRadius: 24, overflow: "hidden", boxShadow: `12px 12px 0 ${C.gold}`, fontFamily: FONT }}>
            <div style={{ background: C.red, color: C.paper, fontWeight: 900, fontSize: 44, padding: "10px 0", textAlign: "center" }}>{m} 2008</div>
            <div style={{ textAlign: "center", fontWeight: 900, fontSize: 170, color: C.navy, lineHeight: 1.1 }}>{d}</div>
            <div style={{ textAlign: "center", fontWeight: 800, fontSize: 34, color: C.navy, padding: "0 14px" }}>{what}</div>
            <div style={{ textAlign: "center", margin: "16px 0 22px" }}>
              <span style={{ background: C.navy, color: C.gold, fontWeight: 900, fontSize: 34, padding: "6px 16px", borderRadius: 10 }}>{tag}</span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const RateDial: React.FC<{ t: number; cu: Ctx["cu"] }> = ({ t, cu }) => {
  const k = prog(t, cu("all the way down"), 2.2);
  const rate = 5.25 * (1 - k);
  const ang = -90 + (rate / 6) * 180; // semicircle: left = 0%, right = 6%
  return (
    <Card t0={cu("And the Federal Reserve")} width={1400}>
      <div style={{ display: "flex", alignItems: "center", gap: 70 }}>
        <svg width={520} height={420}>
          <g transform="translate(260,280)">
            <path d="M-220 0 A220 220 0 0 1 220 0" fill="none" stroke={C.paper2} strokeWidth={46} />
            <path d="M-220 0 A220 220 0 0 1 220 0" fill="none" stroke={C.gold} strokeWidth={46} pathLength={1} strokeDasharray={`${(rate / 6) * 0.98} 1`} />
            <line x1={0} y1={0} x2={0} y2={-190} stroke={C.navy} strokeWidth={14} strokeLinecap="round" transform={`rotate(${ang})`} />
            <circle r={26} fill={C.navy} />
            <text y={110} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={84} fill={C.navy}>{k >= 1 ? "≈0%" : `${rate.toFixed(2)}%`}</text>
          </g>
        </svg>
        <div style={{ textAlign: "left" }}>
          <Kicker>FEDERAL RESERVE</Kicker>
          <Big size={64}>interest rates</Big>
          <Big size={64} color={C.navy2}>5.25% → almost zero</Big>
          <Rise t0={cu("1.75 trillion")}><Big size={56} color={C.green} style={{ marginTop: 26 }}>+ ~$1.75 trillion</Big>
            <Big size={34} weight={700} color={C.navy2}>of assets bought</Big></Rise>
        </div>
      </div>
    </Card>
  );
};

const StatCard: React.FC<{ t0: number; kicker: string; big: React.ReactNode; sub: string; color?: string }> = ({ t0, kicker, big, sub, color = C.red }) => (
  <Card t0={t0} width={1250}>
    <Kicker>{kicker}</Kicker>
    <Big size={190} color={color} style={{ margin: "6px 0", fontVariantNumeric: "tabular-nums" }}>{big}</Big>
    <Big size={44} weight={700} color={C.navy2}>{sub}</Big>
  </Card>
);

// ── Sections ─────────────────────────────────────────────────────────────────
export const E01: React.FC = () => (
  <Section id="s01_cold_open" shots={[
    { at: null, img: "s01_bank_tower_dawn", move: "up", render: ({ a, cu }) => (<>
      <Pos x={90} y={80}><Chip t0={a + 0.4} size={70}>15 September 2008</Chip><Chip t0={cu("survived 158 years")} size={48} gold>158 years old</Chip></Pos>
      <Stamp t0={cu("filed for bankruptcy")} color={C.red} rot={-6} size={96} style={{ right: 140, bottom: 170 }}>BANKRUPT</Stamp></>) },
    { at: "Lehman Brothers owed", img: "s01_wall_street", move: "in", dim: 0.35, render: ({ t, cu, a }) => (
      <Pos center y={250}><Head t0={cu("Lehman Brothers owed")} size={80}>Lehman Brothers owed</Head>
        <Big size={190} color={C.gold} style={{ textShadow: "0 8px 0 #0B1626", fontVariantNumeric: "tabular-nums" }}>${Math.round(countUp(t, a + 0.2, Math.max(1.6, cu("619 billion") - a), 0, 619))} BILLION</Big>
        <Chip t0={cu("biggest bankruptcy")} size={50}>the biggest bankruptcy in US history</Chip></Pos>) },
    { at: "That same day", img: "s01_red_board", move: "left", render: ({ cu }) => (
      <Pos x={90} y={80}><RedChip t0={cu("fell more than 500")} size={80}>Dow −500</RedChip></Pos>) },
    { at: "Within a year", img: "s01_lost_jobs", move: "right", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("their jobs")} size={56}>jobs</Chip><Chip t0={cu("their savings")} size={56}>savings</Chip><Chip t0={cu("their homes")} size={56}>homes</Chip></Pos>) },
    { at: "Not just in America", img: "s01_world_storm", move: "in", render: ({ cu }) => (
      <Pos center bottom={90}><Chip t0={cu("around the world")} size={58} gold>around the world</Chip></Pos>) },
    { at: "And the strangest part", img: "s01_one_house", move: "in", render: ({ cu }) => (
      <Pos center y={90}><Head t0={cu("A house.")} size={130}>A house.</Head></Pos>) },
    { at: "Millions of ordinary houses", img: "s02_suburb_sold", move: "out", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("Millions of ordinary houses")} size={56}>millions of houses…</Chip><Chip t0={cu("never really there")} size={56} gold>bought with money that wasn't there</Chip></Pos>) },
    { at: "So how does a house break", img: "s01_house_globe", move: "in", render: ({ cu }) => (
      <Pos x={90} y={90}><Head t0={cu("So how does a house break")} size={100}>How does a house</Head><Head t0={cu("break the world")} size={100} color={C.gold}>break the world?</Head></Pos>) },
  ]} />
);

export const E02: React.FC = () => (
  <Section id="s02_subprime" shots={[
    { at: null, img: "s02_suburb_sold", move: "right", render: ({ a, cu }) => (
      <Pos x={90} y={80}><Chip t0={a + 0.3} size={62}>early 2000s</Chip><Chip t0={cu("borrowing was cheap")} size={50} gold>low rates · cheap borrowing</Chip></Pos>) },
    { at: "owning a home was the dream", img: "s02_cheap_money", move: "in" },
    { at: "Banks were happy to help", img: "s02_loan_officer", move: "in", render: ({ cu }) => (<>
      <Pos x={90} y={80}><Chip t0={cu("weak credit")} size={50}>weak credit? approved</Chip><Chip t0={cu("no proof of income")} size={50}>no proof of income? approved</Chip></Pos>
      <Stamp t0={cu("Lenders started giving")} color={C.green} rot={-8} size={100} style={{ right: 180, top: 380 }}>APPROVED</Stamp></>) },
    { at: "Some loans came with tiny", img: "s02_calendar_piggy", move: "in", dim: 0.45, render: ({ t, a, cu }) => <TeaserPayments t={t} a={a} cu={cu} /> },
    { at: "These were called subprime", img: "s02_kitchen_bills", move: "in", dim: 0.3, render: ({ cu }) => (
      <Pos center y={300}><Head t0={cu("subprime mortgages")} size={150} color={C.gold}>SUBPRIME</Head>
        <Chip t0={cu("Risky loans to risky borrowers")} size={60}>risky loans to risky borrowers</Chip></Pos>) },
    { at: "Now, you'd think", img: "s02_lender_sells", move: "left", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("here's the trick")} size={56}>the trick:</Chip><Chip t0={cu("They planned to sell them")} size={64} gold>they didn't keep the loans. They sold them.</Chip></Pos>) },
  ]} />
);

export const E03: React.FC = () => (
  <Section id="s03_wall_street" shots={[
    { at: null, img: "s03_wall_street_noon", move: "up", render: ({ a }) => (
      <Pos center y={120}><Head t0={a + 0.2} size={120}>Enter Wall Street</Head></Pos>) },
    { at: "Imagine thousands of mortgages", img: "s03_giant_pot", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("Good ones, bad ones")} size={56}>good loans + bad loans, mixed</Chip></Pos>) },
    { at: "Wall Street banks took that pot", img: "s03_bond_factory", move: "right", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("mortgage-backed securities")} size={62} gold>Mortgage-backed securities</Chip>
        <Chip t0={cu("Every month")} size={44}>homeowners' payments → bond owners</Chip></Pos>) },
    { at: "Then they went further", img: "s03_layer_cake", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("sliced those bonds")} size={54}>sliced into layers</Chip><Chip t0={cu("called CDOs")} size={80} gold>CDOs</Chip>
        <Chip t0={cu("The top layers")} size={44}>top layers paid first = "safest"</Chip></Pos>) },
    { at: "And the ratings agencies", img: "s03_stamp_machine", move: "in", render: ({ cu }) => (<>
      <Stamp t0={cu("stamped many of them")} color={C.gold} rot={-8} size={190} style={{ left: 640, top: 330 }}>AAA?</Stamp>
      <Pos center bottom={80}><Chip t0={cu("As safe as government debt")} size={50}>"as safe as government debt"</Chip></Pos></>) },
    { at: "So a risky loan", render: ({ t, cu }) => <WorldArcs t={t} cu={cu} /> },
    { at: "The whole machine rested", img: "s03_house_of_cards", move: "up", render: ({ cu }) => (
      <Pos center y={80}><Head t0={cu("house prices don't fall")} size={96} color={C.gold}>"House prices don't fall."</Head>
        <Chip t0={cu("Not nationally")} size={48}>not nationally · not all at once</Chip></Pos>) },
  ]} />
);

export const E04: React.FC = () => (
  <Section id="s04_leverage" shots={[
    { at: null, img: "s04_money_ladder", move: "up", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("They borrowed to buy it")} size={64} gold>They borrowed to buy it.</Chip></Pos>) },
    { at: "Take Lehman Brothers", img: "s03_wall_street_noon", move: "in", dim: 0.55, render: ({ t, cu, a }) => <LeverageTower t={t} cu={cu} a={a} /> },
    { at: "Let that sink in", img: "s04_tower_on_coins", move: "up", dim: 0.25, render: ({ cu }) => (
      <Pos center y={140}><Head t0={cu("fall by just over 3%")} size={96}>Fall just over 3%</Head>
        <RedChip t0={cu("your own money is gone")} size={90}>→ WIPED OUT</RedChip></Pos>) },
    { at: "It's like buying a house", img: "s04_no_deposit", move: "right", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("almost no deposit")} size={56}>a house with almost no deposit</Chip>
        <Chip t0={cu("Great when prices rise")} size={50} gold>great when prices rise</Chip><RedChip t0={cu("Deadly when they don't")} size={50}>deadly when they don't</RedChip></Pos>) },
  ]} />
);

export const E05: React.FC = () => (
  <Section id="s05_fall" shots={[
    { at: null, img: "s05_price_signs", move: "in", render: ({ a }) => (
      <Pos center y={120}><Head t0={a + 0.2} size={120}>And then… they didn't.</Head></Pos>) },
    { at: "From the middle of 2006", img: "s05_price_signs", move: "out", dim: 0.5, render: ({ t, cu, a }) => <HousePriceChart t={t} cu={cu} a={a} /> },
    { at: "Those teaser loans reset", img: "s05_foreclosure", move: "left", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("reset to higher payments")} size={52}>payments jump</Chip><Chip t0={cu("couldn't pay")} size={52}>borrowers can't pay</Chip>
        <RedChip t0={cu("foreclosure")} size={56}>FORECLOSURE</RedChip></Pos>) },
    { at: "And the money flowing", img: "s05_dry_pipe", move: "right", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("started drying up")} size={56}>the money stops flowing</Chip></Pos>) },
    { at: "Suddenly, nobody knew", img: "s05_question_marks", move: "in", render: ({ cu }) => (
      <Pos center y={80}><Head t0={cu("really worth")} size={100}>AAA = ???</Head><Chip t0={cu("nobody wants to lend")} size={48} gold>no buyers · no lenders</Chip></Pos>) },
    { at: "The first big domino", img: "s05_dark_tower", move: "in", render: ({ t, cu }) => {
      const k = prog(t, cu("2 dollars a share"), 1.2);
      return (<>
        <Pos x={90} y={80}><Chip t0={cu("The first big domino")} size={56}>March 2008 · Bear Stearns runs out of cash</Chip></Pos>
        <Pos right={120} bottom={180}>
          <Rise t0={cu("JPMorgan bought it")}><div style={{ background: C.paper, border: `8px solid ${C.navy}`, borderRadius: 24, padding: "20px 40px", fontFamily: FONT, textAlign: "center" }}>
            <Big size={34} weight={800} color={C.blue}>PRICE PER SHARE</Big>
            <Big size={150} color={k > 0.5 ? C.red : C.navy} style={{ fontVariantNumeric: "tabular-nums" }}>${Math.round(30 - 28 * k)}</Big>
            <Big size={34} weight={700} color={C.navy2}>days earlier: ~$30</Big></div></Rise></Pos></>);
    } },
    { at: "That was the warning", img: "s05_lighthouse", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("That was the warning")} size={62}>The warning.</Chip><Chip t0={cu("Most people didn't listen")} size={50} gold>Most people didn't listen.</Chip></Pos>) },
  ]} />
);

export const E06: React.FC = () => (
  <Section id="s06_september" shots={[
    { at: null, img: "s06_calendar_wind", move: "in", render: ({ a }) => (
      <Pos center y={120}><Head t0={a + 0.2} size={130}>September 2008</Head></Pos>) },
    { at: "On the 7th", img: "s06_gov_building", move: "up", render: ({ cu }) => (<>
      <Pos x={90} y={80}><Chip t0={cu("On the 7th")} size={60}>7 Sept · Fannie Mae & Freddie Mac</Chip></Pos>
      <Stamp t0={cu("took over")} color={C.red} rot={-7} size={110} style={{ right: 150, bottom: 200 }}>TAKEN OVER</Stamp></>) },
    { at: "On the 15th", img: "s06_domino_towers", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("On the 15th")} size={60}>15 Sept · Lehman Brothers collapses</Chip><RedChip t0={cu("no rescue")} size={52}>no rescue</RedChip></Pos>) },
    { at: "On the 16th", img: "s06_life_ring", move: "left", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("On the 16th")} size={60}>16 Sept · AIG rescued</Chip><Chip t0={cu("85 billion")} size={70} gold>$85B for 80%</Chip></Pos>) },
    { at: "Banks stopped trusting", img: "s06_frozen_city", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("Lending froze")} size={66}>Lending froze.</Chip></Pos>) },
    { at: "On the 3rd of October", img: "s06_capitol_night", move: "in", dim: 0.35, render: ({ t, cu }) => <SeptemberCalendar t={t} cu={cu} /> },
    { at: "And the Federal Reserve", img: "s06_rate_dial", move: "in", dim: 0.45, render: ({ t, cu }) => <RateDial t={t} cu={cu} /> },
    { at: "The system didn't collapse", img: "s06_money_printer", move: "right", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("The system didn't collapse")} size={56}>The system survived…</Chip><RedChip t0={cu("the damage was already done")} size={56}>…but the damage was done</RedChip></Pos>) },
  ]} />
);

export const E07: React.FC = () => (
  <Section id="s07_damage" shots={[
    { at: null, img: "s07_grey_city", move: "in", dim: 0.45, render: ({ t, cu, a }) => (
      <StatCard t0={a + 0.2} kicker="S&P 500 · OCT 2007 → MAR 2009" big={`−${Math.round(countUp(t, a + 0.4, Math.max(1.4, cu("fell 57%") - a), 0, 57))}%`} sub="from peak to bottom" />) },
    { at: "The recession ran", img: "s07_grey_city", move: "out", dim: 0.45, render: ({ cu, a }) => (
      <StatCard t0={a + 0.1} kicker="RECESSION · DEC 2007 → JUN 2009" big="18 months" sub="economy −4.3%, the biggest drop since World War Two" color={C.navy} />) },
    { at: "Unemployment doubled", img: "s07_job_queue", move: "left", dim: 0.45, render: ({ cu, a }) => (
      <StatCard t0={a + 0.1} kicker="UNEMPLOYMENT" big="5% → 10%" sub="it doubled, to a peak in October 2009" />) },
    { at: "American households saw", img: "s07_empty_wallet", move: "in", dim: 0.45, render: ({ a }) => (
      <StatCard t0={a + 0.1} kicker="US HOUSEHOLD NET WORTH" big="$69T → $55T" sub="about $14 trillion gone" />) },
    { at: "And about four million", img: "s07_moving_out", move: "right", dim: 0.3, render: ({ cu, a }) => (
      <Pos center y={250}><Head t0={a + 0.2} size={200} color={C.gold}>4 million</Head><Chip t0={cu("lost their homes")} size={60}>families lost their homes</Chip></Pos>) },
    { at: "The homes that started", img: "s09_house_globe_dusk", move: "in", render: ({ cu }) => (
      <Pos x={90} y={90}><Chip t0={cu("ended it too")} size={56}>The homes that started it… ended it too.</Chip></Pos>) },
  ]} />
);

export const E08: React.FC = () => (
  <Section id="s08_lessons" shots={[
    { at: null, img: "s08_report_desk", move: "in", render: ({ a, cu }) => (<>
      <Pos center y={100}><Head t0={a + 0.2} size={110}>So what's the lesson?</Head></Pos>
      <Pos x={90} bottom={110}><Chip t0={cu("official US inquiry")} size={48}>US inquiry report, 2011</Chip></Pos></>) },
    { at: "The crisis, it said", img: "s08_report_desk", move: "out", dim: 0.55, render: ({ cu }) => (
      <Pos center y={330}><Head t0={cu("the result of human action")} size={96} color={C.gold}>"the result of human<br />action and inaction"</Head></Pos>) },
    { at: "Warning signs were there", img: "s08_empty_sentry", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("Warning signs were there")} size={56}>warning signs: there</Chip><Chip t0={cu("not at their posts")} size={56} gold>regulators: not at their posts</Chip></Pos>) },
    { at: "I see three lessons", img: "s08_blackboard", move: "in", dim: 0.35, render: ({ cu }) => (
      <Pos x={150} y={170}>{[["1. Leverage turns small problems fatal", "One: leverage"], ["2. \"Can't fall\" can fall", "Two: when everyone"], ["3. Someone must check", "And three"]].map(([l, c]) =>
        <Chip key={l} t0={cu(c)} size={64}>{l}</Chip>)}</Pos>) },
    { at: "rules only work", img: "s08_inspector", move: "in", render: ({ cu }) => (
      <Pos center y={80}><Chip t0={cu("rules only work")} size={60} gold>Rules only work if someone is checking.</Chip></Pos>) },
  ]} />
);

export const E09: React.FC = () => {
  const tl = useTimeline();
  return (
    <Section id="s09_close" last shots={[
      { at: null, img: "s09_house_globe_dusk", move: "in", render: ({ cu }) => (
        <Pos x={90} y={80}><Chip t0={cu("risky loans get dressed up")} size={48}>risky loans dressed up as safe</Chip>
          <Chip t0={cu("sold around the planet")} size={48}>sold around the planet</Chip><Chip t0={cu("bought with borrowed money")} size={48}>bought with borrowed money</Chip>
          <Chip t0={cu("stop rising")} size={56} gold>…then prices stop rising</Chip></Pos>) },
      { at: "That's 2008", img: "s01_house_globe", move: "out", dim: 0.2, render: ({ cu }) => (
        <Pos center y={330}><Head t0={cu("That's 2008")} size={170} color={C.gold}>That's 2008.</Head></Pos>) },
      { at: "Next time in Crash Files", img: "s09_black_monday", move: "right", dim: 0.25, render: ({ t, a, cu }) => (
        // bottom-right corner kept clear for YouTube end-screen elements
        <Pos x={110} y={100}>
          <Rise t0={a + 0.2}>
            <div style={{ background: C.navy, borderRadius: 30, padding: "36px 56px", width: 860, boxShadow: `16px 16px 0 ${C.gold}` }}>
              <Big size={38} color={C.blueSoft} weight={800}>NEXT IN CRASH FILES</Big>
              <Big size={120} color={C.gold}>BLACK MONDAY</Big>
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <Big size={70} color={C.paper}>1987</Big>
                <span style={{ background: C.red, color: C.paper, fontFamily: FONT, fontWeight: 900, fontSize: 56, padding: "4px 18px", borderRadius: 12 }}>−22%</span>
                <Big size={32} color={C.paper} weight={700}>in a single day</Big>
              </div>
            </div>
          </Rise>
          <Rise t0={cu("subscribe")}><div style={{ display: "inline-block", marginTop: 30, background: C.gold, color: C.navy, fontFamily: FONT, fontWeight: 900,
            fontSize: 56, padding: "18px 44px", borderRadius: 16, transform: `scale(${1 + 0.04 * Math.sin(t * 5)})` }}>SUBSCRIBE</div></Rise>
          <Rise t0={cu("This video is for education only")}><div style={{ display: "inline-block", marginTop: 130, background: "rgba(19,35,58,0.85)",
            color: C.paper, fontFamily: FONT, fontWeight: 700, fontSize: 30, padding: "8px 18px", borderRadius: 10 }}>For education only. Not financial advice.</div></Rise>
        </Pos>) },
    ]} />
  );
};
