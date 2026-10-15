import type { Metadata, Viewport } from 'next'
import { Unbounded, Comfortaa } from 'next/font/google'
import './globals.css'

// Заголовки — крупная геометричная гарнитура, текст — мягкая округлая (как в айдентике)
const display = Unbounded({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-display',
  display: 'swap',
})

const body = Comfortaa({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Квиз АЦХ — День Рождения Церкви',
  description: 'Праздничный квиз ко Дню Рождения Церкви: вопросы, таймер, ответы и таблица баллов.',
}

export const viewport: Viewport = {
  themeColor: '#0F3592',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  )
}
