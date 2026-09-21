const memory = new Map<string, string>();

export function captureTokenFromLocation(boardId: string): string | undefined {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const fromHash = hash.get("token") ?? undefined;
  if (fromHash) {
    memory.set(boardId, fromHash);
    sessionStorage.setItem(`syncspace.token.${boardId}`, fromHash);
    const url = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, "", url);
    return fromHash;
  }
  return getToken(boardId);
}

export function getToken(boardId: string): string | undefined {
  return memory.get(boardId) ?? sessionStorage.getItem(`syncspace.token.${boardId}`) ?? undefined;
}

export function setToken(boardId: string, token: string): void {
  memory.set(boardId, token);
  sessionStorage.setItem(`syncspace.token.${boardId}`, token);
}

export function clearToken(boardId: string): void {
  memory.delete(boardId);
  sessionStorage.removeItem(`syncspace.token.${boardId}`);
}

export function invitationUrl(boardId: string, token: string): string {
  return `${window.location.origin}/board/${boardId}#token=${token}`;
}
