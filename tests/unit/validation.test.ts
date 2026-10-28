import { describe, it, expect } from "vitest";
import { tools } from "../../src/data/tools";

describe("Tool Registry Validation", () => {
  it("all tools have required fields", () => {
    for (const tool of tools) {
      expect(tool.id).toBeTruthy();
      expect(tool.slug).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.path).toMatch(/^\/tools\//);
      expect(tool.seo.title).toBeTruthy();
      expect(tool.seo.description).toBeTruthy();
    }
  });

  it("all tool paths are unique", () => {
    const paths = tools.map((t) => t.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("all tool IDs are unique", () => {
    const ids = tools.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all tool titles are unique", () => {
    const titles = tools.map((t) => t.seo.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("all tool titles are under 65 characters", () => {
    for (const tool of tools) {
      expect(tool.seo.title.length).toBeLessThanOrEqual(65);
    }
  });

  it("all tool descriptions are under 165 characters", () => {
    for (const tool of tools) {
      expect(tool.seo.description.length).toBeLessThanOrEqual(165);
    }
  });

  it("all tools have OG images in .jpg format", () => {
    for (const tool of tools) {
      expect(tool.seo.ogImage).toMatch(/\.jpg$/);
      expect(tool.seo.ogImage).toMatch(/^\/images\/og\/tools\//);
    }
  });

  it("all tools have at least 3 FAQs", () => {
    for (const tool of tools) {
      expect(tool.faq.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("all tools have at least 3 HowTo steps", () => {
    for (const tool of tools) {
      expect(tool.howTo.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("all tools have limitations (E-E-A-T)", () => {
    for (const tool of tools) {
      expect(tool.limitations).toBeDefined();
      expect(tool.limitations!.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("no tools use exaggerated '100% private' claims", () => {
    for (const tool of tools) {
      const allText = [tool.description, tool.longDescription, ...(tool.features?.map((f) => f.description) || [])].join(" ");
      expect(allText.toLowerCase()).not.toContain("100% private");
      expect(allText.toLowerCase()).not.toContain("100% secure");
    }
  });

  it("all tools explicitly use 'client-side' or 'processed locally'", () => {
    for (const tool of tools) {
      const allText = [tool.description, tool.longDescription].join(" ").toLowerCase();
      const hasAccurateWording =
        allText.includes("client-side") ||
        allText.includes("processed locally") ||
        allText.includes("in your browser");
      expect(hasAccurateWording).toBe(true);
    }
  });
});
