import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/test-game-ia/", // <-- must match repo name
  plugins: [react()],
});
