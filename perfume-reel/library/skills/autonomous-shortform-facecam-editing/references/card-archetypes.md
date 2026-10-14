# Les archétypes de cartes

Chaque beat du storyboard porte un `mode` (cadrage) et une `card` (`type` + champs). Les textes acceptent le balisage
`*bleu*` (accent / CTA), `_rouge_` (coût), `+vert+` (gain). Les temps sont des refs `"w:12"` (début du mot 12),
`"we:12"` (fin), un nombre (secondes) ou `"end"`. Sauf mention, l'entrée de la carte est un fondu + montée de 50 px
(0,45 s) avec un `whoosh`.

| type | quand | champs | animation | SFX |
|---|---|---|---|---|
| `title` | une phrase sans chiffre ni liste, une affirmation | `kicker`, `title`*, `detail`, `detail_at` | panel entre, `detail` arrive à `detail_at` | whoosh |
| `countup` | **tout nombre prononcé** | `from`, `to`*, `suffix`, `dec`, `at`, `dur` (1,1 s), `tone` blue/green/red, `kicker`, `label`, `sub`, `sub_at` | le nombre compte de `from` à `to` à `at` (masqué avant si `at` > start + 0,6 s), `sub` arrive après | ticks à `at`, ding à la fin |
| `stamp` | « le statu quo est faux », un mot à marquer | `img`* (assets/site/<img>.png), `stamp`*, `tone` (red), `at`, `kicker`, `caption` | screenshot dans une carte blanche, tampon tourné −12° qui claque (scale 2,4 → 1) + secousse | whoosh, stamp |
| `list` | énumération, « tout le monde dit X, Y, Z » | `kicker`, `rows[]` : `text`*, `at`*, `tone`, `strike_at`, `glow_at` | chaque ligne pop à `at`, barrée à `strike_at` (opacité 0,45), la bonne réponse brille à `glow_at` | pop / scratch / shimmer |
| `takeover` | le mot émotionnel, une seule idée | `word`*, `at`, `tone` green/blue/red/white, `kicker`, `after`, `after_at` | mode `full` : vidéo masquée, fond navy, mot géant (taille auto selon la longueur) qui claque ; en `--cutout` la carte passe **derrière** le sujet | riser si l'attente > 0,8 s, impact |
| `broll` | montrer le produit, le site, la preuve | `clip`* (assets/broll/<clip>.mp4), `caption`, `caption_at` | fenêtre navigateur (3 points + URL) qui monte ; la vidéo est timée elle-même (jamais dans un wrapper timé) | whoosh |
| `chips` | liste rapide sur le plein cadre (`fullhim`) | `chips[]` : `text`*, `at`*, `tone` | pilules blanches qui poppent en cascade, décalées horizontalement | pop |
| `cta` | les 3 dernières secondes | `at`, `title`, `offer`, `button` (défauts = `brand.json → cta`) | logo + titre + offre ; bouton qui pop puis pulse, flèche qui rebondit (répétitions finies) | whoosh, cha-ching |
| `quote` | une punchline, de l'humour, une citation | `text`*, `who` | carte glisse depuis la gauche, barre d'accent | whip |
| `proof` | preuve sociale chiffrée | `to`*, `suffix`, `label`*, `at`, `dur`, `stars_at`, `note`, `img`, `kicker` | count-up + 5 étoiles or qui poppent + note + screenshot avis | ticks, ding |
| `beforeafter` | « de ça à ça », avant/après | `before{text|img, at}`*, `after{text|img, at}`*, `before_tag`, `after_tag`, `kicker` | AVANT glisse de la gauche (rouge), flèche, APRÈS de la droite (vert) | whip, shimmer |

## Les 4 modes de cadrage
- `split` — carte dans la zone haute (960 px de large), **fenêtre vidéo** (carré par défaut) en bas, captions entre les deux. Le workhorse. La fenêtre alterne arrondi / pilule d'un beat split au suivant.
- `solo` — fenêtre vidéo centrée (masque **cercle**), carte dans la bannière haute, captions dans la bannière basse.
- `fullhim` — plein cadre serré 9:16 + vignette, chips flottantes en haut, captions sur l'image. Hard-cut.
- `full` — takeover : vidéo masquée, fond navy (ou, en cutout, sujet devant le texte). 3 beats max d'affilée.

## Règles de choix (par type de phrase)
1. Un nombre → `countup` (jamais un nombre inventé : uniquement ceux prononcés).
2. Une énumération courte pendant que l'orateur parle vite → `chips` en `fullhim` ; plus longue ou à barrer → `list`.
3. Une phrase qui nomme le produit/site → `broll` ou `stamp` sur un vrai écran.
4. Le pivot émotionnel (« raccourci », « dépasser », « AI first ») → `takeover`, et une seule fois par tiers de vidéo.
5. Une blague ou une phrase de personnalité → `quote`.
6. Les 3 dernières secondes → `cta`, toujours.
7. Changer de mode toutes les 2-4 phrases ; cacher chaque raccord de pré-cut dans un changement de mode (`"start": <secondes du raccord>`).
8. `punch` (zoom punch 1,07×) sur le mot le plus fort d'un beat, 1 à 2 par beat max.

## Densité
< 60 s : une carte toutes les 4-6 s · 60-90 s : toutes les 5-8 s · > 90 s : toutes les 8-12 s. Plancher : 5 cartes.

---

# Exemples JSON complets + erreurs fréquentes

Les refs `w:` renvoient au `media/transcript.txt` du projet ; ici elles sont réalistes pour une prise de ~45 s.

### `title`
```json
{"start": "w:0", "mode": "split", "punch": ["w:8"],
 "card": {"type": "title", "kicker": "Dirigeant de TPE / PME", "title": "Repenser ta boîte en *AI First*.",
          "detail": "Tous tes process, tout ton contexte — pilotés par des +agents IA+", "detail_at": "w:19"}}
```
Erreurs fréquentes : titre > 8 mots (déborde du panel en 84 px) · `detail` sans `detail_at` sur un beat long (il arrive à +0,35 s et
n'a plus rien à révéler) · deux `title` d'affilée (monotone : alterner avec un count-up ou un B-roll).

### `countup`
```json
{"start": "w:15", "mode": "split", "punch": ["w:20"],
 "card": {"type": "countup", "kicker": "Ta PME aujourd'hui", "from": 1, "to": 5, "suffix": "M€", "at": "w:20", "dur": 1.0,
          "tone": "blue", "label": "de chiffre d'affaires", "sub": "complètement +pensée pour l'IA+", "sub_at": "w:31"}}
```
Erreurs fréquentes : `at` **avant** le mot du nombre (le chiffre est déjà là quand il le dit — poser `at` sur le mot exact) ·
`to` inventé (uniquement les chiffres prononcés) · `dur` > durée restante du beat · `from`/`to` avec des décimales sans `dec` ·
oublier `suffix` (« 5 » tout seul ne veut rien dire) · nombre ≥ 1 000 sans espace (le script formate, mais le `suffix` « € »
doit être séparé).

### `stamp`
```json
{"start": "w:154", "mode": "split", "punch": ["w:162"],
 "card": {"type": "stamp", "kicker": "Repenser ta boîte", "img": "00-hero", "stamp": "AI First", "tone": "blue", "at": "w:162",
          "caption": "Un avantage énorme sur les *5 prochaines années*"}}
```
Erreurs fréquentes : `img` absent de `assets/site/` (image cassée silencieuse — vérifier sur le snapshot) · crop trop bas
(< 300 px de haut → tampon plus grand que l'image ; préférer une section haute ou `--width` plus petit à la capture) ·
texte du tampon > 12 caractères (sort de la carte) · `at` = début du beat (le claquement doit tomber sur le mot-clé).

### `list`
```json
{"start": "w:35", "mode": "solo",
 "card": {"type": "list", "kicker": "Tes agents IA",
          "rows": [{"text": "Chez toi, en +autonomie+", "tone": "green", "at": "w:41", "glow_at": "w:57"},
                   {"text": "Des agents _SaaS_ payés sur internet", "tone": "red", "at": "w:48", "strike_at": "w:53"}]}}
```
Erreurs fréquentes : > 3 lignes en `solo` (la bannière fait ~400 px : passer en `split` dès 4 lignes, 5 max) ·
`strike_at` avant `at` · lignes de > 6 mots (retour à la ligne, panel qui pousse la vidéo) · toutes les lignes au même `at`
(elles doivent popper mot par mot) · `glow_at` sur la ligne barrée.

### `takeover`
```json
{"start": "w:100", "mode": "full",
 "card": {"type": "takeover", "kicker": "On va te donner un énorme", "word": "Raccourci.", "at": "w:107", "tone": "green",
          "after": "que tes concurrents n'auront jamais", "after_at": "w:112"}}
```
Erreurs fréquentes : beat > 6 s (la vidéo est masquée : 3-5 s max, sinon on perd le visage) · `word` de 2 lignes (un mot, deux
maximum ; la taille s'adapte à la longueur mais pas à la hauteur) · deux takeovers en moins de 15 s · `at` trop tôt (le mot
géant doit claquer **sur** le mot dit).

### `broll`
```json
{"start": "w:90", "mode": "split",
 "card": {"type": "broll", "clip": "pillars", "caption": "Chez toi, en local, avec *tes propres process*", "caption_at": "w:98"}}
```
Erreurs fréquentes : beat plus long que le clip (le clip gèle sur sa dernière image : 4-6 s de beat pour un clip de 4-5 s) ·
`clip` sans extension mais fichier `.mov` (il faut un `.mp4` H.264 keyframe/s : `make_broll.sh` ou ré-encoder) · caption
qui répète mot pour mot ce qui est dit (préférer une reformulation courte).

### `chips`
```json
{"start": "w:62", "mode": "fullhim", "punch": ["w:65"],
 "card": {"type": "chips", "chips": [{"text": "Publier des *articles de blog*", "at": "w:70"}, {"text": "Nouvelles *créatives* pub", "at": "w:79"},
                                      {"text": "Renouveler tes *campagnes*", "at": "w:83"}, {"text": "Traiter ton *support*", "at": "w:87"}]}}
```
Erreurs fréquentes : mode autre que `fullhim` (les chips sont pensées pour flotter sur le plein cadre) · > 5 chips (elles
descendent sur le visage) · chip > 4 mots (`white-space:nowrap` → sort du cadre) · chips sans `at` distincts.

### `cta`
```json
{"start": "w:175", "mode": "split", "punch": ["w:175"],
 "card": {"type": "cta", "at": "w:175", "title": "Transformer votre PME en *AI Native*.", "offer": "Diagnostic gratuit — 40 secondes", "button": "Réaliser mon diagnostic"}}
```
Erreurs fréquentes : CTA qui commence avant les 3-4 dernières secondes (le bouton pulse sur « clique sur le lien », pas avant) ·
`title` qui n'est pas celui du site (cohérence landing ↔ pub) · oublier `brand.json → cta` (les défauts s'appliquent alors) ·
mode `solo` (le CTA a besoin de la zone haute complète).

### `quote`
```json
{"start": "w:116", "mode": "solo",
 "card": {"type": "quote", "text": "J'ai une chemise, une belle montre… mais je ne suis *pas* un prestataire.", "who": "Le fondateur"}}
```
Erreurs fréquentes : citation > 20 mots (58 px italique : ça déborde) · beat < 2,5 s (pas le temps de lire) · `who` inutile
quand c'est l'orateur lui-même (laisser vide).

### `proof`
```json
{"start": 0, "mode": "split", "punch": ["w:13"],
 "card": {"type": "proof", "kicker": "En 4 ans, deux agences", "to": 240, "suffix": "clients", "at": "w:13", "dur": 1.2,
          "label": "accompagnés en marketing", "note": "4,8 / 5", "img": "05-proof", "stars_at": "w:16"}}
```
Erreurs fréquentes : `note` sans source réelle (la note affichée doit exister sur le site) · `img` d'une section sans avis ·
`stars_at` avant `at` (les étoiles doivent tomber après le chiffre).

### `beforeafter`
```json
{"start": "w:231", "mode": "split",
 "card": {"type": "beforeafter", "kicker": "Done for you vs AI First",
          "before": {"text": "Un workflow fait pour toi — ça ne repense pas tes process", "at": "w:235"},
          "after": {"text": "Repenser ta boîte pour gagner sur 3 ans", "at": "w:256"}, "before_tag": "AVANT", "after_tag": "APRÈS"}}
```
Erreurs fréquentes : `after.at` < `before.at` · deux images hautes (2 × 260 px max, sinon la carte dépasse la zone) ·
textes > 12 mots par côté · beat trop court pour voir l'APRÈS (laisser ≥ 1,5 s après `after.at`).

### Beat sans carte (juste un cadrage)
```json
{"start": 21.65, "mode": "fullhim", "punch": ["w:91"]}
```
Utile pour cacher un raccord de pré-cut (`start` en secondes = temps du raccord dans `metadata.json → keep`).
