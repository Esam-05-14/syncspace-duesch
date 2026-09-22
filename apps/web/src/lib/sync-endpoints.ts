export type SyncEndpointEnv = {
  dev: boolean;
  ws?: string;
  http?: string;
};

export type SyncEndpoints = {
  ws: string | null;
  http: string | null;
};

export function resolveSyncEndpoints(env: SyncEndpointEnv): SyncEndpoints {
  const ws = env.ws?.trim() || (env.dev ? "ws://127.0.0.1:4357" : "");
  const http = env.http?.trim() || (env.dev ? "http://127.0.0.1:4357" : "");
  return {
    ws: ws.length > 0 ? ws : null,
    http: http.length > 0 ? http : null,
  };
}

export function viteSyncEndpoints(): SyncEndpoints {
  return resolveSyncEndpoints({
    dev: import.meta.env.DEV,
    ws: import.meta.env.VITE_SYNC_WS,
    http: import.meta.env.VITE_SYNC_HTTP,
  });
}
