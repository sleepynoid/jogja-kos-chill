/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        // Warna utama — semua pakai CSS var agar tema light/dark otomatis
        background:         'var(--background)',
        foreground:         'var(--foreground)',
        card:               'var(--card)',
        'card-foreground':  'var(--card-foreground)',
        popover:            'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary:            'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary:          'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted:              'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent:             'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive:        'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)',
        border:             'var(--border)',
        input:              'var(--input)',
        ring:               'var(--ring)',
        // Brand aliases — dipakai di Header.tsx, KosCard.tsx, dll
        'brand-primary':    'var(--primary)',
        'brand-accent':     'var(--accent)',
        'brand-bg':         'var(--background)',
      },
      borderRadius: {
        // Radius tokens dari @theme inline — pakai CSS var --radius (0.75rem)
        sm:   'calc(var(--radius) - 4px)',
        md:   'calc(var(--radius) - 2px)',
        lg:   'var(--radius)',
        xl:   'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 12px)',
        '4xl': 'calc(var(--radius) + 16px)',
      },
      fontFamily: {
        // Font tokens dari @theme inline — dipakai di seluruh route & komponen
        sans:    ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
        accent:  ['"Space Grotesk"', 'sans-serif'],
        serif:   ['"Playfair Display"', 'ui-serif', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
};
