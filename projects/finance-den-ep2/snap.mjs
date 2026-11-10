// Contact-sheet stills for review: node snap.mjs <out_dir> <t1> <t2> ...  (seconds)
// Run from remotion-composer/ (so node_modules resolve). Bundles once, renders each still at 0.5 scale.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const proj = "/home/user/aifinancier/projects/finance-den-ep2";
const [, , outDir, ...times] = process.argv;
fs.mkdirSync(outDir, { recursive: true });
const inputProps = JSON.parse(fs.readFileSync(path.join(proj, "artifacts/props.json"), "utf8"));
const serveUrl = await bundle({
  entryPoint: path.resolve("projects/finance-den-ep2/index.tsx"),
  publicDir: path.join(proj, "public"),
});
const browser = await openBrowser("chrome", {
  browserExecutable: "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell",
});
const composition = await selectComposition({ serveUrl, id: "FinanceDenEp2", inputProps, puppeteerInstance: browser });
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(parseFloat(t) * 30));
  const output = path.join(outDir, `t${String(t).padStart(6, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output, inputProps, scale: 0.5, puppeteerInstance: browser });
  console.log("still", t, output);
}
await browser.close({ silent: true });
