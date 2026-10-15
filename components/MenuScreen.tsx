'use client';

import type { View } from '@/lib/types';
import { StarIcon, PlayIcon, TrophyIcon, PrintIcon, EditIcon, ClockIcon, MusicIcon, CheckIcon } from './Icons';

const SHORTCUTS: [string, string][] = [
  ['→ / Пробел', 'далее'],
  ['←', 'назад'],
  ['P', 'пауза'],
  ['+', '+15 секунд'],
  ['M', 'музыка'],
  ['F', 'полный экран'],
];

// --- ЭКРАН МЕНЮ ---
export default function MenuScreen({ setView }: { setView: (v: View) => void }) {
  return (
    <div className="flex flex-col items-center py-4 md:py-10">
      {/* Герой */}
      <div className="relative mb-10 flex flex-col items-center text-center animate-fade-up">
        <StarIcon className="mb-4 h-28 w-28 text-rust animate-twinkle md:h-36 md:w-36" />
        <h1 className="font-display text-5xl font-black uppercase leading-none tracking-tight text-navy md:text-7xl lg:text-8xl">
          Квиз АЦХ
        </h1>
        <p className="mt-3 font-display text-sm font-bold uppercase tracking-[0.3em] text-rust md:text-base">
          ACC Quiz · День рождения церкви
        </p>
        <p className="mt-6 max-w-2xl text-lg font-bold text-navy md:text-xl">
          Праздничный квиз ко Дню Рождения Церкви.
        </p>
        <p className="max-w-2xl text-base text-navy/60 md:text-lg">
          A birthday quiz for our Church. Let&apos;s celebrate together!
        </p>
      </div>

      {/* Действия */}
      <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2 animate-fade-up delay-200">
        <button
          type="button"
          onClick={() => setView('GAME')}
          className="group relative overflow-hidden rounded-3xl bg-navy p-7 text-left text-sand shadow-card transition-transform hover:-translate-y-1 md:col-span-2 md:p-9"
        >
          <StarIcon className="pointer-events-none absolute -right-6 -top-10 h-56 w-56 text-sand opacity-10 transition-transform duration-500 group-hover:rotate-12" />
          <div className="relative z-10 flex items-center gap-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-rust text-white shadow-lg">
              <PlayIcon className="h-8 w-8" />
            </span>
            <div>
              <div className="font-display text-2xl font-bold md:text-3xl">Начать игру</div>
              <div className="text-sand/70">Start the quiz · вопросы, таймер, ответы</div>
            </div>
          </div>
        </button>

        <MenuCard
          onClick={() => setView('LEADERBOARD')}
          icon={<TrophyIcon className="h-7 w-7" />}
          title="Таблица баллов"
          subtitle="Scoreboard"
          className="border-2 border-navy bg-cream text-navy hover:bg-navy hover:text-sand"
        />
        <MenuCard
          onClick={() => setView('DESIGNS')}
          icon={<PrintIcon className="h-7 w-7" />}
          title="Бланки ответов"
          subtitle="Answer sheets · печать"
          className="bg-rust text-sand hover:bg-rust-deep"
        />
        <MenuCard
          onClick={() => setView('ADMIN')}
          icon={<EditIcon className="h-7 w-7" />}
          title="Редактор вопросов"
          subtitle="Quiz editor"
          className="border border-navy/20 bg-white/60 text-navy hover:bg-white md:col-span-2"
        />
      </div>

      {/* Как это работает */}
      <div className="mt-14 w-full max-w-4xl animate-fade-up delay-300">
        <h2 className="mb-5 text-center font-display text-sm font-bold uppercase tracking-[0.25em] text-navy/60">
          Как проходит игра
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Step
            icon={<ClockIcon className="h-6 w-6" />}
            title="Вопрос и таймер"
            text="Каждый вопрос показывается с обратным отсчётом. Последние 10 секунд — тревожный тик."
          />
          <Step
            icon={<MusicIcon className="h-6 w-6" />}
            title="Время вышло — идём дальше"
            text="Когда таймер дойдёт до нуля, прозвучит сигнал и вопрос сам сменится следующим."
          />
          <Step
            icon={<CheckIcon className="h-6 w-6" />}
            title="Ответы после раунда"
            text="Слайд «Ответы на раунд», затем ответ на каждый вопрос по очереди — удобно проверять бланки."
          />
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-navy/70">
          <span className="mr-1 font-bold uppercase tracking-wider text-navy/50">Клавиши:</span>
          {SHORTCUTS.map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1">
              <kbd className="rounded-md bg-navy px-1.5 py-0.5 font-display text-[11px] font-bold text-sand">{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MenuCard({
  onClick, icon, title, subtitle, className,
}: { onClick: () => void; icon: React.ReactNode; title: string; subtitle: string; className: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-4 rounded-3xl p-6 text-left shadow-lg transition-all hover:-translate-y-1 ${className}`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-current/10">{icon}</span>
      <div>
        <div className="font-display text-lg font-bold md:text-xl">{title}</div>
        <div className="text-sm opacity-70">{subtitle}</div>
      </div>
    </button>
  );
}

function Step({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-navy/10 bg-white/50 p-5">
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sand">{icon}</span>
      <h3 className="mb-1 font-bold text-navy">{title}</h3>
      <p className="text-sm leading-relaxed text-navy/70">{text}</p>
    </div>
  );
}
