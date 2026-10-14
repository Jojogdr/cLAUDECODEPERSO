# Correction n°2 — montage « Wimbledon » (à coller dans l'autre session)

L'idée et la structure sont bonnes : une image par punchline, barre de recherche, iPhone, compteur 00→37, notification, toggles, carte de fin. On garde tout ça et l'ADN ALOI (noir & blanc, lumière naturelle). Mais trois problèmes cassent la vidéo. Ils sont mesurés sur le rendu de 24 s, pas au ressenti.

## Les 3 problèmes bloquants (mesurés)

1. **Les sous-titres sont illisibles.**
   - Ils sont blancs, posés au centre sur sa **chemise blanche** (luminance 0,63) : **contraste 1,5:1**. Il faut au moins 4,5:1.
   - Le mot d'accent vert (#1E7A4C) sur la chemise ne fait que 3,5:1.
   - Résultat : « mais le », « lui… », « revers », « green », « 2 ans » ne se lisent pas.
2. **Les fonds sont collés, pas intégrés** (golf, piscine, explosion).
   - Toute la personne est détourée au lieu du mur seul.
   - L'échelle est fausse : golfeurs et gilets rouges géants juste derrière lui.
   - Le ciel est cramé : 4 à 6 % de pixels blancs.
   - Saturation des fonds 0,33–0,39 contre 0,04 pour la chemise.
   - Fond aussi net que lui, pas de grain commun.
3. **La fin est trop longue et trop vide** : environ 7,5 s de page blanche sur 24 s, des éléments petits, un effet de poussière.

## Corrections, moment par moment

- **0–1 s (hook)** : la première image doit déjà être la plus forte. Ouvre sur le plan du court de Wimbledon ou sur la boîte verte avec « Wimbledon. », puis reviens sur lui. Pas une image de lui avec un petit texte.
- **Barre de recherche « raquette de tennis / Aucun résultat »** : elle est blanche sur marbre blanc.
  - passe-la en verre sombre (`rgba(20,20,22,0.72)` + flou, texte blanc) ou assombris la vidéo derrière ;
  - texte d'au moins 34 px, placée à côté de lui, pas sur ses mains.
- **« Son seul revers ? / Le râteau »** : les titres sont bons. L'iPhone couvre son bras et son torse.
  - le faire glisser sur le côté, à environ 55 % de la largeur ;
  - bulles de chat d'au moins 30 px.
- **Golf (« Le seul green », « 37 coups »)** :
  - remplacer **le mur seulement**, détourage Robust Video Matting, la table et ses mains restent réelles ;
  - fond désaturé de 20–30 %, luminosité ramenée près de celle du mur d'origine, ciel non cramé ;
  - flou de 4–6 px, fond qui bouge moitié moins que lui quand on zoome ;
  - **personnages du fond petits et lointains** ;
  - le compteur 00→37 est bon.
- **« À côté. » avec l'explosion** : à supprimer, c'est kitsch. Le remplacer par une balle qui part à côté du drapeau, ou une coupe franche.
- **« Il y a 2 ans »** : la notification en pastille est bonne.
- **« Étanche à 100 m »** : mêmes règles que le golf. Pas de gens en gilet rouge géants derrière lui : un plan macro de la montre sous l'eau, ou un plongeur au loin.
- **Plongeon « il coule », bière « 2ᵉ verre »** : plans de coupe bons, à ramener à l'étalonnage commun (neutre, pas de dominante jaune).
- **« Bref » et les toggles Tennis / Golf / Plongée** : la carte blanche sur image blanche se fond. Il faut une carte sombre ou un voile derrière, et des interrupteurs plus grands.
- **« Wimbledon. La bonne montre. » avec la photo de montre** : très bien, à garder.
- **Fin** :
  - **2,5 à 3 s maximum** ;
  - prix et bouton WhatsApp visibles dès 0,5 s ;
  - photo de la montre sur environ 60 % de la largeur ;
  - « ALOI / Datejust 36 Wimbledon. / 8 350 € » plus gros, pas d'effet de poussière.

## Règles qui règlent le problème partout

- **Sous-titres toujours lisibles**, quel que soit le fond (ici une chemise blanche) :
  - texte blanc 700, 52 px, dans une **pastille sombre** `rgba(0,0,0,0.55)`, rayon 18, marge 8/18 px ;
  - ou texte noir dans une pastille blanche ;
  - le mot d'accent va dans la pastille, jamais en vert foncé posé sur le blanc ;
  - les placer là où le fond est le plus sombre, ou garder la pastille.
- **Un seul étalonnage final sur tout**, neutre ALOI, avec plus de contraste et des noirs plus profonds, et un grain commun :
  `eq=contrast=1.08:saturation=0.95,curves=all='0/0.02 0.25/0.21 0.5/0.49 0.8/0.82 1/0.97',vignette=PI/6,noise=c0s=6:c0f=t`
- **Chaque média inséré est ramené vers le rush avant d'être posé** :
  - même luminosité moyenne, à ±10 % ;
  - saturation proche de la scène ;
  - aucun blanc cramé, flou d'arrière-plan ;
  - personnages à l'échelle et à distance réalistes.
- **Contraste mesuré** derrière chaque texte : au moins 4,5:1 pour les petits textes, 3:1 pour les gros. S'il n'y est pas, mettre une pastille ou un voile.
- **Rien sur son visage ni sur ses mains** quand il montre la montre. Cartes et téléphone sur le côté.
- **Planche avant rendu**, vue à taille téléphone (environ 360 px de large) et dans l'interface Instagram.

Méthode (pas le style) : https://github.com/Jojogdr/cLAUDECODEPERSO/tree/claude/busy-newton-ri0gpn
- `perfume-reel/scripts/rvm_wall.py` : détourage du mur seul ;
- `perfume-reel/scripts/render_reel.py` : étalonnage final ;
- `perfume-reel/src/engine/Reel.tsx` : `WallBg` (voile, parallaxe, balayage).
