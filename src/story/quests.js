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
import {
  COMBO_BANK, comboSeriesById, combosSolved, comboSeriesDone, comboSeriesAvailable,
} from './combos.js';
import { styleByNpc, styleDone, stylePracticeWon } from './academy.js';

/** Accord de genre : gg(state)('champion', 'championne'). */
const gg = (state) => (m, f) => (state?.player?.gender === 'girl' ? f : m);

// ---------------------------------------------------------------------------
// Objectif courant (affiché dans le HUD du monde)
// ---------------------------------------------------------------------------
export function currentObjective(flag, state) {
  const g = gg(state);
  if (!flag('intro_done')) return 'Parle à Maman.';
  if (!flag('tutorial_done')) return 'Va chez Papi Marcel, il a une surprise pour toi.';
  if (!flag('grandpa_beaten')) return 'Bats Papi Marcel dans une vraie partie !';
  if (!flag('met_gigi')) return 'Va au club d\'Otterlaws (au nord) et rencontre Gigi.';
  if (flag('world_champion')) return `Tu es ${g('CHAMPION', 'CHAMPIONNE')} DU MONDE ! Savoure… et joue pour le plaisir.`;
  const won = state?.career.competitionsWon || [];
  const beaten = state?.career.beaten || {};
  const trained = Object.keys(state?.training?.done || {}).length;
  if (!beaten.momo) {
    return trained >= 2
      ? 'Défie Momo au club (parle-lui).'
      : 'Suis les leçons de Gigi à la table d\'entraînement du club, puis défie Momo.';
  }
  if (!won.includes('club_open')) return 'Remporte le Tournoi du club (tableau d\'affichage).';
  if (!won.includes('regional')) return 'Remporte le Championnat régional !';
  if (!won.includes('national')) return 'Remporte le Championnat national !';
  return 'Remporte le Championnat du MONDE !';
}

// ---------------------------------------------------------------------------
// Scènes automatiques à l'arrivée sur une carte
// ---------------------------------------------------------------------------
export async function onMapEntered(mapId, ctx) {
  const g = gg(ctx.state);
  if (mapId === 'home' && !ctx.flag('intro_done')) {
    await ctx.say([
      { who: 'player', text: 'Maman… je m\'ennuiiiie. Il n\'y a RIEN à faire ici.' },
      { who: 'mom', text: 'Tu t\'ennuies ? Par ce beau soleil ? File donc chez Papi Marcel, il m\'a dit qu\'il avait une surprise pour toi.' },
      { who: 'player', text: 'Une surprise ? Chez Papi ? …Bon, d\'accord, j\'y vais !' },
      { who: 'mom', text: `Sa maison est juste au nord de la nôtre, sur le chemin. Amuse-toi bien ${g('mon grand', 'ma grande')} !` },
    ]);
    ctx.setFlag('intro_done');
  }

  if (mapId === 'academy' && !ctx.flag('met_academy')) {
    await ctx.say([
      { who: 'celestin', text: `Entre, entre ! Bienvenue à l'ACADÉMIE DU DAMIER. Le club t'apprend à gagner… nous, nous t'apprenons à COMPRENDRE.` },
      { who: 'celestin', text: 'Six professeurs t\'attendent : cinq styles de parties — la classique, le système Ghestem, la semi-ouverte, le taquin, le marchand de bois — et l\'école des finales d\'Hortense. Suis nos six leçons et tu repartiras avec le diplôme de l\'Académie… et un cadeau digne de lui.' },
    ]);
    ctx.setFlag('met_academy');
  }

  if (mapId === 'club' && !ctx.flag('met_gigi')) {
    await ctx.say([
      { who: 'arbiter', text: 'Tiens, une nouvelle recrue ! Entre, entre. Le patron veut sûrement te voir.' },
      { who: 'gigi', text: `Alors c'est toi, ${g('le petit prodige', 'la petite prodige')} de Marcel ? On m'appelle Gigi. Grand maître, vice-champion du monde 1987… et désormais ton entraîneur.` },
      { who: 'player', text: 'Papi dit que vous êtes le meilleur joueur qu\'il connaisse !' },
      { who: 'gigi', text: 'Marcel exagère à peine. Écoute : ici on progresse en jouant. Bats les membres du club, et je t\'ouvrirai les portes des tournois. Régional, national… mondial, si tu en as l\'étoffe.' },
      { who: 'gigi', text: 'Passe d\'abord par ma TABLE D\'ENTRAÎNEMENT, là-bas à gauche : notation, combinaisons, finales… tout ce qu\'un futur champion doit savoir. Ensuite, défie Momo. Et n\'oublie jamais : la rafle majoritaire, c\'est la vie.' },
    ]);
    ctx.setFlag('met_gigi');
  }
}

// ---------------------------------------------------------------------------
// Défi de Papi Marcel (la « vraie » partie qui déverrouille le club)
// ---------------------------------------------------------------------------
export function grandpaChallenge(ctx) {
  const g = gg(ctx.state);
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
          { who: 'grandpa', text: `Ça alors… ${g('battu par mon propre petit-fils', 'battu par ma propre petite-fille')} ! Je n'ai plus rien à t'apprendre, ${g('gamin', 'gamine')}.` },
          { who: 'grandpa', text: `File en ville, au club d'Otterlaws. Demande GIGI de ma part : c'est un grand maître, il fera de toi ${g('un champion', 'une championne')}.` },
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
  const g = gg(ctx.state);
  const answer = await ctx.say([
    {
      who: 'grandpa',
      text: `Alors, ${g('prêt', 'prête')} pour ta première vraie partie ? Si tu me bats, je t'inscris au club de la ville !`,
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
// Dialogue type d'un donneur d'énigmes (Fernand, Honoré, Séraphine)
// ---------------------------------------------------------------------------
function comboGiverDialogue(ctx, seriesId, texts) {
  const series = comboSeriesById(seriesId);
  const total = COMBO_BANK[seriesId].length;
  const solved = combosSolved(ctx.state, seriesId);
  const metFlag = `met_${seriesId}`;

  if (comboSeriesDone(ctx.state, seriesId)) {
    return {
      lines: [
        { who: seriesId, text: texts.done },
        {
          who: seriesId,
          text: 'Tu veux t\'y refrotter, pour le plaisir de l\'œil ?',
          choices: [
            { label: 'Revoir une énigme', value: 'replay' },
            { label: 'Une autre fois.', value: 'later' },
          ],
        },
      ],
      onDone: (a) => {
        if (a === 'replay') ctx.startCombo(seriesId);
      },
    };
  }

  const lines = [];
  if (!ctx.flag(metFlag)) {
    lines.push({ who: seriesId, text: texts.greet }, { who: seriesId, text: texts.pitch });
  }
  lines.push({
    who: seriesId,
    text: solved === 0
      ? `${series.icon} Première énigme (sur ${total}) : les Blancs jouent et gagnent. On cherche ?`
      : `${series.icon} Énigme ${solved + 1} sur ${total}. ${texts.tease || 'Le damier est prêt. On cherche ?'}`,
    choices: [
      { label: 'Chercher !', value: 'play' },
      { label: 'Plus tard.', value: 'later' },
    ],
  });
  return {
    lines,
    onDone: (a) => {
      ctx.setFlag(metFlag);
      if (a !== 'play') return;
      if (ctx.startCombo) ctx.startCombo(seriesId);
      else ctx.say([{ who: seriesId, text: 'Tiens, mon damier n\'est pas prêt… (Le jeu vient d\'être mis à jour : recharge la page !)' }]);
    },
  };
}

// ---------------------------------------------------------------------------
// Dialogue type d'un professeur de l'Académie (leçon puis partie d'application)
// ---------------------------------------------------------------------------
function professorDialogue(ctx, npcId, texts) {
  const style = styleByNpc(npcId);
  const metFlag = `met_${npcId}`;
  const done = styleDone(ctx.state, style.id);
  const applied = stylePracticeWon(ctx.state, style.id);

  const lines = [];
  if (!ctx.flag(metFlag)) {
    lines.push({ who: npcId, text: texts.greet }, { who: npcId, text: texts.pitch });
  }
  if (!done) {
    lines.push({
      who: npcId,
      text: `${style.icon} Leçon : « ${style.title} ». On s'installe au damier ?`,
      choices: [
        { label: 'Commencer la leçon', value: 'lesson' },
        { label: 'Plus tard.', value: 'later' },
      ],
    });
  } else {
    lines.push({ who: npcId, text: texts.after });
    lines.push({
      who: npcId,
      text: applied
        ? `Tu as déjà gagné ta partie d'application. Envie de rejouer — la leçon, ou une partie dans mon style ?`
        : `La théorie est acquise… reste la pratique ! ${style.icon} Une PARTIE D'APPLICATION dans mon style, ça te dit ?`,
      choices: [
        { label: applied ? 'Partie d\'application' : 'Jouer l\'application !', value: 'practice' },
        { label: 'Revoir la leçon', value: 'lesson' },
        { label: 'Une autre fois.', value: 'later' },
      ],
    });
  }
  return {
    lines,
    onDone: (a) => {
      ctx.setFlag(metFlag);
      if (a === 'lesson') ctx.startStyleLesson?.(style.id);
      else if (a === 'practice') ctx.startStylePractice?.(style.id);
    },
  };
}

// ---------------------------------------------------------------------------
// Conseils de Gigi avant chaque ronde de compétition
// ---------------------------------------------------------------------------
export function gigiTips(compId, round, state) {
  const g = gg(state);
  const TIPS = {
    club_open: [
      [{ who: 'gigi', text: 'Conseil de coach : contre Momo, occupe le CENTRE. Les bords, c\'est pour les timides.' }],
      [{ who: 'gigi', text: `Léa défend bien. Sois ${g('patient', 'patiente')} : prépare tes rafles deux coups à l'avance.` }],
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
      [{ who: 'gigi', text: `Et maintenant… moi. Pas de conseil cette fois, ${g('gamin', 'gamine')}. Montre-moi TOUT ce que tu as appris.` }],
    ],
    world: [
      [{ who: 'gigi', text: 'Anke Vries, école néerlandaise : positionnelle, implacable. Ne lui laisse pas UNE case faible.' }],
      [{ who: 'gigi', text: 'Sergueï Volk calcule comme une machine. Complique la position : les machines détestent le chaos.' }],
      [{ who: 'gigi', text: `Viktor Roi, champion du monde… Il n'a qu'une faiblesse : il n'a jamais joué contre TOI. Va écrire l'histoire, ${g('gamin', 'gamine')}.` }],
    ],
  };
  return TIPS[compId]?.[round];
}

/** Scène de fin : notre héros ou héroïne est champion(ne) du monde. */
export async function worldChampionScene(ctx) {
  const g = gg(ctx.state);
  await ctx.say([
    { who: 'gigi', text: `${g('CHAMPION', 'CHAMPIONNE')} DU MONDE ! ${g('Gamin', 'Gamine')}… non. ${g('CHAMPION', 'CHAMPIONNE')}. Tu as fait mentir tous les pronostics.` },
    { who: 'player', text: 'On l\'a fait ensemble, Gigi. Toi, Papi, le club… tout Otterlaws !' },
    { who: 'gigi', text: 'Marcel avait raison depuis le début : tu avais le damier dans le sang. File le voir, il t\'attend avec le champagne… enfin, la limonade.' },
    { who: 'mom', name: 'Maman (au téléphone)', text: `${g('MON CHÉRI', 'MA CHÉRIE')} ! Toute la ville parle de toi ! Dire qu'il y a quelques mois, tu t'ennuyais…` },
    { who: 'player', text: 'C\'est vrai… Finalement, il suffisait d\'une surprise de Papi. Et de beaucoup, beaucoup de rafles majoritaires.' },
  ]);
}

// ---------------------------------------------------------------------------
// Dialogues des PNJ
// ---------------------------------------------------------------------------
export function getNpcDialogue(npcId, ctx) {
  const f = ctx.flag;
  const N = ctx.state.player.name;
  const g = gg(ctx.state);

  switch (npcId) {
    case 'mom': {
      if (!f('intro_done')) {
        return {
          lines: [
            { who: 'mom', text: `File chez Papi Marcel, ${g('mon grand', 'ma grande')}. Sa maison est au nord, sur le chemin.` },
          ],
        };
      }
      if (!f('tutorial_done')) {
        return { lines: [{ who: 'mom', text: 'Alors, cette surprise ? Papi t\'attend, sa maison est juste au nord !' }] };
      }
      if (!f('grandpa_beaten')) {
        return { lines: [{ who: 'mom', text: 'Le jeu de dames ! J\'aurais dû m\'en douter… Il y jouait déjà avec ton arrière-grand-mère. Va lui montrer ce que tu vaux !' }] };
      }
      return { lines: [{ who: 'mom', text: `${g('Mon fils, futur champion', 'Ma fille, future championne')} du monde de dames ! Je suis si fière de toi. File au club, ne fais pas attendre ce M. Gigi.` }] };
    }

    case 'grandpa': {
      if (!f('tutorial_done')) {
        return {
          lines: [
            { who: 'grandpa', text: `Ah, ${N} ! Te voilà enfin. Ta mère t'a parlé de ma surprise ?` },
            { who: 'grandpa', text: 'La voici : mon vieux damier ! Le JEU DE DAMES INTERNATIONAL, cent cases, le jeu des rois et des malins.' },
            {
              who: 'grandpa',
              text: `Je vais t'apprendre à jouer. Tu vas voir, c'est simple à apprendre… et impossible à lâcher. ${g('Prêt', 'Prête')} ?`,
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
              : `Le club d'Otterlaws, ${g('gamin', 'gamine')} ! En ville, au nord. Demande Gigi ! …Ou alors, une petite amicale d'abord ?`,
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
        return { lines: [{ who: 'gigi', text: `Approche, ${g('gamin', 'gamine')}, je ne mords pas. Enfin… pas en dehors du damier.` }] };
      }
      if (f('world_champion')) {
        return { lines: [{ who: 'gigi', text: `${g('Le CHAMPION', 'La CHAMPIONNE')} DU MONDE en personne, dans mon petit club… Marcel doit pleurer de fierté. Moi ? Une poussière dans l'œil, c'est tout.` }] };
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
        `Bats d'abord Léa, ${g('gamin', 'gamine')}. Ici, on grimpe les échelons dans l'ordre.`);
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

    case 'villager1': {
      const text = f('grandpa_beaten')
        ? 'Tu as vu Fernand, près de l\'étang ? Il ne pêche jamais rien… mais ses énigmes de damier sont fameuses dans tout le hameau.'
        : 'La ville d\'Otterlaws est au nord. Leur club de dames est réputé dans toute la région !';
      return { lines: [{ who: 'villager1', text }] };
    }
    case 'villager2':
      return { lines: [{ who: 'villager2', text: 'On raconte que le grand maître Gigi a été vice-champion du monde, dans le temps.' }] };

    // --- Les donneurs d'énigmes : des combinaisons à CHERCHER ---
    case 'fernand': {
      if (!f('grandpa_beaten')) {
        return { lines: [{ who: 'fernand', text: 'Chut… ça mord. Enfin, ça pourrait. Reviens me voir quand tu sauras jouer aux dames : j\'ai des énigmes qui valent le détour.' }] };
      }
      return comboGiverDialogue(ctx, 'fernand', {
        greet: 'Ah, la nouvelle recrue du club ! Moi c\'est Fernand. La pêche et les dames, c\'est pareil : on OFFRE un appât, et la prise est obligatoire, héhé.',
        pitch: 'J\'ai une série d\'énigmes : dans chacune, les Blancs jouent et GAGNENT. À toi de trouver la combinaison. Chaque réussite est payée en Pions d\'Or… et si tu les résous toutes, je t\'offre mon damier fétiche.',
        done: 'Plus une seule énigme en réserve — tu les as toutes ferrées ! Va donc voir le vieil Honoré, sur la place d\'Otterlaws : ses combinaisons à lui sont d\'un autre calibre.',
      });
    }
    case 'honore': {
      if (!comboSeriesAvailable(ctx.state, 'honore')) {
        return { lines: [{ who: 'honore', text: 'Jeune pousse ! J\'ai connu des combinaisons à faire pleurer un arbitre… Fais d\'abord tes gammes chez Fernand, à l\'étang du hameau. Ensuite, on parlera GRANDS coups.' }] };
      }
      return comboGiverDialogue(ctx, 'honore', {
        greet: 'Honoré, doyen des damistes d\'Otterlaws. Fernand m\'a parlé de toi… Il paraît que tu sais offrir un pion. Voyons si tu sais en offrir DEUX.',
        pitch: 'Mes énigmes sont des combinaisons de tournoi : sacrifices en chaîne, rafles profondes. Résous-les toutes et je te lègue mes pions de collection — de l\'or, du vrai.',
        done: 'Ma collection est épuisée, et mon chapeau, tiré. Une dernière chose : une dame en bleu, près des arbres à l\'est… Séraphine. Ses énigmes mènent toutes à la couronne.',
      });
    }
    case 'seraphine': {
      if (!comboSeriesAvailable(ctx.state, 'seraphine')) {
        return { lines: [{ who: 'seraphine', text: 'Chaque porte a sa clé, et chaque clé se mérite… Reviens quand Honoré t\'aura tout appris. Alors seulement, je te montrerai le chemin des couronnes.' }] };
      }
      return comboGiverDialogue(ctx, 'seraphine', {
        greet: 'On m\'appelle Séraphine. Je collectionne les fins de partie où tout semble fermé… et où un seul coup ouvre le chemin de la dame.',
        pitch: 'Six percées, six sacrifices, six couronnes. Résous-les toutes… et je te présenterai quelqu\'un que ce village a oublié. Quelqu\'un qui ne joue plus. Sauf, peut-être, contre toi.',
        done: 'Toutes les portes sont ouvertes… L\'Ermite t\'attend près de l\'étang du hameau, au sud. Il n\'a pas touché un damier depuis vingt ans. Sois à la hauteur.',
      });
    }
    // --- Les professeurs de l'Académie du Damier (styles de jeu) ---
    case 'celestin':
      return professorDialogue(ctx, 'celestin', {
        greet: `Bienvenue à l'Académie, ${g('jeune homme', 'jeune fille')}. Maître Célestin. Ici, on n'apprend pas des coups — on apprend des STYLES. Le mien est le plus ancien de tous : la PARTIE CLASSIQUE.`,
        pitch: 'Le centre partagé, des chaînes qui se font face, des temps que l\'on compte… Tout joueur doit commencer par là : la classique est la grammaire du jeu de dames.',
        after: 'Souviens-toi : colonnes, temps, rangée arrière. Quand tu maîtriseras la grammaire… mes collègues t\'apprendront la poésie.',
      });
    case 'gaspard':
      return professorDialogue(ctx, 'gaspard', {
        greet: 'Gaspard. Mon héros s\'appelait Ghestem — champion du monde, français, et le plus grand étouffeur de pions de l\'histoire.',
        pitch: 'Mon cours : GAGNER DE L\'ESPACE. L\'avancée 28-22, le mur qui se reconstruit, l\'adversaire qui n\'a plus un coup utile. Le blocage n\'est pas brutal — il est inévitable.',
        after: 'L\'étau, toujours l\'étau. Et si un jour c\'est TOI qu\'on enchaîne, rappelle-toi ma leçon : un jeu actif, un objectif, sinon l\'asphyxie.',
      });
    case 'salome':
      return professorDialogue(ctx, 'salome', {
        greet: 'Salomé. Ma spécialité déroute les impatients : la partie SEMI-OUVERTE — un seul camp tient le centre, et ce n\'est pas forcément lui qui gagne.',
        pitch: 'Je t\'apprendrai l\'ENCERCLEMENT : ne jamais attaquer de front, contrôler les cases voisines, et transformer le beau pion central adverse… en prisonnier.',
        after: 'La patience, toujours. Un pion avancé sans soutien n\'est pas une menace : c\'est un futur prisonnier.',
      });
    case 'tiphaine':
      return professorDialogue(ctx, 'tiphaine', {
        greet: 'Moi c\'est Tiphaine ! Ma passion : embêter les gens. Sur le damier, hein. Mon arme préférée : LE TAQUIN, le petit pion posé en 24 qui rend fou tout le voisinage.',
        pitch: 'Je te montre ? Il cloue les pions 15 et 25 au bord, il ne fait « rien »… et au premier geste d\'énervement en face, il CROQUE. Tu vas adorer.',
        after: 'Taquine, taquine toujours ! Mais garde tes gardes du corps derrière le 24 — un taquin seul finit toujours par se faire encercler.',
      });
    case 'hortense':
      return professorDialogue(ctx, 'hortense', {
        greet: `Approche, ${g('mon petit', 'ma petite')}, n'aie pas peur. On m'appelle Hortense — la grand-mère des finales. Mes collègues t'apprennent à ATTAQUER… moi, je t'apprends à GAGNER.`,
        pitch: 'Car les parties se gagnent en finale, quand il ne reste presque plus rien et que chaque temps pèse une tonne. L\'offre, la double opposition, le blocage angulaire : trois secrets, une vie de victoires.',
        after: 'N\'oublie pas : les temps avant les pions, l\'offre qui déplace, le coin qui attend. Et repasse me voir — les finales, ça s\'entretient comme un jardin.',
      });
    case 'boris':
      return professorDialogue(ctx, 'boris', {
        greet: 'Boris, charpentier de damier. Les gens croient que je pousse du bois — c\'est vrai ! Mais je le pousse EN FORMATION : le Y, la croix, la flèche, le triplet…',
        pitch: 'Et je te montrerai mon chef-d\'œuvre : le Y construit au bord, celui que les anciens appellent LE MARCHAND DE BOIS. Une pile de pions, une menace simple… et tout tombe tout seul.',
        after: 'Du bois bien empilé ne s\'écroule jamais. Des formations, petit, toujours des formations !',
      });

    case 'ermite': {
      return {
        lines: [
          { who: 'ermite', text: 'Séraphine t\'envoie, n\'est-ce pas ? Il y a vingt ans, j\'ai perdu une finale de championnat sur une combinaison que je n\'avais pas VUE. Je n\'ai plus jamais joué.' },
          {
            who: 'ermite',
            text: `Mais toi… tu as résolu ses six percées. Alors montre-moi, ${g('petit chercheur', 'petite chercheuse')} de combinaisons : joue contre moi. Une vraie partie.`,
            choices: [
              { label: 'Défier l\'Ermite !', value: 'play' },
              { label: 'Pas encore…', value: 'later' },
            ],
          },
        ],
        onDone: (a) => {
          if (a === 'play') ctx.startMatch({ opponent: 'ermite', career: 'ermite', music: 'tournament' });
        },
      };
    }

    default:
      return { lines: [{ who: npcId, text: 'Bonjour !' }] };
  }
}
