# Convertisseur d'unités

Application web installable (PWA), sans framework ni dépendance, pensée pour mobile et utilisable hors ligne.

Catégories : distance, vitesse, masse, température, force.

La dernière catégorie ouverte, ainsi que la valeur et les unités de chaque catégorie, sont mémorisées sur l'appareil (localStorage).

## Lancer en local

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000. Sur téléphone (même Wi-Fi) : http://<IP-du-Mac>:8000.

## Tests

Avec l'outil de test intégré à Node (version 22 ou plus) :

```bash
npm test
```

## Ajouter une unité

Dans `units.js`, ajouter une ligne à la catégorie voulue avec son `factor` vers l'unité de référence
(mètre, m/s, kg, newton).

## Structure

- `index.html`, `style.css`, `app.js` : interface
- `units.js` : catégories, facteurs, conversion, saisie/affichage des nombres
- `manifest.json`, `sw.js`, `icons/` : installation et mode hors ligne
- `tests/units.test.js` : tests des conversions
