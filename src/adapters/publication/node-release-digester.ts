import { createHash } from "node:crypto";

import type { ReleaseDigester } from "../../domains/publication/ports/knowledge-release-ports.js";

export class NodeReleaseDigester implements ReleaseDigester {
  public sha256(content: string | Uint8Array): string {
    return createHash("sha256").update(content).digest("hex");
  }
}
