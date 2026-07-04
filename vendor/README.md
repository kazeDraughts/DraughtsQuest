# Bibliothèque vendorisée : @jortvl/draughts

- **Fichier** : `draughts.js`
- **Origine** : paquet npm [`@jortvl/draughts`](https://www.npmjs.com/package/@jortvl/draughts) v0.4.2
  (fork maintenu de [draughts.js](https://github.com/shubhendusaurabh/draughts.js)),
  fichier `src/draughts.cjs`.
- **Rôle** : moteur de règles des dames internationales 10x10 (génération et validation
  des coups, prise obligatoire, rafle majoritaire, promotion, FEN/PDN, détection de fin
  de partie). Le jeu ne l'utilise **qu'à travers** l'interface
  `src/engine/rules.js` (`RulesEngine`), ce qui le rend remplaçable.
- **Licence** : **MPL-2.0** (Mozilla Public License 2.0) — voir `LICENSE-MPL-2.0.txt`.

## Note de licence

Il n'existe pas, à notre connaissance, de bibliothèque JavaScript de dames
internationales 10x10 sous licence MIT (les pistes `draughts.js` et
`@jortvl/draughts` sont en MPL-2.0 ; `rapid-draughts` est MIT mais ne couvre que
les dames anglaises 8x8 ; `draughts-reader-core` est sans licence déclarée).

La MPL-2.0 n'est **pas** la GPL : c'est un copyleft *faible, limité au fichier*.
Elle n'impose rien au reste du projet (qui reste sous MIT) tant que :
1. le fichier MPL et sa licence sont conservés (c'est le cas ici) ;
2. les modifications de **ce fichier** restent sous MPL-2.0.

## Modification apportée (conformément à la MPL-2.0)

Le fichier d'origine est repris à l'identique, **à une addition près** : trois
lignes ajoutées en fin de fichier pour l'exposer comme module ES
(`export { Draughts }`), afin qu'il soit importable dans le navigateur, dans un
Web Worker de type module et dans Node sans étape de build. Ces lignes ajoutées
sont, comme le reste du fichier, couvertes par la MPL-2.0.

Pour remplacer ce moteur : implémenter la même interface que `RulesEngine`
(`getLegalMoves`, `applyMove`, `isGameOver`, `winner`, `getBoard`, `fen`,
`loadFen`, `turn`) et changer l'import dans `src/engine/rules.js`.
