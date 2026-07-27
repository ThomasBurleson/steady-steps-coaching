import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error — plain ESM helper, no type declarations
import { markdownToBlocks, serializeBlocks, stripWrappingEmphasis } from "../scripts/md-to-blocks.mjs";

test("extracts the first h1 as the title, not a block", () => {
  const { title, blocks } = markdownToBlocks("# My Article\n\nHello world.");
  assert.equal(title, "My Article");
  assert.equal(blocks.some((b: any) => b.type === "heading"), false);
});

test("h2/h3 become heading blocks", () => {
  const { blocks } = markdownToBlocks("## Section\n\n### Sub");
  assert.deepEqual(blocks, [
    { type: "heading", text: "Section" },
    { type: "heading", text: "Sub" },
  ]);
});

test("first paragraph is promoted to lead, later ones stay paragraph", () => {
  const { blocks } = markdownToBlocks("First para.\n\nSecond para.");
  assert.deepEqual(blocks, [
    { type: "lead", text: "First para." },
    { type: "paragraph", text: "Second para." },
  ]);
});

test("--no-lead keeps the first paragraph as a paragraph", () => {
  const { blocks } = markdownToBlocks("First para.", { lead: false });
  assert.deepEqual(blocks, [{ type: "paragraph", text: "First para." }]);
});

test("preserves inline markdown in text", () => {
  const { blocks } = markdownToBlocks("These are **approaches**, not [rules](/x).");
  assert.equal(blocks[0].text, "These are **approaches**, not [rules](/x).");
});

test("joins wrapped paragraph lines with a space", () => {
  const { blocks } = markdownToBlocks("line one\nline two\n\nnext");
  assert.equal(blocks[0].text, "line one line two");
});

test("parses images with alt and optional caption title", () => {
  const { blocks } = markdownToBlocks('![Bridge](https://x/y.jpg "A caption")');
  assert.deepEqual(blocks, [
    { type: "image", src: "https://x/y.jpg", alt: "Bridge", caption: "A caption" },
  ]);
});

test("image without a title has no caption key", () => {
  const { blocks } = markdownToBlocks("![Bridge](https://x/y.jpg)");
  assert.deepEqual(blocks, [{ type: "image", src: "https://x/y.jpg", alt: "Bridge" }]);
});

test("groups consecutive list items into one list block", () => {
  const { blocks } = markdownToBlocks("- one\n- two\n- three");
  assert.deepEqual(blocks, [{ type: "list", items: ["one", "two", "three"] }]);
});

test("supports ordered lists", () => {
  const { blocks } = markdownToBlocks("1. one\n2. two");
  assert.deepEqual(blocks, [{ type: "list", items: ["one", "two"] }]);
});

test("blockquote becomes a quote block", () => {
  const { blocks } = markdownToBlocks("> Sometimes the *why* matters most.");
  assert.deepEqual(blocks, [{ type: "quote", text: "Sometimes the *why* matters most." }]);
});

test("pulls a trailing attribution line out of a quote", () => {
  const { blocks } = markdownToBlocks("> Be kind.\n> — Chelsea");
  assert.deepEqual(blocks, [{ type: "quote", text: "Be kind.", attribution: "Chelsea" }]);
});

test("drops horizontal rules", () => {
  const { blocks } = markdownToBlocks("Para one\n\n---\n\nPara two");
  assert.deepEqual(blocks, [
    { type: "lead", text: "Para one" },
    { type: "paragraph", text: "Para two" },
  ]);
});

test("strips bold wrapping from headings (Google Docs styles headings bold)", () => {
  const { blocks } = markdownToBlocks("## **Flipping the Equation**");
  assert.deepEqual(blocks, [{ type: "heading", text: "Flipping the Equation" }]);
});

test("strips bold wrapping from the title", () => {
  const { title } = markdownToBlocks('# **The "Do Something" Secret**\n\nBody.');
  assert.equal(title, 'The "Do Something" Secret');
});

test("keeps partial/inner emphasis in headings", () => {
  const { blocks } = markdownToBlocks("## Part **one** of two");
  assert.equal(blocks[0].text, "Part **one** of two");
});

test("stripWrappingEmphasis handles nested markers and plain text", () => {
  assert.equal(stripWrappingEmphasis("**_Hi_**"), "Hi");
  assert.equal(stripWrappingEmphasis("plain"), "plain");
  assert.equal(stripWrappingEmphasis("*a* and *b*"), "*a* and *b*");
});

test("drops embedded data: URI images and counts them", () => {
  const { blocks, droppedImages } = markdownToBlocks(
    "![](data:image/png;base64,AAAA)\n\nReal text.",
  );
  assert.equal(droppedImages, 1);
  assert.equal(blocks.some((b: any) => b.type === "image"), false);
});

test("--keep-data-images retains data: URI images", () => {
  const { blocks, droppedImages } = markdownToBlocks("![](data:image/png;base64,AAAA)", {
    keepDataImages: true,
  });
  assert.equal(droppedImages, 0);
  assert.equal(blocks[0].type, "image");
});

test("substitutes extracted image paths into data: placeholders in order", () => {
  const md = "![](data:image/png;base64,A)\n\ntext\n\n![](data:image/png;base64,B)";
  const { blocks, droppedImages } = markdownToBlocks(md, {
    images: ["/images/blog/post-1.png", "/images/blog/post-2.png"],
  });
  assert.equal(droppedImages, 0);
  const imgs = blocks.filter((b: any) => b.type === "image");
  assert.deepEqual(imgs, [
    { type: "image", src: "/images/blog/post-1.png", alt: "" },
    { type: "image", src: "/images/blog/post-2.png", alt: "" },
  ]);
});

test("drops embedded images that have no substitute path", () => {
  const md = "![](data:image/png;base64,A)\n\n![](data:image/png;base64,B)";
  const { blocks, droppedImages } = markdownToBlocks(md, { images: ["/images/blog/post-1.png"] });
  assert.equal(droppedImages, 1);
  assert.equal(blocks.filter((b: any) => b.type === "image").length, 1);
});

test("does not consume substitute paths for real (non-data) image URLs", () => {
  const { blocks } = markdownToBlocks("![alt](https://cdn/x.jpg)", {
    images: ["/images/blog/post-1.png"],
  });
  assert.deepEqual(blocks, [{ type: "image", src: "https://cdn/x.jpg", alt: "alt" }]);
});

test("serializeBlocks emits unquoted keys and double-quoted strings", () => {
  const out = serializeBlocks([{ type: "heading", text: 'He said "hi"' }]);
  assert.match(out, /type: "heading"/);
  assert.match(out, /text: "He said \\"hi\\""/);
});
