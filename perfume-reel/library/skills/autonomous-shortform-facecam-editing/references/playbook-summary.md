# Les principes du playbook « Claude Edit » (Mr Paid Social), reformulés

Source d'inspiration : *The Claude Edit Playbook* de Caleb Kruse (Mr Paid Social). Ce document résume la méthode
telle que nous l'avons mise en œuvre — il ne reproduit pas le PDF.

## L'idée
Une seule prise talking-head, un agent, une pub finie : la vidéo joue **entière** en dessous (avec son propre son)
et, par-dessus, **une carte motion-graphics par phrase**, des captions synchronisées au mot, un count-up sur chaque
nombre, une barre de progression, des zoom punches, ~40 hits de SFX et un music bed.

## Les 7 phases
1. **Probe & crop** — connaître la source (résolution, fps, durée), puis produire deux cadrages : une *bande* pour les
   layouts partagés (chez nous un **carré 1000×1000** centré sur le visage) et un *full-bleed 9:16* serré pour les
   moments dramatiques. Keyframe **chaque seconde** (`-g 30 -keyint_min 30`) sinon le rendu fige au seek.
2. **Transcription mot-à-mot** — la colonne vertébrale : chaque carte, caption et SFX atterrit sur un mot. Corriger les
   noms de marque en place, garder les timestamps, clamper le dernier mot à la durée du média.
3. **Voler la marque** — palette, logo, vrais screenshots du site (un vrai écran dans une carte blanche = preuve ; un
   mockup = pub). Écrire un bloc de tokens dont tout hérite : repointer la même compo sur une autre marque re-skinne tout.
4. **B-roll du site** — 4 à 6 clips de 3-6 s du site qui défile, propres (sans cookie banner ni widget), cadrés dans une
   fenêtre navigateur (points de couleur + pilule d'URL). Nous les **synthétisons** depuis une capture full-page : zéro
   parasite, déterministe.
5. **Storyboard** — pour chaque phrase, un *mode de cadrage* (`split` / `solo` / `fullhim` / `full`) et un *archétype*
   de carte, avec le mot exact où chaque beat tombe. Règles : tout nombre → count-up ; toute liste → items qui poppent
   mot par mot ; « le statu quo est faux » → screenshot + tampon rouge ; « de ça à ça » → avant/après ; le mot émotionnel
   → takeover plein écran ; preuve sociale → count-up + étoiles + page avis ; garantie → shield ; CTA sur les 3 dernières
   secondes → logo, offre, bouton qui pulse, flèche qui rebondit. Hard-cut vers le plein cadre, tween entre split et solo.
6. **Composition** — un fichier HTML, une seule timeline GSAP **pausée**, tout en local (fonts, GSAP, images, audio :
   jamais de CDN). On dessine ~15 cartes à la main (le goût), on **génère** le reste (captions, SFX) depuis le transcript.
   Captions : chunks de 1-3 mots, nouveau chunk à 0,45 s de pause ou ponctuation, fin = début du suivant −0,04 s ; mots
   d'argent colorés (rouge quand on agite les coûts, vert pour les gains, couleur de marque pour le CTA).
7. **Son puis QA** — un kit de ~12 sons réutilisé sur ~40 hits posés sur le mot exact ; un bed 18-20 dB sous la voix ;
   auditer chaque son généré (un tiers reviennent muets), normaliser le kit. Puis lint → snapshots → **regarder** →
   corriger → render → vérifier le fichier (`ffprobe`, loudness), jamais le log de rendu.

## Règles de mix (point de départ)
UI pops 0,32 · whooshes 0,30 · stamps/impacts 0,50 · ticks de count-up 0,40-0,45 · cha-ching 0,40 · bed 0,07-0,10
(pour une voix normalisée à −16 LUFS). Faire confiance à ses oreilles ensuite.

## Ce que nous avons ajouté
Miroir + recadrage serré depuis la source native ; fenêtre vidéo qui alterne arrondi / pilule / cercle avec une bordure
« crayon » (SVG déterministe) ; variante **détourée** (personnage sur fond papier, blob animé et texte *derrière* le sujet) ;
pré-cut des silences et des reprises avec les raccords cachés dans un changement de cadrage.
