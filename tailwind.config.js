/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#eef1f8",
          100: "#d7deee",
          200: "#aeb9dc",
          300: "#8093c7",
          400: "#526bab",
          500: "#354d8c",
          600: "#26386b",
          700: "#1b2a4f",
          800: "#131e3a",
          900: "#0c1428",
        },
        teal: {
          50: "#eafbf6",
          100: "#cdf5e8",
          200: "#9de9d3",
          300: "#63d6b8",
          400: "#34bd9c",
          500: "#1fa383",
          600: "#17826a",
          700: "#156756",
          800: "#135245",
          900: "#0f423a",
        },
        amber: {
          50: "#fff8ec",
          100: "#ffecc7",
          200: "#ffd68a",
          300: "#ffbc4d",
          400: "#ffa523",
          500: "#f78c0a",
          600: "#d96b05",
          700: "#b34e08",
          800: "#8f3d0d",
          900: "#75330f",
        },
        // Paleta de marca de SAS Consultora (logo real): usada en el badge/wordmark
        // del logo de Talento & Desarrollo. Separada de navy/teal/amber a propósito,
        // que siguen siendo los colores funcionales del resto de la UI.
        forest: {
          DEFAULT: "#1F4D3D",
          600: "#1F4D3D",
          700: "#173B2F",
        },
        gold: {
          DEFAULT: "#C9A227",
          500: "#C9A227",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(19, 30, 58, 0.08)",
        card: "0 2px 12px rgba(19, 30, 58, 0.06)",
      },
    },
  },
  plugins: [],
};
