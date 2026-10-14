# Mix audio

| couche | niveau | comment |
|---|---|---|
| voix | −16 LUFS, TP −1,5 dBTP | `prep.py` : passe-haut 80 Hz, `afftdn` léger, `loudnorm` |
| SFX | pop 0,32 · whoosh/whip 0,30 · stamp/impact 0,50 · ticks 0,42 · cha-ching 0,40 · ding 0,36 · shimmer 0,34 · scratch 0,38 · riser 0,34 | kit normalisé à −3 dB peak ; `brand.json → audio.sfx_scale` multiplie tout |
| music bed | `data-volume` 0,07 (≈ 18-20 dB sous la voix) | fade-out 1,6 s à la fin ; pas de fade-in |

## Où tombent les hits (automatique dans `build.py`)
- entrée de carte : whoosh · changement de cadrage dur : whip · lignes/chips : pop · barré : scratch · glow : shimmer ·
  count-up : ticks puis ding · tampon : stamp · takeover : riser (si attente > 0,8 s) puis impact · CTA : cha-ching ·
  avant/après : whip puis shimmer. Hits manuels : `beats[].sfx[]`.

## Vérifier
```bash
scripts/qa.sh out.mp4          # loudness intégrée + true peak du FICHIER
```
- Voix seule ≈ −16 LUFS ; le mix final entre −16 et −17 LUFS, TP ≤ −0,5 dBTP (baisser `sfx_scale` si ça dépasse).
- Bed : mesurer `volumedetect` sur 0,5 s sans voix (fin de vidéo) vs 1 s de voix : viser ≥ 15 dB d'écart.
- SFX présents : le pic max autour d'un hit doit monter de ≥ 2 dB par rapport à juste avant.
