# Asset Automation Plan

## Goal

Turn the asset section of `Plan.md` into something we can actually run:

- one manifest that lists the MVP assets
- one Python script that generates prompt packs and command files
- one browser-safe fallback when AI generation is blocked or delayed

## What we can automate now

The current `scripts/prompt_builder.py` tool reads `assets/manifest/mvp_assets.json` and generates:

- text prompts for image, music, SFX, and voice assets
- a PowerShell command file for Gemini image generation
- ComfyUI job payloads for the local fallback
- Freesound search queries for SFX fallback
- web placeholder specs for a playable browser prototype

## Why this shape is practical

Current source-backed path:

- Gemini image generation is available through the Gemini API image-generation docs, including `gemini-2.5-flash-image` and `gemini-3.1-flash-image-preview`, with aspect-ratio controls.
- Local ComfyUI accepts workflow submissions over `POST /prompt`, which fits a manifest-driven batch workflow.
- Comfy Cloud also has an API, but the official docs say API use there requires a subscription, so the free/local fallback should target local ComfyUI instead.
- MusicGen remains a usable local option, but the official AudioCraft docs still warn that local use needs a GPU and recommend about 16 GB of memory for the better models.
- Freesound provides token/OAuth auth plus searchable sound resources, which is a good fallback for missing SFX.

## Suggested operating model

1. Edit `assets/manifest/mvp_assets.json`.
2. Run:

```powershell
python scripts/prompt_builder.py --manifest assets/manifest/mvp_assets.json --out build/asset-kit
```

3. Use `build/asset-kit/commands/gemini_images.ps1` for cloud image generation.
4. Use `build/asset-kit/data/comfyui_image_jobs.json` with a local ComfyUI API-format workflow for fallback.
5. Use `build/asset-kit/data/freesound_sfx_queries.csv` for manual or scripted SFX retrieval.
6. Start gameplay with the generated web placeholder spec if art is not ready yet.

## Important caveats

- The Gemini command file is ready to run only after `GEMINI_API_KEY` is set.
- The ComfyUI fallback still needs one exported API-format workflow JSON from your local ComfyUI setup.
- MusicGen prompts are generated, but the local model runner is not wired in yet because that depends on the machine's GPU/toolchain.
- Generated art still needs human review before it becomes the canonical asset.

## Source links

- Google Gemini image generation docs: https://ai.google.dev/gemini-api/docs/image-generation
- ComfyUI server routes: https://docs.comfy.org/development/comfyui-server/comms_routes
- ComfyUI cloud overview: https://docs.comfy.org/development/cloud/overview
- AudioCraft / MusicGen docs: https://github.com/facebookresearch/audiocraft/blob/main/docs/MUSICGEN.md
- Freesound API docs: https://freesound.org/docs/api/
