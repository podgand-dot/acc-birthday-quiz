'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * useState, значение которого переживает перезагрузку страницы (localStorage).
 * Третий элемент — `loaded`: true после того, как сохранённое значение прочитано.
 * Для объектов сохранённое значение сливается с начальным (новые поля не теряются).
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        const parsed = JSON.parse(raw) as T;
        setState(prev => (isPlainObject(prev) && isPlainObject(parsed) ? { ...prev, ...parsed } : parsed));
      }
    } catch {
      /* повреждённые данные игнорируем */
    }
    setLoaded(true);
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* квота или приватный режим */
    }
  }, [key, state, loaded]);

  return [state, setState, loaded];
}
