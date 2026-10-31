import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Loader2, X, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@contexts/LanguageContext";
import { cn } from "@lib/cn";
import { MAX_FILE_SIZE, MAX_PIXELS } from "./logic";

type OutputFormat = "image/jpeg" | "image/png";

export function WebpConverterWizard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [format, setFormat] = useState<OutputFormat>("image/jpeg");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) { setStep(1); setFile(null); if (preview) URL.revokeObjectURL(preview); setPreview(null); setError(null); }
    return () => { if (preview) URL.revokeObjectURL(preview); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > MAX_FILE_SIZE) { setError(bn ? "ফাইল ৫০ MB এর বেশি।" : "File too large. Max 50MB."); return; }
    if (f.type !== "image/webp") { setError(bn ? "শুধু WebP ছবি।" : "Only WebP images."); return; }
    if (preview) URL.revokeObjectURL(preview);
    setError(null); setFile(f); setPreview(URL.createObjectURL(f));
  };

  const handleDownload = async () => {
    if (!preview || !imgRef.current || !file) return;
    if (imgRef.current.naturalWidth * imgRef.current.naturalHeight > MAX_PIXELS) { setError("Resolution too large."); return; }
    setError(null); setIsProcessing(true);
    try {
      const img = imgRef.current;
      const canvas = document.createElement("canvas"); canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas failed");
      if (format === "image/jpeg") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), format, 0.95);
      });
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; const ext = format === "image/jpeg" ? "jpg" : "png";
      a.download = `converted-${file.name.replace(/\.[^.]+$/, "")}.${ext}`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (c) { setError(c instanceof Error ? c.message : "Failed"); }
    finally { setIsProcessing(false); }
  };

  const stepTitles: Record<number, string> = { 1: bn ? "WebP আপলোড" : "Upload WebP", 2: bn ? "ফরম্যাট" : "Format", 3: bn ? "ডাউনলোড" : "Download" };

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
            {file && preview ? (
              <img ref={imgRef} src={preview} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
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
                  {file ? (
                    <div className="text-center space-y-3">
                      <p className="text-sm font-bold text-light-text dark:text-dark-text">✓ {bn ? "WebP আপলোড" : "WebP uploaded"}</p>
                      <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary truncate">{file.name}</p>
                      <button onClick={() => { if (preview) URL.revokeObjectURL(preview); setFile(null); setPreview(null); }} className="text-sm text-silk-rose hover:underline font-bold">{bn ? "অন্য ফাইল" : "Change"}</button>
                    </div>
                  ) : (
                    <motion.div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className={cn("group relative flex flex-col items-center justify-center gap-4 p-8 cursor-pointer rounded-2xl border-2 border-dashed transition-all", isDragging ? "border-silk-rose bg-silk-rose/10" : "border-silk-rose/30 hover:border-silk-rose/50")}>
                      <input ref={fileInputRef} type="file" accept="image/webp" onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }} className="hidden" />
                      <div className="w-14 h-14 rounded-2xl bg-silk-rose/10 flex items-center justify-center"><Upload className="w-6 h-6 text-silk-rose" /></div>
                      <div className="text-center"><p className="font-bold text-light-text dark:text-dark-text">{bn ? "WebP আপলোড" : "Upload WebP"}</p><p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? "WebP · ৫০ MB" : "WebP · 50 MB"}</p></div>
                    </motion.div>
                  )}
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400 mt-3">{error}</p>}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-light-text dark:text-dark-text">{bn ? "আউটপুট ফরম্যাট" : "Output format"}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setFormat("image/jpeg")} className={cn("py-4 rounded-xl border-2 font-bold transition-all text-left px-4", format === "image/jpeg" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 text-light-text dark:text-dark-text hover:border-silk-rose/40")}><div className="text-lg">JPG</div><div className="text-xs font-normal mt-1 opacity-70">Smaller</div></button>
                    <button onClick={() => setFormat("image/png")} className={cn("py-4 rounded-xl border-2 font-bold transition-all text-left px-4", format === "image/png" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 text-light-text dark:text-dark-text hover:border-silk-rose/40")}><div className="text-lg">PNG</div><div className="text-xs font-normal mt-1 opacity-70">Lossless</div></button>
                  </div>
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-light-text dark:text-dark-text mb-1">✓ {bn ? "প্রস্তুত" : "Ready"}</p>
                    <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? "ফরম্যাট:" : "Format:"} <span className="font-bold text-silk-rose">{format === "image/jpeg" ? "JPG" : "PNG"}</span></p>
                  </div>
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
                </div>
              )}
            </div>

            <footer className="shrink-0 px-4 py-3 border-t border-silk-rose/20 bg-white dark:bg-[#0A0B1E] flex items-center justify-between gap-3">
              {step > 1 ? <button onClick={() => setStep((step - 1) as any)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-silk-rose/30 hover:bg-silk-rose/5 text-light-text dark:text-dark-text font-bold text-sm"><ArrowLeft className="w-4 h-4" />{bn ? "পিছনে" : "Back"}</button> : <div />}
              {step === 1 && <button onClick={() => setStep(2)} disabled={!file} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">{bn ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4" /></button>}
              {step === 2 && <button onClick={() => setStep(3)} disabled={!file} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">{bn ? "ডাউনলোড" : "Download"} <ArrowRight className="w-4 h-4" /></button>}
              {step === 3 && <button onClick={handleDownload} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}{isProcessing ? "..." : "Download"}</button>}
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

// Note: File size limit is 50 * 1024 * 1024 bytes
