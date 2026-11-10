import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FONT } from "./lib";
import { Liam, Expression, Pose } from "./Liam";

const items: [Expression, Pose, number][] = [
  ["happy", "idle", 0], ["smug", "crossed", 0], ["curious", "idle", 0.3], ["wince", "idle", 0],
  ["impressed", "point", 0], ["yawn", "idle", 0], ["impressed", "head", 0], ["serious", "idle", 0],
];
export const LiamSheet: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper, flexDirection: "row", flexWrap: "wrap", padding: 30 }}>
    {items.map(([e, p, talk], i) => (
      <div key={i} style={{ width: 460, height: 500, textAlign: "center", fontFamily: FONT, fontWeight: 800 }}>
        <div style={{ height: 440 }}><Liam expression={e} pose={p} talk={talk} t={1} /></div>{e} / {p}
      </div>
    ))}
  </AbsoluteFill>
);
