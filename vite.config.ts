import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5175,
    proxy: {
      "/nad": {
        target: "http://localhost:8083",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nad/, ""),
      },
      "/api/student-grades": {
        target: "http://localhost:8084",
        changeOrigin: true,
      },
      "/api/quiz-attempts": {
        target: "http://localhost:8084",
        changeOrigin: true,
      },
      "/api/quizzes": {
        target: "http://localhost:8084",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:8082",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
