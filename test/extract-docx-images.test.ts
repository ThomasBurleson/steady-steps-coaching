import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error — plain ESM helper, no type declarations
import { parseRels, embedOrder } from "../scripts/extract-docx-images.mjs";

const RELS = `<?xml version="1.0"?>
<Relationships>
  <Relationship Id="rId1" Type="http://x/officeDocument" Target="settings.xml"/>
  <Relationship Id="rId6" Type="http://x/image" Target="media/image1.png"/>
  <Relationship Id="rId7" Type="http://x/image" Target="media/image2.jpg"/>
  <Relationship Id="rId9" Type="http://x/hyperlink" Target="https://example.com" TargetMode="External"/>
</Relationships>`;

test("parseRels maps ids to targets and flags external", () => {
  const rels = parseRels(RELS);
  assert.equal(rels.get("rId6").target, "media/image1.png");
  assert.equal(rels.get("rId6").external, false);
  assert.equal(rels.get("rId9").external, true);
});

test("embedOrder returns embed ids in document order", () => {
  const doc = `<w:p><a:blip r:embed="rId7"/></w:p><w:p><a:blip r:embed="rId6"/></w:p>`;
  assert.deepEqual(embedOrder(doc), ["rId7", "rId6"]);
});

test("embedOrder captures both r:embed and r:link and preserves repeats", () => {
  const doc = `<a:blip r:embed="rId6"/><a:blip r:link="rId7"/><a:blip r:embed="rId6"/>`;
  assert.deepEqual(embedOrder(doc), ["rId6", "rId7", "rId6"]);
});
