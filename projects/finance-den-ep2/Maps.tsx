import React, { useMemo } from "react";
import { geoMercator, geoPath, geoEqualEarth, geoOrthographic, GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
// @ts-ignore json import
import world50 from "world-atlas/countries-50m.json";
// @ts-ignore json import
import world110 from "world-atlas/countries-110m.json";
// @ts-ignore json import
import world10 from "world-atlas/countries-10m.json";
import { C } from "./lib";

type Feat = { type: string; properties: { name: string }; geometry: unknown };

const cache: Record<string, Feat[]> = {};
export function countries(res: "10m" | "50m" | "110m" = "50m"): Feat[] {
  if (!cache[res]) {
    const topo = res === "10m" ? world10 : res === "50m" ? world50 : world110;
    cache[res] = (feature(topo as never, (topo as never as { objects: { countries: never } }).objects.countries) as never as {
      features: Feat[];
    }).features;
  }
  return cache[res];
}

export type MapSpec = {
  width: number;
  height: number;
  /** [[west, south], [east, north]] */
  bounds: [[number, number], [number, number]];
  kind?: "mercator" | "equalEarth";
  res?: "10m" | "50m" | "110m";
};

export function useProjection(spec: MapSpec): GeoProjection {
  return useMemo(() => {
    const [[w, s], [e, n]] = spec.bounds;
    const box = {
      type: "Feature",
      properties: {},
      // clockwise ring (d3 treats counter-clockwise as "everything except this box")
      geometry: { type: "Polygon", coordinates: [[[w, s], [w, n], [e, n], [e, s], [w, s]]] },
    };
    const p = spec.kind === "equalEarth" ? geoEqualEarth() : geoMercator();
    return p.fitSize([spec.width, spec.height], box as never);
  }, [spec.width, spec.height, spec.bounds, spec.kind]);
}

/** Static land layer; `fill(name)` chooses each country's colour. */
export const Land: React.FC<{
  spec: MapSpec;
  fill?: (name: string) => string;
  stroke?: string;
  strokeWidth?: number;
  only?: string[];
  except?: string[];
  draw?: number; // 0..1 outline draw-on progress
}> = ({ spec, fill = () => C.paper2, stroke = C.navy, strokeWidth = 2, only, except, draw = 1 }) => {
  const proj = useProjection(spec);
  const feats = useMemo(() => {
    const path = geoPath(proj);
    return countries(spec.res ?? "50m")
      .filter((f) => (!only || only.includes(f.properties.name)) && (!except || !except.includes(f.properties.name)))
      .map((f) => ({ name: f.properties.name, d: path(f as never) || "" }));
  }, [proj, spec.res, (only || []).join("|"), (except || []).join("|")]);
  return (
    <g>
      {feats.map((f, i) => {
        const d = f.d;
        return (
          <path key={i} d={d} fill={fill(f.name)} fillOpacity={Math.min(1, draw * 1.4)} stroke={stroke}
            strokeWidth={strokeWidth} strokeLinejoin="round" pathLength={1}
            strokeDasharray={draw < 1 ? `${draw} 1` : undefined} />
        );
      })}
    </g>
  );
};

export const Pin: React.FC<{ x: number; y: number; p: number; color?: string; label?: string; labelSide?: "r" | "l";
  pulse?: number; size?: number }> = ({ x, y, p, color = C.gold, label, labelSide = "r", pulse = 0, size = 1 }) => {
  if (p <= 0) return null;
  const s = Math.min(1.15, p) * size;
  return (
    <g transform={`translate(${x},${y})`}>
      {pulse > 0 ? (
        <circle r={14 + 26 * (pulse % 1)} fill="none" stroke={color} strokeWidth={4} opacity={1 - (pulse % 1)} />
      ) : null}
      <g transform={`scale(${s})`}>
        <circle r={13} fill={color} stroke={C.navy} strokeWidth={4} />
      </g>
      {label ? (
        <text x={labelSide === "r" ? 24 : -24} y={10} textAnchor={labelSide === "r" ? "start" : "end"}
          fontFamily="Inter" fontWeight={900} fontSize={34} fill={C.navy} opacity={Math.min(1, p)}
          stroke={C.paper} strokeWidth={8} paintOrder="stroke">{label}</text>
      ) : null}
    </g>
  );
};

export { geoOrthographic, geoPath };
