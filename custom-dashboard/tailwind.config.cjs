module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // keep palette aligned with existing styles
        slate: {
          900: '#0f172a',
          800: '#0b1220',
          700: '#0b1220'
        }
      }
    }
  },
  plugins: []
};