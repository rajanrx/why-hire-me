import { extname } from "node:path";
import { TextExtractionError, type TextExtractor } from "../../domains/knowledge-enrichment/ports/text-extraction-ports.js";

export class Utf8TextExtractor implements TextExtractor {
  readonly identity = Object.freeze({ id: "utf8-text", version: "1.0.0", configurationFingerprint: "bom-strip-lf-v1" });
  supports(locator: string): boolean { return [".txt", ".md", ".markdown"].includes(extname(locator).toLowerCase()); }
  async extract(bytes: AsyncIterable<Uint8Array>) {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let text = "";
    try {
      for await (const chunk of bytes) text += decoder.decode(chunk, { stream: true });
      text += decoder.decode();
    } catch { throw new TextExtractionError("INVALID_UTF8", "The captured evidence is not valid UTF-8."); }
    if (text.startsWith("\uFEFF")) text = text.slice(1);
    text = text.replace(/\r\n?/g, "\n");
    return Object.freeze({ text, lineCount: text.length === 0 ? 0 : text.split("\n").length });
  }
}
