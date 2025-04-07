import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // Use a relative base path for compatibility
  plugins: [react()],
});
