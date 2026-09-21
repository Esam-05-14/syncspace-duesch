import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@syncspace/contracts": path.join(root, "packages/contracts/src/index.ts"),
      "@syncspace/learning": path.join(root, "packages/learning/src/index.ts"),
      "@syncspace/content": path.join(root, "packages/content/src/index.ts"),
      "@syncspace/collab": path.join(root, "packages/collab/src/index.ts"),
      "@syncspace/personal-store": path.join(root, "packages/personal-store/src/index.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**"],
    environment: "node",
    fileParallelism: false,
  },
});
