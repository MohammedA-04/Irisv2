module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
    './src/pages/*.{js,jsx,ts,tsx}',
    './src/pages/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      backdropBlur: {
        sm: '4px',
      },

      colors: {
        'clde-lgreen': '#90EE90',  // use dark txt
        'clde-fgreen': '#228B22',  // use white/light txt
        'clde-sgreen': '#9DC183',  // use dark txt
        'clde-egreen': '#50C878',  // use white/light txt
      }
    },
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 