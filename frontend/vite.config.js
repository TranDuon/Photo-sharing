import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/user":            { target: "http://localhost:5000", changeOrigin: true },
      "/photosOfUser":    { target: "http://localhost:5000", changeOrigin: true },
      "/photos":          { target: "http://localhost:5000", changeOrigin: true },
      "/commentsOfPhoto": { target: "http://localhost:5000", changeOrigin: true },
      "/admin":           { target: "http://localhost:5000", changeOrigin: true },
      "/images":          { target: "http://localhost:5000", changeOrigin: true },
      "/test":            { target: "http://localhost:5000", changeOrigin: true },
    },
  },
});
