"""Build the temporary narration track + word-level timeline for Finance Den Ep.1.

Reads artifacts/narration.json, synthesizes each paragraph with Piper (free,
offline), joins them with pauses, and transcribes each paragraph with Whisper
for word timings. Writes:
  public/voice.wav              full narration track (48 kHz mono)
  artifacts/timeline.json       sections -> paragraphs -> words, in seconds

To swap in the real voiceover later: replace the per-paragraph synthesis with
the supplied audio, keep the same paragraph/section structure, and re-run.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[1]
sys.path.insert(0, str(REPO))

from tools.tool_registry import registry  # noqa: E402

ENGINE = "kokoro"          # "kokoro" (natural, default) | "piper" (fallback)
VOICE = "am_liam"          # Kokoro voice chosen by the owner (Voice 7 in the sampler)
SPEED = 0.92               # Kokoro: ~155 wpm, confident explainer pace
PIPER_VOICE = "en_US-ryan-high"
LENGTH_SCALE = 1.13        # Piper only
PARA_GAP = 0.55           # seconds between paragraphs
SECTION_GAP = 1.4          # seconds between sections (gold swoosh lives here)
STING_GAP = 3.2            # after section 1: Finance Den title sting
LEAD_IN = 0.6
SR = 48000

work = ROOT / "assets" / "audio" / ("paras_" + ENGINE)
work.mkdir(parents=True, exist_ok=True)
(ROOT / "public").mkdir(exist_ok=True)


def spoken(text: str, fixes: dict[str, str]) -> str:
    for k, v in fixes.items():
        text = text.replace(k, v)
    return text


def duration(path: Path) -> float:
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)]
    )
    return float(out.decode().strip())


def silence(path: Path, seconds: float) -> None:
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=mono",
         "-t", f"{seconds:.3f}", "-c:a", "pcm_s16le", str(path)], check=True)


_KOKORO = None


def kokoro_tts(text: str, out: Path) -> None:
    global _KOKORO
    import numpy as np
    import soundfile as sf
    from kokoro_onnx import Kokoro
    if _KOKORO is None:
        home = Path.home() / ".kokoro"
        _KOKORO = Kokoro(str(home / "kokoro-v1.0.onnx"), str(home / "voices-v1.0.bin"))
    audio, sr = _KOKORO.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    sf.write(str(out), np.asarray(audio), sr)


def main() -> None:
    registry.discover()
    tts = registry.get("piper_tts")
    stt = registry.get("transcriber")
    data = json.loads((ROOT / "artifacts" / "narration.json").read_text())
    fixes = data["spoken_fixes"]

    pieces: list[Path] = []
    timeline = {"voice": f"{ENGINE}:{VOICE if ENGINE == 'kokoro' else PIPER_VOICE}", "temporary": True, "sections": []}
    t = 0.0

    def add_silence(sec: float, name: str) -> None:
        nonlocal t
        p = work / f"gap_{name}.wav"
        silence(p, sec)
        pieces.append(p)
        t += sec

    real_dir = ROOT / "assets" / "audio" / "real"

    def transcribe(wav: Path) -> list[dict]:
        words_path = wav.with_suffix(".words.json")
        if words_path.exists() and words_path.stat().st_mtime >= wav.stat().st_mtime:
            return json.loads(words_path.read_text())
        r = stt.execute({"input_path": str(wav), "model_size": "small", "language": "en",
                         "output_dir": str(work / "tx")})
        if not r.success:
            raise SystemExit(f"STT failed for {wav.name}: {r.error}")
        words = [{"w": w.get("word", "").strip(), "s": round(w["start"], 3), "e": round(w["end"], 3)}
                 for seg in r.data["segments"] for w in seg.get("words", [])]
        words_path.write_text(json.dumps(words))
        return words

    add_silence(LEAD_IN, "lead")
    for si, sec in enumerate(data["sections"]):
        s_entry = {"id": sec["id"], "title": sec["title"], "start": round(t, 3), "paragraphs": []}
        real = next((p for p in sorted(real_dir.glob(f"{sec['id']}.*")) if p.suffix.lower() in
                     (".wav", ".mp3", ".m4a", ".flac", ".aac", ".ogg")), None) if real_dir.exists() else None
        if real is not None:
            # Real voiceover for this whole section: transcribe it, then split into the
            # script's paragraphs by word count so every cue lands on the real delivery.
            timeline["temporary"] = False
            wav = work / f"{sec['id']}_REAL.wav"
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(real), "-ar", str(SR), "-ac", "1",
                            "-c:a", "pcm_s16le", str(wav)], check=True)
            d = duration(wav)
            words = transcribe(wav)
            counts = [len(p.split()) for p in sec["paragraphs"]]
            total = sum(counts)
            wi = 0
            for pi, text in enumerate(sec["paragraphs"]):
                n = round(len(words) * counts[pi] / total) if pi < len(counts) - 1 else len(words) - wi
                chunk = words[wi:wi + max(1, n)]
                wi += len(chunk)
                p0 = chunk[0]["s"] if chunk else 0.0
                p1 = chunk[-1]["e"] if chunk else d
                s_entry["paragraphs"].append({
                    "text": text, "start": round(t + p0, 3), "end": round(t + p1, 3),
                    "words": [{"w": w["w"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in chunk],
                })
            pieces.append(wav)
            t += d
            s_entry["end"] = round(t, 3)
            timeline["sections"].append(s_entry)
            if si < len(data["sections"]) - 1:
                add_silence(STING_GAP if si == 0 else SECTION_GAP, sec["id"])
            print(f"{sec['id']:18} {s_entry['start']:7.1f}s -> {s_entry['end']:7.1f}s  (real VO: {real.name})")
            continue
        for pi, text in enumerate(sec["paragraphs"]):
            raw = work / f"{sec['id']}_{pi:02d}_raw.wav"
            wav = work / f"{sec['id']}_{pi:02d}.wav"
            if not wav.exists():
                if ENGINE == "kokoro":
                    kokoro_tts(spoken(text, fixes), raw)
                else:
                    r = tts.execute({"text": spoken(spoken(text, data.get("piper_fixes", {})), fixes),
                                     "model": PIPER_VOICE, "length_scale": LENGTH_SCALE,
                                     "sentence_silence": 0.32, "output_path": str(raw)})
                    if not r.success:
                        raise SystemExit(f"TTS failed for {sec['id']}#{pi}: {r.error}")
                subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-ar", str(SR),
                                "-ac", "1", "-c:a", "pcm_s16le", str(wav)], check=True)
            d = duration(wav)
            words_path = wav.with_suffix(".words.json")
            if words_path.exists():
                words = json.loads(words_path.read_text())
            else:
                r = stt.execute({"input_path": str(wav), "model_size": "base", "language": "en",
                                 "output_dir": str(work / "tx")})
                if not r.success:
                    raise SystemExit(f"STT failed for {sec['id']}#{pi}: {r.error}")
                words = [{"w": w.get("word", "").strip(), "s": round(w["start"], 3), "e": round(w["end"], 3)}
                         for seg in r.data["segments"] for w in seg.get("words", [])]
                words_path.write_text(json.dumps(words))
            s_entry["paragraphs"].append({
                "text": text, "start": round(t, 3), "end": round(t + d, 3),
                "words": [{"w": w["w"], "s": round(t + w["s"], 3), "e": round(t + w["e"], 3)} for w in words],
            })
            pieces.append(wav)
            t += d
            last_para = pi == len(sec["paragraphs"]) - 1
            if not last_para:
                add_silence(PARA_GAP, f"{sec['id']}_{pi}")
        s_entry["end"] = round(t, 3)
        timeline["sections"].append(s_entry)
        if si < len(data["sections"]) - 1:
            add_silence(STING_GAP if si == 0 else SECTION_GAP, sec["id"])
        print(f"{sec['id']:18} {s_entry['start']:7.1f}s -> {s_entry['end']:7.1f}s")
    add_silence(2.5, "tail")  # room for the end screen

    listing = work / "concat.txt"
    listing.write_text("".join(f"file '{p.resolve()}'\n" for p in pieces))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listing),
                    "-c:a", "pcm_s16le", str(ROOT / "public" / "voice.wav")], check=True)
    timeline["duration"] = round(t, 3)
    (ROOT / "artifacts" / "timeline.json").write_text(json.dumps(timeline, indent=1))
    props_path = ROOT / "artifacts" / "props.json"
    props = json.loads(props_path.read_text()) if props_path.exists() else {
        "voice": "voice.wav", "music": "music_bed.mp3", "tense": "music_tense.mp3", "musicVolume": 0.22}
    props["timeline"] = timeline
    props_path.write_text(json.dumps(props))
    print(f"total {t:.1f}s ({t/60:.1f} min)  temporary_voice={timeline['temporary']}")


if __name__ == "__main__":
    main()
