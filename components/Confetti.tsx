'use client';

import { useEffect, useRef } from 'react';

const COLORS = ['#0F3592', '#AD4716', '#D5CCC5', '#FFFFFF', '#F2B544', '#2A51B8'];

/** Лёгкое конфетти на canvas в фирменных цветах. Само затихает через `duration` мс. */
export function Confetti({ duration = 7000, count = 170 }: { duration?: number; count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const pieces = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: -20 - Math.random() * h,
      size: 5 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: -0.8 + Math.random() * 1.6,
      vy: 2 + Math.random() * 3,
      rot: Math.random() * Math.PI,
      vr: -0.12 + Math.random() * 0.24,
      round: Math.random() > 0.6,
      phase: Math.random() * Math.PI * 2,
    }));

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx + Math.sin(now / 600 + p.phase) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > h + 20) {
          if (elapsed < duration) {
            p.y = -20;
            p.x = Math.random() * w;
          } else continue;
        }
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [duration, count]);

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
