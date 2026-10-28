import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { tools } from "../../src/data/tools";

const ROOT = resolve(__dirname, "../..");

describe("Generated Artifacts Consistency", () => {
  it("all generated files exist", () => {
    const files = [
      "functions/_ssr-content.ts",
      "functions/_data.ts",
      "functions/_schema.ts",
      "public/sitemap.xml",
      "public/robots.txt",
    ];
    for (const f of files) {
      expect(existsSync(resolve(ROOT, f))).toBe(true);
    }
  });

  it("every tool appears in _data.ts", () => {
    const data = readFileSync(resolve(ROOT, "functions/_data.ts"), "utf-8");
    for (const tool of tools) {
      expect(data).toContain(`"${tool.path}"`);
    }
  });

  it("every tool appears in _schema.ts", () => {
    const schema = readFileSync(resolve(ROOT, "functions/_schema.ts"), "utf-8");
    for (const tool of tools) {
      expect(schema).toContain(`"${tool.path}"`);
    }
  });

  it("every tool appears in sitemap.xml", () => {
    const sitemap = readFileSync(resolve(ROOT, "public/sitemap.xml"), "utf-8");
    for (const tool of tools) {
      expect(sitemap).toContain(tool.path);
    }
  });

  it("every tool appears in _ssr-content.ts", () => {
    const ssr = readFileSync(resolve(ROOT, "functions/_ssr-content.ts"), "utf-8");
    for (const tool of tools) {
      expect(ssr).toContain(`"${tool.path}"`);
    }
  });

  it("all OG images exist on disk", () => {
    for (const tool of tools) {
      const imgPath = resolve(ROOT, "public", tool.seo.ogImage.replace(/^\//, ""));
      expect(existsSync(imgPath)).toBe(true);
    }
  });

  it("sitemap uses .jpg (not .png) for OG images", () => {
    const sitemap = readFileSync(resolve(ROOT, "public/sitemap.xml"), "utf-8");
    expect(sitemap).not.toMatch(/og\/tools\/[^<]+\.png/);
    expect(sitemap).toMatch(/og\/tools\/[^<]+\.jpg/);
  });
});
