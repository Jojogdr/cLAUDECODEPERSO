# Banque de sons ALOI

Sons courts pour les reels. Tous en WAV 48 kHz stéréo (ou mono), normalisés, avec un fondu propre au début et à la fin. On peut les poser directement dans un mix sans retouche.

## `ios18/` — sons iOS 18 (38 sons)
Extraits de la vidéo « All iOS 18 Sounds ». Ce sont les sons d'interface Apple : c'est le style que Joseph veut.

| Dossier | Ce qu'il contient |
|---|---|
| `01-notifications` | notification critique, message reçu, email reçu, demande AirDrop, invitation FaceTime |
| `02-envoi` | message envoyé, email envoyé, écho d'envoi et de réception |
| `03-validation` | Apple Pay réussi et échoué, pouce levé, cœur, exclamation |
| `04-celebration` | confettis, feu d'artifice, étincelles, étoile filante, laser |
| `05-interface` | verrouillage, obturateur, enregistrement, rafale, charge, MagSafe, NameDrop, appareil connecté, nouveau souvenir |
| `06-telephone` | numérotation, attente, occupé, fin d'appel |
| `07-systeme` | démarrage, extinction |

## `macos/` — sons système macOS (8 sons)
Pop, Tink, Glass, Hero, Apple Pay, envoi iMessage, Siri. Ce sont ceux utilisés dans le reel « Acheter » v12.

## `ui-pack/` — Epidemic Sound UI pack (70 sons)
Sons d'interface pro, téléchargés depuis Google Drive. Classés en 6 catégories :

| Dossier | Ce qu'il contient |
|---|---|
| `01-notifications` | message clic, notification menu/rapide/selection |
| `02-validation` | confirmations (court, complexe, pincé, sec, scintillant), positif, succès |
| `03-echec` | refus 1 et 2 |
| `04-interface` | balayage, glitch, interactions simples, carillon, ordinateur, ui-01 à ui-07 |
| `05-chargement` | chargement 01 à 10, progression |
| `06-transition` | swoosh, transition rapide/douce/inversée, whoosh 01 à 10 |

## `tiktok-pack1/` — CapCut sound effects (10 sons)
Camera Click, Ding, Mouse Click, iPhone Charging, Mac Typing, Gear, Camera Shutter, Metallic Riser, Punch Stop Riser, Cinematic Impact.

## `tiktok-pack2/` — Trending sound effects (8 sons)
Fahh meme, Core Sound, Taco Bell Bong, Disc, Ding Sound, Cha-Ching Money, Reveal Sound, Dexter Meme.

## `tiktok-pack3/` — Sons français (9 sons)
Basse Percutante, Glass Shine, Low Rise, Metallic Riser, Rampe d'Inertie, Roulement Tambour, Thunder Opener, Chargement Photo, Changement de Page.

## `perso/` — sons fournis par Joseph
`ping-iphone.mp3` : le son de notification utilisé dans le hook du reel « Acheter ».

## Ce qui marche bien, par moment de montage
- **Notification ou rafale de notifications** : `perso/ping-iphone`, `ios18/01-notifications/notification-critique`.
- **Un titre qui claque** : `macos/pop`, `ios18/05-interface/verrouillage-clic`.
- **Une validation, un prix, une coche verte** : `ios18/03-validation/apple-pay-succes`, `macos/tink`.
- **Confettis, fin euphorique** : `ios18/04-celebration/confettis`, `macos/hero`.
- **Envoi d'un message, transition** : `ios18/02-envoi/message-envoye`, `macos/imessage-envoi`.
- **Apparition d'un élément d'interface** : `ios18/05-interface/charge`, `macos/tink`.
- **Transition swoosh** : `ui-pack/06-transition/swoosh.wav`, `ui-pack/06-transition/whoosh-*.wav`.
- **Impact cinématique** : `tiktok-pack1/cinematic-impact`, `tiktok-pack3/thunder-opener`.
- **Riser / build-up** : `tiktok-pack1/metallic-riser`, `tiktok-pack3/metallic-riser`.
- **Cha-ching argent** : `tiktok-pack2/cha-ching-money`.

## Règle de mixage (validée par Joseph)
- La musique reste à un **niveau fixe** : elle ne baisse jamais sous un effet.
- **Peu de sons**, seulement sur les actions qu'on voit à l'écran.
- Pas de sons graves inutiles ni de bips synthétiques : uniquement des sons d'interface, courts et aigus.
