import { viteSyncEndpoints } from "./sync-endpoints.js";
import { invitationUrl, setToken } from "./tokens.js";

export type SampleInvitationResult =
  | { status: "ready"; roomId: string; token: string; url: string }
  | { status: "no-sync"; message: string }
  | { status: "helper-off"; message: string }
  | { status: "unavailable"; message: string };

export async function requestSampleInvitation(): Promise<SampleInvitationResult> {
  const { http } = viteSyncEndpoints();
  if (!http) {
    return {
      status: "no-sync",
      message:
        "This public website does not run the sync server. Open a local board, or run npm run dev on loopback.",
    };
  }
  try {
    const response = await fetch(`${http}/dev/sample-room`);
    if (response.status === 404) {
      return {
        status: "helper-off",
        message:
          "The development join helper is off on this host. Share a runtime invitation out of band. Do not put the token in the shared board.",
      };
    }
    if (!response.ok) {
      return {
        status: "unavailable",
        message: "Could not mint a sample invitation. Is the sync process running?",
      };
    }
    const body = (await response.json()) as { roomId?: string; token?: string };
    if (!body.roomId || !body.token) {
      return {
        status: "unavailable",
        message: "Could not mint a sample invitation. Is the sync process running?",
      };
    }
    setToken(body.roomId, body.token);
    return {
      status: "ready",
      roomId: body.roomId,
      token: body.token,
      url: invitationUrl(body.roomId, body.token),
    };
  } catch {
    return {
      status: "unavailable",
      message: "Could not mint a sample invitation. Is the sync process running?",
    };
  }
}
