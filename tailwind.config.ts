import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // 텍스트 & 배경 토큰
        "color-base": "var(--color-base)",
        "color-muted": "var(--color-muted)",
        "color-bg": "var(--color-bg)",
        "color-border": "var(--color-border)",
        "color-hover": "var(--color-hover)",
        "color-selected-bg": "var(--color-selected-bg)",
        "color-selected-text": "var(--color-selected-text)",

        // 기본 Glass
        "glass-bg": "var(--glass-bg)",
        "glass-border": "var(--glass-border)",
        "glass-bg-20": "var(--glass-bg-20)",
        "glass-bg-40": "var(--glass-bg-40)",
        "glass-bg-60": "var(--glass-bg-60)",
        "glass-bg-80": "var(--glass-bg-80)",

        // 색상별 Glass 배경 & 텍스트
        "glass-primary": "var(--glass-primary-bg)",
        "glass-success": "var(--glass-success-bg)",
        "glass-warning": "var(--glass-warning-bg)",
        "glass-danger": "var(--glass-danger-bg)",
        "glass-neutral": "var(--glass-neutral-bg)",

        "glass-text-primary": "var(--glass-primary-text)",
        "glass-text-success": "var(--glass-success-text)",
        "glass-text-warning": "var(--glass-warning-text)",
        "glass-text-danger": "var(--glass-danger-text)",
        "glass-text-neutral": "var(--glass-neutral-text)",

        "glass-selected-primary": "var(--glass-selected-primary-bg)",
        "glass-selected-success": "var(--glass-selected-success-bg)",
        "glass-selected-warning": "var(--glass-selected-warning-bg)",
        "glass-selected-danger": "var(--glass-selected-danger-bg)",
        "glass-selected-neutral": "var(--glass-selected-neutral-bg)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        glass: "var(--glass-shadow)",
      },
      backdropBlur: {
        glass: "12px",
      },
      transformStyle: {
        "preserve-3d": "preserve-3d",
      },
      backfaceVisibility: {
        hidden: "hidden",
      },
      perspective: {
        "1000": "1000px",
      },
      rotate: {
        "y-180": "rotateY(180deg)",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
