module.exports = {
  darkMode: 'class', // enable class-based dark mode
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#ffffff',
        soft: '#f6f7f9',
        subtle: '#6b7280'
      },
      spacing: {
        'toolbar-collapsed': '60px'
      },
      borderRadius: {
        lg: '12px'
      }
    }
  },
  plugins: [],
}
