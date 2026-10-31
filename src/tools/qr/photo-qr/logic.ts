import QRCode from "qrcode";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MessageCircle,
  Share2,
  Camera,
  Send,
  Phone,
  Mail,
  Wifi,
  Globe,
  MessageSquare,
  User,
  Type,
  Square,
  Squircle,
  Frame,
} from "lucide-react";

const MAX_PIXELS = 10000 * 10000; // 100MP hard limit

/* ============================================================
 * TYPES (merged from types.ts)
 * ============================================================ */

export type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";
export type QrBackground = "white" | "rounded" | "none";

export interface RenderOptions {
  photoFile: File;
  platform: PlatformConfig;
  values: Record<string, string>;
  position: Position;
  sizePercent: number;
  padding: number;
  qrBackground: QrBackground;
}

export interface PlatformConfig {
  id: string;
  name: string;
  nameBn: string;
  color: string;
  Icon: React.ElementType;
  fields: PlatformField[];
  buildPayload: (values: Record<string, string>) => string;
}

export interface PlatformField {
  key: string;
  label: string;
  labelBn: string;
  placeholder: string;
  placeholderBn: string;
  type: "text" | "url" | "tel" | "email" | "password";
}

/* ============================================================
 * PLATFORMS (merged from options.ts)
 * ============================================================ */

export const PLATFORMS: PlatformConfig[] = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    nameBn: "হোয়াটসঅ্যাপ",
    color: "#25D366",
    Icon: MessageCircle,
    fields: [
      {
        key: "phone",
        label: "Enter your WhatsApp number",
        labelBn: "আপনার হোয়াটসঅ্যাপ নম্বর লিখুন",
        placeholder: "+8801712345678",
        placeholderBn: "+৮৮০১৭১২৩৪৫৬৭৮",
        type: "tel",
      },
    ],
    buildPayload: (v) =>
      `https://wa.me/${(v.phone || "").replace(/[^\d]/g, "")}`,
  },
  {
    id: "facebook",
    name: "Facebook",
    nameBn: "ফেসবুক",
    color: "#1877F2",
    Icon: Share2,
    fields: [
      {
        key: "url",
        label: "Enter your Facebook link",
        labelBn: "আপনার ফেসবুক লিংক লিখুন",
        placeholder: "https://facebook.com/username",
        placeholderBn: "https://facebook.com/username",
        type: "url",
      },
    ],
    buildPayload: (v) => v.url || "",
  },
  {
    id: "instagram",
    name: "Instagram",
    nameBn: "ইনস্টাগ্রাম",
    color: "#E4405F",
    Icon: Camera,
    fields: [
      {
        key: "url",
        label: "Enter your Instagram link",
        labelBn: "আপনার ইনস্টাগ্রাম লিংক লিখুন",
        placeholder: "https://instagram.com/username",
        placeholderBn: "https://instagram.com/username",
        type: "url",
      },
    ],
    buildPayload: (v) => v.url || "",
  },
  {
    id: "telegram",
    name: "Telegram",
    nameBn: "টেলিগ্রাম",
    color: "#0088CC",
    Icon: Send,
    fields: [
      {
        key: "url",
        label: "Enter your Telegram link",
        labelBn: "আপনার টেলিগ্রাম লিংক লিখুন",
        placeholder: "https://t.me/username",
        placeholderBn: "https://t.me/username",
        type: "url",
      },
    ],
    buildPayload: (v) => v.url || "",
  },
  {
    id: "phone",
    name: "Phone Call",
    nameBn: "ফোন কল",
    color: "#4A2A3A",
    Icon: Phone,
    fields: [
      {
        key: "phone",
        label: "Enter phone number",
        labelBn: "ফোন নম্বর লিখুন",
        placeholder: "+971507975837",
        placeholderBn: "+৯৭১৫০৭৯৭৫৮৩৭",
        type: "tel",
      },
    ],
    buildPayload: (v) => `tel:${(v.phone || "").replace(/\s/g, "")}`,
  },
  {
    id: "email",
    name: "Email",
    nameBn: "ইমেইল",
    color: "#8B3A4F",
    Icon: Mail,
    fields: [
      {
        key: "email",
        label: "Enter email address",
        labelBn: "ইমেইল ঠিকানা লিখুন",
        placeholder: "you@example.com",
        placeholderBn: "you@example.com",
        type: "email",
      },
      {
        key: "subject",
        label: "Subject (optional)",
        labelBn: "বিষয় (ঐচ্ছিক)",
        placeholder: "Hello!",
        placeholderBn: "হ্যালো!",
        type: "text",
      },
    ],
    buildPayload: (v) => {
      const s = v.subject
        ? `?subject=${encodeURIComponent(v.subject)}`
        : "";
      return `mailto:${v.email}${s}`;
    },
  },
  {
    id: "wifi",
    name: "WiFi",
    nameBn: "ওয়াইফাই",
    color: "#C99667",
    Icon: Wifi,
    fields: [
      {
        key: "ssid",
        label: "WiFi network name (SSID)",
        labelBn: "ওয়াইফাই নেটওয়ার্কের নাম",
        placeholder: "MyHomeWiFi",
        placeholderBn: "MyHomeWiFi",
        type: "text",
      },
      {
        key: "password",
        label: "WiFi password",
        labelBn: "ওয়াইফাই পাসওয়ার্ড",
        placeholder: "••••••••",
        placeholderBn: "••••••••",
        type: "password",
      },
    ],
    buildPayload: (v) => `WIFI:T:WPA;S:${v.ssid};P:${v.password};;`,
  },
  {
    id: "website",
    name: "Website",
    nameBn: "ওয়েবসাইট",
    color: "#8B9DC7",
    Icon: Globe,
    fields: [
      {
        key: "url",
        label: "Enter website URL",
        labelBn: "ওয়েবসাইট URL লিখুন",
        placeholder: "https://example.com",
        placeholderBn: "https://example.com",
        type: "url",
      },
    ],
    buildPayload: (v) => v.url || "",
  },
  {
    id: "sms",
    name: "SMS",
    nameBn: "এসএমএস",
    color: "#B36878",
    Icon: MessageSquare,
    fields: [
      {
        key: "phone",
        label: "Enter phone number",
        labelBn: "ফোন নম্বর লিখুন",
        placeholder: "+971507975837",
        placeholderBn: "+৯৭১৫০৭৯৭৫৮৩৭",
        type: "tel",
      },
      {
        key: "message",
        label: "Message (optional)",
        labelBn: "বার্তা (ঐচ্ছিক)",
        placeholder: "Hi there!",
        placeholderBn: "হ্যালো!",
        type: "text",
      },
    ],
    buildPayload: (v) =>
      `sms:${(v.phone || "").replace(/\s/g, "")}${
        v.message ? `?body=${encodeURIComponent(v.message)}` : ""
      }`,
  },
  {
    id: "vcard",
    name: "Contact",
    nameBn: "যোগাযোগ",
    color: "#D88B9A",
    Icon: User,
    fields: [
      {
        key: "name",
        label: "Your name",
        labelBn: "আপনার নাম",
        placeholder: "Jane Doe",
        placeholderBn: "করিম আহমেদ",
        type: "text",
      },
      {
        key: "phone",
        label: "Phone number",
        labelBn: "ফোন নম্বর",
        placeholder: "+971507975837",
        placeholderBn: "+৯৭১৫০৭৯৭৫৮৩৭",
        type: "tel",
      },
      {
        key: "email",
        label: "Email (optional)",
        labelBn: "ইমেইল (ঐচ্ছিক)",
        placeholder: "you@example.com",
        placeholderBn: "you@example.com",
        type: "email",
      },
    ],
    buildPayload: (v) => {
      const lines = ["BEGIN:VCARD", "VERSION:3.0", `FN:${v.name || ""}`];
      if (v.phone) lines.push(`TEL:${v.phone}`);
      if (v.email) lines.push(`EMAIL:${v.email}`);
      lines.push("END:VCARD");
      return lines.join("\n");
    },
  },
  {
    id: "text",
    name: "Plain Text",
    nameBn: "সাধারণ টেক্সট",
    color: "#4A2A3A",
    Icon: Type,
    fields: [
      {
        key: "text",
        label: "Enter text",
        labelBn: "টেক্সট লিখুন",
        placeholder: "Any text you want...",
        placeholderBn: "যেকোনো টেক্সট...",
        type: "text",
      },
    ],
    buildPayload: (v) => v.text || "",
  },
];

export function getPlatform(id: string): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.id === id);
}

/* ============================================================
 * POSITIONS
 * ============================================================ */

export const POSITIONS: {
  id: Position;
  label: string;
  labelBn: string;
}[] = [
  { id: "top-left", label: "Top left", labelBn: "উপরে বাম" },
  { id: "top-right", label: "Top right", labelBn: "উপরে ডান" },
  { id: "bottom-left", label: "Bottom left", labelBn: "নিচে বাম" },
  { id: "bottom-right", label: "Bottom right", labelBn: "নিচে ডান" },
];

/* ============================================================
 * QR BACKGROUNDS
 * ============================================================ */

export const QR_BACKGROUNDS: {
  id: QrBackground;
  label: string;
  labelBn: string;
  Icon: typeof Square;
}[] = [
  { id: "white", label: "White", labelBn: "সাদা", Icon: Square },
  { id: "rounded", label: "Rounded", labelBn: "গোল", Icon: Squircle },
  { id: "none", label: "None", labelBn: "নেই", Icon: Frame },
];

/* ============================================================
 * SLIDER RANGES
 * ============================================================ */

export const SIZE_RANGE = { min: 10, max: 35, step: 1, default: 20 };
export const PADDING_RANGE = { min: 0, max: 40, step: 1, default: 10 };

/* ============================================================
 * FILE UPLOAD
 * ============================================================ */

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPT_ATTR = "image/jpeg,image/png,image/webp,image/*";

/* ============================================================
 * IMAGE LOADING
 * ============================================================ */

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/* ============================================================
 * LOGO BUILDER — platform icon inside colored circle
 * ============================================================ */

function buildLogoDataUrl(platform: PlatformConfig, size: number): string {
  const IconComponent = platform.Icon;
  const iconMarkup = renderToStaticMarkup(
    createElement(IconComponent, { size: 100, color: "#FFFFFF" })
  );

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="${platform.color}"/>
      <g transform="translate(25, 25)">
        ${iconMarkup
          .replace(/width="[^"]*"/g, 'width="50"')
          .replace(/height="[^"]*"/g, 'height="50"')}
      </g>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

function loadSvgImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load SVG"));
    img.src = dataUrl;
  });
}

/* ============================================================
 * ROUNDED RECT HELPER
 * ============================================================ */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ============================================================
 * QR + LOGO GENERATOR
 * ============================================================ */

export async function generateQrWithLogo(
  payload: string,
  platform: PlatformConfig,
  qrPixelSize: number
): Promise<HTMLCanvasElement> {
  const qrCanvas = document.createElement("canvas");
  qrCanvas.width = qrPixelSize;
  qrCanvas.height = qrPixelSize;

  await QRCode.toCanvas(qrCanvas, payload, {
    width: qrPixelSize,
    margin: 0,
    errorCorrectionLevel: "H",
    color: { dark: "#0A0B1E", light: "#FFFFFF" },
  });

  const logoSize = Math.round(qrPixelSize * 0.22);
  const logoDataUrl = buildLogoDataUrl(platform, logoSize);
  const logoImg = await loadSvgImage(logoDataUrl);

  const ctx = qrCanvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  const pad = logoSize * 0.12;
  const circleR = (logoSize + pad * 2) / 2;
  ctx.beginPath();
  ctx.arc(qrPixelSize / 2, qrPixelSize / 2, circleR, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();

  ctx.drawImage(
    logoImg,
    (qrPixelSize - logoSize) / 2,
    (qrPixelSize - logoSize) / 2,
    logoSize,
    logoSize
  );

  return qrCanvas;
}

/* ============================================================
 * POSITION CALCULATOR
 * ============================================================ */

function getPositionCoords(
  position: string,
  W: number,
  H: number,
  totalBox: number,
  innerPad: number
): { x: number; y: number } {
  switch (position) {
    case "top-left":
      return { x: innerPad, y: innerPad };
    case "top-right":
      return { x: W - totalBox - innerPad, y: innerPad };
    case "bottom-left":
      return { x: innerPad, y: H - totalBox - innerPad };
    case "bottom-right":
    default:
      return { x: W - totalBox - innerPad, y: H - totalBox - innerPad };
  }
}

/* ============================================================
 * DRAW BACKGROUND BEHIND QR
 * ============================================================ */

function drawQrBackground(
  ctx: CanvasRenderingContext2D,
  bg: string,
  x: number,
  y: number,
  totalBox: number,
  qrSize: number
) {
  if (bg === "none") return;
  ctx.save();
  if (bg === "rounded") {
    const r = Math.round(qrSize * 0.16);
    roundRect(ctx, x, y, totalBox, totalBox, r);
  } else {
    ctx.beginPath();
    ctx.rect(x, y, totalBox, totalBox);
  }
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();
}

/* ============================================================
 * COMPOSE FULL RESOLUTION PHOTO
 * ============================================================ */

export async function composePhoto(options: RenderOptions, format: "image/png" | "image/jpeg" = "image/png"): Promise<Blob> {
  const {
    photoFile,
    platform,
    values,
    position,
    sizePercent,
    padding,
    qrBackground,
  } = options;

  const payload = platform.buildPayload(values);
  if (!payload) throw new Error("Empty payload");

  const img = await loadImageFromFile(photoFile);

  if (img.naturalWidth * img.naturalHeight > MAX_PIXELS) {
    throw new Error(
      `Image resolution too large (${img.naturalWidth}x${img.naturalHeight}). Maximum allowed is 100 megapixels.`
    );
  }

  const W = img.naturalWidth;
  const H = img.naturalHeight;
  const minSide = Math.min(W, H);

  const qrSize = Math.round((minSide * sizePercent) / 100);
  const qrCanvas = await generateQrWithLogo(payload, platform, qrSize);

  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  ctx.drawImage(img, 0, 0, W, H);

  const innerPad = Math.round(qrSize * 0.06);
  const effectivePadding = qrBackground === "none" ? 0 : padding;
  const totalBox = qrSize + effectivePadding * 2;
  const { x, y } = getPositionCoords(
    position,
    W,
    H,
    totalBox,
    innerPad
  );

  drawQrBackground(ctx, qrBackground, x, y, totalBox, qrSize);
  ctx.drawImage(
    qrCanvas,
    x + effectivePadding,
    y + effectivePadding,
    qrSize,
    qrSize
  );

  return new Promise((resolve, reject) => {
    out.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export"));
      },
      format,
      format === "image/jpeg" ? 0.92 : 1.0
    );
  });
}

/* ============================================================
 * GENERATE LOW-RES PREVIEW
 * ============================================================ */

export async function generatePreview(
  options: RenderOptions,
  maxPreviewSize = 1200
): Promise<string> {
  const {
    photoFile,
    platform,
    values,
    position,
    sizePercent,
    padding,
    qrBackground,
  } = options;

  const payload = platform.buildPayload(values);
  if (!payload) throw new Error("Empty payload");

  const img = await loadImageFromFile(photoFile);

  if (img.naturalWidth * img.naturalHeight > MAX_PIXELS) {
    throw new Error(
      `Image resolution too large (${img.naturalWidth}x${img.naturalHeight}). Maximum allowed is 100 megapixels.`
    );
  }

  const W = img.naturalWidth;
  const H = img.naturalHeight;

  const scale = Math.min(1, maxPreviewSize / Math.max(W, H));
  const pw = Math.round(W * scale);
  const ph = Math.round(H * scale);
  const minSide = Math.min(pw, ph);

  const qrSize = Math.round((minSide * sizePercent) / 100);
  const qrCanvas = await generateQrWithLogo(payload, platform, qrSize);

  const out = document.createElement("canvas");
  out.width = pw;
  out.height = ph;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  ctx.drawImage(img, 0, 0, pw, ph);

  const innerPad = Math.round(qrSize * 0.06);
  const scaledPadding =
    qrBackground === "none" ? 0 : Math.round(padding * scale);
  const totalBox = qrSize + scaledPadding * 2;
  const { x, y } = getPositionCoords(position, pw, ph, totalBox, innerPad);

  drawQrBackground(ctx, qrBackground, x, y, totalBox, qrSize);
  ctx.drawImage(
    qrCanvas,
    x + scaledPadding,
    y + scaledPadding,
    qrSize,
    qrSize
  );

  return out.toDataURL("image/png", 0.92);
}
