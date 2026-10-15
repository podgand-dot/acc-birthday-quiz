'use client';

import { formatTime } from '@/lib/quiz';

export type TimerState = 'idle' | 'running' | 'paused' | 'done';

interface Props {
  timeLeft: number;
  total: number;
  state: TimerState;
  size?: number;
}

/** Круговой таймер: синий → терракотовый → красный, пульсирует на последних секундах. */
export function TimerRing({ timeLeft, total, state, size = 140 }: Props) {
  const r = 45;
  const c = 2 * Math.PI * r;
  const frac = total > 0 ? Math.min(1, Math.max(0, timeLeft / total)) : 0;
  const urgent = state === 'running' && timeLeft <= 10 && timeLeft > 0;
  const color = state === 'done' ? '#C0392B' : frac > 0.5 ? '#0F3592' : frac > 0.25 ? '#AD4716' : '#C0392B';
  const fresh = timeLeft === total;

  return (
    <div
      className={`relative shrink-0 rounded-full ${urgent ? 'animate-pulse-ring' : ''}`}
      style={{ width: size, height: size }}
      role="timer"
      aria-live="off"
      aria-label={`Осталось ${formatTime(timeLeft)}`}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(15,53,146,0.12)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: fresh ? 'stroke 0.4s' : 'stroke-dashoffset 1s linear, stroke 0.4s' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`font-display font-bold tabular-nums leading-none ${urgent ? 'animate-pulse' : ''}`}
          style={{ color, fontSize: size * 0.24 }}
        >
          {formatTime(timeLeft)}
        </span>
        {state === 'paused' && (
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-navy/60">пауза</span>
        )}
        {state === 'idle' && (
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-navy/60">готов</span>
        )}
        {state === 'done' && (
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#C0392B]">стоп</span>
        )}
      </div>
    </div>
  );
}
