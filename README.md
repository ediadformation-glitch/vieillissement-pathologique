# Vérifications

Avec Node, uniquement pour les tests :

```
node tests/engine.test.cjs
node tests/storage.test.cjs
node tests/progress.test.cjs
```

Les tests couvrent les 26 repères du corrigé, les reformulations, réponses partielles, conduites contraires, fautes simples, formulations très courtes, absence de limite de longueur, sauvegarde, isolation des sessions, migration et distinction des situations vides/non corrigées/corrigées.

Parcours navigateur à vérifier : choisir directement un bloc ; avancer avec tous les champs vides ; aller directement à la situation 8 ; écrire un seul mot ; consulter le corrigé du bloc sans compléter les autres ; revoir et modifier une réponse ; consulter de nouveau le corrigé ; vérifier les cinq blocs et le bilan général ; télécharger le PDF ; rafraîchir et retrouver les réponses.

Le téléchargement réel du PDF a été vérifié dans Chromium. Les cas PDF varié, vide et long ont été générés et leurs pages rendues pour inspection ; le test navigateur inclut des caractères arabes pour vérifier la préservation des autres alphabets. Vérifier aussi les petits écrans et le graphique, qui doit garder ses libellés visibles sans déborder.

Firefox et Safari n’ont pas été exécutés ici. L’application utilise les API standard des navigateurs récents. L’URL publique GitHub Pages doit être testée après publication.
