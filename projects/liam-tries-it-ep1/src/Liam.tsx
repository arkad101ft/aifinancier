import React from "react";
import { Img, staticFile } from "remotion";
import { C } from "./lib";

// Liam = the owner's liam.png, never redrawn. Only transforms (bounce, tilt, squash/stretch,
// slide, shake) plus emotion overlays (sweat drops, "!", sparkle).
// The PNG is 612x987 (Liam's head centre ≈ 49% x, 29% y).
const ASPECT = 612 / 987;
export const LIAM_HEAD = { x: 0.49, y: 0.29 };

export type LiamFx = { sweat?: number; bang?: number; sparkle?: number; t?: number };

export const Liam: React.FC<{
  x: number; // centre x of his feet
  y: number; // feet line
  h: number; // rendered height
  bounce?: number; // px upward
  tilt?: number; // degrees
  sx?: number; sy?: number; // squash/stretch (pivot at feet)
  shake?: number; // px amplitude
  t: number;
  fx?: LiamFx;
  opacity?: number;
}> = ({ x, y, h, bounce = 0, tilt = 0, sx = 1, sy = 1, shake = 0, t, fx = {}, opacity = 1 }) => {
  const w = h * ASPECT;
  const shx = shake ? Math.sin(t * 61) * shake : 0;
  const shy = shake ? Math.cos(t * 47) * shake * 0.4 : 0;
  const headX = w * LIAM_HEAD.x, headY = h * LIAM_HEAD.y;
  return (
    <div style={{ position: "absolute", left: x - w / 2 + shx, top: y - h - bounce + shy, width: w, height: h, opacity,
      transform: `rotate(${tilt}deg) scale(${sx}, ${sy})`, transformOrigin: "50% 100%" }}>
      <Img src={staticFile("liam.png")} style={{ width: w, height: h, display: "block" }} />
      {/* sweat drops (fall and refresh) */}
      {fx.sweat ? [0, 1, 2].map((i) => {
        const cyc = ((t * (1.2 + fx.sweat! * 0.8) + i * 0.37) % 1);
        const side = i % 2 ? 1 : -1;
        const dx = headX + side * w * (0.36 + 0.05 * i), dy = headY - h * 0.1 + cyc * h * 0.18;
        return (
          <svg key={i} width={h * 0.07} height={h * 0.1} viewBox="0 0 40 56"
            style={{ position: "absolute", left: dx - h * 0.035, top: dy, opacity: Math.min(1, fx.sweat!) * (1 - cyc * 0.7) }}>
            <path d="M20 2 C30 22 36 32 36 40 A16 16 0 0 1 4 40 C4 32 10 22 20 2 Z" fill="#8FD3FF" stroke={C.ink} strokeWidth={4} />
            <ellipse cx={14} cy={38} rx={4} ry={6} fill="#fff" opacity={0.8} />
          </svg>
        );
      }) : null}
      {/* "!" above his head */}
      {fx.bang ? (
        <div style={{ position: "absolute", left: headX + w * 0.44, top: h * 0.02, width: h * 0.16, height: h * 0.22,
          transform: `scale(${fx.bang})`, transformOrigin: "50% 100%" }}>
          <svg viewBox="0 0 60 84" width="100%" height="100%">
            <path d="M18 4 H42 L37 56 H23 Z" fill={C.red} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={30} cy={72} r={9} fill={C.red} stroke={C.ink} strokeWidth={5} />
          </svg>
        </div>
      ) : null}
      {/* sparkle for smug moments */}
      {fx.sparkle ? (
        <svg viewBox="-50 -50 100 100" width={h * 0.18} height={h * 0.18}
          style={{ position: "absolute", left: headX + w * 0.28, top: headY - h * 0.2, transform: `scale(${fx.sparkle}) rotate(${t * 90}deg)` }}>
          <path d="M0 -46 L10 -10 L46 0 L10 10 L0 46 L-10 10 L-46 0 L-10 -10 Z" fill={C.gold} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={30} cy={-30} r={6} fill={C.gold} stroke={C.ink} strokeWidth={3} />
        </svg>
      ) : null}
    </div>
  );
};
