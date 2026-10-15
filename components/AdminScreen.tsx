'use client';

import { useRef, type Dispatch, type SetStateAction } from 'react';
import type { Question, Round } from '@/lib/types';
import { INITIAL_DATA } from '@/lib/quizData';
import { PlusIcon, TrashIcon, ResetIcon, DownloadIcon, UploadIcon } from './Icons';

const inputCls =
  'w-full rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none transition-colors focus:border-navy';
const labelCls = 'mb-1 block text-[11px] font-bold uppercase tracking-wider text-navy/60';

const splitList = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean);

const isRoundArray = (v: unknown): v is Round[] =>
  Array.isArray(v) && v.every(r => r && typeof r === 'object' && Array.isArray((r as Round).questions));

// --- ЭКРАН РЕДАКТОРА ---
export default function AdminScreen({
  quizData, setQuizData,
}: { quizData: Round[]; setQuizData: Dispatch<SetStateAction<Round[]>> }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const updateRound = (rIdx: number, patch: Partial<Round>) =>
    setQuizData(data => data.map((r, i) => (i === rIdx ? { ...r, ...patch } : r)));

  const updateQuestion = (rIdx: number, qIdx: number, patch: Partial<Question>) =>
    setQuizData(data =>
      data.map((r, i) =>
        i !== rIdx ? r : { ...r, questions: r.questions.map((q, j) => (j === qIdx ? { ...q, ...patch } : q)) },
      ),
    );

  const addQuestion = (rIdx: number) =>
    setQuizData(data =>
      data.map((r, i) => {
        if (i !== rIdx) return r;
        const last = r.questions[r.questions.length - 1];
        const q: Question = {
          id: Date.now(),
          text: '', textEn: '',
          options: last?.options?.length ? ['А) ', 'Б) ', 'В) ', 'Г) '] : [],
          optionsEn: last?.options?.length ? ['A) ', 'B) ', 'C) ', 'D) '] : [],
          answer: '', answerEn: '',
          time: last?.time ?? 60,
          points: last?.points ?? 1,
        };
        return { ...r, questions: [...r.questions, q] };
      }),
    );

  const removeQuestion = (rIdx: number, qIdx: number) => {
    if (!window.confirm('Удалить этот вопрос?')) return;
    setQuizData(data =>
      data.map((r, i) => (i !== rIdx ? r : { ...r, questions: r.questions.filter((_, j) => j !== qIdx) })),
    );
  };

  const resetAll = () => {
    if (window.confirm('Вернуть все вопросы к исходным? Ваши правки будут потеряны.')) setQuizData(INITIAL_DATA);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(quizData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'acc-quiz.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        if (!isRoundArray(parsed)) throw new Error('bad shape');
        setQuizData(parsed);
      } catch {
        window.alert('Не удалось прочитать файл. Нужен JSON, экспортированный из этого редактора.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black uppercase text-navy md:text-4xl">Редактор квиза</h2>
          <p className="font-display text-rust">Quiz editor · изменения сохраняются автоматически</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ToolButton onClick={exportJson} icon={<DownloadIcon className="h-4 w-4" />}>Экспорт</ToolButton>
          <ToolButton onClick={() => fileRef.current?.click()} icon={<UploadIcon className="h-4 w-4" />}>Импорт</ToolButton>
          <ToolButton onClick={resetAll} icon={<ResetIcon className="h-4 w-4" />}>Сбросить</ToolButton>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>

      <div className="space-y-8">
        {quizData.map((round, rIdx) => (
          <div key={rIdx} className="rounded-[2rem] bg-cream p-5 shadow-card md:p-7">
            {/* Заголовок раунда */}
            <div className="mb-5 grid grid-cols-1 gap-3 border-b border-navy/10 pb-5 md:grid-cols-2">
              <div>
                <label className={labelCls}>Название раунда (RU)</label>
                <input
                  value={round.title}
                  onChange={e => updateRound(rIdx, { title: e.target.value })}
                  className={`${inputCls} font-display text-base font-bold`}
                />
              </div>
              <div>
                <label className={labelCls}>Round title (EN)</label>
                <input
                  value={round.titleEn}
                  onChange={e => updateRound(rIdx, { titleEn: e.target.value })}
                  className={`${inputCls} font-display text-base`}
                />
              </div>
              <div>
                <label className={labelCls}>Формат (RU)</label>
                <input value={round.format} onChange={e => updateRound(rIdx, { format: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Format (EN)</label>
                <input value={round.formatEn} onChange={e => updateRound(rIdx, { formatEn: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="space-y-4">
              {round.questions.map((q, qIdx) => (
                <div key={q.id} className="rounded-2xl border border-navy/10 bg-white/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-navy">Вопрос {qIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(rIdx, qIdx)}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-navy/50 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" /> Удалить
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className={labelCls}>Вопрос (RU)</label>
                        <textarea
                          value={q.text}
                          onChange={e => updateQuestion(rIdx, qIdx, { text: e.target.value })}
                          className={inputCls}
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Question (EN)</label>
                        <textarea
                          value={q.textEn}
                          onChange={e => updateQuestion(rIdx, qIdx, { textEn: e.target.value })}
                          className={inputCls}
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className={labelCls}>Варианты RU (через запятую, пусто — открытый вопрос)</label>
                        <input
                          defaultValue={q.options.join(', ')}
                          onBlur={e => updateQuestion(rIdx, qIdx, { options: splitList(e.target.value) })}
                          className={inputCls}
                          placeholder="А) …, Б) …, В) …, Г) …"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Options EN (comma-separated)</label>
                        <input
                          defaultValue={q.optionsEn.join(', ')}
                          onBlur={e => updateQuestion(rIdx, qIdx, { optionsEn: splitList(e.target.value) })}
                          className={inputCls}
                          placeholder="A) …, B) …, C) …, D) …"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className={labelCls}>Ответ (RU)</label>
                        <input
                          value={q.answer}
                          onChange={e => updateQuestion(rIdx, qIdx, { answer: e.target.value })}
                          className={`${inputCls} font-bold`}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Answer (EN)</label>
                        <input
                          value={q.answerEn}
                          onChange={e => updateQuestion(rIdx, qIdx, { answerEn: e.target.value })}
                          className={`${inputCls} font-bold text-rust`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div className="col-span-2">
                        <label className={labelCls}>URL изображения (необязательно)</label>
                        <input
                          value={q.image || ''}
                          onChange={e => updateQuestion(rIdx, qIdx, { image: e.target.value || undefined })}
                          placeholder="https://…"
                          className={inputCls}
                        />
                        {q.image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={q.image} alt="" className="mt-2 h-20 rounded-lg border border-navy/10 object-contain" />
                        )}
                      </div>
                      <div>
                        <label className={labelCls}>Время (сек)</label>
                        <input
                          type="number"
                          min={5}
                          value={q.time}
                          onChange={e => updateQuestion(rIdx, qIdx, { time: Math.max(5, parseInt(e.target.value, 10) || 5) })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Баллы</label>
                        <input
                          type="number"
                          min={0}
                          value={q.points}
                          onChange={e => updateQuestion(rIdx, qIdx, { points: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addQuestion(rIdx)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-navy/20 py-3 font-bold text-navy/70 transition-colors hover:border-navy hover:text-navy"
              >
                <PlusIcon className="h-5 w-5" /> Добавить вопрос
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolButton({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-2 border-navy/20 px-4 py-2 text-sm font-bold text-navy transition-colors hover:bg-navy/10"
    >
      {icon} {children}
    </button>
  );
}
