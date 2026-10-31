import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(__dirname, "../..");

function readTool(filePath: string): string {
  const fullPath = resolve(ROOT, filePath);
  if (!existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }
  return readFileSync(fullPath, "utf-8");
}

/** Strip JS/TS comments so we only test actual code, not comments */
function stripComments(src: string): string {
  // Remove /* */ block comments
  let stripped = src.replace(/\/\*[\s\S]*?\*\//g, "");
  // Remove // line comments
  stripped = stripped.replace(/\/\/[^\n]*/g, "");
  return stripped;
}

describe("Security — Validation Constants", () => {
  it("Image Resizer enforces MAX_FILE_SIZE, MAX_PIXELS, MAX_DIMENSION", () => {
    const src = readTool("src/tools/images/image-resizer/logic.ts");
    expect(src).toContain("MAX_FILE_SIZE");
    expect(src).toContain("MAX_PIXELS");
    expect(src).toContain("MAX_DIMENSION");
    expect(src).toContain("50 * 1024 * 1024"); // 50MB
  });

  it("Image Resizer has MIME type validation", () => {
    const src = readTool("src/tools/images/image-resizer/logic.ts");
    expect(src).toMatch(/image\/jpeg|image\/png|image\/webp/);
  });

  it("Image Resizer uses toBlob, not toDataURL (memory safe)", () => {
    const src = stripComments(
      readTool("src/tools/images/image-resizer/WizardModal.tsx")
    );
    expect(src).not.toContain("toDataURL");
    expect(src).toContain("toBlob");
    expect(src).toContain("revokeObjectURL");
  });

  it("Image Resizer rejects zero/negative dimensions", () => {
    const src = readTool("src/tools/images/image-resizer/WizardModal.tsx");
    expect(src).toMatch(/<= 0|<=0/);
  });

  it("WebP Converter uses toBlob + revokeObjectURL", () => {
    const src = stripComments(
      readTool("src/tools/images/webp-converter/WizardModal.tsx")
    );
    expect(src).not.toContain("toDataURL");
    expect(src).toContain("toBlob");
    expect(src).toContain("revokeObjectURL");
  });

  it("WebP Converter enforces 50MB and MIME type", () => {
    const src = readTool("src/tools/images/webp-converter/WizardModal.tsx");
    expect(src).toContain("MAX_FILE_SIZE");
    expect(src).toMatch(/50 \* 1024 \* 1024/);
    expect(src).toMatch(/image\/webp/);
  });

  it("Color Picker enforces MIME + size + pixel limits", () => {
    const src = readTool("src/tools/design/color-picker/WizardModal.tsx");
    expect(src).toContain("MAX_FILE_SIZE");
    expect(src).toContain("MAX_PIXELS");
    expect(src).toMatch(/SUPPORTED_MIMES|image\/jpeg/);
  });

  it("Color Picker handles decode errors", () => {
    const src = readTool("src/tools/design/color-picker/WizardModal.tsx");
    expect(src).toContain("onerror");
  });

  it("Image to PDF enforces file count + size limits", () => {
    const src = readTool("src/tools/documents/image-to-pdf/ImageToPdfWizardModal.tsx");
    expect(src).toContain("MAX_FILE_SIZE");
    expect(src).toContain("MAX_IMAGES");
    expect(src).toContain("MAX_PIXELS");
    expect(src).toContain("MAX_TOTAL_SIZE");
  });

  it("Photo QR enforces MAX_PIXELS in logic.ts", () => {
    const src = readTool("src/tools/qr/photo-qr/logic.ts");
    expect(src).toContain("MAX_PIXELS");
    expect(src).toMatch(/10000 \* 10000/);
  });
});
