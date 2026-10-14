---
name: reel-montage
description: Edit a talking-head video (luxury watches, perfume, any product review) into a 20–30 s vertical Reel/TikTok in the client's style — word-by-word captions, one emphasis block at a time, wall-only background replacement with words behind the speaker, product cutaways, GL transitions with flash + SFX on the same frame, the client's SFX bank, music drop on the key word. Use whenever the user sends a raw talking-head video (+ product photos / b-roll) and asks for a montage / reel / TikTok edit.
---

# Reel montage (Remotion EDL engine)

Everything lives in `perfume-reel/` (Remotion 4.0.535, React 18). One generic composition renders any **EDL** (edit decision list, `src/engine/types.ts`); a new video = a new `edl/<id>.json` (+ `edl/<id>.post.json` for GL transitions) + assets. `edl/ebene_v8.json` is the reference example — copy its structure.

## Hard rules (client)
- **Style**: centred word-by-word captions (1–2 words, Inter 700, y≈1110). On key beats replace the caption with ONE centred block: small lead-in + HUGE HEAVY WORD (Inter 900, often with a period) or small + gold italic serif (Playfair) + small. One text element on screen at a time. No kitsch: no particles/sparkles, no stamps, no camera shake, no bouncing, no HUD typewriters, no pastel swatch pages, no slider bars.
- **Background**: only the **wall behind the speaker** may be replaced (`scripts/rvm_wall.py`); bed/desk/what she sits on stays real. Use it 3–5 times max (hook, 2–3 adjectives, the climax). Words on the wall sit behind her hair (depth).
- **Zooms**: one snap speed (0.12–0.15 s, ease-out) and one slow push rate (≈0.035/s). ~1 zoom change per beat, never random.
- **Transitions**: ≤ 1 GL transition per 2 cuts, never the same type twice in a row, a signature one reused (CrossZoom). Each = motion + light (flash/leak) + SFX on the same frame. Other cuts are hard cuts on the beat.
- **Sound** (README in `public/sfx_bank/`): music at a FIXED level (never ducked); few sounds, only on visible actions; short bright interface sounds, no useless bass, no memes (fahh, dexter, taco-bell). Levels are set relative to the voice by `mix_sfx.py` (−22…−27 dB rel). Final loudness −14 LUFS / −1 dBTP.
- **Length**: 20–25 s. Hook must stop the scroll in < 1 s (strongest claim first, frame 0 already moving, text readable by frame 6).
- **Budget**: never spend paid credits (Higgsfield, etc.) without an explicit quote + approval. Don't fan out many agents; render only when the EDL validates.

## Pipeline (commands from `perfume-reel/`)
1. **Intake** — put the raw video in `jobs/<id>/raw.mov`, product photos in `public/img/<id>/`, b-roll in `public/broll/`. Grade + upscale to 1080×1920/30 fps:
   `ffmpeg -i raw -vf "scale=1080:1920:flags=lanczos,hqdn3d=1.5:1.5:4:4,unsharp=5:5:0.7,curves=master='0/0.015 0.25/0.22 0.5/0.5 0.8/0.82 1/0.98',eq=saturation=1.03,vignette=PI/6" -r 30 graded_full.mp4`
2. **Transcribe** — `node scripts/transcribe.mjs <audio.wav> french > words.json` (Whisper base via `sts-whisper-base`, word timestamps), then snap word starts to real onsets (`scripts/align.py` pattern: RMS onsets after ≥100 ms of silence, ±0.3 s).
3. **Write the cut (Claude judgement)** — pick the 20–25 s story: HOOK (strongest claim/paradox, e.g. "les gens ne vont pas l'oublier") → product reveal → paradox/twist → 2–3 sensory/feature beats → climax word (music drop) → payoff → recommendation/CTA. Verify every cut point on silence (RMS profile at 20 ms, then re-transcribe each clip). Build `base_<id>.mp4` + `voice_<id>.wav` by concatenating segments (one ffmpeg call per segment, then concat demuxer — avoids OOM). Voice: `highpass=70,acompressor=-26dB:3:8:120:makeup=4,loudnorm=I=-16`.
4. **Matting** — for each wall window: `python3 -I scripts/rvm_wall.py <rvm_resnet50.onnx> graded_full.mp4 <src_start> <src_end> 1.5 public/wall_<x>.webm` (adapt the wall contour `PTS` to the room: the line where the wall meets the furniture). Model: `https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_resnet50_fp32.onnx` (`pip install onnxruntime scipy`).
5. **EDL** — words (re-timed to output), camera keys, walls, blocks, scenes (`title` / `media` / `cards` / `end`, all `enter/exit: "cut"` at GL points), overlays (flash on slams and the drop, grain 0.05), `sfx` cues, `music` (offset so the song's drop lands on the climax word). GL cuts in `edl/<id>.post.json` (`CrossZoom` 8–10 f, `DreamyZoom` 12–14 f, `FilmBurn` 12 f, `LinearBlur` 10 f; `flash` 0.4–0.5, `leak` 0.2–0.35).
6. **Render** — `python3 -I scripts/render_reel.py edl/<id>.json edl/<id>.post.json` → SFX stem, pass 1 (clean), frames, pass 2 (GL, `--gl=swangle`), audio mux + loudnorm → `out/<id>.mp4` (< 30 MB).
7. **QA** — contact sheet at 3 fps (`ffmpeg -vf "fps=3,scale=100:-1,tile=17x4"`), check: no text over product labels, no element hidden behind the head, captions in sync, one text element at a time, every GL cut has flash/leak + sound, loudness −14 LUFS. Fix the EDL and re-render (`--skip-pass1` if only GL cuts changed).

## SFX roles (client bank `public/sfx_bank/`, all aligned on their loudest point with `"peak"`)
| role | file |
|---|---|
| hook open | `perso/ping-iphone` (−22) |
| heavy word slam | `macos/pop` (−22) |
| serif accent / reveal | `tiktok-pack3/glass-shine` (−25), `macos/glass` (−24) |
| brand/title word | `ios18/05-interface/verrouillage-clic` (−24) |
| strike-through / "no" | `ios18/03-validation/apple-pay-echec` (−27) |
| GL transition whoosh | `uisfx/swipe-cinematic`, `swipe-dreamy`, `swipe-studio`, `swipe-glass` (CC0, −24/−25) |
| card / tag pop-in | `ui-pack/04-interface/ui-serie-b-05` (−26) |
| build into the drop | `tiktok-pack1/metallic-riser` (peak on the drop, −23) |
| flash / drop | `ios18/05-interface/obturateur` (−23) |
| product appears | `ios18/05-interface/nouveau-souvenir` (−26) |
| end / CTA | `macos/hero` (−23) |
| price / validation | `ios18/03-validation/apple-pay-succes`, `macos/tink` |
`research/sfx_catalog.json` has duration / transient / centroid / low-end per file. The bank's `ui-pack/06-transition` whooshes are missing — ask the client if real whooshes are wanted.

## Watch-specific beats
Reference + calibre/movement + case size/material + scarcity/price + CTA. Product cutaways: macro photo with a slow push + 1–2 spec tags (`tags` on a `media` scene), a number/price block (`heavy`), end card with the model name pill. Theme: steel/teal grade, gold `#C9A45C`, Bodoni Moda or Playfair for accents.

## Asset library (free for commercial use, licences next to each pack)
`perfume-reel/library/CATALOGUE.md` lists every file and when to use it in an ALOI reel.
- `public/lib/sfx/<role>/` — 119 CC0 sounds (whoosh, click-ui, pop, card-paper, money, watch-mech ticks 4/8 Hz, shutter-glass, riser) + `public/sfx_bank/cc0/` whooshes. The client bank stays first choice.
- `public/lib/lottie/` — 26 MIT monoline animated icons (check, arrows, dollar, watch) + Noto animated emoji (CC BY 4.0: credit "Google Noto Emoji animations").
- `public/lib/stickers/` — Fluent 3D emoji PNG (MIT: banknotes €/$, money with wings, watch, gem, eyes, smirk, pointing hands…) + Lucide/Phosphor icons. One sticker per beat at most; desaturate for the B&W brand when it fights the palette.
- `public/lib/overlays/` — CC0 sprites + our grain/dust/light-sweep loops; `overlays/shader-sources-glsl/` (MIT) to port into the WebGL component.
- `library/remotion/` — MIT components to restyle (price count-up, hand-drawn callouts, hook/end cards, voice-note bubble).
- `library/behind/` — matting notes: RVM mobilenetv3 at downsample 0.25 ≈ 170 ms/frame on 4 CPU (GPL-3: internal tool only, don't redistribute); MODNet as fallback. Weights are git-ignored.

## Sound and timing rules (from the research)
- SFX land 1 frame BEFORE the visual hit; one cue sheet (EDL) drives text, transitions and sounds.
- No sound on about half the cuts; never the same cue twice in a row; heavy impacts reserved for ~5 moments.
- Every text must stay readable: entrance ≤ 0.3 s, and on screen at least 0.4 s + 0.06 s per character before its exit.
- Banned looks: RGB split, camera shake, lens flares, bouncy easing, particle spam.
