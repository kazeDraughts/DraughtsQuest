/**
 * État global du jeu + sauvegarde dans le stockage local du navigateur.
 * Tout ce qui doit survivre à un rechargement passe par ici :
 * scénario, classement, points, boutique, options, position dans le monde.
 */

const KEY = 'draughtsquest_save_v1';

/** État d'une nouvelle partie. */
export function freshState() {
  return {
    version: 1,
    // Drapeaux d'avancement du scénario (voir src/story/quests.js)
    story: { flags: {} },
    // Carrière (phase 5) : classement Elo et historique
    career: {
      elo: 700,
      wins: 0,
      losses: 0,
      draws: 0,
      beaten: {},            // id d'adversaire -> nombre de victoires
      competitionsWon: [],   // ids des compétitions remportées
    },
    // Monnaie de la boutique (phase 6)
    points: 0,
    inventory: { boards: ['classic'], pieces: ['classic'] },
    equipped: { board: 'classic', pieces: 'classic' },
    // Options (phase 7)
    options: { music: 0.5, sfx: 0.8 },
    // Position dans le monde
    world: { map: 'home', x: 5, y: 4.5, dir: 'down' },
  };
}

export let state = freshState();

/** Recharge la sauvegarde si elle existe. Retourne true si trouvée. */
export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data && data.version === 1) {
      // Fusion défensive : les champs manquants prennent la valeur par défaut.
      state = { ...freshState(), ...data };
      state.story = { ...freshState().story, ...data.story };
      state.career = { ...freshState().career, ...data.career };
      state.inventory = { ...freshState().inventory, ...data.inventory };
      state.equipped = { ...freshState().equipped, ...data.equipped };
      state.options = { ...freshState().options, ...data.options };
      state.world = { ...freshState().world, ...data.world };
      return true;
    }
  } catch (e) {
    console.warn('Sauvegarde illisible, on repart de zéro.', e);
  }
  return false;
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Impossible de sauvegarder :', e);
  }
}

export function hasSave() {
  try {
    return localStorage.getItem(KEY) != null;
  } catch {
    return false;
  }
}

export function resetSave() {
  state = freshState();
  try {
    localStorage.removeItem(KEY);
  } catch { /* stockage indisponible : tant pis */ }
}

// --- Aides scénario ---
export function flag(name) {
  return !!state.story.flags[name];
}
export function setFlag(name, value = true) {
  state.story.flags[name] = value;
  save();
}
