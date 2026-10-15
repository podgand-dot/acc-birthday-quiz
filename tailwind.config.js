/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Палитра из айдентики «День рождения АЦХ»
      colors: {
        navy: { DEFAULT: '#0F3592', deep: '#0A2468', light: '#2A51B8', soft: '#E3E8F6' },
        rust: { DEFAULT: '#AD4716', deep: '#8A3710', light: '#C9652F', soft: '#F4E3D8' },
        sand: { DEFAULT: '#D5CCC5', light: '#E6E0DB', dark: '#BFB3AA' },
        cream: '#F4F0EC',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 20px 50px -20px rgba(15, 53, 146, 0.35)',
        glow: '0 0 60px rgba(213, 204, 197, 0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '70%': { opacity: '1', transform: 'scale(1.04)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        twinkle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.06) rotate(3deg)', opacity: '0.85' },
        },
        'slow-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(173, 71, 22, 0.45)' },
          '100%': { boxShadow: '0 0 0 22px rgba(173, 71, 22, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.55s cubic-bezier(0.2, 0.8, 0.2, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        pop: 'pop 0.5s cubic-bezier(0.2, 1.2, 0.3, 1) both',
        twinkle: 'twinkle 4s ease-in-out infinite',
        'slow-spin': 'slow-spin 60s linear infinite',
        shake: 'shake 0.5s ease-in-out',
        'pulse-ring': 'pulse-ring 1s ease-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
