module.exports = {
  mode: 'jit',
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'alu-primary-purple': '#6a21bc',
        'alu-primary-purple-darkened': '#5e1da6',
        'alu-light-purple': '#8166ee',
        'alu-dark-purple': '#290254',
        'alu-streak-unlit': '#e5e5e5',
        'alu-streak-lit': '#fd9626',
        'alu-mid-gray': '#E2E2E2',
        'alu-light-gray': '#FAFAFA',
        'alu-light-gray-darker': '#F0F0F0',
      },
      rotate: {
        '360': '360deg',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
