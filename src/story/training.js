/**
 * Salle d'entraînement du club — leçons et exercices tactiques.
 *
 * Le parcours suit la pédagogie classique du jeu de dames international
 * (celle des cours fédéraux FFJD/FMJD) : lecture de la notation Manoury,
 * principes stratégiques (centre, rangée arrière, temps), manœuvres
 * élémentaires, combinaisons (« donner un pour reprendre deux »), rafles,
 * et finales (opposition, promotion).
 *
 * CHAQUE exercice est joué sur le vrai moteur de règles : le coup attendu,
 * les répliques scriptées et la solution sont validés par des tests
 * automatiques (tests/training.test.mjs). Contenu 100 % original.
 *
 * Un exercice = { id, cat, icon, title, desc, reward, steps: [step] }
 * step = {
 *   fen?     : position (sinon on continue la position courante),
 *   intro    : répliques de Gigi avant de jouer,
 *   accept   : [{from,to}] coups acceptés (undefined => tout coup légal),
 *   reply    : {from,to} réplique noire scriptée après le bon coup,
 *   wrong    : réplique de Gigi si mauvais coup (la position est remise),
 *   success  : répliques après réussite de l'étape,
 *   hint     : {from,to} suggestion surlignée après 2 échecs,
 * }
 */

import { RulesEngine } from '../engine/rules.js';

export const EXERCISES = [
  // ------------------------------------------------------------- LES BASES
  {
    id: 'notation',
    cat: 'Les bases',
    icon: '🔢',
    title: 'Lire la notation',
    desc: 'Les 50 cases ont un numéro : apprends à lire un coup.',
    reward: 30,
    steps: [
      {
        fen: 'W:W31-50:B1-20',
        intro: [
          { who: 'gigi', text: 'Chaque case sombre porte un numéro, de 1 en haut à gauche à 50 en bas à droite : c\'est la notation Manoury. Un coup s\'écrit « départ-arrivée », une prise « départ x arrivée ».' },
          { who: 'gigi', text: 'Les damistes du monde entier lisent les parties comme une langue. À toi : joue « 32-28 », le grand coup d\'ouverture classique vers le centre.' },
        ],
        accept: [{ from: 32, to: 28 }],
        wrong: { who: 'gigi', text: 'Non — regarde les numéros écrits sur les cases : je veux le pion de la case 32, vers la case 28.' },
        success: [
          { who: 'gigi', text: '32-28 ! Tu sais lire et jouer un coup noté. Retiens : les Noirs occupent les cases 1 à 20, les Blancs 31 à 50, et la bataille se joue au milieu.' },
        ],
        hint: { from: 32, to: 28 },
      },
    ],
  },
  {
    id: 'backrow',
    cat: 'Les bases',
    icon: '🏰',
    title: 'La rangée arrière',
    desc: 'Ta dernière rangée est un rempart contre les dames adverses.',
    reward: 40,
    steps: [
      {
        fen: 'W:W40,44,45,50:B34,14,9',
        intro: [
          { who: 'gigi', text: 'Principe fédéral n°1 : ne dégarnis pas ta rangée arrière (46 à 50) trop tôt. Chaque pion qui la quitte ouvre une autoroute vers la promotion adverse.' },
          { who: 'gigi', text: 'Ce pion noir en 34 s\'est infiltré : encore deux coups et il se couronne dans ton camp ! Heureusement, la prise obligatoire est TA meilleure défense : élimine-le.' },
        ],
        accept: [{ from: 40, to: 29 }],
        wrong: { who: 'gigi', text: 'Regarde bien : une prise est possible, donc obligatoire — et c\'est tant mieux pour toi !' },
        success: [
          { who: 'gigi', text: 'Capturé ! 40x29 : la menace est éliminée et ta rangée arrière (44, 45, 50) n\'a pas bougé. Un rempart intact, c\'est autant de dames adverses en moins.' },
        ],
        hint: { from: 40, to: 29 },
      },
    ],
  },

  // ------------------------------------------------------------- TACTIQUE
  {
    id: 'coup_de_deux',
    cat: 'Tactique',
    icon: '🎁',
    title: 'Donner un, reprendre deux',
    desc: 'La combinaison de base : un sacrifice, une rafle, un pion de gain.',
    reward: 60,
    steps: [
      {
        fen: 'W:W27,31,36:B17,18,5',
        intro: [
          { who: 'gigi', text: 'La COMBINAISON, c\'est l\'âme du jeu de dames : une suite de coups FORCÉS qui te fait gagner du matériel. La plus simple : offrir un pion… pour en reprendre deux.' },
          { who: 'gigi', text: 'Souviens-toi : si ton adversaire PEUT prendre, il DOIT prendre. Sers-toi de cette règle comme d\'une arme. Offre le bon pion !' },
        ],
        accept: [{ from: 27, to: 22 }],
        reply: { from: 18, to: 27 },
        wrong: { who: 'gigi', text: 'Ce coup ne force rien du tout. Cherche le coup qui met un pion EN PRISE — celui que les Noirs seront OBLIGÉS de capturer.' },
        success: [
          { who: 'gigi', text: '27-22 ! Les Noirs n\'ont pas le choix : 18x27… et maintenant, regarde ce que la prise obligatoire t\'offre.' },
        ],
        hint: { from: 27, to: 22 },
      },
      {
        intro: [
          { who: 'gigi', text: 'À toi de récolter : une rafle de DEUX pions t\'attend. Le damier ne te laissera qu\'elle — c\'est la rafle majoritaire.' },
        ],
        accept: [{ from: 31, to: 11 }],
        success: [
          { who: 'gigi', text: '31x11, deux pions d\'un coup ! Bilan : un pion donné, deux repris. C\'est LE mécanisme à repérer dans chaque partie. La méthode des champions : une combinaison par jour.' },
        ],
        hint: { from: 31, to: 11 },
      },
    ],
  },
  {
    id: 'pion_empoisonne',
    cat: 'Tactique',
    icon: '☠️',
    title: 'Le pion empoisonné',
    desc: 'Un sacrifice qui gagne contre TOUTES les défenses.',
    reward: 70,
    steps: [
      {
        fen: 'W:W24,32,33:B12,22,29',
        intro: [
          { who: 'gigi', text: 'Monte d\'un cran : parfois le sacrifice laisse un CHOIX à l\'adversaire… mais tous les chemins mènent à ta victoire. C\'est la marque d\'une vraie combinaison.' },
          { who: 'gigi', text: 'Un de tes trois pions peut avancer en offrant un festin apparent aux Noirs. Cherche le coup qui gagne quelle que soit la prise choisie.' },
        ],
        accept: [{ from: 32, to: 28 }],
        reply: { from: 29, to: 20 },
        wrong: { who: 'gigi', text: 'Pas celui-là : les Noirs répondent tranquillement. Le bon coup place un pion au CONTACT du pion noir 29, en préparant une reprise en éventail.' },
        success: [
          { who: 'gigi', text: '32-28 ! Le pion noir 29 devait prendre — il a choisi 29x20… mais 29x38 perdait tout autant. Regarde maintenant ta reprise.' },
        ],
        hint: { from: 32, to: 28 },
      },
      {
        intro: [
          { who: 'gigi', text: 'La rafle t\'attend : deux pions noirs sur ta route.' },
        ],
        accept: [{ from: 28, to: 8 }],
        success: [
          { who: 'gigi', text: '28x8, magistral ! Un pion donné, deux repris, et te voilà aux portes de la promotion. Quand chaque défense perd, on dit que la combinaison est CORRECTE — c\'est ça qu\'il faut viser.' },
        ],
        hint: { from: 28, to: 8 },
      },
    ],
  },
  {
    id: 'rafle_max',
    cat: 'Tactique',
    icon: '🌪️',
    title: 'La grande rafle',
    desc: 'Quand plusieurs prises existent, cherche TOUJOURS la plus longue.',
    reward: 50,
    steps: [
      {
        fen: 'W:W33:B28,17,7,29',
        intro: [
          { who: 'gigi', text: 'Règle d\'or du 10×10 : la prise MAJORITAIRE. Entre plusieurs prises possibles, tu dois jouer celle qui capture le plus de pièces. Le damier t\'y oblige… encore faut-il la VOIR.' },
          { who: 'gigi', text: 'Ton pion 33 a l\'embarras du choix. Calcule le chemin qui rafle TROIS pions — sans indice cette fois !' },
        ],
        accept: [{ from: 33, to: 2 }],
        wrong: { who: 'gigi', text: 'Il y a mieux ! Suis le zigzag : chaque saut doit enchaîner sur le suivant. Compte : une… deux… TROIS prises.' },
        success: [
          { who: 'gigi', text: '33x2, trois pions balayés et te voilà à la porte de la promotion ! Avant chaque prise, calcule TOUS les chemins : le plus long est le tien, que ça t\'arrange ou non.' },
        ],
        hint: null,
      },
    ],
  },
  {
    id: 'dame_rafle',
    cat: 'Tactique',
    icon: '👑',
    title: 'La dame chasseresse',
    desc: 'La dame volante capture à distance et enchaîne les prises.',
    reward: 60,
    steps: [
      {
        fen: 'W:WK46:B28,19,5',
        intro: [
          { who: 'gigi', text: 'La dame voit LOIN : elle glisse sur toute la diagonale et peut s\'arrêter où elle veut après chaque prise — de quoi construire des rafles impossibles pour un pion.' },
          { who: 'gigi', text: 'Deux pions noirs traînent sur ta grande diagonale. Ta dame peut les cueillir tous les deux d\'un seul coup : trouve la rafle.' },
        ],
        accept: [{ from: 46, to: 14 }, { from: 46, to: 10 }],
        wrong: { who: 'gigi', text: 'Ta dame peut faire mieux que ça ! Saute le premier pion, pose-toi juste derrière… et regarde ce qui devient prenable.' },
        success: [
          { who: 'gigi', text: 'Et de deux d\'un seul geste ! En finale, une dame active vaut une armée. Note aussi : après chaque saut, tu choisis ta case d\'arrivée — c\'est là tout l\'art.' },
        ],
        hint: { from: 46, to: 14 },
      },
    ],
  },

  // ------------------------------------------------------------- FINALES
  {
    id: 'promotion_race',
    cat: 'Finales',
    icon: '🏁',
    title: 'La course à la dame',
    desc: 'En finale, un temps d\'avance décide de tout.',
    reward: 70,
    steps: [
      {
        fen: 'W:W17:B34,5',
        intro: [
          { who: 'gigi', text: 'Finale typique : chacun court vers sa promotion. Ici, tout se joue au TEMPS — le nombre de coups pour toucher au but. Compte : toi, il te faut combien de coups ? Et lui ?' },
          { who: 'gigi', text: 'Fonce vers la promotion, sans détour : chaque coup doit rapprocher ton pion de la rangée 1-5.' },
        ],
        accept: [{ from: 17, to: 11 }, { from: 17, to: 12 }],
        reply: { from: 34, to: 39 },
        wrong: { who: 'gigi', text: 'Tu perds un temps ! En course, pas de zigzag inutile : avance, avance, avance.' },
        success: [
          { who: 'gigi', text: 'Bien. Lui aussi avance… mais tu as un temps d\'avance et il ne le rattrapera jamais.' },
        ],
        hint: { from: 17, to: 11 },
      },
      {
        accept: [{ from: 11, to: 6 }, { from: 11, to: 7 }, { from: 12, to: 7 }, { from: 12, to: 8 }],
        intro: [{ who: 'gigi', text: 'Encore un pas…' }],
        reply: { from: 39, to: 44 },
        wrong: { who: 'gigi', text: 'Ne t\'arrête pas en si bon chemin : chaque coup vers l\'avant !' },
        success: [{ who: 'gigi', text: 'Au seuil de la promotion !' }],
        hint: null,
      },
      {
        accept: [{ from: 6, to: 1 }, { from: 7, to: 1 }, { from: 7, to: 2 }, { from: 8, to: 2 }, { from: 8, to: 3 }],
        intro: [{ who: 'gigi', text: 'Couronne-toi !' }],
        wrong: { who: 'gigi', text: 'La dernière rangée t\'attend !' },
        success: [
          { who: 'gigi', text: 'DAME ! Et le pion noir n\'est qu\'en route… Ta dame toute neuve n\'en fera qu\'une bouchée. Voilà pourquoi on compte les temps : un seul coup d\'avance, et la finale est gagnée.' },
        ],
        hint: null,
      },
    ],
  },
  {
    id: 'opposition',
    cat: 'Finales',
    icon: '⚖️',
    title: 'L\'opposition (zugzwang)',
    desc: 'Le duel pion contre pion : force l\'adversaire à se perdre lui-même.',
    reward: 80,
    steps: [
      {
        fen: 'W:W32:B18',
        intro: [
          { who: 'gigi', text: 'Le grand duel : un pion contre un pion. Ici, pas de combinaison — c\'est une affaire de CASES. Il existe un coup après lequel le pion noir est perdu quoi qu\'il fasse : on appelle ça le zugzwang, « l\'obligation de jouer ».' },
          { who: 'gigi', text: 'Attention : une seule de tes deux avances gagne. L\'autre laisse le noir s\'échapper vers la nulle. Regarde les cases où il POURRA aller… et choisis.' },
        ],
        accept: [{ from: 32, to: 28 }],
        reply: { from: 18, to: 22 },
        wrong: { who: 'gigi', text: 'Nulle ! Par là, le pion noir garde toujours une case de fuite. Reprends : après ton coup, ses DEUX avances doivent tomber sous ta prise.' },
        success: [
          { who: 'gigi', text: '32-28 ! Regarde le pion noir : ses deux seules cases, 22 et 23, sont TOUTES LES DEUX sous ta prise. Il doit pourtant jouer… Il tente 22.' },
        ],
        hint: null,
      },
      {
        intro: [
          { who: 'gigi', text: 'Il a joué son coup forcé. Conclus !' },
        ],
        accept: [{ from: 28, to: 17 }],
        wrong: { who: 'gigi', text: 'La prise est là — et elle est obligatoire !' },
        success: [
          { who: 'gigi', text: '28x17, et le damier est à toi. Retiens la leçon : en finale, on ne compte pas que les pions, on compte les CASES et les TEMPS. Celui qui doit jouer est parfois déjà battu.' },
        ],
        hint: { from: 28, to: 17 },
      },
    ],
  },
];

export const TRAINING_CATEGORIES = ['Les bases', 'Tactique', 'Finales'];

export function exerciseById(id) {
  return EXERCISES.find((e) => e.id === id);
}

/**
 * Déroule un exercice sur le damier de l'écran de partie.
 * @returns {Promise<boolean>} true si terminé, false si interrompu
 */
export async function runExercise(ex, { boardView, dialogue, setStatus, signal }) {
  let engine = null;
  let fails = 0;

  for (let i = 0; i < ex.steps.length; i++) {
    const step = ex.steps[i];
    if (signal.aborted) return false;
    setStatus(`${ex.title} — étape ${i + 1}/${ex.steps.length}`);

    if (step.fen) engine = new RulesEngine(step.fen);
    const stepFen = engine.fen(); // point de reprise en cas de mauvais coup
    boardView.setState(engine.getBoard(), { lastMove: null });
    if (step.intro) await dialogue.play(step.intro);
    if (signal.aborted) return false;

    // Boucle d'essais : on attend LE bon coup, sinon on remet la position.
    let solved = false;
    while (!solved && !signal.aborted) {
      const move = await waitForMove(engine, boardView, signal, fails >= 2 ? step.hint : null);
      if (signal.aborted) return false;

      const ok = !step.accept
        || step.accept.some((a) => a.from === move.from && a.to === move.to);
      if (ok) {
        solved = true;
        // Réplique noire scriptée (animée)
        if (step.reply) {
          await new Promise((r) => setTimeout(r, 320));
          const before = engine.getBoard();
          const replyMove = engine.getLegalMoves().find((m) => m.from === step.reply.from && m.to === step.reply.to);
          if (replyMove) {
            engine.applyMove(replyMove);
            await boardView.animateMove(replyMove, before, engine.getBoard());
          }
        }
      } else {
        fails++;
        if (step.wrong) await dialogue.play([step.wrong]);
        engine.loadFen(stepFen); // on remet la position de l'étape
        boardView.setState(engine.getBoard(), { lastMove: null });
      }
    }
    if (signal.aborted) return false;
    if (step.success) await dialogue.play(step.success);
  }
  return !signal.aborted;
}

/** Attend un coup légal joué sur le damier (sélection + destination). */
function waitForMove(engine, boardView, signal, hint = null) {
  return new Promise((resolve) => {
    signal.onAbort(resolve);
    let selected = null;
    const refresh = () => {
      const moves = engine.getLegalMoves();
      boardView.setState(engine.getBoard(), {
        selected,
        targets: selected
          ? moves.filter((m) => m.from === selected).map((m) => ({ to: m.to, captures: m.captures }))
          : [],
        moveable: [...new Set(moves.map((m) => m.from))],
        hint: selected ? null : hint,
        lastMove: null,
      });
    };
    refresh();
    boardView.onTap = async (sq) => {
      if (signal.aborted) return resolve(null);
      const moves = engine.getLegalMoves();
      const target = selected && moves.find((m) => m.from === selected && m.to === sq);
      if (target) {
        boardView.onTap = null;
        const before = engine.getBoard();
        engine.applyMove(target);
        await boardView.animateMove(target, before, engine.getBoard());
        resolve(target);
      } else if (sq && moves.some((m) => m.from === sq)) {
        selected = sq;
        refresh();
      } else {
        selected = null;
        refresh();
      }
    };
  });
}
