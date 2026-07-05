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
import {
  COMPETITIONS, competitionById, competitionStatus, unlockHint,
  opponentElo, opponentAiConfig,
} from './career/opponents.js';
import { updateElo, eloTitle } from './career/elo.js';
import { renderShop } from './shop/shop.js';

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
    enterWorld();
  };
  overlay.classList.remove('hidden');
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
        openCompetitions: () => openCompetitions(),
        openShop: () => openShop('world'),
        openTraining: () => openTraining('world'),
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
