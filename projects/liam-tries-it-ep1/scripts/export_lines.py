"""Write voice_lines.txt and liam_lines.srt from src/timeline.json (the single source of truth)."""
import json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "out"
out.mkdir(parents=True, exist_ok=True)
tl = json.loads((ROOT / "src" / "timeline.json").read_text())

def ts(x, sep="."):
    m, s = divmod(x, 60)
    return f"{int(m):02d}:{s:06.3f}".replace(".", sep) if sep != "." else f"{int(m):02d}:{s:06.3f}"

rows = [f"{tl['title']}: Liam's lines (voiced by the owner)",
        f"Video length {tl['duration']:.1f} s at {tl['fps']} fps. Times are when each subtitle is on screen; record each line to fit inside it.",
        "Record ONE file, voiceover.wav, starting at 00:00.000 (silence between lines), then run ./add_voiceover.sh.", ""]
for ln in tl["lines"]:
    rows += [f"{ln['n']}.  {ts(ln['start'])} → {ts(ln['end'])}   ({ln['end'] - ln['start']:.2f} s)   [{ln['scene']}]",
             f"    Direction: {ln['direction']}",
             f"    LIAM: {ln['text']}", ""]
(out / "voice_lines.txt").write_text("\n".join(rows), encoding="utf-8")

def srt(x):
    h, r = divmod(x, 3600); m, s = divmod(r, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int(round((s % 1) * 1000)):03d}"
(out / "liam_lines.srt").write_text("\n".join(f"{i+1}\n{srt(l['start'])} --> {srt(l['end'])}\n{l['text']}\n" for i, l in enumerate(tl["lines"])), encoding="utf-8")
print("wrote", out / "voice_lines.txt", "and liam_lines.srt")
