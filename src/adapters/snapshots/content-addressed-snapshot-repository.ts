import { createHash, randomUUID } from "node:crypto";
import { link, mkdir, open, rm, stat, unlink } from "node:fs/promises";
import { join, posix } from "node:path";

import { snapshotIdFromDigest } from "../../domains/evidence-acquisition/domain/capture-record.js";
import type { SnapshotDescriptor } from "../../domains/evidence-acquisition/domain/capture-record.js";
import type { SnapshotRepository } from "../../domains/evidence-acquisition/ports/snapshot-repository.js";

export class ContentAddressedSnapshotRepository implements SnapshotRepository {
  public constructor(private readonly root: string) {}

  public async store(bytes: AsyncIterable<Uint8Array>) {
    const temporaryRoot = join(this.root, ".tmp");
    await mkdir(temporaryRoot, { recursive: true, mode: 0o700 });
    const temporaryPath = join(temporaryRoot, `${randomUUID()}.snapshot`);
    const handle = await open(temporaryPath, "wx", 0o600);
    const hash = createHash("sha256");
    let byteLength = 0;

    try {
      for await (const chunk of bytes) {
        hash.update(chunk);
        byteLength += chunk.byteLength;
        await handle.write(chunk);
      }
      await handle.sync();
    } catch (error: unknown) {
      await handle.close();
      await rm(temporaryPath, { force: true });
      throw error;
    }

    await handle.close();
    const digest = hash.digest("hex");
    const storageKey = posix.join("sha256", digest.slice(0, 2), digest);
    const targetDirectory = join(this.root, "sha256", digest.slice(0, 2));
    const targetPath = join(targetDirectory, digest);
    await mkdir(targetDirectory, { recursive: true, mode: 0o700 });

    try {
      await link(temporaryPath, targetPath);
      await unlink(temporaryPath);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        await rm(temporaryPath, { force: true });
        throw error;
      }

      const existing = await stat(targetPath);
      await rm(temporaryPath, { force: true });
      if (!existing.isFile() || existing.size !== byteLength) {
        throw new Error(`Snapshot integrity conflict for digest ${digest}.`);
      }
    }

    return Object.freeze({
      id: snapshotIdFromDigest(digest),
      algorithm: "sha256" as const,
      digest,
      byteLength,
      storageKey,
    });
  }

  public async contains(snapshot: SnapshotDescriptor): Promise<boolean> {
    try {
      const stored = await stat(join(this.root, snapshot.storageKey));
      return stored.isFile() && stored.size === snapshot.byteLength;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return false;
      }
      throw error;
    }
  }
}
