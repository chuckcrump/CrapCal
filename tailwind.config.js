/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      keyframes: {
        typewriter: {
          from: {width: '0'},
          to: {width: '100%'}
        },
        animation: {
          typewriter: 'typewriter.svelte 4s steps(30, end) forwards step-end infinite',
        }
      }
    },
  },
  plugins: [],
}

