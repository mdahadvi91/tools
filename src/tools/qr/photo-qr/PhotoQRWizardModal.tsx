import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Download, Loader2, X, Layers, Settings2, ImageIcon, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@contexts/LanguageContext";
import { cn } from "@lib/cn";
import {
  getPlatform, composePhoto, generatePreview,
  PLATFORMS, POSITIONS, QR_BACKGROUNDS,
  SIZE_RANGE, PADDING_RANGE,
  MAX_FILE_SIZE, ACCEPTED_TYPES, ACCEPT_ATTR,
} from "./logic";
import type { Position, QrBackground } from "./logic";
import { tools } from "@/data/tools";

const photoQrData = tools.find((t) => t.id === "photo-qr")!;
type DownloadFormat = "image/png" | "image/jpeg";

export function PhotoQRWizardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
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
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platform = useMemo(() => getPlatform(platformId) ?? getPlatform("whatsapp")!, [platformId]);
  const payload = useMemo(() => {
    try { return platform.buildPayload(values).trim(); } catch { return ""; }
  }, [platform, values]);
  const canProceed1 = Boolean(photoFile);
  const canProceed2 = Boolean(photoFile && payload);

  useEffect(() => { if (isOpen) setStep(1); }, [isOpen]);

  useEffect(() => {
    const requestId = ++requestRef.current;
    if (timerRef.current !== null) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    if (!isOpen || !photoFile || !payload) { setPreview(null); setGenerating(false); return; }
    setGenerating(true);
    timerRef.current = window.setTimeout(async () => {
      try {
        const nextPreview = await generatePreview({ photoFile, platform, values, position, sizePercent, padding, qrBackground });
        if (requestRef.current === requestId) { setPreview(nextPreview); setError(null); }
      } catch (cause) {
        if (requestRef.current === requestId) setError(cause instanceof Error ? cause.message : "Preview failed");
      } finally { if (requestRef.current === requestId) setGenerating(false); }
    }, 180);
    return () => {
      if (timerRef.current !== null) { window.clearTimeout(timerRef.current); timerRef.current = null; }
      if (requestRef.current === requestId) requestRef.current += 1;
    };
  }, [isOpen, photoFile, platform, values, position, sizePercent, padding, qrBackground, payload]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { if (step > 1) setStep((step - 1) as any); else onClose(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, step, onClose]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!photoFile || !payload || downloading) return;
    setDownloading(true); setError(null);
    try {
      const blob = await composePhoto({ photoFile, platform, values, position, sizePercent, padding, qrBackground }, downloadFormat);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const ext = downloadFormat === "image/png" ? "png" : "jpg";
      anchor.download = `${photoQrData.slug}-${Date.now()}.${ext}`;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Download failed");
    } finally { setDownloading(false); }
  };

  const handlePlatformChange = (id: string) => { setPlatformId(id); setValues({}); setError(null); };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(bn ? "শুধু JPG, PNG বা WebP ছবি নির্বাচন করুন।" : "Please select a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(bn ? "ফাইল অনেক বড় (সর্বোচ্চ ৫০ MB)।" : "File is too large (max 50 MB).");
      return;
    }
    setPhotoFile(file); setError(null);
  };

  const stepTitles: Record<number, string> = {
    1: bn ? "ছবি আপলোড করুন" : "Upload Photo",
    2: bn ? "প্ল্যাটফর্ম ও তথ্য" : "Platform & Details",
    3: bn ? "ডিজাইন স্টাইল" : "Design Style",
    4: bn ? "ডাউনলোড" : "Download",
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm sm:p-3" role="dialog" aria-modal="true">
      <div className="flex h-full w-full flex-col overflow-hidden bg-light-bg dark:bg-dark-bg sm:h-auto sm:max-h-[96vh] sm:max-w-5xl sm:rounded-2xl sm:border sm:border-silk-rose/25 sm:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-silk-rose/20 bg-white/90 px-4 py-3 dark:bg-dark-surface/90 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-silk-rose">
              {bn ? `ধাপ ${step}/4` : `STEP ${step}/4`}
            </p>
            <h2 className="truncate text-base font-bold text-light-text dark:text-dark-text sm:text-lg">
              {stepTitles[step]}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => (step > 1 ? setStep((step - 1) as any) : onClose())}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-silk-rose/20 bg-silk-rose/5 text-light-text dark:text-dark-text"
            aria-label={step > 1 ? "Back" : "Close"}
          >
            {step > 1 ? <ArrowLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </header>

        <div className={cn(
          "shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 border-b border-silk-rose/10 p-3 sm:p-4",
          step === 4 ? "min-h-[38vh] sm:min-h-[48vh]" : "min-h-[22vh] sm:min-h-[28vh]"
        )}>
          {photoFile ? (
            preview ? (
              <img
                src={preview}
                alt="Preview"
                className={cn(
                  "max-w-full object-contain rounded-lg shadow-sm",
                  step === 4 ? "max-h-[36vh] sm:max-h-[46vh]" : "max-h-[20vh] sm:max-h-[26vh]"
                )}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-xs">{bn ? "প্রিভিউ তৈরি হচ্ছে..." : "Generating preview..."}</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400 py-4">
              <ImageIcon className="w-12 h-12" />
              <p className="text-xs text-center px-4">{bn ? "ছবি আপলোড করলে এখানে প্রিভিউ দেখাবে" : "Upload a photo to see preview here"}</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 1 && (
            <div>
              {photoFile ? (
                <div className="text-center space-y-3 py-4">
                  <p className="text-sm font-bold text-light-text dark:text-dark-text">
                    {bn ? "ছবি আপলোড হয়েছে ✓" : "Photo uploaded ✓"}
                  </p>
                  <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary truncate">
                    {photoFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setPhotoFile(null); setPreview(null); }}
                    className="text-sm text-silk-rose hover:underline font-bold"
                  >
                    {bn ? "অন্য ছবি বেছে নিন" : "Choose different photo"}
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
                  className={cn(
                    "group relative flex flex-col items-center justify-center gap-4 p-8 sm:p-12 min-h-[200px] cursor-pointer rounded-2xl border-2 border-dashed transition-all",
                    isDragging ? "border-silk-rose bg-silk-rose/10" : "border-silk-rose/30 hover:border-silk-rose/50"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_ATTR}
                    onChange={(e) => { handleFiles(e.currentTarget.files); e.currentTarget.value = ""; }}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-silk-rose/20 to-silk-gold/15 flex items-center justify-center">
                    <Upload className="w-8 h-8 text-silk-rose" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-light-text dark:text-dark-text mb-1">
                      {bn ? "ছবি আপলোড করুন" : "Upload your photo"}
                    </p>
                    <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                      {bn ? "ক্লিক বা টেনে আনুন · JPG, PNG, WebP · ৫০ MB" : "Click or drag · JPG, PNG, WebP · 50 MB"}
                    </p>
                  </div>
                </motion.div>
              )}
              {error && <p className="text-center text-xs text-red-600 dark:text-red-400 mt-3">{error}</p>}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-silk-rose" />
                  <h3 className="font-bold text-sm text-light-text dark:text-dark-text">{bn ? "প্ল্যাটফর্ম" : "Platform"}</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {PLATFORMS.map((p) => {
                    const active = p.id === platformId;
                    const PIcon = p.Icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handlePlatformChange(p.id)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all",
                          active ? "bg-silk-rose/15 border-silk-rose/50" : "bg-silk-rose/5 border-silk-rose/15 hover:border-silk-rose/40"
                        )}
                      >
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${p.color}20`, color: p.color }}>
                          <PIcon />
                        </span>
                        <span className="text-[10px] font-bold text-center leading-tight truncate w-full">
                          {bn ? p.nameBn : p.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Settings2 className="w-4 h-4 text-silk-rose" />
                  <h3 className="font-bold text-sm text-light-text dark:text-dark-text">{bn ? "তথ্য" : "Details"}</h3>
                </div>
                <div className="space-y-3">
                  {platform.fields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs font-bold mb-1.5 text-light-text dark:text-dark-text">
                        {bn ? field.labelBn : field.label}
                      </label>
                      <input
                        type={field.type}
                        value={values[field.key] ?? ""}
                        onChange={(e) => setValues((c) => ({ ...c, [field.key]: e.target.value }))}
                        placeholder={bn ? field.placeholderBn : field.placeholder}
                        className="w-full h-11 px-3 rounded-xl text-sm bg-white/80 dark:bg-dark-surface/80 border border-silk-rose/20 focus:border-silk-rose/50 outline-none transition-all text-light-text dark:text-dark-text"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-sm mb-3 text-light-text dark:text-dark-text">📍 {bn ? "কোণা" : "Position"}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setPosition(pos.id)}
                      className={cn(
                        "h-10 rounded-xl border text-xs font-bold transition-all",
                        position === pos.id ? "bg-silk-rose/15 border-silk-rose/50 text-silk-wine dark:text-silk-rose-soft" : "bg-silk-rose/5 border-silk-rose/15 hover:border-silk-rose/40 text-light-textSecondary dark:text-dark-textSecondary"
                      )}
                    >
                      {bn ? pos.labelBn : pos.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm text-light-text dark:text-dark-text">{bn ? "সাইজ" : "Size"}</h3>
                  <span className="text-sm font-mono font-bold text-silk-rose px-2 py-0.5 rounded bg-silk-rose/10">{sizePercent}%</span>
                </div>
                <input type="range" min={SIZE_RANGE.min} max={SIZE_RANGE.max} step={SIZE_RANGE.step} value={sizePercent} onChange={(e) => setSizePercent(parseInt(e.target.value))} className="w-full accent-silk-rose" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm text-light-text dark:text-dark-text">{bn ? "প্যাডিং" : "Padding"}</h3>
                  <span className="text-sm font-mono font-bold text-silk-rose px-2 py-0.5 rounded bg-silk-rose/10">{padding}px</span>
                </div>
                <input type="range" min={PADDING_RANGE.min} max={PADDING_RANGE.max} step={PADDING_RANGE.step} value={padding} onChange={(e) => setPadding(parseInt(e.target.value))} className="w-full accent-silk-rose" />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-3 text-light-text dark:text-dark-text">🎨 {bn ? "ব্যাকগ্রাউন্ড" : "Background"}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {QR_BACKGROUNDS.map(({ id, Icon, label, labelBn }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setQrBackground(id)}
                      className={cn(
                        "flex items-center justify-center gap-1 h-10 rounded-xl border text-xs font-bold transition-all",
                        qrBackground === id ? "bg-silk-rose/15 border-silk-rose/50 text-silk-wine dark:text-silk-rose-soft" : "bg-silk-rose/5 border-silk-rose/15 hover:border-silk-rose/40 text-light-textSecondary dark:text-dark-textSecondary"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{bn ? labelBn : label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-bold text-light-text dark:text-dark-text mb-1">
                  {bn ? "✓ আপনার ছবি প্রস্তুত!" : "✓ Your photo is ready!"}
                </p>
                <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mb-5">
                  {bn ? "ফাইল ফরম্যাট বেছে নিন" : "Choose file format"}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setDownloadFormat("image/png")}
                    className={cn(
                      "flex-1 max-w-[180px] py-3 rounded-xl border-2 font-bold transition-all",
                      downloadFormat === "image/png" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 hover:border-silk-rose/40 text-light-text dark:text-dark-text"
                    )}
                  >
                    PNG
                    <span className="block text-[10px] font-normal mt-0.5 opacity-70">{bn ? "লসলেস" : "Lossless"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDownloadFormat("image/jpeg")}
                    className={cn(
                      "flex-1 max-w-[180px] py-3 rounded-xl border-2 font-bold transition-all",
                      downloadFormat === "image/jpeg" ? "border-silk-rose bg-silk-rose/10 text-silk-wine dark:text-silk-rose" : "border-silk-rose/20 hover:border-silk-rose/40 text-light-text dark:text-dark-text"
                    )}
                  >
                    JPG
                    <span className="block text-[10px] font-normal mt-0.5 opacity-70">{bn ? "ছোট সাইজ" : "Smaller"}</span>
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
              <button
                onClick={() => setStep((step - 1) as any)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-silk-rose/30 font-bold text-sm hover:bg-silk-rose/5 text-light-text dark:text-dark-text"
              >
                <ArrowLeft className="w-4 h-4" />
                {bn ? "পিছনে" : "Back"}
              </button>
            ) : <div />}

            {step === 1 && (
              <button onClick={() => setStep(2)} disabled={!canProceed1}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">
                {bn ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === 2 && (
              <button onClick={() => setStep(3)} disabled={!canProceed2}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">
                {bn ? "পরবর্তী" : "Next"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === 3 && (
              <button onClick={() => setStep(4)} disabled={!canProceed2}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">
                {bn ? "ডাউনলোড" : "Download"} <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {step === 4 && (
              <button onClick={handleDownload} disabled={downloading || generating}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {downloading ? (bn ? "ডাউনলোড হচ্ছে..." : "Downloading...") : (bn ? "ডাউনলোড" : "Download")}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
