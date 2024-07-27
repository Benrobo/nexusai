/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "../shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        white: {
          100: "#fff",
          105: "#f6f8fb",
          200: "#ccc",
          300: "#ebebebb6",
          400: "#777",
          500: "rgba(0,0,0,.1)",
          600: "rgba(255,255,255,0.08)",
        },
        dark: {
          100: "#1c1c1e",
          102: "#22242a",
          103: "#111013",
          105: "#000",
          200: "#16181d",
          300: "#312c3b",
          400: "#3e3749",
          500: "rgba(0,0,0,.4)",
        },
        gray: {
          100: "#736c7e",
        },
        red: {
          100: "rgb(255, 0, 0, .4)",
          200: "#ff0000",
          300: "#cc0000",
          305: "#ff4741",
          400: "#990000",
          500: "#660000",
          600: "#330000",
          700: "#000000",
        },
        orange: {
          100: "#FF8A65",
          200: "rgba(255, 138, 101, 0.3)",
          300: "#f99d52",
          301: "rgba(51, 30, 20, 1)",
        },
        blue: {
          100: "#3770fe",
          101: "#6b77f1",
          200: "rgba(59, 130, 246, 0.3)",
          201: "#f4fbfe",
        },
        green: {
          100: "#22C55E",
          105: "#228637",
          200: "rgba(34, 197, 94, 0.3)",
        },
        pink: {
          100: "#E4295D",
          200: "rgba(228, 41, 93, 0.3)",
        },
        purple: {
          100: "#8f63f3",
          102: "#6210cc",
          103: "#6e21d2",
          105: "rgb(143, 99, 243,.3)",
        },
        teal: {
          100: "#21B6A2",
          200: "rgba(33, 182, 162, 0.3)",
        },
        brown: {
          100: "#303030",
          102: "#444444",
          103: "#1c1c1c",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
      fontFamily: {
        ppReg: ["Poppins", "sans-serif"],
        ppL: ["Poppins", "sans-serif"],
        ppM: ["Poppins", "sans-serif"],
        ppB: ["Poppins", "sans-serif"],
        ppSB: ["Poppins", "sans-serif"],
        ppEB: ["Poppins", "sans-serif"],
        jb: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    ({ addUtilities }) => {
      addUtilities({
        ".enableBounceEffect": {
          transition: "all 0.1s",
          "&:target": {
            transform: "scale(0.90)",
          },
          "&:active": {
            transform: "scale(0.85)",
          },
        },
        ".flex-center": {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
      });
    },
  ],
};
