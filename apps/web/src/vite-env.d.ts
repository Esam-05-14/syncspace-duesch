/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SYNC_WS?: string;
  readonly VITE_SYNC_HTTP?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
