"""Liam's voice track: Kokoro TTS voice "am_liam" (the channel's AI voice for Liam), each line placed at its
start time from src/timeline.json and squeezed (atempo) only if it would overrun its subtitle window.
Writes out/liam_voice.wav (48 kHz mono, full video length). Requires: kokoro-onnx, soundfile, ffmpeg,
and the model files in ~/.kokoro (kokoro-v1.0.onnx, voices-v1.0.bin)."""
import json, os, subprocess, sys, tempfile
from pathlib import Path
import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[1]
out_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "out"
out_dir.mkdir(parents=True, exist_ok=True)
tl = json.loads((ROOT / "src" / "timeline.json").read_text())
home = Path.home() / ".kokoro"
k = Kokoro(str(home / "kokoro-v1.0.onnx"), str(home / "voices-v1.0.bin"))
SR = 48000
track = np.zeros(int(SR * tl["duration"]), dtype=np.float32)
with tempfile.TemporaryDirectory() as td:
    for ln in tl["lines"]:
        a, sr = k.create(ln["text"].replace("…", "..."), voice="am_liam", speed=1.0, lang="en-us")
        raw, fit = os.path.join(td, "raw.wav"), os.path.join(td, "fit.wav")
        sf.write(raw, a, sr)
        window = ln["end"] - ln["start"] - 0.05
        tempo = max(1.0, (len(a) / sr) / window)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-filter:a", f"atempo={tempo:.4f},aresample={SR}", "-ac", "1", fit], check=True)
        b, _ = sf.read(fit, dtype="float32")
        i = int(ln["start"] * SR)
        track[i:i + len(b)] += b[: len(track) - i]
        print(f"line {ln['n']}: {len(b) / SR:.2f}s in a {ln['end'] - ln['start']:.2f}s window" + (f" (tempo {tempo:.2f})" if tempo > 1 else ""))
sf.write(out_dir / "liam_voice.wav", track, SR)
print("wrote", out_dir / "liam_voice.wav")
