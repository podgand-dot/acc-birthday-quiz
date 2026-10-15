/**
 * Звуковой движок квиза на Web Audio API.
 *
 * - Звуковые эффекты (тик таймера, «время вышло», переходы, фанфары) синтезируются на лету.
 * - Фоновая музыка генерируется процедурно (две «атмосферы»: спокойная и напряжённая),
 *   либо воспроизводится пользовательский трек (файл с компьютера или /music/background.mp3).
 *
 * Браузеры разрешают звук только после жеста пользователя, поэтому `unlock()` вызывается
 * на первый клик/нажатие клавиши.
 */

export type Mood = 'calm' | 'tense';

interface Pattern {
  bpm: number;
  chords: number[][]; // MIDI-ноты аккорда на каждый такт
  bass: number[];     // MIDI-нота баса на каждый такт
}

// Спокойная «лаунж»-атмосфера: Cmaj7 – Am7 – Fmaj7 – G7
const CALM: Pattern = {
  bpm: 88,
  chords: [
    [60, 64, 67, 71],
    [57, 60, 64, 67],
    [53, 57, 60, 64],
    [55, 59, 62, 65],
  ],
  bass: [36, 33, 29, 31],
};

// Напряжённая «думаем над вопросом»: Am – F – Dm – E
const TENSE: Pattern = {
  bpm: 124,
  chords: [
    [57, 60, 64],
    [53, 57, 60],
    [50, 53, 57],
    [52, 56, 59],
  ],
  bass: [33, 29, 26, 28],
};

const STEPS_PER_BAR = 16; // шестнадцатые
const BARS = 4;
const LOOP_STEPS = STEPS_PER_BAR * BARS;

const midiToFreq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

type Listener = () => void;

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private synthBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;

  private musicEnabled = true;
  private sfxEnabled = true;
  private musicVolume = 0.45;
  private sfxVolume = 0.8;
  private active = false; // музыка должна играть (зависит от экрана)

  private mood: Mood = 'calm';
  private pendingMood: Mood | null = null;

  private scheduler: ReturnType<typeof setInterval> | null = null;
  private stopTimer: ReturnType<typeof setTimeout> | null = null;
  private step = 0;
  private nextTime = 0;
  private synthPlaying = false;

  private custom: { el: HTMLAudioElement; node: MediaElementAudioSourceNode; url: string; revoke: boolean } | null = null;
  customTrackName: string | null = null;

  private listeners = new Set<Listener>();

  // ---------- Публичный API ----------

  /** Создаёт/возобновляет AudioContext. Вызывать по жесту пользователя. */
  unlock() {
    const ctx = this.ensure();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);
    this.syncMusic();
  }

  get isReady() {
    return !!this.ctx && this.ctx.state === 'running';
  }

  configure(opts: { music: boolean; sfx: boolean; musicVolume: number; sfxVolume: number }) {
    this.musicEnabled = opts.music;
    this.sfxEnabled = opts.sfx;
    this.musicVolume = opts.musicVolume;
    this.sfxVolume = opts.sfxVolume;
    this.applyGains();
    this.syncMusic();
  }

  /** Включает/выключает музыку в зависимости от текущего экрана. */
  setActive(active: boolean) {
    if (this.active === active) return;
    this.active = active;
    this.syncMusic();
  }

  setMood(mood: Mood) {
    if (this.mood === mood) {
      this.pendingMood = null;
      return;
    }
    if (!this.synthPlaying) {
      this.mood = mood;
      return;
    }
    this.pendingMood = mood; // переключимся на ближайшей доле
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  get hasCustomTrack() {
    return !!this.custom;
  }

  /** Пользовательский трек из файла (mp3/ogg/wav). null — вернуть встроенную музыку. */
  setCustomFile(file: File | null) {
    if (!file) {
      this.clearCustom();
      this.emit();
      this.syncMusic();
      return;
    }
    const url = URL.createObjectURL(file);
    this.setCustomSource(url, file.name, true);
  }

  /** Пытается подхватить /music/background.mp3 из папки public, если файл положили на сервер. */
  async tryLoadDefaultTrack() {
    if (typeof window === 'undefined' || this.custom) return;
    const src = '/music/background.mp3';
    try {
      const res = await fetch(src, { method: 'HEAD' });
      const type = res.headers.get('content-type') || '';
      if (res.ok && type.startsWith('audio/')) this.setCustomSource(src, 'background.mp3', false);
    } catch {
      /* файла нет — используем синтезатор */
    }
  }

  // ---------- Звуковые эффекты ----------

  /** Тик таймера. urgent — последние секунды (громче и выше). */
  tick(urgent = false) {
    const ctx = this.sfxCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    if (urgent) {
      this.voice('square', 1480, t, 0.002, 0.02, 0.07, 0.12, this.sfxBus!);
      this.voice('sine', 740, t, 0.002, 0.03, 0.12, 0.25, this.sfxBus!);
    } else {
      this.voice('sine', 1050, t, 0.002, 0.015, 0.06, 0.16, this.sfxBus!);
    }
  }

  /** «Время вышло»: зуммер + низкий удар. */
  timeUp() {
    const ctx = this.sfxCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    lp.connect(this.sfxBus!);
    this.voice('square', 165, t, 0.01, 0.55, 0.25, 0.28, lp);
    this.voice('square', 167.5, t, 0.01, 0.55, 0.25, 0.28, lp);
    this.voice('sawtooth', 82.5, t, 0.01, 0.55, 0.3, 0.2, lp);
    this.kick(t, 0.6, this.sfxBus!);
    this.kick(t + 0.42, 0.5, this.sfxBus!);
  }

  /** Короткий «свист» при смене слайда. */
  whoosh() {
    const ctx = this.sfxCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const src = this.noiseSource(t, 0.4);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(3200, t + 0.3);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.35, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.sfxBus!);
  }

  /** Колокольчик «правильный ответ». */
  reveal() {
    const ctx = this.sfxCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const notes = [659.25, 987.77]; // E5, B5
    notes.forEach((f, i) => {
      const at = t + i * 0.13;
      this.voice('sine', f, at, 0.005, 0.05, 0.7, 0.3, this.sfxBus!);
      this.voice('sine', f * 2, at, 0.005, 0.02, 0.35, 0.08, this.sfxBus!);
      this.voice('triangle', f * 3, at, 0.005, 0.01, 0.2, 0.03, this.sfxBus!);
    });
  }

  /** Фанфары: начало раунда, финал игры. */
  fanfare() {
    const ctx = this.sfxCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const seq = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    seq.forEach((f, i) => {
      const at = t + i * 0.14;
      const last = i === seq.length - 1;
      this.voice('triangle', f, at, 0.01, last ? 0.5 : 0.08, last ? 0.6 : 0.12, 0.3, this.sfxBus!);
      this.voice('square', f / 2, at, 0.01, last ? 0.5 : 0.08, last ? 0.5 : 0.1, 0.06, this.sfxBus!);
    });
    // финальный аккорд
    const chordAt = t + seq.length * 0.14;
    [523.25, 659.25, 783.99].forEach(f => this.voice('triangle', f, chordAt, 0.02, 0.5, 0.8, 0.12, this.sfxBus!));
    this.kick(chordAt, 0.45, this.sfxBus!);
  }

  /** Барабанная дробь + удар: «Ответы на раунд N». */
  sting() {
    const ctx = this.sfxCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 14; i++) {
      const at = t + i * 0.07;
      this.brush(at, 0.08 + i * 0.012, this.sfxBus!);
    }
    const hit = t + 14 * 0.07 + 0.05;
    this.kick(hit, 0.7, this.sfxBus!);
    this.voice('triangle', 523.25, hit, 0.01, 0.3, 0.6, 0.25, this.sfxBus!);
    this.voice('triangle', 783.99, hit, 0.01, 0.3, 0.6, 0.18, this.sfxBus!);
  }

  /** Тихий щелчок для кнопок. */
  click() {
    const ctx = this.sfxCtx();
    if (!ctx) return;
    this.voice('sine', 880, ctx.currentTime, 0.002, 0.01, 0.04, 0.08, this.sfxBus!);
  }

  // ---------- Внутреннее ----------

  private emit() {
    this.listeners.forEach(fn => fn());
  }

  private sfxCtx(): AudioContext | null {
    if (!this.sfxEnabled) return null;
    const ctx = this.ensure();
    if (!ctx || ctx.state !== 'running') return null;
    return ctx;
  }

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (this.ctx) return this.ctx;
    const AC: typeof AudioContext | undefined =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 1;
    this.master.connect(ctx.destination);

    this.sfxBus = ctx.createGain();
    this.sfxBus.connect(this.master);

    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0;
    this.musicBus.connect(this.master);

    // Синтезатор → мягкий фильтр → музыкальная шина
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass';
    tone.frequency.value = 4200;
    tone.connect(this.musicBus);

    this.synthBus = ctx.createGain();
    this.synthBus.gain.value = 0.9;
    this.synthBus.connect(tone);

    // Лёгкое эхо для «воздуха»
    const delay = ctx.createDelay(1);
    delay.delayTime.value = 0.34;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const damp = ctx.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = 1800;
    const wet = ctx.createGain();
    wet.gain.value = 0.2;
    this.synthBus.connect(delay);
    delay.connect(damp);
    damp.connect(feedback);
    feedback.connect(delay);
    damp.connect(wet);
    wet.connect(this.musicBus);

    // Белый шум для перкуссии
    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noise = buf;

    this.applyGains();
    return ctx;
  }

  private applyGains() {
    if (!this.ctx || !this.sfxBus || !this.musicBus) return;
    const t = this.ctx.currentTime;
    this.sfxBus.gain.setTargetAtTime(this.sfxEnabled ? this.sfxVolume : 0, t, 0.02);
    const musicOn = this.musicEnabled && this.active;
    this.musicBus.gain.setTargetAtTime(musicOn ? this.musicVolume : 0, t, 0.25);
  }

  private syncMusic() {
    const ctx = this.ctx;
    if (!ctx) return;
    const shouldPlay = this.musicEnabled && this.active;
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    if (shouldPlay) {
      if (this.custom) {
        this.custom.el.play().catch(() => undefined);
      } else if (!this.synthPlaying) {
        this.startSynth();
      }
    } else {
      // плавно глушим, затем останавливаем
      this.stopTimer = setTimeout(() => {
        if (this.musicEnabled && this.active) return;
        if (this.custom) this.custom.el.pause();
        this.stopSynth();
      }, 700);
    }
    this.applyGains();
  }

  private setCustomSource(url: string, name: string, revoke: boolean) {
    const ctx = this.ensure();
    if (!ctx) return;
    this.clearCustom();
    const el = new Audio(url);
    el.loop = true;
    el.preload = 'auto';
    const node = ctx.createMediaElementSource(el);
    node.connect(this.musicBus!);
    this.custom = { el, node, url, revoke };
    this.customTrackName = name;
    this.stopSynth();
    this.emit();
    this.syncMusic();
  }

  private clearCustom() {
    if (!this.custom) return;
    this.custom.el.pause();
    this.custom.node.disconnect();
    if (this.custom.revoke) URL.revokeObjectURL(this.custom.url);
    this.custom = null;
    this.customTrackName = null;
  }

  // ---------- Процедурная музыка ----------

  private startSynth() {
    const ctx = this.ctx;
    if (!ctx) return;
    this.synthPlaying = true;
    this.step = 0;
    this.nextTime = ctx.currentTime + 0.05;
    this.scheduler = setInterval(() => this.schedule(), 25);
  }

  private stopSynth() {
    if (this.scheduler) clearInterval(this.scheduler);
    this.scheduler = null;
    this.synthPlaying = false;
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextTime < ctx.currentTime + 0.16) {
      if (this.pendingMood && this.step % 4 === 0) {
        this.mood = this.pendingMood;
        this.pendingMood = null;
        this.step = 0;
      }
      const pattern = this.mood === 'calm' ? CALM : TENSE;
      const stepDur = 60 / pattern.bpm / 4;
      this.playStep(pattern, this.step, this.nextTime, stepDur);
      this.nextTime += stepDur;
      this.step = (this.step + 1) % LOOP_STEPS;
    }
  }

  private playStep(p: Pattern, step: number, t: number, stepDur: number) {
    const bus = this.synthBus!;
    const bar = Math.floor(step / STEPS_PER_BAR) % BARS;
    const s = step % STEPS_PER_BAR;
    const chord = p.chords[bar];
    const root = p.bass[bar];
    const barDur = stepDur * STEPS_PER_BAR;

    if (this.mood === 'calm') {
      if (s === 0) chord.forEach(n => this.pad(n, t, barDur, 0.055, bus));
      if (s === 0 || s === 8) {
        this.bassNote(root, t, stepDur * 7, 0.2, bus);
        this.kick(t, 0.18, bus);
      }
      if (s === 4 || s === 12) this.brush(t, 0.04, bus);
      if (s % 2 === 1) this.hat(t, 0.025, bus);
      const arp = [0, 3, 6, 10, 12, 14];
      const idx = arp.indexOf(s);
      if (idx !== -1) {
        const n = chord[(idx + bar) % chord.length] + 12;
        this.pluck(n, t, 0.55, 0.085, bus);
      }
    } else {
      if (s === 0) chord.forEach(n => this.stab(n, t, barDur, 0.035, bus));
      if (s % 2 === 0) {
        const octave = s % 8 === 6 ? 12 : 0;
        this.bassPulse(root + octave, t, stepDur * 1.6, 0.16, bus);
      }
      if (s % 4 === 0) {
        this.kick(t, 0.24, bus);
        this.clickPerc(t, 0.09, bus);
      } else if (s % 2 === 0) {
        this.clickPerc(t, 0.04, bus);
      }
      const n = chord[s % chord.length] + 12 * (1 + Math.floor((s % 6) / 3));
      this.pluck(n, t, stepDur * 1.3, 0.045, bus);
    }
  }

  // ---------- Голоса ----------

  private voice(
    type: OscillatorType,
    freq: number,
    t: number,
    attack: number,
    hold: number,
    release: number,
    gain: number,
    dest: AudioNode,
    detune = 0,
  ) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = freq;
    o.detune.value = detune;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.setValueAtTime(gain, t + attack + hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + hold + release);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + attack + hold + release + 0.05);
  }

  private pad(midi: number, t: number, dur: number, gain: number, dest: AudioNode) {
    const f = midiToFreq(midi);
    this.voice('triangle', f, t, 0.35, Math.max(0.1, dur - 0.9), 0.55, gain, dest, -6);
    this.voice('sine', f, t, 0.35, Math.max(0.1, dur - 0.9), 0.55, gain * 0.8, dest, 6);
  }

  private stab(midi: number, t: number, dur: number, gain: number, dest: AudioNode) {
    const ctx = this.ctx!;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(1400, t);
    lp.frequency.exponentialRampToValueAtTime(500, t + dur * 0.8);
    lp.connect(dest);
    this.voice('sawtooth', midiToFreq(midi), t, 0.02, dur * 0.6, 0.35, gain, lp, -4);
    this.voice('sawtooth', midiToFreq(midi), t, 0.02, dur * 0.6, 0.35, gain, lp, 4);
  }

  private pluck(midi: number, t: number, dur: number, gain: number, dest: AudioNode) {
    this.voice('triangle', midiToFreq(midi), t, 0.004, 0.0, dur, gain, dest);
  }

  private bassNote(midi: number, t: number, dur: number, gain: number, dest: AudioNode) {
    const f = midiToFreq(midi);
    this.voice('sine', f, t, 0.01, dur * 0.55, dur * 0.45, gain, dest);
    this.voice('triangle', f * 2, t, 0.01, dur * 0.3, dur * 0.3, gain * 0.25, dest);
  }

  private bassPulse(midi: number, t: number, dur: number, gain: number, dest: AudioNode) {
    const ctx = this.ctx!;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(700, t);
    lp.frequency.exponentialRampToValueAtTime(220, t + dur);
    lp.connect(dest);
    this.voice('sawtooth', midiToFreq(midi), t, 0.005, dur * 0.4, dur * 0.6, gain, lp);
  }

  private kick(t: number, gain: number, dest: AudioNode) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    o.connect(g);
    g.connect(dest);
    o.start(t);
    o.stop(t + 0.35);
  }

  private noiseSource(t: number, dur: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.start(t);
    src.stop(t + dur + 0.05);
    return src;
  }

  private hat(t: number, gain: number, dest: AudioNode) {
    const ctx = this.ctx!;
    const src = this.noiseSource(t, 0.05);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
    src.connect(hp);
    hp.connect(g);
    g.connect(dest);
  }

  private brush(t: number, gain: number, dest: AudioNode) {
    const ctx = this.ctx!;
    const src = this.noiseSource(t, 0.14);
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 2800;
    bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    src.connect(bp);
    bp.connect(g);
    g.connect(dest);
  }

  private clickPerc(t: number, gain: number, dest: AudioNode) {
    const ctx = this.ctx!;
    const src = this.noiseSource(t, 0.03);
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
    src.connect(hp);
    hp.connect(g);
    g.connect(dest);
  }
}

/** Единственный экземпляр на приложение. */
export const audio = new AudioEngine();

// Для отладки в консоли браузера: window.__quizAudio
if (typeof window !== 'undefined') {
  (window as unknown as { __quizAudio?: AudioEngine }).__quizAudio = audio;
}
