import assert from "node:assert/strict";
import test from "node:test";
import { Utf8TextExtractor } from "./utf8-text-extractor.js";

async function* chunks(...values: Uint8Array[]) { yield* values; }

test("extracts chunked UTF-8 with BOM and deterministic line endings", async () => {
  const extractor = new Utf8TextExtractor();
  assert.equal(extractor.supports("resume.MD"), true);
  assert.equal(extractor.supports("resume.pdf"), false);
  const bytes = Buffer.from("\uFEFFone\r\ntwø\rthree", "utf8");
  const result = await extractor.extract(chunks(bytes.subarray(0, 10), bytes.subarray(10)));
  assert.deepEqual(result, { text: "one\ntwø\nthree", lineCount: 3 });
});

test("rejects invalid UTF-8", async () => {
  await assert.rejects(() => new Utf8TextExtractor().extract(chunks(Uint8Array.from([0xc3, 0x28]))),
    (error: Error) => error.name === "TextExtractionError");
});
