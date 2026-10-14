# Récap & audit — montage « Ébène Fumé », de la V8 à la V14

> Vidéo d'entraînement : une femme qui présente le parfum Tom Ford Ébène Fumé face caméra (rush 356×634, 45 s), monté en reel vertical de 22 s.
> But réel : trouver la méthode de montage des reels ALOI (montres Rolex, face caméra, 35 à 100 vidéos par mois).
> Ce document n'est pas un règlement : il dit « sur ce type de montage, on a fait comme ça, voilà ce qui a plu, voilà ce qui n'a pas plu ».

**Dépôt GitHub** : https://github.com/Jojogdr/cLAUDECODEPERSO — branche `claude/busy-newton-ri0gpn`, dossier `perfume-reel/`
**Compétence (skill)** : `.claude/skills/reel-montage/SKILL.md`
**Versions de référence** : `edl/ebene_v8.json` (V8) et `edl/ebene_v14_ig.json` / `_tt` / `_yt` (V14, une par plateforme)

---

## 1. Les deux montages en une phrase

- **V8 — le style « cinéma »** : élégant, sombre et doré. Le décor derrière elle change (flammes, fumée), un grand mot au centre à la fois, des plans produit plein écran, des transitions WebGL avec flash, la musique qui tombe sur « percutant ». Ça ressemble à une pub de parfum.
- **V14 — le style « punchline »** (méthode Wimbledon) : chaque phrase a son image (notifications iPhone, badge, jauge, empreinte qui se dessine, impact), un titre en capitales en haut, le mot clé en serif italique, des sous-titres mot à mot, un écran calé au pixel près pour chaque appli. Ça ressemble à un reel qui retient le pouce.

Les deux plaisent. La V8 a la classe et l'ambiance ; la V14 a le rythme et l'accroche. **Pour les montres, le bon dosage est probablement : la DA et les transitions de la V8 + la mécanique « une image par punchline » de la V14.**

---

## 2. Comparaison V8 ↔ V14

| | **V8 (cinéma)** | **V14 (punchline)** |
|---|---|---|
| **Hook (0–2 s)** | Zoom qui claque, « les gens ne vont pas » + « L'OUBLIER. » derrière elle sur fond de flammes, flash | Notifications iOS qui tombent du haut (« C'est quoi ton parfum ?? », « Tu sentais trop bon hier soir »), « l'oublier. » en serif doré |
| **Rythme** | Un événement toutes les ~1,5–2 s, des respirations sur elle | Un événement toutes les ~0,5–1 s sur les punchlines, quelques respirations courtes |
| **Typo** | Inter 900 en capitales au centre + Playfair italique doré, un seul bloc à la fois | Inter Tight 900 capitales serrées en haut à gauche + Instrument Serif italique ambre, sous-titres Inter Tight 700 avec mots clés en serif |
| **Où est le texte** | Au centre, souvent derrière elle (profondeur) | En haut, juste sous l'en-tête de l'appli, jamais sur le visage ; sous-titres au centre |
| **Décor derrière elle** | Remplacé 5 fois (flammes, fumée, photos produit), mots derrière ses cheveux | Remplacé 6 fois avec des couleurs qui racontent (bleu acier « homme », ambre chaud « femme », fumée « mystérieux ») + lignes de balayage |
| **Plans de coupe** | Produit plein écran (carte papier, flammes, encre, or), cartes en verre | Produit plein écran + cartes Ambre / Santal + jauge PUISSANCE sur la bouteille + empreinte qui se dessine |
| **Motion design** | Slam des mots, zooms réguliers, flash, light leak | Badges qui pop à côté d'elle, notifications, jauge, impact, empreinte, cartes qui flottent avec parallaxe |
| **Transitions** | WebGL (CrossZoom, DreamyZoom, FilmBurn, LinearBlur) + flash + son sur la même image | Les mêmes WebGL + des balayages de fond (scan) + coupes franches |
| **Son** | 25 sons de ta banque + swipes libres, musique fixe, drop sur « percutant » | ~57 sons : un par action visible (notifications, pops, clics de compteur, whooshes CC0, page qui tourne), musique fixe, même drop |
| **Couleur** | Étalonnage du rush + grain quasi invisible | Étalonnage chaud doux + grain + vignettage sur toute l'image |
| **Fin** | Carte produit + « meilleure recommandation » + pastille | Packshot détouré façon Apple (une seule ombre), « Tom Ford / Ébène Fumé. », bouton WhatsApp, aloi.watch |
| **Plateformes** | Une seule vidéo | Une vidéo par plateforme (Instagram / TikTok / YouTube Shorts) + aperçus dans l'appli |
| **Ressenti client** | « C'est bien, captivant… mais trop simple, ça fait CapCut » | « C'est parfait », « on se rapproche réellement de ce que j'ai envie qu'on fasse » |

**Ce que la V8 a et que la V14 a un peu perdu** : l'ambiance (fonds flammes/fumée plus présents, mots derrière ses cheveux), la sobriété, le côté pub de luxe.
**Ce que la V14 a en plus** : on se fait « choper le regard » à chaque phrase, tout est lisible sur téléphone, rien n'est caché par l'appli.

---

## 3. Ce qui a plu (à garder)

- **Une image littérale par punchline** (la leçon Wimbledon) : notifications, badge, jauge 10/10, empreinte qui se dessine — « là il se passe des choses ».
- **La vitesse des textes** : apparition en ~0,3 s, mot par mot, sortie qui accélère.
- **Le traitement « une femme »** (fond ambre chaud), l'empreinte, FORT. / PUISSANT. avec la jauge.
- **Les fonds de la V8** et sa typo d'origine, le décor remplacé **uniquement derrière elle** (elle reste assise sur son lit).
- **Les sons de la banque client**, peu nombreux, sur des actions visibles, musique à niveau fixe.
- **La planche avant chaque rendu** (on valide sur 15–20 images, on ne rend qu'après).
- **Les notifications en pastilles iOS** qui tombent du haut de l'écran (pas en plein écran iPhone).
- **Un calage par plateforme** et l'aperçu dans la vraie interface.

## 4. Ce qui n'a pas plu (à éviter sur ce type de montage)

- Faire « la V7 avec un vernis » : grain invisible, même structure, mêmes tricks (barré « POUR HOMME » → « UNE FEMME »).
- Tout ce qui fait kitsch : étincelles, tampons, tremblements, barre « masculin/féminin », page de nuancier pastel, stickers émojis 3D (« ça ne ressemble à rien »), moustache (cliché).
- Le texte sur le visage / le front, les textes trop gros, le visage trop zoomé.
- Les notifications trop rapides ou en plein écran.
- La barre de progression en bas, la marque « ALOI / TOM FORD · ÉBÈNE FUMÉ » en haut (prenait de la place pour rien).
- Les sons trop forts (V3), les bips synthétiques, les sons graves inutiles.
- Le détourage de toute la personne (V4) au lieu du mur seulement.
- Les pistes « 3D » et les longues recherches sans résultat visible : pour 35–100 vidéos/mois il faut des briques réutilisables, pas un effet sur mesure par vidéo.
- Reprendre l'ADN Tom Ford à la place de la nôtre.

À retravailler : la typo (pas encore « ouf »), les symboles homme/femme (cravate, bouche), l'appel à l'action.

---

## 5. Comment c'est fabriqué (la méthode)

1. **Rush** → étalonnage + upscale 1080×1920 (`ffmpeg`), transcription mot à mot (Whisper base local, `scripts/transcribe.mjs`).
2. **Découpe** à 20–25 s sur les silences, hook = la phrase la plus forte en premier.
3. **Plan de montage = un fichier JSON (EDL)** écrit par Claude : mots, zooms, décors derrière elle, compositions de texte, cartes, effets « punch », sons, musique. C'est **la seule étape qui coûte des crédits**.
4. **Détourage du mur** derrière elle (Robust Video Matting, CPU, `scripts/rvm_wall.py`).
5. **Planche** : 15–20 images clés rendues dans l'interface de la plateforme → validation client.
6. **Rendu** une commande : `python3 -I scripts/render_reel.py edl/<id>.json edl/<id>.post.json`
   → sons mixés relatifs à la voix, passe 1 Remotion, passe 2 transitions WebGL, étalonnage + −14 LUFS.
   Itérer le son seul : `--remix-audio` (quelques secondes, sans refaire l'image).
7. **Aperçu** dans l'appli (Instagram / TikTok / YouTube Shorts) : composition `PlatformPreview`.

**Le moteur** (`src/engine/`) : `Reel.tsx` (caméra, décors, scènes, sous-titres, audio), `Design.tsx` (compositions typo, cartes, fiche), `Fx.tsx` (notifications, badges, jauge, empreinte, impact, balayages, carte de fin, guide des zones), `GlPost.tsx` (transitions WebGL), `ctx.ts` (calage par plateforme).

**Zones écran retenues** (téléphone de référence iPhone 13) : tout ce qui compte entre x 96–984 et y ≈ 215 (Instagram) / 190 (TikTok) / 140 (Shorts) → 1 440. À droite la colonne like/commentaire à partir de mi-hauteur ; en bas le @ et la légende.

---

## 6. Ce qu'on a utilisé / pas utilisé

**Utilisé**
- Remotion 4.0.535 + React, Chromium headless, rendu WebGL (`--gl=swangle`).
- gl-transitions (MIT) pour les transitions.
- Robust Video Matting (ONNX) pour le mur — licence GPL-3 : outil interne uniquement, ne pas redistribuer.
- Whisper base (`sts-whisper-base`) en local pour la transcription.
- ffmpeg : étalonnage, mixage, −14 LUFS.
- **Ta banque de sons** (ios18, macos, ui-pack, tiktok-packs) + whooshes CC0 (atomcut-library) dans `public/sfx_bank/cc0/`.
- Polices libres : Inter Tight, Instrument Serif, IBM Plex Mono (+ Inter, Playfair pour la V8).
- Règles de design Apple (VoltAgent/awesome-design-md) pour les notifications et la carte de fin.
- Mesures d'écran Instagram du **Style Lab** (Shaan Johari) et mesures communautaires TikTok/Shorts.
- Règles de métier récupérées sur GitHub : son (un par action, jamais deux fois le même d'affilée), temps de lecture minimum, compositing sans effet « découpé » (ai-video-skill, mg-styles-15, opus-video-skills, lemo-opuscar, awesome-opus5-5-videos).

**Trouvé mais pas utilisé (gardé de côté)**
- Bibliothèque `public/lib/` + `library/` : 119 sons CC0 (dont tic-tac de montre), 54 animations Lottie, 100 stickers, 65 composants Remotion, shaders — prête si besoin.
- HyperFrames (HeyGen) : 21 compétences installées, catalogue de 447 blocs consulté (iMessage, notifications, flèches dessinées, compteurs, light leaks) — idées reprises, rendu fait avec notre moteur.
- Photo « 3D » par carte de profondeur (Depth Anything) : construit puis écarté (pas rentable pour des montres).
- Higgsfield (0 crédit), Skillry et la page Notion (bloqués par le réseau), maquettes officielles Remotion (bloquées).

---

## 7. Audit — analyse globale

**Points forts**
- Un moteur générique : un nouveau montage = un nouveau fichier JSON, pas de nouveau code.
- Des briques réutilisables pour les montres : notifications, badge, jauge (ex. étanchéité 100 m), fiche (référence, année, boîte & papiers, prix), carte WhatsApp, décor remplacé, symbole qui se dessine.
- Coût par vidéo faible : seul le plan de montage consomme des crédits ; rendu, détourage, variantes et remix son sont gratuits (CPU).
- Contrôle qualité intégré : planche avant rendu, aperçu dans l'appli, −14 LUFS, zones des plateformes.

**Points faibles / risques**
- Source de mauvaise qualité (356 px) : image douce, détourage limité. Tourner en 1080p minimum, 4K idéalement.
- Typo encore perfectible ; symboles dessinés en code un peu « clipart » → prévoir un jeu d'icônes ALOI.
- Pas de banque d'images / vidéos par sujet (stock bloqué ici) : pour illustrer une punchline il faut une source (photos ALOI, banque d'images autorisée, ou génération avec devis).
- Les sons montre réels manquent (couronne, fermoir, tic-tac d'une vraie Rolex) : à enregistrer.
- Remotion est gratuit jusqu'à 3 personnes dans l'entreprise ; au-delà, licence entreprise.
- Une partie du budget a servi à l'exploration (recherches par agents) : à éviter en production.

**Recommandation pour la suite**
1. Monter la **pique Wimbledon** avec la méthode (V8 pour l'ambiance + V14 pour les punchlines), planche d'abord.
2. Fixer **2–3 presets** : « cinéma » (V8), « punchline » (V14), « mix ».
3. Générer automatiquement les **reels d'essai** (autre début / autre couleur / autre effet).
4. Puis la **petite plateforme** : dépôt du rush → planche → validation → vidéos + variantes.
