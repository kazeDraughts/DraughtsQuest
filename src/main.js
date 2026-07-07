/**
 * DraughtsQuest — point d'entrée.
 * Assemble les briques : menu, damier (BoardView), contrôleur de partie (Match).
 */

import { BoardView } from './game/boardview.js';
import { Match } from './game/match.js';
import { showScreen, showBanner, showMatchOverlay, el } from './ui/screens.js';
import { AIPlayer } from './ai/player.js';
import { AI_LEVELS, LEVEL_ORDER } from './ai/levels.js';
import { WorldController } from './world/controller.js';
import { CHARACTERS, characterById, updatePlayerCharacter, PLAYER_LOOKS } from './world/npcs.js';
import { setPlayerHomeName } from './world/maps.js';
import { drawPortrait } from './world/portraits.js';
import { Dialogue } from './world/dialogue.js';
import { loadSave, setFlag, flag, state, save, hasSave, resetSave } from './save/save.js';
import { audio } from './audio/audio.js';
import { runTutorial, makeSignal } from './story/tutorial.js';
import { afterTutorial, gigiTips, worldChampionScene } from './story/quests.js';
import { EXERCISES, TRAINING_CATEGORIES, exerciseById, runExercise } from './story/training.js';
import { COMBO_BANK, comboSeriesById, comboToExercise, COMBO_CLEARED_BONUS } from './story/combos.js';
import { styleById, isAcademyGraduate, ACADEMY_GRADUATE_BONUS } from './story/academy.js';
import {
  COMPETITIONS, competitionById, competitionStatus, unlockHint,
  opponentElo, opponentAiConfig,
} from './career/opponents.js';
import { updateElo, eloTitle } from './career/elo.js';
import { renderShop } from './shop/shop.js';
import { renderCarnet } from './ui/carnet.js';
import { GAMES, gameById } from './story/games.js';
import { RulesEngine } from './engine/rules.js';
import { findBestMove } from './ai/search.js';
import { PLACEMENT_STEPS, placementResult, placementSkipsTutorial } from './career/placement.js';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------
// Damier partagé par toutes les parties
// ---------------------------------------------------------------------------
const boardView = new BoardView($('board-canvas'));
let currentMatch = null;
let matchOrigin = 'menu'; // 'menu' ou 'world' : où revenir en quittant la partie

/** Avatar d'un camp : id de personnage (portrait dessiné) ou emoji. */
function setAvatar(spanId, who) {
  const span = $(spanId);
  span.innerHTML = '';
  if (who && CHARACTERS[who]) {
    const c = document.createElement('canvas');
    drawPortrait(c, CHARACTERS[who].look, 76);
    span.append(c);
  } else {
    span.textContent = who || '⚪';
  }
}

/**
 * Lance une partie sur l'écran de jeu.
 * config : { white, black, fen, allowedMoves, onEnd({winner, resigned}) }
 * Les joueurs : { type:'human'|'ai', name, avatar? , getMove? }
 */
function startMatch(config) {
  currentMatch?.destroy();
  showScreen('screen-match');
  audio.playMusic(config.music || 'match');
  // Applique les cosmétiques équipés (boutique)
  boardView.setThemes(state.equipped.board, state.equipped.pieces);

  $('name-white').textContent = config.white.name;
  $('name-black').textContent = config.black.name;
  setAvatar('avatar-white', config.white.avatar ?? '⚪');
  setAvatar('avatar-black', config.black.avatar ?? '⚫');
  $('extra-white').textContent = config.white.extra ?? '';
  $('extra-black').textContent = config.black.extra ?? '';
  matchOrigin = config.origin ?? 'menu';

  const match = new Match({
    boardView,
    white: config.white,
    black: config.black,
    fen: config.fen,
    allowedMoves: config.allowedMoves,
    onMessage: (msg) => showBanner(msg),
    onMove: (applied) => {
      audio.playSfx(applied.promotion ? 'promote' : applied.captures.length ? 'capture' : 'move');
    },
    onTurn: (color, player) => {
      const pill = $('turn-pill');
      if (player.type === 'ai') {
        pill.innerHTML = '';
        pill.append(el('span.spin'), ` ${player.name} réfléchit…`);
      } else {
        pill.textContent = color === 'w' ? `Trait aux Blancs — ${config.white.name}` : `Trait aux Noirs — ${config.black.name}`;
      }
      pill.classList.toggle('me', player.type === 'human');
    },
    onEnd: (result) => {
      // Jingle de fin : victoire/défaite du point de vue du joueur humain.
      const humanSide = config.white.type === 'human' && config.black.type === 'ai' ? 'w'
        : config.black.type === 'human' && config.white.type === 'ai' ? 'b' : null;
      if (result.winner === 'draw') audio.playSfx('blip');
      else if (!humanSide || result.winner === humanSide) audio.playSfx('win');
      else audio.playSfx('lose');

      const names = { w: config.white.name, b: config.black.name };
      const title = result.winner === 'draw' ? 'Partie nulle !' : `${names[result.winner]} gagne !`;
      const detail = result.resigned
        ? 'Victoire par abandon.'
        : result.winner === 'draw'
          ? 'Aucun des deux camps ne peut l\'emporter.'
          : 'L\'adversaire ne peut plus jouer.';
      (config.onEnd || defaultMatchEnd)({ ...result, title, detail });
    },
  });
  currentMatch = match;
  match.start();
  return match;
}

function defaultMatchEnd({ title, detail }) {
  showMatchOverlay({
    title,
    detail,
    buttons: [
      { label: 'Rejouer', className: 'btn-primary', onClick: () => startLocalMatch() },
      { label: 'Menu principal', className: 'btn-small', onClick: () => quitToMenu() },
    ],
  });
}

function quitToMenu() {
  currentMatch?.destroy();
  currentMatch = null;
  world?.leave();
  refreshMenu();
  showScreen('screen-menu');
  audio.playMusic('menu');
}

/** Met à jour le menu principal : bouton Continuer, statistiques du héros. */
function refreshMenu() {
  const has = hasSave();
  $('btn-continue').classList.toggle('hidden', !has);
  $('btn-carnet').classList.toggle('hidden', !has || !flag('intro_done'));
  $('btn-adventure').textContent = has ? 'Nouvelle partie' : 'Aventure';
  const stats = $('menu-stats');
  if (has && flag('intro_done')) {
    const c = state.career;
    const champ = state.player.gender === 'girl' ? 'CHAMPIONNE' : 'CHAMPION';
    stats.textContent = `${flag('world_champion') ? `🌍 ${champ} DU MONDE · ` : ''}${state.player.name} · Elo ${c.elo} (${eloTitle(c.elo)}) · 🪙 ${state.points}`;
    stats.classList.remove('hidden');
  } else {
    stats.classList.add('hidden');
  }
}

// ---------------------------------------------------------------------------
// Modes de jeu
// ---------------------------------------------------------------------------
function startLocalMatch() {
  startMatch({
    white: { type: 'human', name: 'Joueur 1 (Blancs)' },
    black: { type: 'human', name: 'Joueur 2 (Noirs)' },
    onEnd: (r) => showMatchOverlay({
      title: r.title,
      detail: r.detail,
      buttons: [
        { label: 'Rejouer', className: 'btn-primary', onClick: () => startLocalMatch() },
        { label: 'Menu principal', className: 'btn-small', onClick: () => quitToMenu() },
      ],
    }),
  });
}

/** Partie libre contre l'IA (le joueur a les Blancs). */
function startAIMatch(levelId) {
  const level = AI_LEVELS[levelId];
  const ai = new AIPlayer(levelId);
  startMatch({
    white: { type: 'human', name: 'Toi (Blancs)' },
    black: {
      type: 'ai',
      name: level.name,
      avatar: level.icon,
      extra: `Elo ~${level.elo}`,
      getMove: (fen) => ai.getMove(fen),
    },
    onEnd: (r) => showMatchOverlay({
      title: r.winner === 'w' ? 'Victoire ! 🎉' : r.winner === 'draw' ? 'Partie nulle' : 'Défaite…',
      detail: r.winner === 'w'
        ? `Tu as battu ${level.name} !`
        : r.winner === 'draw' ? 'Personne ne peut plus gagner.' : `${level.name} l'emporte. Retente ta chance !`,
      buttons: [
        { label: 'Revanche', className: 'btn-primary', onClick: () => startAIMatch(levelId) },
        { label: 'Changer de niveau', className: 'btn-good', onClick: () => { quitToMenu(); openAISelect(); } },
        { label: 'Menu principal', className: 'btn-small', onClick: () => quitToMenu() },
      ],
    }),
  });
}

// --- Sélecteur de niveau de l'IA ---
function openAISelect() {
  const zone = $('ai-level-buttons');
  zone.innerHTML = '';
  for (const id of LEVEL_ORDER) {
    const lv = AI_LEVELS[id];
    const btn = el('button.btn', `${lv.icon} ${lv.name} — ${lv.desc}`, {
      onclick: () => {
        $('ai-select').classList.add('hidden');
        startAIMatch(id);
      },
    });
    btn.style.textAlign = 'left';
    zone.append(btn);
  }
  $('ai-select').classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// Aventure (overworld)
// ---------------------------------------------------------------------------
let world = null;

/** Répercute l'identité choisie (prénom, genre) sur tout le jeu. */
function applyPlayerIdentity() {
  updatePlayerCharacter(state.player.name, state.player.gender);
  setPlayerHomeName(state.player.name);
}

// --- Création du personnage (première entrée dans l'aventure) ---
function openPlayerCreation() {
  const overlay = $('player-create');
  const cards = { boy: $('gc-boy'), girl: $('gc-girl') };
  const nameInput = $('player-name');
  // Portraits d'aperçu des deux personnages
  drawPortrait(cards.boy.querySelector('canvas'), PLAYER_LOOKS.boy, 96);
  drawPortrait(cards.girl.querySelector('canvas'), PLAYER_LOOKS.girl, 96);

  let gender = state.player.gender || 'boy';
  const DEFAULTS = { boy: 'Tim', girl: 'Mia' };
  const refresh = () => {
    cards.boy.classList.toggle('selected', gender === 'boy');
    cards.girl.classList.toggle('selected', gender === 'girl');
  };
  const pick = (gValue) => {
    // Si le prénom affiché est encore un prénom par défaut, on le remplace.
    if (!nameInput.value.trim() || Object.values(DEFAULTS).includes(nameInput.value.trim())) {
      nameInput.value = DEFAULTS[gValue];
    }
    gender = gValue;
    refresh();
    audio.playSfx('blip');
  };
  cards.boy.onclick = () => pick('boy');
  cards.girl.onclick = () => pick('girl');
  nameInput.value = DEFAULTS[gender];
  refresh();

  $('btn-create-go').onclick = () => {
    state.player.name = nameInput.value.trim().slice(0, 12) || DEFAULTS[gender];
    state.player.gender = gender;
    setFlag('player_created'); // setFlag sauvegarde aussi l'état
    applyPlayerIdentity();
    audio.playSfx('coin');
    overlay.classList.add('hidden');
    askPlacement();
  };
  overlay.classList.remove('hidden');
}

// ---------------------------------------------------------------------------
// Test de niveau : jusqu'à 3 parties de placement avant l'aventure
// ---------------------------------------------------------------------------
let placement = null; // { step, wins }

function askPlacement() {
  showMatchOverlay({
    title: 'Connais-tu déjà le jeu de dames ?',
    detail: 'Si tu es déjà joueur ou joueuse, passe le TEST DE NIVEAU : jusqu\'à trois parties — tant que tu gagnes, l\'adversaire monte d\'un cran. Ton classement de départ en dépendra (et Papi sautera la leçon des règles).',
    buttons: [
      {
        label: '🐣 Je débute — l\'aventure normale',
        className: 'btn-primary',
        onClick: () => enterWorld(),
      },
      {
        label: '🎓 Je suis déjà joueur : test de niveau !',
        className: 'btn-good',
        onClick: () => {
          placement = { step: 0, wins: 0 };
          startPlacementMatch();
        },
      },
    ],
  });
}

function startPlacementMatch() {
  const levelId = PLACEMENT_STEPS[placement.step];
  const level = AI_LEVELS[levelId];
  const ai = new AIPlayer(levelId);
  startMatch({
    origin: 'world', // le bouton Quitter vaut abandon : la partie compte perdue
    music: 'tournament',
    white: { type: 'human', name: state.player.name },
    black: {
      type: 'ai',
      name: `Examen ${placement.step + 1}/3 — ${level.name}`,
      avatar: level.icon,
      extra: `Elo ~${level.elo}`,
      getMove: (fen) => ai.getMove(fen),
    },
    onEnd: (r) => {
      const outcome = r.winner === 'w' ? 'win' : r.winner === 'draw' ? 'draw' : 'lose';
      if (outcome === 'win') placement.wins++;
      const res = placementResult(placement.step, outcome);
      if (!res.done) {
        placement.step = res.nextStep;
        showMatchOverlay({
          title: `Examen ${placement.step}/3 réussi ! 🎉`,
          detail: `Impressionnant. Voyons ce que tu vaux contre plus fort : ${AI_LEVELS[PLACEMENT_STEPS[placement.step]].name}.`,
          buttons: [{ label: 'Partie suivante !', className: 'btn-primary', onClick: () => startPlacementMatch() }],
        });
        return;
      }
      finishPlacement(res.elo);
    },
  });
}

function finishPlacement(elo) {
  state.career.elo = elo;
  const skip = placementSkipsTutorial(elo, placement.wins);
  if (skip) setFlag('tutorial_done'); // Papi proposera directement son défi
  const wins = placement.wins;
  placement = null;
  save();
  audio.playSfx(wins >= 3 ? 'win' : 'coin');
  showMatchOverlay({
    title: `📊 Ton niveau : Elo ${elo}`,
    detail: `${eloTitle(elo)} — ${wins} victoire${wins > 1 ? 's' : ''} sur ${Math.min(wins + 1, 3)} partie${wins ? 's' : ''} d'examen.${skip ? ' Tu connais les règles : Papi Marcel te proposera directement son défi (le club exige de l\'avoir battu !).' : ' L\'aventure commence en douceur — Papi t\'apprendra tout.'}`,
    buttons: [{ label: 'Commencer l\'aventure !', className: 'btn-primary', onClick: () => enterWorld() }],
  });
}

function enterWorld() {
  // Premier lancement de l'aventure : on choisit d'abord son personnage.
  if (!flag('player_created')) {
    openPlayerCreation();
    return;
  }
  if (!world) {
    world = new WorldController({
      services: {
        startMatch: (cfg) => startWorldMatch(cfg),
        startTutorial: () => startTutorialFlow(),
        startCombo: (seriesId) => startComboChallenge(seriesId),
        startStyleLesson: (styleId) => startStyleLesson(styleId),
        startStylePractice: (styleId) => startStylePractice(styleId),
        openCompetitions: () => openCompetitions(),
        openShop: () => openShop('world'),
        openTraining: () => openTraining('world'),
        openLibrary: () => openLibrary(),
        updateHud: () => {
          const chip = $('hud-points');
          chip.textContent = `🪙 ${state.points}`;
          chip.classList.remove('hidden');
        },
        onMapChanged: (map) => {
          audio.playMusic(map.outdoor ? 'village' : 'club');
        },
        toMenu: () => quitToMenu(),
        sfx: (name) => audio.playSfx(name),
      },
    });
  }
  currentMatch?.destroy();
  currentMatch = null;
  showScreen('screen-world');
  world.enter();
}

// ---------------------------------------------------------------------------
// Tutoriel de Papi Marcel (sur l'écran de partie, sans adversaire actif)
// ---------------------------------------------------------------------------
let matchDialogue = null;   // boîte de dialogue superposée à l'écran de partie
let tutorialSignal = null;

async function startTutorialFlow() {
  world.leave();
  currentMatch?.destroy();
  currentMatch = null;
  showScreen('screen-match');
  $('name-white').textContent = state.player.name;
  $('name-black').textContent = 'Papi Marcel';
  setAvatar('avatar-white', 'player');
  setAvatar('avatar-black', 'grandpa');
  $('extra-white').textContent = '';
  $('extra-black').textContent = 'Leçon de dames';
  matchOrigin = 'world';
  lessonReturn = () => enterWorld();

  if (!matchDialogue) matchDialogue = new Dialogue($('screen-match'));
  tutorialSignal = makeSignal();
  const done = await runTutorial({
    boardView,
    dialogue: matchDialogue,
    setStatus: (t) => { $('turn-pill').textContent = t; },
    signal: tutorialSignal,
  });
  tutorialSignal = null;
  if (done) {
    setFlag('tutorial_done');
    enterWorld();
    await afterTutorial(world.questCtx());
  }
}

function leaveWorldToMenu() {
  world?.leave();
  showScreen('screen-menu');
}

// ---------------------------------------------------------------------------
// Carrière : enregistrement des résultats (Elo, stats, points)
// ---------------------------------------------------------------------------
function recordCareerResult(oppId, outcome) {
  const career = state.career;
  const oppRating = opponentElo(oppId, career);
  const score = outcome === 'win' ? 1 : outcome === 'draw' ? 0.5 : 0;
  const before = career.elo;
  career.elo = updateElo(before, oppRating, score);
  if (outcome === 'win') {
    career.wins++;
    career.beaten[oppId] = (career.beaten[oppId] || 0) + 1;
  } else if (outcome === 'draw') {
    career.draws++;
  } else {
    career.losses++;
  }
  // Pions d'Or : la monnaie de la boutique (proportionnelle à la force battue)
  const points = outcome === 'win' ? Math.round(oppRating / 8)
    : outcome === 'draw' ? Math.round(oppRating / 25) : 10;
  state.points += points;
  save();
  return { before, after: career.elo, delta: career.elo - before, points };
}

/**
 * Partie lancée depuis le monde (PNJ, tournoi…) : l'adversaire est un
 * personnage ; cfg.career = id d'adversaire coté (Elo mis à jour à l'issue).
 */
function startWorldMatch(cfg) {
  world.leave();
  const opp = characterById(cfg.opponent);
  if (cfg.career) {
    cfg.level = opponentAiConfig(cfg.career, state.career);
    cfg.extra = `Elo ${opponentElo(cfg.career, state.career)}`;
  }
  const levelCfg = typeof cfg.level === 'string' ? AI_LEVELS[cfg.level] : cfg.level;
  const ai = new AIPlayer(cfg.level);
  if (cfg.preLines) {
    // Conseil d'avant-match (Gigi…) affiché par-dessus le damier.
    if (!matchDialogue) matchDialogue = new Dialogue($('screen-match'));
    setTimeout(() => matchDialogue.play(cfg.preLines), 350);
  }
  startMatch({
    origin: 'world',
    fen: cfg.fen,
    music: cfg.music,
    allowedMoves: cfg.allowedMoves,
    white: { type: 'human', name: state.player.name, avatar: 'player' },
    black: {
      type: 'ai',
      name: opp.name,
      avatar: opp.id,
      extra: cfg.extra ?? (levelCfg ? `Force ~${levelCfg.elo}` : ''),
      getMove: (fen) => ai.getMove(fen),
    },
    onEnd: (r) => {
      if (cfg.onEnd) {
        cfg.onEnd(r);
        return;
      }
      const outcome = r.winner === 'w' ? 'win' : r.winner === 'draw' ? 'draw' : 'lose';
      const rc = cfg.result?.[outcome] || {};
      // Effets de scénario : drapeaux posés à l'issue de la partie
      (rc.flags || []).forEach((fl) => setFlag(fl));

      const rewards = [...(rc.rewards || [])];
      if (cfg.career) {
        const rec = recordCareerResult(cfg.career, outcome);
        rewards.push(`Classement : ${rec.before} → ${rec.after} (${rec.delta >= 0 ? '+' : ''}${rec.delta})`);
        if (rec.points > 0) rewards.push(`🪙 +${rec.points} Pions d'Or`);
      }
      cfg.onResult?.(r, outcome);

      const buttons = [];
      if (rc.retry) {
        buttons.push({ label: 'Revanche !', className: 'btn-primary', onClick: () => startWorldMatch(cfg) });
      }
      buttons.push({
        label: 'Retour au monde',
        className: rc.retry ? 'btn-small' : 'btn-primary',
        onClick: async () => {
          enterWorld();
          if (rc.lines) await world.say(rc.lines);
        },
      });
      showMatchOverlay({
        title: rc.title ?? (outcome === 'win' ? 'Victoire ! 🎉' : outcome === 'draw' ? 'Partie nulle' : 'Défaite…'),
        detail: rc.detail ?? (outcome === 'win' ? `Bien joué, tu as battu ${opp.name} !`
          : outcome === 'draw' ? 'Personne ne l\'emporte cette fois.'
            : `${opp.name} l'emporte. Tu feras mieux la prochaine fois !`),
        rewards,
        buttons,
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Compétitions et tournois
// ---------------------------------------------------------------------------
function openCompetitions() {
  world?.leave();
  showScreen('screen-competitions');
  const c = state.career;
  $('comp-player-status').textContent =
    `Ton classement : ${c.elo} (${eloTitle(c.elo)}) · ${c.wins} V / ${c.draws} N / ${c.losses} D`;
  const list = $('competitions-list');
  list.innerHTML = '';
  for (const comp of COMPETITIONS) {
    const status = competitionStatus(comp, c);
    const row = el('div.bracket-row');
    const who = el('div.who');
    who.append(el('span', comp.icon), el('div', [
      el('div', `${comp.name}`),
      el('div.tag-elo', comp.desc),
    ]));
    row.append(who);
    const active = c.activeTournament?.id === comp.id;
    if (active) {
      row.classList.add('current');
      row.append(el('button.btn.btn-small.btn-primary', 'Reprendre', { onclick: () => showTournament() }));
    } else if (status === 'locked') {
      row.append(el('div.result.pending', `🔒 ${unlockHint(comp, c)}`));
    } else {
      if (status === 'won') who.prepend(el('span', '✅'));
      row.append(el('button.btn.btn-small.btn-good', status === 'won' ? 'Rejouer' : 'S\'inscrire', {
        onclick: () => startTournament(comp.id),
      }));
    }
    list.append(row);
  }
}

function startTournament(compId) {
  state.career.activeTournament = { id: compId, round: 0, results: [] };
  save();
  showTournament();
}

function showTournament() {
  const t = state.career.activeTournament;
  if (!t) return openCompetitions();
  const comp = competitionById(t.id);
  showScreen('screen-tournament');
  $('tournament-title').textContent = `${comp.icon} ${comp.name}`;
  $('tournament-info').textContent =
    `Ronde ${Math.min(t.round + 1, comp.rounds.length)} / ${comp.rounds.length} — une défaite est éliminatoire !`;
  const zone = $('tournament-rounds');
  zone.innerHTML = '';
  comp.rounds.forEach((oppId, i) => {
    const opp = characterById(oppId);
    const row = el('div.bracket-row');
    if (i === t.round) row.classList.add('current');
    const face = el('span.player-avatar');
    const cnv = document.createElement('canvas');
    drawPortrait(cnv, opp.look, 76);
    face.append(cnv);
    row.append(el('div.who', [face, el('div', [
      el('div', `Ronde ${i + 1} : ${opp.name}`),
      el('div.tag-elo', `Elo ${opponentElo(oppId, state.career)}`),
    ])]));
    const res = t.results[i];
    row.append(el(`div.result.${res === 'win' ? 'win' : res ? 'loss' : 'pending'}`,
      res === 'win' ? 'Gagnée ✔' : res === 'lose' ? 'Perdue ✖' : res === 'draw' ? 'Nulle —' : i === t.round ? 'À jouer' : '…'));
    zone.append(row);
  });
  $('btn-tournament-play').style.display = t.round < comp.rounds.length ? '' : 'none';
}

function playTournamentRound() {
  const t = state.career.activeTournament;
  if (!t) return;
  const comp = competitionById(t.id);
  const oppId = comp.rounds[t.round];
  startWorldMatch({
    opponent: oppId,
    career: oppId,
    music: 'tournament',
    preLines: gigiTips(comp.id, t.round, state),
    onEnd: (r) => {
      const outcome = r.winner === 'w' ? 'win' : r.winner === 'draw' ? 'draw' : 'lose';
      const rec = recordCareerResult(oppId, outcome);
      const rewards = [`Classement : ${rec.before} → ${rec.after} (${rec.delta >= 0 ? '+' : ''}${rec.delta})`];
      if (rec.points) rewards.push(`🪙 +${rec.points} Pions d'Or`);
      t.results[t.round] = outcome;

      if (outcome === 'win') {
        t.round++;
        if (t.round >= comp.rounds.length) {
          // COMPÉTITION REMPORTÉE !
          if (!state.career.competitionsWon.includes(comp.id)) {
            state.career.competitionsWon.push(comp.id);
          }
          state.points += comp.rewardPoints;
          state.career.activeTournament = null;
          save();
          rewards.push(`🏆 Trophée : ${comp.name}`, `🪙 +${comp.rewardPoints} Pions d'Or (prime)`);
          const isWorld = comp.id === 'world';
          if (isWorld) setFlag('world_champion');
          const girl = state.player.gender === 'girl';
          showMatchOverlay({
            title: isWorld ? `🌍 ${girl ? 'CHAMPIONNE' : 'CHAMPION'} DU MONDE !!!` : `${comp.icon} ${comp.name} : REMPORTÉ !`,
            detail: isWorld
              ? `${state.player.name}, ${girl ? 'la gamine qui s\'ennuyait, est devenue championne' : 'le gamin qui s\'ennuyait, est devenu champion'} du monde de dames internationales.`
              : 'Toutes les rondes gagnées. Quelle démonstration !',
            rewards,
            buttons: [{
              label: 'Continuer',
              className: 'btn-primary',
              onClick: async () => {
                if (isWorld) {
                  enterWorld();
                  await worldChampionScene(world.questCtx());
                } else {
                  openCompetitions();
                }
              },
            }],
          });
        } else {
          save();
          showMatchOverlay({
            title: 'Ronde gagnée !',
            detail: `Prochain adversaire : ${characterById(comp.rounds[t.round]).name}.`,
            rewards,
            buttons: [
              { label: 'Ronde suivante', className: 'btn-primary', onClick: () => playTournamentRound() },
              { label: 'Voir le tableau', className: 'btn-small', onClick: () => showTournament() },
            ],
          });
        }
      } else if (outcome === 'draw') {
        save();
        showMatchOverlay({
          title: 'Partie nulle',
          detail: 'En tournoi, il faut gagner : la ronde doit être rejouée.',
          rewards,
          buttons: [
            { label: 'Rejouer la ronde', className: 'btn-primary', onClick: () => playTournamentRound() },
            { label: 'Voir le tableau', className: 'btn-small', onClick: () => showTournament() },
          ],
        });
      } else {
        // Défaite : élimination.
        state.career.activeTournament = null;
        save();
        showMatchOverlay({
          title: 'Éliminé…',
          detail: `${characterById(oppId).name} met fin à ton parcours. Entraîne-toi et retente ta chance !`,
          rewards,
          buttons: [{ label: 'Retour aux compétitions', className: 'btn-primary', onClick: () => openCompetitions() }],
        });
      }
    },
  });
}

// ---------------------------------------------------------------------------
// Salle d'entraînement (leçons et exercices de Gigi)
// ---------------------------------------------------------------------------
let trainingOrigin = 'menu';
let lessonReturn = null; // où revenir quand on quitte une leçon en cours

function openTraining(origin = trainingOrigin) {
  trainingOrigin = origin;
  if (origin === 'world') world?.leave();
  currentMatch?.destroy();
  currentMatch = null;
  showScreen('screen-training');

  const list = $('training-list');
  list.innerHTML = '';
  const done = state.training?.done || {};
  for (const cat of TRAINING_CATEGORIES) {
    list.append(el('div.shop-section-title', cat.toUpperCase()));
    for (const ex of EXERCISES.filter((e2) => e2.cat === cat)) {
      const row = el('div.bracket-row');
      const isDone = !!done[ex.id];
      row.append(el('div.who', [
        el('span', ex.icon),
        el('div', [
          el('div', `${ex.title} ${isDone ? '✅' : ''}`),
          el('div.tag-elo', ex.desc),
        ]),
      ]));
      row.append(el('button.btn.btn-small' + (isDone ? '' : '.btn-primary'),
        isDone ? 'Rejouer' : `Jouer · 🪙 ${ex.reward}`, {
          onclick: () => startTrainingExercise(ex.id),
        }));
      list.append(row);
    }
  }
}

async function startTrainingExercise(id) {
  const ex = exerciseById(id);
  if (!ex) return;
  currentMatch?.destroy();
  currentMatch = null;
  showScreen('screen-match');
  audio.playMusic('club');
  boardView.setThemes(state.equipped.board, state.equipped.pieces);
  $('name-white').textContent = state.player.name;
  $('name-black').textContent = 'Coach Gigi';
  setAvatar('avatar-white', 'player');
  setAvatar('avatar-black', 'gigi');
  $('extra-white').textContent = '';
  $('extra-black').textContent = ex.title;
  matchOrigin = 'training';
  lessonReturn = () => openTraining();

  if (!matchDialogue) matchDialogue = new Dialogue($('screen-match'));
  tutorialSignal = makeSignal();
  const doneOk = await runExercise(ex, {
    boardView,
    dialogue: matchDialogue,
    setStatus: (t) => { $('turn-pill').textContent = t; },
    signal: tutorialSignal,
  });
  tutorialSignal = null;
  if (!doneOk) return;

  const first = !state.training.done[ex.id];
  if (first) {
    state.training.done[ex.id] = true;
    state.points += ex.reward;
    save();
    audio.playSfx('coin');
  } else {
    audio.playSfx('win');
  }
  showMatchOverlay({
    title: 'Exercice réussi ! 🎓',
    detail: first ? 'Gigi hoche la tête, presque impressionné.' : 'Réviser, c\'est déjà progresser.',
    rewards: first ? [`🪙 +${ex.reward} Pions d'Or`] : [],
    buttons: [
      { label: 'Retour à la salle', className: 'btn-primary', onClick: () => openTraining() },
    ],
  });
}

// ---------------------------------------------------------------------------
// Énigmes des PNJ (Fernand, Honoré, Séraphine) : combinaisons à chercher
// ---------------------------------------------------------------------------
async function startComboChallenge(seriesId) {
  const series = comboSeriesById(seriesId);
  const bank = COMBO_BANK[seriesId];
  if (!series || !bank.length) return;
  const solved = state.training.combos[seriesId] || 0;
  const replay = solved >= bank.length; // série finie : on revoit au hasard
  const index = replay ? Math.floor(Math.random() * bank.length) : solved;
  const ex = comboToExercise(seriesId, index);
  const npc = characterById(series.npc);

  world?.leave();
  currentMatch?.destroy();
  currentMatch = null;
  showScreen('screen-match');
  audio.playMusic('club');
  boardView.setThemes(state.equipped.board, state.equipped.pieces);
  $('name-white').textContent = state.player.name;
  $('name-black').textContent = npc.name;
  setAvatar('avatar-white', 'player');
  setAvatar('avatar-black', npc.id);
  $('extra-white').textContent = '';
  $('extra-black').textContent = ex.title;
  matchOrigin = 'world';
  lessonReturn = () => enterWorld();

  if (!matchDialogue) matchDialogue = new Dialogue($('screen-match'));
  tutorialSignal = makeSignal();
  const doneOk = await runExercise(ex, {
    boardView,
    dialogue: matchDialogue,
    setStatus: (t) => { $('turn-pill').textContent = t; },
    signal: tutorialSignal,
  });
  tutorialSignal = null;
  if (!doneOk) return;

  const rewards = [];
  let seriesJustDone = false;
  let bankJustCleared = false;
  if (!replay) {
    state.training.combos[seriesId] = solved + 1;
    state.points += series.reward;
    rewards.push(`🪙 +${series.reward} Pions d'Or`);
    // La récompense de série tombe aux `core` premières énigmes ; vider
    // TOUTE la réserve (recueils compris) rapporte une prime distincte.
    seriesJustDone = solved + 1 === (series.core ?? bank.length);
    bankJustCleared = solved + 1 === bank.length;
    if (seriesJustDone) {
      const u = series.unlock;
      if (u.kind === 'board' && !state.inventory.boards.includes(u.theme)) {
        state.inventory.boards.push(u.theme);
      } else if (u.kind === 'pieces' && !state.inventory.pieces.includes(u.theme)) {
        state.inventory.pieces.push(u.theme);
      } else if (u.kind === 'flag') {
        setFlag(u.flag);
      }
      rewards.push(`🎁 ${u.label}`);
    }
    if (bankJustCleared) {
      state.points += COMBO_CLEARED_BONUS;
      rewards.push(`🏺 Réserve épuisée ! 🪙 +${COMBO_CLEARED_BONUS} Pions d'Or (prime)`);
    }
    save();
    audio.playSfx(seriesJustDone || bankJustCleared ? 'win' : 'coin');
  } else {
    audio.playSfx('win');
  }

  const remaining = bank.length - (state.training.combos[seriesId] || 0);
  const buttons = [];
  if (!replay && remaining > 0) {
    buttons.push({ label: 'Énigme suivante !', className: 'btn-primary', onClick: () => startComboChallenge(seriesId) });
  }
  buttons.push({
    label: 'Retour au monde',
    className: buttons.length ? 'btn-small' : 'btn-primary',
    onClick: () => enterWorld(),
  });
  showMatchOverlay({
    title: bankJustCleared ? `${series.icon} Réserve épuisée !` : seriesJustDone ? `${series.icon} Série terminée !` : 'Combinaison trouvée ! ✨',
    detail: bankJustCleared
      ? `Tu as résolu TOUTES les énigmes de ${npc.name} — les ${bank.length}, recueils compris. Chapeau bas.`
      : seriesJustDone
        ? `La série de ${npc.name} est vaincue… mais il lui reste ${remaining} énigmes de collection dans sa besace !`
        : replay
          ? 'Toujours aussi affûté. Réviser ses combinaisons, c\'est les voir venir en partie.'
          : `${npc.name} approuve. Il en reste ${remaining} à percer.`,
    rewards,
    buttons,
  });
}

// ---------------------------------------------------------------------------
// Académie du Damier : leçons de style et parties d'application
// ---------------------------------------------------------------------------
async function startStyleLesson(styleId) {
  const style = styleById(styleId);
  if (!style || !style.steps.length) return;
  const prof = characterById(style.npc);

  world?.leave();
  currentMatch?.destroy();
  currentMatch = null;
  showScreen('screen-match');
  audio.playMusic('club');
  boardView.setThemes(state.equipped.board, state.equipped.pieces);
  $('name-white').textContent = state.player.name;
  $('name-black').textContent = prof.name;
  setAvatar('avatar-white', 'player');
  setAvatar('avatar-black', prof.id);
  $('extra-white').textContent = '';
  $('extra-black').textContent = `${style.icon} ${style.title}`;
  matchOrigin = 'world';
  lessonReturn = () => enterWorld();

  if (!matchDialogue) matchDialogue = new Dialogue($('screen-match'));
  tutorialSignal = makeSignal();
  const doneOk = await runExercise(style, {
    boardView,
    dialogue: matchDialogue,
    setStatus: (t) => { $('turn-pill').textContent = t; },
    signal: tutorialSignal,
  });
  tutorialSignal = null;
  if (!doneOk) return;

  const rewards = [];
  const first = !state.training.styles.done[styleId];
  let graduated = false;
  if (first) {
    state.training.styles.done[styleId] = true;
    state.points += style.reward;
    rewards.push(`🪙 +${style.reward} Pions d'Or`);
    if (isAcademyGraduate(state) && !flag('academy_graduate')) {
      graduated = true;
      setFlag('academy_graduate');
      state.points += ACADEMY_GRADUATE_BONUS;
      if (!state.inventory.boards.includes('ardoise')) state.inventory.boards.push('ardoise');
      rewards.push(`🎓 DIPLÔME DE L'ACADÉMIE !`, `🪙 +${ACADEMY_GRADUATE_BONUS} Pions d'Or (prime)`, '🎁 Damier « L\'Ardoise du professeur »');
    }
    save();
    audio.playSfx(graduated ? 'win' : 'coin');
  } else {
    audio.playSfx('win');
  }
  showMatchOverlay({
    title: graduated ? '🎓 Diplômé de l\'Académie !' : `${style.icon} Leçon terminée !`,
    detail: graduated
      ? 'Les cinq styles n\'ont plus de secret pour toi : classique, Ghestem, semi-ouverte, taquin, marchand de bois.'
      : first
        ? `${prof.name} te propose maintenant une partie d'application dans ce style.`
        : 'Réviser ses classiques, littéralement.',
    rewards,
    buttons: [
      { label: 'Retour à l\'Académie', className: 'btn-primary', onClick: () => enterWorld() },
    ],
  });
}

function startStylePractice(styleId) {
  const style = styleById(styleId);
  if (!style?.practice?.fen) return;
  const firstWin = !state.training.styles.applied[styleId];
  startWorldMatch({
    opponent: style.npc,
    level: style.practice.level,
    fen: style.practice.fen,
    extra: style.practice.label,
    preLines: [{ who: style.npc, text: style.practice.invite }],
    result: {
      win: {
        title: 'Application réussie ! 🎉',
        detail: `${characterById(style.npc).name} applaudit : le style « ${style.title} » est à toi.`,
        rewards: firstWin ? [`🪙 +${style.practice.reward} Pions d'Or`] : [],
      },
      lose: {
        retry: true,
        title: 'La théorie, c\'est autre chose en pratique…',
        detail: 'Retourne voir la leçon, ou retente ta chance !',
      },
      draw: {
        retry: true,
        title: 'Partie nulle',
        detail: 'Pas mal — mais un style se prouve par la victoire.',
      },
    },
    onResult: (r, outcome) => {
      if (outcome === 'win' && firstWin) {
        state.training.styles.applied[styleId] = true;
        state.points += style.practice.reward;
        save();
      }
    },
  });
}

$('btn-training').addEventListener('click', () => openTraining('menu'));
$('btn-training-back').addEventListener('click', () => {
  if (trainingOrigin === 'world') enterWorld();
  else quitToMenu();
});

// ---------------------------------------------------------------------------
// Boutique
// ---------------------------------------------------------------------------
let shopOrigin = 'menu';

function openShop(origin = 'menu') {
  shopOrigin = origin;
  if (origin === 'world') world?.leave();
  showScreen('screen-shop');
  renderShop(() => world?.updateHud?.());
}

// ---------------------------------------------------------------------------
// Carnet du damiste (progression et guide des activités)
// ---------------------------------------------------------------------------
let carnetOrigin = 'menu';

function openCarnet(origin = 'menu') {
  carnetOrigin = origin;
  if (origin === 'world') world?.leave();
  showScreen('screen-carnet');
  renderCarnet();
}

// ---------------------------------------------------------------------------
// La bibliothèque du club : parties de maîtres à rejouer
// ---------------------------------------------------------------------------
let readerBoard = null;   // BoardView dédié à l'écran de lecture
let readerGame = null;    // { game, fens, idx } (mode lecture)

function openLibrary() {
  world?.leave();
  // Interrompt proprement une devinette en cours (retour en arrière).
  if (guess) guess.active = false;
  guess = null;
  if (readerBoard) readerBoard.onTap = null;
  showScreen('screen-library');
  const list = $('library-list');
  list.innerHTML = '';
  const read = state.library?.read || {};
  const guessed = state.library?.guessed || {};
  for (const g of GAMES) {
    const master = g.guessSide === 'w' ? g.white : g.black;
    const row = el('div.bracket-row');
    row.append(el('div.who', [
      el('span', '📖'),
      el('div', [
        el('div', `${g.white} — ${g.black} ${read[g.id] ? '✅' : ''}${guessed[g.id] ? '🎯' : ''}`),
        el('div.tag-elo', `${g.event} · ${g.theme} · ${g.moves.length} coups`),
      ]),
    ]));
    const btns = el('div');
    btns.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end';
    btns.append(el('button.btn.btn-small' + (read[g.id] ? '' : '.btn-primary'),
      read[g.id] ? 'Relire' : 'Lire · 🪙 40', { onclick: () => openGameReader(g.id) }));
    btns.append(el('button.btn.btn-small' + (guessed[g.id] ? '' : '.btn-good'),
      guessed[g.id] ? '🎯 Redeviner' : `🎯 Deviner (${master.split(' ').pop()})`,
      { onclick: () => openGameGuess(g.id) }));
    row.append(btns);
    list.append(row);
  }
}

// --- Mode « Devine le coup du maître » -------------------------------------
let guess = null; // { game, engine, idx, exact, good, miss, active }

function openGameGuess(id) {
  const game = gameById(id);
  if (!game) return;
  showScreen('screen-reader');
  if (!readerBoard) readerBoard = new BoardView($('reader-canvas'));
  readerBoard.setThemes(state.equipped.board, state.equipped.pieces);
  readerGame = null; // désactive la navigation de lecture
  const master = game.guessSide === 'w' ? game.white : game.black;
  guess = { game, engine: new RulesEngine(), idx: 0, exact: 0, good: 0, miss: 0, active: true };
  $('reader-title').textContent = `🎯 ${game.white} — ${game.black}`;
  $('reader-event').textContent = `${game.event} · Tu joues les ${game.guessSide === 'w' ? 'Blancs' : 'Noirs'} de ${master} !`;
  $('reader-ply').textContent = '';
  readerBoard.setState(guess.engine.getBoard(), { lastMove: null });
  $('reader-note').textContent = game.guessSide === 'w'
    ? 'À toi : devine le premier coup du maître.'
    : 'Les Blancs ouvrent… puis à toi de deviner chaque coup du maître.';
  guessLoop();
}

function guessScoreLine() {
  return `✅ ${guess.exact} · 👍 ${guess.good} · ❌ ${guess.miss}`;
}

async function guessLoop() {
  const g = guess;
  if (!g?.active) return;
  const { game, engine } = g;
  if (g.idx >= game.moves.length) return finishGuess();
  $('reader-ply').textContent = `${g.idx + 1}/${game.moves.length} · ${guessScoreLine()}`;
  const m = game.moves[g.idx];
  const sideToMove = engine.turn();

  if ((sideToMove === 'w' ? 'w' : 'b') !== game.guessSide) {
    // Coup de l'adversaire : joué automatiquement, animé.
    await new Promise((r) => setTimeout(r, 380));
    if (!g.active) return;
    const legal = engine.getLegalMoves().find((x) => x.from === m.from && x.to === m.to);
    const before = engine.getBoard();
    engine.applyMove(legal);
    await readerBoard.animateMove(legal, before, engine.getBoard());
    g.idx++;
    return guessLoop();
  }

  // Au maître de jouer : c'est TOI. On attend un coup légal sur le damier.
  const played = await waitReaderMove(engine);
  if (!g.active || !played) return;
  const isExact = played.from === m.from && played.to === m.to;
  if (isExact) {
    g.exact++;
    $('reader-note').textContent = `✅ ${played.from}${played.captures.length ? 'x' : '-'}${played.to} — le coup EXACT du maître !`;
  } else {
    // Le moteur compare ton coup à celui du maître (petit budget, réponse vive).
    const before = engine.fen();
    engine.applyMove(played);
    const yourScore = -findBestMove(engine.fen(), { maxDepth: 4, timeMs: 240, noise: 0 }, 1).score;
    engine.loadFen(before);
    const masterMove = engine.getLegalMoves().find((x) => x.from === m.from && x.to === m.to);
    engine.applyMove(masterMove);
    const masterScore = -findBestMove(engine.fen(), { maxDepth: 4, timeMs: 240, noise: 0 }, 1).score;
    engine.loadFen(before);
    const label = `${m.from}${m.takes ? 'x' : '-'}${m.to}`;
    if (yourScore >= masterScore - 45) {
      g.good++;
      $('reader-note').textContent = `👍 Ton coup se défend ! Mais le maître a préféré ${label}.`;
    } else {
      g.miss++;
      $('reader-note').textContent = `❌ Le maître a joué ${label}.`;
    }
    // On remet la partie sur les rails du maître.
    const before2 = engine.getBoard();
    engine.applyMove(engine.getLegalMoves().find((x) => x.from === m.from && x.to === m.to));
    await readerBoard.animateMove(masterMove, before2, engine.getBoard());
  }
  if (isExact) {
    const legal = engine.getLegalMoves().find((x) => x.from === m.from && x.to === m.to);
    const before = engine.getBoard();
    engine.applyMove(legal);
    readerBoard.setState(engine.getBoard(), { lastMove: { from: m.from, to: m.to } });
    void before;
  }
  audio.playSfx(isExact ? 'coin' : 'blip');
  g.idx++;
  guessLoop();
}

/** Attend un coup légal joué sur le damier du lecteur (sans l'appliquer). */
function waitReaderMove(engine) {
  return new Promise((resolve) => {
    let selected = null;
    const refresh = () => {
      const moves = engine.getLegalMoves();
      readerBoard.setState(engine.getBoard(), {
        selected,
        targets: selected ? moves.filter((x) => x.from === selected).map((x) => ({ to: x.to, captures: x.captures })) : [],
        moveable: [...new Set(moves.map((x) => x.from))],
        lastMove: null,
      });
    };
    refresh();
    readerBoard.onTap = (sq) => {
      if (!guess?.active) { readerBoard.onTap = null; return resolve(null); }
      const moves = engine.getLegalMoves();
      const target = selected && moves.find((x) => x.from === selected && x.to === sq);
      if (target) {
        readerBoard.onTap = null;
        resolve(target);
      } else if (sq && moves.some((x) => x.from === sq)) {
        selected = sq;
        refresh();
      } else {
        selected = null;
        refresh();
      }
    };
  });
}

function finishGuess() {
  const g = guess;
  const total = g.exact + g.good + g.miss;
  const pts = g.exact * 4 + g.good * 2;
  const first = !state.library.guessed?.[g.game.id];
  const stars = g.exact >= total * 0.7 ? '⭐⭐⭐' : g.exact + g.good >= total * 0.6 ? '⭐⭐' : '⭐';
  if (first && pts > 0) {
    if (!state.library.guessed) state.library.guessed = {};
    state.library.guessed[g.game.id] = g.exact;
    state.points += pts;
    save();
    audio.playSfx('win');
  }
  guess = null;
  showMatchOverlay({
    title: `🎯 ${stars} — ${g.exact}/${total} coups du maître !`,
    detail: `${g.exact} coups exacts, ${g.good} bonnes alternatives, ${g.miss} ratés — sur la partie ${g.game.white} — ${g.game.black}.`,
    rewards: first && pts > 0 ? [`🪙 +${pts} Pions d'Or`] : [],
    buttons: [
      { label: 'Redeviner', className: 'btn-good', onClick: () => openGameGuess(g.game.id) },
      { label: 'Bibliothèque', className: 'btn-primary', onClick: () => openLibrary() },
    ],
  });
}

function openGameReader(id) {
  const game = gameById(id);
  if (!game) return;
  showScreen('screen-reader');
  if (!readerBoard) readerBoard = new BoardView($('reader-canvas'));
  readerBoard.setThemes(state.equipped.board, state.equipped.pieces);
  // Précalcule toutes les positions de la partie
  const engine = new RulesEngine();
  const fens = [engine.fen()];
  const played = [];
  for (const m of game.moves) {
    const legal = engine.getLegalMoves().find((x) => x.from === m.from && x.to === m.to);
    if (!legal) break; // ne devrait pas arriver : parties validées par les tests
    engine.applyMove(legal);
    fens.push(engine.fen());
    played.push(legal);
  }
  readerGame = { game, fens, played, idx: 0 };
  $('reader-title').textContent = `${game.white} — ${game.black}`;
  $('reader-event').textContent = `${game.event} · ${game.theme}`;
  renderReader();
}

function renderReader() {
  if (!readerGame) return;
  const { game, fens, played, idx } = readerGame;
  const engine = new RulesEngine(fens[idx]);
  readerBoard.setState(engine.getBoard(), {
    lastMove: idx > 0 ? { from: played[idx - 1].from, to: played[idx - 1].to } : null,
  });
  $('reader-ply').textContent = `${idx}/${played.length}`;
  // Note : celle du coup qui vient d'être joué (idx-1), sinon l'intro en 0
  const note = idx === 0 ? game.notes[0] : game.notes[idx - 1];
  const mv = idx > 0 ? played[idx - 1] : null;
  const mvTxt = mv ? `${idx % 2 === 1 ? 'Blancs' : 'Noirs'} : ${mv.from}${mv.captures.length ? 'x' : '-'}${mv.to}. ` : '';
  $('reader-note').textContent = (idx > 0 ? mvTxt : '') + (note && idx > 0 && game.notes[idx - 1] ? note : idx === 0 ? note : '');

  // Première lecture complète : récompense
  if (idx === played.length) {
    if (!state.library) state.library = { read: {} };
    if (!state.library.read[game.id]) {
      state.library.read[game.id] = true;
      state.points += 40;
      save();
      audio.playSfx('coin');
      $('reader-note').textContent += ' — 🪙 +40 Pions d\'Or (première lecture) !';
    }
  }
}

function readerStep(delta) {
  if (!readerGame) return;
  const next = Math.max(0, Math.min(readerGame.played.length, readerGame.idx + delta));
  if (next === readerGame.idx) return;
  readerGame.idx = next;
  audio.playSfx('blip');
  renderReader();
}

$('btn-reader-start').addEventListener('click', () => { if (readerGame) { readerGame.idx = 0; renderReader(); } });
$('btn-reader-end').addEventListener('click', () => { if (readerGame) { readerGame.idx = readerGame.played.length; renderReader(); } });
$('btn-reader-prev').addEventListener('click', () => readerStep(-1));
$('btn-reader-next').addEventListener('click', () => readerStep(1));
$('btn-reader-back').addEventListener('click', () => openLibrary());
$('btn-library-back').addEventListener('click', () => enterWorld());

$('btn-carnet').addEventListener('click', () => openCarnet('menu'));
$('btn-world-carnet').addEventListener('click', () => openCarnet('world'));
$('btn-carnet-back').addEventListener('click', () => {
  if (carnetOrigin === 'world') enterWorld();
  else showScreen('screen-menu');
});

$('btn-shop').addEventListener('click', () => openShop('menu'));
$('btn-shop-back').addEventListener('click', () => {
  if (shopOrigin === 'world') enterWorld();
  else showScreen('screen-menu');
});

$('btn-comp-back').addEventListener('click', () => enterWorld());
$('btn-tournament-back').addEventListener('click', () => openCompetitions());
$('btn-tournament-play').addEventListener('click', () => playTournamentRound());

// ---------------------------------------------------------------------------
// Boutons de l'écran de partie
// ---------------------------------------------------------------------------
$('btn-resign').addEventListener('click', () => {
  if (!currentMatch || currentMatch.finished) return;
  // Dans l'aventure, l'humain (Blancs) abandonne ; en local, le camp au trait.
  currentMatch.resign(matchOrigin === 'world' ? 'w' : currentMatch.engine.turn());
});
$('btn-quit-match').addEventListener('click', () => {
  if (tutorialSignal) {
    // Abandon d'une leçon (tutoriel ou exercice) : retour sans valider.
    tutorialSignal.abort();
    matchDialogue?.close();
    tutorialSignal = null;
    const back = lessonReturn;
    lessonReturn = null;
    (back || enterWorld)();
    return;
  }
  if (matchOrigin === 'world') {
    if (currentMatch && !currentMatch.finished) currentMatch.resign('w');
    else enterWorld();
  } else {
    quitToMenu();
  }
});
$('btn-world-menu').addEventListener('click', () => leaveWorldToMenu());

// ---------------------------------------------------------------------------
// Menu principal
// ---------------------------------------------------------------------------
$('btn-local').addEventListener('click', () => startLocalMatch());
$('btn-vs-ai').addEventListener('click', () => openAISelect());
$('btn-ai-cancel').addEventListener('click', () => $('ai-select').classList.add('hidden'));
$('btn-continue').addEventListener('click', () => enterWorld());
$('btn-adventure').addEventListener('click', () => {
  if (!hasSave()) return enterWorld();
  // Une sauvegarde existe : on confirme avant de l'écraser.
  showMatchOverlay({
    title: 'Nouvelle partie ?',
    detail: 'Ta sauvegarde actuelle (aventure, classement, boutique) sera effacée.',
    buttons: [
      {
        label: 'Oui, tout recommencer',
        className: 'btn-danger',
        onClick: () => {
          resetSave();
          world = null; // le monde sera reconstruit sur l'état neuf
          enterWorld();
        },
      },
      { label: 'Annuler', className: 'btn-small', onClick: () => refreshMenu() },
    ],
  });
});

// --- Options ---
function openOptions() {
  showScreen('screen-options');
  $('opt-music').value = state.options.music;
  $('opt-sfx').value = state.options.sfx;
}
$('btn-options').addEventListener('click', () => openOptions());
$('btn-options-back').addEventListener('click', () => quitToMenu());
$('opt-music').addEventListener('input', (e) => {
  audio.setVolumes(parseFloat(e.target.value), state.options.sfx);
});
$('opt-sfx').addEventListener('change', (e) => {
  audio.setVolumes(state.options.music, parseFloat(e.target.value));
  audio.playSfx('capture'); // aperçu du volume choisi
});
$('btn-delete-save').addEventListener('click', () => {
  showMatchOverlay({
    title: 'Effacer la sauvegarde ?',
    detail: 'Aventure, classement, points et objets seront perdus. Définitivement.',
    buttons: [
      {
        label: 'Effacer',
        className: 'btn-danger',
        onClick: () => {
          resetSave();
          world = null;
          quitToMenu();
        },
      },
      { label: 'Annuler', className: 'btn-small', onClick: () => {} },
    ],
  });
});

// --- Crédits ---
$('btn-credits').addEventListener('click', () => showScreen('screen-credits'));
$('btn-credits-back').addEventListener('click', () => quitToMenu());

// --- Audio : déverrouillage au premier geste (règle des navigateurs) ---
const unlockAudio = () => audio.unlock();
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

loadSave();
applyPlayerIdentity();
refreshMenu();
showScreen('screen-menu');
audio.playMusic('menu');

// Petit crochet de débogage / tests automatisés (sans effet en jeu normal).
window.__dq = {
  boardView,
  get match() { return currentMatch; },
  get world() { return world; },
  startMatch,
};
