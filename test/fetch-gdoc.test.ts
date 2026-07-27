import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error — plain ESM helper, no type declarations
import { extractDocId, buildExportUrl } from "../scripts/fetch-gdoc.mjs";

const ID = "1AbcDEfghIJKlmnOPqrstUVwxyz01234567890_ab";

test("extracts id from a standard /edit share URL", () => {
  assert.equal(extractDocId(`https://docs.google.com/document/d/${ID}/edit?usp=sharing`), ID);
});

test("extracts id from a URL with a heading fragment", () => {
  assert.equal(extractDocId(`https://docs.google.com/document/d/${ID}/edit#heading=h.abc`), ID);
});

test("extracts id from an open?id= link", () => {
  assert.equal(extractDocId(`https://docs.google.com/open?id=${ID}`), ID);
});

test("accepts a bare document id", () => {
  assert.equal(extractDocId(ID), ID);
});

test("throws on a non-Google-Docs URL", () => {
  assert.throws(() => extractDocId("https://example.com/not-a-doc"), /document id/);
});

test("builds the docx export URL by default", () => {
  assert.equal(
    buildExportUrl(ID),
    `https://docs.google.com/document/d/${ID}/export?format=docx`,
  );
});

test("builds an alternate-format export URL", () => {
  assert.equal(
    buildExportUrl(ID, "md"),
    `https://docs.google.com/document/d/${ID}/export?format=md`,
  );
});
