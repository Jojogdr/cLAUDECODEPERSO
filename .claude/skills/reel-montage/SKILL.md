---
name: reel-montage
description: Edit a talking-head video (luxury watches for ALOI, perfume, any product review) into a 20–25 s vertical Reel / TikTok / YouTube Short in the client's validated style — "cinema" (V8) or "punchline" (V14, one literal visual per punchline) or a mix — with a planche validated before every render, one master per platform, the client's own SFX bank, and the Remotion EDL engine in perfume-reel/. Use whenever the user sends a raw talking-head video (+ product photos / b-roll) and asks for a montage, reel, TikTok, Short, test variants or a platform preview.
---

# Reel montage (Remotion EDL engine)

Everything lives in `perfume-reel/` (Remotion 4.0.535, React 18, Chromium headless, CPU only). One generic composition
`Reel` renders any **EDL** (edit decision list, `src/engine/types.ts`): a new video = a new `edl/<id>.json` (+ `edl/<id>.post.json`
for WebGL transitions) + assets. **Reference EDLs**: `edl/ebene_v8.json` (cinema) and `edl/ebene_v14_ig.json` (punchline,
Instagram master; `_tt` TikTok, `_yt` Shorts). Full history, client likes/dislikes and audit: `perfume-reel/docs/RECAP_V8_V14.md`
— read it before a new edit.

## Two validated styles (mix them — not barriers, starting points)
- **Cinema (V8)** — elegant, dark/gold DA: wall behind the speaker replaced 3–5 times (flames, smoke, product photo) with ONE
  centred word behind her hair (Inter 900 caps or Playfair italic), word-by-word centred captions, full-bleed product cutaways,
  WebGL transitions (CrossZoom, DreamyZoom, FilmBurn, LinearBlur) with flash/leak + whoosh on the same frame, music drop on the
  climax word, consistent zooms (snap 0.12–0.15 s, push ≈0.035/s). Feels like a luxury ad.
- **Punchline (V14)** — the Wimbledon pique method: every joke/claim gets its own literal image within ~0.5–1 s:
  iOS notification banners dropping from the top (`fx: notifs`), a round badge next to the head (`badge`, drawn icon/photo),
  wall swap with a colour that tells the story + scan-line wipe (`walls[].enter: 'scan'`), gauge/counter (`gauge`), a symbol that
  draws itself (`fingerprint`), impact lines (`burst`), floating cards with parallax (`cards`), product cutaways, Apple-style end
  card with packshot cut-out + WhatsApp pill (`endcard`). One-line heavy caps title just under the app header (Inter Tight 900,
  tracking −0.045em), key word in italic serif accent (Instrument Serif), yass captions (word rise, key words in serif).
- For watches: V8 atmosphere + V14 punchline mechanics. Watch beats: reference (badge/caps), case/water resistance (gauge
  "ÉTANCHE 100 M"), box & papers, scarcity, price shown at the end (never spoken), WhatsApp CTA.

## Hard rules (client)
- **Planche first, always.** Before ANY full render, render 15–20 stills at the key beats and SEND the planche; render only after.
  Best: stills of `PlatformPreview` with `edl` embedded (live reel inside the real app UI) — no full render needed.
  `npx remotion bundle src/index.ts --out-dir <b>` then `npx remotion still <b> PlatformPreview <out> --frame=N --props=<preview+edl json> --scale=0.3`,
  tile with `ffmpeg -pattern_type glob -i '...' -vf "scale=216:-1,tile=6x3"`. Look at it yourself and fix before sending.
- **One master per platform** (`edl.platform`: instagram | tiktok | youtube; layout table `src/engine/ctx.ts LAYOUT`, `upY()`):
  first text line just under the app header — Instagram y ≈ 215 (header "Reels ⌄ Amis" centred at y ≈ 165), TikTok y ≈ 190
  (under "Pour toi"), Shorts y ≈ 140 (only icons top-right). Generic phone = iPhone 13 (390×844 pt, status bar 47 pt, tab bar
  83 pt → 2.523 px/pt, ~48 px cropped per side). Keep text in x 96–984 (96–900 below y 1000) and above y ≈ 1440 (TikTok bottom);
  right rail (likes…) from mid-height; @handle + caption at the bottom. No brand frame / progress bar (client: useless).
  Render only the platforms asked for (often just Instagram).
- **Text never on the face**: titles one line in the top band, in front of the speaker; captions centred (y ≈ 1180, size 52);
  face not over-zoomed (camera ≤ ~1.09, small punches); notifications max 2 visible so the eyes stay clear.
- **Readable timing**: entrance ≤ 0.3 s (letters/words stagger fast), on screen ≥ 0.4 s + 0.06 s/char, exits accelerate.
- **Wall-only replacement** (`scripts/rvm_wall.py`): the room/bed stays real; never cut out the whole person.
- **No kitsch**: no sparkles/particles, stamps, camera shake, RGB split, lens flares, bouncy easing, slider bars, pastel swatch
  pages, emoji stickers, clichés (moustache). Apple design rules for UI pieces: weight 600 headlines, tight tracking, pills,
  translucent materials, one soft shadow only on product images.
- **Sound** (client README in `public/sfx_bank/`): music at a FIXED level (never ducked); short bright interface sounds only on
  visible actions, no useless bass, no memes, never the same cue twice in a row, no sound on about half the cuts, heavy impacts
  for ~5 moments; levels relative to the voice (−22…−31 dB rel, `mix_sfx.py`, align `peak` = hit 1 frame early). Whooshes:
  `public/sfx_bank/cc0/` (CC0). Final −14 LUFS / −1 dBTP.
- **Length** 20–25 s. Hook stops the scroll in < 1 s (strongest line first, frame 0 already moving).
- **Facts**: never invent prices, sizes or claims (e.g. a photo shows 100 ml while others show 50 ml → don't print a size).
- **Budget**: the only credit cost is writing the EDL; renders, matting, variants and `--remix-audio` are free (CPU). No paid
  generation (Higgsfield…) without quote + approval; no big agent research in production.

## Pipeline (commands from `perfume-reel/`)
1. **Intake** — raw video → grade + upscale to 1080×1920/30 fps:
   `ffmpeg -i raw -vf "scale=1080:1920:flags=lanczos,hqdn3d=1.5:1.5:4:4,unsharp=5:5:0.7,curves=master='0/0.015 0.25/0.22 0.5/0.5 0.8/0.82 1/0.98',eq=saturation=1.03" -r 30 graded.mp4`
2. **Transcribe** — `node scripts/transcribe.mjs <audio.wav> french > words.json` (Whisper base, local), snap starts to onsets.
3. **Cut** 20–25 s on silences; build `base_<id>.mp4` + `voice_<id>.wav` (one ffmpeg call per segment + concat demuxer).
   Voice: `highpass=70,acompressor=-26dB:3:8:120:makeup=4,loudnorm=I=-16`.
4. **Punchline table** — for each line: time, visual (notif / badge / wall swap / gauge / symbol / cutaway / caps title), SFX.
5. **Matting** — `python3 -I scripts/rvm_wall.py <rvm_resnet50.onnx> <graded.mp4> <start> <end> <warmup> public/wall_<x>.webm`
   per wall window (adapt contour `PTS`). Model: RVM GitHub release (GPL-3, internal use only).
6. **EDL** — copy `edl/ebene_v14_ig.json` and replace words, camera, walls, types, cards, fx, scenes, sfx, music; set `platform`.
7. **Planche** (rule above) → client OK.
8. **Render** — `python3 -I scripts/render_reel.py edl/<id>.json edl/<id>.post.json` (SFX stem → pass 1 → WebGL pass 2 →
   grade + loudnorm → `out/<id>.mp4` < 30 MB). Sound-only iteration: `--remix-audio`.
9. **Preview** — copy the mp4 to `public/preview/`, `out/preview_<platform>.json`, render `PlatformPreview` (swipe-in, real
   app UI; counts are placeholders, never posted).
10. **QA** — contact sheet 3 fps, decode check, −14 LUFS, nothing under the app UI, one text element at a time.

## Engine map
- `src/engine/Reel.tsx` — camera (`camera` keys), walls (bg image/video/css, scan entrance, words behind), scenes
  (`media`, `cards`, `paper`, legacy `title`/`end`), blocks, captions (classic | `yass`), overlays (flash, leak), audio.
- `src/engine/Design.tsx` — `types` (multi-line typographic compositions: sans / serif / mono / caps, anims rise | blur | track
  | slam | type, underline, rule, scrim), `cards` (white/black floating cards, flip), `sheet` (product fiche), `YassCaptions`.
- `src/engine/Fx.tsx` — `fx`: notifs, badge (icons tie/lips/flame/drop/…), gauge, fingerprint, burst, scan, endcard,
  brand (unused now), safezone (planche guide only).
- `src/engine/GlPost.tsx` + `scripts/gl_post_frames.py` — WebGL transitions on the clean render.
- `src/engine/ctx.ts` — shared helpers + per-platform `LAYOUT` / `upY`.
- `src/preview/PlatformPreview.tsx` — Instagram / TikTok / YouTube Shorts UI (iPhone 13 geometry), swipe-in, `edl` planche mode.

## SFX roles (client bank `public/sfx_bank/`, align `peak`)
| role | file |
|---|---|
| notification | `perso/ping-iphone`, `ui-pack/01-notifications/notification-rapide`, `ios18/01-notifications/message-recu` |
| caps title / slam | `macos/pop` (−22), alternate `ios18/05-interface/verrouillage-clic` |
| serif accent / reveal | `tiktok-pack3/glass-shine` (−25), `macos/glass` (−24) |
| badge / card pop | `ui-pack/04-interface/ui-serie-b-05` (−26), `ui-pack/04-interface/interaction-simple-0x` |
| wall swap / transition | `cc0/transition-sweep`, `cc0/whoosh-pass-fast`, `cc0/whoosh-high`, `cc0/whoosh-tight`, `cc0/whoosh-pass-slow` |
| gauge / counter / typing | `cc0/type-tick` (−31, one per step), `tiktok-pack1/mac-typing` |
| card flip / page | `tiktok-pack3/changement-de-page` |
| drop | `tiktok-pack1/metallic-riser` + `ios18/05-interface/obturateur` (−23) |
| CTA | `ios18/03-validation/apple-pay-succes`, `macos/hero` |
Extra CC0 library (unused so far): `public/lib/` + `library/CATALOGUE.md` (incl. mechanical watch ticks 4/8 Hz).
