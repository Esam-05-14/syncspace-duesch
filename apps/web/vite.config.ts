import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "SyncSpace Deutsch",
        short_name: "SyncSpace",
        description: "Shared German lessons. Private progress. Observable synchronization.",
        display: "standalone",
        start_url: "/",
        background_color: "#f4efe4",
        theme_color: "#243127",
        icons: [{ src: "/favicon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  resolve: {
    alias: {
      "@syncspace/contracts": path.join(root, "../../packages/contracts/src/index.ts"),
      "@syncspace/learning": path.join(root, "../../packages/learning/src/index.ts"),
      "@syncspace/content": path.join(root, "../../packages/content/src/index.ts"),
      "@syncspace/collab": path.join(root, "../../packages/collab/src/index.ts"),
      "@syncspace/personal-store": path.join(root, "../../packages/personal-store/src/index.ts"),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5177,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 4177,
    strictPort: true,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
