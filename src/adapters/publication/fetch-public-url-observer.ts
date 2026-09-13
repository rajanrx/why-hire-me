import type { PublicUrlObserver } from "./firebase-hosting-publisher.js";

export class FetchPublicUrlObserver implements PublicUrlObserver {
  public async observe(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: "GET", redirect: "error", signal: AbortSignal.timeout(10_000) });
      return response.ok;
    } catch { return false; }
  }
}
