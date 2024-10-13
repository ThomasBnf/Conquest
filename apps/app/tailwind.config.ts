import baseConfig from "@conquest/ui/tailwind.config";
import type { Config } from "tailwindcss";

export default {
  content: ["./**/*.{ts,tsx}", "../../packages/ui/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;
