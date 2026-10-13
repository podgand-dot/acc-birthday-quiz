import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Квиз, Плиз! — День Рождения АЦХ',
  description: 'Праздничный квиз ко Дню Рождения Церкви',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
