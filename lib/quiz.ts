import type { Round, Slide } from './types';

/**
 * Разворачивает раунды в линейный список слайдов:
 * заставка раунда → вопросы → «Ответы на раунд N» → ответ на каждый вопрос → ... → финал.
 */
export function buildSlides(rounds: Round[]): Slide[] {
  const slides: Slide[] = [];
  rounds.forEach((round, r) => {
    slides.push({ type: 'ROUND_INTRO', r });
    round.questions.forEach((_, q) => slides.push({ type: 'QUESTION', r, q }));
    slides.push({ type: 'ANSWERS_INTRO', r });
    round.questions.forEach((_, q) => slides.push({ type: 'ANSWER', r, q }));
  });
  slides.push({ type: 'FINISHED' });
  return slides;
}

/** 125 → "2:05", 45 → "0:45" */
export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

const letterOf = (s: string): string | null => {
  const m = s.trim().match(/^([а-яёa-z])\s*[).:]/i);
  return m ? m[1].toLowerCase() : null;
};

/**
 * Является ли вариант правильным ответом.
 * Сравнивает по букве («Б) …» ↔ «Б) … (Деяния 11:26)») либо по началу строки.
 */
export function isCorrectOption(option: string, answer: string): boolean {
  const o = option.trim().toLowerCase();
  const a = answer.trim().toLowerCase();
  if (!o || !a) return false;
  if (a.startsWith(o)) return true;
  const lo = letterOf(o);
  const la = letterOf(a);
  return !!lo && !!la && lo === la;
}

export function pluralRu(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (last > 1 && last < 5) return few;
  if (last === 1) return one;
  return many;
}

export function pointsLabel(points: number): string {
  return `${points} ${pluralRu(points, 'балл', 'балла', 'баллов')}`;
}
