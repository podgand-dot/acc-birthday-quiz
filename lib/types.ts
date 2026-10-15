// --- ТИПЫ ДАННЫХ КВИЗА ---

export interface Question {
  id: number;
  text: string;       // Russian
  textEn: string;     // English
  options: string[];
  optionsEn: string[];
  answer: string;
  answerEn: string;
  time: number;       // seconds
  points: number;
  image?: string;     // URL to image (optional)
}

export interface Round {
  title: string;
  titleEn: string;
  format: string;
  formatEn: string;
  questions: Question[];
}

export interface Team {
  id: number;
  name: string;
  score: number;
}

export type View = 'MENU' | 'GAME' | 'ADMIN' | 'LEADERBOARD' | 'DESIGNS';

// --- НАСТРОЙКИ ВЕДУЩЕГО ---

export interface Settings {
  music: boolean;          // фоновая музыка вкл/выкл
  sfx: boolean;            // звуковые эффекты вкл/выкл
  musicVolume: number;     // 0..1
  sfxVolume: number;       // 0..1
  autoAdvance: boolean;    // переходить к следующему вопросу по истечении таймера
  autoAdvanceDelay: number;// пауза перед автопереходом, сек
  autoStartTimer: boolean; // запускать таймер сразу при показе вопроса
}

export const DEFAULT_SETTINGS: Settings = {
  music: true,
  sfx: true,
  musicVolume: 0.45,
  sfxVolume: 0.8,
  autoAdvance: true,
  autoAdvanceDelay: 4,
  autoStartTimer: true,
};

// --- СЛАЙДЫ ИГРЫ ---

export type Slide =
  | { type: 'ROUND_INTRO'; r: number }
  | { type: 'QUESTION'; r: number; q: number }
  | { type: 'ANSWERS_INTRO'; r: number }
  | { type: 'ANSWER'; r: number; q: number }
  | { type: 'FINISHED' };
