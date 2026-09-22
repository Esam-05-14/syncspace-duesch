import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppRouter } from "./app/router.js";
import { registerProductionServiceWorker } from "./lib/register-pwa.js";
import "./styles.css";

registerProductionServiceWorker();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Missing #root");
}

createRoot(root).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>,
);
