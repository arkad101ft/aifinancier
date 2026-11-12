import React, { createContext, useContext } from "react";
import { Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

// ── Palette (owner's brief) ──────────────────────────────────────────────────
export const C = {
  paper: "#F7F4EE",
  paper2: "#EDE6D8",
  navy: "#13233A",
  gold: "#F5A623",
  blue: "#5B8DEF",
  red: "#D93A3F", // alarm moments only
  ink: "#1B1B1B",
  wood: "#C98B4F",
  woodDark: "#9C6535",
  woodLight: "#E2AE74",
  lemon: "#F6D43A",
  money: "#9FD08C",
  glass: "rgba(200,225,240,0.45)",
};
export const OUT = 6; // bold outline width (matches Liam's)
export const TITLE_FONT = "'Inter Black', Inter, sans-serif";
export const BODY_FONT = "'Inter SemiBold', Inter, sans-serif";

export const FontFaces: React.FC = () => (
  <style>{`
    @font-face { font-family: 'Inter Black'; src: url('${staticFile("fonts/Inter-Black.otf")}'); font-weight: 900; }
    @font-face { font-family: 'Inter Bold'; src: url('${staticFile("fonts/Inter-Bold.otf")}'); font-weight: 700; }
    @font-face { font-family: 'Inter SemiBold'; src: url('${staticFile("fonts/Inter-SemiBold.otf")}'); font-weight: 600; }
  `}</style>
);

// ── Time (deterministic: everything derives from the frame number) ───────────
export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
/** Scene clock after the final freeze (37.0 s): animated elements stop, the camera and end text keep going. */
export const FREEZE_AT = 37.0;
export const FreezeCtx = createContext<number>(0);
export const useSceneT = () => Math.min(useT(), FREEZE_AT);

export const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** eased 0→1 between t0 and t0+dur */
export const prog = (t: number, t0: number, dur = 0.5, e = easeOut) =>
  interpolate(t, [t0, t0 + dur], [0, 1], { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
/** overshoot pop 0→1 (back-out) */
export const pop = (t: number, t0: number, dur = 0.45) => {
  const x = clamp01((t - t0) / dur);
  if (x <= 0) return 0;
  const c1 = 2.2, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** squash-and-stretch on landing: returns [sx, sy] that settle to 1 */
export const squash = (t: number, t0: number, amount = 0.18, dur = 0.45): [number, number] => {
  const x = (t - t0) / dur;
  if (x < 0 || x > 1) return [1, 1];
  const k = Math.sin(x * Math.PI * 2.5) * Math.exp(-x * 4) * amount;
  return [1 + k, 1 - k];
};
/** 0..1 visibility window with fades */
export const win = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) =>
  Math.min(prog(t, a, fi, Easing.linear), 1 - prog(t, b - fo, fo, Easing.linear));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** deterministic pseudo-random in [0,1) */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ── Layout (16:9 or 9:16). Every scene positions things through this. ────────
export type Layout = {
  name: "16x9" | "9x16";
  W: number; H: number;
  /** safe area for text (9:16 avoids Shorts UI: top bar, right buttons, bottom caption block) */
  safe: { x0: number; y0: number; x1: number; y1: number };
  floorY: number;
  stand: { x: number; counterTop: number; w: number; roofY: number; wallX0: number; wallX1: number; doorX0: number; doorX1: number };
  liam: { x: number; h: number };
  lemonJar: { x: number }; cashJar: { x: number };
  friendScale: number;
  zebraX: number; giraffeX: number; hippoX: number;
  caption: { x: number; y: number; size: number };
  scoreboard: { x: number; y: number; w: number; size: number };
  chalk: { x: number; y: number; w: number; h: number; size: number };
  subtitle: { y: number; maxW: number; size: number };
  tag: { x: number; y: number };
  queue: [number, number, number][]; // path points (x, y, scale) from the front of the queue backwards
  crowd: [number, number, number, number][]; // (x, y, scale, kind) for the Friday mob
  camScale: number;
  camY: number;
  closeup: { liamX: number; liamH: number; liamY: number; mumX: number; mumH: number; mumY: number };
};

export const L16x9: Layout = {
  name: "16x9", W: 1920, H: 1080,
  safe: { x0: 96, y0: 54, x1: 1824, y1: 1026 },
  floorY: 880,
  stand: { x: 960, counterTop: 650, w: 820, roofY: 210, wallX0: 610, wallX1: 1310, doorX0: 1080, doorX1: 1270 },
  liam: { x: 880, h: 470 },
  lemonJar: { x: 680 }, cashJar: { x: 1210 },
  friendScale: 1.05,
  zebraX: 360, giraffeX: 1580, hippoX: 230,
  caption: { x: 64, y: 56, size: 96 },
  scoreboard: { x: 1420, y: 44, w: 450, size: 40 },
  chalk: { x: 56, y: 220, w: 430, h: 290, size: 44 },
  subtitle: { y: 940, maxW: 1480, size: 58 },
  tag: { x: 40, y: 1028 },
  queue: [[360, 880, 1.0], [210, 860, 0.86], [80, 840, 0.74], [-40, 820, 0.64], [120, 760, 0.5], [300, 740, 0.44], [480, 724, 0.4], [-20, 700, 0.36], [640, 712, 0.36]],
  crowd: [[300, 1090, 1.15, 0], [560, 1110, 1.0, 2], [1360, 1110, 1.05, 2], [1640, 1090, 1.15, 1], [120, 1080, 0.95, 1], [1830, 1080, 0.95, 0], [800, 1150, 0.8, 0], [1120, 1150, 0.8, 1]],
  camScale: 1.12,
  camY: 0,
  closeup: { liamX: 560, liamH: 1100, liamY: 1250, mumX: 1360, mumH: 960, mumY: 1010 },
};

export const L9x16: Layout = {
  name: "9x16", W: 1080, H: 1920,
  // Shorts UI: keep text inside x 60..960 (right-side buttons), y 220..1440 (top bar / bottom caption block)
  safe: { x0: 60, y0: 220, x1: 960, y1: 1440 },
  floorY: 1260,
  stand: { x: 520, counterTop: 1030, w: 820, roofY: 560, wallX0: 190, wallX1: 850, doorX0: 640, doorX1: 820 },
  liam: { x: 440, h: 520 },
  lemonJar: { x: 320 }, cashJar: { x: 740 },
  friendScale: 0.86,
  zebraX: 190, giraffeX: 860, hippoX: 120,
  caption: { x: 70, y: 236, size: 96 },
  scoreboard: { x: 500, y: 236, w: 460, size: 40 },
  chalk: { x: 64, y: 236, w: 410, h: 290, size: 42 },
  subtitle: { y: 1300, maxW: 880, size: 48 },
  tag: { x: 60, y: 1394 },
  queue: [[190, 1260, 0.86], [120, 1170, 0.62], [230, 1110, 0.5], [100, 1075, 0.44], [880, 1150, 0.5], [960, 1100, 0.44], [830, 1060, 0.4], [320, 1050, 0.36], [720, 1045, 0.34]],
  crowd: [[200, 1380, 1.0, 0], [420, 1410, 0.95, 2], [640, 1410, 0.95, 2], [860, 1380, 1.0, 1], [110, 1350, 0.85, 1], [950, 1340, 0.85, 0], [530, 1440, 0.8, 0]],
  camScale: 1.2,
  camY: 120,
  closeup: { liamX: 290, liamH: 1000, liamY: 1550, mumX: 750, mumH: 880, mumY: 1400 },
};

export const LayoutCtx = createContext<Layout>(L16x9);
export const useLayout = () => useContext(LayoutCtx);
