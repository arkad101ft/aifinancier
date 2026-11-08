import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, Easing } from "remotion";
import { C, FONT, Big, Rise, Stamp, useT, useTimeline, cueTime, prog, pop, countUp, fmt, Timeline } from "./lib";
import { Land, Pin, useProjection, MapSpec } from "./Maps";

// v2: illustrated backgrounds (SDXL-Lightning, public/img) + exact data overlays.
const W = 1920, H = 1080;

type Move = "in" | "out" | "left" | "right" | "up";
type Ctx = { t: number; cu: (p: string, n?: number) => number; a: number; b: number };
type ShotDef = { at: string | null; img?: string; move?: Move; dim?: number; bg?: string; render?: (c: Ctx) => React.ReactNode };

// ── Building blocks ──────────────────────────────────────────────────────────
const Illo: React.FC<{ img: string; a: number; b: number; move: Move; dim: number; blur?: number }> = ({ img, a, b, move, dim, blur = 0 }) => {
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
const Chip: React.FC<{ t0: number; children: React.ReactNode; size?: number; gold?: boolean; style?: React.CSSProperties }> = ({
  t0, children, size = 54, gold, style }) => (
  <Rise t0={t0} style={{ display: "inline-block", ...style }}>
    <div style={{ display: "inline-block", background: gold ? C.gold : "rgba(19,35,58,0.92)", color: gold ? C.navy : C.paper,
      fontFamily: FONT, fontWeight: 900, fontSize: size, padding: "14px 30px", borderRadius: 16, letterSpacing: -0.5,
      boxShadow: "0 10px 30px rgba(0,0,0,0.25)", borderLeft: gold ? undefined : `10px solid ${C.gold}` }}>{children}</div>
  </Rise>
);

const Pos: React.FC<{ x?: number; y?: number; right?: number; bottom?: number; center?: boolean; children: React.ReactNode }> = ({
  x, y, right, bottom, center, children }) => (
  <div style={{ position: "absolute", left: center ? 0 : x, right: center ? 0 : right, top: y, bottom,
    textAlign: center ? "center" : undefined, display: "flex", flexDirection: "column",
    alignItems: center ? "center" : right !== undefined ? "flex-end" : "flex-start", gap: 16 }}>{children}</div>
);

/** Big headline with a dark halo so it reads on illustrations. */
const Head: React.FC<{ t0: number; size?: number; color?: string; children: React.ReactNode }> = ({ t0, size = 110, color = C.paper, children }) => (
  <Rise t0={t0}><Big size={size} color={color} style={{ textShadow: "0 6px 0 rgba(19,35,58,0.9), 0 0 40px rgba(19,35,58,0.8)" }}>{children}</Big></Rise>
);

const Card: React.FC<{ t0: number; children: React.ReactNode; width?: number }> = ({ t0, children, width = 1150 }) => {
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

const NameChip: React.FC<{ t0: number; name: string; role: string; x: number; y: number }> = ({ t0, name, role, x, y }) => (
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
const Section: React.FC<{ id: string; shots: ShotDef[]; last?: boolean }> = ({ id, shots, last }) => {
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

// ── Data overlays (exact numbers) ────────────────────────────────────────────
const WorldPins: React.FC<{ t: number; cu: Ctx["cu"] }> = ({ t, cu }) => {
  const WORLD: MapSpec = { width: 1800, height: 900, bounds: [[-130, -45], [160, 72]], kind: "equalEarth", res: "110m" };
  const proj = useProjection(WORLD);
  const pts: [string, number, number, string, string][] = [
    ["London", -0.13, 51.5, "1", "London"], ["New York", -74, 40.7, "2", "New York"], ["Singapore", 103.8, 1.35, "3", "third-biggest"]];
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <svg width={W} height={H}>
        <g transform="translate(60,120)">
          <Land spec={WORLD} fill={() => C.navy2} stroke="#2E4A70" strokeWidth={1.5} />
          {pts.map(([n, lon, lat, rank, cue], i) => {
            const [x, y] = proj([lon, lat])!;
            const p = pop(t, cu(cue));
            return <Pin key={n} x={x} y={y} p={p} label={`${rank} · ${n}`} labelSide={i === 1 ? "l" : "r"} pulse={p > 0 ? t * 0.8 + i * 0.3 : 0}
              color={i === 2 ? C.gold : C.blue} />;
          })}
        </g>
      </svg>
      <Pos center y={60}><Head t0={cu("third-biggest")} size={90} color={C.gold}>No. 3 in the world</Head>
        <Rise t0={cu("third-biggest") + 0.4}><Big size={36} color={C.paper} weight={700}>currency markets</Big></Rise></Pos>
    </AbsoluteFill>
  );
};

const MalaysiaCrack: React.FC<{ t: number; cu: Ctx["cu"]; a: number }> = ({ t, cu, a }) => {
  const REGION: MapSpec = { width: 1500, height: 960, bounds: [[99.4, 0.6], [105.2, 6.9]] };
  const drift = prog(t, cu("pushed out"), 2.5);
  return (
    <AbsoluteFill style={{ background: "#9CC3EE" }}>
      <svg width={W} height={H}>
        <g transform="translate(420,60)">
          <Land spec={REGION} only={["Malaysia", "Indonesia", "Thailand"]} fill={(n) => (n === "Malaysia" ? "#7DBF7A" : "#B9D9A6")} strokeWidth={4} draw={prog(t, a, 1.5)} />
          <g transform={`translate(${70 * drift},${110 * drift}) rotate(${8 * drift} 1050 900)`}>
            <Land spec={{ ...REGION, res: "10m" }} only={["Singapore"]} fill={() => C.gold} strokeWidth={4} />
          </g>
        </g>
        <text x={760} y={500} fontFamily="Inter" fontWeight={900} fontSize={60} fill={C.navy} opacity={prog(t, a + 1, 0.6)}>MALAYSIA</text>
      </svg>
      <Pos x={90} y={80}><Chip t0={a + 0.3} size={86}>9 August 1965</Chip><Chip t0={cu("pushed out")} size={50} gold>pushed out, not fought for</Chip></Pos>
    </AbsoluteFill>
  );
};

const DayBand: React.FC<{ t: number; cu: Ctx["cu"]; a: number; b: number }> = ({ t, cu, a, b }) => {
  const WORLD: MapSpec = { width: 1800, height: 860, bounds: [[-150, -50], [170, 72]], kind: "equalEarth", res: "110m" };
  const proj = useProjection(WORLD);
  const sweep = interpolate(t, [a, b], [-40, 120], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const [bx] = proj([sweep, 0])!;
  const mk: [string, number, number, number][] = [["San Francisco", -122.4, 37.8, a], ["Zurich", 8.5, 47.4, cu("Europe hasn't opened")],
    ["Singapore", 103.8, 1.35, cu("Put a market in Singapore")]];
  return (
    <AbsoluteFill style={{ background: C.navy }}>
      <svg width={W} height={H}>
        <g transform="translate(60,150)">
          <Land spec={WORLD} fill={() => C.navy2} stroke="#2E4A70" strokeWidth={1.5} />
          <rect x={bx - 260} y={-40} width={520} height={940} fill={C.paper} opacity={0.1} />
          {mk.map(([n, lon, lat, t0], i) => {
            const [x, y] = proj([lon, lat])!;
            const on = i === 2 ? prog(t, t0, 0.4) : 0;
            const off = i === 0 ? prog(t, cu("close for the day"), 0.4) : 0;
            const color = i === 2 ? (on > 0.5 ? C.gold : C.grey) : i === 0 ? (off > 0.5 ? C.grey : C.blue) : C.grey;
            const state = i === 0 ? (off > 0.5 ? "closed" : "open") : i === 1 ? "not open yet" : on > 0.5 ? "OPEN" : "";
            return (
              <g key={n}>
                <Pin x={x} y={y} p={pop(t, t0)} color={color} label={n} pulse={i === 2 && on > 0.5 ? t : 0} size={i === 2 ? 1.3 : 1} />
                <text x={x + 24} y={y + 50} fontFamily="Inter" fontWeight={800} fontSize={30} fill={C.paper} opacity={pop(t, t0) > 0 ? 0.9 : 0}>{state}</text>
              </g>
            );
          })}
        </g>
      </svg>
      <Pos center y={50}><Head t0={cu("nowhere to trade")} size={64}>A gap in the trading day</Head></Pos>
    </AbsoluteFill>
  );
};

const BandChart: React.FC<{ t: number; cu: Ctx["cu"]; a: number }> = ({ t, cu, a }) => {
  const x0 = 120, x1 = 1280, yMid = 520;
  const draw = prog(t, a, 6, (x) => x);
  const up: string[] = [], lo: string[] = [], pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const k = i / 100, x = x0 + (x1 - x0) * k, c = yMid - 200 * k;
    up.push(`${x},${c - 60}`); lo.push(`${x},${c + 60}`);
    if (k <= draw) pts.push(`${x},${c + 42 * Math.sin(k * 23) * Math.cos(k * 7)}`);
  }
  return (
    <Card t0={a} width={1460}>
      <svg width={1300} height={640}>
        <line x1={x0} y1={620} x2={x1} y2={620} stroke={C.navy} strokeWidth={6} />
        <line x1={x0} y1={620} x2={x0} y2={60} stroke={C.navy} strokeWidth={6} />
        <path d={`M${up.join(" L")} L${lo.reverse().join(" L")} Z`} fill={C.gold} opacity={0.3 * prog(t, cu("inside a band"), 0.6)} stroke={C.gold} strokeWidth={4} />
        {pts.length > 1 ? <path d={`M${pts.join(" L")}`} fill="none" stroke={C.blue} strokeWidth={9} strokeLinejoin="round" /> : null}
        <text x={x0 + 20} y={80} fontFamily="Inter" fontWeight={800} fontSize={30} fill={C.navy}>S$ vs a basket of currencies</text>
        <text x={x1} y={606} textAnchor="end" fontFamily="Inter" fontWeight={700} fontSize={28} fill={C.navy}>time →</text>
      </svg>
      <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
        {[["Basket", "a basket"], ["Band", "inside a band"], ["Crawl", "slowly crawl"]].map(([l, c], i) => (
          <Rise key={l} t0={cu(c)}><Big size={70} color={i === 1 ? C.gold : C.navy}>{l}{i < 2 ? " ·" : ""}</Big></Rise>
        ))}
      </div>
    </Card>
  );
};

const AsiaCurrencies: React.FC<{ t: number; cu: Ctx["cu"] }> = ({ t, cu }) => {
  const ASIA: MapSpec = { width: 1500, height: 900, bounds: [[94, -9], [132, 40]] };
  const proj = useProjection(ASIA);
  const cur: [string, number, number][] = [["baht", 100.5, 14.5], ["rupiah", 110, -6.5], ["won", 127.5, 36.5]];
  const t0 = cu("Currencies across the region");
  return (
    <AbsoluteFill style={{ background: "#9CC3EE" }}>
      <svg width={W} height={H}>
        <g transform="translate(380,110)">
          <Land spec={ASIA} fill={(n) => (["Thailand", "Indonesia", "South Korea", "Malaysia", "Philippines"].includes(n) ? "#F2B8B5" : n === "Singapore" ? C.gold : "#B9D9A6")} strokeWidth={2.5} />
          {cur.map(([c, lon, lat], i) => {
            const [x, y] = proj([lon, lat])!;
            const p = prog(t, t0 + i * 0.4, 0.5), fall = prog(t, t0 + i * 0.4 + 0.4, 1.4, (z) => z * z);
            return (
              <g key={c} transform={`translate(${x},${y + 50 * fall})`} opacity={p}>
                <rect x={-120} y={-46} width={240} height={84} rx={14} fill={C.paper} stroke={C.red} strokeWidth={6} />
                <text y={16} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={50} fill={C.red}>{c} ↓</text>
              </g>
            );
          })}
        </g>
      </svg>
      <Pos x={80} y={70}><Chip t0={t0 - 0.5} size={70}>1997–98</Chip><Chip t0={t0} size={44}>Asian Financial Crisis</Chip></Pos>
    </AbsoluteFill>
  );
};

const AfricaPins: React.FC<{ t: number; cu: Ctx["cu"] }> = ({ t, cu }) => {
  const AF: MapSpec = { width: 1920, height: 1080, bounds: [[-30, -36], [75, 40]], res: "50m" };
  const proj = useProjection(AF);
  const pins: [string, number, number][] = [["Kigali", 30.06, -1.95], ["Nairobi", 36.82, -1.29], ["Lagos", 3.38, 6.52], ["Dubai", 55.27, 25.2]];
  return (
    <AbsoluteFill style={{ background: "#9CC3EE" }}>
      <svg width={W} height={H}>
        <Land spec={AF} fill={(n) => (["Rwanda", "Kenya", "Nigeria", "United Arab Emirates"].includes(n) ? C.gold : "#B9D9A6")} strokeWidth={2} />
        {pins.map(([n, lon, lat], i) => {
          const [x, y] = proj([lon, lat])!;
          const p = pop(t, cu(n) - 0.1);
          return <Pin key={n} x={x} y={y} p={p} label={n} labelSide={i === 0 ? "l" : "r"} pulse={p > 0 ? t * 0.9 + i * 0.25 : 0} color={i === 0 ? C.gold : C.blue} />;
        })}
      </svg>
      <Pos x={80} y={90}><Chip t0={cu("Kigali, Nairobi")} size={60}>Everyone wants a money capital</Chip></Pos>
    </AbsoluteFill>
  );
};

// ── Sections ─────────────────────────────────────────────────────────────────
export const V01: React.FC = () => (
  <Section id="s01_hook" shots={[
    { at: null, img: "s01_night_bay", move: "in", dim: 0.3, render: ({ t, cu }) => (
      <Pos center y={140}>
        <Big size={150} color={C.gold} style={{ fontVariantNumeric: "tabular-nums", textShadow: "0 6px 0 #0B1626, 0 0 40px #0B1626" }}>
          ${fmt(countUp(t, cu("one and a half trillion") - 0.2, 3.2, 0, 1485000000000))}</Big>
        <Head t0={cu("one and a half trillion") + 2.2} size={64}>every day</Head>
      </Pos>) },
    { at: "That's not a typo", img: "s01_trading_room", move: "left", dim: 0.5, render: ({ t, cu }) => (
      <Pos center y={330}><Big size={240} color={C.paper} style={{ transform: `scale(${0.9 + 0.1 * pop(t, cu("That's not a typo") + 0.8)})`,
        textShadow: "0 8px 0 #0B1626" }}>TRILLION</Big><Chip t0={cu("with a T")} size={60} gold>with a T · every day</Chip></Pos>) },
    { at: "On an island", img: "s01_island_aerial", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("drive across")} size={64}>under an hour, coast to coast</Chip></Pos>) },
    { at: "Most people will tell", img: "s01_port", move: "right", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("Ships")} size={64}>Ships. Containers. Location.</Chip></Pos>) },
    { at: "But that's not why", img: "s01_private_bank", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}>{["Jakarta", "Beijing", "Mumbai"].map((c) => <Chip key={c} t0={cu(c) - 0.1} size={56}>from {c}</Chip>)}</Pos>) },
    { at: "It's not why Singapore", render: ({ t, cu }) => <WorldPins t={t} cu={cu} /> },
    { at: "The real story", img: "s01_banker_office", move: "in", render: ({ cu }) => (
      <Pos x={90} y={90}><Chip t0={cu("a banker")} size={62}>a banker</Chip><Chip t0={cu("a globe")} size={62}>a globe</Chip>
        <Chip t0={cu("a gap")} size={62} gold>a gap in the world's clock</Chip></Pos>) },
  ]} />
);

export const V02: React.FC = () => (
  <Section id="s02_independence" shots={[
    { at: null, render: ({ t, cu, a }) => <MalaysiaCrack t={t} cu={cu} a={a} /> },
    { at: "Think about the position", img: "s02_empty_island", move: "in", render: ({ cu }) => (
      <Pos x={90} y={90}><Chip t0={cu("No farmland")} size={70}>No farmland.</Chip><Chip t0={cu("No oil")} size={70}>No oil.</Chip>
        <Chip t0={cu("No minerals")} size={70}>No minerals.</Chip></Pos>) },
    { at: "It even had to buy", img: "s02_causeway_pipe", move: "left", render: ({ cu }) => (
      <Pos x={90} y={90}><Chip t0={cu("water")} size={62}>even the water came from the neighbour</Chip></Pos>) },
    { at: "A small population", img: "s02_harbour_1960s", move: "right", render: ({ cu }) => (
      <Pos x={90} y={90}><Chip t0={cu("A small population")} size={58}>a small population, a harbour,</Chip>
        <Chip t0={cu("a lot of uncertainty")} size={58} gold>a lot of uncertainty</Chip></Pos>) },
    { at: "So ask yourself", img: "s02_old_river", move: "in", dim: 0.55, render: ({ cu }) => (
      <Pos x={140} y={260}><Head t0={cu("if you were handed")} size={62} color={C.blueSoft}>If you were handed this country…</Head>
        <Head t0={cu("what would you sell")} size={140}>what would<br />you sell?</Head></Pos>) },
    { at: "Singapore's leaders had", img: "s02_sunrise_harbour", move: "up", dim: 0.15, render: ({ t, cu }) => {
      const p = prog(t, cu("trust"), 1.4);
      return (<>
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: p, transform: `translateY(${(1 - p) * 120}px)` }}>
          <Big size={230} color={C.gold} style={{ letterSpacing: 14, textShadow: "0 8px 0 #13233A, 0 0 60px rgba(245,166,35,0.9)" }}>TRUST</Big>
        </AbsoluteFill>
        <Pos center bottom={90}><Chip t0={cu("unlike oil")} size={62}>Money doesn't need land.</Chip></Pos></>);
    } },
  ]} />
);

export const V03: React.FC = () => (
  <Section id="s03_clock" shots={[
    { at: null, img: "s03_two_men_globe", move: "in", render: ({ cu, a }) => (<>
      <Pos right={90} y={80}><Chip t0={a + 0.4} size={56} gold>late 1960s</Chip></Pos>
      <NameChip t0={cu("Albert Winsemius")} name="Albert Winsemius" role="Dutch economist, adviser to Singapore" x={90} y={760} />
      <NameChip t0={cu("van Oenen")} name="J. D. van Oenen" role="Bank of America, Singapore branch" x={1090} y={760} /></>) },
    { at: "made his point with a globe", img: "s03_globe_closeup", move: "in" },
    { at: "When markets in San Francisco", render: ({ t, cu, a, b }) => <DayBand t={t} cu={cu} a={a} b={b} /> },
    { at: "The sun never sets", img: "s03_earth_day_night", move: "in", render: ({ cu }) => (
      <Pos center bottom={90}><Chip t0={cu("The sun never sets") + 0.2} size={62} gold>The sun never sets on the trading day</Chip></Pos>) },
    { at: "The idea went up", img: "s03_government", move: "up", render: ({ cu }) => (<>
      <NameChip t0={cu("Hon Sui Sen")} name="Hon Sui Sen" role="Finance Minister" x={90} y={90} />
      <NameChip t0={cu("Lee Kuan Yew")} name="Lee Kuan Yew" role="Prime Minister" x={90} y={250} /></>) },
    { at: "launched what became", img: "s03_bank_hall_1968", move: "in", dim: 0.35, render: ({ cu }) => (
      <Pos center y={300}><Head t0={cu("launched what became")} size={220} color={C.gold}>1968</Head><Head t0={cu("Asian Dollar Market")} size={96}>Asian Dollar Market</Head></Pos>) },
    { at: "Here's how it worked", img: "s03_dollar_vault", move: "in", render: ({ cu }) => (<>
      <Pos x={90} y={80}><Chip t0={cu("Asian Currency Unit")} size={60}>Asian Currency Unit</Chip>
        <Chip t0={cu("mostly US dollars")} size={44}>foreign-currency deposits + loans</Chip>
        <Chip t0={cu("kept separate")} size={44}>kept apart from the local economy</Chip></Pos>
      <Stamp t0={cu("concessionary")} color={C.gold} rot={-6} size={120} style={{ right: 140, bottom: 160 }}>10% tax</Stamp></>) },
    { at: "In plain words", img: "s03_welcome_ships", move: "right", dim: 0.35, render: ({ cu }) => (
      <Pos x={140} y={240}>{[["Bring us your dollars", "bring us"], ["We'll keep it simple", "keep it simple"], ["We'll keep the tax low", "keep the tax low"]].map(([l, c], i) =>
        <Head key={l} t0={cu(c)} size={92} color={i === 2 ? C.gold : C.paper}>{l}</Head>)}</Pos>) },
    { at: "At the same time", img: "s03_wall_falling", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("removed exchange controls")} size={60}>Exchange controls: coming down</Chip>
        <Chip t0={cu("Most were building walls")} size={46} gold>most new countries were building walls</Chip></Pos>) },
  ]} />
);

export const V04: React.FC = () => (
  <Section id="s04_referee" shots={[
    { at: null, img: "s04_central_bank", move: "up", render: ({ cu }) => (<>
      <Pos x={90} y={80}><Chip t0={cu("It needs a referee")} size={62}>It needs a referee</Chip></Pos>
      <Stamp t0={cu("Singapore created the Monetary")} color={C.navy} rot={-7} size={110} style={{ right: 160, top: 380 }}>MAS 1971</Stamp>
      <Pos center bottom={90}><Chip t0={cu("central bank and the financial regulator")} size={52} gold>central bank + regulator, in one</Chip></Pos></>) },
    { at: "Then, in 1981", img: "s04_economists_1980s", move: "left", render: ({ cu }) => (<>
      <Pos x={90} y={80}><Chip t0={cu("Then, in 1981") + 0.2} size={56}>1981: steer the currency, not the interest rate</Chip></Pos>
      <NameChip t0={cu("Goh Keng Swee")} name="Goh Keng Swee" role="MAS chairman" x={90} y={800} /></>) },
    { at: "It steers the Singapore dollar", img: "s04_economists_1980s", move: "in", dim: 0.55, render: ({ t, cu, a }) => <BandChart t={t} cu={cu} a={a} /> },
    { at: "Why does that matter", img: "s04_storm_island", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("your biggest fear")} size={56}>the investor's biggest fear:</Chip>
        <Chip t0={cu("suddenly collapses")} size={56} gold>the currency collapses</Chip></Pos>) },
    { at: "Singapore made its currency boring", img: "s04_calm_lake", move: "out", render: ({ cu }) => (
      <Pos center y={120}><Head t0={cu("boring is beautiful")} size={120} color={C.gold}>Boring is beautiful</Head></Pos>) },
    { at: "Around the same time", img: "s04_twin_vaults", move: "in", render: ({ cu }) => (<>
      <div style={{ position: "absolute", left: 300, top: 820 }}><Chip t0={cu("Temasek")} size={60}>Temasek · 1974</Chip></div>
      <div style={{ position: "absolute", left: 1150, top: 820 }}><Chip t0={cu("GIC")} size={60}>GIC · 1981</Chip></div>
      <Pos center y={70}><Chip t0={cu("serious investor")} size={50} gold>not just a host: an investor</Chip></Pos></>) },
    { at: "Step one", img: "s04_investors_arrive", move: "right", dim: 0.45, render: ({ cu }) => (
      <Pos x={160} y={280}><Rise t0={cu("Step one")}><Big size={44} color={C.blueSoft} weight={800}>STEP ONE</Big></Rise>
        <Head t0={cu("Step one")} size={100}>Invite the money.</Head>
        <Rise t0={cu("Step two")}><Big size={44} color={C.blueSoft} weight={800} style={{ marginTop: 30 }}>STEP TWO</Big></Rise>
        <Head t0={cu("Step two")} size={100} color={C.gold}>Prove you won't lose it.</Head></Pos>) },
  ]} />
);

export const V05: React.FC = () => (
  <Section id="s05_barings" shots={[
    { at: null, img: "s05_trading_pit", move: "in", render: ({ cu, a }) => (<>
      <Pos x={90} y={80}><Chip t0={a + 0.3} size={62}>1992 · Singapore</Chip></Pos>
      <NameChip t0={cu("Nick Leeson")} name="Nick Leeson" role="trader, Barings futures office" x={90} y={790} /></>) },
    { at: "Barings was Britain's", img: "s05_london_bank", move: "up", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("Barings was Britain's")} size={56}>Barings: Britain's oldest merchant bank</Chip></Pos>) },
    { at: "Leeson was trading futures", img: "s05_drawer_night", move: "in", render: ({ cu }) => (<>
      <Pos x={90} y={80}><Chip t0={cu("futures on Japan's")} size={52}>futures on Japan's stock market</Chip></Pos>
      <Stamp t0={cu("an error account")} color={C.red} rot={-5} size={80} style={{ right: 160, top: 330 }}>ERROR ACCOUNT</Stamp>
      <Pos right={160} bottom={160}><Chip t0={cu("doubled down")} size={70} gold>doubled down ×2</Chip></Pos></>) },
    { at: "On the 17th of January", img: "s05_kobe_quake", move: "left", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("On the 17th of January") + 0.2} size={58}>17 January 1995 · Kobe earthquake</Chip></Pos>) },
    { at: "The Japanese market fell", img: "s05_red_market", move: "in" },
    { at: "The final bill", img: "s05_empty_office", move: "in", dim: 0.6, render: ({ t, cu }) => (<>
      <Pos center y={170}>
        <Big size={170} color={C.red} style={{ fontVariantNumeric: "tabular-nums", textShadow: "0 6px 0 #0B1626" }}>£{fmt(countUp(t, cu("The final bill") + 0.1, 2.4, 0, 827000000))}</Big>
        <Head t0={cu("about 1.4 billion")} size={64}>(~US$1.4B)</Head>
        <Head t0={cu("Around twice")} size={44}>about twice the trading capital Barings had</Head></Pos>
      <Stamp t0={cu("declared insolvent")} size={120} style={{ left: 560, top: 680 }}>INSOLVENT</Stamp>
      <Pos center bottom={60}><Chip t0={cu("declared insolvent") + 0.4} size={44}>26 Feb 1995</Chip></Pos></>) },
    { at: "Leeson was sentenced", img: "s05_prison", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("Leeson was sentenced") + 0.3} size={60}>6½ years, Changi Prison</Chip></Pos>) },
    { at: "One guy", img: "s05_trading_pit", move: "out", dim: 0.72, render: ({ cu }) => (
      <Pos x={160} y={300}>{[["One guy.", "One guy"], ["One office.", "One office"], ["A centuries-old bank, gone.", "A centuries-old bank"]].map(([l, c], i) =>
        <Head key={l} t0={cu(c)} size={96} color={i === 2 ? C.red : C.paper}>{l}</Head>)}</Pos>) },
    { at: "You'd think", img: "s05_inspectors", move: "in", render: ({ cu }) => (
      <Pos center y={70}><Chip t0={cu("rules only work")} size={58}>Rules only work if someone is checking.</Chip></Pos>) },
  ]} />
);

export const V06: React.FC = () => (
  <Section id="s06_crisis" shots={[
    { at: null, img: "s06_bank_queue", move: "in", render: ({ a }) => (
      <Pos x={90} y={80}><Chip t0={a + 0.3} size={66}>1997–98</Chip><Chip t0={a + 0.8} size={46} gold>Asian Financial Crisis</Chip></Pos>) },
    { at: "Currencies across the region", render: ({ t, cu }) => <AsiaCurrencies t={t} cu={cu} /> },
    { at: "Many governments responded", img: "s06_gates_closed", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("closing up")} size={56}>closing up: more controls, more protection</Chip></Pos>) },
    { at: "Singapore did the opposite", img: "s06_banks_open", move: "right", dim: 0.25, render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("turn adversity")} size={44} gold>"turn adversity into opportunity"</Chip>
        {[["retail banking → open to foreign banks", "opened retail banking"], ["insurers → foreign owners allowed", "lifted limits"], ["fixed brokerage fees → scrapped", "scrapped fixed"]].map(([l, c]) =>
          <Chip key={l} t0={cu(c)} size={48}>✓ {l}</Chip>)}</Pos>) },
    { at: "And they merged", img: "s06_exchange_hall", move: "in", render: ({ cu }) => (<>
      <Pos x={90} y={80}><Chip t0={cu("And they merged")} size={52}>stock exchange + futures exchange</Chip></Pos>
      <Stamp t0={cu("SGX")} color={C.navy} rot={0} size={140} style={{ left: 760, top: 420 }}>SGX</Stamp></>) },
    { at: "When your neighbours lock", img: "s06_money_wind", move: "left", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("When your neighbours lock")} size={58}>They lock their doors. You open yours.</Chip>
        <Chip t0={cu("Guess where")} size={50} gold>guess where the money goes</Chip></Pos>) },
    { at: "But, and this is the clever bit", img: "s06_shield_city", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("more capital than international rules")} size={46}>capital above international rules</Chip>
        <Chip t0={cu("Liquidity rules came in")} size={46}>liquidity rules, early</Chip>
        <Chip t0={cu("Open, but careful")} size={84} gold>Open, but careful</Chip></Pos>) },
  ]} />
);

export const V07: React.FC = () => (
  <Section id="s07_numbers" shots={[
    { at: null, img: "s07_skyline_day", move: "in", dim: 0.25, render: ({ a }) => (
      <Pos center y={330}><Head t0={a + 0.2} size={110}>So where did all that</Head><Head t0={a + 0.7} size={110} color={C.gold}>get Singapore?</Head></Pos>) },
    { at: "Number one", img: "s07_fx_screens", move: "in", dim: 0.5, render: ({ t, cu, a }) => (
      <Card t0={a + 0.2}>
        <Big size={40} weight={800} color={C.blue}>1 · FOREIGN EXCHANGE, APRIL 2025</Big>
        <Big size={170} style={{ fontVariantNumeric: "tabular-nums", margin: "10px 0" }}>${countUp(t, a + 0.5, 2.6, 0, 1.485).toFixed(3)}T</Big>
        <Big size={56} weight={800}>a day</Big>
        <div style={{ display: "flex", gap: 60, justifyContent: "center", marginTop: 36 }}>
          <Rise t0={cu("up 60%")}><Big size={50} color={C.green}>+60% in 3 years</Big></Rise>
          <Rise t0={cu("about 12%")}><Big size={50} color={C.navy2}>~12% of the planet's FX</Big></Rise></div>
        <Rise t0={cu("Only the UK and the US")}><Big size={40} weight={700} color={C.navy2} style={{ marginTop: 24 }}>only the UK and the US are bigger</Big></Rise>
      </Card>) },
    { at: "Number two", img: "s07_wealth_office", move: "left", dim: 0.5, render: ({ t, cu, a }) => {
      const p = prog(t, cu("77%"), 1.6), ang = 2 * Math.PI * 0.77 * p, r = 200, cx = 260, cy = 240;
      return (
        <Card t0={a + 0.2} width={1400}>
          <div style={{ display: "flex", alignItems: "center", gap: 60, textAlign: "left" }}>
            <div style={{ flex: 1 }}>
              <Big size={40} weight={800} color={C.blue}>2 · ASSETS MANAGED, 2024</Big>
              <Rise t0={cu("6 trillion")}><Big size={120} style={{ marginTop: 10 }}>S$6 trillion</Big></Rise>
              <Rise t0={cu("roughly 4.7 trillion")}><Big size={60} weight={800} color={C.navy2}>(~US$4.7T)</Big></Rise>
              <Rise t0={cu("Think about that")}><Big size={50} color={C.gold} style={{ marginTop: 40 }}>Most of the money<br />isn't Singaporean.</Big></Rise>
            </div>
            <svg width={520} height={520} opacity={prog(t, cu("And here's the key detail"), 0.4)}>
              <circle cx={cx} cy={cy} r={r} fill={C.paper2} stroke={C.navy} strokeWidth={8} />
              {p > 0 ? <path d={`M${cx} ${cy} L${cx} ${cy - r} A${r} ${r} 0 ${ang > Math.PI ? 1 : 0} 1 ${cx + r * Math.sin(ang)} ${cy - r * Math.cos(ang)} Z`} fill={C.gold} stroke={C.navy} strokeWidth={8} /> : null}
              <circle cx={cx} cy={cy} r={105} fill={C.paper} stroke={C.navy} strokeWidth={8} />
              <text x={cx} y={cy + 28} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={76} fill={C.navy}>{Math.round(77 * p)}%</text>
              <text x={cx} y={cy + r + 64} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={48} fill={C.navy}>from abroad</text>
            </svg>
          </div>
        </Card>);
    } },
    { at: "Number three", img: "s07_family_villa", move: "right", dim: 0.45, render: ({ t, cu, a }) => {
      const pA = prog(t, cu("1,650"), 0.8), pB = prog(t, cu("about 2,000"), 1.2), k = 0.2, base = 470;
      return (
        <Card t0={a + 0.2} width={1400}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 60, textAlign: "left" }}>
            <div style={{ flex: 1 }}>
              <Big size={40} weight={800} color={C.blue}>3 · SINGLE FAMILY OFFICES</Big>
              <Rise t0={cu("about 2,000")}><Big size={140} style={{ marginTop: 10 }}>~2,000</Big></Rise>
              <Rise t0={cu("Those are private firms")}><Big size={44} weight={700} color={C.navy2}>firms that manage one<br />wealthy family's fortune</Big></Rise>
            </div>
            <svg width={560} height={540}>
              <rect x={60} y={base - 1650 * k * pA} width={190} height={1650 * k * pA} fill={C.blueSoft} stroke={C.navy} strokeWidth={6} />
              <rect x={320} y={base - 2000 * k * pB} width={190} height={2000 * k * pB} fill={C.gold} stroke={C.navy} strokeWidth={6} />
              <line x1={20} x2={550} y1={base} y2={base} stroke={C.navy} strokeWidth={6} />
              <text x={155} y={base - 1650 * k * pA - 20} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={48} fill={C.navy} opacity={pA}>1,650</text>
              <text x={415} y={base - 2000 * k * pB - 20} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={48} fill={C.navy} opacity={pB}>~2,000</text>
              <text x={155} y={base + 50} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={30} fill={C.navy} opacity={pA}>months earlier</text>
              <text x={415} y={base + 50} textAnchor="middle" fontFamily="Inter" fontWeight={700} fontSize={30} fill={C.navy} opacity={pB}>end of 2024</text>
            </svg>
          </div>
        </Card>);
    } },
    { at: "In the Global Financial", img: "s07_four_cities", move: "in", dim: 0.35, render: ({ t, cu, a }) => (<>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        {([["New York", 1, 520, 360, C.blueSoft, "New York"], ["London", 2, 820, 300, C.blueSoft, "London"], ["Hong Kong", 3, 1120, 250, C.blueSoft, "Hong Kong"],
          ["Singapore", 4, 1420, 210, C.gold, "Singapore ranks fourth"]] as [string, number, number, number, string, string][]).map(([n, r, x, h, c, cue]) => {
          const p = Math.min(1, pop(t, cu(cue) + 0.05, 0.5));
          return (
            <g key={n} transform={`translate(${x},1000)`} opacity={p}>
              <rect x={-130} y={-h * p} width={260} height={h * p} fill={c} stroke={C.navy} strokeWidth={7} />
              <text y={-h * p + 90} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={96} fill={C.navy}>{r}</text>
              <rect x={-150} y={14} width={300} height={56} rx={10} fill={C.navy} />
              <text y={56} textAnchor="middle" fontFamily="Inter" fontWeight={900} fontSize={38} fill={C.paper}>{n}</text>
            </g>);
        })}
      </svg>
      <Pos center y={70}><Head t0={cu("Singapore ranks fourth")} size={110}>#4 in the world</Head>
        <Chip t0={a + 0.3} size={36}>Global Financial Centres Index · September 2025</Chip>
        <Chip t0={cu("about a point")} size={36} gold>about a point between each of the top four</Chip></Pos></>) },
  ]} />
);

export const V08: React.FC = () => (
  <Section id="s08_scandal" shots={[
    { at: null, img: "s08_shady_alley", move: "in", render: ({ cu }) => (
      <Pos center bottom={90}><Chip t0={cu("some of that money will be dirty")} size={60}>some of that money will be dirty</Chip></Pos>) },
    { at: "In August 2023", img: "s08_raid_night", move: "left", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("In August 2023") + 0.2} size={62}>August 2023 · police raids</Chip></Pos>) },
    { at: "The money-laundering case", img: "s08_evidence", move: "in", dim: 0.25, render: ({ cu }) => (<>
      <Stamp t0={cu("3 billion")} color={C.red} rot={-4} size={150} style={{ left: 420, top: 120 }}>S$3 BILLION</Stamp>
      <Pos center bottom={110}><Chip t0={cu("luxury homes")} size={46}>luxury homes · cars · gold · cash</Chip>
        <Rise t0={cu("Ten foreign nationals")}><div style={{ display: "inline-block", background: C.red, color: C.paper, fontFamily: FONT, fontWeight: 900,
          fontSize: 54, padding: "12px 28px", borderRadius: 14 }}>10 convicted · S$2.8B surrendered</div></Rise></Pos></>) },
    { at: "That's the trade-off", img: "s01_private_bank", move: "out", dim: 0.3, render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("That's the trade-off")} size={60}>The same open door lets in…</Chip>
        <Chip t0={cu("honest investors")} size={52} gold>honest investors</Chip>
        <Rise t0={cu("people hiding money")}><div style={{ display: "inline-block", background: C.red, color: C.paper, fontFamily: FONT,
          fontWeight: 900, fontSize: 52, padding: "14px 30px", borderRadius: 16 }}>people hiding money</div></Rise></Pos>) },
    { at: "Because being a safe place", img: "s08_cracked_vault", move: "in", render: ({ cu }) => (
      <Pos x={90} y={90}><Head t0={cu("is the product")} size={100}>Safety is</Head><Head t0={cu("is the product") + 0.3} size={100} color={C.gold}>the product.</Head></Pos>) },
  ]} />
);

export const V09: React.FC = () => (
  <Section id="s09_kigali" shots={[
    { at: null, img: "s09_dubai", move: "right", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("Africa and the Gulf")} size={58}>Africa and the Gulf are copying the playbook</Chip></Pos>) },
    { at: "Kigali, Nairobi", render: ({ t, cu }) => <AfricaPins t={t} cu={cu} /> },
    { at: "I'm recording this from Kigali", img: "s09_kigali_hills", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("I'm recording this from Kigali") + 0.2} size={70}>Kigali, Rwanda</Chip>
        <Chip t0={cu("Kigali International Financial Centre")} size={44} gold>Kigali International Financial Centre</Chip></Pos>) },
    { at: "Because look at what", img: "s09_foundations", move: "up", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("It didn't start with skyscrapers")} size={60}>It didn't start with skyscrapers.</Chip></Pos>) },
    { at: "It started with a reason", img: "s09_foundations", move: "in", dim: 0.5, render: ({ t, cu, a }) => (
      <Card t0={a} width={1300}>
        <div style={{ textAlign: "left" }}>
          <Big size={52} color={C.blue} weight={800}>What Singapore actually built</Big>
          <div style={{ height: 10, width: 1100 * prog(t, a + 0.3, 1.0), background: C.gold, borderRadius: 5, margin: "20px 0 40px" }} />
          {[["A reason to come", "a reason for money to come"], ["A trusted referee", "a referee people trusted"], ["A boring currency", "a currency that stayed boring"],
            ["Strict rules", "rules strict enough"]].map(([l, c]) => {
            const p = pop(t, cu(c), 0.4);
            return (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 32, marginBottom: 26, opacity: Math.min(1, p * 2) }}>
                <div style={{ width: 76, height: 76, borderRadius: 14, border: `8px solid ${C.navy}`, background: p > 0.6 ? C.gold : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${Math.max(0.01, p)})` }}><Big size={52}>✓</Big></div>
                <Big size={76}>{l}</Big>
              </div>);
          })}
        </div>
      </Card>) },
    { at: "The lesson isn't", img: "s09_african_market", move: "in", dim: 0.55, render: ({ t, cu }) => (
      <Pos center y={250}>
        <div style={{ position: "relative" }}>
          <Big size={64} color={C.blueSoft}>"cut taxes and build towers"</Big>
          <div style={{ position: "absolute", left: -20, right: -20, top: "50%", height: 10, background: C.gold,
            transform: `scaleX(${prog(t, cu("It's this"), 0.5)})`, transformOrigin: "left" }} />
        </div>
        <Head t0={cu("money goes where")} size={96}>Money goes where it's</Head>
        <Head t0={cu("treated fairly")} size={96} color={C.gold}>treated fairly</Head>
        <div style={{ display: "flex", gap: 30 }}><Chip t0={cu("move freely")} size={44}>moves freely</Chip><Chip t0={cu("won't disappear overnight")} size={44}>won't vanish overnight</Chip></div>
      </Pos>) },
  ]} />
);

export const V10: React.FC = () => (
  <Section id="s10_close" last shots={[
    { at: null, img: "s10_dusk_bay", move: "in", render: ({ cu }) => (
      <Pos x={90} y={80}><Chip t0={cu("The port got it started")} size={52}>The port got it started.</Chip>
        <Chip t0={cu("most trusted place")} size={64} gold>The world's most trusted place to keep money.</Chip></Pos>) },
    { at: "Next time in Money Cities", img: "s10_london", move: "right", dim: 0.15, render: ({ t, cu, a }) => (
      // bottom-right corner kept clear for YouTube end-screen elements
      <Pos x={110} y={100}>
        <Rise t0={a + 0.2}>
          <div style={{ background: C.navy, borderRadius: 30, padding: "36px 56px", width: 820, boxShadow: `16px 16px 0 ${C.gold}` }}>
            <Big size={38} color={C.blueSoft} weight={800}>NEXT IN MONEY CITIES</Big>
            <Big size={150} color={C.gold}>LONDON</Big>
            <Big size={34} color={C.paper} weight={700}>the city that trades more currency than anywhere on Earth</Big>
          </div>
        </Rise>
        <Rise t0={cu("subscribe")}><div style={{ display: "inline-block", marginTop: 30, background: C.gold, color: C.navy, fontFamily: FONT, fontWeight: 900,
          fontSize: 56, padding: "18px 44px", borderRadius: 16, transform: `scale(${1 + 0.04 * Math.sin(t * 5)})` }}>SUBSCRIBE</div></Rise>
        <Rise t0={cu("This video is for education only")}><div style={{ display: "inline-block", marginTop: 160, background: "rgba(19,35,58,0.85)",
          color: C.paper, fontFamily: FONT, fontWeight: 700, fontSize: 30, padding: "8px 18px", borderRadius: 10 }}>For education only. Not financial advice.</div></Rise>
      </Pos>) },
  ]} />
);
