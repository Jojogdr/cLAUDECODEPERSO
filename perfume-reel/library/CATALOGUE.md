# ALOI library - catalogue

Built from the 7 finder runs, 2026-10. Everything lives in `library/`. Licences are copied next to the files. **Nothing was run or installed.** Rules for ALOI: free for commercial use; short bright sounds; no meme; music never ducked; black and white brand, cheeky but premium.

Sounds were decoded, high-passed where noted, peak-normalised to -3 dBFS, tail-trimmed and saved as 48 kHz stereo WAV. Gain values are per-file: set relative SFX levels in the mix (about -18 dB under the music bed per the finders, then adjust by ear). I could not listen to anything; durations and bass share (energy below 150 Hz) were measured. Full list: `previews/sounds_list.txt`.

## 1. Sound effects (`sfx/<role>/`, 114 files)

### whoosh (19)

**When:** Swipe/transition between two beats, speaker cut seam, text slide-in. Short (0.2-0.9 s), high-passed; never a bass swoosh. Prefer kn-maximize/minimize and ui-*-swipe; rz-whoosh-* are noise based, use rarely.

| file | dur s | bass | licence | origin |
|---|---|---|---|---|
| kn-maximize-1.wav | 0.26 | 0.00 | Kenney CC0 | kenney-interface-sounds/maximize_001.ogg |
| kn-maximize-3.wav | 0.21 | 0.00 | Kenney CC0 | kenney-interface-sounds/maximize_003.ogg |
| kn-maximize-5.wav | 0.53 | 0.00 | Kenney CC0 | kenney-interface-sounds/maximize_005.ogg |
| kn-maximize-7.wav | 0.18 | 0.00 | Kenney CC0 | kenney-interface-sounds/maximize_007.ogg |
| kn-minimize-2.wav | 0.26 | 0.00 | Kenney CC0 | kenney-interface-sounds/minimize_002.ogg |
| kn-minimize-4.wav | 0.42 | 0.00 | Kenney CC0 | kenney-interface-sounds/minimize_004.ogg |
| kn-minimize-6.wav | 0.38 | 0.00 | Kenney CC0 | kenney-interface-sounds/minimize_006.ogg |
| kn-minimize-8.wav | 0.23 | 0.00 | Kenney CC0 | kenney-interface-sounds/minimize_008.ogg |
| kn-switch-10.wav | 0.39 | 0.00 | Kenney CC0 | kenney-ui-audio/switch10.ogg |
| kn-switch-20.wav | 0.36 | 0.00 | Kenney CC0 | kenney-ui-audio/switch20.ogg |
| kn-switch-3.wav | 0.36 | 0.00 | Kenney CC0 | kenney-ui-audio/switch3.ogg |
| kn-switch-30.wav | 0.36 | 0.00 | Kenney CC0 | kenney-ui-audio/switch30.ogg |
| rz-whoosh-hp.wav | 0.95 | 0.00 | RezaParsian CC0 | reza-synth-sfx/whoosh_transition.wav +HP300Hz |
| rz-whoosh-short-hp.wav | 0.42 | 0.01 | RezaParsian CC0 | reza-synth-sfx/whoosh_short.wav +HP350Hz |
| ui-glass-swipe.wav | 0.61 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/swipe.mp3 |
| ui-mechanical-swipe.wav | 0.25 | 0.01 | UISFX CC0 (Yuki Capital) | uisfx-cc0/mechanical/swipe.mp3 |
| ui-minimal-swipe.wav | 0.32 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/minimal/swipe.mp3 |
| ui-soft-swipe.wav | 0.50 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/soft/swipe.mp3 |
| ui-studio-swipe.wav | 0.33 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/studio/swipe.mp3 |

### click-ui (23)

**When:** Caption/word change, tick on each cut, tap on a UI mock (WhatsApp), toggle. 10-80 ms ticks: one per caption change at most, otherwise it gets busy.

| file | dur s | bass | licence | origin |
|---|---|---|---|---|
| kn-click-1.wav | 0.10 | 0.07 | Kenney CC0 | kenney-interface-sounds/click_001.ogg |
| kn-click-2.wav | 0.01 | 0.05 | Kenney CC0 | kenney-interface-sounds/click_002.ogg |
| kn-click3.wav | 0.08 | 0.03 | Kenney CC0 | kenney-ui-audio/click3.ogg |
| kn-click4.wav | 0.04 | 0.00 | Kenney CC0 | kenney-ui-audio/click4.ogg |
| kn-click5.wav | 0.03 | 0.00 | Kenney CC0 | kenney-ui-audio/click5.ogg |
| kn-mouseclick1.wav | 0.06 | 0.00 | Kenney CC0 | kenney-ui-audio/mouseclick1.ogg |
| kn-rollover1.wav | 0.22 | 0.00 | Kenney CC0 | kenney-ui-audio/rollover1.ogg |
| kn-select-1.wav | 0.04 | 0.00 | Kenney CC0 | kenney-interface-sounds/select_001.ogg |
| kn-select-3.wav | 0.38 | 0.00 | Kenney CC0 | kenney-interface-sounds/select_003.ogg |
| kn-tick-1.wav | 0.04 | 0.00 | Kenney CC0 | kenney-interface-sounds/tick_001.ogg |
| kn-tick-2.wav | 0.02 | 0.00 | Kenney CC0 | kenney-interface-sounds/tick_002.ogg |
| kn-tick-4.wav | 0.06 | 0.03 | Kenney CC0 | kenney-interface-sounds/tick_004.ogg |
| kn-toggle-1.wav | 0.14 | 0.00 | Kenney CC0 | kenney-interface-sounds/toggle_001.ogg |
| kn-toggle-3.wav | 0.14 | 0.00 | Kenney CC0 | kenney-interface-sounds/toggle_003.ogg |
| rz-cut-tick.wav | 0.09 | 0.00 | RezaParsian CC0 | reza-synth-sfx/cut_tick.wav |
| rz-prompt-tick.wav | 0.05 | 0.00 | RezaParsian CC0 | reza-synth-sfx/prompt_tick.wav |
| rz-ui-click.wav | 0.07 | 0.02 | RezaParsian CC0 | reza-synth-sfx/ui_click.wav |
| rz-ui-double-click.wav | 0.20 | 0.00 | RezaParsian CC0 | reza-synth-sfx/ui_double_click.wav |
| ui-glass-press.wav | 0.36 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/press.mp3 |
| ui-glass-select.wav | 0.51 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/select.mp3 |
| ui-mechanical-snap.wav | 0.16 | 0.02 | UISFX CC0 (Yuki Capital) | uisfx-cc0/mechanical/snap.mp3 |
| ui-minimal-select.wav | 0.24 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/minimal/select.mp3 |
| ui-minimal-snap.wav | 0.15 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/minimal/snap.mp3 |

### pop (9)

**When:** Sticker or badge popping in, emoji reaction, number landing. Soft and short.

| file | dur s | bass | licence | origin |
|---|---|---|---|---|
| kn-pluck-1.wav | 0.10 | 0.00 | Kenney CC0 | kenney-interface-sounds/pluck_001.ogg |
| kn-pluck-2.wav | 0.16 | 0.00 | Kenney CC0 | kenney-interface-sounds/pluck_002.ogg |
| rz-pop-bubble.wav | 0.13 | 0.00 | RezaParsian CC0 | reza-synth-sfx/pop_bubble.wav |
| ui-glass-badge.wav | 1.06 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/badge.mp3 |
| ui-glass-reaction.wav | 0.64 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/reaction.mp3 |
| ui-minimal-badge.wav | 0.61 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/minimal/badge.mp3 |
| ui-minimal-reaction.wav | 0.34 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/minimal/reaction.mp3 |
| ui-soft-badge.wav | 0.95 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/soft/badge.mp3 |
| ui-soft-reaction.wav | 0.52 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/soft/reaction.mp3 |

### card-paper (14)

**When:** Document, certificate, box papers or banknote slide at the price reveal or when a card of text enters. High-passed at 200 Hz (paper sounds are mid-low).

| file | dur s | bass | licence | origin |
|---|---|---|---|---|
| kn-card-place-2.wav | 0.46 | 0.01 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/card-place-2.ogg +HP200Hz |
| kn-card-place-3.wav | 0.88 | 0.02 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/card-place-3.ogg +HP200Hz |
| kn-card-place-4.wav | 0.60 | 0.03 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/card-place-4.ogg +HP200Hz |
| kn-card-shove-1.wav | 0.77 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/card-shove-1.ogg +HP200Hz |
| kn-card-shove-2.wav | 0.77 | 0.01 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/card-shove-2.ogg +HP200Hz |
| kn-card-shove-3.wav | 0.69 | 0.01 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/card-shove-3.ogg +HP200Hz |
| kn-card-slide-4.wav | 0.46 | 0.02 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/card-slide-4.ogg +HP200Hz |
| kn-card-slide-7.wav | 0.64 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/card-slide-7.ogg +HP200Hz |
| kn-card-slide-8.wav | 0.67 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/card-slide-8.ogg +HP200Hz |
| kn-pack-open-1.wav | 0.94 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/cards-pack-open-1.ogg +HP200Hz |
| kn-pack-open-2.wav | 0.73 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/cards-pack-open-2.ogg +HP200Hz |
| kn-pack-takeout-1.wav | 0.49 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/cards-pack-take-out-1.ogg +HP200Hz |
| kn-pack-takeout-2.wav | 0.63 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/cards-pack-take-out-2.ogg +HP200Hz |
| rz-swipe-paper.wav | 0.30 | 0.00 | RezaParsian CC0 | reza-synth-sfx/swipe_paper.wav +HP200Hz |

### money (20)

**When:** Price lands (chips-stack/collide = bright clack), purchase/checkout/reward = price reveal, confirm/notif-ding = WhatsApp CTA. No real cash register in the library: layer coin-ping + chip clack + card slide.

| file | dur s | bass | licence | origin |
|---|---|---|---|---|
| kn-chip-lay-1.wav | 0.17 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/chip-lay-1.ogg |
| kn-chip-lay-2.wav | 0.23 | 0.01 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/chip-lay-2.ogg |
| kn-chips-collide-1.wav | 0.26 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/chips-collide-1.ogg |
| kn-chips-collide-2.wav | 0.23 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/chips-collide-2.ogg |
| kn-chips-stack-1.wav | 0.28 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/chips-stack-1.ogg |
| kn-chips-stack-2.wav | 0.17 | 0.00 | Kenney CC0 (via Mcamento8 mirror) | kenney-casino-audio/chips-stack-2.ogg |
| kn-confirm-1.wav | 0.29 | 0.00 | Kenney CC0 | kenney-interface-sounds/confirmation_001.ogg |
| kn-confirm-2.wav | 0.54 | 0.00 | Kenney CC0 | kenney-interface-sounds/confirmation_002.ogg |
| rz-coin-ping.wav | 0.56 | 0.00 | RezaParsian CC0 | reza-synth-sfx/coin_ping.wav |
| rz-notif-ding.wav | 0.85 | 0.00 | RezaParsian CC0 | reza-synth-sfx/notification_ding.wav |
| rz-success-chime.wav | 1.50 | 0.00 | RezaParsian CC0 | reza-synth-sfx/success_chime.wav |
| ui-glass-add-to-cart.wav | 0.75 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/add-to-cart.mp3 |
| ui-glass-checkout.wav | 0.95 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/checkout.mp3 |
| ui-glass-coupon.wav | 0.80 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/coupon.mp3 |
| ui-glass-purchase.wav | 0.96 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/purchase.mp3 |
| ui-glass-reward.wav | 0.90 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/reward.mp3 |
| ui-glass-success.wav | 1.03 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/glass/success.mp3 |
| ui-minimal-checkout.wav | 0.54 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/minimal/checkout.mp3 |
| ui-minimal-purchase.wav | 0.55 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/minimal/purchase.mp3 |
| ui-minimal-reward.wav | 0.51 | 0.00 | UISFX CC0 (Yuki Capital) | uisfx-cc0/minimal/reward.mp3 |

### watch-mech (12)

**When:** Hands-only shots: tick loops (4 Hz = one tick per 250 ms), metal-light = clasp / case click, lock/unlock = bracelet, crown. No real mechanical-watch recording exists in the library.

| file | dur s | bass | licence | origin |
|---|---|---|---|---|
| kn-metal-light-0.wav | 0.37 | 0.02 | Kenney CC0 (via mirror) | kenney-impact-sounds/impactMetal_light_000.ogg |
| kn-metal-light-1.wav | 0.25 | 0.03 | Kenney CC0 (via mirror) | kenney-impact-sounds/impactMetal_light_001.ogg |
| kn-metal-light-2.wav | 0.23 | 0.02 | Kenney CC0 (via mirror) | kenney-impact-sounds/impactMetal_light_002.ogg |
| kn-metal-light-3.wav | 0.48 | 0.01 | Kenney CC0 (via mirror) | kenney-impact-sounds/impactMetal_light_003.ogg |
| own-tick-loop-4hz-6s.wav | 5.77 | 0.00 | ours (derived CC0 / synthesised) | generated from kenney tick_002 |
| own-tick-loop-8hz-4s.wav | 3.92 | 0.00 | ours (derived CC0 / synthesised) | generated from kenney tick_004 pitched |
| rz-ratchet.wav | 0.50 | 0.00 | RezaParsian CC0 | reza-synth-sfx/scroll_ratchet.wav |
| rz-tick-single.wav | 0.09 | 0.00 | RezaParsian CC0 | reza-synth-sfx/countdown_tick_single.wav |
| ui-mech-lock.wav | 0.26 | 0.30 | UISFX CC0 (Yuki Capital) | uisfx-cc0/mechanical/lock.mp3 |
| ui-mech-press.wav | 0.16 | 0.07 | UISFX CC0 (Yuki Capital) | uisfx-cc0/mechanical/press.mp3 |
| ui-mech-toggle-on.wav | 0.24 | 0.04 | UISFX CC0 (Yuki Capital) | uisfx-cc0/mechanical/toggle-on.mp3 |
| ui-mech-unlock.wav | 0.34 | 0.03 | UISFX CC0 (Yuki Capital) | uisfx-cc0/mechanical/unlock.mp3 |

### shutter-glass (11)

**When:** Photo cut (camera-shutter), watch-glass tink (kn-impact-glass), sparkle on the dial (kn-glass).

| file | dur s | bass | licence | origin |
|---|---|---|---|---|
| kn-glass-1.wav | 0.28 | 0.01 | Kenney CC0 | kenney-interface-sounds/glass_001.ogg |
| kn-glass-2.wav | 0.12 | 0.01 | Kenney CC0 | kenney-interface-sounds/glass_002.ogg |
| kn-glass-3.wav | 0.12 | 0.04 | Kenney CC0 | kenney-interface-sounds/glass_003.ogg |
| kn-glass-4.wav | 0.69 | 0.00 | Kenney CC0 | kenney-interface-sounds/glass_004.ogg |
| kn-glass-5.wav | 0.13 | 0.00 | Kenney CC0 | kenney-interface-sounds/glass_005.ogg |
| kn-glass-6.wav | 0.13 | 0.00 | Kenney CC0 | kenney-interface-sounds/glass_006.ogg |
| kn-impact-glass-0.wav | 0.23 | 0.01 | Kenney CC0 (via mirror) | kenney-impact-sounds/impactGlass_light_000.ogg |
| kn-impact-glass-2.wav | 0.21 | 0.02 | Kenney CC0 (via mirror) | kenney-impact-sounds/impactGlass_light_002.ogg |
| kn-impact-glass-4.wav | 0.21 | 0.01 | Kenney CC0 (via mirror) | kenney-impact-sounds/impactGlass_light_004.ogg |
| rz-camera-shutter.wav | 0.32 | 0.03 | RezaParsian CC0 | reza-synth-sfx/camera_shutter.wav |
| rz-impact-bright.wav | 0.55 | 0.00 | RezaParsian CC0 | reza-synth-sfx/impact_bright.wav |

### riser (6)

**When:** 1-2.5 s build before the price or the key word; drop music/price on the last frame. Our own synthesised risers are thin and bass free.

| file | dur s | bass | licence | origin |
|---|---|---|---|---|
| own-riser-0.8s.wav | 0.73 | 0.00 | ours (derived CC0 / synthesised) | synthesised (numpy) |
| own-riser-1.5s.wav | 1.37 | 0.00 | ours (derived CC0 / synthesised) | synthesised |
| own-riser-2.5s.wav | 2.28 | 0.00 | ours (derived CC0 / synthesised) | synthesised |
| rz-riser-tension.wav | 2.60 | 0.05 | RezaParsian CC0 | reza-synth-sfx/riser_tension.wav |
| rz-sparkle-magic.wav | 1.70 | 0.00 | RezaParsian CC0 | reza-synth-sfx/sparkle_magic.wav |
| rz-text-reveal.wav | 0.34 | 0.00 | RezaParsian CC0 | reza-synth-sfx/text_reveal_soft.wav |

Licences: `sfx/_licenses/` (Kenney CC0 text, UISFX CC0 LICENSE-AUDIO, Reza CC0). Kenney Casino and Impact packs come through the Mcamento8 mirror, whose ATTRIBUTION.md says CC0 on the kenney.nl pack pages; I could only read the Kenney text for the Interface and UI packs. Own-generated files (own-*) are ours.

**Not kept:** LokiF GUI (padded to 1.7-3.4 s, very quiet, no licence file on disk), e3ntity/react-sounds (sound provenance unknown), halal-sound-effects (no licence), the meme and heavy files, rewind_sweep/logo_sting/type_burst (bass share 0.4-0.8).

## 2. Lottie (`lottie/`, 54 files)

| folder | what | licence | when |
|---|---|---|---|
| `ui-icons-useanimations/` (26) | 32 px monoline UI icons: check, checkCircle, arrows, dollarSign, clock, watch, mapPin, notification, trendingUp/Down, shoppingBag, creditCard, tag, gift, mousePointer, send, phone, messageCircle, star, award, zap, target, lock/unlock, heart, thumbUp | MIT (repo LICENSE, copied). Per-icon authorship not stated by the repo: low risk, noted | Animated check on the WhatsApp CTA, arrow toward the price, trendingDown for a price drop. Render large with @remotion/lottie, recolour white/black. Sober only. |
| `reactions-noto-CCBY-credit-required/` (28) | Google Noto animated emoji, 1024 px, 60 fps: money-with-wings, eyes, fire, gem, crown, hundred, clap, point-down/right/up, hourglass, alarm-clock, smirk, shushing, mind-blown, trophy, chart-up, ring, coin, party-popper... | **CC BY 4.0, credit required: "Google Noto Emoji animations, CC BY 4.0"** (put in the description/caption). The licence text was NOT readable in-session (finder note); verify before client delivery. | Funny reaction sticker (eyes on a hook, money-with-wings on the price). Colourful: use at most 1 per reel, grayscale CSS filter possible. Rejected from the set: money-mouth, clown, skull, crying, etc. (kitsch). |

No free Lottie of banknotes/coins/hand-drawn arrows was found on GitHub. Use our own animation of the Fluent SVG banknotes (section 4) and remocn ink-arrow/scribble-circle (section 5). Meteocons (weather) and svg-spinners (SMIL, not frame-deterministic) were not kept.

## 3. Overlays (`overlays/<type>/`)

| folder | what | licence | when |
|---|---|---|---|
| `sprites-sparks/`, `sprites-light-flares/`, `sprites-smoke-dust-scratch/`, `sprites-bokeh-circles/` (21 PNG) | Kenney Particle Pack, white on alpha: spark, star, flare, light, magic, twirl, smoke, scratch, dirt, circle | CC0 | Build particle emitters in React (screen/add blend, tint white or champagne): sparkle on the dial, smoke wipe, bokeh behind the speaker. Fire/flame/muzzle sprites deliberately left out (kitsch). |
| `own-video-loops/` (3 MP4 + 1 PNG) | Generated by us: film-grain loop, dust+scratches loop, diagonal light sweep, vignette PNG (alpha). 540x960, black base | ours, no third-party content | grain: `soft-light` 10-20 %; dust: `screen` 15-30 %; sweep: `screen` on the watch glass or on the price card; vignette on top. Scale to 1080x1920. |
| `shader-sources-glsl/` (4 packs, ESM) | glsl-film-grain (GLSL), pixi old-film (scratches/dust/flicker), godray, advanced-bloom | MIT, LICENSE next to each | Port the GLSL into our WebGL component. Keep sepia off. Needs inlining glsl-noise for the grain. Not tested. |

Not copied: `@remotion/light-leaks` (Remotion licence, already in the 4.0.535 family, test it directly in the project), LYGIA (non-commercial/patron licence), toast-effects-dump (no licence, scraped media, rejected), p5.grain texture and noise3000 (too small/unclear, not worth it). No real light-leak or film-burn footage was found with a clean licence: use @remotion/transitions film-burn / light-leak transitions or our sweep.

## 4. Stickers (`stickers/<theme>/`, about 100 files)

| folder | count | what | licence | when |
|---|---|---|---|---|
| `money-price-fluent3d-png256/` | 8 | money_with_wings, dollar/euro banknote, money_bag, coin, credit_card, label, dollar sign | MIT Microsoft (file inside) | Cheeky accent on the price reveal. 256 px PNG, keep under ~300 px on the 1080x1920 canvas. |
| `watch-time-fluent3d-png256/` | 6 | watch, stopwatch, hourglass x2, alarm_clock, calendar | MIT | "Delivery in 24 h", "only one left" beats. |
| `luxury-fluent3d-png256/` | 7 | gem, crown, ring, key, trophy, glowing_star, sparkles | MIT | Rarely; the 3D look is colourful, desaturate (CSS grayscale) to stay in the B&W brand. |
| `reactions-fluent3d-png256/` | 11 | eyes, fire, 100, exploding_head, smirking, shushing, star-struck, thinking, collision, rolling_eyes, party_popper | MIT | The funny/cheeky layer: smirk on a price, eyes on the hook. Max one per 4 s. |
| `cta-pointers-fluent3d-png256/` | 11 | pointing hand down/right/at viewer, arrows, telephone, speech_balloon, check, cross, exclamation, package | MIT | Point at the price or the WhatsApp button. |
| `money-watch-vector-fluent-flat/` | 6 SVG | coin, dollar/euro banknote, money_bag, watch, gem (flat vector) | MIT | Large or animated (our own banknote rain, strokes, recolour to B&W). |
| `icons-line-lucide/` | 31 SVG | watch, clock, banknote, coins, gem, crown, badge-check, shield-check, truck, tag, arrows... | ISC | Apple-style code motions, stroke-dashoffset draw-on. Main premium B&W set. |
| `icons-solid-phosphor/` | 21 SVG | watch, stopwatch, coin, diamond, crown, seal-check, hand-pointing, medal, trophy... (fill weight) | MIT | Solid black/white badges (authentic seal, price tag). |

Preview: `previews/stickers_contact_sheet.png` (3D PNG only). Rejected: OpenMoji (CC BY-SA, share-alike risk for client videos), Mega Doodles (CC BY-SA), handy-arrows (no licence), 3dicons (CDN blocked), Tabler (only needed as spare, left in lib_find).

## 5. Remotion components (`remotion/<component>/`, 65 folders)

Source code to read and adapt, not to run blindly (never installed). All MIT, LICENSE in each folder. They need our restyle (B&W, no demo defaults) and `remocn-lib` / `ui-lib` helpers (remocn imports `@/lib/customizer-config`).

| group | folders | use |
|---|---|---|
| Captions | remocn-caption-karaoke/-word-pop/-active-pop/-highlight-box/-stamp/-core, ui-karaoke-captions, ui-word-pop-captions, ui-scene-caption-scene | Word-by-word captions with accent word and ~4-frame pop. |
| Price / numbers | remocn-number-wheel/-rolling-number/-hand-count/-value-swap/-strikethrough-replace, ui-counter, ui-slot-roll, ui-scene-pricing-card, ui-scene-stat-card | Price count-up and strike-through old price. |
| Callouts | remocn-ink-arrow/-ink-underline/-scribble-circle/-marker-highlight, ui-arrow-annotate, ui-badge-stamp, ui-handwriting-text, ui-scene-callout-spotlight | Hand-drawn circle/underline on the price and key words (fills the missing doodle pack gap). |
| Motion/transition | remocn-whip-pan/-zoom-blur/-lens-zoom/-glitch-cut/-sheen-slide-in/-shimmer-sweep, ui-transition-whip-pan/-light-leak/-circle-reveal, ui-light-sweep-text, ui-depth-of-field-blur | Cuts and sheens. Pair each with an SFX on the same frame. |
| Text kinetic | remocn-staggered-fade-up/-per-character-rise/-kinetic-center-build/-zoom-words/-word-push/-spring-scale-in/-mask-reveal-up, ui-tracking-in, ui-shake-emphasis, ui-squash-stretch | Apple-style text motion. |
| Scenes | ui-scene-hook-card/-lower-third/-talking-head-layout/-end-card/-notification-stack/-reaction-burst, ui-voice-note-bubble, ui-progress-bar | Closest to the woman-talking structure: hook card at 0-2 s, end card with price and CTA, WhatsApp-like notification/voice-note. |
| Decor | remocn-confetti/-speed-lines/-paper-sticker/-polaroid, ui-confetti-burst | Use sparingly (confetti = kitsch risk). |

Not copied: remotion-bits (package.json says MIT but no LICENSE file; install from npm if wanted), remotion-animated (install from npm), remotion-animate-text, @remotion/transitions and light-leaks (Remotion licence: free up to 3 people, otherwise company licence; check which applies to us), Remocn shader backgrounds (paper-design dependency; look later for B&W loops).

## 6. Behind the body (`behind/`) - recommended pipeline

Files: `models/rvm_mobilenetv3_fp32.onnx` (15 MB), `models/modnet_photographic.onnx` (26 MB), licence files, `notes/` (bench script, RVM/MODNet visual comparison, ffmpeg sticker-stroke + halo test).

**Licence flag.** RVM is **GPL-3.0** (code and weights). Using it internally to produce mattes is already our practice and the output frames are not GPL, but do not ship or redistribute it. MODNet is Apache-2.0 (clean fallback, slower, needs temporal smoothing). Rejected: BiRefNet/rembg models for video (too heavy on CPU, up to 970 MB), bria-rmbg-2.0 (CC BY-NC), MatAnyone/SplazMatte (research licences).

1. Keep RVM mobilenetv3 fp32 on CPU with the recurrent state carried across frames, `downsample_ratio` 0.25 at 1080x1920 (measured about 170 ms/frame, 4 threads, about 2.5 min for 30 s), 0.375 only for flying hair (about 300 ms). MODNet measured 258-504 ms/frame at smaller size, so 2-3x slower. Measured on one still only: re-test on real ALOI footage before switching anything.
2. Do not give Remotion a hard mask. Write an RGBA foreground (colour x alpha), erode alpha 1 px, blur 0.5-0.8 px, 3-frame EMA on alpha, encode transparent VP9 webm (yuva420p) once per take.
3. Remotion layers: background (blurred wall or graphic), text/objects, speaker webm on top. The same alpha gives text behind, white sticker outline (dilate alpha 6-10 px, tested in `notes/sticker_halo_test.png`), halo (blur sigma about 30), room blur (blur only the background), object passing behind then in front.
4. Clean plate: not solved cheaply. Static camera: median of frames where alpha=0, else blurred wall or graphic background.
5. Optional on key frames only: pymatting foreground estimation to remove colour spill at hair edges (not verified licence: MIT per search snippet).
6. Cache alpha per take; cost per video = matte time + Remotion render.

## 7. Skills / rule files (`skills/<repo>/`)

All MIT (LICENSE inside each folder), except video-edit-skill (Apache-2.0). Copied only markdown: video-agent-skills (style, hooks, script rules, humanize), autonomous-shortform-facecam-editing (SKILL + audio-mix, card archetypes, storyboard schema, gotchas, brand tokens), reelsmith (short-form, review rubric, a brand guideline example), video-edit-skill (editing rules, safe zones, QA, looks, motion-graphics), short-form-edit (L-cut). Not kept: ai-orchestrators/video-editing-suite and BusyBee3333/viral-video-edit-skills (low value, music-edit oriented), krusemedia/video-editor-agent (no licence, not copied). None covers luxury or watch rules: the ALOI tone and B&W brand file still has to be written by us. Their SFX kits depend on paid ElevenLabs/HyperFrames: take rules, not code.

### The 15 most useful editing rules
1. Cut every pause longer than 0.35 s (keep 0.10 s lead and 0.15 s tail, 2-frame audio fade at each cut); end 0.3 s after the last word. (video-agent-skills style.md)
2. The first kept word is the first word of the hook; first frame must be full, no fade-in. (video-agent-skills, facecam skill)
3. Hook in the first 2 s, written as 3 hooks from 3 formulas (pain / claim / number), then scored; pick one. (hooks.md, script-rules.md)
4. On-screen hook: 6 words or fewer, adds to the spoken hook, never repeats it.
5. Punch-in alternating 1.0 / 1.12 at every cut; pieces under 0.8 s keep the previous framing. (hides the jump cut)
6. Safe zone 1080x1920: text between y 230 and 1440, and nothing right of x 850 below y 900 (platform buttons). The other finder says 220 px top, 420 px bottom, 48 px sides: use the stricter of both.
7. Captions: 1-3 words at a time, active word in the accent colour, ~4-frame pop from 0.85 to 1; caption never over the mouth.
8. Callout = one number or word every 8-10 s, never two within 4 s, only repeats what is said.
9. Storyboard as JSON: one beat per sentence, a visual mode change at every cut seam.
10. Every spoken number becomes a count-up (price included); 1-2 full-screen takeovers at most; the last 3 s are the CTA.
11. L-cuts: let the previous clip's audio run 3-6 frames into the next shot so cuts sound human.
12. SFX tied to exact words, one per event, per-event gain table (pop 0.32, whoosh 0.30, stamp/impact 0.50, ticks 0.42, ding 0.36). Do not put an SFX on every card (the client wants few, short, bright sounds).
13. Loudness: voice -14 LUFS / peak -2 dBFS (video-agent-skills) or -16 LUFS / TP <= -0.5 (facecam); pick one target and check the final file.
14. Music bed 18-20 dB under the voice with fixed gain (client rule: never ducked, so set it once in the mix), fade out 1.6 s at the end, no fade-in.
15. QA before delivery: render a contact sheet of frames plus a loudness/true-peak check and a graded review (reelsmith-review rubric); redo takes by matching transcript against the script to remove retakes.

## 8. Gaps still open
- No real watch-movement tick, crown winding, clasp, banknote flip or cash-register recording (we have synthetic ticks and Kenney chip/metal clacks). Record our own at the shop: 10 minutes covers it.
- No clean light-leak/film-burn footage, no banknote-rain Lottie, no hand-drawn doodle pack (replaced by remocn ink-* components and our own overlays).
- Noto Lottie licence text not verified in-session; Kenney Casino/Impact CC0 confirmed only through the mirror.
- Nothing was listened to or rendered in Remotion: test by ear and on screen before the first client delivery.
