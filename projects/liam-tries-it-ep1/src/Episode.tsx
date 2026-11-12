import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import timeline from "./timeline.json";
import {
  C, TITLE_FONT, FontFaces, Layout, LayoutCtx, useT, FREEZE_AT, prog, pop, squash, win, lerp, rnd, clamp01, easeInOut,
} from "./lib";
import { Liam } from "./Liam";
import { Zebra, Giraffe, Hippo, Mum, Expr, Arms } from "./Friends";
import {
  StandBack, StandFront, LemonJar, CashJar, Note, Coin, Scoreboard, Chalkboard, Caption, Bubble, Subtitle, Tag, Paper,
} from "./Props";

const FPS = timeline.fps;
const LINES = timeline.lines;

// ── Friend placement: (x, y) = centre of feet, h = height of a 420-unit character ──
type Kind = 0 | 1 | 2; // zebra, giraffe, hippo
const Friend: React.FC<{ kind: Kind; x: number; y: number; h: number; flip?: boolean; expr?: Expr; arms?: Arms; t: number; bob?: number; rot?: number; sx?: number; sy?: number }> = ({
  kind, x, y, h, flip, expr = "neutral", arms = "down", t, bob = 0, rot = 0, sx = 1, sy = 1 }) => {
  const H = kind === 1 ? h * 560 / 420 : h;
  const W = H * 300 / (kind === 1 ? 560 : 420);
  const Comp = kind === 0 ? Zebra : kind === 1 ? Giraffe : Hippo;
  return (
    <div style={{ position: "absolute", left: x - W / 2, top: y - H - bob, width: W, height: H,
      transform: `scaleX(${flip ? -1 : 1}) rotate(${rot}deg) scale(${sx}, ${sy})`, transformOrigin: "50% 100%" }}>
      <Comp expr={expr} arms={arms} t={t} />
    </div>
  );
};

/** walk from `from` to `to` between t0 and t1, with a step bob */
const walk = (t: number, t0: number, t1: number, from: number, to: number) => {
  const k = prog(t, t0, t1 - t0, easeInOut);
  const moving = t > t0 && t < t1;
  return { x: lerp(from, to, k), bob: moving ? Math.abs(Math.sin(t * 11)) * 14 : 0, rot: moving ? Math.sin(t * 11) * 3 : 0, k };
};

/** arc flight of a prop from a to b */
const fly = (t: number, t0: number, dur: number, a: [number, number], b: [number, number], arc = 120) => {
  const k = prog(t, t0, dur, easeInOut);
  return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * arc, k, on: t >= t0 && t <= t0 + dur };
};

const Backdrop: React.FC<{ L: Layout; alarm?: number }> = ({ L, alarm = 0 }) => {
  const hz = L.floorY - (L.name === "9x16" ? 260 : 190);
  return (
    <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
      <rect width={L.W} height={hz} fill="#DCE7F7" />
      {[[0.15, 0.12, 1], [0.62, 0.08, 0.8], [0.88, 0.2, 0.9]].map(([fx, fy, s], i) => (
        <g key={i} transform={`translate(${fx * L.W} ${fy * L.H + (L.name === "9x16" ? 380 : 0)}) scale(${s})`}>
          <path d="M0 40 q0 -40 50 -36 q20 -34 66 -14 q44 -6 48 34 q30 6 22 32 h-186 q-22 -6 0 -16 Z" fill={C.paper} stroke={C.ink} strokeWidth={5} />
        </g>
      ))}
      <rect y={hz} width={L.W} height={L.H - hz} fill={C.paper2} />
      <line x1={0} x2={L.W} y1={hz} y2={hz} stroke={C.ink} strokeWidth={5} />
      {Array.from({ length: 7 }).map((_, i) => (
        <ellipse key={i} cx={(i * 337 + 80) % L.W} cy={hz + 4} rx={70} ry={34} fill="#9CC98A" stroke={C.ink} strokeWidth={5} />
      ))}
      <rect y={hz + 4} width={L.W} height={L.H - hz} fill={C.paper2} />
      {alarm > 0 ? <rect width={L.W} height={L.H} fill={C.red} opacity={alarm} /> : null}
    </svg>
  );
};

// ── Scene 1: title card ──────────────────────────────────────────────────────
const Title: React.FC<{ L: Layout; t: number }> = ({ L, t }) => {
  if (t > 4.3) return null;
  const portrait = L.name === "9x16";
  const p1 = pop(t, 0.3, 0.5), p2 = prog(t, 1.0, 0.5), p3 = pop(t, 1.8, 0.35);
  const [sx, sy] = squash(t, 0.8, 0.12);
  const liamIn = prog(t, 2.3, 0.5);
  const [lsx, lsy] = squash(t, 2.8, 0.1);
  // gold wipe: the band sweeps left→right; the title is clipped to the right of the band's diagonal centre line,
  // so the lemonade stand (rendered underneath) is revealed behind it.
  const wk = prog(t, 3.75, 0.55, easeInOut);
  const slant = Math.tan((20 * Math.PI) / 180) * L.H; // horizontal offset across the frame height
  const cx = lerp(-900, L.W + 900 + slant, wk);
  const clip = t > 3.75 ? `polygon(${cx}px 0px, ${L.W + 2000}px 0px, ${L.W + 2000}px ${L.H}px, ${cx - slant}px ${L.H}px)` : undefined;
  return (
    <>
    <AbsoluteFill style={{ background: C.navy, alignItems: "center", justifyContent: "center", overflow: "hidden", clipPath: clip }}>
      {/* drifting lemons and coins */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = rnd(i) * L.W, y = ((rnd(i + 40) * L.H + t * (30 + 30 * rnd(i + 9))) % (L.H + 120)) - 60;
        return i % 2 ? <Coin key={i} x={x} y={y} r={18} spin={t * 2 + i} />
          : <svg key={i} width={60} height={44} style={{ position: "absolute", left: x, top: y, opacity: 0.35 }}><ellipse cx={30} cy={22} rx={26} ry={18} fill={C.lemon} stroke={C.ink} strokeWidth={4} /></svg>;
      })}
      <div style={{ textAlign: "center", marginTop: portrait ? -260 : -40 }}>
        <div style={{ fontFamily: TITLE_FONT, fontSize: portrait ? 168 : 190, lineHeight: 0.95, color: C.gold, letterSpacing: 2,
          transform: `scale(${Math.min(1.08, p1) * sx}, ${Math.min(1.08, p1) * sy})`, textShadow: `0 10px 0 ${C.ink}` }}>
          {portrait ? <>LIAM<br />TRIES IT</> : "LIAM TRIES IT"}
        </div>
        <div style={{ fontFamily: TITLE_FONT, fontSize: portrait ? 76 : 84, color: C.paper, marginTop: 26, opacity: p2, transform: `translateY(${(1 - p2) * 40}px)` }}>
          The Lemonade Fund
        </div>
        <div style={{ display: "inline-block", marginTop: 40, transform: `rotate(-6deg) scale(${p3 > 0 ? 2.2 - 1.2 * Math.min(1, p3) : 0})`, opacity: Math.min(1, p3 * 2),
          border: `8px solid ${C.red}`, color: C.red, fontFamily: TITLE_FONT, fontSize: portrait ? 44 : 50, padding: "6px 26px", borderRadius: 12, letterSpacing: 3, background: "rgba(247,244,238,0.95)" }}>
          DON'T TRY THIS AT HOME
        </div>
      </div>
      {/* Liam peeks in */}
      <Liam x={portrait ? 800 : 1640} y={L.H + 40 - (portrait ? 140 : 0)} h={portrait ? 520 : 560} t={t} bounce={liamIn * (portrait ? 330 : 330) - 330 + Math.abs(Math.sin(t * 5)) * 8}
        tilt={-8 + 4 * Math.sin(t * 3)} sx={lsx} sy={lsy} />
    </AbsoluteFill>
    {/* the gold band itself, straddling the clip line */}
    {t > 3.75 && wk < 1 ? (
      <svg width={L.W} height={L.H} style={{ position: "absolute", left: 0, top: 0 }}>
        <polygon points={`${cx - 220},0 ${cx + 60},0 ${cx + 60 - slant},${L.H} ${cx - 220 - slant},${L.H}`} fill={C.gold} />
        <polygon points={`${cx + 60},0 ${cx + 110},0 ${cx + 110 - slant},${L.H} ${cx + 60 - slant},${L.H}`} fill={C.paper} />
      </svg>
    ) : null}
    </>
  );
};

// ── Scenes 2–5 (+ the wide shot of 6) at the lemonade stand ─────────────────
const Stand: React.FC<{ L: Layout; t: number }> = ({ L, t }) => {
  if (t < 3.9 || t > 35.2) return null;
  const portrait = L.name === "9x16";
  const s = L.stand;
  const fh = 420 * L.friendScale;
  const liamLift = portrait ? 0 : 30;
  const liamY = L.floorY - liamLift;
  const jarY = s.counterTop - 20;
  const lw = L.liam.h * 612 / 987;
  const head: [number, number] = [L.liam.x, liamY - L.liam.h * 0.71];

  // camera
  const punch = [18, 20, 22, 24].reduce((acc, at) => acc + Math.max(0, 1 - Math.abs(t - at - 0.1) / 0.35) * 0.045, 0);
  const camS = L.camScale + punch + (t > 26 && t < 34 ? 0.03 : 0) + 0.02 * prog(t, 10, 7);
  const camShake = t > 26.2 && t < 34 ? Math.sin(t * 43) * 5 : 0;
  const alarm = t > 28.9 && t < 34.4 ? (0.12 + 0.07 * Math.abs(Math.sin(t * 5))) * (1 - prog(t, 34.0, 0.4)) * prog(t, 28.9, 0.3) : 0;

  // ── Liam's transforms ──
  let bounce = 0, tilt = 0, shake = 0, sx = 1, sy = 1;
  const fx: { sweat?: number; bang?: number; sparkle?: number } = {};
  const enter = prog(t, 4.0, 0.55);
  bounce = (enter - 1) * L.liam.h * 0.6;
  [sx, sy] = squash(t, 4.55, 0.12);
  if (t > 4.8 && t < 9.4) { bounce += Math.abs(Math.sin(t * 7)) * 8; tilt = 2.5 * Math.sin(t * 3.2); }
  if (t > 8.2 && t < 9.6) fx.sparkle = Math.min(1, pop(t, 8.2, 0.4)) * (1 - prog(t, 9.3, 0.3));
  if (t > 12.6 && t < 13.5) tilt = 7 * Math.sin(prog(t, 12.6, 0.9) * Math.PI); // reach into the jar, then to the zebra
  if (t > 14.0 && t < 16.0) { tilt = 9 * prog(t, 14.0, 0.25) * (1 - prog(t, 15.6, 0.4)); fx.sparkle = Math.min(1, pop(t, 14.1, 0.4)) * (1 - prog(t, 15.7, 0.3)); }
  if (t > 17 && t < 26) {
    const speed = 5 + 9 * prog(t, 17, 8);
    bounce += Math.abs(Math.sin(t * speed)) * 10;
    shake = 4 * prog(t, 21, 3);
    fx.sweat = prog(t, 20.5, 2);
  }
  if (t >= 26 && t < 34) { shake = 7; fx.sweat = 1; tilt = t > 28 && t < 28.9 ? -6 : 0; fx.bang = t > 28.9 ? Math.min(1.1, pop(t, 28.9, 0.35)) : 0; }
  if (t >= 34) { shake = 0; fx.sweat = 1; fx.bang = Math.min(1.1, pop(t, 34.55, 0.35)); [sx, sy] = squash(t, 34.55, 0.08); }

  // ── friends ──
  const zebraFrom = -fh;
  const z = walk(t, 7.4, 8.6, zebraFrom, L.zebraX);
  const zebraHappy = t > 13.45 && t < 26;
  const zebraArms: Arms = (t > 8.6 && t < 9.1) || (t > 10.6 && t < 13.5) ? "reach" : zebraHappy && t < 15.5 ? "up" : "down";
  const [zsx, zsy] = squash(t, 13.5, 0.14);
  const zJump = zebraHappy && t < 14.3 ? Math.sin(prog(t, 13.45, 0.8) * Math.PI) * 50 : 0;
  const g = walk(t, 10.8, 11.8, L.W + fh, L.giraffeX);
  const giraffeArms: Arms = t > 11.75 && t < 12.2 ? "reach" : "down";

  // money props
  const zebraPaw: [number, number] = [L.zebraX + fh * 0.32, L.floorY - fh * 0.45];
  const giraffePaw: [number, number] = [L.giraffeX - fh * 0.32, L.floorY - fh * 0.62];
  const jarMouth: [number, number] = [L.cashJar.x, jarY - 180];
  const n10a = fly(t, 8.85, 0.45, zebraPaw, jarMouth, 140);
  const n10b = fly(t, 11.85, 0.35, giraffePaw, jarMouth, 140);
  const n2 = fly(t, 12.85, 0.55, jarMouth, zebraPaw, 160);
  let jarFill = t < 9.3 ? 0 : t < 12.05 ? 0.17 : t < 12.9 ? 0.34 : 0.2;
  if (t > 17 && t < 26) jarFill = 0.2 + 0.15 * Math.abs(Math.sin(t * 3)); // money in, money out
  if (t >= 26) jarFill = t < 28.4 ? 0.2 : 0;
  const tip = prog(t, 28.35, 0.45, easeInOut);
  const lift = prog(t, 28.0, 0.35) * 150 * (1 - prog(t, 33.5, 0.4));

  // queue
  const steps: [number, string][] = [[18, "3"], [20, "12"], [22, "47"], [24, "400"]];
  const count = t < 17.5 ? 0 : t < 20 ? 1 : t < 22 ? 8 : 8;
  const farCount = t < 22 ? 0 : t < 24 ? 26 : 80;
  const moneyIn = t < 12.05 ? "$10" : t < 18 ? "$20" : t < 20 ? "$30" : t < 22 ? "$120" : t < 24 ? "$470" : "$4,000";
  const showQueue = t > 17.2 && t < 26.1;
  const showCrowd = t > 26 && t < 34.2;

  // the coin that rolls away on Friday
  const coinFall = fly(t, 28.85, 0.25, [L.cashJar.x, jarY - 150 - 150], [L.cashJar.x - 40, s.counterTop - 22], 0);
  const rollK = prog(t, 29.1, 1.6, (x) => x);
  const counterLeft = s.x - s.w / 2 - 20;
  const coinX = t < 29.1 ? coinFall.x : rollK < 0.5 ? lerp(L.cashJar.x - 40, counterLeft, rollK * 2) : lerp(counterLeft, -80, (rollK - 0.5) * 2);
  const coinY = t < 29.1 ? coinFall.y : rollK < 0.5 ? s.counterTop - 22 : lerp(s.counterTop - 22, L.floorY - 20, Math.min(1, (rollK - 0.5) * 6));

  const doorOpen = prog(t, 34.0, 0.8, easeInOut);
  const mumH = (L.floorY - (s.roofY + 180)) * 0.82;

  return (
    <>
    <AbsoluteFill style={{ transform: `translate(${camShake}px, ${camShake * 0.5 + L.camY}px) scale(${camS})`, transformOrigin: `${s.x}px ${s.counterTop}px` }}>
      <Backdrop L={L} alarm={alarm} />
      {/* far crowd strip (hundreds of investors) */}
      {showQueue && farCount ? Array.from({ length: farCount }).map((_, i) => {
        const appear = prog(t, (i < 26 ? 22 : 24) + (i % 26) * 0.03, 0.25);
        const sideRight = portrait && i % 2 === 1;
        const x = portrait ? (sideRight ? 1000 - (i * 23) % 200 : 60 + (i * 23) % 200) : (i * 17) % (s.wallX0 - 60);
        const y = (portrait ? 990 : L.floorY - 200) + (Math.floor(i / 26) % 3) * 16 + rnd(i) * 10;
        return <div key={i} style={{ position: "absolute", left: x, top: y - 30 * appear, width: 30, height: 30, borderRadius: 15, opacity: appear,
          background: [C.paper, "#F2C14E", "#A9A0C8"][i % 3], border: `4px solid ${C.ink}` }} />;
      }) : null}
      {/* the queue */}
      {showQueue ? L.queue.slice(1, 1 + count).map(([qx, qy, qs], i) => {
        const at = i === 0 ? 17.5 : 20 + i * 0.12;
        const p = prog(t, at, 0.4);
        const kind = ([2, 0, 1] as Kind[])[i % 3];
        return <Friend key={i} kind={kind} x={qx} y={qy + (1 - p) * 60} h={fh * qs} t={t} bob={Math.abs(Math.sin(t * 6 + i)) * 6} flip={qx > s.x} />;
      }) : null}
      <StandBack L={L} doorOpen={doorOpen}
        interior={t > 33.9 ? <div style={{ position: "absolute", left: "50%", bottom: 0, width: mumH * 320 / 460, height: mumH, transform: "translateX(-50%)" }}><Mum /></div> : null} />
      {/* Liam behind the counter */}
      {/* clipped at the floor line so he can rise from behind the counter without legs showing below it */}
      <div style={{ position: "absolute", left: 0, top: 0, width: L.W, height: L.floorY, overflow: "hidden" }}>
        <Liam x={L.liam.x} y={liamY} h={L.liam.h} t={t} bounce={bounce} tilt={tilt} shake={shake} sx={sx} sy={sy} fx={fx} />
      </div>
      {/* juggling coins (montage) */}
      {t > 17.3 && t < 26 ? [0, 1, 2].map((i) => {
        const speed = 0.9 + 1.6 * prog(t, 17.3, 8.5);
        const k = ((t - 17.3) * speed + i / 3) % 1;
        const span = lw * 0.55;
        return <Coin key={i} x={head[0] - span + 2 * span * k} y={head[1] - L.liam.h * 0.22 - Math.sin(k * Math.PI) * L.liam.h * 0.28} r={portrait ? 20 : 24} spin={t * 9 + i} />;
      }) : null}
      <StandFront L={L} />
      <LemonJar x={L.lemonJar.x} y={jarY + 20} s={portrait ? 0.85 : 1} highlight={t > 24.2 && t < 26 ? prog(t, 24.2, 0.3) * (1 + (t - 24.2)) : 0} />
      {t > 24.2 && t < 26 ? (
        <div style={{ position: "absolute", left: L.lemonJar.x - 130 + (portrait ? 40 : 0), top: s.counterTop + (portrait ? 6 : 30), width: 260, textAlign: "center", fontFamily: TITLE_FONT,
          fontSize: portrait ? 34 : 40, color: C.navy, transform: `scale(${Math.min(1.05, pop(t, 24.3, 0.35))})` }}>
          <span style={{ background: C.gold, border: `4px solid ${C.ink}`, borderRadius: 10, padding: "4px 12px" }}>STILL 3 LEMONS</span>
        </div>
      ) : null}
      <CashJar x={L.cashJar.x + (portrait ? 110 : 130) * prog(t, 33.3, 0.5)} y={jarY + 20} s={portrait ? 0.85 : 1} fill={jarFill} tip={tip} lift={lift} />
      {/* flying notes */}
      {n10a.on ? <Note x={n10a.x} y={n10a.y} label="$10" rot={n10a.k * 360} /> : null}
      {n10b.on ? <Note x={n10b.x} y={n10b.y} label="$10" rot={n10b.k * -360} /> : null}
      {n2.on ? <Note x={n2.x} y={n2.y} label="$2" s={0.8} rot={n2.k * 200} /> : null}
      {t > 13.4 && t < 17 ? <Note x={zebraPaw[0] - 10} y={zebraPaw[1] - 70 - zJump} label="$2" s={0.8} rot={-12} /> : null}
      {/* coins flying in and out during the montage */}
      {t > 18 && t < 25.8 ? Array.from({ length: 6 }).map((_, i) => {
        const sp = 1.2 + 1.5 * prog(t, 18, 7);
        const k = ((t - 18) * sp + i / 6) % 1;
        const inbound = i % 2 === 0;
        const a: [number, number] = inbound ? [L.zebraX, L.floorY - fh * 0.5] : jarMouth;
        const b: [number, number] = inbound ? jarMouth : [portrait ? 980 : L.giraffeX, L.floorY - fh * 0.6];
        return <Coin key={i} x={lerp(a[0], b[0], k)} y={lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 160} r={16} spin={t * 7 + i} />;
      }) : null}
      {/* the coin that falls out on Friday */}
      {t > 28.85 && t < 31 ? <Coin x={coinX} y={coinY} r={22} spin={t * 14} /> : null}
      {/* zebra + giraffe up front (scenes 2–4) */}
      {t < 26.2 ? (
        <>
          <Friend kind={0} x={z.x} y={L.floorY + 10} h={fh} t={t} bob={z.bob + zJump} rot={z.rot} expr={zebraHappy ? "happy" : "neutral"} arms={zebraArms} sx={zsx} sy={zsy} />
          {t > 10.7 ? <Friend kind={1} x={g.x} y={L.floorY + 10} h={fh} t={t} bob={g.bob} rot={g.rot} flip arms={giraffeArms} /> : null}
        </>
      ) : null}
      {/* Friday mob */}
      {showCrowd ? L.crowd.map(([cx, cy, cs, kind], i) => {
        const p = prog(t, 26.3 + i * 0.08, 0.5);
        const [csx, csy] = squash(t, 26.8 + i * 0.08, 0.1);
        return <Friend key={i} kind={kind as Kind} x={cx} y={cy + (1 - p) * 500} h={fh * cs} t={t} expr="angry" arms="up" flip={cx > s.x}
          bob={Math.abs(Math.sin(t * 9 + i)) * 10} sx={csx} sy={csy} />;
      }) : null}
      {/* speech bubbles for the friends */}
      <Bubble x={z.x + fh * 0.18} y={L.floorY - fh * 0.98 - zJump} t={t} t0={13.6} t1={15.4} text="Ooh! $2 already!" size={portrait ? 42 : 50} maxW={portrait ? 360 : 460} />
      <Bubble x={L.crowd[0][0] + fh * 0.2} y={L.crowd[0][1] - fh * L.crowd[0][2] * 0.98} t={t} t0={27.3} t1={29.4} text="Where's our 20%?!" size={portrait ? 44 : 54} maxW={portrait ? 420 : 520} />
    </AbsoluteFill>
    {/* HUD (outside the camera so it is never cropped) */}
    <Caption L={L} t={t} t0={10.0} t1={12.6} text="WEEK 2" />
    <Caption L={L} t={t} t0={26.0} t1={28.6} text="FRIDAY" alarm />
    {t > 10.2 && t < 26.2 ? <Scoreboard L={L} t={t} t0={10.3} moneyIn={moneyIn} sold="0" bumpAt={[12.05, 18, 20, 22, 24].filter((a) => t >= a).pop()} /> : null}
    {t > 17.3 && t < 26.2 ? <Chalkboard L={L} t={t} t0={17.4} steps={steps} /> : null}
    </>
  );
};

// ── Scene 6 close-up: Mum in the doorway, Liam frozen ────────────────────────
const CloseUp: React.FC<{ L: Layout; t: number; tReal: number }> = ({ L, t, tReal }) => {
  if (tReal < 35.0) return null;
  const cu = L.closeup;
  const portrait = L.name === "9x16";
  const zoom = 1 + 0.07 * prog(tReal, FREEZE_AT, 3, easeInOut);
  const doorW = portrait ? 560 : 640;
  const doorX = cu.mumX - doorW / 2, doorTop = cu.mumY - cu.mumH - 40;
  const sweat = 1;
  const bang = Math.min(1.1, pop(t, 35.05, 0.3));
  const brow = prog(t, 35.4, 0.5);
  const endA = prog(tReal, 37.3, 0.5), endB = prog(tReal, 38.4, 0.5);
  return (
    <AbsoluteFill style={{ background: C.woodLight, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 45%" }}>
        <svg width={L.W} height={L.H} style={{ position: "absolute" }}>
          {Array.from({ length: Math.ceil(L.W / 90) }).map((_, i) => <line key={i} x1={i * 90} x2={i * 90} y1={0} y2={L.H} stroke={C.woodDark} strokeWidth={4} opacity={0.4} />)}
          <rect x={doorX - 24} y={doorTop - 24} width={doorW + 48} height={L.H} fill={C.wood} stroke={C.ink} strokeWidth={8} />
          <rect x={doorX} y={doorTop} width={doorW} height={L.H} fill="#3B2A1E" stroke={C.ink} strokeWidth={8} />
          <rect x={doorX + doorW - 70} y={doorTop} width={70} height={L.H} fill={C.wood} stroke={C.ink} strokeWidth={6} />
        </svg>
        <div style={{ position: "absolute", left: cu.mumX - cu.mumH * 320 / 460 / 2, top: cu.mumY - cu.mumH, width: cu.mumH * 320 / 460, height: cu.mumH }}>
          <Mum browUp={0.4 + 0.6 * brow} />
        </div>
        <Liam x={cu.liamX} y={cu.liamY} h={cu.liamH} t={t} fx={{ sweat, bang }} shake={t < FREEZE_AT ? 2 : 0} tilt={-3} />
      </AbsoluteFill>
      {/* end text after the freeze */}
      {tReal > 37.2 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: portrait ? L.safe.y0 + 20 : undefined, bottom: portrait ? undefined : 34,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ transform: `translateY(${(1 - endA) * 80}px)`, opacity: endA, background: C.navy, border: `6px solid ${C.gold}`, borderRadius: 18,
            padding: "10px 30px", fontFamily: TITLE_FONT, fontSize: portrait ? 62 : 66, color: C.gold, boxShadow: `0 8px 0 ${C.ink}` }}>Don't try this at home.</div>
          <div style={{ transform: `translateY(${(1 - endB) * 80}px)`, opacity: endB, background: C.paper, border: `5px solid ${C.ink}`, borderRadius: 16,
            padding: "8px 26px", fontFamily: "'Inter Bold', Inter", fontWeight: 700, fontSize: portrait ? 40 : 46, color: C.navy, maxWidth: portrait ? 860 : 1300, textAlign: "center" }}>
            Here's how the real one got caught…</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const Episode: React.FC<{ L: Layout }> = ({ L }) => {
  const tReal = useT();
  const t = Math.min(tReal, FREEZE_AT); // final freeze frame
  return (
    <LayoutCtx.Provider value={L}>
      <AbsoluteFill style={{ background: C.paper }}>
        <FontFaces />
        <Stand L={L} t={t} />
        <CloseUp L={L} t={t} tReal={tReal} />
        <Title L={L} t={t} />
        <Paper L={L} />
        {tReal > 0.2 ? <Tag L={L} /> : null}
        <Subtitle L={L} t={tReal} lines={LINES} />
        {timeline.sfx.map((s, i) => (
          <Sequence key={i} from={Math.round(s.at * FPS)} durationInFrames={Math.round(2 * FPS)}>
            <Audio src={staticFile(`sfx/${s.file}.wav`)} volume={s.vol} />
          </Sequence>
        ))}
      </AbsoluteFill>
    </LayoutCtx.Provider>
  );
};
