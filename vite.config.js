import atomico from "@atomico/plugin-vite";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext",
  },
  test: {
    environment: "happy-dom",
  },
  plugins: [atomico()],
});
