import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap } from "lucide-react";
import { useLanguage } from "@contexts/LanguageContext";
import { imageToPdfData } from "./data";
import { imageToPdfContent } from "./content";

export function Hero() {
  const { language, t } = useLanguage();
  const content = imageToPdfContent[language];

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-14 pb-8 sm:pb-12">
      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary hover:text-silk-rose transition-colors mb-5 sm:mb-8">
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {t.common.home}
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5 sm:mb-7">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/60 dark:bg-dark-surface/60 backdrop-blur-xl border border-silk-rose/25 text-silk-wine dark:text-silk-rose text-[10px] sm:text-xs font-medium tracking-[0.12em] sm:tracking-[0.2em] uppercase">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {content.heroTag}
          </span>
          <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-silk-rose/5 border border-silk-rose/15 text-light-textSecondary dark:text-dark-textSecondary text-[10px] sm:text-xs font-medium">
            <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {language === "bn" ? "ফাইল আপনার ডিভাইসেই থাকে" : "Files stay on your device"}
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="font-display font-black text-[2.25rem] leading-[1] sm:text-5xl lg:text-6xl tracking-tight text-light-text dark:text-dark-text">
          {imageToPdfData.name}
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.25 }} className="mt-5 sm:mt-7 text-[15px] sm:text-lg lg:text-xl text-light-textSecondary dark:text-dark-textSecondary max-w-2xl leading-relaxed">
          {content.heroSubtitle}
        </motion.p>
      </div>
    </section>
  );
}
