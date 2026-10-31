import { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { ArrowLeft, ArrowRight, Download, Loader2, X, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@contexts/LanguageContext";
import { cn } from "@lib/cn";
import { MAX_FILE_SIZE, MAX_TOTAL_SIZE, MAX_IMAGES, MAX_PIXELS, SUPPORTED_MIMES, readFileAsDataURL } from "./logic";

type PageSize = "a4" | "letter";

export function ImageToPdfWizardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isOpen) { setStep(1); setFiles([]); setThumbnails([]); setError(null); setProgress(0); } }, [isOpen]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const next: string[] = [];
      for (const f of files) {
        try { next.push(await readFileAsDataURL(f)); } catch {}
        if (cancelled) return;
      }
      if (!cancelled) setThumbnails(next);
    })();
    return () => { cancelled = true; };
  }, [files]);

  if (!isOpen) return null;

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    if (files.length + arr.length > MAX_IMAGES) { setError(bn ? `সর্বোচ্চ ${MAX_IMAGES}টি ছবি যোগ করা যাবে।` : `Maximum ${MAX_IMAGES} images allowed.`); return; }
    for (const f of arr) {
      if (f.size > MAX_FILE_SIZE) { setError(bn ? `${f.name} অনেক বড় (সর্বোচ্চ ৫০ MB)।` : `${f.name} is too large (max 50MB).`); return; }
      if (!SUPPORTED_MIMES.includes(f.type)) { setError(bn ? `${f.name}: শুধু JPG, PNG, WebP সাপোর্টেড।` : `${f.name}: only JPG, PNG, WebP supported.`); return; }
    }
    const total = [...files, ...arr].reduce((s, f) => s + f.size, 0);
    if (total > MAX_TOTAL_SIZE) { setError(bn ? "মোট সাইজ ২০০ MB এর বেশি।" : "Total size exceeds 200MB."); return; }
    setError(null); setFiles([...files, ...arr]);
  };

  const removeFile = (idx: number) => setFiles(files.filter((_, i) => i !== idx));

  const handleDownload = async () => {
    if (files.length === 0) return;
    setIsProcessing(true); setError(null); setProgress(0);
    try {
      const pdf = new jsPDF({ format: pageSize === "letter" ? "letter" : "a4" });
      let first = true;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dataUrl = await readFileAsDataURL(file);
        const img = new Image(); img.src = dataUrl;
        await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error(`Failed to decode ${file.name}`)); });
        if (img.width * img.height > MAX_PIXELS) throw new Error(`${file.name}: resolution too large (max 100MP).`);
        const pw = pdf.internal.pageSize.getWidth(); const ph = pdf.internal.pageSize.getHeight();
        const ir = img.width / img.height; const pr = pw / ph;
        let fw = pw, fh = pw / ir;
        if (ir < pr) { fh = ph; fw = ph * ir; }
        if (!first) pdf.addPage();
        const fmt = file.type === "image/png" ? "PNG" : "JPEG";
        pdf.addImage(dataUrl, fmt, 0, 0, fw, fh);
        first = false; setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      const blob = pdf.output("blob"); const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = `ahadex-images-${Date.now()}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) { setError(err instanceof Error ? err.message : "PDF failed"); }
    finally { setIsProcessing(false); }
  };

  const stepTitles: Record<number, string> = { 1: bn ? "ছবি আপলোড করুন" : "Upload Images", 2: bn ? "ছবি যাচাই করুন" : "Review Images", 3: bn ? "ডাউনলোড PDF" : "Download PDF" };

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
          <div className="h-[40%] md:h-auto md:w-1/2 shrink-0 bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-3 sm:p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-silk-rose/15">
            {files.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 w-full">
                {thumbnails.map((src, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden bg-white dark:bg-[#0A0B1E] border border-silk-rose/15 shadow-sm aspect-square flex items-center justify-center">
                    <img src={src} alt={`Image ${i + 1}`} className="max-w-full max-h-full object-contain" />
                    <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-light-textSecondary dark:text-dark-textSecondary">
                <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs px-4">{bn ? "ছবি আপলোড করলে এখানে প্রিভিউ দেখাবে" : "Upload images to see preview"}</p>
              </div>
            )}
          </div>

          <div className="flex-1 md:w-1/2 flex flex-col min-h-0 bg-white dark:bg-[#0A0B1E]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {step === 1 && (
                <div>
                  {files.length > 0 ? (
                    <div className="text-center space-y-3">
                      <p className="text-sm font-bold text-light-text dark:text-dark-text">✓ {bn ? `${files.length}টি ছবি যোগ হয়েছে` : `${files.length} image${files.length === 1 ? "" : "s"} added`}</p>
                      <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? `সর্বোচ্চ ${MAX_IMAGES}টি · ${(files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(1)} MB` : `Max ${MAX_IMAGES} · ${(files.reduce((s, f) => s + f.size, 0) / 1024 / 1024).toFixed(1)} MB`}</p>
                      <button onClick={() => setFiles([])} className="text-sm text-silk-rose hover:underline font-bold">{bn ? "সব মুছুন" : "Clear all"}</button>
                    </div>
                  ) : (
                    <motion.div onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()} className={cn("group relative flex flex-col items-center justify-center gap-4 p-8 cursor-pointer rounded-2xl border-2 border-dashed transition-all", isDragging ? "border-silk-rose bg-silk-rose/10" : "border-silk-rose/30 hover:border-silk-rose/50")}>
                      <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }} className="hidden" />
                      <div className="w-14 h-14 rounded-2xl bg-silk-rose/10 flex items-center justify-center"><Upload className="w-6 h-6 text-silk-rose" /></div>
                      <div className="text-center"><p className="font-bold text-light-text dark:text-dark-text">{bn ? "ছবি আপলোড করুন (একাধিক)" : "Upload images (multiple)"}</p><p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? "ক্লিক বা টেনে আনুন · JPG, PNG, WebP · সর্বোচ্চ ২০টি" : "Click or drag · JPG, PNG, WebP · Up to 20"}</p></div>
                    </motion.div>
                  )}
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400 mt-3">{error}</p>}
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-light-text dark:text-dark-text">{bn ? "ছবিগুলো (মুছতে পারেন)" : "Images (tap to remove)"}</p>
                    <button onClick={() => fileInputRef.current?.click()} className="text-xs font-bold text-silk-rose hover:underline">+ {bn ? "আরও যোগ করুন" : "Add more"}</button>
                    <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }} className="hidden" />
                  </div>
                  <ul className="space-y-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs bg-silk-rose/5 border border-silk-rose/15 p-2 rounded-lg">
                        <span className="w-6 h-6 rounded bg-silk-rose/15 text-silk-wine font-bold flex items-center justify-center shrink-0 text-[10px]">{i + 1}</span>
                        <span className="truncate flex-1 text-light-text dark:text-dark-text">{f.name}</span>
                        <span className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary shrink-0">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                        <button onClick={() => removeFile(i)} className="p-1 hover:bg-silk-rose/10 rounded"><X className="w-3.5 h-3.5 text-silk-rose" /></button>
                      </li>
                    ))}
                  </ul>
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400 mt-3">{error}</p>}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-sm font-bold text-light-text dark:text-dark-text mb-1">✓ {bn ? "প্রস্তুত" : "Ready"}</p>
                    <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-4">{bn ? `${files.length}টি ছবি · পেজ সাইজ বেছে নিন` : `${files.length} image${files.length === 1 ? "" : "s"} · Choose page size`}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setPageSize("a4")} className={cn("flex-1 py-3 rounded-xl border-2 font-bold transition-all", pageSize === "a4" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 text-light-textSecondary dark:text-dark-textSecondary hover:border-silk-rose/40")}>A4<span className="block text-[10px] font-normal mt-0.5 opacity-70">210 × 297 mm</span></button>
                    <button onClick={() => setPageSize("letter")} className={cn("flex-1 py-3 rounded-xl border-2 font-bold transition-all", pageSize === "letter" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 text-light-textSecondary dark:text-dark-textSecondary hover:border-silk-rose/40")}>Letter<span className="block text-[10px] font-normal mt-0.5 opacity-70">216 × 279 mm</span></button>
                  </div>
                  {isProcessing && (
                    <div className="mt-3">
                      <div className="w-full bg-silk-rose/15 rounded-full h-2"><div className="bg-silk-rose h-2 rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
                      <p className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary mt-1 text-center">{progress}%</p>
                    </div>
                  )}
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
                </div>
              )}
            </div>

            <footer className="shrink-0 px-4 py-3 border-t border-silk-rose/20 bg-white dark:bg-[#0A0B1E] flex items-center justify-between gap-3">
              {step > 1 ? <button onClick={() => setStep((step - 1) as any)} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-silk-rose/30 hover:bg-silk-rose/5 text-light-text dark:text-dark-text font-bold text-sm"><ArrowLeft className="w-4 h-4" />{bn ? "পিছনে" : "Back"}</button> : <div />}
              {step === 1 && <button onClick={() => setStep(2)} disabled={files.length === 0} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">{bn ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4" /></button>}
              {step === 2 && <button onClick={() => setStep(3)} disabled={files.length === 0} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed">{bn ? "ডাউনলোড" : "Download"} <ArrowRight className="w-4 h-4" /></button>}
              {step === 3 && <button onClick={handleDownload} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm disabled:opacity-50">{isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}{isProcessing ? "..." : "Download PDF"}</button>}
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
