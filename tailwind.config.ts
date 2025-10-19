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
          DEFAULT: '#FF5F64',
          200: "#F3E7D6",
          600: "#FE474C"
        },
        secondary: {
          100: '#FAFAFA',
          200: '#F4F4F4',
          300: '#EDE0CE',
        },
  			muted: {
  				100: '#FAFAFA',
  				300: '#B2B2B2',
  				500: '#8E8E8E',
  				900: '#1B1B1B',
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
