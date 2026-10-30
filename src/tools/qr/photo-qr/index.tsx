import { useEffect, useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Gift,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackRecentTool } from "@lib/recentTools";
import { ToolDataSections } from "@components/tools/ToolDataSections";
import { RelatedToolsBlock } from "@components/tools/RelatedToolsBlock";
import { useLanguage } from "@contexts/LanguageContext";
import { useReducedMotion } from "@hooks/useReducedMotion";
import { Hero } from "./Hero";
import { ToolSchema } from "@components/seo/ToolSchema";
import { ToolFieldNote } from "@components/tools/ToolFieldNote";
import { photoQrContent } from "./content";
import { ToolBreadcrumb } from "@components/tools/ToolBreadcrumb";
import { AdSenseSlot } from "@components/ads/AdSenseSlot";
import { AD_SLOTS } from "@constants/ads";
import { PhotoQRWizardModal } from "./PhotoQRWizardModal";
import { cn } from "@lib/cn";

const ICON_MAP = { sparkle: Sparkles, shield: Shield, gift: Gift, lock: Lock };

/* ============================================================
 * SmartInsights (inlined)
 * ============================================================ */
function SmartInsights({ sizePercent }: { sizePercent: number }) {
  const isGoodSize = sizePercent >= 15;
  return (
    <div className="mt-4 mb-6 rounded-2xl border border-silk-rose/20 bg-gradient-to-br from-silk-rose/5 to-transparent p-5 shadow-sm max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-silk-gold" />
        <h3 className="font-serif font-black text-lg text-light-text dark:text-dark-text">
          AHADEX Smart Insights
        </h3>
      </div>
      <div className="flex items-start gap-3">
        {isGoodSize ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        )}
        <div>
          <p className="text-sm font-bold text-light-text dark:text-dark-text">
            {isGoodSize ? "Good Size for Scanning" : "QR Code is Too Small"}
          </p>
          <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-1">
            Your QR code covers {sizePercent}% of the image width. {isGoodSize
              ? "This is a good size for printing and scanning from a normal distance."
              : "If you print this, scanners might struggle. Try increasing the size to 15-20% or more for better reliability."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Intro Section (inlined from Intro.tsx)
 * ============================================================ */
function IntroSection({
  content,
  language,
  prefersReduced,
}: {
  content: typeof photoQrContent.en;
  language: string;
  prefersReduced: boolean;
}) {
  return (
    <section className="relative py-14 sm:py-20 overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 -left-20 w-[400px] h-[400px] rounded-full opacity-30"
          style={{
            background:
              "radial-gradient(circle, rgba(216,139,154,0.4) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-25"
          style={{
            background:
              "radial-gradient(circle, rgba(201,150,103,0.4) 0%, transparent 65%)",
            filter: "blur(60px)",
          }}
        />
        <span
          className="absolute top-12 left-[8%] text-2xl sm:text-3xl opacity-30 animate-gentle-float"
          style={{ animationDelay: "0s" }}
        >
          ✨
        </span>
        <span
          className="absolute top-32 right-[10%] text-3xl sm:text-4xl opacity-25 animate-gentle-float"
          style={{ animationDelay: "1.5s" }}
        >
          🎯
        </span>
        <span
          className="absolute bottom-24 left-[12%] text-2xl sm:text-3xl opacity-25 animate-gentle-float"
          style={{ animationDelay: "3s" }}
        >
          🪄
        </span>
        <span
          className="absolute bottom-16 right-[8%] text-3xl sm:text-4xl opacity-20 animate-gentle-float"
          style={{ animationDelay: "4.5s" }}
        >
          🚀
        </span>
      </div>

      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-3xl mx-auto"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-silk-rose animate-soft-pulse" />
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.3em] text-silk-wine/70 dark:text-silk-rose/60 font-semibold">
              {language === "bn" ? "টুল সম্পর্কে" : "About this tool"}
            </p>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl leading-[1.1] tracking-tight text-light-text dark:text-dark-text">
            {language === "bn" ? "যে টুল" : "The tool that"}{" "}
            <span className="font-script text-silk-rose text-[1.15em]">
              {language === "bn"
                ? "আপনার ছবিকে জীবন্ত করে"
                : "brings photos to life"}
            </span>{" "}
            ✨
          </h2>
          <p className="mt-5 text-base sm:text-lg text-light-textSecondary dark:text-dark-textSecondary leading-relaxed max-w-2xl mx-auto">
            {language === "bn"
              ? "🎨 একটা ছবি, একটা স্ক্যান — সেকেন্ডের মধ্যে যোগাযোগ। 💫"
              : "🎨 One photo, one scan — a connection made in seconds. 💫"}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 mb-12 sm:mb-16">
          {content.introHighlights.map((h, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={cn(
                "group relative p-4 sm:p-5 rounded-2xl",
                "bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl",
                "border border-silk-rose/15 hover:border-silk-rose/50",
                "hover:-translate-y-1",
                "transition-all duration-500"
              )}
            >
              <span className="text-3xl sm:text-4xl block mb-2.5 group-hover:scale-110 transition-transform duration-500">
                {h.emoji}
              </span>
              <h3 className="font-display font-bold text-[13px] sm:text-[15px] text-light-text dark:text-dark-text mb-1 leading-tight">
                {h.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                {h.text}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
          {content.introBlocks.map((block, i) => {
            const Icon =
              ICON_MAP[block.icon as keyof typeof ICON_MAP] ?? Sparkles;
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: prefersReduced ? 0 : isEven ? -20 : 20,
                }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className={cn(
                  "group relative p-5 sm:p-7 rounded-3xl overflow-hidden",
                  "bg-white/70 dark:bg-dark-surface/70 backdrop-blur-xl",
                  "border border-silk-rose/15 hover:border-silk-rose/40",
                  "hover:shadow-[0_20px_50px_-15px_rgba(139,58,79,0.25)]",
                  "transition-all duration-500"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute -top-16 w-40 h-40 rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none",
                    isEven ? "-right-16" : "-left-16"
                  )}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(216,139,154,0.5) 0%, transparent 70%)",
                    filter: "blur(40px)",
                  }}
                />
                <div className="relative flex items-start gap-4">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-500">
                      {block.emoji}
                    </span>
                    <span className="w-10 h-10 rounded-xl bg-silk-rose/15 border border-silk-rose/25 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-silk-rose" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-bold text-lg sm:text-xl text-light-text dark:text-dark-text mb-2 leading-tight">
                      {block.title}
                    </h3>
                    <p className="text-[14px] sm:text-base text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                      {block.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3 mt-12">
          <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent to-silk-rose/40" />
          <span className="text-xl sm:text-2xl animate-soft-pulse">💖</span>
          <span
            className="text-xl sm:text-2xl animate-soft-pulse"
            style={{ animationDelay: "0.5s" }}
          >
            ✨
          </span>
          <span
            className="text-xl sm:text-2xl animate-soft-pulse"
            style={{ animationDelay: "1s" }}
          >
            🌸
          </span>
          <span className="h-px w-12 sm:w-20 bg-gradient-to-l from-transparent to-silk-rose/40" />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
 * FAQ Item (inlined)
 * ============================================================ */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 overflow-hidden",
        open
          ? "bg-white/85 dark:bg-dark-surface/85 border-silk-rose/40 shadow-silk-soft"
          : "bg-white/60 dark:bg-dark-surface/60 border-silk-rose/15 hover:border-silk-rose/30"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-display font-semibold text-[14px] sm:text-[15px] text-light-text dark:text-dark-text leading-snug">
          {question}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-silk-rose"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-[13px] sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
 * Main Component
 * ============================================================ */
export default function PhotoQrTool() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { language } = useLanguage();
  const content = photoQrContent[language];
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    trackRecentTool({ path: "/tools/photo-qr", name: "Photo Qr", emoji: "🔧" });
  }, []);

  return (
    <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
      <ToolSchema toolId="photo-qr" />
      <ToolBreadcrumb toolName="Photo QR Code" category="QR Tools" />

      <Hero />

      <div className="flex justify-center my-8">
        <button
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
        >
          Start Creating Now <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <SmartInsights sizePercent={20} />

      <div className="rounded-2xl bg-silk-rose/5 border border-silk-rose/20 p-4 sm:p-5 flex items-start gap-3 mb-12">
        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-silk-rose shrink-0 mt-0.5" />
        <p className="text-[13px] sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
          {content.privacyNote}
        </p>
      </div>

      <IntroSection
        content={content}
        language={language}
        prefersReduced={!!prefersReduced}
      />

      <div className="max-w-3xl">
        <section className="max-w-3xl mb-14">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-light-text dark:text-dark-text mb-6">
            {language === "bn" ? "কীভাবে ব্যবহার করবেন" : "How to Use"}
          </h2>
          <ol className="space-y-5">
            {content.howTo.map((step) => (
              <li key={step.step} className="flex gap-4">
                <span className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-silk-rose to-silk-wine-deep text-white text-sm font-bold flex items-center justify-center shadow-silk-soft">
                  {step.step}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-light-text dark:text-dark-text text-[15px] sm:text-base mb-1.5">
                    {step.title}
                  </h3>
                  <p className="text-[14px] sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="max-w-4xl mb-14">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-light-text dark:text-dark-text mb-6">
            {language === "bn" ? "ফিচার" : "Features"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.features.map((f) => (
              <div
                key={f.title}
                className="p-5 rounded-2xl bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl border border-silk-rose/15 hover:border-silk-rose/40 transition-all"
              >
                <h3 className="font-display font-semibold text-[15px] sm:text-base text-light-text dark:text-dark-text mb-2">
                  {f.title}
                </h3>
                <p className="text-[13px] sm:text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <AdSenseSlot slot={AD_SLOTS.toolBottom} label="Advertisement" />

        <section className="max-w-3xl mb-14">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-light-text dark:text-dark-text mb-6">
            {language === "bn" ? "প্রশ্নোত্তর" : "FAQ"}
          </h2>
          <div className="space-y-3">
            {content.faq.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>
      </div>

      <ToolFieldNote toolId="photo-qr" />
      <ToolDataSections toolId="photo-qr" />
      <RelatedToolsBlock currentToolId="photo-qr" count={3} />

      <PhotoQRWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </div>
  );
}
