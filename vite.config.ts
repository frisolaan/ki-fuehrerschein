import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative Pfade, damit die App auch in einem Unterordner liegen kann.
  base: "./",
  build: { outDir: "dist" },
});
