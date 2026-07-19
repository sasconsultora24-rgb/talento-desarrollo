/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Rebrand "Bosque cálido": reemplaza la paleta genérica navy/teal/amber
        // por la del logo real de SAS Consultora. forest-700 y gold-500 son
        // exactamente los mismos hex que ya usaba el logo (#1F4D3D / #C9A227),
        // así que Logo.jsx y SasConsultoraLogo.jsx no necesitan tocarse.
        forest: {
          DEFAULT: "#1F4D3D",
          50: "#F0F5F1",
          100: "#DCE7DE",
          200: "#B7D0BC",
          300: "#8FB596",
          400: "#679873",
          500: "#497D57",
          600: "#2F5E40",
          700: "#1F4D3D",
          800: "#163829",
          900: "#0F251B",
        },
        gold: {
          DEFAULT: "#C9A227",
          50: "#FDF8EA",
          100: "#F8EBC4",
          200: "#F0D68A",
          300: "#E5BE55",
          400: "#D7A930",
          500: "#C9A227",
          600: "#A9821D",
          700: "#866516",
          800: "#634B10",
          900: "#40300A",
        },
        terracotta: {
          50: "#FBEEE6",
          100: "#F5D7C1",
          200: "#EAB48A",
          300: "#DD8E5C",
          400: "#CE7440",
          500: "#C1652F",
          600: "#9C4F24",
          700: "#7A3D1B",
          800: "#5C2E15",
          900: "#3E1F0F",
        },
        // Fondo cálido (crema/marfil) que reemplaza el blanco/gris frío de página.
        sand: {
          50: "#FBF7EE",
          100: "#F5EEDC",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 24px rgba(15, 37, 27, 0.10)",
        card: "0 2px 12px rgba(15, 37, 27, 0.07)",
      },
    },
  },
  plugins: [],
};
