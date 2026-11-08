import React from "react";
import { AbsoluteFill, Audio, CalculateMetadataFunction, interpolate, staticFile } from "remotion";
import { C, FONT, Grain, TimelineCtx, Timeline, cueTime, mouthOpen, pop, prog, useT, useTimeline, Big } from "./lib";
import { Liam, Expression, Pose } from "./Liam";
import { S01, S02, S03, Sting } from "./ScenesA";
import { S04, S05, S06 } from "./ScenesB";
import { S07, S08, S09, S10 } from "./ScenesC";

// ATELIER (BESPOKE) — hand-authored for Finance Den Ep. 1. See art-direction.md.

export interface SceneProps {
  timeline: Timeline;
  voice: string;          // file in public/
  music?: string | null;  // calm bed, file in public/
  tense?: string | null;  // tense cue for Barings + the scandal
  musicVolume?: number;
}

const FPS = 30;

// ── Liam's appearances (~10), cued on narration ─────────────────────────────
type Appear = { sec: string; from: string; to?: string; toEnd?: boolean; expr: Expression; pose: Pose;
  at: "br" | "bl" | "c" | "cl"; lean?: number; size?: number };
const APPEARANCES: Appear[] = [
  { sec: "s01_hook", from: "I'm Liam", toEnd: true, expr: "happy", pose: "wave", at: "br", size: 600 },
  { sec: "s02_independence", from: "So ask yourself", to: "Singapore's leaders had", expr: "curious", pose: "idle", at: "br", lean: 8 },
  { sec: "s03_clock", from: "In plain words", to: "At the same time", expr: "happy", pose: "point", at: "br" },
  { sec: "s04_referee", from: "Singapore made its currency boring", to: "Around the same time", expr: "yawn", pose: "idle", at: "bl" },
  { sec: "s05_barings", from: "One guy", to: "You'd think", expr: "wince", pose: "idle", at: "br" },
  { sec: "s06_crisis", from: "When your neighbours lock", to: "But, and this is the clever bit", expr: "smug", pose: "crossed", at: "bl" },
  { sec: "s07_numbers", from: "Think about that", to: "Number three", expr: "impressed", pose: "point", at: "br" },
  { sec: "s07_numbers", from: "That was up from", to: "In the Global Financial", expr: "impressed", pose: "idle", at: "bl" },
  { sec: "s08_scandal", from: "Because being a safe place", toEnd: true, expr: "smug", pose: "point", at: "br" },
  { sec: "s09_kigali", from: "I'm recording this from Kigali", to: "Because look at what", expr: "happy", pose: "wave", at: "br" },
  { sec: "s10_close", from: "So, was Singapore's wealth", to: "But the money", expr: "smug", pose: "crossed", at: "br" },
  { sec: "s10_close", from: "Next time in Money Cities", toEnd: true, expr: "happy", pose: "wave", at: "cl", size: 560 },
];

const LiamLayer: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  const items = APPEARANCES.map((a) => {
    const sec = tl.sections.find((s) => s.id === a.sec)!;
    const start = cueTime(tl, a.sec, a.from) - 0.25;
    let end = a.toEnd ? sec.end + 0.4 : cueTime(tl, a.sec, a.to!) - 0.1;
    if (a.sec === "s10_close" && a.toEnd) end = tl.duration + 1;
    return { ...a, start, end };
  });
  // an appearance yields to a later one that starts before it ends
  return (
    <>
      {items.map((a, i) => {
        const next = items[i + 1];
        const end = next && next.start < a.end ? next.start : a.end;
        if (t < a.start || t > end + 0.4) return null;
        const pin = pop(t, a.start, 0.5);
        const pout = prog(t, end, 0.35);
        const s = Math.max(0, Math.min(1.05, pin)) * (1 - pout);
        const size = a.size ?? 470;
        const pos: React.CSSProperties =
          a.at === "br" ? { right: 30, bottom: -30 } :
          a.at === "bl" ? { left: 30, bottom: -30 } :
          a.at === "cl" ? { right: 140, bottom: 10 } : // outro: leave bottom-right clear? see below
          { left: (1920 - size * 0.75) / 2 + 360, bottom: 20 };
        // outro: keep the bottom-right corner clear for end-screen elements
        const style: React.CSSProperties = a.at === "cl" ? { left: 900, bottom: 260 } : pos;
        return (
          <div key={i} style={{ position: "absolute", width: size * 0.75, height: size, ...style,
            transform: `translateY(${(1 - s) * 140}px) scale(${0.6 + 0.4 * s})`, transformOrigin: "50% 100%", opacity: Math.min(1, s * 1.6) }}>
            <Liam expression={a.expr} pose={a.pose} talk={mouthOpen(tl, t)} t={t} lean={a.lean ?? 0} />
          </div>
        );
      })}
    </>
  );
};

// ── Gold swoosh + chapter label between sections ────────────────────────────
const Swooshes: React.FC = () => {
  const tl = useTimeline();
  const t = useT();
  return (
    <>
      {tl.sections.slice(2).map((s, i) => {
        const prev = tl.sections[i + 1];
        const mid = (prev.end + s.start) / 2 + 0.1;
        const k = interpolate(t, [mid - 0.45, mid + 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (k <= 0 || k >= 1) return null;
        const x = -2400 + 4800 * k;
        return (
          <AbsoluteFill key={s.id} style={{ pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: -300, left: x, width: 900, height: 1700, background: C.gold,
              transform: "skewX(-24deg)", boxShadow: `120px 0 0 ${C.goldSoft}, -120px 0 0 ${C.navy}` }} />
          </AbsoluteFill>
        );
      })}
      {tl.sections.slice(1).map((s, i) => {
        const a = s.start + 0.2, b = a + 3.2;
        if (t < a || t > b + 0.4) return null;
        const o = Math.min(prog(t, a, 0.4), 1 - prog(t, b, 0.4));
        return (
          <div key={`ch-${s.id}`} style={{ position: "absolute", left: 70, top: 46, opacity: o, fontFamily: FONT, display: "flex",
            alignItems: "center", gap: 14, background: "rgba(19,35,58,0.88)", padding: "10px 22px", borderRadius: 12 }}>
            <span style={{ color: C.gold, fontWeight: 900, fontSize: 26 }}>{String(i + 2).padStart(2, "0")}</span>
            <span style={{ color: C.paper, fontWeight: 800, fontSize: 26 }}>{s.title}</span>
          </div>
        );
      })}
    </>
  );
};

const Tag: React.FC = () => (
  <div style={{ position: "absolute", left: 44, bottom: 34, fontFamily: FONT, fontWeight: 900, fontSize: 24, letterSpacing: 4,
    color: C.paper, background: C.navy, padding: "8px 16px", borderRadius: 8, border: `3px solid ${C.gold}` }}>
    FINANCE DEN
  </div>
);

const MusicTrack: React.FC<{ music?: string | null; tense?: string | null; vol: number }> = ({ music, tense, vol }) => {
  const tl = useTimeline();
  const bar = tl.sections.find((s) => s.id === "s05_barings")!;
  const scan = tl.sections.find((s) => s.id === "s08_scandal")!;
  const ramp = 1.5;
  const win = (sec: number, a: number, b: number) =>
    Math.max(0, Math.min(1, (sec - (a - ramp)) / ramp, ((b + ramp) - sec) / ramp));
  // 0 = calm bed, 1 = tense cue (Barings + the laundering case), crossfaded
  const tenseW = (sec: number) => (tense ? Math.max(win(sec, bar.start - 0.5, bar.end), win(sec, scan.start - 0.5, scan.end)) : 0);
  const edges = (sec: number) => Math.min(1, sec / 2) * Math.min(1, Math.max(0, (tl.duration - sec) / 3));
  return (
    <>
      {music ? (
        <Audio src={staticFile(music)} loop volume={(f) => vol * edges(f / FPS) * (1 - tenseW(f / FPS))} />
      ) : null}
      {tense ? (
        <Audio src={staticFile(tense)} loop volume={(f) => vol * 0.64 * edges(f / FPS) * tenseW(f / FPS)} />
      ) : null}
    </>
  );
};

export const Scene: React.FC<SceneProps> = ({ timeline, voice, music, tense, musicVolume = 0.22 }) => (
  <TimelineCtx.Provider value={timeline}>
    <AbsoluteFill style={{ background: C.paper, fontFamily: FONT }}>
      <S01 /><S02 /><S03 /><S04 /><S05 /><S06 /><S07 /><S08 /><S09 /><S10 />
      <Sting />
      <LiamLayer />
      <Swooshes />
      <Grain />
      <Tag />
      <Audio src={staticFile(voice)} />
      <MusicTrack music={music} tense={tense} vol={musicVolume} />
    </AbsoluteFill>
  </TimelineCtx.Provider>
);

export const calculateMetadata: CalculateMetadataFunction<SceneProps> = async ({ props }) => ({
  durationInFrames: Math.ceil((props.timeline?.duration ?? 30) * FPS),
  fps: FPS,
  width: 1920,
  height: 1080,
});
