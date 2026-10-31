import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Loader2, X, Layers, Settings2, ImageIcon, Upload, Check } from "lucide-react";
import { useLanguage } from "@contexts/LanguageContext";
import { cn } from "@lib/cn";
import { getPlatform, composePhoto, generatePreview, PLATFORMS, POSITIONS, QR_BACKGROUNDS, SIZE_RANGE, PADDING_RANGE, MAX_FILE_SIZE, ACCEPTED_TYPES, ACCEPT_ATTR } from "./logic";
import type { Position, QrBackground } from "./logic";

const TOOL_SLUG = "photo-qr";
type DownloadFormat = "image/png" | "image/jpeg";
type WizardStep = 1 | 2 | 3 | 4;

interface PhotoQRWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoQRWizardModal({ isOpen, onClose }: PhotoQRWizardModalProps) {
  const { language } = useLanguage();
  const bn = language === "bn";
    const uploadInputId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const previewUrlRef = useRef<string | null>(null);

  const [step, setStep] = useState<WizardStep>(1);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [platformId, setPlatformId] = useState("whatsapp");
  const [values, setValues] = useState<Record<string, string>>({});
  const [position, setPosition] = useState<Position>("bottom-right");
  const [sizePercent, setSizePercent] = useState(20);
  const [padding, setPadding] = useState(10);
  const [qrBackground, setQrBackground] = useState<QrBackground>("rounded");
  
  const [preview, setPreview] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>("image/png");

  const platform = useMemo(() => getPlatform(platformId) ?? getPlatform("whatsapp")!, [platformId]);
  const payload = useMemo(() => { try { return platform.buildPayload(values).trim(); } catch { return ""; } }, [platform, values]);
  const canProceed2 = Boolean(photoFile && platform && payload);

  const clearPreviewUrl = useCallback(() => {
    if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
    setPreview(null);
  }, []);

  const resetWizard = useCallback(() => {
    requestRef.current += 1;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setStep(1); setPhotoFile(null); setPlatformId("whatsapp"); setValues({}); setPosition("bottom-right"); setSizePercent(20); setPadding(10); setQrBackground("rounded"); setError(null); setDownloading(false); setDownloadFormat("image/png");
    clearPreviewUrl();
  }, [clearPreviewUrl]);

  const handleClose = useCallback(() => { resetWizard(); onClose(); }, [onClose, resetWizard]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); handleClose(); }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])');
      const elements = Array.from(focusable).filter(el => el.offsetParent !== null);
      if (elements.length === 0) { e.preventDefault(); return; }
      const first = elements[0], last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen || !photoFile) { clearPreviewUrl(); return; }
    const requestId = ++requestRef.current;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setGenerating(true); setError(null);
    
    timerRef.current = window.setTimeout(async () => {
      try {
        const nextPreview = await generatePreview({ photoFile, platform, values, position, sizePercent, padding, qrBackground });
        if (requestRef.current === requestId) {
          clearPreviewUrl();
          previewUrlRef.current = nextPreview;
          setPreview(nextPreview);
          setError(null);
        }
      } catch (cause) {
        if (requestRef.current === requestId) {
          clearPreviewUrl();
          if (payload) setError(cause instanceof Error ? cause.message : bn ? "প্রিভিউ তৈরি করা যায়নি।" : "Could not generate preview.");
        }
      } finally {
        if (requestRef.current === requestId) setGenerating(false);
      }
    }, 250);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [isOpen, photoFile, platform, values, position, sizePercent, padding, qrBackground, payload, bn, clearPreviewUrl]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); clearPreviewUrl(); };
  }, [isOpen, clearPreviewUrl]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!ACCEPTED_TYPES.some((type) => type === file.type)) { setError(bn ? "শুধু JPG, PNG অথবা WebP ছবি নির্বাচন করুন।" : "Please select a JPG, PNG, or WebP image."); return; }
    if (file.size > MAX_FILE_SIZE) { setError(bn ? "ফাইলের আকার সর্বোচ্চ ৫০ MB হতে পারবে।" : "Maximum size is 50 MB."); return; }
    requestRef.current += 1;
    setPhotoFile(file); setError(null);
  };

  const handleDownload = async () => {
    if (!photoFile || !payload || downloading) return;
    setDownloading(true); setError(null);
    try {
      const finalFormat = downloadFormat === "image/jpeg" ? "image/jpeg" : "image/png";
      const ext = finalFormat === "image/jpeg" ? "jpg" : "png";
      
      const blob = await composePhoto({ photoFile, platform, values, position, sizePercent, padding, qrBackground }, finalFormat);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${TOOL_SLUG}-${Date.now()}.${ext}`;
      document.body.appendChild(anchor); 
      anchor.click(); 
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (cause) { 
      setError(cause instanceof Error ? cause.message : "Download failed."); 
    } finally { 
      setDownloading(false); 
    }
  };

  const nextStep = () => {
    setError(null);
    if (step === 1 && photoFile) setStep(2);
    if (step === 2 && canProceed2) setStep(3);
    if (step === 3 && canProceed2) setStep(4);
  };

  const previousStep = () => {
    setError(null);
    setStep((current) => (current > 1 ? (current - 1) as WizardStep : 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" className="flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-[#0A0B1E] sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-2xl">
        
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-silk-rose/20 px-4 py-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-silk-rose">{bn ? `ধাপ ${step}/4` : `STEP ${step}/4`}</p>
            <h2 className="text-base font-bold text-light-text dark:text-dark-text sm:text-lg">
              {step === 1 && (bn ? "ছবি আপলোড করুন" : "Upload Photo")}
              {step === 2 && (bn ? "প্ল্যাটফর্ম ও তথ্য" : "Platform & Details")}
              {step === 3 && (bn ? "ডিজাইন স্টাইল" : "Design Style")}
              {step === 4 && (bn ? "ডাউনলোড" : "Download")}
            </h2>
          </div>
          <button ref={closeButtonRef} onClick={handleClose} className="flex h-10 w-10 items-center justify-center rounded-xl bg-silk-rose/10 text-silk-wine hover:bg-silk-rose/20 dark:text-silk-rose"><X className="h-5 w-5" /></button>
        </header>

        {/* Body: Desktop 2-Col, Mobile 1-Col */}
        <div className="flex flex-col md:flex-row min-h-0 flex-1">
          
          {/* Preview Side */}
          <section className="flex min-h-[250px] max-h-[40vh] shrink-0 items-center justify-center border-b border-silk-rose/15 bg-gray-100 p-4 dark:bg-gray-900 md:max-h-none md:min-h-0 md:w-1/2 md:border-b-0 md:border-r">
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain shadow-sm" />
            ) : generating ? (
              <div className="flex flex-col items-center text-light-textSecondary dark:text-dark-textSecondary">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-xs">{bn ? "প্রিভিউ তৈরি হচ্ছে..." : "Generating preview..."}</p>
              </div>
            ) : (
              <div className="text-center text-light-textSecondary dark:text-dark-textSecondary">
                <ImageIcon className="mx-auto mb-2 h-10 w-10 opacity-50" />
                <p className="text-xs">{bn ? "ছবি আপলোড করলে এখানে প্রিভিউ দেখাবে" : "Upload a photo to see the preview here"}</p>
              </div>
            )}
          </section>

          {/* Settings Side */}
          <div className="flex min-h-0 flex-1 flex-col md:w-1/2 bg-white dark:bg-[#0A0B1E]">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              
              {step === 1 && (
                <section className="space-y-4">
                  {photoFile ? (
                    <div className="text-center space-y-3">
                      <p className="text-sm font-bold text-light-text dark:text-dark-text">✓ {bn ? "ছবি নির্বাচন করা হয়েছে" : "Photo selected"}</p>
                      <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary truncate">{photoFile.name}</p>
                      <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">{(photoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <button onClick={() => fileInputRef.current?.click()} className="text-sm font-bold text-silk-rose hover:underline">{bn ? "অন্য ছবি নির্বাচন করুন" : "Choose another photo"}</button>
                    </div>
                  ) : (
                    <div className="group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-silk-rose/30 p-8 transition-colors hover:border-silk-rose/50">
                      <input ref={fileInputRef} id={uploadInputId} type="file" accept={ACCEPT_ATTR} onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }} className="sr-only" />
                      <label htmlFor={uploadInputId} className="flex w-full cursor-pointer flex-col items-center gap-4">
                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-silk-rose/10"><Upload className="h-6 w-6 text-silk-rose" /></span>
                        <span className="text-center">
                          <span className="block font-bold text-light-text dark:text-dark-text">{bn ? "ছবি নির্বাচন করুন" : "Choose a photo"}</span>
                          <span className="mt-1 block text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? "JPG, PNG, WebP · সর্বোচ্চ ৫০ MB" : "JPG, PNG, WebP · Maximum 50 MB"}</span>
                        </span>
                      </label>
                    </div>
                  )}
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
                </section>
              )}

              {step === 2 && (
                <section className="space-y-5">
                  <div>
                    <div className="mb-2 flex items-center gap-2"><Layers className="h-4 w-4 text-silk-rose" /><h3 className="text-sm font-bold text-light-text dark:text-dark-text">{bn ? "প্ল্যাটফর্ম" : "Platform"}</h3></div>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {PLATFORMS.map((item) => {
                        const active = item.id === platformId;
                        const PlatformIcon = item.Icon;
                        return (
                          <button key={item.id} onClick={() => { setPlatformId(item.id); setValues({}); setError(null); }} className={cn("flex flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors", active ? "border-silk-rose/50 bg-silk-rose/15" : "border-silk-rose/15 bg-silk-rose/5 hover:border-silk-rose/40")}>
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${item.color}20`, color: item.color }}><PlatformIcon className="h-4 w-4" /></span>
                            <span className="w-full truncate text-center text-[10px] font-bold leading-tight text-light-text dark:text-dark-text">{bn ? item.nameBn : item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-2"><Settings2 className="h-4 w-4 text-silk-rose" /><h3 className="text-sm font-bold text-light-text dark:text-dark-text">{bn ? "তথ্য" : "Details"}</h3></div>
                    <div className="space-y-3">
                      {platform?.fields.map((field) => (
                        <div key={field.key}>
                          <label className="mb-1.5 block text-xs font-bold text-light-text dark:text-dark-text">{bn ? field.labelBn : field.label}</label>
                          <input type={field.type} value={values[field.key] ?? ""} onChange={(e) => setValues((c) => ({ ...c, [field.key]: e.target.value }))} placeholder={bn ? field.placeholderBn : field.placeholder} className="h-11 w-full rounded-xl border border-silk-rose/20 bg-white px-3 text-sm text-light-text outline-none transition focus:border-silk-rose/60 focus:ring-2 focus:ring-silk-rose/20 dark:bg-[#0A0B1E] dark:text-dark-text" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                </section>
              )}

              {step === 3 && (
                <section className="space-y-5">
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-light-text dark:text-dark-text">📍 {bn ? "অবস্থান" : "Position"}</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {POSITIONS.map((item) => (
                        <button key={item.id} onClick={() => setPosition(item.id)} className={cn("h-10 rounded-xl border text-xs font-bold transition-colors", position === item.id ? "border-silk-rose/50 bg-silk-rose/15 text-silk-wine dark:text-silk-rose-soft" : "border-silk-rose/15 bg-silk-rose/5 text-light-textSecondary hover:border-silk-rose/40 dark:text-dark-textSecondary")}>{bn ? item.labelBn : item.label}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between"><label className="text-sm font-bold text-light-text dark:text-dark-text">{bn ? "সাইজ" : "Size"}</label><output className="rounded bg-silk-rose/10 px-2 py-0.5 font-mono text-sm font-bold text-silk-rose">{sizePercent}%</output></div>
                    <input type="range" min={SIZE_RANGE.min} max={SIZE_RANGE.max} step={SIZE_RANGE.step} value={sizePercent} onChange={(e) => setSizePercent(Number(e.target.value))} className="w-full accent-silk-rose" />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between"><label className="text-sm font-bold text-light-text dark:text-dark-text">{bn ? "প্যাডিং" : "Padding"}</label><output className="rounded bg-silk-rose/10 px-2 py-0.5 font-mono text-sm font-bold text-silk-rose">{padding}px</output></div>
                    <input type="range" min={PADDING_RANGE.min} max={PADDING_RANGE.max} step={PADDING_RANGE.step} value={padding} onChange={(e) => setPadding(Number(e.target.value))} className="w-full accent-silk-rose" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-light-text dark:text-dark-text">🎨 {bn ? "ব্যাকগ্রাউন্ড" : "Background"}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {QR_BACKGROUNDS.map((item) => {
                        const active = qrBackground === item.id;
                        const BackgroundIcon = item.Icon;
                        return (
                          <button key={item.id} onClick={() => setQrBackground(item.id)} className={cn("flex h-10 items-center justify-center gap-1 rounded-xl border text-xs font-bold transition-colors", active ? "border-silk-rose/50 bg-silk-rose/15 text-silk-wine dark:text-silk-rose-soft" : "border-silk-rose/15 bg-silk-rose/5 text-light-textSecondary hover:border-silk-rose/40 dark:text-dark-textSecondary")}>
                            <BackgroundIcon className="h-4 w-4" />
                            <span>{bn ? item.labelBn : item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                </section>
              )}

              {step === 4 && (
                <section className="space-y-6">
                  <div className="text-center">
                    <p className="mb-1 text-sm font-bold text-light-text dark:text-dark-text">✓ {bn ? "প্রস্তুত" : "Ready"}</p>
                    <p className="mb-4 text-xs text-light-textSecondary dark:text-dark-textSecondary">{bn ? "ফাইল ফরম্যাট বেছে নিন" : "Choose file format"}</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setDownloadFormat("image/png")} 
                      className={cn(
                        "relative flex-1 rounded-xl border-2 py-4 font-bold transition-all cursor-pointer select-none", 
                        downloadFormat === "image/png" 
                          ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                          : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                      )}
                    >
                      {downloadFormat === "image/png" && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                      <span className="text-lg">PNG</span>
                      <span className="mt-1 block text-[10px] font-normal opacity-70">
                        {bn ? "স্বচ্ছতা সমর্থন করে" : "Supports transparency"}
                      </span>
                    </button>
                    
                    <button 
                      type="button" 
                      onClick={() => setDownloadFormat("image/jpeg")} 
                      className={cn(
                        "relative flex-1 rounded-xl border-2 py-4 font-bold transition-all cursor-pointer select-none", 
                        downloadFormat === "image/jpeg" 
                          ? "border-red-600 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                          : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400"
                      )}
                    >
                      {downloadFormat === "image/jpeg" && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                      <span className="text-lg">JPG</span>
                      <span className="mt-1 block text-[10px] font-normal opacity-70">
                        {bn ? "ছোট ফাইল হতে পারে" : "Can produce smaller files"}
                      </span>
                    </button>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={handleDownload} 
                    disabled={downloading || generating || !canProceed2} 
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-4 text-sm font-bold text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    {downloading ? (bn ? "ডাউনলোড হচ্ছে..." : "Downloading...") : (bn ? "ডাউনলোড করুন" : "Download")}
                  </button>
                  {error && <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>}
                </section>
              )}
            </div>
            
            {/* Footer */}
            <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-silk-rose/20 bg-white px-4 py-3 dark:bg-[#0A0B1E]">
              {step > 1 ? (
                <button type="button" onClick={previousStep} className="flex items-center gap-2 rounded-xl border border-silk-rose/30 px-4 py-3 text-sm font-bold text-light-text transition hover:bg-silk-rose/5 dark:text-dark-text"><ArrowLeft className="h-4 w-4" />{bn ? "পিছনে" : "Back"}</button>
              ) : <span />}
              
              {step < 4 && (
                <button type="button" onClick={nextStep} disabled={(step === 1 && !photoFile) || (step > 1 && !canProceed2)} className="flex min-h-12 items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-60">
                  {bn ? "পরবর্তী" : "Next"} <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
