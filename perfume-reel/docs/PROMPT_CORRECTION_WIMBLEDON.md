# Message de correction — montage « Wimbledon » (à coller dans l'autre session)

Bonne base : la densité de motion design (barre de recherche, interrupteurs, compteur 00→37, iPhone, écran verrouillé, fonds qui changent, carte de fin aloi.watch + prix + WhatsApp), c'est exactement ce qu'on veut garder. Le problème n'est pas l'idée, c'est l'exécution : **les vidéos insérées sont mal intégrées, la colorimétrie ne colle pas, et les textes ne se lisent pas**. Garde l'ADN ALOI (noir & blanc, lumière naturelle, épuré) — ne pars surtout pas vers une DA sombre/dorée. Corrige avec la méthode ci-dessous, puis renvoie une planche avant tout rendu.

## 1. Ce qui ne va pas sur la planche

- **Collage** : golf, piscine, explosion, bière arrivent saturés et contrastés alors que le rush est neutre, gris-blanc, doux. On voit deux images différentes : la personne et un fond collé derrière.
- **Bords et profondeur** : le fond remplacé est aussi net que la personne, sans grain commun, sans flou d'objectif, et ne bouge pas avec la caméra → effet découpé.
- **Texte illisible** : titres trop petits et fins, gris clair ou noir fin sur un mur gris clair, gros mot fantôme « Wimbledon » presque invisible, bicolore 680/460 trop faible en contraste.
- **Cartes UI blanches sur image claire** : la carte se fond dans le décor (marbre, mur blanc). Pas de séparation.
- **Placement** : l'iPhone et certaines cartes passent sur son visage / son torse ; l'écran verrouillé plein écran blanc écrase tout.

## 2. La méthode couleur (comment obtenir une image cohérente)

1. **Mesurer le rush d'abord** (une image du milieu) : luminance moyenne du mur, du visage, température (le mur est-il froid/neutre/chaud ?). Toute la DA se cale sur ces valeurs, pas l'inverse.
2. **Un seul étalonnage final sur TOUT** (vidéo + fonds + cartes + textes), appliqué en dernier, pour coller les couches entre elles. Version neutre ALOI (pas de dominante chaude) :
   `eq=contrast=1.05:saturation=0.95,curves=all='0/0.015 0.5/0.49 1/0.98',vignette=PI/6,noise=c0s=6:c0f=t`
   Le grain final unique (`noise … :c0f=t`, qui change à chaque image) est ce qui fait disparaître l'effet collage.
3. **Chaque média inséré est ramené vers le rush avant d'être posé** :
   - désaturer de 10 à 25 % ;
   - ramener sa luminance moyenne à ±10 % de celle du mur d'origine ;
   - aligner sa température (un golf vert vif sur un rush neutre → green plus doux, un peu plus gris) ;
   - ajouter un voile sombre léger (`rgba(0,0,0,0.10–0.30)`) si le fond est plus lumineux que la personne. **Jamais un fond plus clair et plus saturé que le sujet.**
4. **Une seule couleur d'accent**, tirée du sujet : le cadran ou la vert boîte Rolex, ou le noir/blanc pur ALOI. Pas une couleur par séquence.

## 3. La méthode d'intégration des vidéos (derrière la personne)

- **Ne remplacer que le mur**, jamais la personne entière : détourage **Robust Video Matting** (modèle resnet50, ONNX, CPU), puis `alpha = 1 − mur × (1 − personne)`, le mur étant défini par une ligne de contour qui suit le haut du mobilier (ici le bord de la table / du dossier). Table, bras, montre restent réels. Utiliser la couleur de premier plan dé-contaminée de RVM sur les cheveux et les bords (pas de liseré clair).
- **Flou d'objectif sur le fond** (2–6 px) : la personne doit rester la chose la plus nette.
- **Parallaxe** : quand la caméra zoome sur lui, le fond bouge environ moitié moins (`scale(1 + (s − 1) × 0.5)`). Ça donne la profondeur.
- **Même grain** sur tout (voir l'étalonnage final), même famille de lumière, pas de masque de lumière spécifique.
- **Entrée du fond** par un balayage (ligne lumineuse qui descend, environ 0,3 s) ou une coupe franche sur le mot, avec un son court sur la même image.
- **Plans de coupe plein écran** (bière, montre) : même étalonnage, poussée lente (push-in), transition motivée (zoom, flash léger) et son sur la même image.

## 4. Le texte (lisible sur téléphone)

- **Tailles en 1080×1920** :
  - sous-titres 50–56 px, graisse 700 ;
  - titres sur une ligne, 90–150 px, graisse 800–900, approche serrée ;
  - jamais de graisse fine ni de gris clair sur la vidéo.
- **Règle de contraste** :
  - **texte blanc + ombre douce sur la vidéo** ;
  - ajouter un voile local (dégradé radial `rgba(0,0,0,0.35)`) quand le fond est clair ;
  - **texte noir seulement sur une surface pleine claire** (carte blanche, page) ;
  - mesurer le contraste réel derrière chaque texte : au moins 4,5:1 pour les petits textes, 3:1 pour les gros.
- **Mots fantômes géants** : uniquement s'ils ont au moins 3:1 de contraste ; sinon, les supprimer.
- **Cartes UI façon Apple** : matière translucide `rgba(246,246,248,0.8)` avec `blur(30px) saturate(1.8)`, graisse 600, un seul ombrage doux. Sur image claire, assombrir légèrement la vidéo derrière ou passer en carte sombre.
- **Placement** :
  - jamais sur le visage ;
  - titres juste sous l'en-tête de l'appli ;
  - notifications en pastilles qui tombent du haut, 2 visibles maximum ;
  - téléphone et cartes à côté de lui, pas devant lui.
- **Zones des plateformes** (téléphone de référence iPhone 13) :
  - premier texte vers y 215 sur Instagram, 190 sur TikTok, 140 sur Shorts ;
  - rien d'important sous y ≈ 1 440 ;
  - colonne likes/commentaires à droite à partir de mi-hauteur.

## 5. Contrôle avant rendu

- Planche de 15 à 20 images aux moments clés, **vue à taille téléphone (environ 360 px de large)** et **dans l'interface de l'appli** (en-tête, colonne d'icônes, @ et légende). Corriger, puis envoyer la planche. Ne rendre qu'après validation.
- Vérifier sur chaque image :
  - le fond inséré a la même luminosité, la même saturation, le même flou et le même grain que le rush ;
  - chaque texte passe le contraste ;
  - rien ne touche le visage.
- Son : −14 LUFS, musique à niveau fixe, un son court par action visible.

Référence technique (méthode, pas style) : https://github.com/Jojogdr/cLAUDECODEPERSO/tree/claude/busy-newton-ri0gpn
- `perfume-reel/scripts/rvm_wall.py` : détourage du mur seul ;
- `perfume-reel/scripts/render_reel.py` : étalonnage final et −14 LUFS ;
- `perfume-reel/src/engine/Reel.tsx` : `WallBg` (voile, parallaxe, balayage) ;
- `perfume-reel/src/engine/Fx.tsx` : notifications, cartes de fin ;
- `perfume-reel/src/preview/PlatformPreview.tsx` : interfaces des applis ;
- `perfume-reel/docs/RECAP_V8_V14.md`.

Ne reprends ni les couleurs ni les polices du montage parfum : seulement la méthode.
