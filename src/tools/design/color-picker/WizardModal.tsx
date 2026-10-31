import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Loader2, X, Upload, Pipette, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@contexts/LanguageContext";
import { cn } from "@lib/cn";
import { MAX_FILE_SIZE, MAX_PIXELS, SUPPORTED_MIMES, rgbToHsl } from "./logic";

type DownloadFormat = "image/png" | "image/jpeg";
type PickedColor = { hex: string; rgb: string; hsl: string };

interface ColorPickerWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ColorPickerWizard({ isOpen, onClose }: ColorPickerWizardProps) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("image");
  const [color, setColor] = useState<PickedColor | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("image/png");
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setImage(null);
      setColor(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > MAX_FILE_SIZE) {
      setError(bn ? "ফাইল অনেক বড় (সর্বোচ্চ ৫০ MB)।" : "File is too large. Maximum size is 50MB.");
      return;
    }
    if (!SUPPORTED_MIMES.includes(f.type)) {
      setError(bn ? "শুধু JPG, PNG বা WebP ছবি নির্বাচন করুন।" : "Invalid format. Please upload JPG, PNG, or WebP.");
      return;
    }
    setError(null);
    setColor(null);
    setFileName(f.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onerror = () => setError(bn ? "ফাইল পড়া যায়নি।" : "Failed to read file.");
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) { setError(bn ? "ফাইল পড়া যায়নি।" : "Failed to read file."); return; }
      const img = new Image();
      img.onerror = () => setError(bn ? "ছবি ডিকোড করা যায়নি।" : "Image decode failed.");
      img.onload = () => {
        if (img.width * img.height > MAX_PIXELS) {
          setError(bn ? `ছবি অনেক বড় (${img.width}x${img.height})।` : `Image resolution too large (${img.width}x${img.height}).`);
          return;
        }
        setImage(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
  };

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);
    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0], g = pixel[1], b = pixel[2];
      const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
      const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      setColor({ hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl: rgbToHsl(r, g, b) });
    } catch {
      setError(bn ? "রঙ পড়া যায়নি।" : "Could not read color.");
    }
  };

  const useEyeDropper = async () => {
    if (!("EyeDropper" in window)) {
      setError(bn ? "ব্রাউজার EyeDropper সাপোর্ট করে না। Chrome/Edge ব্যবহার করুন।" : "Browser does not support EyeDropper. Use Chrome or Edge.");
      return;
    }
    try {
      // @ts-ignore
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      const hex = result.sRGBHex.toUpperCase();
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      setColor({ hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl: rgbToHsl(r, g, b) });
      setError(null);
    } catch { /* cancelled */ }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = async () => {
    const img = imgRef.current;
    if (!img) return;
    setIsDownloading(true);
    setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      if (downloadFormat === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      // Draw color swatch if a color was picked
      if (color) {
        const minSide = Math.min(canvas.width, canvas.height);
        const swatchSize = Math.round(minSide * 0.14);
        const pad = Math.round(swatchSize * 0.18);
        const textWidth = Math.round(swatchSize * 1.9);
        const boxWidth = pad + swatchSize + pad + textWidth + pad;
        const boxHeight = swatchSize + pad * 2;
        const x = canvas.width - boxWidth - pad;
        const y = canvas.height - boxHeight - pad;
        // White box
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.fillRect(x, y, boxWidth, boxHeight);
        // Color swatch
        ctx.fillStyle = color.hex;
        ctx.fillRect(x + pad, y + pad, swatchSize, swatchSize);
        // Hex text
        ctx.fillStyle = "#0A0B1E";
        ctx.font = `bold ${Math.round(swatchSize * 0.26)}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(color.hex, x + pad + swatchSize + pad, y + boxHeight / 2);
      }
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
          downloadFormat,
          downloadFormat === "image/jpeg" ? 0.95 : 1.0
        );
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = downloadFormat === "image/png" ? "png" : "jpg";
      a.download = `${fileName}-${color ? color.hex.replace("#", "") : "picked"}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  const stepTitles: Record<number, string> = {
    1: bn ? "ছবি আপলোড করুন" : "Upload Image",
    2: bn ? "রঙ বেছে নিন" : "Pick Color",
    3: bn ? "ডাউনলোড" : "Download",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm sm:p-3" role="dialog" aria-modal="true">
      <div className="flex h-full w-full flex-col overflow-hidden bg-light-bg dark:bg-dark-bg sm:h-auto sm:max-h-[96vh] sm:max-w-4xl sm:rounded-2xl sm:border sm:border-silk-rose/25 sm:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-silk-rose/20 bg-white/90 px-4 py-3 dark:bg-dark-surface/90 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-silk-rose">
              {bn ? `ধাপ ${step}/3` : `STEP ${step}/3`}
            </p>
            <h2 className="truncate text-base font-bold text-light-text dark:text-dark-text sm:text-lg">{stepTitles[step]}</h2>
          </div>
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((step - 1) as any) : onClose())}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-silk-rose/20 bg-silk-rose/5 text-light-text dark:text-dark-text"
          >
            {step > 1 ? <ArrowLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </header>

        {image && (
          <div className={cn(
            "shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-b border-silk-rose/10 p-3 sm:p-4",
            step === 3 ? "min-h-[36vh] sm:min-h-[46vh]" : "min-h-[26vh] sm:min-h-[34vh]"
          )}>
            <img
              ref={imgRef}
              src={image}
              alt=""
              className="hidden"
              onLoad={() => {
                const canvas = canvasRef.current;
                const img = imgRef.current;
                if (canvas && img) {
                  canvas.width = img.naturalWidth;
                  canvas.height = img.naturalHeight;
                  const ctx = canvas.getContext("2d");
                  ctx?.drawImage(img, 0, 0);
                }
              }}
            />
            <canvas
              ref={canvasRef}
              onClick={step === 2 ? pickColor : undefined}
              className={cn(
                "rounded-lg shadow-sm",
                step === 2 && "cursor-crosshair"
              )}
              style={{
                maxWidth: "100%",
                maxHeight: step === 3 ? "44vh" : "32vh",
              }}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 1 && (
            <div>
              {image ? (
                <div className="text-center space-y-3 py-4">
                  <p className="text-sm font-bold text-light-text dark:text-dark-text">✓ {bn ? "ছবি আপলোড হয়েছে" : "Image uploaded"}</p>
                  <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary truncate">{fileName}</p>
                  <button type="button" onClick={() => { setImage(null); setColor(null); }} className="text-sm text-silk-rose hover:underline font-bold">
                    {bn ? "অন্য ছবি বেছে নিন" : "Choose different image"}
                  </button>
                </div>
              ) : (
                <motion.div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
                  className={cn("group relative flex flex-col items-center justify-center gap-4 p-8 sm:p-12 min-h-[200px] cursor-pointer rounded-2xl border-2 border-dashed transition-all", isDragging ? "border-silk-rose bg-silk-rose/10" : "border-silk-rose/30 hover:border-silk-rose/50")}
                >
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }} className="hidden" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-silk-rose/20 to-silk-gold/15 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-silk-rose" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-light-text dark:text-dark-text mb-1">{bn ? "ছবি আপলোড করুন" : "Upload image"}</p>
                    <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? "ক্লিক বা টেনে আনুন · JPG, PNG, WebP · ৫০ MB" : "Click or drag · JPG, PNG, WebP · 50 MB"}</p>
                  </div>
                </motion.div>
              )}
              {error && <p className="text-center text-xs text-red-600 dark:text-red-400 mt-3">{error}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-light-text dark:text-dark-text">
                  {bn ? "ছবির ওপর ক্লিক করে রঙ বেছে নিন" : "Tap the image to pick a color"}
                </p>
                <button
                  type="button"
                  onClick={useEyeDropper}
                  className="flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-dark-surface px-3 py-2 rounded-lg border border-silk-rose/30 hover:border-silk-rose/50"
                >
                  <Pipette className="w-3.5 h-3.5" /> {bn ? "EyeDropper" : "EyeDropper"}
                </button>
              </div>
              {color ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[{ label: "HEX", key: "hex", value: color.hex }, { label: "RGB", key: "rgb", value: color.rgb }, { label: "HSL", key: "hsl", value: color.hsl }].map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-2 p-3 rounded-xl bg-silk-rose/5 border border-silk-rose/20">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-silk-rose uppercase tracking-wider">{item.label}</p>
                        <p className="font-mono font-bold text-sm truncate text-light-text dark:text-dark-text">{item.value}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(item.value, item.key)}
                        className="shrink-0 p-2 rounded-lg hover:bg-silk-rose/10"
                        aria-label={`Copy ${item.label}`}
                      >
                        {copied === item.key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-silk-rose" />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-light-textSecondary dark:text-dark-textSecondary py-4">
                  {bn ? "এখনো কোনো রঙ বেছে নেওয়া হয়নি" : "No color picked yet"}
                </p>
              )}
              {color && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-silk-rose/5 border border-silk-rose/20">
                  <div className="w-12 h-12 rounded-lg border border-silk-rose/30" style={{ backgroundColor: color.hex }} />
                  <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                    {bn ? "ডাউনলোডে এই রঙটি ছবির কোণায় লেখা থাকবে" : "This color will appear as a swatch on your downloaded image"}
                  </p>
                </div>
              )}
              {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-bold text-light-text dark:text-dark-text mb-1">✓ {bn ? "ডাউনলোডের জন্য প্রস্তুত" : "Ready to download"}</p>
                <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-5">
                  {color ? (bn ? `রঙ ${color.hex} সহ ছবি ডাউনলোড হবে` : `Image will include color ${color.hex}`) : (bn ? "শুধু ছবি ডাউনলোড হবে (কোনো রঙ বাছা হয়নি)" : "Only the image will download (no color picked)")}
                </p>
                <div className="flex gap-3 justify-center">
                  <button type="button" onClick={() => setDownloadFormat("image/png")} className={cn("flex-1 max-w-[180px] py-3 rounded-xl border-2 font-bold transition-all", downloadFormat === "image/png" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 hover:border-silk-rose/40 text-light-text dark:text-dark-text")}>
                    PNG<span className="block text-[10px] font-normal mt-0.5 opacity-70">{bn ? "লসলেস" : "Lossless"}</span>
                  </button>
                  <button type="button" onClick={() => setDownloadFormat("image/jpeg")} className={cn("flex-1 max-w-[180px] py-3 rounded-xl border-2 font-bold transition-all", downloadFormat === "image/jpeg" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 hover:border-silk-rose/40 text-light-text dark:text-dark-text")}>
                    JPG<span className="block text-[10px] font-normal mt-0.5 opacity-70">{bn ? "ছোট সাইজ" : "Smaller"}</span>
                  </button>
                </div>
              </div>
              {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-silk-rose/20 bg-white/90 dark:bg-dark-surface/90 p-3 sm:p-4">
          <div className="flex gap-3 justify-between">
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as any)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-silk-rose/30 font-bold text-sm hover:bg-silk-rose/5 text-light-text dark:text-dark-text">
                <ArrowLeft className="w-4 h-4" />{bn ? "পিছনে" : "Back"}
              </button>
            ) : <div />}

            {step === 1 && (
              <button onClick={() => setStep(2)} disabled={!image} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">
                {bn ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === 2 && (
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700">
                {bn ? "ডাউনলোড" : "Download"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === 3 && (
              <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isDownloading ? (bn ? "ডাউনলোড হচ্ছে..." : "Downloading...") : (bn ? "ডাউনলোড" : "Download")}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
