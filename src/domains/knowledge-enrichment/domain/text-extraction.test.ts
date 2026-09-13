import assert from "node:assert/strict";
import test from "node:test";
import { lineLocator } from "./text-extraction.js";

test("creates stable one-based line locators", () => {
  assert.equal(lineLocator("text:abc", 7), "text:abc#L7");
  assert.throws(() => lineLocator("text:abc", 0));
});
