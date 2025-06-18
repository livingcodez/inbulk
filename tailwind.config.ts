import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B47', // Coral color from design
          light: '#FFE5E0',
        },
        secondary: {
          DEFAULT: '#7DDFBD', // Mint green
          light: '#E7F9F3',
        },
        accent: {
          purple: '#F2E6FF',
          blue: '#E6F4FF',
          green: '#E7F9F3',
          orange: '#FFE5E0',
        },
        neutral: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#868E96',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 2px 20px rgba(0, 0, 0, 0.06)',
        'bottom-bar': '0 -4px 20px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
}

export default config
