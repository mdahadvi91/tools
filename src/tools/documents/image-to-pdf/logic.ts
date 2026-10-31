import { tools } from "@/data/tools";

const tool = tools.find((t) => t.id === "image-to-pdf")!;

export const imageToPdfLogic = {
  id: tool.id,
  slug: tool.slug,
  name: tool.name,
  category: tool.category,
  path: tool.path,
  description: tool.description,
  keywords: tool.keywords,
  seo: tool.seo,
  relatedTools: tool.relatedTools,
};

export const MAX_FILE_SIZE = 50 * 1024 * 1024;
export const MAX_TOTAL_SIZE = 200 * 1024 * 1024;
export const MAX_IMAGES = 20;
export const MAX_PIXELS = 10000 * 10000;
export const SUPPORTED_MIMES = ["image/jpeg", "image/png", "image/webp"];

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}
