import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
  X,
  Settings2,
  Layers,
  ImageIcon,
  Upload,
  Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@contexts/LanguageContext";
import { cn } from "@lib/cn";
import { ToolButton } from "@components/workspace";
import {
  getPlatform,
  composePhoto,
  generatePreview,
  PLATFORMS,
  POSITIONS,
  QR_BACKGROUNDS,
  SIZE_RANGE,
  PADDING_RANGE,
  MAX_FILE_SIZE,
  ACCEPTED_TYPES,
  ACCEPT_ATTR,
} from "./logic";
import type { Position, QrBackground } from "./logic";
import { tools } from "@/data/tools";

const photoQrData = tools.find((t) => t.id === "photo-qr")!;

interface PhotoQRWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhotoQRWizardModal({ isOpen, onClose }: PhotoQRWizardModalProps) {
  const { language } = useLanguage();
  const bn = language === "bn";
  const [step, setStep] = useState<1 | 2>(1);
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
  const [isDragging, setIsDragging] = useState(false);
  const timerRef = useRef<number | null>(null);
  const requestRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platform = useMemo(
    () => getPlatform(platformId) ?? getPlatform("whatsapp")!,
    [platformId]
  );
  const payload = useMemo(() => {
    try {
      return platform.buildPayload(values).trim();
    } catch {
      return "";
    }
  }, [platform, values]);
  const canPreview = Boolean(photoFile && payload);

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  useEffect(() => {
    const requestId = ++requestRef.current;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isOpen || !photoFile || !payload) {
      setPreview(null);
      setGenerating(false);
      return;
    }
    setGenerating(true);
    timerRef.current = window.setTimeout(async () => {
      try {
        const nextPreview = await generatePreview({
          photoFile,
          platform,
          values,
          position,
          sizePercent,
          padding,
          qrBackground,
        });
        if (requestRef.current === requestId) {
          setPreview(nextPreview);
          setError(null);
        }
      } catch (cause) {
        if (requestRef.current === requestId)
          setError(cause instanceof Error ? cause.message : "Preview failed");
      } finally {
        if (requestRef.current === requestId) setGenerating(false);
      }
    }, 180);
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (requestRef.current === requestId) requestRef.current += 1;
    };
  }, [isOpen, photoFile, platform, values, position, sizePercent, padding, qrBackground, payload]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (step === 2) setStep(1);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, step, onClose]);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!photoFile || !payload || downloading) return;
    setDownloading(true);
    setError(null);
    try {
      const blob = await composePhoto({
        photoFile,
        platform,
        values,
        position,
        sizePercent,
        padding,
        qrBackground,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${photoQrData.slug}-${Date.now()}.png`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const handlePlatformChange = (id: string) => {
    setPlatformId(id);
    setValues({});
    setError(null);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(
        bn
          ? "শুধু JPG, PNG বা WebP ছবি নির্বাচন করুন।"
          : "Please select a JPG, PNG, or WebP image."
      );
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(
        bn ? "ফাইল অনেক বড় (সর্বোচ্চ ৫০ MB)।" : "File is too large (max 50 MB)."
      );
      return;
    }
    setPhotoFile(file);
    setError(null);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const PlatformIcon = platform.Icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm sm:p-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="photoqr-wizard-title"
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-light-bg dark:bg-dark-bg sm:h-auto sm:max-h-[96vh] sm:max-w-7xl sm:rounded-2xl sm:border sm:border-silk-rose/25 sm:shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-silk-rose/20 bg-white/90 px-4 py-3 dark:bg-dark-surface/90 sm:px-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-silk-rose">
              {bn ? `ধাপ ${step}/2` : `STEP ${step}/2`}
            </p>
            <h2
              id="photoqr-wizard-title"
              className="truncate text-base font-bold text-light-text dark:text-dark-text sm:text-lg"
            >
              {step === 1
                ? bn
                  ? "ছবি ও QR সম্পাদনা"
                  : "Edit Photo QR"
                : bn
                ? "লাইভ প্রিভিউ ও ডাউনলোড"
                : "Live Preview & Download"}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => (step === 2 ? setStep(1) : onClose())}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-silk-rose/20 bg-silk-rose/5 text-light-text dark:text-dark-text"
            aria-label={
              step === 2
                ? bn
                  ? "সম্পাদনায় ফিরে যান"
                  : "Back to editing"
                : bn
                ? "বন্ধ করুন"
                : "Close wizard"
            }
          >
            {step === 2 ? <ArrowLeft className="h-5 w-5" /> : <X className="h-5 w-5" />}
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
          {step === 1 ? (
            <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-[minmax(280px,0.85fr)_minmax(0,1.15fr)] sm:gap-5">
              {/* ============ SETTINGS PANEL (inlined) ============ */}
              <aside className="flex flex-col rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl border border-silk-rose/20 p-4 sm:p-5 space-y-5 h-full">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-silk-rose/15 border border-silk-rose/25 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5 text-silk-rose" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-silk-wine/70 dark:text-silk-rose/60">
                      {bn ? "প্ল্যাটফর্ম" : "Platform"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                    {PLATFORMS.map((p) => {
                      const active = p.id === platformId;
                      const PIcon = p.Icon;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handlePlatformChange(p.id)}
                          title={bn ? p.nameBn : p.name}
                          className={cn(
                            "flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all duration-200 min-w-0",
                            active
                              ? "bg-gradient-to-br from-silk-rose/15 via-silk-rose/8 to-silk-gold/10 border-silk-rose/50 shadow-[0_8px_20px_-10px_rgba(139,58,79,0.4)]"
                              : "bg-silk-rose/5 border-silk-rose/15 hover:border-silk-rose/40 hover:bg-silk-rose/8"
                          )}
                        >
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg sm:text-xl"
                            style={{ backgroundColor: `${p.color}20`, color: p.color }}
                          >
                            <PIcon />
                          </span>
                          <span className="text-[9px] sm:text-[10px] font-bold text-light-text dark:text-dark-text text-center leading-tight line-clamp-2 w-full">
                            {bn ? p.nameBn : p.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-silk-rose/15 border border-silk-rose/25 flex items-center justify-center">
                      <Settings2 className="w-3.5 h-3.5 text-silk-rose" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-silk-wine/70 dark:text-silk-rose/60">
                      {bn ? "তথ্য" : "Details"}
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {platform.fields.map((field) => (
                      <div key={field.key}>
                        <label
                          htmlFor={`field-${field.key}`}
                          className="block text-[11px] font-bold text-light-text dark:text-dark-text mb-1.5 leading-snug"
                        >
                          {bn ? field.labelBn : field.label}
                        </label>
                        <input
                          id={`field-${field.key}`}
                          type={field.type}
                          value={values[field.key] ?? ""}
                          onChange={(e) =>
                            setValues((current) => ({
                              ...current,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={bn ? field.placeholderBn : field.placeholder}
                          className={cn(
                            "w-full h-10 px-3 rounded-xl text-[13px]",
                            "bg-white/80 dark:bg-dark-surface/80",
                            "border border-silk-rose/20 focus:border-silk-rose/50",
                            "text-light-text dark:text-dark-text",
                            "placeholder:text-light-textSecondary/50 dark:placeholder:text-dark-textSecondary/40",
                            "outline-none transition-all"
                          )}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-silk-rose/15 border border-silk-rose/25 flex items-center justify-center">
                      <span className="text-xs">📍</span>
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-silk-wine/70 dark:text-silk-rose/60">
                      {bn ? "কোণা" : "Position"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {POSITIONS.map((pos) => {
                      const active = position === pos.id;
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => setPosition(pos.id)}
                          className={cn(
                            "h-9 rounded-xl border text-[11px] font-bold transition-all px-1 truncate",
                            active
                              ? "bg-silk-rose/15 border-silk-rose/50 text-silk-wine dark:text-silk-rose-soft"
                              : "bg-silk-rose/5 border-silk-rose/15 text-light-textSecondary dark:text-dark-textSecondary hover:border-silk-rose/40"
                          )}
                        >
                          {bn ? pos.labelBn : pos.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-silk-wine/70 dark:text-silk-rose/60">
                      {bn ? "সাইজ" : "Size"}
                    </span>
                    <span className="text-[12px] font-mono font-bold text-silk-rose px-2 py-0.5 rounded-md bg-silk-rose/10">
                      {sizePercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={SIZE_RANGE.min}
                    max={SIZE_RANGE.max}
                    step={SIZE_RANGE.step}
                    value={sizePercent}
                    onChange={(e) => setSizePercent(parseInt(e.target.value))}
                    className="w-full accent-silk-rose cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-silk-wine/70 dark:text-silk-rose/60">
                      {bn ? "প্যাডিং" : "Padding"}
                    </span>
                    <span className="text-[12px] font-mono font-bold text-silk-rose px-2 py-0.5 rounded-md bg-silk-rose/10">
                      {padding}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={PADDING_RANGE.min}
                    max={PADDING_RANGE.max}
                    step={PADDING_RANGE.step}
                    value={padding}
                    onChange={(e) => setPadding(parseInt(e.target.value))}
                    className="w-full accent-silk-rose cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-silk-rose/15 border border-silk-rose/25 flex items-center justify-center">
                      <span className="text-xs">🎨</span>
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-silk-wine/70 dark:text-silk-rose/60">
                      {bn ? "ব্যাকগ্রাউন্ড" : "Background"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {QR_BACKGROUNDS.map(({ id, Icon, label, labelBn }) => {
                      const active = qrBackground === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setQrBackground(id)}
                          className={cn(
                            "flex items-center justify-center gap-1 h-9 rounded-xl border text-[11px] font-bold transition-all px-1",
                            active
                              ? "bg-silk-rose/15 border-silk-rose/50 text-silk-wine dark:text-silk-rose-soft"
                              : "bg-silk-rose/5 border-silk-rose/15 text-light-textSecondary dark:text-dark-textSecondary hover:border-silk-rose/40"
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{bn ? labelBn : label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-[12px] font-medium text-red-600 dark:text-red-400">
                    {error}
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-silk-rose/10">
                  <ToolButton
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={generating}
                    disabled={!canPreview || generating}
                    icon={<Download className="w-4 h-4" />}
                    onClick={handleDownload}
                  >
                    {generating
                      ? bn
                        ? "তৈরি হচ্ছে..."
                        : "Generating..."
                      : bn
                      ? "PNG ডাউনলোড"
                      : "Download PNG"}
                  </ToolButton>
                </div>
              </aside>

              {/* ============ PREVIEW PANEL (inlined) ============ */}
              <main className="flex flex-col rounded-2xl sm:rounded-3xl bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl border border-silk-rose/20 overflow-hidden h-full">
                {!photoFile ? (
                  /* ============ UPLOAD ZONE (inlined) ============ */
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        fileInputRef.current?.click();
                      }
                    }}
                    className={cn(
                      "group relative flex flex-col items-center justify-center gap-5 p-6 sm:p-16 h-full min-h-[380px] sm:min-h-[520px] cursor-pointer overflow-hidden",
                      "transition-all duration-300",
                      isDragging && "bg-silk-rose/10"
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 pointer-events-none transition-opacity duration-500",
                        isDragging ? "opacity-100" : "opacity-0"
                      )}
                      style={{
                        background:
                          "radial-gradient(circle at center, rgba(216,139,154,0.18) 0%, transparent 65%)",
                      }}
                    />
                    <span aria-hidden="true" className="absolute top-4 left-4 w-2 h-2 rounded-full bg-silk-rose/30" />
                    <span aria-hidden="true" className="absolute top-4 right-4 w-2 h-2 rounded-full bg-silk-rose/30" />
                    <span aria-hidden="true" className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-silk-rose/30" />
                    <span aria-hidden="true" className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-silk-rose/30" />

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPT_ATTR}
                      onChange={(e) => {
                        handleFiles(e.currentTarget.files);
                        e.currentTarget.value = "";
                      }}
                      className="hidden"
                    />

                    <div className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-3xl bg-silk-rose/30 blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                      />
                      <div
                        className={cn(
                          "relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center transition-all duration-500",
                          "bg-gradient-to-br from-silk-rose/20 via-silk-rose/10 to-silk-gold/15",
                          "border border-silk-rose/30",
                          "shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]",
                          isDragging && "scale-110 rotate-3 border-silk-rose/60"
                        )}
                      >
                        <Upload className="w-8 h-8 sm:w-10 sm:h-10 text-silk-rose" />
                      </div>
                    </div>

                    <div className="relative text-center px-3 max-w-sm">
                      <p className="font-serif font-black text-[17px] sm:text-xl text-light-text dark:text-dark-text mb-2 tracking-[-0.01em] leading-tight">
                        {bn ? "আপনার ছবি আপলোড করুন" : "Upload your photo"}
                      </p>
                      <p className="text-[12px] sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                        {bn
                          ? "ক্লিক করুন বা টেনে আনুন · JPG, PNG, WebP · ৫০ MB পর্যন্ত"
                          : "Click or drag · JPG, PNG, WebP · Up to 50 MB"}
                      </p>
                    </div>

                    <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-silk-rose/10 border border-silk-rose/25 text-[11px] font-bold text-silk-wine dark:text-silk-rose-soft group-hover:bg-silk-rose/20 group-hover:border-silk-rose/45 transition-all">
                      <ImageIcon className="w-3.5 h-3.5" />
                      {bn ? "ছবি নির্বাচন করুন" : "Choose photo"}
                    </div>

                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-500",
                        "bg-gradient-to-r from-transparent via-silk-rose to-transparent",
                        isDragging
                          ? "w-56 opacity-100"
                          : "w-24 opacity-50 group-hover:w-40 group-hover:opacity-80"
                      )}
                    />
                  </motion.div>
                ) : (
                  <div className="p-4 sm:p-5 lg:p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between gap-3 mb-4 shrink-0">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-silk-rose/15 border border-silk-rose/25 flex items-center justify-center shrink-0">
                          <PlatformIcon
                            size={16}
                            color={platform.color}
                            className="shrink-0"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-silk-wine/70 dark:text-silk-rose/60">
                            {bn ? "প্রিভিউ" : "Preview"}
                          </p>
                          <p className="text-[11px] font-bold text-light-text dark:text-dark-text truncate">
                            {bn ? platform.nameBn : platform.name}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoFile(null);
                          setPreview(null);
                          setError(null);
                        }}
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-[11px] font-bold text-silk-rose bg-silk-rose/10 border border-silk-rose/25 hover:bg-silk-rose/20 hover:border-silk-rose/45 transition-all shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {bn ? "ছবি বদলান" : "Change photo"}
                        </span>
                        <span className="sm:hidden">{bn ? "বদলান" : "Change"}</span>
                      </button>
                    </div>

                    <div
                      className={cn(
                        "relative flex-1 rounded-2xl overflow-hidden flex items-center justify-center min-h-[240px] sm:min-h-[440px]",
                        "border border-silk-rose/15",
                        "bg-[conic-gradient(at_top_left,_rgba(216,139,154,0.12)_25%,_transparent_25%_50%,_rgba(216,139,154,0.12)_50%_75%,_transparent_75%)] bg-[length:18px_18px]"
                      )}
                    >
                      {preview ? (
                        <img
                          src={preview}
                          alt="Preview"
                          className="max-w-full max-h-[420px] sm:max-h-[600px] object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 py-10 text-light-textSecondary dark:text-dark-textSecondary">
                          <Loader2 className="w-6 h-6 animate-spin text-silk-rose" />
                          <p className="text-[12px] font-medium">
                            {bn ? "তৈরি হচ্ছে..." : "Generating preview..."}
                          </p>
                        </div>
                      )}
                      {generating && preview && (
                        <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-full bg-silk-rose/95 text-white text-[10px] font-bold flex items-center gap-1.5 shadow-[0_8px_20px_-6px_rgba(139,58,79,0.5)] backdrop-blur">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {bn ? "তৈরি হচ্ছে" : "Rendering"}
                        </div>
                      )}
                      {!preview && !generating && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                          <Eye className="w-16 h-16 text-silk-rose/40" />
                        </div>
                      )}
                    </div>

                    <div className="mt-4 shrink-0">
                      {!payload ? (
                        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                          <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-center leading-tight">
                            {bn
                              ? "বাম দিকে তথ্য লিখুন, QR দেখতে পাবেন"
                              : "Fill in the fields to see the QR"}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-center leading-tight">
                            {bn
                              ? "প্রিভিউ রেডি — ডাউনলোড করুন"
                              : "Preview ready — download below"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </main>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-4">
              <div
                className={cn(
                  "relative flex min-h-[300px] w-full items-center justify-center overflow-hidden rounded-2xl border border-silk-rose/20 p-3 sm:min-h-[55vh] sm:p-6",
                  "bg-[conic-gradient(at_top_left,_rgba(216,139,154,0.12)_25%,_transparent_25%_50%,_rgba(216,139,154,0.12)_50%_75%,_transparent_75%)] bg-[length:20px_20px]"
                )}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt={
                      bn
                        ? "ছবির QR কোডের লাইভ প্রিভিউ"
                        : "Live preview of photo with QR code"
                    }
                    className={cn(
                      "max-h-[62vh] max-w-full object-contain shadow-lg",
                      generating && "opacity-50"
                    )}
                  />
                ) : (
                  <p className="px-5 text-center text-sm text-light-textSecondary dark:text-dark-textSecondary">
                    {bn
                      ? "প্রিভিউ দেখতে ছবি ও প্রয়োজনীয় তথ্য যোগ করুন।"
                      : "Upload a photo and complete the required details to see the preview."}
                  </p>
                )}
                {generating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[2px] dark:bg-black/35">
                    <Loader2 className="h-8 w-8 animate-spin text-silk-rose" />
                  </div>
                )}
              </div>
              {error && (
                <p
                  role="alert"
                  className="w-full rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </p>
              )}
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-silk-rose/30 px-5 font-bold text-light-text transition hover:bg-silk-rose/5 dark:text-dark-text"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {bn ? "সম্পাদনায় ফিরে যান" : "Back to editing"}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!canPreview || generating || downloading}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-silk-wine px-6 font-bold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  {downloading
                    ? bn
                      ? "তৈরি হচ্ছে..."
                      : "Preparing PNG..."
                    : bn
                    ? "PNG ডাউনলোড"
                    : "Download PNG"}
                </button>
              </div>
              {!canPreview && (
                <p className="text-center text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  {bn
                    ? "আগে ছবি আপলোড করে QR-এর প্রয়োজনীয় তথ্য পূরণ করুন।"
                    : "Upload a photo and fill in the required QR details first."}
                </p>
              )}
            </div>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-silk-rose/20 bg-white/90 px-4 py-3 dark:bg-dark-surface/90 sm:px-6">
          <span className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
            {step === 1
              ? bn
                ? "১. সম্পাদনা"
                : "1. Edit"
              : bn
              ? "২. প্রিভিউ"
              : "2. Preview"}
          </span>
          {step === 1 ? (
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canPreview}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-silk-wine px-5 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bn ? "প্রিভিউ দেখুন" : "Review preview"}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 font-semibold text-light-textSecondary transition hover:bg-silk-rose/10 dark:text-dark-textSecondary"
            >
              {bn ? "বন্ধ করুন" : "Close"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
