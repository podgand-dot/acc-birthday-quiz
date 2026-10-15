'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import type { Team } from '@/lib/types';
import { audio } from '@/lib/audio';
import { PlusIcon, MinusIcon, TrashIcon, ResetIcon, TrophyIcon, EditIcon, CheckIcon } from './Icons';

const RANK_STYLE = [
  'bg-[#E3B341] text-navy-deep',  // золото
  'bg-[#C7C7C7] text-navy-deep',  // серебро
  'bg-[#B8793E] text-white',      // бронза
];

// --- ЭКРАН ТАБЛИЦЫ ЛИДЕРОВ ---
export default function LeaderboardScreen({
  teams, setTeams,
}: { teams: Team[]; setTeams: Dispatch<SetStateAction<Team[]>> }) {
  const [newTeamName, setNewTeamName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const addTeam = () => {
    const name = newTeamName.trim();
    if (!name) return;
    setTeams(t => [...t, { id: Date.now(), name, score: 0 }]);
    setNewTeamName('');
    audio.click();
  };

  const updateScore = (id: number, delta: number) => {
    setTeams(t => t.map(team => (team.id === id ? { ...team, score: team.score + delta } : team)));
    audio.click();
  };

  const setScore = (id: number, value: number) => {
    if (Number.isNaN(value)) return;
    setTeams(t => t.map(team => (team.id === id ? { ...team, score: value } : team)));
  };

  const removeTeam = (team: Team) => {
    if (window.confirm(`Удалить команду «${team.name}»?`)) setTeams(t => t.filter(x => x.id !== team.id));
  };

  const resetScores = () => {
    if (window.confirm('Обнулить баллы всех команд?')) setTeams(t => t.map(x => ({ ...x, score: 0 })));
  };

  const startEdit = (team: Team) => {
    setEditingId(team.id);
    setEditName(team.name);
  };
  const commitEdit = () => {
    const name = editName.trim();
    if (editingId !== null && name) {
      setTeams(t => t.map(x => (x.id === editingId ? { ...x, name } : x)));
    }
    setEditingId(null);
  };

  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const top = sorted[0]?.score ?? 0;

  return (
    <div className="mx-auto max-w-4xl animate-fade-up">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black uppercase text-navy md:text-4xl">Таблица баллов</h2>
          <p className="font-display text-rust">Scoreboard</p>
        </div>
        <button
          type="button"
          onClick={resetScores}
          disabled={teams.length === 0}
          className="flex items-center gap-2 rounded-full border-2 border-navy/20 px-4 py-2 text-sm font-bold text-navy transition-colors hover:bg-navy/10 disabled:opacity-40"
        >
          <ResetIcon className="h-4 w-4" /> Обнулить баллы
        </button>
      </div>

      <div className="rounded-[2rem] bg-cream p-5 shadow-card md:p-8">
        <div className="mb-6 flex gap-2">
          <input
            type="text"
            value={newTeamName}
            onChange={e => setNewTeamName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTeam()}
            placeholder="Название команды / Team name"
            className="flex-1 rounded-2xl border-2 border-navy/15 bg-white px-4 py-3 text-lg text-navy outline-none transition-colors focus:border-navy"
          />
          <button
            type="button"
            onClick={addTeam}
            className="flex items-center gap-2 rounded-2xl bg-rust px-5 py-3 font-bold text-white transition-colors hover:bg-rust-deep"
          >
            <PlusIcon className="h-5 w-5" /> <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>

        <div className="space-y-3">
          {sorted.map((team, index) => {
            const leader = index === 0 && team.score > 0 && team.score === top;
            return (
              <div
                key={team.id}
                className={`flex flex-col gap-3 rounded-2xl border p-3 transition-colors md:flex-row md:items-center md:justify-between md:p-4 ${
                  leader ? 'border-rust/40 bg-white shadow-md' : 'border-navy/10 bg-white/60'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg font-black ${
                      RANK_STYLE[index] ?? 'bg-navy text-sand'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {editingId === team.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEdit();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="min-w-0 flex-1 rounded-xl border-2 border-navy px-3 py-1.5 text-xl font-bold text-navy outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEdit(team)}
                      title="Переименовать"
                      className="group flex min-w-0 items-center gap-2 text-left"
                    >
                      <span className="truncate text-xl font-bold text-navy md:text-2xl">{team.name}</span>
                      {leader && <TrophyIcon className="h-5 w-5 shrink-0 text-rust" />}
                      <EditIcon className="h-4 w-4 shrink-0 text-navy/30 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 md:justify-end">
                  <div className="flex items-center gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-navy/10">
                    <button
                      type="button"
                      onClick={() => updateScore(team.id, -1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-rust transition-colors hover:bg-rust/10"
                      aria-label="Минус один балл"
                    >
                      <MinusIcon className="h-5 w-5" />
                    </button>
                    <input
                      type="number"
                      value={team.score}
                      onChange={e => setScore(team.id, parseInt(e.target.value, 10))}
                      className="w-16 bg-transparent text-center font-display text-2xl font-black text-navy outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      aria-label="Баллы"
                    />
                    <button
                      type="button"
                      onClick={() => updateScore(team.id, 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-sand transition-colors hover:bg-navy-deep"
                      aria-label="Плюс один балл"
                    >
                      <PlusIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {editingId === team.id ? (
                    <button
                      type="button"
                      onClick={commitEdit}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-navy/10"
                      aria-label="Сохранить имя"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => removeTeam(team)}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-navy/40 transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label="Удалить команду"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {teams.length === 0 && (
            <p className="py-10 text-center text-navy/50">Команды пока не добавлены / No teams yet</p>
          )}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-navy/50">
        Баллы сохраняются в этом браузере автоматически. Нажмите на название команды, чтобы переименовать.
      </p>
    </div>
  );
}
