import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Loader2, X, Upload, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@contexts/LanguageContext";
import { cn } from "@lib/cn";
import { MAX_FILE_SIZE, MAX_PIXELS, MAX_DIMENSION } from "./logic";

type DownloadFormat = "image/png" | "image/jpeg";

export function ImageResizerWizard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockRatio, setLockRatio] = useState(true);
  const [ratio, setRatio] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("image/png");
  const [isDragging, setIsDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isOpen) { setStep(1); setFile(null); setPreview(null); setWidth(0); setHeight(0); setError(null); } }, [isOpen]);
  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > MAX_FILE_SIZE) { setError(bn ? "ফাইল ৫০ MB এর বেশি।" : "File too large. Max 50MB."); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { setError("Invalid type"); return; }
    setError(null); setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => { setWidth(img.width); setHeight(img.height); setRatio(img.width / img.height); setPreview(event.target?.result as string); };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(f);
  };

  const handleWidthChange = (val: number) => { setWidth(val); if (lockRatio && ratio > 0) setHeight(Math.round(val / ratio)); };
  const handleHeightChange = (val: number) => { setHeight(val); if (lockRatio && ratio > 0) setWidth(Math.round(val * ratio)); };
  
  const validate = (): string | null => {
    if (width <= 0 || height <= 0) return bn ? "সাইজ ০ এর বেশি হতে হবে।" : "Size must be > 0.";
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) return `Max ${MAX_DIMENSION}px.`;
    if (width * height > MAX_PIXELS) return "Resolution too large.";
    return null;
  };

  const handleDownload = async () => {
    if (!preview || !imgRef.current || !file) return;
    const v = validate(); if (v) { setError(v); return; }
    setError(null); setIsProcessing(true);
    try {
      const img = imgRef.current;
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas failed");
      if (downloadFormat === "image/jpeg") { ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, width, height); }
      ctx.drawImage(img, 0, 0, width, height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Export failed"))), downloadFormat, downloadFormat === "image/jpeg" ? 0.95 : 1.0);
      });
      const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; const ext = downloadFormat === "image/png" ? "png" : "jpg";
      a.download = `resized-${file.name.replace(/\.[^.]+$/, "")}.${ext}`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (c) { setError(c instanceof Error ? c.message : "Failed"); }
    finally { setIsProcessing(false); }
  };

  const stepTitles: Record<number, string> = { 1: bn ? "ছবি আপলোড করুন" : "Upload Image", 2: bn ? "সাইজ নির্ধারণ" : "Set Size", 3: bn ? "ডাউনলোড" : "Download" };

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
                      <p className="text-sm font-bold text-light-text dark:text-dark-text">✓ {bn ? "ছবি আপলোড হয়েছে" : "Photo uploaded"}</p>
                      <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary truncate">{file.name}</p>
                      <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? "মূল:" : "Original:"} {width} × {height}px</p>
                      <button onClick={() => { setFile(null); setPreview(null); }} className="text-sm text-silk-rose hover:underline font-bold">{bn ? "অন্য ছবি" : "Change"}</button>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs font-bold mb-1.5 text-light-text dark:text-dark-text">{bn ? "প্রস্থ (px)" : "Width (px)"}</label><input type="number" value={width || ""} onChange={(e) => handleWidthChange(Number(e.target.value))} className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#0A0B1E] border border-silk-rose/20 focus:border-silk-rose/50 outline-none text-light-text dark:text-dark-text text-sm" /></div>
                    <div><label className="block text-xs font-bold mb-1.5 text-light-text dark:text-dark-text">{bn ? "উচ্চতা (px)" : "Height (px)"}</label><input type="number" value={height || ""} onChange={(e) => handleHeightChange(Number(e.target.value))} className="w-full h-11 px-3 rounded-xl bg-white dark:bg-[#0A0B1E] border border-silk-rose/20 focus:border-silk-rose/50 outline-none text-light-text dark:text-dark-text text-sm" /></div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={lockRatio} onChange={(e) => setLockRatio(e.target.checked)} className="w-4 h-4 accent-silk-rose" /><span className="text-sm text-light-text dark:text-dark-text">{bn ? "অনুপাত লক" : "Lock aspect ratio"}</span></label>
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-light-text dark:text-dark-text mb-1">✓ {bn ? "প্রস্তুত" : "Ready"}</p>
                    <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-4">{width} × {height}px</p>
                  </div>
                  
                  {/* PNG & JPG Buttons */}
                  <div className="flex gap-3 relative z-10">
                    <button 
                      type="button" 
                      onClick={() => setDownloadFormat("image/png")} 
                      className={cn(
                        "relative flex-1 rounded-xl border-2 py-4 font-bold transition-all cursor-pointer select-none", 
                        downloadFormat === "image/png" 
                          ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                          : "border-gray-300 text-gray-500 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400"
                      )}
                    >
                      {downloadFormat === "image/png" && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                      <span className="text-lg">PNG</span>
                      <span className="mt-1 block text-[10px] font-normal opacity-70">Lossless</span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setDownloadFormat("image/jpeg")} 
                      className={cn(
                        "relative flex-1 rounded-xl border-2 py-4 font-bold transition-all cursor-pointer select-none", 
                        downloadFormat === "image/jpeg" 
                          ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                          : "border-gray-300 text-gray-500 hover:border-gray-400 dark:border-gray-600 dark:text-gray-400"
                      )}
                    >
                      {downloadFormat === "image/jpeg" && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                      <span className="text-lg">JPG</span>
                      <span className="mt-1 block text-[10px] font-normal opacity-70">Smaller</span>
                    </button>
                  </div>
                  
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
                </div>
              )}
            </div>

            <footer className="shrink-0 px-4 py-3 border-t border-silk-rose/20 bg-white dark:bg-[#0A0B1E] flex items-center justify-between gap-3">
              {step > 1 ? <button onClick={() => setStep((step - 1) as any)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-silk-rose/30 hover:bg-silk-rose/5 text-light-text dark:text-dark-text font-bold text-sm"><ArrowLeft className="w-4 h-4" />{bn ? "পিছনে" : "Back"}</button> : <div />}
              
              {step === 1 && <button onClick={() => setStep(2)} disabled={!file} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">{bn ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4" /></button>}
              
              {step === 2 && <button onClick={() => { const v = validate(); if (v) { setError(v); return; } setError(null); setStep(3); }} disabled={!file || width <= 0 || height <= 0} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">{bn ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4" /></button>}
              
              {step === 3 && <button onClick={handleDownload} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}{isProcessing ? "..." : "Download"}</button>}
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
