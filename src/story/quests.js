/**
 * Scénario de DraughtsQuest : drapeaux d'avancement, objectif courant,
 * scènes automatiques (intro, rencontre de Gigi) et dialogues des PNJ.
 *
 * Drapeaux principaux (state.story.flags) :
 *   intro_done      — la maman a envoyé Tim chez Papi Marcel
 *   tutorial_done   — le tutoriel de Papi est terminé
 *   grandpa_beaten  — Papi battu en vraie partie
 *   club_unlocked   — l'accès au club d'Otterlaws est ouvert
 *   met_gigi        — Gigi rencontré au club
 *
 * ctx (fourni par WorldController) :
 *   { flag, setFlag, state, say(lines), startMatch(cfg), startTutorial(),
 *     openShop(), openCompetitions() }
 */

import { sparringAvailable } from '../career/opponents.js';

// ---------------------------------------------------------------------------
// Objectif courant (affiché dans le HUD du monde)
// ---------------------------------------------------------------------------
export function currentObjective(flag, state) {
  if (!flag('intro_done')) return 'Parle à Maman.';
  if (!flag('tutorial_done')) return 'Va chez Papi Marcel, il a une surprise pour toi.';
  if (!flag('grandpa_beaten')) return 'Bats Papi Marcel dans une vraie partie !';
  if (!flag('met_gigi')) return 'Va au club d\'Otterlaws (au nord) et rencontre Gigi.';
  if (flag('world_champion')) return 'Tu es CHAMPION DU MONDE ! Savoure… et joue pour le plaisir.';
  const won = state?.career.competitionsWon || [];
  const beaten = state?.career.beaten || {};
  if (!beaten.momo) return 'Défie Momo au club (parle-lui).';
  if (!won.includes('club_open')) return 'Remporte le Tournoi du club (tableau d\'affichage).';
  if (!won.includes('regional')) return 'Remporte le Championnat régional !';
  if (!won.includes('national')) return 'Remporte le Championnat national !';
  return 'Remporte le Championnat du MONDE !';
}

// ---------------------------------------------------------------------------
// Scènes automatiques à l'arrivée sur une carte
// ---------------------------------------------------------------------------
export async function onMapEntered(mapId, ctx) {
  if (mapId === 'home' && !ctx.flag('intro_done')) {
    await ctx.say([
      { who: 'player', text: 'Maman… je m\'ennuiiiie. Il n\'y a RIEN à faire ici.' },
      { who: 'mom', text: 'Tu t\'ennuies ? Par ce beau soleil ? File donc chez Papi Marcel, il m\'a dit qu\'il avait une surprise pour toi.' },
      { who: 'player', text: 'Une surprise ? Chez Papi ? …Bon, d\'accord, j\'y vais !' },
      { who: 'mom', text: 'Sa maison est juste au nord de la nôtre, sur le chemin. Amuse-toi bien mon grand !' },
    ]);
    ctx.setFlag('intro_done');
  }

  if (mapId === 'club' && !ctx.flag('met_gigi')) {
    await ctx.say([
      { who: 'arbiter', text: 'Tiens, une nouvelle recrue ! Entre, entre. Le patron veut sûrement te voir.' },
      { who: 'gigi', text: 'Alors c\'est toi, le petit prodige de Marcel ? On m\'appelle Gigi. Grand maître, vice-champion du monde 1987… et désormais ton entraîneur.' },
      { who: 'player', text: 'Papi dit que vous êtes le meilleur joueur qu\'il connaisse !' },
      { who: 'gigi', text: 'Marcel exagère à peine. Écoute : ici on progresse en jouant. Bats les membres du club, et je t\'ouvrirai les portes des tournois. Régional, national… mondial, si tu en as l\'étoffe.' },
      { who: 'gigi', text: 'Commence par Momo, là-bas. Et n\'oublie jamais : la rafle majoritaire, c\'est la vie.' },
    ]);
    ctx.setFlag('met_gigi');
  }
}

// ---------------------------------------------------------------------------
// Défi de Papi Marcel (la « vraie » partie qui déverrouille le club)
// ---------------------------------------------------------------------------
export function grandpaChallenge(ctx) {
  ctx.startMatch({
    opponent: 'grandpa',
    level: 'debutant',
    extra: 'Le défi de Papi',
    result: {
      win: {
        flags: ['grandpa_beaten', 'club_unlocked'],
        title: 'Tu as battu Papi ! 🎉',
        detail: 'Le vieux maître s\'incline…',
        lines: [
          { who: 'grandpa', text: 'Ça alors… battu par mon propre petit-fils ! Je n\'ai plus rien à t\'apprendre, gamin.' },
          { who: 'grandpa', text: 'File en ville, au club d\'Otterlaws. Demande GIGI de ma part : c\'est un grand maître, il fera de toi un champion.' },
          { who: 'player', text: 'Le club d\'Otterlaws… j\'y cours ! Merci Papi !' },
        ],
      },
      lose: {
        retry: true,
        title: 'Papi l\'emporte…',
        detail: 'Il en a encore sous la casquette !',
        lines: [
          { who: 'grandpa', text: 'Héhé, pas si vite ! Observe bien : chaque prise doit te rapporter plus qu\'elle ne te coûte. Allez, on remet ça quand tu veux.' },
        ],
      },
      draw: {
        retry: true,
        title: 'Partie nulle',
        detail: 'Personne ne cède !',
        lines: [
          { who: 'grandpa', text: 'Une nulle ? Pas mal… mais pour entrer au club, il faudra me BATTRE !' },
        ],
      },
    },
  });
}

/** Après le tutoriel : Papi propose le vrai défi. */
export async function afterTutorial(ctx) {
  const answer = await ctx.say([
    {
      who: 'grandpa',
      text: 'Alors, prêt pour ta première vraie partie ? Si tu me bats, je t\'inscris au club de la ville !',
      choices: [
        { label: 'On y va, Papi !', value: 'play' },
        { label: 'Laisse-moi souffler…', value: 'later' },
      ],
    },
  ]);
  if (answer === 'play') grandpaChallenge(ctx);
  else await ctx.say([{ who: 'grandpa', text: 'Reviens me voir quand tu seras prêt. Le damier ne bouge pas d\'ici !' }]);
}

/** Dialogue type d'un membre du club : défi si disponible, sinon consigne. */
function clubSparring(ctx, oppId, inviteText, lockedText) {
  if (!ctx.flag('met_gigi')) {
    return { lines: [{ who: oppId, text: 'Salut ! Va d\'abord te présenter à Gigi, c\'est lui le patron ici.' }] };
  }
  if (!sparringAvailable(oppId, ctx.state.career)) {
    return { lines: [{ who: oppId, text: lockedText }] };
  }
  return {
    lines: [
      {
        who: oppId,
        text: inviteText,
        choices: [
          { label: 'On joue !', value: 'play' },
          { label: 'Plus tard.', value: 'later' },
        ],
      },
    ],
    onDone: (a) => {
      if (a === 'play') ctx.startMatch({ opponent: oppId, career: oppId });
    },
  };
}

// ---------------------------------------------------------------------------
// Conseils de Gigi avant chaque ronde de compétition
// ---------------------------------------------------------------------------
export const GIGI_TIPS = {
  club_open: [
    [{ who: 'gigi', text: 'Conseil de coach : contre Momo, occupe le CENTRE. Les bords, c\'est pour les timides.' }],
    [{ who: 'gigi', text: 'Léa défend bien. Sois patient : prépare tes rafles deux coups à l\'avance.' }],
    [{ who: 'gigi', text: 'Karim attaque fort mais laisse des trous. Compte chaque échange : ne donne jamais deux pour un.' }],
  ],
  regional: [
    [{ who: 'gigi', text: 'Le régional, ça se gagne avec les TEMPS : chaque coup doit menacer quelque chose.' }],
    [{ who: 'gigi', text: 'Bastien adore les pièges d\'ouverture. Méfie-toi des cadeaux : un pion offert cache souvent une rafle.' }],
    [{ who: 'gigi', text: 'Mireille joue la finale mieux que personne. Si tu peux promouvoir avant elle, fonce !' }],
  ],
  national: [
    [{ who: 'gigi', text: 'Niveau national ! Verrouille ta rangée arrière et avance en bloc, comme une marée.' }],
    [{ who: 'gigi', text: 'Rappelle-toi : une dame vaut trois pions. Sacrifier pour promouvoir est souvent gagnant.' }],
    [{ who: 'gigi', text: 'Et maintenant… moi. Pas de conseil cette fois, gamin. Montre-moi TOUT ce que tu as appris.' }],
  ],
  world: [
    [{ who: 'gigi', text: 'Anke Vries, école néerlandaise : positionnelle, implacable. Ne lui laisse pas UNE case faible.' }],
    [{ who: 'gigi', text: 'Sergueï Volk calcule comme une machine. Complique la position : les machines détestent le chaos.' }],
    [{ who: 'gigi', text: 'Viktor Roi, champion du monde… Il n\'a qu\'une faiblesse : il n\'a jamais joué contre TOI. Va écrire l\'histoire, gamin.' }],
  ],
};

/** Scène de fin : Tim est champion du monde. */
export async function worldChampionScene(ctx) {
  await ctx.say([
    { who: 'gigi', text: 'CHAMPION DU MONDE ! Gamin… non. CHAMPION. Tu as fait mentir tous les pronostics.' },
    { who: 'player', text: 'On l\'a fait ensemble, Gigi. Toi, Papi, le club… tout Otterlaws !' },
    { who: 'gigi', text: 'Marcel avait raison depuis le début : tu avais le damier dans le sang. File le voir, il t\'attend avec le champagne… enfin, la limonade.' },
    { who: 'mom', name: 'Maman (au téléphone)', text: 'MON CHÉRI ! Toute la ville parle de toi ! Dire qu\'il y a quelques mois, tu t\'ennuyais…' },
    { who: 'player', text: 'C\'est vrai… Finalement, il suffisait d\'une surprise de Papi. Et de beaucoup, beaucoup de rafles majoritaires.' },
  ]);
}

// ---------------------------------------------------------------------------
// Dialogues des PNJ
// ---------------------------------------------------------------------------
export function getNpcDialogue(npcId, ctx) {
  const f = ctx.flag;

  switch (npcId) {
    case 'mom': {
      if (!f('intro_done')) {
        return {
          lines: [
            { who: 'mom', text: 'File chez Papi Marcel, mon grand. Sa maison est au nord, sur le chemin.' },
          ],
        };
      }
      if (!f('tutorial_done')) {
        return { lines: [{ who: 'mom', text: 'Alors, cette surprise ? Papi t\'attend, sa maison est juste au nord !' }] };
      }
      if (!f('grandpa_beaten')) {
        return { lines: [{ who: 'mom', text: 'Le jeu de dames ! J\'aurais dû m\'en douter… Il y jouait déjà avec ton arrière-grand-mère. Va lui montrer ce que tu vaux !' }] };
      }
      return { lines: [{ who: 'mom', text: 'Mon fils, futur champion du monde de dames ! Je suis si fière de toi. File au club, ne fais pas attendre ce M. Gigi.' }] };
    }

    case 'grandpa': {
      if (!f('tutorial_done')) {
        return {
          lines: [
            { who: 'grandpa', text: 'Ah, Tim ! Te voilà enfin. Ta mère t\'a parlé de ma surprise ?' },
            { who: 'grandpa', text: 'La voici : mon vieux damier ! Le JEU DE DAMES INTERNATIONAL, cent cases, le jeu des rois et des malins.' },
            {
              who: 'grandpa',
              text: 'Je vais t\'apprendre à jouer. Tu vas voir, c\'est simple à apprendre… et impossible à lâcher. Prêt ?',
              choices: [
                { label: 'Apprends-moi, Papi !', value: 'tutorial' },
                { label: 'Euh… plus tard.', value: 'later' },
              ],
            },
          ],
          onDone: (answer) => {
            if (answer === 'tutorial') ctx.startTutorial();
          },
        };
      }
      if (!f('grandpa_beaten')) {
        return {
          lines: [
            {
              who: 'grandpa',
              text: 'Tu connais les règles, maintenant. Alors, ce défi : si tu me bats, je t\'inscris au club d\'Otterlaws. On joue ?',
              choices: [
                { label: 'On joue !', value: 'play' },
                { label: 'Pas tout de suite.', value: 'later' },
              ],
            },
          ],
          onDone: (answer) => {
            if (answer === 'play') grandpaChallenge(ctx);
          },
        };
      }
      // Papi battu : partie amicale à volonté
      return {
        lines: [
          {
            who: 'grandpa',
            text: f('met_gigi')
              ? 'Alors, comment se passe le club ? Gigi est un sacré personnage, hein ? Une petite amicale pour la forme ?'
              : 'Le club d\'Otterlaws, gamin ! En ville, au nord. Demande Gigi ! …Ou alors, une petite amicale d\'abord ?',
            choices: [
              { label: 'Une amicale !', value: 'play' },
              { label: 'Une autre fois.', value: 'later' },
            ],
          },
        ],
        onDone: (answer) => {
          if (answer === 'play') {
            ctx.startMatch({ opponent: 'grandpa', level: 'debutant', extra: 'Partie amicale' });
          }
        },
      };
    }

    case 'gigi': {
      if (!f('met_gigi')) {
        return { lines: [{ who: 'gigi', text: 'Approche, gamin, je ne mords pas. Enfin… pas en dehors du damier.' }] };
      }
      if (f('world_champion')) {
        return { lines: [{ who: 'gigi', text: 'Le CHAMPION DU MONDE en personne, dans mon petit club… Marcel doit pleurer de fierté. Moi ? Une poussière dans l\'œil, c\'est tout.' }] };
      }
      const career = ctx.state.career;
      const lesson = !career.beaten.momo
        ? 'Leçon n°1 : ne compte pas tes pièces, compte les TEMPS. Un coup d\'avance vaut un pion. Commence par battre Momo.'
        : !career.beaten.lea
          ? 'Leçon n°2 : la rangée arrière est un rempart. Ne la dégarnis pas trop tôt. Léa adore punir ça — va la défier.'
          : !career.beaten.karim
            ? 'Leçon n°3 : construis des COLONNES, des pièces qui se soutiennent. Karim te montrera pourquoi. Défie-le !'
            : 'Tu as battu tout mon petit monde… Le tableau d\'affichage t\'attend : les compétitions, c\'est là que naissent les champions.';
      if (sparringAvailable('gigi', career)) {
        return {
          lines: [
            { who: 'gigi', text: lesson },
            {
              who: 'gigi',
              text: 'Et si tu veux tâter du grand maître… je suis à ta disposition. Sans pitié, évidemment.',
              choices: [
                { label: 'Défier Gigi !', value: 'play' },
                { label: 'Pas encore…', value: 'later' },
              ],
            },
          ],
          onDone: (a) => {
            if (a === 'play') ctx.startMatch({ opponent: 'gigi', career: 'gigi' });
          },
        };
      }
      return { lines: [{ who: 'gigi', text: lesson }] };
    }

    case 'momo':
      return clubSparring(ctx, 'momo',
        'Salut ! Moi c\'est Momo. Je calcule une rafle de quatre. Ou de trois. Bon, de deux. On joue ?',
        'Bats d\'abord… non attends, avec moi tout le monde peut jouer !');
    case 'lea':
      return clubSparring(ctx, 'lea',
        'Petit conseil : garde ta rangée arrière le plus longtemps possible. Tu veux vérifier ça sur le damier ?',
        'Reviens me voir quand tu auras battu Momo. Chacun son tour !');
    case 'karim':
      return clubSparring(ctx, 'karim',
        'Un jour, je battrai Gigi. En attendant… c\'est toi que je vais battre. On joue ?',
        'Bats d\'abord Léa, gamin. Ici, on grimpe les échelons dans l\'ordre.');
    case 'arbiter':
      return { lines: [{ who: 'arbiter', text: 'Règlement FMJD, article 4.4 : la prise majoritaire est obligatoire. Je dis ça, je dis rien.' }] };
    case 'shopkeeper':
      return {
        lines: [
          {
            who: 'shopkeeper',
            text: 'Bienvenue ! Damiers de collection, pièces fantaisie… tout s\'achète avec les Pions d\'Or que tu gagnes en jouant. On regarde ?',
            choices: [
              { label: 'Voir la boutique', value: 'shop' },
              { label: 'Juste de passage.', value: 'no' },
            ],
          },
        ],
        onDone: (a) => {
          if (a === 'shop') ctx.openShop();
        },
      };

    case 'villager1':
      return { lines: [{ who: 'villager1', text: 'La ville d\'Otterlaws est au nord. Leur club de dames est réputé dans toute la région !' }] };
    case 'villager2':
      return { lines: [{ who: 'villager2', text: 'On raconte que le grand maître Gigi a été vice-champion du monde, dans le temps.' }] };

    default:
      return { lines: [{ who: npcId, text: 'Bonjour !' }] };
  }
}
