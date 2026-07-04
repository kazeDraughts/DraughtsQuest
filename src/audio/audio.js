/**
 * Audio de DraughtsQuest — 100 % Web Audio API, zéro fichier externe :
 * les musiques d'ambiance sont de petites boucles génératives (chiptune
 * douce) et les effets sonores sont synthétisés. Tout est donc libre de
 * droits et léger. Pour utiliser de « vrais » assets, il suffit de
 * remplacer les méthodes playMusic/playSfx (voir README).
 *
 * L'AudioContext n'est créé qu'au premier geste utilisateur (règle des
 * navigateurs) : appeler audio.unlock() sur un clic/toucher global.
 */

import { state, save } from '../save/save.js';

const NOTE = (n) => 440 * 2 ** ((n - 69) / 12); // midi -> Hz

// Boucles musicales : { bpm, bass: [midi|0 par croche], lead: [[midi,durée-croches]|0] }
const TRACKS = {
  menu: {
    bpm: 76, wave: 'triangle', bassWave: 'sine',
    bass: [45, 0, 52, 0, 50, 0, 45, 0],
    lead: [[69, 2], [72, 2], [76, 2], [74, 1], [72, 1], [69, 2], [64, 4], [0, 2]],
    vol: 0.5,
  },
  village: {
    bpm: 96, wave: 'triangle', bassWave: 'triangle',
    bass: [48, 0, 55, 0, 53, 0, 55, 0, 48, 0, 55, 0, 57, 0, 55, 0],
    lead: [[72, 1], [76, 1], [79, 2], [76, 1], [72, 1], [74, 2], [76, 1], [77, 1], [76, 2], [72, 2], [0, 2]],
    vol: 0.45,
  },
  club: {
    bpm: 84, wave: 'sine', bassWave: 'sine',
    bass: [43, 0, 50, 0, 46, 0, 50, 0, 41, 0, 48, 0, 43, 0, 0, 0],
    lead: [[67, 2], [70, 1], [72, 3], [0, 2], [74, 1], [72, 1], [70, 2], [67, 2], [0, 2]],
    vol: 0.4,
  },
  match: {
    bpm: 108, wave: 'square', bassWave: 'sine',
    bass: [38, 0, 38, 0, 45, 0, 38, 0, 36, 0, 36, 0, 43, 0, 36, 0],
    lead: [[62, 1], [0, 1], [65, 1], [0, 1], [62, 1], [0, 3], [69, 1], [0, 1], [67, 1], [0, 5]],
    vol: 0.3,
  },
  tournament: {
    bpm: 120, wave: 'square', bassWave: 'triangle',
    bass: [40, 40, 47, 40, 43, 43, 50, 43, 45, 45, 52, 45, 47, 47, 43, 40],
    lead: [[64, 1], [67, 1], [71, 2], [67, 1], [64, 1], [69, 2], [71, 1], [72, 1], [71, 2], [67, 2], [0, 2]],
    vol: 0.32,
  },
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.currentTrack = null;
    this._timer = null;
    this._step = 0;
  }

  /** À appeler sur un geste utilisateur : crée/réveille le contexte audio. */
  unlock() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return; // pas d'audio disponible : le jeu reste silencieux
      }
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.applyVolumes();
      if (this._wanted) this.playMusic(this._wanted);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  applyVolumes() {
    if (!this.ctx) return;
    this.musicGain.gain.value = state.options.music;
    this.sfxGain.gain.value = state.options.sfx;
  }

  setVolumes(music, sfx) {
    state.options.music = music;
    state.options.sfx = sfx;
    save();
    this.applyVolumes();
  }

  // ------------------------------------------------------------------ musique
  /** Lance (ou change) la boucle d'ambiance : menu, village, club, match… */
  playMusic(name) {
    this._wanted = name;
    if (!this.ctx) return; // sera lancée au déverrouillage
    if (this.currentTrack === name) return;
    this.stopMusic();
    const t = TRACKS[name];
    if (!t) return;
    this.currentTrack = name;

    const eighth = 60 / t.bpm / 2; // durée d'une croche
    this._step = 0;
    let leadIdx = 0;
    let leadWait = 0;

    const tick = () => {
      const ctx = this.ctx;
      if (!ctx || this.currentTrack !== name) return;
      const now = ctx.currentTime;
      // Basse : une note par croche
      const b = t.bass[this._step % t.bass.length];
      if (b) this._note(b - 12, now, eighth * 0.9, t.bassWave, 0.5 * t.vol, this.musicGain);
      // Mélodie : notes à durées variables
      if (leadWait <= 0) {
        const [n, dur] = t.lead[leadIdx % t.lead.length];
        if (n) this._note(n, now, eighth * dur * 0.92, t.wave, t.vol, this.musicGain);
        leadWait = dur;
        leadIdx++;
      }
      leadWait--;
      this._step++;
    };
    tick();
    this._timer = setInterval(tick, eighth * 1000);
  }

  stopMusic() {
    clearInterval(this._timer);
    this._timer = null;
    this.currentTrack = null;
  }

  _note(midi, when, dur, wave, vol, dest) {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = wave;
    osc.frequency.value = NOTE(midi);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(g);
    g.connect(dest);
    osc.start(when);
    osc.stop(when + dur + 0.05);
  }

  // --------------------------------------------------------------------- sfx
  playSfx(name) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const n = (midi, t0, dur, wave = 'sine', vol = 0.5) =>
      this._note(midi, now + t0, dur, wave, vol, this.sfxGain);

    switch (name) {
      case 'move': // petit toc de pièce posée
        this._noise(now, 0.05, 900, 0.35);
        break;
      case 'capture': // toc plus grave + claquement
        this._noise(now, 0.09, 400, 0.5);
        n(45, 0, 0.1, 'triangle', 0.3);
        break;
      case 'promote': // arpège de couronnement
        n(72, 0, 0.12, 'triangle', 0.4);
        n(76, 0.09, 0.12, 'triangle', 0.4);
        n(79, 0.18, 0.2, 'triangle', 0.45);
        break;
      case 'win':
        n(72, 0, 0.15, 'square', 0.3);
        n(76, 0.12, 0.15, 'square', 0.3);
        n(79, 0.24, 0.15, 'square', 0.3);
        n(84, 0.36, 0.4, 'square', 0.35);
        break;
      case 'lose':
        n(64, 0, 0.25, 'sawtooth', 0.2);
        n(60, 0.2, 0.25, 'sawtooth', 0.2);
        n(55, 0.4, 0.5, 'sawtooth', 0.22);
        break;
      case 'coin':
        n(88, 0, 0.07, 'square', 0.3);
        n(93, 0.06, 0.18, 'square', 0.3);
        break;
      case 'blip':
        n(80, 0, 0.06, 'square', 0.18);
        break;
      case 'door':
        this._noise(now, 0.18, 300, 0.3);
        break;
      case 'step':
        this._noise(now, 0.03, 1400, 0.12);
        break;
      default:
        n(70, 0, 0.08, 'sine', 0.2);
    }
  }

  /** Bruit filtré court (percussions, portes). */
  _noise(when, dur, freq, vol) {
    const ctx = this.ctx;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfxGain);
    src.start(when);
  }
}

export const audio = new AudioEngine();
