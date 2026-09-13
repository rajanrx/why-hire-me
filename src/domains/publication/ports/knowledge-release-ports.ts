import type { KnowledgeReleaseBundle, KnowledgeReleaseManifest } from "../domain/knowledge-release.js";

export interface ReleaseDigester {
  sha256(content: string | Uint8Array): string;
}

export interface LocalReleaseRepository {
  create(bundle: KnowledgeReleaseBundle): Promise<{
    readonly directory: string;
    readonly manifest: KnowledgeReleaseManifest;
    readonly reused: boolean;
  }>;
}
