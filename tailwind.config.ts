import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
        primary: {
          DEFAULT: '#FF6900',
          200: "#F3E7D6"
        },
        secondary: {
          100: '#FAF4E8',
          200: '#F3E7D6',
        },
  			muted: {
  				100: '#FAFAFA',
  				300: '#B2B2B2',
  				500: '#8E8E8E',
  				900: '#1B1B1B',
  			},
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
