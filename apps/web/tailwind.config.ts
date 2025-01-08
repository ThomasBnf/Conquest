import baseConfig from "@conquest/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./sections/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}",
  ],
  presets: [baseConfig],
} satisfies Config;
