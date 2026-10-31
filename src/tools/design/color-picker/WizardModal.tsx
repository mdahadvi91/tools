import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Loader2, X, Upload, Pipette, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@contexts/LanguageContext";
import { cn } from "@lib/cn";
import { MAX_FILE_SIZE, MAX_PIXELS, SUPPORTED_MIMES, rgbToHsl } from "./logic";

type DownloadFormat = "image/png" | "image/jpeg";
type PickedColor = { hex: string; rgb: string; hsl: string };

export function ColorPickerWizard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
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

  useEffect(() => { if (isOpen) { setStep(1); setImage(null); setColor(null); setError(null); } }, [isOpen]);
  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > MAX_FILE_SIZE) { setError(bn ? "ফাইল ৫০ MB এর বেশি।" : "File is too large. Max 50MB."); return; }
    if (!SUPPORTED_MIMES.includes(f.type)) { setError(bn ? "শুধু JPG, PNG, WebP।" : "Only JPG, PNG, WebP."); return; }
    setError(null); setColor(null);
    setFileName(f.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onerror = () => setError("Read failed");
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => setError("Decode failed");
      img.onload = () => {
        if (img.width * img.height > MAX_PIXELS) { setError("Image too large."); return; }
        setImage(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(f);
  };

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    try {
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const r = pixel[0], g = pixel[1], b = pixel[2];
      const toHex = (n: number) => n.toString(16).padStart(2, "0").toUpperCase();
      setColor({ hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, rgb: `rgb(${r}, ${g}, ${b})`, hsl: rgbToHsl(r, g, b) });
    } catch { setError("Could not read color"); }
  };

  const useEyeDropper = async () => {
    if (!("EyeDropper" in window)) { setError("Use Chrome/Edge for EyeDropper"); return; }
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
    } catch {}
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDownload = async () => {
    const img = imgRef.current; if (!img) return;
    setIsDownloading(true); setError(null);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas failed");
      if (downloadFormat === "image/jpeg") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      if (color) {
        const minSide = Math.min(canvas.width, canvas.height);
        const swatchSize = Math.round(minSide * 0.14);
        const pad = Math.round(swatchSize * 0.18);
        const textWidth = Math.round(swatchSize * 1.9);
        const boxWidth = pad + swatchSize + pad + textWidth + pad;
        const boxHeight = swatchSize + pad * 2;
        const x = canvas.width - boxWidth - pad; const y = canvas.height - boxHeight - pad;
        ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.fillStyle = color.hex; ctx.fillRect(x + pad, y + pad, swatchSize, swatchSize);
        ctx.fillStyle = "#0A0B1E"; ctx.font = `bold ${Math.round(swatchSize * 0.26)}px sans-serif`;
        ctx.textAlign = "left"; ctx.textBaseline = "middle";
        ctx.fillText(color.hex, x + pad + swatchSize + pad, y + boxHeight / 2);
      }
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), downloadFormat, downloadFormat === "image/jpeg" ? 0.95 : 1.0);
      });
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; const ext = downloadFormat === "image/png" ? "png" : "jpg";
      a.download = `${fileName}-${color ? color.hex.replace("#", "") : "picked"}.${ext}`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (c) { setError(c instanceof Error ? c.message : "Failed"); }
    finally { setIsDownloading(false); }
  };

  const stepTitles: Record<number, string> = { 1: bn ? "ছবি আপলোড করুন" : "Upload Image", 2: bn ? "রঙ বেছে নিন" : "Pick Color", 3: bn ? "ডাউনলোড" : "Download" };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="flex flex-col w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-5xl bg-white dark:bg-[#0A0B1E] sm:rounded-2xl sm:border border-silk-rose/25 shadow-2xl overflow-hidden">
        <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-silk-rose/20 bg-white dark:bg-[#0A0B1E]">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-silk-rose">{bn ? `ধাপ ${step}/3` : `STEP ${step}/3`}</p>
            <h2 className="text-base sm:text-lg font-bold text-light-text dark:text-dark-text truncate">{stepTitles[step]}</h2>
          </div>
          <button onClick={() => (step > 1 ? setStep((step - 1) as any) : onClose())} className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-silk-rose/10 dark:bg-silk-rose/15 text-silk-wine dark:text-silk-rose hover:bg-silk-rose/20 transition">
            {step > 1 ? <ArrowLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </header>

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          <div className="h-[40%] md:h-auto md:w-1/2 shrink-0 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-3 sm:p-4 overflow-hidden border-b md:border-b-0 md:border-r border-silk-rose/15">
            {image ? (
              <>
                <img ref={imgRef} src={image} alt="" className="hidden" onLoad={() => {
                  const c = canvasRef.current, i = imgRef.current;
                  if (c && i) { c.width = i.naturalWidth; c.height = i.naturalHeight; c.getContext("2d")?.drawImage(i, 0, 0); }
                }} />
                <canvas ref={canvasRef} onClick={step === 2 ? pickColor : undefined} className={cn("max-w-full max-h-full object-contain rounded-lg shadow-sm", step === 2 && "cursor-crosshair")} />
              </>
            ) : (
              <div className="text-center text-light-textSecondary dark:text-dark-textSecondary">
                <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">{bn ? "প্রিভিউ এখানে দেখাবে" : "Preview will appear here"}</p>
              </div>
            )}
          </div>

          <div className="flex-1 md:w-1/2 flex flex-col min-h-0 bg-white dark:bg-[#0A0B1E]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {step === 1 && (
                <div>
                  {image ? (
                    <div className="text-center space-y-3">
                      <p className="text-sm font-bold text-light-text dark:text-dark-text">✓ {bn ? "ছবি আপলোড হয়েছে" : "Image uploaded"}</p>
                      <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary truncate">{fileName}</p>
                      <button onClick={() => { setImage(null); setColor(null); }} className="text-sm text-silk-rose hover:underline font-bold">{bn ? "অন্য ছবি" : "Change"}</button>
                    </div>
                  ) : (
                    <motion.div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className={cn("group relative flex flex-col items-center justify-center gap-4 p-8 cursor-pointer rounded-2xl border-2 border-dashed transition-all", isDragging ? "border-silk-rose bg-silk-rose/10" : "border-silk-rose/30 hover:border-silk-rose/50")}>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }} className="hidden" />
                      <div className="w-14 h-14 rounded-2xl bg-silk-rose/10 flex items-center justify-center"><Upload className="w-6 h-6 text-silk-rose" /></div>
                      <div className="text-center"><p className="font-bold text-light-text dark:text-dark-text">{bn ? "ছবি আপলোড" : "Upload image"}</p><p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? "JPG, PNG, WebP · ৫০ MB" : "JPG, PNG, WebP · 50 MB"}</p></div>
                    </motion.div>
                  )}
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400 mt-3">{error}</p>}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-light-text dark:text-dark-text">{bn ? "ছবিতে ট্যাপ করুন" : "Tap the image"}</p>
                    <button onClick={useEyeDropper} className="flex items-center gap-1.5 text-xs font-bold bg-silk-rose/10 px-3 py-2 rounded-lg text-silk-wine dark:text-silk-rose hover:bg-silk-rose/20"><Pipette className="w-3.5 h-3.5" /> EyeDropper</button>
                  </div>
                  {color ? (
                    <div className="space-y-2">
                      {[{ label: "HEX", key: "hex", value: color.hex }, { label: "RGB", key: "rgb", value: color.rgb }, { label: "HSL", key: "hsl", value: color.hsl }].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-white/70 dark:bg-[#0A0B1E]/70 border border-silk-rose/20">
                          <div><p className="text-[10px] font-bold text-silk-rose uppercase">{item.label}</p><p className="font-mono font-bold text-sm text-light-text dark:text-dark-text">{item.value}</p></div>
                          <button onClick={() => copyToClipboard(item.value, item.key)} className="p-2 rounded-lg hover:bg-silk-rose/10">
                            {copied === item.key ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-silk-rose" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center text-xs text-light-textSecondary dark:text-dark-textSecondary py-4">{bn ? "এখনো রঙ বাছা হয়নি" : "No color picked yet"}</p>}
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-light-text dark:text-dark-text mb-1">✓ {bn ? "প্রস্তুত" : "Ready"}</p>
                    <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-4">{color ? color.hex : (bn ? "কোনো রঙ নেই" : "No color")}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setDownloadFormat("image/png")} className={cn("flex-1 py-3 rounded-xl border-2 font-bold transition-all", downloadFormat === "image/png" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 text-light-textSecondary dark:text-dark-textSecondary hover:border-silk-rose/40")}>PNG<span className="block text-[10px] font-normal mt-0.5 opacity-70">Lossless</span></button>
                    <button onClick={() => setDownloadFormat("image/jpeg")} className={cn("flex-1 py-3 rounded-xl border-2 font-bold transition-all", downloadFormat === "image/jpeg" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 text-light-textSecondary dark:text-dark-textSecondary hover:border-silk-rose/40")}>JPG<span className="block text-[10px] font-normal mt-0.5 opacity-70">Smaller</span></button>
                  </div>
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
                </div>
              )}
            </div>

            <footer className="shrink-0 px-4 py-3 border-t border-silk-rose/20 bg-white dark:bg-[#0A0B1E] flex items-center justify-between gap-3">
              {step > 1 ? <button onClick={() => setStep((step - 1) as any)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-silk-rose/30 hover:bg-silk-rose/5 text-light-text dark:text-dark-text font-bold text-sm"><ArrowLeft className="w-4 h-4" />{bn ? "পিছনে" : "Back"}</button> : <div />}
              {step === 1 && <button onClick={() => setStep(2)} disabled={!image} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">{bn ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4" /></button>}
              {step === 2 && <button onClick={() => setStep(3)} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm">{bn ? "ডাউনলোড" : "Download"} <ArrowRight className="w-4 h-4" /></button>}
              {step === 3 && <button onClick={handleDownload} disabled={isDownloading} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50">{isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}{isDownloading ? "..." : "Download"}</button>}
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
