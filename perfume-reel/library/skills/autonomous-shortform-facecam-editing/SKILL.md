---
name: autonomous-facecam-editing
description: Transformer une prise talking-head brute (une personne face caméra) en pub motion-graphics 9:16 prête pour Meta/TikTok — pré-cut des silences, recadrage serré carré + plein cadre centré visage (miroir optionnel), transcription mot-à-mot, charte volée au site, storyboard « une carte par phrase » (count-ups, listes barrées, tampons, takeovers, B-roll navigateur, CTA), captions karaoké colorées, SFX + music bed, formes crayon, variante détourée — composé et rendu avec HyperFrames. Use when the user asks for "montage pub talking-head", "Claude Edit", "motion-graphics ad from a raw take", "pub face caméra avec animations", "ad creative from my video", "packager ma prise", or shares a talking-head clip + a brand URL to turn into an ad.
---

# Talking-head → motion-graphics ad

Une prise brute, une URL de marque, du goût. Le pipeline sort une pub 1080×1920 où la vidéo joue en dessous et,
par-dessus, **une carte motion-graphics par phrase**, des captions synchronisées au mot, un count-up sur chaque nombre,
~40 hits de SFX, un music bed, une barre de progression et des zoom punches. Méthode issue du playbook « Claude Edit »
de Mr Paid Social ([references/playbook-summary.md](references/playbook-summary.md)), rendu par
[HyperFrames](https://hyperframes.heygen.com).

## Prérequis (une fois)
`node ≥ 22` · `ffmpeg`/`ffprobe` · `whisper-cli` (whisper.cpp, Homebrew) + un modèle ggml (`large-v3-turbo` conseillé) ·
`python3` + `opencv-python` (détection de visage, optionnel) · `npx hyperframes` (installé à la volée) · `npm i playwright`
dans le projet (capture du site) · `ELEVENLABS_API_KEY` (SFX + music bed, optionnel : on peut fournir son propre kit).
Lire aussi les skills HyperFrames officiels (`npx hyperframes skills update` → `/hyperframes-core`, `/hyperframes-cli`).

## Les 3 questions à poser une seule fois (puis exécuter jusqu'à un draft)
1. **Cadrage** — fenêtre vidéo carrée (défaut) ou bande 1080×840 ? miroir (selfie) ? version détourée en plus ?
2. **Mix de layouts** — défaut : split (workhorse) + solo (cercle) + fullhim (chips) + full (1-2 takeovers) + CTA.
3. **Variantes de hook** — une prise = une pub ; si la prise empile deux hooks, couper deux versions (`--cut`).
Tout le reste se décide avec le transcript sous les yeux. Ne pas demander de specs : livrer un draft et itérer.

## Le pipeline (dans cet ordre, chaque étape vérifiée avant la suivante)

```bash
SK=<dossier du skill>; P=<dossier projet>; mkdir -p $P && cd $P
```

### 1. Assets locaux
```bash
bash $SK/scripts/setup_assets.sh $P        # gsap.min.js (npm) + Tinos/Libre Franklin (Google Fonts) → assets/
```

### 2. Probe & pré-cut & crops — `prep.py`
```bash
python3 $SK/scripts/prep.py source.mp4 $P --square --mirror            # + --cut 5.68-6.76 pour une reprise, --no-cut pour garder tout
```
- Silences ≥ 0,35 s à −32 dB coupés (tête, queue, pauses) ; **reprises** : repérer d'abord les répétitions dans une
  transcription rapide de la source (`whisper-cli … -osrt`) et les passer en `--cut a-b`.
- Visage détecté (Haar, médiane sur 10 frames) → bande **carrée 1000×1000** (crop = 65 % de la hauteur source, visage à
  45 % de la hauteur) + plein cadre 9:16 (82 % de la hauteur). `--band-crop 0.6` pour plus serré, `--fy 0.5` pour
  plus d'air. Keyframe chaque seconde, H.264 CRF 18.
- Voix : passe-haut 80 Hz, débruitage léger, −16 LUFS → `media/voice.mp3` + `voice.wav` (16 kHz, pour whisper).
- **Vérifier** : extraire 3 frames de `media/band.mp4` et regarder (visage ≈ 40 % de la largeur, rien de gênant sur
  les bords, pas trop d'air au-dessus). Ajuster `--band-crop` / `--fy` / `--face cx,cy` si besoin.

### 3. Transcription mot-à-mot — `words_from_whisper.py`
```bash
python3 $SK/scripts/words_from_whisper.py $P --lang fr --prompt "noms propres, produit, vocabulaire métier" --corrections corrections.json --print
```
- Sort `media/words.json` (strictement monotone), `sentences.json`, `transcript.txt` (mots indexés `i@t`).
- **Relire le transcript en entier.** Corriger les noms de marque et termes mal entendus dans `corrections.json`
  (`[["entendu", "correct"]]`, `""` supprime) et relancer. Ne jamais réécrire le fond, seulement l'écoute.
- Un mot vraiment inconnu (nom propre inaudible) : le garder tel quel et **le signaler** à l'utilisateur.

### 4. Voler la marque — `capture_site.mjs` + `make_broll.sh` + `brand.json`
```bash
npm i playwright && node $SK/scripts/capture_site.mjs https://brand.com assets
bash $SK/scripts/make_broll.sh assets/broll/page-1080.png assets/broll hero:0:620:5 features:900:1500:5 proof:2000:2600:4
cp $SK/examples/brand.example.json brand.json   # puis remplir tokens / fonts / logo / cta / labels — voir references/brand-tokens.md
```
Regarder `assets/site-full.png` et `assets/palette.json` ; un vrai screenshot vaut mieux qu'une recréation.

### 5. Son — `make_sfx.sh`
```bash
ELEVENLABS_API_KEY=… bash $SK/scripts/make_sfx.sh assets --music 95     # kit 12 sons + bed ; ou déposer ses propres mp3 dans assets/sfx/raw puis --skip-generate
```
Lire les pics affichés : régénérer les sons < −12 dB avec « loud, punchy ». Niveaux : [references/audio-mix.md](references/audio-mix.md).

### 6. Storyboard — `storyboard.json` (le goût vit ici)
Une carte par phrase, un mode par beat. Règles de choix et champs : [references/card-archetypes.md](references/card-archetypes.md),
schéma : [references/storyboard-schema.md](references/storyboard-schema.md), point de départ : `examples/storyboard.example.json`.
- Tout nombre prononcé → `countup` (jamais un chiffre inventé). Listes → `list`/`chips`. Produit/site → `broll`/`stamp`.
  Pivot émotionnel → `takeover` (1-2 par pub). Humour → `quote`. Preuve → `proof`. 3 dernières secondes → `cta`.
- Un beat sur chaque raccord de pré-cut (`media/metadata.json → keep`), avec changement de mode.
- `punch` sur le mot le plus fort d'un beat. Mots colorés dans les textes : `*bleu*` `_rouge_` `+vert+`.

### 7. Build — `build.py`
```bash
python3 $SK/scripts/build.py $P              # → public/index.html (+ public-resolved.json) ; --cutout pour la variante détourée
```
Génère : 4 modes de cadrage, formes de fenêtre (arrondi / pilule / cercle en solo) avec bordure crayon SVG, cartes,
captions karaoké (1-3 mots, nouveau chunk à 0,45 s ou ponctuation, mots colorés via `lexicon.<lang>.json`), SFX sur les
mots exacts avec piste + durée uniques, bed avec fade-out, progress bar, zoom punches. Lire la ligne de sortie : SFX
manquants, absence de bed.

### 8. Check → snapshots → LOOK → render → verify
```bash
export PRODUCER_BROWSER_GPU_MODE=hardware      # macOS
npx hyperframes check public                   # 0 error obligatoire (sinon layout/contraste ne tournent même pas)
npx hyperframes snapshot public --frames 9     # puis OUVRIR public/snapshots/contact-sheet.jpg et regarder chaque frame
npx hyperframes render public -o out.mp4 --fps 30      # --quality draft pour itérer (≈ 2× temps réel), high pour livrer
bash $SK/scripts/qa.sh out.mp4                 # durée, résolution, loudness, contact sheet du FICHIER rendu
```
Checklist visuelle : première frame pleine (pas de fondu vide) · aucun élément visible avant son mot · takeover qui
tient dans la largeur · tampon lisible · captions jamais superposées, jamais sur le visage · fenêtre vidéo bien cadrée
dans chaque forme · CTA complet sur les 3 dernières secondes · bed inaudible sous la voix, audible dans les silences.
Un défaut vu → corriger le storyboard ou `brand.json`, `build`, `check`, `snapshot` de nouveau. Rendre seulement
quand les snapshots sont propres ; un nouveau rendu = un nouveau fichier.

### 9. Variante détourée (optionnelle)
```bash
bash $SK/scripts/remove_background.sh $P      # band-cut.webm + vert-cut.webm (u2net, lent : lancer en fond, ne pas toucher band.mp4 pendant)
python3 $SK/scripts/build.py $P --cutout && npx hyperframes check public-cutout && npx hyperframes render public-cutout -o out-cutout.mp4 --fps 30
```
Le sujet flotte sur le papier, un blob de marque pulse derrière la tête, les takeovers passent **derrière** le sujet.

### 10. Livrer
`out.mp4` + le dossier projet (brand.json, storyboard.json, assets/, media/) : toute retouche est un `build` + `render`,
pas un remontage. Annoncer : durée, nombre de cartes/captions/SFX, loudness, les mots incertains du transcript, ce qui a
été coupé (silences, reprises).

## Ce qu'un bon résultat a l'air (à comparer sur les snapshots avant de rendre)
- **Cadrage** : visage ≈ 40 % de la largeur de la fenêtre, centré, ~10 % d'air au-dessus des cheveux ; rien de parasite sur
  les bords (meubles, portes) ; en `fullhim` le visage occupe le tiers central, jamais coupé au front.
- **Frame 0** : la première carte est pleine (pas de fondu), la fenêtre vidéo et la barre de progression sont là.
- **Cartes** : une carte visible à t + 0,5 s de chaque beat ; aucun élément n'apparaît avant son mot ; aucun texte ne sort
  de son panel ; le count-up affiche sa valeur finale ≥ 1 s avant la fin du beat ; le takeover tient dans la largeur.
- **Captions** : une seule pilule à la fois, 1-3 mots, jamais sur le visage ni sur une carte ; les mots d'argent sont colorés
  (rouge coût / vert gain / bleu CTA) sans que toute la phrase le soit.
- **Formes** : la fenêtre change de forme entre deux beats split (arrondi ↔ pilule), cercle en solo, bordure crayon nette.
- **Rythme** : changement de mode toutes les 2-4 phrases, chaque raccord de pré-cut tombe sur un changement de mode, un
  takeover par tiers de vidéo maximum, zoom punch sur le mot fort.
- **CTA** : logo + titre + bouton + flèche visibles sur les 3 dernières secondes, bouton qui pulse.
- **Son** : voix −16 LUFS, bed inaudible sous la voix et audible dans les silences, hit sur chaque carte/ligne, pas de clip
  (TP ≤ −1 dBTP dans `qa.sh`).
Si un point échoue : storyboard (temps, textes, mode) ou `brand.json` (tailles/couleurs), `build`, `check`, `snapshot`.

## Adapter à une autre langue
1. `words_from_whisper.py --lang xx --prompt "…"` (whisper large-v3-turbo couvre ~100 langues ; le prompt donne les noms
   propres et le vocabulaire métier dans la langue de la prise).
2. Lexique des mots colorés : copier `examples/lexicon.en.json` en `lexicon.json` à la racine du projet et le traduire —
   regex insensibles à la casse, mot entier ; ajouter le vocabulaire de la marque (produit, concurrents, chiffres clés).
3. `brand.json → lang` pilote le format des nombres (`fr` : espace insécable + virgule ; sinon virgule des milliers + point)
   et les libellés `labels.before/after/note` ; traduire `cta`.
4. `corrections.json` : les erreurs récurrentes de whisper dans cette langue (marques, homophones) — les capitaliser dans un
   lexique par marque et le réutiliser d'une pub à l'autre.
5. Typographie : les langues à accents ou à alphabets non latins exigent des polices qui couvrent les glyphes (Tinos et
   Libre Franklin couvrent latin étendu ; ajouter un woff2 `latin-ext`/`cyrillic` dans `fonts.files` sinon).

## Tailles typographiques (1080×1920)
Titre 84 px serif (56 en solo) · count-up 220 px (120 en solo) · label 44 · détail 36 · lignes de liste 42 (30 en solo) ·
chips 44 · takeover 210 max (auto selon la longueur du mot) · captions 68 px gras dans une pilule navy, max 3 mots ·
kicker 28 px capitales espacées. Zone carte split 960×~700, solo 960×~400.

## Pièges — lire avant le premier build
[references/gotchas.md](references/gotchas.md) : états initiaux `opacity:0` en CSS, pas de tween alpha no-op, pistes SFX
uniques + durée, vidéo jamais dans un wrapper timé, monotonie whisper, `-nostdin`, SFX muets, fichiers réécrits pendant
un `remove-background`, `PRODUCER_BROWSER_GPU_MODE`…
