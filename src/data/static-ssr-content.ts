/* ============================================================
 * Static SSR content — rich HTML for pages that are otherwise
 * only React-rendered. The Cloudflare middleware injects these
 * into the initial response so crawlers and JS-disabled users
 * see the same substantive content the interactive app renders.
 *
 * All HTML here is trusted (authored in this repo). The SSR
 * generator escapes nothing, so keep it well-formed.
 * ============================================================ */

import { tools } from "./tools";
import { getToolCategory } from "../lib/toolCategory";


/* ── Dynamic category counts ── */
const categoryCounts = {
  image: tools.filter((t) => getToolCategory(t.id, t.path) === "image").length,
  pdf: tools.filter((t) => getToolCategory(t.id, t.path) === "pdf").length,
  developer: tools.filter((t) => getToolCategory(t.id, t.path) === "developer").length,
  text: tools.filter((t) => getToolCategory(t.id, t.path) === "text").length,
  qr: tools.filter((t) => getToolCategory(t.id, t.path) === "qr").length,
  design: tools.filter((t) => getToolCategory(t.id, t.path) === "design").length,
};

export interface StaticPageContent {
  path: string;
  html: string;
}

export const staticPageContents: StaticPageContent[] = [
  {
    path: "/",
    html: `<article>
  <h1>AHADEX Tools — Free browser tools that never upload your files</h1>
  <p><strong>AHADEX Tools is a collection of ${tools.length} free utilities for everyday digital work — image conversion, PDF handling, text processing, developer helpers, and QR code generation. Every tool runs entirely inside your browser. Your files and tool input are processed locally and are not uploaded to our servers or stored anywhere. (Anonymous analytics and advertising scripts load separately — see the Privacy Policy for details.)</strong></p>

  <h2>What AHADEX Tools does</h2>
  <p>AHADEX Tools is a single-page collection of independent utilities, each solving one specific problem without signup, watermark, or file-size limit. The tools fall into six categories:</p>
  <ul>
    <li><strong>Image tools</strong> — convert between JPG, PNG, and WebP; compress; resize; crop; view metadata; turn photos into sketches or cartoons.</li>
    <li><strong>PDF tools</strong> — merge; split; rotate; convert PDF pages to PNG or JPG; extract text; build image-only PDFs.</li>
    <li><strong>Developer tools</strong> — format and validate JSON; encode URLs; generate UUIDs; encode Base64; generate strong passwords.</li>
    <li><strong>Text tools</strong> — count words; count characters against platform limits; convert between 12 case styles.</li>
    <li><strong>QR & barcode tools</strong> — add scannable QR badges to photos; generate 1D barcodes in nine formats.</li>
    <li><strong>Design & documents</strong> — design visiting cards; build ATS-friendly CVs; generate complete favicon sets.</li>
  </ul>

  <h2>How the tools work</h2>
  <p>Every tool is written in JavaScript and runs entirely in your browser using standard web APIs — the HTML5 Canvas API for images, pdf-lib and pdf.js for PDFs, and the Web Crypto API for cryptographic operations. When you upload a file, the file is read into memory by your browser and never travels over the network. You can verify this yourself: open your browser's developer tools, switch to the Network tab, and use any tool. You will see zero outbound file-upload requests. You can even turn off Wi-Fi after the page loads and every tool continues to work.</p>

  <h2>Why browser-based matters</h2>
  <p>Most online tools upload your files to a server. For passport photos, contracts, medical records, ID scans, and unreleased design work, that means a copy of your file sits on someone else's computer for minutes, hours, or longer. Some services claim to delete files immediately. Even so, the file has already been transmitted. AHADEX Tools avoids that entire class of risk by never sending anything anywhere.</p>

  <h2>Who AHADEX Tools is for</h2>
  <ul>
    <li><strong>Freelancers and small business owners</strong> — sending deliverables, preparing invoices, compressing images for clients.</li>
    <li><strong>Students and researchers</strong> — merging PDFs for submissions, converting lecture slides to images, building CVs.</li>
    <li><strong>Developers</strong> — formatting JSON, debugging URLs, generating UUIDs and Base64 without opening an editor.</li>
    <li><strong>Designers and photographers</strong> — batch-converting images, creating favicons, adding watermarks, extracting colour references.</li>
    <li><strong>Anyone who values privacy</strong> — anyone who would rather not hand their documents to an unknown server.</li>
  </ul>

  <h2>Featured tools</h2>
  <ul>
    <li><a href="/tools/cv-builder">CV Builder</a> — build a professional A4 CV and export a selectable-text PDF that ATS software can parse.</li>
    <li><a href="/tools/photo-qr">Photo QR Code</a> — add a real scannable QR badge to any photo for WhatsApp, WiFi, Instagram, or a vCard.</li>
  </ul>

  <h2>Frequently asked questions</h2>
  <div>
    <h3>Is AHADEX Tools really free?</h3>
    <p>Yes. Every tool is free to use without an account, watermark, or hidden file-size limit. The site is supported by advertising shown outside the tool workspaces.</p>
  </div>
  <div>
    <h3>Do you upload my files to a server?</h3>
    <p>No. Every tool runs entirely in your browser. Files are read locally, processed locally, and never transmitted. You can verify this by checking your browser's developer tools while using any tool.</p>
  </div>
  <div>
    <h3>Do I need to create an account?</h3>
    <p>No. There is no signup, no email, and no login. You can use every tool immediately.</p>
  </div>
  <div>
    <h3>Does it work on mobile phones and tablets?</h3>
    <p>Yes. Every tool is fully responsive and tested on iOS Safari, Android Chrome, Firefox for Android, and Samsung Internet.</p>
  </div>
  <div>
    <h3>Do you collect analytics?</h3>
    <p>We use anonymous analytics (page views and tool opens) to understand which tools are useful. We never see your files or the text you enter into a tool. You can block analytics without affecting any tool.</p>
  </div>
  <div>
    <h3>How can I report a bug or request a feature?</h3>
    <p>Email <a href="mailto:mdahadvi91@gmail.com">mdahadvi91@gmail.com</a> or open an issue on <a href="https://github.com/mdahadvi91/AHADEX-TOOLS">GitHub</a>.</p>
  </div>
</article>`,
  },

  {
    path: "/tools",
    html: `<article>
  <h1>All Tools — 3 free browser-based utilities</h1>
  <p><strong>AHADEX Tools currently offers ${tools.length} browser-based tools for image work, PDF handling, text processing, developer tasks, QR and barcode generation, and design documents. Every tool runs entirely in your browser — no uploads, no accounts, no watermarks.</strong></p>

  <h2>Image tools (${categoryCounts.image})</h2>
  <ul>
  </ul>

  <h2>PDF tools (${categoryCounts.pdf})</h2>
  <ul>
  </ul>

  <h2>Developer tools (${categoryCounts.developer})</h2>
  <ul>
  </ul>

  <h2>Text tools (${categoryCounts.text})</h2>
  <ul>
  </ul>

  <h2>QR and barcode tools (${categoryCounts.qr})</h2>
  <ul>
    <li><a href="/tools/photo-qr">Photo QR Code</a> — add a scannable QR badge to any photo for WhatsApp, Facebook, WiFi, or contact cards.</li>
  </ul>

  <h2>Design and document tools (${categoryCounts.design})</h2>
  <ul>
    <li><a href="/tools/visiting-card">Visiting Card Maker</a> — 20 hand-designed templates, front and back, with export at 150/300/600 DPI.</li>
    <li><a href="/tools/cv-builder">CV Builder</a> — build a professional CV and export a selectable-text PDF that ATS software can parse.</li>
  </ul>

  <h2>How to choose a tool</h2>
  <ul>
  </ul>

  <h2>Privacy across every tool</h2>
  <p>No tool on this site uploads your files to a server. Each tool reads its input locally, processes it in your browser, and hands the result back as a download. You can confirm this by opening your browser's developer tools and watching the Network tab while using any tool.</p>
</article>`,
  },

  {
    path: "/about",
    html: `<article>
  <h1>About AHADEX Tools</h1>
  <p><strong>AHADEX Tools is a collection of free browser-based utilities built by <strong>Mohammad Ahad</strong>, an independent developer based in Dubai, United Arab Emirates. The site exists because most online tools upload your files to a server — and for many files, that is a risk worth avoiding.</strong></p>

  <h2>Why AHADEX Tools exists</h2>
  <p>Most free online tools work the same way: you upload a file, a server processes it, you download the result. That model is simple for the developer but unnecessary for the user. Modern browsers can decode images, parse PDFs, generate cryptography, and run everything a server would otherwise do — directly on your device. The only thing the upload model adds is risk.</p>
  <p>AHADEX Tools was built to demonstrate that the alternative is not only possible but better: same features, same speed, no uploads, no accounts, no watermarks.</p>

  <h2>What the site offers</h2>
  <p>${tools.length} free browser-based tools across six categories — image, PDF, developer, text, QR and barcode, and design. Every tool runs entirely in your browser using standard web APIs. No tool sends your file anywhere, and no tool requires you to create an account.</p>

  <h2>Who writes and maintains the site</h2>
  <p>AHADEX Tools is written and maintained by <strong>Mohammad Ahad</strong>. Every tool, every article, and every piece of documentation on this site is authored by him. Contact: <a href="mailto:mdahadvi91@gmail.com">mdahadvi91@gmail.com</a>.</p>

  <h2>How the site is funded</h2>
  <p>AHADEX Tools is supported by advertising shown outside the tool workspaces, and by occasional affiliate links where relevant. Ads never appear inside a tool workspace, on download buttons, or anywhere they could be mistaken for part of the tool.</p>

  <h2>How to contribute or report an issue</h2>
  <p>The source code is available on <a href="https://github.com/mdahadvi91/AHADEX-TOOLS">GitHub</a>. Bug reports, feature requests, and pull requests are welcome.</p>

  <h2>Editorial standards</h2>
  <p>Every tool description is based on our own testing. We do not republish industry statistics without verification, and we do not make claims our own implementation cannot guarantee. For details.</p>
</article>`,
  },

  {
    path: "/contact",
    html: `<article>
  <h1>Contact AHADEX Tools</h1>
  <p><strong>The fastest way to reach us is email: <a href="mailto:mdahadvi91@gmail.com">mdahadvi91@gmail.com</a>. We aim to respond within 48 hours on business days.</strong></p>

  <h2>What to contact us about</h2>
  <ul>
    <li><strong>Bug reports</strong> — a tool not working correctly, a file type that fails to convert, a browser where something breaks. Please include the browser name and version and, if possible, the file type you used.</li>
    <li><strong>Feature requests</strong> — a new tool, a missing option, or an improvement to an existing one.</li>
    <li><strong>Accessibility issues</strong> — any barrier you encounter using a screen reader, keyboard navigation, or assistive technology. Accessibility reports are treated as priority.</li>
    <li><strong>Privacy questions</strong> — anything about how the site handles data. The short answer: we do not upload or store the files you process with our tools, and we do not run analytics on your file content. Anonymous analytics and advertising services (Google Analytics and AdSense) may process limited information such as page views and cookie identifiers, according to their policies and your consent choices.</li>
    <li><strong>Partnerships and press</strong> — reach out if you have a proposal or press enquiry.</li>
  </ul>

  <h2>How quickly to expect a reply</h2>
  <p>Most emails receive a response within 48 hours. Accessibility and security reports are usually answered the same day.</p>

  <h2>Alternative contact channels</h2>
  <ul>
    <li><strong>GitHub issues</strong> — for bug reports and feature requests with code or screenshots: <a href="https://github.com/mdahadvi91/AHADEX-TOOLS/issues">github.com/mdahadvi91/AHADEX-TOOLS/issues</a></li>
    <li><strong>Email</strong> — for anything else: <a href="mailto:mdahadvi91@gmail.com">mdahadvi91@gmail.com</a></li>
  </ul>
</article>`,
  },

];
