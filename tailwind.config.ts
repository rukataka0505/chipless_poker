import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'sans-serif'],
                display: ['var(--font-outfit)', 'sans-serif'],
            },
            colors: {
                // Semantic colors for the Midnight Luxe theme
                void: "var(--background-void)",
                deep: "var(--background-deep)",
                surface: "var(--background-surface)",
                gold: {
                    DEFAULT: "var(--accent-gold)",
                    dim: "var(--accent-gold-dim)",
                },
                electric: {
                    DEFAULT: "var(--accent-electric)",
                    dim: "var(--accent-electric-dim)",
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
