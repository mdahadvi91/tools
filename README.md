# AHADEX Tools

Free, fast, and private browser-based tools for everyday digital tasks.

## 🚀 Currently Available Tools (4)

Every tool runs **100% locally in your browser**. No files are uploaded, stored, or tracked on any server.

1. **Image to PDF** *(documents)* — Convert JPG, PNG, and WebP images into a single PDF file instantly. 100% free and private.
2. **Photo QR Code** *(qr)* — Add a real, scannable QR badge to any photo — WhatsApp, Facebook, WiFi, and more.
3. **Visiting Card Maker** *(design)* — Design professional visiting cards in seconds. 20 premium templates — front & back. Free, private, exports PNG/JPG.
4. **CV Builder** *(documents)* — Build a professional CV in minutes. Real A4 templates, live preview, selectable-text PDF export, auto-save and full browser-side privacy.

---

## 🏗️ Architecture & Single Source of Truth

This project is built around a **Central Registry** model. The file `src/data/tools.ts` is the **single source of truth** for the entire application. 

### How the Auto-Generation Works
We do not manually edit SEO files. Instead, running `npm run build` (or `npm run generate:ssr`) triggers `scripts/generate-ssr.ts`, which reads `src/data/tools.ts` and automatically generates:
- `functions/_ssr-content.ts` (Server-Side Rendered HTML)
- `functions/_data.ts` (Meta, OG, and Twitter tags)
- `functions/_schema.ts` (JSON-LD Structured Data)
- `public/sitemap.xml` (Sitemap with images)
- `public/robots.txt` (Robots rules)

### Adding a New Tool
To add a new tool, you **never** touch the routing, sitemap, or SEO files manually:
1. Add the tool's metadata (name, description, FAQ, features) to `src/data/tools.ts`.
2. Create the React component at `src/tools/<category>/<tool-id>/index.tsx`.
3. Run `npm run build`.

Everything else (Routing via `import.meta.glob`, internal links, sitemap, and SSR) updates automatically.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Framer Motion
- **Hosting:** Cloudflare Pages (with Pages Functions for SSR)
- **Processing:** Browser-native APIs (Canvas, FileReader, Web Crypto)

---

## 🔒 Privacy, Security & Compliance

- **Privacy First:** Files never leave the user's device.
- **GDPR / Consent:** Integrated with **Google Certified CMP (TCF ID 300)** via AdSense Privacy & Messaging for EEA/UK traffic.
- **Security Headers:** Strict `Content-Security-Policy` (CSP) enforced without `unsafe-eval`, plus `HSTS`, `X-Frame-Options`, and `Permissions-Policy`.
- **404 Handling:** Custom Cloudflare Middleware ensures unknown routes return a true HTTP 404 status (preventing Soft 404s).

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Run type checking
npm run type-check

# Build for production (auto-generates SSR artifacts)
npm run build
📄 License

MIT © AHADEX Tools
