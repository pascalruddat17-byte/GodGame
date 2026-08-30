import tailwindcss from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/GodGame/",
  build: {
    outDir: "pages-dist",
    emptyOutDir: true,
  },
  css: { postcss: { plugins: [tailwindcss()] } },
  plugins: [react()],
});
