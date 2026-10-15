'use client';

import {
  useCallback, useEffect, useMemo, useRef, useState,
  type Dispatch, type ReactNode, type SetStateAction,
} from 'react';
import type { Question, Round, Settings, Slide, View } from '@/lib/types';
import { audio } from '@/lib/audio';
import { buildSlides, isCorrectOption, pointsLabel } from '@/lib/quiz';
import { usePersistentState } from '@/lib/storage';
import { TimerRing, type TimerState } from './TimerRing';
import { Confetti } from './Confetti';
import { SoundControls } from './SoundControls';
import {
  StarIcon, PlayIcon, PauseIcon, ChevronLeftIcon, ChevronRightIcon,
  CheckIcon, ResetIcon, PlusTimeIcon, TrophyIcon, HomeIcon,
} from './Icons';

interface Props {
  quizData: Round[];
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  setView: (v: View) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

/** «Раунд 1: Разминка» → { label: 'Раунд 1', name: 'Разминка' } */
function splitTitle(title: string, fallback: string) {
  const i = title.indexOf(':');
  if (i === -1) return { label: fallback, name: title };
  return { label: title.slice(0, i).trim(), name: title.slice(i + 1).trim() };
}

const isEditable = (el: EventTarget | null) => {
  const node = el as HTMLElement | null;
  if (!node) return false;
  const tag = node.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || node.isContentEditable;
};

// --- ЭКРАН ИГРЫ ---
export default function GameScreen({
  quizData, settings, setSettings, setView, isFullscreen, toggleFullscreen,
}: Props) {
  const slides = useMemo(() => buildSlides(quizData), [quizData]);
  const [storedIndex, setStoredIndex, loaded] = usePersistentState<number>('acc-quiz:slide', 0);
  const index = Math.min(Math.max(0, storedIndex), slides.length - 1);
  const slide = slides[index];

  const [timeLeft, setTimeLeft] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [advanceIn, setAdvanceIn] = useState<number | null>(null);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const slidesRef = useRef(slides);
  slidesRef.current = slides;
  const quizRef = useRef(quizData);
  quizRef.current = quizData;
  const firstRun = useRef(true);
  const prevTime = useRef<number | null>(null);

  // ---- навигация ----
  const next = useCallback(() => {
    setStoredIndex(i => Math.min(i + 1, slidesRef.current.length - 1));
  }, [setStoredIndex]);
  const prev = useCallback(() => {
    setStoredIndex(i => Math.max(0, Math.min(i, slidesRef.current.length - 1) - 1));
  }, [setStoredIndex]);
  const restart = useCallback(() => {
    if (window.confirm('Начать игру заново с первого раунда?')) setStoredIndex(0);
  }, [setStoredIndex]);

  const togglePause = useCallback(() => {
    setTimerState(s => {
      if (s === 'running') return 'paused';
      if (s === 'paused' || s === 'idle') return 'running';
      return s;
    });
  }, []);

  const addTime = useCallback((sec: number) => {
    setTimeLeft(t => t + sec);
    setAdvanceIn(null);
    setTimerState(s => (s === 'done' ? 'running' : s));
  }, []);

  const toggleMusic = useCallback(() => {
    audio.unlock();
    setSettings(s => ({ ...s, music: !s.music }));
  }, [setSettings]);

  // ---- смена слайда: сброс таймера, звук перехода ----
  useEffect(() => {
    if (!loaded) return;
    const s = slidesRef.current[index];
    if (!s) return;
    setAdvanceIn(null);
    prevTime.current = null;
    if (s.type === 'QUESTION') {
      const q = quizRef.current[s.r]?.questions[s.q];
      setTimeLeft(q?.time ?? 0);
      setTimerState(settingsRef.current.autoStartTimer ? 'running' : 'idle');
    } else {
      setTimerState('idle');
      setTimeLeft(0);
    }
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    switch (s.type) {
      case 'ROUND_INTRO':
      case 'FINISHED':
        audio.fanfare();
        break;
      case 'ANSWERS_INTRO':
        audio.sting();
        break;
      case 'ANSWER':
        audio.whoosh();
        window.setTimeout(() => audio.reveal(), 450);
        break;
      default:
        audio.whoosh();
    }
  }, [index, loaded]);

  // ---- ход таймера ----
  useEffect(() => {
    if (timerState !== 'running') return;
    const id = window.setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [timerState]);

  // ---- тики и «время вышло» ----
  useEffect(() => {
    if (timerState !== 'running') {
      prevTime.current = null;
      return;
    }
    if (prevTime.current === null) {
      prevTime.current = timeLeft;
      return;
    }
    if (prevTime.current === timeLeft) return;
    prevTime.current = timeLeft;
    if (timeLeft > 0) {
      audio.tick(timeLeft <= 10);
      return;
    }
    setTimerState('done');
    audio.timeUp();
    if (settingsRef.current.autoAdvance) setAdvanceIn(settingsRef.current.autoAdvanceDelay);
  }, [timeLeft, timerState]);

  // ---- автопереход после таймера ----
  useEffect(() => {
    if (advanceIn === null) return;
    if (advanceIn <= 0) {
      next();
      return;
    }
    const id = window.setTimeout(() => setAdvanceIn(a => (a === null ? null : a - 1)), 1000);
    return () => window.clearTimeout(id);
  }, [advanceIn, next]);

  // ---- настроение музыки ----
  useEffect(() => {
    const tense = slide?.type === 'QUESTION' && timerState !== 'idle';
    audio.setMood(tense ? 'tense' : 'calm');
  }, [slide?.type, timerState]);
  useEffect(() => () => audio.setMood('calm'), []);

  // ---- горячие клавиши ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEditable(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const onButton = (e.target as HTMLElement | null)?.tagName === 'BUTTON';
      switch (e.key) {
        case ' ':
        case 'Enter':
          if (onButton) return; // кнопка сама обработает
          e.preventDefault();
          next();
          break;
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          prev();
          break;
        case 'p': case 'P': case 'з': case 'З':
          togglePause();
          break;
        case 'm': case 'M': case 'ь': case 'Ь':
          toggleMusic();
          break;
        case 'f': case 'F': case 'а': case 'А':
          toggleFullscreen();
          break;
        case '+': case '=':
          addTime(15);
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, togglePause, toggleMusic, toggleFullscreen, addTime]);

  if (!loaded) return null;
  if (!slide || quizData.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8 text-center text-navy">
        <p className="text-xl">Нет вопросов. Добавьте их в редакторе.</p>
      </div>
    );
  }

  const round = 'r' in slide ? quizData[slide.r] : undefined;
  const question = slide.type === 'QUESTION' || slide.type === 'ANSWER' ? round?.questions[slide.q] : undefined;
  const nextSlide = slides[index + 1];

  const statusLabel = (() => {
    switch (slide.type) {
      case 'ROUND_INTRO': return `Раунд ${slide.r + 1} из ${quizData.length}`;
      case 'QUESTION': return `Раунд ${slide.r + 1} · Вопрос ${slide.q + 1} из ${round?.questions.length}`;
      case 'ANSWERS_INTRO': return `Раунд ${slide.r + 1} · Ответы`;
      case 'ANSWER': return `Раунд ${slide.r + 1} · Ответ ${slide.q + 1} из ${round?.questions.length}`;
      default: return 'Финал';
    }
  })();

  return (
    <section
      className={`relative flex items-center justify-center px-3 pb-32 pt-4 md:px-8 md:pt-8 ${
        isFullscreen ? 'min-h-screen' : 'min-h-[calc(100vh-3.75rem)]'
      }`}
    >
      <div key={index} className="w-full max-w-6xl animate-fade-up">
        {slide.type === 'ROUND_INTRO' && round && (
          <RoundIntroSlide round={round} r={slide.r} total={quizData.length} onStart={next} />
        )}

        {slide.type === 'QUESTION' && round && question && (
          <QuestionSlide
            round={round}
            question={question}
            r={slide.r}
            q={slide.q}
            timeLeft={timeLeft}
            timerState={timerState}
            advanceIn={advanceIn}
            isLast={nextSlide?.type !== 'QUESTION'}
            onPause={togglePause}
            onAddTime={() => addTime(15)}
            onNext={next}
            onStay={() => setAdvanceIn(null)}
          />
        )}

        {slide.type === 'ANSWERS_INTRO' && round && (
          <AnswersIntroSlide round={round} r={slide.r} onStart={next} />
        )}

        {slide.type === 'ANSWER' && round && question && (
          <AnswerSlide round={round} question={question} r={slide.r} q={slide.q} />
        )}

        {slide.type === 'FINISHED' && (
          <FinishedSlide onScores={() => setView('LEADERBOARD')} onRestart={() => setStoredIndex(0)} />
        )}
      </div>

      {/* Панель ведущего */}
      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-30 flex justify-center px-2 print:hidden">
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1 rounded-full bg-navy/95 px-2 py-1.5 text-sand shadow-card backdrop-blur">
          <HostButton onClick={() => setView('MENU')} title="На главную" aria-label="На главную">
            <HomeIcon className="h-5 w-5" />
          </HostButton>
          <HostButton onClick={prev} disabled={index === 0} title="Назад (←)" aria-label="Предыдущий слайд">
            <ChevronLeftIcon className="h-5 w-5" />
          </HostButton>

          <span className="hidden px-2 font-display text-[11px] font-bold uppercase tracking-wider text-sand/80 sm:inline">
            {statusLabel}
          </span>

          {slide.type === 'QUESTION' && (
            <>
              <HostButton
                onClick={togglePause}
                disabled={timerState === 'done'}
                title={timerState === 'running' ? 'Пауза (P)' : 'Запустить таймер (P)'}
                aria-label={timerState === 'running' ? 'Пауза' : 'Запустить таймер'}
                active={timerState === 'paused' || timerState === 'idle'}
              >
                {timerState === 'running' ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
              </HostButton>
              <HostButton onClick={() => addTime(15)} title="+15 секунд (+)" aria-label="Добавить 15 секунд">
                <PlusTimeIcon className="h-5 w-5" />
              </HostButton>
            </>
          )}

          <button
            type="button"
            onClick={next}
            disabled={index >= slides.length - 1}
            className="flex h-10 items-center gap-1 rounded-full bg-rust px-4 font-bold text-white transition-colors hover:bg-rust-deep disabled:opacity-40"
            title="Далее (→ / Пробел)"
          >
            Далее <ChevronRightIcon className="h-5 w-5" />
          </button>

          <span className="mx-1 hidden h-6 w-px bg-sand/25 sm:block" />

          <SoundControls
            settings={settings}
            setSettings={setSettings}
            placement="top"
            tone="light"
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
          <HostButton onClick={restart} title="Начать заново" aria-label="Начать игру заново">
            <ResetIcon className="h-5 w-5" />
          </HostButton>
        </div>
      </div>
    </section>
  );
}

// --- КНОПКА ПАНЕЛИ ВЕДУЩЕГО ---
function HostButton({
  children, active, className = '', ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-sand/15 disabled:opacity-30 disabled:hover:bg-transparent ${
        active ? 'bg-sand text-navy hover:bg-sand' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// --- БЕЙДЖ ---
function Badge({ children, tone = 'navy' }: { children: ReactNode; tone?: 'navy' | 'rust' | 'sand' }) {
  const cls = {
    navy: 'bg-navy text-sand',
    rust: 'bg-rust text-white',
    sand: 'bg-sand/25 text-sand border border-sand/40',
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 font-display text-[11px] font-bold uppercase tracking-wider md:text-xs ${cls}`}>
      {children}
    </span>
  );
}

// --- ТОЧКИ ПРОГРЕССА ---
function Dots({ total, current, tone = 'navy' }: { total: number; current: number; tone?: 'navy' | 'sand' }) {
  const on = tone === 'navy' ? 'bg-navy' : 'bg-sand';
  const off = tone === 'navy' ? 'bg-navy/15' : 'bg-sand/25';
  const done = tone === 'navy' ? 'bg-rust' : 'bg-rust-light';
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${i === current ? `w-6 ${on}` : i < current ? `w-2 ${done}` : `w-2 ${off}`}`}
        />
      ))}
    </div>
  );
}

// --- 1. ЗАСТАВКА РАУНДА ---
function RoundIntroSlide({ round, r, total, onStart }: { round: Round; r: number; total: number; onStart: () => void }) {
  const ru = splitTitle(round.title, `Раунд ${r + 1}`);
  const en = splitTitle(round.titleEn, `Round ${r + 1}`);
  return (
    <div className="relative flex min-h-[70vh] overflow-hidden rounded-[2.5rem] bg-navy p-8 text-sand shadow-card md:p-16">
      <StarIcon className="pointer-events-none absolute right-[-2%] top-1/2 h-[88%] w-auto -translate-y-1/2 text-sand opacity-90 animate-twinkle md:right-[3%]" />
      <div className="relative z-10 flex max-w-3xl flex-col justify-center">
        <div className="mb-6 flex items-center gap-3 animate-fade-up">
          <Badge tone="rust">{ru.label}</Badge>
          <span className="text-sm font-bold uppercase tracking-widest text-sand/60">{r + 1} / {total}</span>
        </div>
        <h2 className="mb-2 font-display text-4xl font-black uppercase leading-[1.05] md:text-6xl lg:text-7xl animate-fade-up delay-100">
          {ru.name}
        </h2>
        <p className="mb-8 font-display text-xl font-medium text-sand/70 md:text-2xl animate-fade-up delay-200">
          {en.name}
        </p>
        <p className="mb-1 text-xl font-bold md:text-2xl animate-fade-up delay-300">{round.format}</p>
        <p className="mb-10 text-base text-sand/70 md:text-lg animate-fade-up delay-300">{round.formatEn}</p>
        <div className="animate-fade-up delay-400">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-3 rounded-full bg-sand px-8 py-4 font-display text-lg font-bold text-navy shadow-lg transition-transform hover:scale-105 md:text-xl"
          >
            <PlayIcon className="h-6 w-6" /> Начать раунд
            <span className="font-sans text-base font-medium text-navy/60">/ Start</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 2. ВОПРОС ---
function QuestionSlide({
  round, question, r, q, timeLeft, timerState, advanceIn, isLast, onPause, onAddTime, onNext, onStay,
}: {
  round: Round; question: Question; r: number; q: number;
  timeLeft: number; timerState: TimerState; advanceIn: number | null; isLast: boolean;
  onPause: () => void; onAddTime: () => void; onNext: () => void; onStay: () => void;
}) {
  const hasOptions = question.options && question.options.length > 0;
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-cream shadow-card">
      {/* Полоса прогресса времени */}
      <div className="h-2 w-full bg-navy/10">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-[#C0392B]' : 'bg-rust'}`}
          style={{ width: `${question.time ? (timeLeft / question.time) * 100 : 0}%` }}
        />
      </div>

      <div className="p-6 md:p-10 lg:p-12">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="navy">Раунд {r + 1}</Badge>
              <Badge tone="rust">{pointsLabel(question.points)}</Badge>
            </div>
            <h3 className="font-display text-xl font-bold uppercase text-navy md:text-2xl">
              Вопрос {q + 1}
              <span className="text-navy/40"> / {round.questions.length}</span>
            </h3>
          </div>
          <TimerRing timeLeft={timeLeft} total={question.time} state={timerState} size={132} />
        </div>

        <div className="mb-8">
          <p className="mb-3 text-2xl font-bold leading-snug text-navy md:text-4xl lg:text-[2.75rem] lg:leading-[1.2]">
            {question.text}
          </p>
          <p className="text-lg font-medium leading-snug text-rust md:text-2xl">
            {question.textEn}
          </p>
        </div>

        {question.image && (
          <div className="mb-8 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={question.image}
              alt=""
              className="max-h-[40vh] rounded-3xl border-4 border-white object-contain shadow-lg"
            />
          </div>
        )}

        {hasOptions && (
          <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            {question.options.map((opt, i) => (
              <div
                key={i}
                className="rounded-2xl border-2 border-navy/10 bg-white px-5 py-4 transition-colors md:px-6 md:py-5 animate-fade-up"
                style={{ animationDelay: `${120 + i * 80}ms` }}
              >
                <div className="text-lg font-bold text-navy md:text-2xl">{opt}</div>
                {question.optionsEn[i] && (
                  <div className="text-sm text-rust md:text-base">{question.optionsEn[i]}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-navy/10 pt-6">
          <Dots total={round.questions.length} current={q} />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPause}
              disabled={timerState === 'done'}
              className="flex items-center gap-2 rounded-full border-2 border-navy/20 px-5 py-2.5 font-bold text-navy transition-colors hover:bg-navy/10 disabled:opacity-40"
            >
              {timerState === 'running' ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
              {timerState === 'running' ? 'Пауза' : timerState === 'idle' ? 'Старт' : 'Продолжить'}
            </button>
            <button
              type="button"
              onClick={onAddTime}
              className="flex items-center gap-2 rounded-full border-2 border-navy/20 px-5 py-2.5 font-bold text-navy transition-colors hover:bg-navy/10"
            >
              <PlusTimeIcon className="h-5 w-5" /> 15 с
            </button>
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-2 rounded-full bg-rust px-6 py-2.5 font-bold text-white shadow-md transition-colors hover:bg-rust-deep"
            >
              {isLast ? 'К ответам' : 'Следующий'} <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Оверлей «Время вышло» */}
      {timerState === 'done' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-[2.5rem] bg-navy/95 p-8 text-center text-sand animate-fade-in">
          <StarIcon className="mb-4 h-20 w-20 text-rust-light animate-shake" />
          <h3 className="mb-1 font-display text-4xl font-black uppercase md:text-6xl">Время вышло!</h3>
          <p className="mb-8 font-display text-xl text-sand/70 md:text-2xl">Time&apos;s up!</p>

          {advanceIn !== null ? (
            <>
              <p className="mb-3 text-lg md:text-xl">
                {isLast ? 'Переходим к ответам через' : 'Следующий вопрос через'}{' '}
                <span className="font-display text-3xl font-black text-rust-light tabular-nums">{advanceIn}</span>
              </p>
              <div className="mb-8 h-1.5 w-64 overflow-hidden rounded-full bg-sand/20">
                <div
                  key={advanceIn}
                  className="h-full origin-left bg-rust-light"
                  style={{ animation: 'shrink 1s linear forwards' }}
                />
              </div>
            </>
          ) : null}

          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-2 rounded-full bg-sand px-7 py-3 font-display text-lg font-bold text-navy transition-transform hover:scale-105"
            >
              {isLast ? 'К ответам' : 'Следующий'} <ChevronRightIcon className="h-5 w-5" />
            </button>
            {advanceIn !== null && (
              <button
                type="button"
                onClick={onStay}
                className="rounded-full border-2 border-sand/40 px-6 py-3 font-bold text-sand transition-colors hover:bg-sand/10"
              >
                Остаться
              </button>
            )}
            <button
              type="button"
              onClick={onAddTime}
              className="flex items-center gap-2 rounded-full border-2 border-sand/40 px-6 py-3 font-bold text-sand transition-colors hover:bg-sand/10"
            >
              <PlusTimeIcon className="h-5 w-5" /> 15 с
            </button>
          </div>
          <style>{`@keyframes shrink { from { transform: scaleX(1) } to { transform: scaleX(0) } }`}</style>
        </div>
      )}
    </div>
  );
}

// --- 3. «ОТВЕТЫ НА РАУНД N» ---
function AnswersIntroSlide({ round, r, onStart }: { round: Round; r: number; onStart: () => void }) {
  const ru = splitTitle(round.title, `Раунд ${r + 1}`);
  const en = splitTitle(round.titleEn, `Round ${r + 1}`);
  return (
    <div className="relative flex min-h-[70vh] overflow-hidden rounded-[2.5rem] bg-rust p-8 text-sand shadow-card md:p-16">
      <StarIcon className="pointer-events-none absolute left-[-4%] top-1/2 h-[88%] w-auto -translate-y-1/2 text-sand opacity-20 animate-slow-spin" />
      <div className="relative z-10 flex w-full flex-col items-center justify-center text-center">
        <Badge tone="sand">{ru.label} · {ru.name}</Badge>
        <h2 className="mt-6 font-display text-4xl font-black uppercase leading-[1.05] md:text-6xl lg:text-7xl animate-fade-up delay-100">
          Ответы<br />на раунд {r + 1}
        </h2>
        <p className="mt-3 font-display text-xl font-medium text-sand/80 md:text-2xl animate-fade-up delay-200">
          Answers · {en.label}
        </p>
        <p className="mt-8 max-w-2xl text-lg font-bold md:text-xl animate-fade-up delay-300">
          Обменяйтесь бланками с соседней командой и проверяйте вместе с нами.
        </p>
        <p className="mb-10 mt-1 max-w-2xl text-base text-sand/75 md:text-lg animate-fade-up delay-300">
          Swap your answer sheets with the next team and check along with us.
        </p>
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-3 rounded-full bg-sand px-8 py-4 font-display text-lg font-bold text-rust shadow-lg transition-transform hover:scale-105 md:text-xl animate-fade-up delay-400"
        >
          Показать ответы <ChevronRightIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

// --- 4. ОТВЕТ НА ВОПРОС ---
function AnswerSlide({ round, question, r, q }: { round: Round; question: Question; r: number; q: number }) {
  const hasOptions = question.options && question.options.length > 0;
  return (
    <div className="overflow-hidden rounded-[2.5rem] bg-cream shadow-card">
      <div className="h-2 w-full bg-rust" />
      <div className="p-6 md:p-10 lg:p-12">
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <Badge tone="rust">Ответы · Раунд {r + 1}</Badge>
          <Badge tone="navy">{pointsLabel(question.points)}</Badge>
        </div>
        <h3 className="mb-4 font-display text-xl font-bold uppercase text-navy md:text-2xl">
          Вопрос {q + 1}
          <span className="text-navy/40"> / {round.questions.length}</span>
        </h3>

        <div className="mb-6">
          <p className="mb-2 text-xl font-bold leading-snug text-navy md:text-3xl">{question.text}</p>
          <p className="text-base font-medium text-rust md:text-xl">{question.textEn}</p>
        </div>

        {hasOptions && (
          <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            {question.options.map((opt, i) => {
              const correct = isCorrectOption(opt, question.answer);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-2xl border-2 px-5 py-3 transition-all md:px-6 md:py-4 ${
                    correct
                      ? 'border-navy bg-navy text-sand shadow-lg animate-pop delay-300'
                      : 'border-navy/10 bg-white text-navy opacity-50'
                  }`}
                >
                  <div>
                    <div className="text-lg font-bold md:text-xl">{opt}</div>
                    {question.optionsEn[i] && (
                      <div className={`text-sm ${correct ? 'text-sand/70' : 'text-rust'}`}>{question.optionsEn[i]}</div>
                    )}
                  </div>
                  {correct && (
                    <span className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-navy">
                      <CheckIcon className="h-5 w-5" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-3xl border-4 border-rust bg-white p-6 shadow-lg md:p-8 animate-pop delay-400">
          <div className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-rust">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rust text-white">
              <CheckIcon className="h-4 w-4" />
            </span>
            Правильный ответ · Correct answer
          </div>
          <p className="font-display text-2xl font-black leading-tight text-navy md:text-4xl">{question.answer}</p>
          <p className="mt-2 text-lg font-medium text-rust md:text-xl">{question.answerEn}</p>
        </div>

        <div className="mt-6 flex justify-center">
          <Dots total={round.questions.length} current={q} />
        </div>
      </div>
    </div>
  );
}

// --- 5. ФИНАЛ ---
function FinishedSlide({ onScores, onRestart }: { onScores: () => void; onRestart: () => void }) {
  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-[2.5rem] bg-navy p-8 text-center text-sand shadow-card md:p-16">
      <Confetti />
      <div className="relative z-10 flex flex-col items-center">
        <StarIcon className="mb-6 h-32 w-32 text-sand animate-twinkle md:h-44 md:w-44" />
        <h2 className="font-display text-4xl font-black uppercase leading-none md:text-7xl animate-fade-up delay-100">
          Игра<br />завершена!
        </h2>
        <p className="mt-3 font-display text-xl text-sand/70 md:text-2xl animate-fade-up delay-200">Game over!</p>
        <p className="mt-8 max-w-xl text-lg font-bold md:text-xl animate-fade-up delay-300">
          Соберите финальные бланки и подсчитайте баллы.
        </p>
        <p className="max-w-xl text-base text-sand/70 md:text-lg animate-fade-up delay-300">
          Collect the answer sheets and count the scores.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-up delay-400">
          <button
            type="button"
            onClick={onScores}
            className="flex items-center gap-2 rounded-full bg-rust px-8 py-4 font-display text-lg font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            <TrophyIcon className="h-6 w-6" /> Таблица баллов
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex items-center gap-2 rounded-full border-2 border-sand/40 px-8 py-4 font-bold text-sand transition-colors hover:bg-sand/10"
          >
            <ResetIcon className="h-5 w-5" /> Сыграть снова
          </button>
        </div>
      </div>
    </div>
  );
}
