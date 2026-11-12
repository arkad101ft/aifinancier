import React from "react";
import { AbsoluteFill } from "remotion";
import { C, FontFaces } from "./lib";
import { Liam } from "./Liam";
import { Zebra, Giraffe, Hippo, Mum, Expr } from "./Friends";

// Review sheet: the cast next to Liam (not part of the episode).
export const Cast: React.FC = () => {
  const row = (Comp: React.FC<{ expr?: Expr; arms?: "down" | "reach" | "up"; t?: number }>, vh: number) =>
    (["neutral", "happy", "angry"] as Expr[]).map((e, i) => (
      <div key={e} style={{ width: 300 * 0.62 * (484 / vh) * 1.6, height: 300 * 1.6 * 0.62, position: "relative" }}>
        <Comp expr={e} arms={i === 2 ? "up" : i === 1 ? "reach" : "down"} t={0.3} />
      </div>
    ));
  return (
    <AbsoluteFill style={{ background: C.paper, padding: 30, flexDirection: "row", flexWrap: "wrap", gap: 20, alignItems: "flex-end" }}>
      <FontFaces />
      <div style={{ position: "relative", width: 190, height: 300 }}><Liam x={95} y={300} h={300} t={0} /></div>
      {row(Zebra, 484)}
      {row(Hippo, 484)}
      <div style={{ position: "relative", width: 190, height: 300 }}><Liam x={95} y={300} h={300} t={0} /></div>
      {row(Giraffe, 556)}
      <div style={{ width: 186, height: 300 }}><Mum /></div>
    </AbsoluteFill>
  );
};
