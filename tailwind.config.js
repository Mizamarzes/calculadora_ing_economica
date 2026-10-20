/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      sm: '561px',
      md: '801px',
      lg: '1024px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      colors: {
        page: '#f7f8fa',
        ink: {
          DEFAULT: '#152039',
          heading: '#121c35',
          label: '#30405c',
          field: '#27364f',
          suffix: '#40506c',
          muted: '#627594',
        },
        line: {
          DEFAULT: '#e9edf2',
          panel: '#e0e6ed',
          field: '#d4dbe4',
          soft: '#e4e9ef',
          rule: '#e1e7ed',
          result: '#9299a5',
        },
        brand: {
          DEFAULT: '#d03457',
          dark: '#b9284a',
          heading: '#cc3558',
          ring: '#ca3658',
          selected: '#d92f55',
          text: '#d52e55',
          result: '#d72d53',
          tint: '#fff4f6',
        },
        tone: {
          mint: '#eafff7',
          rose: '#fff0f3',
          cyan: '#edfdff',
          amber: '#fff9e9',
          indigo: '#eef1ff',
          lilac: '#fcf3ff',
        },
        icon: {
          green: '#08a36b',
          red: '#dc3457',
          blue: '#0098be',
          orange: '#e58a00',
          indigo: '#4c52f2',
          purple: '#8e31e8',
        },
      },
      boxShadow: {
        card: '0 2px 3px rgba(18, 31, 55, .04)',
        'card-hover': '0 9px 18px rgba(20, 30, 52, .09)',
        selected: '0 3px 5px rgba(203, 54, 89, .12)',
        panel: '0 2px 3px rgba(18, 31, 55, .06)',
        button: '0 4px 7px rgba(208, 52, 87, .18)',
      },
    },
  },
  plugins: [],
};
