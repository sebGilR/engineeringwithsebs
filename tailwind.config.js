// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],

  content: [
    './app/**/*.{js,ts,jsx,tsx,md,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,md,mdx}',
    './components/**/*.{js,ts,jsx,tsx,md,mdx}',
    './content/**/*.{md,mdx}',
  ],

  theme: {
    extend: {
      // --- Design tokens (colors) ---
      colors: {
        surface: {
          0: '#F8F7F4', // paper
          1: '#FFFFFF', // cards
          2: '#F1F0EC', // subtle panels
        },
        text: {
          1: '#121212',
          2: '#3A3A3A',
          3: '#6B6B6B',
        },
        border: {
          1: '#E6E2DA',
        },
        accent: {
          1: '#1F3A5F', // deep blue
          2: '#E9EEF6', // soft tint for callouts
        },

        // Optional dark palette (kept minimal)
        dark: {
          surface0: '#0E0F10',
          surface1: '#141618',
          surface2: '#1A1D20',
          text1: '#F2F2F2',
          text2: '#C9C9C9',
          text3: '#A2A2A2',
          border1: '#2A2F34',
          accent1: '#8BB4FF',
          accent2: '#172338',
        },
      },

      // --- Design tokens (typography) ---
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: [
          '"Inter"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'sans-serif',
        ],
        mono: [
          '"IBM Plex Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },

      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.4' }], // 13px
        sm: ['0.875rem', { lineHeight: '1.5' }], // 14px
        base: ['1rem', { lineHeight: '1.75' }], // 16px
        lg: ['1.125rem', { lineHeight: '1.75' }], // 18px
        xl: ['1.25rem', { lineHeight: '1.6' }], // 20px
        '2xl': ['1.5rem', { lineHeight: '1.3' }], // 24px
        '3xl': ['1.875rem', { lineHeight: '1.2' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '1.15' }], // 36px
        '5xl': ['3rem', { lineHeight: '1.1' }], // 48px
      },

      // --- Design tokens (spacing/radius/shadows/layout) ---
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        5: '20px',
        6: '24px',
        8: '32px',
        10: '40px',
        12: '48px',
        16: '64px',
        20: '80px',
      },

      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },

      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
      },

      maxWidth: {
        content: '72ch',
        wide: '1100px',
      },

      // --- Typography plugin overrides (the “subtle power” prose) ---
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text.1'),
            fontFamily: theme('fontFamily.sans').join(', '),
            fontSize: theme('fontSize.base')[0],
            lineHeight: theme('fontSize.base')[1].lineHeight,

            // Headings
            h1: {
              fontFamily: theme('fontFamily.display').join(', '),
              fontWeight: '600',
              letterSpacing: '-0.01em',
              color: theme('colors.text.1'),
              marginBottom: theme('spacing.6'),
            },
            h2: {
              fontFamily: theme('fontFamily.display').join(', '),
              fontWeight: '600',
              letterSpacing: '-0.01em',
              color: theme('colors.text.1'),
              marginTop: theme('spacing.12'),
              marginBottom: theme('spacing.4'),
            },
            h3: {
              fontWeight: '600',
              color: theme('colors.text.1'),
              marginTop: theme('spacing.10'),
              marginBottom: theme('spacing.3'),
            },
            h4: {
              fontWeight: '600',
              color: theme('colors.text.1'),
              marginTop: theme('spacing.8'),
              marginBottom: theme('spacing.2'),
            },

            // Paragraph rhythm
            p: {
              marginTop: theme('spacing.4'),
              marginBottom: theme('spacing.4'),
            },

            // Links (understated)
            a: {
              color: theme('colors.accent.1'),
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              textDecorationColor: theme('colors.border.1'),
              fontWeight: '500',
              '&:hover': {
                textDecorationColor: theme('colors.accent.1'),
              },
            },

            // Lists
            ul: { paddingLeft: theme('spacing.6') },
            ol: { paddingLeft: theme('spacing.6') },
            li: {
              marginTop: theme('spacing.2'),
              marginBottom: theme('spacing.2'),
            },

            // Blockquotes (reflective, not shouty)
            blockquote: {
              fontStyle: 'normal',
              borderLeftWidth: '3px',
              borderLeftColor: theme('colors.border.1'),
              paddingLeft: theme('spacing.4'),
              color: theme('colors.text.2'),
            },

            // Inline code (no pill)
            code: {
              fontFamily: theme('fontFamily.mono').join(', '),
              fontSize: '0.9em',
              fontWeight: '500',
              color: theme('colors.text.1'),
              backgroundColor: 'transparent',
              padding: '0',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },

            // Code blocks (note-like)
            pre: {
              fontFamily: theme('fontFamily.mono').join(', '),
              backgroundColor: theme('colors.surface.2'),
              color: theme('colors.text.1'),
              borderRadius: theme('borderRadius.md'),
              padding: theme('spacing.6'),
              fontSize: theme('fontSize.sm')[0],
              lineHeight: '1.6',
              boxShadow: theme('boxShadow.card'),
            },

            // HR
            hr: {
              borderColor: theme('colors.border.1'),
              marginTop: theme('spacing.12'),
              marginBottom: theme('spacing.12'),
            },

            // Tables (quiet)
            table: { fontSize: theme('fontSize.sm')[0] },
            thead: { borderBottomColor: theme('colors.border.1') },
            'tbody tr': { borderBottomColor: theme('colors.border.1') },
            th: {
              fontWeight: '600',
              color: theme('colors.text.1'),
            },
            td: { color: theme('colors.text.2') },
          },
        },

        // Optional: use <article className="prose prose-engineer"> for denser mode
        engineer: {
          css: {
            fontSize: theme('fontSize.sm')[0],
            lineHeight: '1.65',
            pre: {
              backgroundColor: theme('colors.surface.1'),
            },
          },
        },

        // Optional dark mode prose: <article className="dark prose prose-dark">
        dark: {
          css: {
            color: theme('colors.dark.text1'),
            a: {
              color: theme('colors.dark.accent1'),
              textDecorationColor: theme('colors.dark.border1'),
              '&:hover': { textDecorationColor: theme('colors.dark.accent1') },
            },
            h1: { color: theme('colors.dark.text1') },
            h2: { color: theme('colors.dark.text1') },
            h3: { color: theme('colors.dark.text1') },
            h4: { color: theme('colors.dark.text1') },
            blockquote: {
              borderLeftColor: theme('colors.dark.border1'),
              color: theme('colors.dark.text2'),
            },
            pre: {
              backgroundColor: theme('colors.dark.surface2'),
              color: theme('colors.dark.text1'),
              boxShadow: 'none',
              border: `1px solid ${theme('colors.dark.border1')}`,
            },
            hr: { borderColor: theme('colors.dark.border1') },
            thead: { borderBottomColor: theme('colors.dark.border1') },
            'tbody tr': { borderBottomColor: theme('colors.dark.border1') },
            th: { color: theme('colors.dark.text1') },
            td: { color: theme('colors.dark.text2') },
            code: { color: theme('colors.dark.text1') },
          },
        },
      }),
    },
  },

  plugins: [require('@tailwindcss/typography')],
}
