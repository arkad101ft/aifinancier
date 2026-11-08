"""Generate illustrated backgrounds locally (free) with SDXL-Lightning on CPU.

Usage (repo root):
  source .venv/bin/activate
  HF_HUB_DISABLE_XET=1 python projects/finance-den-ep1/gen_images.py [scene_id ...]

Reads artifacts/image_prompts.json -> writes public/img/<id>.jpg (skips existing).
Model: SDXL base text encoders + ByteDance SDXL-Lightning 4-step UNet (OpenRAIL++,
commercial use allowed) + fp16-fix VAE.
"""
from __future__ import annotations

import json
import sys
import time
from pathlib import Path

import torch
from diffusers import AutoencoderKL, EulerDiscreteScheduler, StableDiffusionXLPipeline, UNet2DConditionModel
from huggingface_hub import hf_hub_download
from safetensors.torch import load_file

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "public" / "img"
OUT.mkdir(parents=True, exist_ok=True)

STYLE_PREFIX = "colorful detailed cartoon illustration, ink outlines, vivid full color, lush green trees, warm sunny light"
STYLE_PLAIN = "colorful detailed cartoon illustration, clean ink outlines, vivid full color, dramatic lighting"
NEGATIVE = ("trees indoors, plants indoors, monochrome, grayscale, black and white, sketch, photo, photorealistic, 3d render, blurry, lowres, "
            "text, letters, watermark, logo, deformed, close-up face")
W, H = 1344, 768   # SDXL-friendly 16:9; upscaled to 1920x1080 in the composition
STEPS = 4


def load_pipe() -> StableDiffusionXLPipeline:
    torch.set_num_threads(max(1, torch.get_num_threads()))
    base = "stabilityai/stable-diffusion-xl-base-1.0"
    dtype = torch.bfloat16
    unet = UNet2DConditionModel.from_config(base, subfolder="unet").to(dtype)
    unet.load_state_dict(load_file(hf_hub_download("ByteDance/SDXL-Lightning", "sdxl_lightning_4step_unet.safetensors")))
    vae = AutoencoderKL.from_pretrained("madebyollin/sdxl-vae-fp16-fix", torch_dtype=dtype)
    pipe = StableDiffusionXLPipeline.from_pretrained(base, unet=unet, vae=vae, torch_dtype=dtype, variant="fp16")
    pipe.scheduler = EulerDiscreteScheduler.from_config(pipe.scheduler.config, timestep_spacing="trailing")
    pipe.set_progress_bar_config(disable=True)
    return pipe


def main() -> None:
    spec = json.loads((ROOT / "artifacts" / "image_prompts.json").read_text())
    only = set(sys.argv[1:])
    pipe = None
    for item in spec["images"]:
        if only and item["id"] not in only:
            continue
        out = OUT / f"{item['id']}.jpg"
        if out.exists():
            continue
        if pipe is None:
            pipe = load_pipe()
        t0 = time.time()
        img = pipe(prompt=f"{STYLE_PLAIN if item.get('plain') else STYLE_PREFIX}, {item['prompt']}", negative_prompt=NEGATIVE, width=W, height=H,
                   num_inference_steps=STEPS, guidance_scale=0,
                   generator=torch.Generator("cpu").manual_seed(item.get("seed", 7))).images[0]
        # upscale to 1080p with a light unsharp mask (keeps the ink lines crisp)
        from PIL import ImageFilter
        img = img.resize((1920, 1097), resample=3).filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
        img.save(out, quality=92)
        print(f"{item['id']:28} {time.time() - t0:6.1f}s", flush=True)


if __name__ == "__main__":
    main()
