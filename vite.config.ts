import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  base: "/Royal/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },
  build: {
    target: "es2022",
    sourcemap: false
  }
});
