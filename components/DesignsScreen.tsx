'use client';

import type { Round } from '@/lib/types';
import { StarIcon, PrintIcon } from './Icons';

const LETTERS = ['А/A', 'Б/B', 'В/C', 'Г/D'];


// --- ЭКРАН БЛАНКОВ (ДЛЯ ПЕЧАТИ) ---
export default function DesignsScreen({ quizData }: { quizData: Round[] }) {
  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-display text-3xl font-black uppercase text-navy md:text-4xl">Бланки ответов</h2>
          <p className="font-display text-rust">Answer sheets · A5, по одному на команду</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-full bg-rust px-6 py-3 font-bold text-white transition-colors hover:bg-rust-deep"
        >
          <PrintIcon className="h-5 w-5" /> Распечатать / Print
        </button>
      </div>

      <div className="space-y-10">
        {quizData.map((round, rIdx) => {
          const multiple = round.questions.length > 0 && round.questions.every(q => q.options && q.options.length > 0);
          const trust = /довер|trust/i.test(round.title + round.titleEn);
          const nums = round.questions.map((_, i) => i + 1);
          const variant = rIdx % 3;

          return (
            <div
              key={rIdx}
              className="relative mx-auto overflow-hidden border border-navy/20 bg-sand shadow-xl print-break print:border-none print:shadow-none"
              style={{ width: '210mm', height: '148.5mm', padding: '14mm' }}
            >
              {variant === 0 && (
                <>
                  <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-full bg-navy opacity-10" />
                  <StarIcon className="absolute right-6 top-4 h-16 w-16 text-rust" />
                </>
              )}
              {variant === 1 && <StarIcon className="absolute left-6 top-4 h-16 w-16 text-navy" />}
              {variant === 2 && (
                <>
                  <div className="absolute left-0 top-0 h-36 w-36 rounded-br-full bg-rust opacity-10" />
                  <StarIcon className="absolute -bottom-6 right-6 h-32 w-32 text-navy opacity-20" />
                </>
              )}

              <div className={variant === 1 ? 'text-right' : variant === 2 ? 'text-center' : ''}>
                <h1 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-navy">Квиз АЦХ / ACC Quiz</h1>
                <h2 className="font-display text-2xl font-black leading-tight text-rust">{round.title}</h2>
                <p className="mb-4 text-sm font-bold text-navy/60">{round.titleEn}</p>
              </div>

              <div className={`mb-6 flex items-end gap-2 border-b-2 border-navy pb-1 ${variant === 2 ? 'mx-auto w-3/4' : variant === 1 ? 'w-full' : 'w-2/3'}`}>
                <span className="text-lg font-bold text-navy">Команда / Team:</span>
                <div className="h-6 flex-1" />
              </div>

              {multiple ? (
                <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                  {nums.map(num => (
                    <div key={num} className="flex items-center gap-3">
                      <div className="w-7 font-display text-xl font-black text-navy">{num}.</div>
                      <div className="flex gap-2">
                        {LETTERS.map(letter => (
                          <div
                            key={letter}
                            className="flex h-9 w-12 items-center justify-center rounded-lg border-2 border-navy text-xs font-bold text-navy"
                          >
                            {letter}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`space-y-4 ${variant === 2 ? 'mx-auto max-w-2xl' : ''}`}>
                  {trust && (
                    <div className="flex justify-end pr-1 opacity-70">
                      <span className="text-xs font-bold uppercase tracking-wider text-navy">Уверены! / Sure! (+2 / −1)</span>
                    </div>
                  )}
                  {nums.map(num => (
                    <div key={num} className="flex items-end gap-3">
                      <div className="w-7 pb-1 font-display text-xl font-black text-navy">{num}.</div>
                      <div className="h-8 flex-1 border-b-2 border-navy/50" />
                      {trust && <div className="h-10 w-10 shrink-0 rounded-xl border-4 border-rust" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
