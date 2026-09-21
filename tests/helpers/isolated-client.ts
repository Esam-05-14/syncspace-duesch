import { createServer } from "node:net";
import { HocuspocusProvider, HocuspocusProviderWebsocket } from "@hocuspocus/provider";
import * as Y from "yjs";
import { WebSocket } from "ws";

export async function unusedLoopbackPort(): Promise<number> {
  return await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (!address || typeof address === "string") {
        probe.close();
        reject(new Error("Could not bind a loopback port."));
        return;
      }
      const { port } = address;
      probe.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

export function connectIsolatedClient(input: {
  url: string;
  roomId: string;
  token: string;
  document?: Y.Doc;
  connect?: boolean;
}): { document: Y.Doc; provider: HocuspocusProvider; socket: HocuspocusProviderWebsocket } {
  const document = input.document ?? new Y.Doc();
  const connect = input.connect ?? true;
  const socket = new HocuspocusProviderWebsocket({
    url: input.url,
    WebSocketPolyfill: WebSocket,
    maxAttempts: 2,
    timeout: 4000,
    connect,
  });
  const provider = new HocuspocusProvider({
    websocketProvider: socket,
    name: input.roomId,
    document,
    token: input.token,
    broadcast: false,
    preserveConnection: false,
    quiet: true,
    connect,
  });
  return { document, provider, socket };
}

export async function destroyClient(client: {
  document: Y.Doc;
  provider: HocuspocusProvider;
  socket: HocuspocusProviderWebsocket;
}): Promise<void> {
  client.provider.destroy();
  client.socket.destroy();
  client.document.destroy();
}
