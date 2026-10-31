import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Loader2, X, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@contexts/LanguageContext";
import { cn } from "@lib/cn";
import { MAX_FILE_SIZE, MAX_PIXELS } from "./logic";

type OutputFormat = "image/jpeg" | "image/png";

interface WebpConverterWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WebpConverterWizard({ isOpen, onClose }: WebpConverterWizardProps) {
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
    if (isOpen) {
      setStep(1);
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setError(null);
    }
    return () => { if (preview) URL.revokeObjectURL(preview); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > MAX_FILE_SIZE) {
      setError(bn ? "ফাইল অনেক বড় (সর্বোচ্চ ৫০ MB)।" : "File is too large. Maximum size is 50MB.");
      return;
    }
    if (f.type !== "image/webp") {
      setError(bn ? "শুধু WebP ছবি আপলোড করুন।" : "Please upload a valid WebP image.");
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDownload = async () => {
    if (!preview || !imgRef.current || !file) return;
    if (imgRef.current.naturalWidth * imgRef.current.naturalHeight > MAX_PIXELS) {
      setError(bn ? "ছবির রেজোলিউশন অনেক বড়।" : "Image resolution is too large to process safely.");
      return;
    }
    setError(null);
    setIsProcessing(true);
    try {
      const img = imgRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      if (format === "image/jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
          format,
          0.95
        );
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format === "image/jpeg" ? "jpg" : "png";
      const baseName = file.name.replace(/\.[^.]+$/, "");
      a.download = `converted-${baseName}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Download failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const stepTitles: Record<number, string> = {
    1: bn ? "WebP আপলোড করুন" : "Upload WebP",
    2: bn ? "আউটপুট ফরম্যাট" : "Output Format",
    3: bn ? "ডাউনলোড" : "Download",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm sm:p-3" role="dialog" aria-modal="true">
      <div className="flex h-full w-full flex-col overflow-hidden bg-light-bg dark:bg-dark-bg sm:h-auto sm:max-h-[96vh] sm:max-w-3xl sm:rounded-2xl sm:border sm:border-silk-rose/25 sm:shadow-2xl">
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

        {file && preview && (
          <div className={cn("shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-b border-silk-rose/10 p-3 sm:p-4", step === 3 ? "min-h-[38vh] sm:min-h-[48vh]" : "min-h-[22vh] sm:min-h-[28vh]")}>
            <img
              ref={imgRef}
              src={preview}
              alt="Preview"
              className={cn("max-w-full object-contain rounded-lg shadow-sm", step === 3 ? "max-h-[36vh] sm:max-h-[46vh]" : "max-h-[20vh] sm:max-h-[26vh]")}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 1 && (
            <div>
              {file ? (
                <div className="text-center space-y-3 py-4">
                  <p className="text-sm font-bold text-light-text dark:text-dark-text">✓ {bn ? "WebP আপলোড হয়েছে" : "WebP uploaded"}</p>
                  <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary truncate">{file.name}</p>
                  <button type="button" onClick={() => { if (preview) URL.revokeObjectURL(preview); setFile(null); setPreview(null); }} className="text-sm text-silk-rose hover:underline font-bold">
                    {bn ? "অন্য ফাইল বেছে নিন" : "Choose different file"}
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
                  <input ref={fileInputRef} type="file" accept="image/webp" onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }} className="hidden" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-silk-rose/20 to-silk-gold/15 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-silk-rose" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-light-text dark:text-dark-text mb-1">{bn ? "WebP ফাইল আপলোড করুন" : "Upload WebP file"}</p>
                    <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? "ক্লিক বা টেনে আনুন · WebP · ৫০ MB" : "Click or drag · WebP · 50 MB"}</p>
                  </div>
                </motion.div>
              )}
              {error && <p className="text-center text-xs text-red-600 dark:text-red-400 mt-3">{error}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-bold text-light-text dark:text-dark-text mb-3">{bn ? "কোন ফরম্যাটে রূপান্তর করবেন?" : "Convert to which format?"}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormat("image/jpeg")} className={cn("py-4 rounded-xl border-2 font-bold transition-all text-left px-4", format === "image/jpeg" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 hover:border-silk-rose/40 text-light-text dark:text-dark-text")}>
                    <div className="text-lg">JPG</div>
                    <div className="text-xs font-normal mt-1 opacity-70">{bn ? "ছোট সাইজ" : "Smaller file size"}</div>
                  </button>
                  <button type="button" onClick={() => setFormat("image/png")} className={cn("py-4 rounded-xl border-2 font-bold transition-all text-left px-4", format === "image/png" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 hover:border-silk-rose/40 text-light-text dark:text-dark-text")}>
                    <div className="text-lg">PNG</div>
                    <div className="text-xs font-normal mt-1 opacity-70">{bn ? "লসলেস" : "Lossless"}</div>
                  </button>
                </div>
              </div>
              {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-bold text-light-text dark:text-dark-text mb-1">✓ {bn ? "ডাউনলোডের জন্য প্রস্তুত" : "Ready to download"}</p>
                <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-2">
                  {bn ? "ফরম্যাট:" : "Format:"} <span className="font-bold text-silk-rose">{format === "image/jpeg" ? "JPG" : "PNG"}</span>
                </p>
                <button type="button" onClick={() => setStep(2)} className="text-xs text-silk-rose hover:underline">
                  {bn ? "ফরম্যাট পরিবর্তন করুন" : "Change format"}
                </button>
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
              <button onClick={() => setStep(2)} disabled={!file} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">
                {bn ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === 2 && (
              <button onClick={() => setStep(3)} disabled={!file} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">
                {bn ? "ডাউনলোড" : "Download"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === 3 && (
              <button onClick={handleDownload} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isProcessing ? (bn ? "ডাউনলোড হচ্ছে..." : "Downloading...") : (bn ? "ডাউনলোড" : "Download")}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
