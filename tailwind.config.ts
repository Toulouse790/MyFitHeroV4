import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        primary: {
          DEFAULT: "#2563eb",
          foreground: "#ffffff",
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

        // Couleurs Fitness définies
        fitness: {
          energy: "#dc2626",
          power: "#ea580c",
          growth: "#16a34a",
          wellness: "#059669",
          hydration: "#0891b2",
          recovery: "#7c3aed",
          motivation: "#f59e0b",
          achievement: "#d97706",
        }
      },
      
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "heartbeat": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.33)" },
          "80%, 100%": { transform: "scale(1)", opacity: "0" },
        },
        "bounce-soft": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      
      animation: {
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
      },
      
      backgroundImage: {
        "gradient-energy": "linear-gradient(135deg, #dc2626 0%, #ea580c 100%)",
        "gradient-growth": "linear-gradient(135deg, #16a34a 0%, #059669 100%)",
        "gradient-hydration": "linear-gradient(135deg, #0891b2 0%, #7c3aed 100%)",
        "gradient-motivation": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
