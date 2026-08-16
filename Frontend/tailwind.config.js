/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
  ripple: {
    from: { transform: 'scale(0)', opacity: '0.4' },
    to:   { transform: 'scale(1)', opacity: '0' },
  },
  marquee: {
    '0%': { transform: 'translateX(0)' },
    '100%': { transform: 'translateX(-50%)' },
  },
},
animation: {
  ripple: 'ripple 0.6s linear forwards',
  marquee: 'marquee 18s linear infinite',
},
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
};
