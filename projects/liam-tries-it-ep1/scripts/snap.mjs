// Stills for review: node scripts/snap.mjs <compositionId> <outDir> <t1> <t2> ...   (run from remotion-composer/)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [, , id, outDir, ...times] = process.argv;
const proj = path.resolve("projects/liam-tries-it-ep1");
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(proj, "src/index.tsx"), publicDir: path.join(proj, "public") });
const exe = process.env.REMOTION_BROWSER || undefined;
const browser = await openBrowser("chrome", exe ? { browserExecutable: exe } : {});
const composition = await selectComposition({ serveUrl, id, puppeteerInstance: browser });
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(t) * composition.fps));
  await renderStill({ serveUrl, composition, frame, output: path.join(outDir, `t${String(t).padStart(6, "0")}.png`), scale: 0.5, puppeteerInstance: browser });
}
await browser.close({ silent: true });
