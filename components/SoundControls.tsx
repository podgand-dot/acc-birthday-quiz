'use client';

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { Settings } from '@/lib/types';
import { audio } from '@/lib/audio';
import {
  MusicIcon, MusicOffIcon, VolumeIcon, VolumeOffIcon, SettingsIcon,
  FullscreenIcon, ExitFullscreenIcon, UploadIcon,
} from './Icons';

interface Props {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  /** Куда раскрывать панель настроек */
  placement?: 'top' | 'bottom';
  /** light — кнопки на тёмном фоне, dark — на светлом */
  tone?: 'light' | 'dark';
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  /** На узких экранах оставить только шестерёнку (остальное доступно в панели) */
  compact?: boolean;
}

export function SoundControls({
  settings, setSettings, placement = 'bottom', tone = 'dark', isFullscreen, onToggleFullscreen, compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const [trackName, setTrackName] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTrackName(audio.customTrackName);
    return audio.subscribe(() => setTrackName(audio.customTrackName));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const update = (patch: Partial<Settings>) => setSettings(s => ({ ...s, ...patch }));

  const toggleMusic = () => {
    audio.unlock();
    update({ music: !settings.music });
  };
  const toggleSfx = () => {
    audio.unlock();
    update({ sfx: !settings.sfx });
    if (!settings.sfx) setTimeout(() => audio.click(), 50);
  };

  const btn =
    tone === 'light'
      ? 'text-sand hover:bg-sand/15 data-[active=true]:bg-sand data-[active=true]:text-navy'
      : 'text-navy hover:bg-navy/10 data-[active=true]:bg-navy data-[active=true]:text-sand';
  const btnBase = `flex h-10 w-10 items-center justify-center rounded-full transition-colors ${btn}`;
  const hideable = compact ? `${btnBase} hidden md:flex` : btnBase;

  return (
    <div ref={wrapRef} className="relative flex items-center gap-1">
      <button
        type="button"
        onClick={toggleMusic}
        data-active={settings.music}
        className={hideable}
        title={settings.music ? 'Выключить музыку (M)' : 'Включить музыку (M)'}
        aria-label="Фоновая музыка"
        aria-pressed={settings.music}
      >
        {settings.music ? <MusicIcon className="h-5 w-5" /> : <MusicOffIcon className="h-5 w-5" />}
      </button>
      <button
        type="button"
        onClick={toggleSfx}
        data-active={settings.sfx}
        className={hideable}
        title={settings.sfx ? 'Выключить звуковые эффекты' : 'Включить звуковые эффекты'}
        aria-label="Звуковые эффекты"
        aria-pressed={settings.sfx}
      >
        {settings.sfx ? <VolumeIcon className="h-5 w-5" /> : <VolumeOffIcon className="h-5 w-5" />}
      </button>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        data-active={open}
        className={btnBase}
        title="Настройки"
        aria-label="Настройки"
        aria-expanded={open}
      >
        <SettingsIcon className="h-5 w-5" />
      </button>
      {onToggleFullscreen && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          className={hideable}
          title={isFullscreen ? 'Выйти из полного экрана (F)' : 'На весь экран (F)'}
          aria-label="Полный экран"
        >
          {isFullscreen ? <ExitFullscreenIcon className="h-5 w-5" /> : <FullscreenIcon className="h-5 w-5" />}
        </button>
      )}

      {open && (
        <div
          className={`absolute right-0 z-50 w-[22rem] max-w-[calc(100vw-1.5rem)] rounded-3xl border border-navy/10 bg-cream p-5 text-navy shadow-card animate-pop ${
            placement === 'top' ? 'bottom-12' : 'top-12'
          }`}
          role="dialog"
          aria-label="Настройки звука и таймера"
        >
          <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Звук</h4>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={toggleMusic}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-colors ${
                settings.music ? 'border-navy bg-navy text-sand' : 'border-navy/20 text-navy hover:bg-navy/10'
              }`}
            >
              {settings.music ? <MusicIcon className="h-4 w-4" /> : <MusicOffIcon className="h-4 w-4" />}
              Музыка {settings.music ? 'вкл' : 'выкл'}
            </button>
            <button
              type="button"
              onClick={toggleSfx}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-bold transition-colors ${
                settings.sfx ? 'border-navy bg-navy text-sand' : 'border-navy/20 text-navy hover:bg-navy/10'
              }`}
            >
              {settings.sfx ? <VolumeIcon className="h-4 w-4" /> : <VolumeOffIcon className="h-4 w-4" />}
              Эффекты {settings.sfx ? 'вкл' : 'выкл'}
            </button>
          </div>

          <label className="mb-3 block">
            <span className="mb-1 flex justify-between text-xs font-bold uppercase tracking-wider text-navy/70">
              <span>Музыка</span>
              <span>{Math.round(settings.musicVolume * 100)}%</span>
            </span>
            <input
              type="range" min={0} max={1} step={0.05}
              value={settings.musicVolume}
              onChange={e => update({ musicVolume: parseFloat(e.target.value) })}
              className="w-full"
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1 flex justify-between text-xs font-bold uppercase tracking-wider text-navy/70">
              <span>Эффекты</span>
              <span>{Math.round(settings.sfxVolume * 100)}%</span>
            </span>
            <input
              type="range" min={0} max={1} step={0.05}
              value={settings.sfxVolume}
              onChange={e => update({ sfxVolume: parseFloat(e.target.value) })}
              onMouseUp={() => audio.tick(true)}
              className="w-full"
            />
          </label>

          <div className="mb-4 rounded-2xl bg-white/70 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-navy/70">Трек</p>
            <p className="mb-2 truncate text-sm" title={trackName ?? undefined}>
              {trackName ? `🎵 ${trackName}` : '🎹 Встроенная музыка (генерируется)'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-xs font-bold text-sand hover:bg-navy-deep"
              >
                <UploadIcon className="h-4 w-4" /> Свой файл
              </button>
              {trackName && (
                <button
                  type="button"
                  onClick={() => audio.setCustomFile(null)}
                  className="rounded-full border border-navy/30 px-3 py-1.5 text-xs font-bold hover:bg-navy/10"
                >
                  Вернуть встроенную
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) {
                    audio.unlock();
                    audio.setCustomFile(f);
                    update({ music: true });
                  }
                  e.target.value = '';
                }}
              />
            </div>
            <p className="mt-2 text-[11px] leading-snug text-navy/60">
              Файл не сохраняется после перезагрузки. Чтобы трек подхватывался всегда, положите{' '}
              <code className="rounded bg-navy/10 px-1">background.mp3</code> в папку{' '}
              <code className="rounded bg-navy/10 px-1">public/music</code>.
            </p>
          </div>

          <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wider">Таймер</h4>
          <label className="mb-2 flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.autoStartTimer}
              onChange={e => update({ autoStartTimer: e.target.checked })}
              className="h-4 w-4 accent-rust"
            />
            Запускать таймер сразу при показе вопроса
          </label>
          <label className="mb-2 flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.autoAdvance}
              onChange={e => update({ autoAdvance: e.target.checked })}
              className="h-4 w-4 accent-rust"
            />
            Переходить дальше, когда время вышло
          </label>
          <label className={`flex items-center gap-3 text-sm ${settings.autoAdvance ? '' : 'opacity-40'}`}>
            <span className="whitespace-nowrap">Пауза перед переходом</span>
            <select
              disabled={!settings.autoAdvance}
              value={settings.autoAdvanceDelay}
              onChange={e => update({ autoAdvanceDelay: parseInt(e.target.value, 10) })}
              className="rounded-lg border border-navy/20 bg-white px-2 py-1 text-sm"
            >
              {[2, 3, 4, 5, 7, 10].map(n => (
                <option key={n} value={n}>{n} сек</option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
