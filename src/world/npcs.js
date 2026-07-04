/**
 * Fiches des personnages : apparence (portrait + sprite) et identité.
 * Les DIALOGUES, eux, dépendent de l'avancement du scénario : ils sont
 * définis dans src/story/quests.js (getDialogueFor).
 */

export const CHARACTERS = {
  player: {
    id: 'player', name: 'Tim',
    look: { skin: '#f2c79a', hair: '#5b3a1e', hairStyle: 'cap', capColor: '#d84f42', shirt: '#3d7dc8', blush: true, bg: '#37576f' },
  },
  mom: {
    id: 'mom', name: 'Maman',
    look: { skin: '#f2c79a', hair: '#7a4a2a', hairStyle: 'bun', shirt: '#b8564f', blush: true, bg: '#5f4a37' },
  },
  grandpa: {
    id: 'grandpa', name: 'Papi Marcel',
    look: { skin: '#eab98b', hair: '#d8d8d8', hairStyle: 'grayfringe', beard: '#d8d8d8', glasses: true, shirt: '#6d7a52', bg: '#4a4437' },
  },
  gigi: {
    id: 'gigi', name: 'Gigi',
    look: { skin: '#e0b184', hair: '#2c2c34', hairStyle: 'bald', mustache: '#2c2c34', shirt: '#8248a8', glasses: true, bg: '#3f2f52' },
  },
  momo: {
    id: 'momo', name: 'Momo',
    look: { skin: '#c98850', hair: '#1d1d22', hairStyle: 'short', shirt: '#d8a03c', bg: '#57472a' },
  },
  lea: {
    id: 'lea', name: 'Léa',
    look: { skin: '#f5d3b0', hair: '#c8552e', hairStyle: 'long', shirt: '#46a06a', blush: true, bg: '#2f523f' },
  },
  karim: {
    id: 'karim', name: 'Karim',
    look: { skin: '#caa06e', hair: '#38281a', hairStyle: 'short', shirt: '#4a5f8f', mustache: '#38281a', bg: '#333f57' },
  },
  shopkeeper: {
    id: 'shopkeeper', name: 'Mme Plot',
    look: { skin: '#f2c79a', hair: '#8a6ea0', hairStyle: 'bun', glasses: true, shirt: '#c8763c', bg: '#5c4630' },
  },
  villager1: {
    id: 'villager1', name: 'Lucien',
    look: { skin: '#eab98b', hair: '#9a9a9a', hairStyle: 'short', shirt: '#7d8a96', bg: '#414a52' },
  },
  villager2: {
    id: 'villager2', name: 'Suzette',
    look: { skin: '#f5d3b0', hair: '#e8e8e8', hairStyle: 'bun', shirt: '#a05a78', blush: true, bg: '#523c46' },
  },
  arbiter: {
    id: 'arbiter', name: 'L\'Arbitre',
    look: { skin: '#e0b184', hair: '#3c3c46', hairStyle: 'short', shirt: '#2c2c34', glasses: true, bg: '#2c333d' },
  },
  rival1: {
    id: 'rival1', name: 'Bastien',
    look: { skin: '#f2c79a', hair: '#c8a23c', hairStyle: 'short', shirt: '#b03a3a', bg: '#57302a' },
  },
  rival2: {
    id: 'rival2', name: 'Mireille',
    look: { skin: '#eab98b', hair: '#6e5a8a', hairStyle: 'long', shirt: '#3c78b0', glasses: true, bg: '#2f4257' },
  },
  champion: {
    id: 'champion', name: 'Viktor Roi',
    look: { skin: '#e8c49c', hair: '#1a1a20', hairStyle: 'short', shirt: '#20242c', mustache: '#1a1a20', bg: '#23262e' },
  },
  anke: {
    id: 'anke', name: 'Anke Vries',
    look: { skin: '#f5d3b0', hair: '#e8d48a', hairStyle: 'bun', shirt: '#d8683c', bg: '#54331f' },
  },
  sergei: {
    id: 'sergei', name: 'Sergueï Volk',
    look: { skin: '#e8c49c', hair: '#8a8f96', hairStyle: 'short', beard: '#8a8f96', shirt: '#3a4a5c', bg: '#2b3642' },
  },
};

export function characterById(id) {
  return CHARACTERS[id] || CHARACTERS.villager1;
}
