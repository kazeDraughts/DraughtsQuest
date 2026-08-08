/**
 * Carte-titre de lieu, façon Animal Crossing : à l'arrivée sur une carte,
 * une petite carte illustrée annonce le nom du lieu puis s'efface toute seule.
 *
 * Les lieux listés dans BANNERS ont une illustration (assets/lieux/<id>.webp) ;
 * les autres reçoivent une carte texte chaleureuse (repli automatique).
 */

import { el } from '../ui/screens.js';

// Lieux disposant d'une illustration d'ambiance.
const BANNERS = new Set(['village', 'town', 'campus', 'club', 'academy', 'shop']);

// Accroche d'ambiance par lieu (distincte du nom, facultative).
const SUBTITLES = {
  village: 'Au bord de l\'étang',
  town: 'La grande cité damiste',
  campus: 'Les jardins de l\'école',
  club: 'Le rendez-vous des joueurs',
  academy: 'L\'école des styles',
  shop: 'Cosmétiques & damiers',
  annex: 'Réservée aux diplômés',
  home: 'On est bien chez soi',
  grandpa: 'La maison de Papi',
};

let card = null;
let hideTimer = 0;
let lastId = null;

function ensureCard(container) {
  if (card && card.parentElement === container) return;
  card = el('div.location-card.hidden', [
    el('div.location-card-art'),
    el('div.location-card-ribbon', [
      el('div.location-card-name'),
      el('div.location-card-sub'),
    ]),
  ]);
  container.append(card);
}

/**
 * Annonce un lieu. `map` = { id, name }. `container` = l'écran du monde.
 * Ne réannonce pas le même lieu deux fois de suite (retour immédiat).
 */
export function showLocationCard(map, container) {
  if (!map || !container) return;
  ensureCard(container);
  if (map.id === lastId) return;   // évite le clignotement sur allers-retours
  lastId = map.id;

  const art = card.querySelector('.location-card-art');
  const name = card.querySelector('.location-card-name');
  const sub = card.querySelector('.location-card-sub');

  name.textContent = map.name || '';
  sub.textContent = SUBTITLES[map.id] || '';
  sub.style.display = SUBTITLES[map.id] ? '' : 'none';

  if (BANNERS.has(map.id)) {
    art.style.backgroundImage = `url("assets/lieux/${map.id}.webp")`;
    card.classList.remove('text-only');
  } else {
    art.style.backgroundImage = '';
    card.classList.add('text-only');
  }

  // (Re)lance l'animation apparition → maintien → disparition.
  card.classList.remove('hidden');
  card.classList.remove('show');
  void card.offsetWidth;            // reflow : redémarre la transition CSS
  card.classList.add('show');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    card.classList.remove('show');
    hideTimer = setTimeout(() => card.classList.add('hidden'), 400);
  }, 1900);
}

/** Réinitialise (par ex. en quittant le monde) pour réannoncer au retour. */
export function resetLocationCard() {
  lastId = null;
  clearTimeout(hideTimer);
  card?.classList.add('hidden');
  card?.classList.remove('show');
}
