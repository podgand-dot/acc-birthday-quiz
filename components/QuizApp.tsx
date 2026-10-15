'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Round, Settings, Team, View } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/types';
import { INITIAL_DATA } from '@/lib/quizData';
import { usePersistentState } from '@/lib/storage';
import { audio } from '@/lib/audio';
import { StarIcon } from './Icons';
import { SoundControls } from './SoundControls';
import MenuScreen from './MenuScreen';
import GameScreen from './GameScreen';
import LeaderboardScreen from './LeaderboardScreen';
import AdminScreen from './AdminScreen';
import DesignsScreen from './DesignsScreen';

const DEFAULT_TEAMS: Team[] = [
  { id: 1, name: 'Команда 1', score: 0 },
  { id: 2, name: 'Команда 2', score: 0 },
];

const NAV: { id: View; label: string }[] = [
  { id: 'MENU', label: 'Главная' },
  { id: 'GAME', label: 'Играть' },
  { id: 'LEADERBOARD', label: 'Таблица' },
  { id: 'ADMIN', label: 'Редактор' },
  { id: 'DESIGNS', label: 'Бланки' },
];

// --- ДЕКОРАТИВНЫЕ ЗВЁЗДЫ НА ФОНЕ ---
const BackgroundStars = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden print:hidden" aria-hidden="true">
    <StarIcon className="absolute -left-10 top-10 h-48 w-48 text-navy opacity-[0.07] animate-float" />
    <StarIcon className="absolute right-[8%] top-[12%] h-16 w-16 text-rust opacity-[0.12]" />
    <StarIcon className="absolute left-[18%] top-[60%] h-8 w-8 text-navy opacity-[0.12]" />
    <StarIcon className="absolute -bottom-16 -right-10 h-[26rem] w-[26rem] text-rust opacity-[0.07] animate-float" style={{ animationDelay: '2s' }} />
    <StarIcon className="absolute bottom-[28%] left-[6%] h-12 w-12 text-rust opacity-[0.1]" />
    <StarIcon className="absolute right-[30%] top-[55%] h-6 w-6 text-navy opacity-[0.1]" />
  </div>
);

// --- ГЛАВНЫЙ КОМПОНЕНТ ---
export default function QuizApp() {
  const [view, setView, viewLoaded] = usePersistentState<View>('acc-quiz:view', 'MENU');
  const [quizData, setQuizData] = usePersistentState<Round[]>('acc-quiz:data:v2', INITIAL_DATA);
  const [teams, setTeams] = usePersistentState<Team[]>('acc-quiz:teams', DEFAULT_TEAMS);
  const [settings, setSettings] = usePersistentState<Settings>('acc-quiz:settings', DEFAULT_SETTINGS);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Отслеживаем полноэкранный режим
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
    } else {
      document.documentElement.requestFullscreen?.().catch(() => undefined);
    }
  }, []);

  // Звук разрешён браузером только после жеста пользователя
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    void audio.tryLoadDefaultTrack();
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  useEffect(() => {
    audio.configure({
      music: settings.music,
      sfx: settings.sfx,
      musicVolume: settings.musicVolume,
      sfxVolume: settings.sfxVolume,
    });
  }, [settings.music, settings.sfx, settings.musicVolume, settings.sfxVolume]);

  // Музыка играет только на экране игры
  useEffect(() => {
    audio.setActive(view === 'GAME');
  }, [view]);

  const go = useCallback((v: View) => {
    audio.click();
    setView(v);
  }, [setView]);

  const hideNav = isFullscreen && view === 'GAME';

  return (
    <div
      className="relative min-h-screen selection:bg-rust selection:text-white"
      style={{ background: 'linear-gradient(160deg, #E6E0DB 0%, #D5CCC5 45%, #E9DCD2 100%)' }}
    >
      <BackgroundStars />

      {!hideNav && (
        <nav className="sticky top-0 z-40 border-b border-navy/10 bg-sand/70 backdrop-blur-md print:hidden">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2 md:flex-nowrap md:px-6">
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 rounded-full py-1 pr-3 transition-opacity hover:opacity-80"
              onClick={() => go('MENU')}
              aria-label="На главную"
            >
              <StarIcon className="h-9 w-9 text-rust" />
              <span className="hidden font-display text-base font-bold uppercase tracking-wide text-navy sm:inline">
                Квиз АЦХ
              </span>
            </button>

            <div className="order-last flex w-full min-w-0 justify-start gap-0 overflow-x-auto py-1 md:order-none md:w-auto md:flex-1 md:justify-center md:gap-2">
              {NAV.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={`whitespace-nowrap rounded-full px-2 py-1.5 text-xs font-bold transition-all md:px-4 md:py-2 md:text-sm ${
                    view === item.id
                      ? 'bg-navy text-sand shadow-md'
                      : 'text-navy hover:bg-navy/10'
                  }`}
                  aria-current={view === item.id ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="shrink-0">
              <SoundControls
                settings={settings}
                setSettings={setSettings}
                placement="bottom"
                compact
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
              />
            </div>
          </div>
        </nav>
      )}

      <main className="relative z-10">
        {!viewLoaded ? null : view === 'GAME' ? (
          <GameScreen
            quizData={quizData}
            settings={settings}
            setSettings={setSettings}
            setView={go}
            isFullscreen={isFullscreen}
            toggleFullscreen={toggleFullscreen}
          />
        ) : (
          <div className="mx-auto max-w-6xl p-4 md:p-8">
            {view === 'MENU' && <MenuScreen setView={go} />}
            {view === 'ADMIN' && <AdminScreen quizData={quizData} setQuizData={setQuizData} />}
            {view === 'LEADERBOARD' && <LeaderboardScreen teams={teams} setTeams={setTeams} />}
            {view === 'DESIGNS' && <DesignsScreen quizData={quizData} />}
          </div>
        )}
      </main>
    </div>
  );
}
