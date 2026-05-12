import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...defaultTheme.fontFamily.sans],
        mono: ["JetBrains Mono", "Fira Code", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        primary: {
          50:  "var(--color-primary-50)",
          100: "var(--color-primary-100)",
          200: "var(--color-primary-200)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
          900: "var(--color-primary-900)",
        },
        neutral: {
          50:  "var(--color-neutral-50)",
          100: "var(--color-neutral-100)",
          200: "var(--color-neutral-200)",
          300: "var(--color-neutral-300)",
          400: "var(--color-neutral-400)",
          500: "var(--color-neutral-500)",
          600: "var(--color-neutral-600)",
          700: "var(--color-neutral-700)",
          800: "var(--color-neutral-800)",
          900: "var(--color-neutral-900)",
        },
        success:  "var(--color-success)",
        warning:  "var(--color-warning)",
        danger:   "var(--color-danger)",
        info:     "var(--color-info)",
        proposal: "var(--color-proposal)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
      },
      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      transitionDuration: {
        fast:   "150ms",
        base:   "200ms",
        slow:   "300ms",
        spring: "500ms",
      },
      keyframes: {
        /* Page / component enter */
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)"              },
          "100%": { opacity: "1", transform: "translateY(0)"                },
        },
        /* Staggered list rows */
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        /* Row delete: slide-left + fade */
        "slide-out": {
          "0%":   { opacity: "1", transform: "translateX(0)"    },
          "100%": { opacity: "0", transform: "translateX(-24px)" },
        },
        /* Input error shake */
        shake: {
          "0%,100%": { transform: "translateX(0)"   },
          "20%":     { transform: "translateX(-5px)" },
          "40%":     { transform: "translateX(5px)"  },
          "60%":     { transform: "translateX(-3px)" },
          "80%":     { transform: "translateX(3px)"  },
        },
        /* Modal backdrop */
        "backdrop-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "backdrop-out": {
          "0%":   { opacity: "1" },
          "100%": { opacity: "0" },
        },
        /* Modal panel */
        "modal-in": {
          "0%":   { opacity: "0", transform: "scale(0.95) translateY(-8px)" },
          "100%": { opacity: "1", transform: "scale(1)   translateY(0)"     },
        },
        "modal-out": {
          "0%":   { opacity: "1", transform: "scale(1)   translateY(0)"     },
          "100%": { opacity: "0", transform: "scale(0.95) translateY(-8px)" },
        },
        /* Mobile sidebar drawer */
        "slide-in": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)"     },
        },
        /* Stage badge pulse */
        "badge-pulse": {
          "0%,100%": { transform: "scale(1)"    },
          "50%":     { transform: "scale(1.12)" },
        },
        /* Toast notifications */
        "toast-in": {
          "0%":   { opacity: "0", transform: "translateX(100%)" },
          "100%": { opacity: "1", transform: "translateX(0)"    },
        },
        "toast-out": {
          "0%":   { opacity: "1", transform: "translateX(0)"    },
          "100%": { opacity: "0", transform: "translateX(100%)" },
        },
        /* Back-to-top button */
        "pop-in": {
          "0%":   { opacity: "0", transform: "scale(0.7)" },
          "100%": { opacity: "1", transform: "scale(1)"   },
        },
        /* Mobile bottom sheet enter/exit */
        "slide-in-up": {
          "0%":   { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)"    },
        },
        "slide-out-down": {
          "0%":   { transform: "translateY(0)"    },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        "fade-up":      "fade-up 300ms cubic-bezier(0.4, 0, 0.2, 1) both",
        "fade-in":      "fade-in 300ms ease-out both",
        "slide-out":    "slide-out 250ms ease-in both",
        shake:          "shake 350ms ease-in-out",
        "backdrop-in":  "backdrop-in 200ms ease-out",
        "backdrop-out": "backdrop-out 150ms ease-in",
        "modal-in":     "modal-in 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "modal-out":    "modal-out 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in":     "slide-in 200ms cubic-bezier(0.4, 0, 0.2, 1)",
        "badge-pulse":  "badge-pulse 400ms ease-in-out",
        "toast-in":     "toast-in 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        "toast-out":    "toast-out 250ms ease-in",
        "pop-in":       "pop-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
  plugins: [],
};
