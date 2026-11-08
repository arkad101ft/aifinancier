import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "./lib";
import { Liam } from "./Liam";
import { Skyline } from "./ScenesA";

// 1920x1080 thumbnail (exported, then scaled to 1280x720).
export const Thumbnail: React.FC = () => (
  <AbsoluteFill style={{ background: C.navy, fontFamily: FONT }}>
    <AbsoluteFill style={{ transform: "scale(1.15)", transformOrigin: "60% 80%" }}>
      <Skyline t={2} mode="night" />
    </AbsoluteFill>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(19,35,58,0.96) 0%, rgba(19,35,58,0.85) 48%, rgba(19,35,58,0) 75%)" }} />
    <AbsoluteFill style={{ paddingLeft: 90, paddingTop: 110 }}>
      <div style={{ fontWeight: 900, fontSize: 64, color: C.blueSoft, letterSpacing: 2 }}>IT WAS NEVER ABOUT TRADE</div>
      <div style={{ fontWeight: 900, fontSize: 178, lineHeight: 0.95, color: C.paper, letterSpacing: -4, marginTop: 20 }}>
        WHY<br />SINGAPORE<br />IS SO <span style={{ color: C.gold }}>RICH</span>
      </div>
      <div style={{ marginTop: 40, display: "inline-block", background: C.gold, color: C.navy, fontWeight: 900, fontSize: 64,
        padding: "10px 28px", borderRadius: 14, alignSelf: "flex-start" }}>$1.485T A DAY</div>
    </AbsoluteFill>
    <div style={{ position: "absolute", right: 40, bottom: -40, width: 620, height: 830 }}>
      <Liam expression="smug" pose="crossed" t={0.5} />
    </div>
    <div style={{ position: "absolute", left: 90, bottom: 50, fontWeight: 900, fontSize: 34, letterSpacing: 5, color: C.gold }}>FINANCE DEN</div>
  </AbsoluteFill>
);
