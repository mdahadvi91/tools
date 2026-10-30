import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Shield, Zap, CheckCircle2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trackRecentTool } from "@lib/recentTools";
import { ToolDataSections } from "@components/tools/ToolDataSections";
import { RelatedToolsBlock } from "@components/tools/RelatedToolsBlock";
import { useLanguage } from "@contexts/LanguageContext";
import { Hero } from "./Hero";
import { ToolSchema } from "@components/seo/ToolSchema";
import { ToolFieldNote } from "@components/tools/ToolFieldNote";
import { photoQrContent } from "./content";
import { ToolBreadcrumb } from "@components/tools/ToolBreadcrumb";

import { AdSenseSlot } from "@components/ads/AdSenseSlot";
import { AD_SLOTS } from "@constants/ads";
import { PhotoQRWizardModal } from "./PhotoQRWizardModal";
import { Intro } from "./Intro";
import { cn } from "@lib/cn";

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

export default function PhotoQrTool() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { language } = useLanguage();
  const content = photoQrContent[language];

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

      <Intro />

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
