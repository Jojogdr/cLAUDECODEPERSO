# brand.json — voler la marque en 5 minutes

```bash
node scripts/capture_site.mjs https://brand.com assets     # site-full.png, sections.json, palette.json, site/<section>.png, broll/page-1080.png
```
1. Ouvrir `assets/site-full.png` et **regarder** : fond, accent, rouge/vert sémantiques, famille de police.
2. `assets/palette.json` liste les couleurs calculées les plus fréquentes et les `font-family` — recouper avec l'œil.
3. Remplir `brand.json` (voir `examples/brand.example.json`) :

| clé | rôle |
|---|---|
| `name`, `domain`, `lang` | nom affiché (CTA), pilule d'URL des B-roll, langue (lexique + format des nombres) |
| `tokens.accent` | couleur de marque : kicker, bouton, mots bleus, barre de progression, bordure crayon |
| `tokens.navy` | fond des takeovers et des pilules de captions (une teinte sombre de la marque) |
| `tokens.paper`, `tokens.line` | fond papier + quadrillage (`"grid": false` pour un fond uni) |
| `tokens.ink`, `tokens.muted`, `tokens.panel` | texte, texte secondaire, fond des cartes |
| `tokens.green`, `tokens.red`, `tokens.gold` | gains, coûts, étoiles |
| `fonts.serif` / `fonts.sans` / `fonts.ui` | titres & chiffres / corps / chrome navigateur ; `files[]` déclare les @font-face (fichiers dans `assets/fonts`) |
| `logo_svg` ou `logo` | SVG inline ou `assets/site/<fichier>` |
| `cta` | titre / offre / bouton par défaut de la carte CTA |
| `labels` | AVANT / APRÈS / note |
| `audio`, `captions` | niveaux et réglages des captions |

## Polices
Par défaut : **Tinos** (métriques de Times New Roman, Apache 2.0) + **Libre Franklin** (OFL), récupérées par
`scripts/setup_assets.sh`. Pour une police système (ex. Times New Roman sur macOS) : copier le `.ttf` dans
`assets/fonts`, l'ajouter à `fonts.files` et mettre son nom dans `fonts.serif`. Ne pas redistribuer une police
propriétaire dans un dépôt public.

## Screenshots
`capture_site.mjs` découpe une image par section (`assets/site/00-hero.png`, …) : ce sont les `img` des cartes `stamp`,
`proof`, `beforeafter`. Un vrai écran dans une carte blanche se lit comme une preuve ; un mockup se lit comme une pub.
