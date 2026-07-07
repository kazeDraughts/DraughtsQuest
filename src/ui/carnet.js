/**
 * Le CARNET DU DAMISTE — la carte au trésor du joueur : toute la
 * progression (aventure, entraînement, Académie, énigmes, compétitions,
 * anthologie, trésors) avec, pour chaque activité, OÙ aller la chercher.
 * Les contenus encore verrouillés restent volontairement mystérieux.
 */

import { el } from './screens.js';
import { state, flag } from '../save/save.js';
import { currentObjective } from '../story/quests.js';
import { EXERCISES } from '../story/training.js';
import {
  COMBO_BANK, COMBO_SERIES, combosSolved, comboSeriesDone, comboSeriesAvailable, comboBankCleared,
} from '../story/combos.js';
import { STYLES, MASTER_STYLES, styleDone, stylePracticeWon, stylesCompleted, isAcademyGraduate } from '../story/academy.js';
import { COMPETITIONS, competitionStatus, unlockHint } from '../career/opponents.js';
import { eloTitle } from '../career/elo.js';
import { BOARD_THEMES, PIECE_THEMES } from '../shop/themes.js';
import { GAMES } from '../story/games.js';

const WHERE = {
  fernand: 'Fernand, à l\'étang du hameau',
  honore: 'Honoré, place d\'Otterlaws',
  seraphine: 'Séraphine, recoin est d\'Otterlaws',
  hortense: 'Hortense, à l\'Académie (après sa leçon)',
};

function row(icon, title, status, hint, done) {
  const r = el('div.bracket-row');
  const who = el('div.who');
  who.append(el('span', icon), el('div', [
    el('div', `${title} ${done ? '✅' : ''}`),
    el('div.tag-elo', hint || ''),
  ]));
  r.append(who);
  r.append(el(`div.result.${done ? 'win' : 'pending'}`, status));
  return r;
}

export function renderCarnet() {
  const zone = document.getElementById('carnet-list');
  zone.innerHTML = '';
  const c = state.career;

  // ------------------------------------------------------------- AVENTURE
  zone.append(el('div.shop-section-title', '🗺️ AVENTURE'));
  zone.append(row('🎯', 'Objectif', '', currentObjective(flag, state) || 'Explore le monde !', false));
  zone.append(row('📈', `Classement Elo : ${c.elo}`, eloTitle(c.elo),
    `${c.wins} victoires · ${c.draws} nulles · ${c.losses} défaites`, flag('world_champion')));

  // -------------------------------------------------------- ENTRAÎNEMENT
  const exDone = Object.keys(state.training.done || {}).length;
  zone.append(el('div.shop-section-title', '🎓 SALLE D\'ENTRAÎNEMENT'));
  zone.append(row('🧑‍🏫', 'Les leçons de Gigi', `${exDone}/${EXERCISES.length}`,
    'Le tableau noir, au club d\'Otterlaws', exDone >= EXERCISES.length));

  const readCount = Object.keys(state.library?.read || {}).length;
  zone.append(row('📚', 'La bibliothèque du club', `${readCount}/${GAMES.length} parties lues`,
    flag('club_unlocked') ? 'L\'étagère du club, près du tableau noir' : 'On dit que le club en garde une belle…',
    readCount >= GAMES.length));
  const guessCount = Object.keys(state.library?.guessed || {}).length;
  zone.append(row('🎯', 'Devine le coup du maître', `${guessCount}/${GAMES.length} parties devinées`,
    'Dans la bibliothèque : joue les coups du champion à sa place !',
    guessCount >= GAMES.length));

  // ------------------------------------------------------------- ACADÉMIE
  zone.append(el('div.shop-section-title', '🏛️ ACADÉMIE DU DAMIER'));
  if (!flag('club_unlocked')) {
    zone.append(row('🔒', 'Un grand bâtiment, à l\'est d\'Otterlaws…', '???',
      'On murmure qu\'il faut être membre du club pour y entrer.', false));
  } else {
    for (const s of STYLES) {
      const done = styleDone(state, s.id);
      const applied = stylePracticeWon(state, s.id);
      zone.append(row(s.icon, s.title,
        done ? (applied ? 'Leçon + application ✔' : 'Leçon suivie') : 'À suivre',
        done && !applied ? 'Gagne la partie d\'application !' : s.desc, done && applied));
    }
    const grad = isAcademyGraduate(state);
    zone.append(row('🎓', 'Diplôme de l\'Académie', `${stylesCompleted(state)}/${STYLES.length} leçons`,
      grad ? 'Diplômé — l\'Annexe des maîtres t\'est ouverte !' : 'Suis les six leçons pour être diplômé.', grad));
    if (grad) {
      for (const s of MASTER_STYLES) {
        const done = styleDone(state, s.id);
        const applied = stylePracticeWon(state, s.id);
        zone.append(row(s.icon, s.title,
          done ? (applied ? 'Maîtrisé ✔' : 'Leçon suivie') : 'À suivre',
          'L\'Annexe des maîtres, sur le campus', done && applied));
      }
    } else {
      zone.append(row('🔒', 'L\'Annexe des maîtres', '???', 'Réservée aux diplômés…', false));
    }
  }

  // -------------------------------------------------------------- ÉNIGMES
  zone.append(el('div.shop-section-title', '🧩 CHERCHEURS DE COMBINAISONS'));
  for (const s of COMBO_SERIES) {
    const total = COMBO_BANK[s.id].length;
    const solved = combosSolved(state, s.id);
    const available = s.id === 'hortense' ? styleDone(state, 'finales') : comboSeriesAvailable(state, s.id);
    const gate = s.id === 'fernand' ? flag('grandpa_beaten') : true;
    if (!available || !gate) {
      zone.append(row('🔒', s.id === 'hortense' ? 'Le cahier d\'études d\'Hortense' : `Les énigmes de ${WHERE[s.id].split(',')[0]}`,
        '???', s.requires ? `Termine d'abord la série de ${WHERE[s.requires].split(',')[0]}.`
          : s.id === 'hortense' ? 'Suis d\'abord la leçon de finales à l\'Académie.' : 'Apprends d\'abord à jouer…', false));
      continue;
    }
    const cleared = comboBankCleared(state, s.id);
    zone.append(row(s.icon, s.title, `${solved}/${total}`,
      cleared ? 'Réserve épuisée — chapeau !' : WHERE[s.id], cleared));
  }
  if (flag('ermite_revealed')) {
    const beaten = (state.career.beaten?.ermite || 0) > 0;
    zone.append(row('🧙', 'L\'Ermite', beaten ? 'Battu !' : 'À défier',
      'Près de l\'étang du hameau — le plus fort adversaire du jeu.', beaten));
  } else {
    zone.append(row('🔒', 'Quelqu\'un se cache…', '???', 'Séraphine en sait plus qu\'elle ne le dit.', false));
  }

  // --------------------------------------------------------- COMPÉTITIONS
  zone.append(el('div.shop-section-title', '🏆 COMPÉTITIONS'));
  for (const comp of COMPETITIONS) {
    const st = competitionStatus(comp, c);
    zone.append(row(comp.icon, comp.name,
      st === 'won' ? 'Remportée ✔' : st === 'locked' ? '🔒' : 'Ouverte',
      st === 'locked' ? unlockHint(comp, c) : 'Le tableau d\'affichage, au club', st === 'won'));
  }

  // ----------------------------------------------------------- ANTHOLOGIE
  zone.append(el('div.shop-section-title', '🏛️ POSITIONS D\'ANTHOLOGIE'));
  if (flag('met_gigi')) {
    zone.append(row('⚖️', 'La Woldouby (1910)', flag('woldouby_won') ? 'Vaincue !' : 'À vaincre',
      'L\'Arbitre du club la propose aux curieux.', flag('woldouby_won')));
  } else {
    zone.append(row('🔒', 'Une position centenaire…', '???', 'Quelqu\'un au club veille sur elle.', false));
  }

  // ------------------------------------------------------------- TRÉSORS
  zone.append(el('div.shop-section-title', '🎁 TRÉSORS SECRETS'));
  for (const [catalog, kind] of [[BOARD_THEMES, 'boards'], [PIECE_THEMES, 'pieces']]) {
    for (const t of catalog) {
      if (!t.secret) continue;
      const owned = state.inventory[kind].includes(t.id);
      zone.append(row(owned ? '💎' : '❓', owned ? t.name : '???',
        owned ? 'Possédé' : 'À gagner', t.secret, owned));
    }
  }
}
