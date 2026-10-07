# Vieillissement pathologique - Formation ADVF

Application statique entièrement publiable sur GitHub Pages. Tous les fichiers, illustrations et outils PDF sont inclus. Aucun compte, aucune API distante, aucun serveur applicatif.

## Mettre l’application sur GitHub

1. Télécharger la nouvelle archive, puis faire « Extraire tout » sur l’ordinateur.
2. Dans le dépôt GitHub, choisir **Add file → Upload files**.
3. Glisser **le contenu du dossier extrait** : `index.html`, les dossiers `assets`, `css`, `js` et les autres fichiers. Conserver ces dossiers. Ne pas déposer le ZIP lui-même et ne pas mettre le dossier parent autour de l’ensemble : `index.html` doit être à la racine du dépôt.
4. Cliquer sur **Commit changes**.
5. Dans **Settings → Pages**, choisir **Deploy from a branch**, branche `main`, dossier **/ (root)**, puis **Save**.

Guide officiel : https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

Les images sont des JPEG réduits à 768 pixels de côté maximum, environ 1,3 Mo pour les 27 illustrations. L’ensemble du site pèse environ 2 Mo avant compression. Le plus gros fichier est le module PDF, environ 525 ko. Aucun fichier n’approche la limite de 25 Mio de l’envoi GitHub par navigateur.

## Utiliser l’application

- Choisir directement un des cinq blocs sur l’accueil ou dans le parcours.
- Dans chaque bloc, utiliser les numéros pour accéder directement à une situation.
- Passer une question et revenir dessus librement. Aucun minimum ou maximum de mots ou de caractères ; les réponses peuvent être très courtes. Aucun contrôle de saisie ne bloque le parcours.
- À la dernière situation du bloc, choisir **Voir la correction de ce bloc**, même si certaines réponses sont vides. Seul ce bloc est corrigé.
- Les réponses restent modifiables. Après une modification, consulter de nouveau la correction en fin de bloc pour actualiser le bilan du bloc.
- Ouvrir **Mon bilan général** à tout moment : points forts, pistes à approfondir, graphique du parcours et téléchargement d’un véritable PDF avec les réponses et les corrections déjà consultées.

Les situations sans réponse sont « À explorer ». Les réponses des blocs non corrigés restent séparées. Le bilan n’attribue aucune note à la maîtrise du français. L’analyse locale des concepts reste indicative ; un formateur peut reconnaître une autre formulation pertinente.

Les réponses sont sauvegardées sur cet appareil et dans ce navigateur. Les anciennes sessions sont reprises automatiquement. Deux appareils ont des réponses indépendantes. Le mode privé ou un stockage désactivé peut empêcher la conservation : le message de sauvegarde le signale. Aucune réponse n’est envoyée à GitHub ni à un service externe. Sur un appareil partagé, recommencer le parcours avant le prochain apprenant.

## Fichiers

Questions dans `js/questions.js`, corrigé dans `js/reference.js`, analyse dans `js/correction.js`, navigation dans `js/app.js`, bilan PDF dans `js/report-pdf.js`. Le module libre pdf-lib est inclus avec sa licence MIT dans `js/vendor/`. Illustrations `assets/illustrations/s01.jpg` à `s26.jpg`, avec leurs descriptions dans `illustration-prompts.md`.

Les textes des situations et les repères professionnels proviennent des deux PDF fournis. Comme pour toute application statique, le fichier de corrigé reste consultable par une personne qui examine les fichiers du site.

Pour un aperçu local, ouvrir `index.html` dans un navigateur récent ou utiliser un serveur statique. L’application ne nécessite aucune compilation. Les tests utilisent Node uniquement comme outil de vérification : voir `tests/README.md`.
