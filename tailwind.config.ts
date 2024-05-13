import type { Config } from "tailwindcss";

type Color = {
  50?: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
};

import plugin from "tailwindcss/plugin";

const stackedLayer = plugin(({ addUtilities }) => {
  addUtilities({
    ".stackedLayer": {
      "grid-row": "1",
      "grid-column": "1",
    },
  });
});

const colorToObject = (name: string, color: Color) => {
  const obj: Record<string, string> = {};
  Object.entries(color).forEach(([key, value]) => {
    obj[`${name}-${key}`] = value;
  });
  return obj;
};

const FestivalYellow: Color = {
  // 50: "#fefce8",
  50: "#fffaeb",
  // 100: "#fef8c3",
  100: "#fdf1c9",
  200: "#fde96c",
  300: "#fcdc48",
  400: "#f9c716",
  500: "#e9ae09",
  600: "#c98705",
  700: "#a05f08",
  800: "#844b0f",
  900: "#713d12",
  950: "#421f06",
};

const FrolyRed: Color = {
  50: "#fdf3f3",
  100: "#fce4e5",
  200: "#fbcdcf",
  300: "#f7aaae",
  400: "#ef7278",
  500: "#e54e55",
  600: "#d13139",
  700: "#af262d",
  800: "#912328",
  900: "#792327",
  950: "#410e10",
};

const NeptuneBlue: Color = {
  "50": "#f2f9f8",
  "100": "#ddf0f0",
  "200": "#bfe1e2",
  "300": "#7dc1c3",
  "400": "#5fadb1",
  "500": "#449196",
  "600": "#3b787f",
  "700": "#356369",
  "800": "#325258",
  "900": "#2d464c",
  "950": "#1a2d32",
};

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    fontFamily: {
      inter: ["Inter", "sans-serif"],
    },

    extend: {
      colors: {
        ...colorToObject("festival-yellow", FestivalYellow),
        ...colorToObject("froly-red", FrolyRed),
        ...colorToObject("neptune-blue", NeptuneBlue),
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), stackedLayer],
} satisfies Config;

export default config;
