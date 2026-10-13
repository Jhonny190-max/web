/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,html}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4fb",
          100: "#dde7f5",
          200: "#c0d2ec",
          300: "#94b3de",
          400: "#628dcb",
          500: "#3f6db5",
          600: "#2f5598",
          700: "#28467b",
          800: "#263d66",
          900: "#1b2a45",
          950: "#111b2e"
        },
        accent: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto",
          "Helvetica Neue", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(17, 27, 46, 0.25)",
        glow: "0 0 0 1px rgba(99, 102, 241, 0.25), 0 12px 40px -12px rgba(79, 70, 229, 0.45)"
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        }
      },
      animation: {
        "fade-in-up": "fade-in-up 0.5s ease-out both",
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: [require("flowbite/plugin")]
};
