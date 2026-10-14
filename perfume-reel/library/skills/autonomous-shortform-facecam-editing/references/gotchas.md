# Les pièges (chacun a coûté du temps réel)

## HyperFrames / GSAP
- **États initiaux masqués en CSS, pas dans la timeline.** Un `fromTo(..., {immediateRender:false})` ne cache rien avant
  son début : un élément qui doit apparaître plus tard est **visible dès la frame 0** sauf s'il porte `style="opacity:0"`.
  `build.py` le fait pour chaque ligne de liste, chip, étoile, sous-titre de carte, tampon, mot de takeover, bouton CTA.
- **Frame 0 :** un tween d'entrée qui démarre à t=0 laisse la première image vide (fondu à 0). `build.py` réécrit le
  `from` de l'entrée du premier panel en `opacity:1` — la vignette/miniature de la pub est la première frame. Vérifier avec
  `snapshot --at 0,0.05` (le tween doit avoir ses accolades simples dans le JS généré : une regex qui cherche `}},{{`
  ne matche jamais — erreur réellement commise).
- **`gsap_exit_missing_hard_kill` (erreur lint) :** un `tl.to(el,{autoAlpha:0})` qui chevauche le début d'un clip doit
  être suivi d'un `tl.set`. Plus simple : ne jamais émettre de tween alpha « no-op » (split↔solo ne change pas la
  visibilité des calques) — n'émettre un `set` que quand la visibilité change vraiment.
- **`duplicate_audio_track` ×400 :** un `<audio>` par SFX sur la même piste, sans `data-duration`, chevauche « jusqu'à la
  fin ». Piste unique par hit (`data-track-index` 12+k) **et** `data-duration` = durée réelle du fichier.
- **`<video>` jamais dans un wrapper qui porte `data-start`** (`video_nested_in_timed_element`) : timer le wrapper OU la
  vidéo. La fenêtre B-roll : wrapper non timé animé en `autoAlpha`, vidéo timée.
- **Tout `<audio>` a un `id`**, sinon il n'est pas mixé (rendu muet). Jamais `crossorigin` sur un média.
- **Pas de CDN** : GSAP, polices, images, audio en local. Le renderer bloque le réseau.
- **`repeat:-1` interdit** : calculer un nombre fini (`floor(durée / cycle) − 1`, jamais `ceil`).
- **Transform CSS + tween GSAP sur la même propriété = conflit lint.** Position initiale via `top` en CSS, tween sur `y`.
- **`data-volume` vs tween `volume`** : un tween remplace la baseline ; démarrer le fade-out depuis la valeur de
  `data-volume` (`fromTo`) sinon warning `audio_volume_tween_overrides_gain`. Pas de fade-in (baseline ≠ 0).
- **Clip-path** : `tl.set` entre formes différentes (inset ↔ circle ne s'interpolent pas).
- **Couleurs des takeovers/captions** : un `color-mix(... , #fff)` délave la teinte (vert menthe grisâtre sur navy) ;
  éclaircir en gardant la chroma avec `oklch(from var(--green) 0.86 calc(c*1.15) h)` (Chrome ≥ 119).
- **Un lint error désactive les audits layout/contraste** (`0 sample(s)`) : corriger lint d'abord, puis relire `check`.
- `PRODUCER_BROWSER_GPU_MODE=hardware` sur macOS accélère nettement `check` / `snapshot` / `render`.
- Rendu ≈ 1,5-2× temps réel ; `snapshot --at` avant chaque rendu complet.

## Transcription
- whisper.cpp `-ml 1` sort des **tokens**, pas des mots (`rap` + `ide`) : un token sans espace de tête se recolle au précédent.
- Timestamps **non monotones** (mots stampés dans le désordre) ou **figés** (10 mots au même instant) : sans monotonie
  stricte, deux captions se superposent → erreur layout `content_overlap`. `words_from_whisper.py` interpole les runs
  entre ancres puis force `start[i] ≥ start[i-1] + 0,05`.
- Hallucinations de fin de prise (« Sous-titrage Société Radio-Canada », « Amara.org ») : supprimées d'office.
- Nombres « 5 000 » : fusionner en un mot insécable, sinon la coupe de caption tombe entre « 5 » et « 000 ».
- Le prompt de contexte whisper (noms propres, vocabulaire) corrige des mots réels — mais se dilue après 30 s :
  relire le transcript, corriger via `corrections.json`, garder les timestamps.
- Transcrire la **voix pré-cut** (`media/voice.wav`) : les timestamps sont directement dans la timeline finale.

## ffmpeg
- `ffmpeg` dans une boucle `while read` **avale stdin** → seule la première itération tourne. Toujours `-nostdin`.
- ffmpeg Homebrew n'a ni `drawtext` ni libass : le texte se fait dans la composition, pas en ffmpeg.
- 4K 120 fps HEVC : `-hwaccel videotoolbox` (macOS) sinon le décodage seul prend des minutes ; une seule passe avec
  `split` pour sortir bande + plein cadre + voix.
- Keyframe chaque seconde (`-g 30 -keyint_min 30 -sc_threshold 0`) sur **tous** les médias (crops, B-roll, plate).
- Ne jamais réécrire un fichier qu'un autre process lit : `remove-background` sur `band.mp4` pendant qu'un re-crop
  l'écrase → job bloqué à 0 % CPU sans erreur. D'où les copies figées `band-src.mp4`.

## Audio généré
- ~1/3 des SFX ElevenLabs reviennent quasi muets (pic −20 dB) : mesurer (`volumedetect`), régénérer avec « loud,
  punchy », normaliser tout le kit à −3 dB et retirer le silence de tête pour que le hit tombe sur le mot.
- Le music bed doit rester 18-20 dB sous la voix : mesurer sur une zone sans voix, pas au jugé.
- Pas de nom d'artiste dans le prompt musique (400).

## Cadrage
- Détection de visage Haar sur 10 frames, médiane : suffisant pour un cadrage statique ; le visage à **45 %** de la
  hauteur du crop laisse de l'air au-dessus quand l'orateur se penche.
- Recadrer depuis la **source native** (4K) et non depuis un intermédiaire, sinon le carré serré est un upscale.
- Miroir : `hflip` après le crop (les coordonnées restent celles de la source).

## Processus
- Ne jamais rendre à l'aveugle : contact sheet 8 frames + relecture visuelle à chaque changement de design.
- Un nouveau rendu = un nouveau fichier ; ne jamais écraser une version validée.
- Garder le projet régénérable (storyboard + brand + assets) : une retouche = un `build` + `render`, pas un remontage.
