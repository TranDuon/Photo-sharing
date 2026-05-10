import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Tất cả request bắt đầu bằng /api, /user, /photos... → forward tới backend
      "/user": "http://localhost:5000",
      "/photosOfUser": "http://localhost:5000",
      "/photos": "http://localhost:5000",
      "/commentsOfPhoto": "http://localhost:5000",
      "/test": "http://localhost:5000",
      "/admin": "http://localhost:5000",
      "/images": "http://localhost:5000",
    },
  },
});
