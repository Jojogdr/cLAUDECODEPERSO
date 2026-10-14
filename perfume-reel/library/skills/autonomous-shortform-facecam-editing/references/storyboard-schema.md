# storyboard.json — schéma

```jsonc
{
  "name": "hook-a",                 // optionnel, pour le <title>
  "bed_volume": 0.07,               // optionnel, écrase brand.json → audio.bed_volume
  "sfx_scale": 1.0,                 // optionnel, multiplie tous les niveaux SFX
  "beats": [                        // dans l'ordre du temps ; la fin d'un beat = le début du suivant (ou "end")
    {
      "start": "w:0",               // "w:i" début du mot i · "we:i" fin du mot i · 12.5 secondes · "end"
      "end": "we:14",               // optionnel : borne la carte avant le beat suivant
      "mode": "split",              // split | solo | fullhim | full
      "punch": ["w:1", "w:13"],     // zoom punches (1,07×) sur ces mots
      "sfx": [{"at": "w:6", "name": "whip", "vol": 0.3}],   // hits manuels (noms du kit)
      "card": { "type": "countup", "...": "voir card-archetypes.md" }   // optionnel : un beat sans carte = juste un cadrage
    }
  ]
}
```

## Comment on l'écrit
1. Lire `media/transcript.txt` (mots indexés `i@start`) et `media/sentences.json`.
2. Pour chaque phrase, choisir un mode + un archétype (règles dans `card-archetypes.md`), noter le mot exact où chaque
   animation tombe (`at`, `sub_at`, `rows[].at`, `strike_at`, …).
3. Commencer par un `start: 0` ; caler un beat sur chaque raccord de pré-cut (`media/metadata.json → keep`) avec un
   changement de mode pour cacher la coupe.
4. Finir par un `cta` sur les 3 dernières secondes.

## Exemple commenté (44 s, 9 beats)
Voir `examples/storyboard.example.json` : count-up « 3 months » (split) → liste barrée (solo, cercle) → chips plein
cadre → B-roll du site (split) → takeover « Shortcut. » (full) → liste des skills (split) → count-up « 5 steps »
(solo) → tampon « AI first » sur le hero (split) → CTA.

## Résolution
`build.py` écrit `public-resolved.json` (temps résolus de chaque beat, nombre de chunks de captions, SFX posés, SFX
manquants) : le relire pour vérifier qu'aucun beat n'est vide ou inversé.
