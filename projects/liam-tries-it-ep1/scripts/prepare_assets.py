"""Prepare assets for "Liam Tries It" Ep. 1 (deterministic; safe to re-run).

1. public/liam.png  - the owner's Liam image with the white background made transparent
                      (flood fill from the border only, so nothing inside Liam changes),
                      upscaled 3x with Lanczos for 1080p. No redrawing.
2. public/sfx/*.wav - simple sound effects synthesised here (no downloads):
                      ding, tink, roll, whoosh, creak, pop, thud.

Usage (repo root): .venv/bin/python projects/liam-tries-it-ep1/scripts/prepare_assets.py
"""
from __future__ import annotations

import wave
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parents[1]
SRC_LIAM = REPO / "studio" / "characters" / "liam-reference.png"
SR = 48000


def make_liam() -> None:
    im = Image.open(SRC_LIAM).convert("RGBA")
    w, h = im.size
    px = im.load()

    def is_bg(p):  # near-white
        return p[0] > 236 and p[1] > 236 and p[2] > 236

    seen = np.zeros((h, w), dtype=bool)
    q = deque([(x, 0) for x in range(w)] + [(x, h - 1) for x in range(w)] + [(0, y) for y in range(h)] + [(w - 1, y) for y in range(h)])
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y, x]:
            continue
        seen[y, x] = True
        if not is_bg(px[x, y]):
            continue
        px[x, y] = (255, 255, 255, 0)
        q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    # soften the 1px fringe where white background met the black outline
    alpha = im.getchannel("A").filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.6))
    im.putalpha(alpha)
    bbox = im.getbbox()
    im = im.crop(bbox)
    big = im.resize((im.width * 3, im.height * 3), resample=Image.LANCZOS)
    big = big.filter(ImageFilter.UnsharpMask(radius=1.4, percent=60, threshold=2))
    out = ROOT / "public" / "liam.png"
    big.save(out)
    print("liam.png", big.size, "from", SRC_LIAM.name, im.size)


def write_wav(name: str, x: np.ndarray) -> None:
    x = np.clip(x / (np.max(np.abs(x)) + 1e-9) * 0.8, -1, 1)
    data = (x * 32767).astype(np.int16)
    with wave.open(str(ROOT / "public" / "sfx" / f"{name}.wav"), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(data.tobytes())


def t(sec: float) -> np.ndarray:
    return np.arange(int(SR * sec)) / SR


def env(n: int, attack: float, decay: float) -> np.ndarray:
    tt = np.arange(n) / SR
    return np.minimum(1, tt / max(attack, 1e-4)) * np.exp(-tt / decay)


def make_sfx() -> None:
    rng = np.random.default_rng(7)  # fixed seed: identical files every run
    # coin "ding": bright bell partials
    tt = t(0.9)
    ding = sum(a * np.sin(2 * np.pi * f * tt) for f, a in [(1568, 1), (3136, 0.5), (4704, 0.25), (2350, 0.3)]) * env(len(tt), 0.002, 0.22)
    write_wav("ding", ding)
    # small "tink" for a single coin
    tt = t(0.4)
    write_wav("tink", sum(a * np.sin(2 * np.pi * f * tt) for f, a in [(2637, 1), (5274, 0.4)]) * env(len(tt), 0.001, 0.07))
    # coin rolling: rattling clicks slowing down
    tt = t(1.4)
    rate = 26 - 16 * tt / tt[-1]
    phase = np.cumsum(rate) / SR
    clicks = (np.sin(2 * np.pi * phase) > 0.97).astype(float)
    roll = np.convolve(clicks, np.exp(-np.arange(200) / 30), mode="same") * np.sin(2 * np.pi * 3200 * tt)
    write_wav("roll", roll * np.linspace(1, 0.2, len(tt)))
    # whoosh: band-passed noise with a rising-falling sweep
    tt = t(0.55)
    noise = rng.standard_normal(len(tt))
    k = np.exp(-((np.arange(-60, 61)) / 18.0) ** 2)
    w = np.convolve(noise, k / k.sum(), mode="same") - np.convolve(noise, np.ones(400) / 400, mode="same")
    write_wav("whoosh", w * np.sin(np.pi * tt / tt[-1]) ** 2)
    # door creak: wobbling sawtooth friction + grit
    tt = t(1.3)
    f0 = 170 + 60 * np.sin(2 * np.pi * 1.7 * tt) + 40 * tt
    ph = np.cumsum(f0) / SR
    saw = 2 * (ph % 1) - 1
    grit = (rng.random(len(tt)) > 0.985).astype(float)
    creak = (saw * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * tt)) + 0.5 * grit) * np.sin(np.pi * tt / tt[-1]) ** 0.6
    write_wav("creak", creak)
    # pop: short pitch-drop blip
    tt = t(0.18)
    write_wav("pop", np.sin(2 * np.pi * np.cumsum(900 - 3500 * tt) / SR) * env(len(tt), 0.002, 0.05))
    # thud: low sine knock
    tt = t(0.5)
    write_wav("thud", np.sin(2 * np.pi * np.cumsum(120 - 120 * tt) / SR) * env(len(tt), 0.003, 0.12))
    print("sfx written")


if __name__ == "__main__":
    make_liam()
    make_sfx()
