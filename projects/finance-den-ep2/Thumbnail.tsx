import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, FONT } from "./lib";
import { Liam } from "./Liam";

// Thumbnail A (owner's brief): house on a cracked globe, Liam shocked with hands on head, "ONE HOUSE."
// 1920x1080, exported then scaled to 1280x720. Bottom-right kept free of text.
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: C.navy, fontFamily: FONT }}>
    <Img src={staticFile("img/s01_house_globe.jpg")} style={{ position: "absolute", width: 1920, height: 1097, top: -8, objectFit: "cover",
      transform: "scale(1.08)", transformOrigin: "62% 55%" }} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(19,35,58,0.92) 0%, rgba(19,35,58,0.55) 38%, rgba(19,35,58,0) 60%)" }} />
    <div style={{ position: "absolute", left: 80, top: 70, fontWeight: 900, fontSize: 250, lineHeight: 0.9, color: C.paper, letterSpacing: -6,
      WebkitTextStroke: `14px ${C.navy}`, paintOrder: "stroke fill" }}>
      ONE<br />HOUSE.
    </div>
    <div style={{ position: "absolute", left: 90, top: 560, background: C.red, color: C.paper, fontWeight: 900, fontSize: 64,
      padding: "8px 26px", borderRadius: 14 }}>2008</div>
    <div style={{ position: "absolute", left: 1060, bottom: -30, width: 560, height: 750 }}>
      <Liam expression="impressed" pose="head" t={0.5} />
    </div>
    <div style={{ position: "absolute", left: 90, bottom: 50, fontWeight: 900, fontSize: 34, letterSpacing: 5, color: C.gold }}>FINANCE DEN</div>
  </AbsoluteFill>
);
