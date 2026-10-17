/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#05070c',
        surface: '#0a0e16',
        panel: '#0e131c',
        line: '#1b2330',
        ink: {
          DEFAULT: '#e7edf5',
          muted: '#7d8aa3',
          faint: '#4a5568',
        },
        cyan: {
          DEFAULT: '#22d3ee',
          soft: '#67e8f9',
        },
        blue: {
          DEFAULT: '#3b82f6',
          deep: '#1d4ed8',
        },
      },
      fontFamily: {
        display: ['"Geist"', '"Inter"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to bottom, rgba(34,211,238,0.08), transparent 70%)',
        'aurora':
          'radial-gradient(60% 60% at 20% 20%, rgba(59,130,246,0.25), transparent 60%), radial-gradient(50% 50% at 80% 30%, rgba(34,211,238,0.18), transparent 60%)',
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(34,211,238,0.35)',
        'glow-lg': '0 0 80px -12px rgba(59,130,246,0.4)',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'spin-slow-reverse': {
          to: { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        scan: 'scan 4s linear infinite',
        'spin-slow': 'spin-slow 18s linear infinite',
        'spin-slow-reverse': 'spin-slow-reverse 24s linear infinite',
      },
    },
  },
  plugins: [],
};
