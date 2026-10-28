import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, Zap } from "lucide-react";
import { useLanguage } from "@contexts/LanguageContext";
import { imageResizerData } from "./data";
import { imageResizerContent } from "./content";

export function Hero() {
  const { language, t } = useLanguage();
  const content = imageResizerContent[language];
  return (
    <section className="relative overflow-hidden pt-8 sm:pt-14 pb-8 sm:pb-12">
      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 mb-6">
          <ArrowLeft className="w-4 h-4" /> {t.common.home}
        </Link>
        <div className="flex gap-3 mb-6">
          <span className="px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Sparkles className="w-3 h-3"/> {content.heroTag}</span>
          <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium flex items-center gap-1"><Zap className="w-3 h-3"/> {language === "bn" ? "ফাইল আপনার ডিভাইসেই থাকে" : "Files stay on your device"}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4">{imageResizerData.name}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">{content.heroSubtitle}</p>
      </div>
    </section>
  );
}