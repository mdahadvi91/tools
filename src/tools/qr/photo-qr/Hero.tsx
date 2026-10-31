import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sparkles,
  Scan,
  ShieldCheck,
} from "lucide-react";

import { useLanguage } from "@contexts/LanguageContext";
import { useReducedMotion } from "@hooks/useReducedMotion";
import { LiveText } from "@components/common/LiveText";
import { tools } from "@/data/tools";

import { photoQrContent } from "./content";

const photoQrData = tools.find((tool) => tool.id === "photo-qr");

export function Hero() {
  const { language, t } = useLanguage();
  const prefersReduced = !!useReducedMotion();
  const isBangla = language === "bn";
  const content = photoQrContent[language];

  const transition = (duration: number, delay = 0) => ({
    duration: prefersReduced ? 0 : duration,
    delay: prefersReduced ? 0 : delay,
  });

  if (!photoQrData) {
    return (
      <section className="py-10">
        <h1 className="font-display text-3xl font-bold text-light-text dark:text-dark-text">
          {isBangla ? "Photo QR" : "Photo QR"}
        </h1>
        <p className="mt-3 text-sm text-light-textSecondary dark:text-dark-textSecondary">
          {isBangla
            ? "টুলটি বর্তমানে লোড করা যাচ্ছে না।"
            : "This tool is currently unavailable."}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="photo-qr-hero-title"
      className="relative isolate overflow-hidden pb-8 pt-8 sm:pb-12 sm:pt-14"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div
          className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-40 blur-[70px]"
          style={{
            background:
              "radial-gradient(circle, rgba(216,139,154,0.35) 0%, transparent 65%)",
          }}
        />

        <div
          className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full opacity-30 blur-[70px]"
          style={{
            background:
              "radial-gradient(circle, rgba(201,150,103,0.35) 0%, transparent 65%)",
          }}
        />

        <span className="absolute right-[12%] top-16 text-4xl opacity-30">
          🌸
        </span>

        <span className="absolute bottom-20 left-[8%] text-3xl opacity-25">
          💗
        </span>
      </div>

      <div className="relative">
        <Link
          to="/"
          className="mb-5 inline-flex min-h-9 items-center gap-2 rounded-lg text-xs font-medium text-light-textSecondary transition-colors hover:text-silk-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-silk-rose dark:text-dark-textSecondary sm:mb-8 sm:text-sm"
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4"
          />
          {t.common.home}
        </Link>

        <motion.div
          initial={{
            opacity: 0,
            y: prefersReduced ? 0 : 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={transition(0.5)}
          className="mb-5 flex flex-wrap items-center gap-2 sm:mb-7 sm:gap-3"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-silk-rose/25 bg-white/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-silk-wine backdrop-blur-xl dark:bg-dark-surface/60 dark:text-silk-rose sm:px-4 sm:py-2 sm:text-xs sm:tracking-[0.2em]">
            <Sparkles
              aria-hidden="true"
              className="h-3.5 w-3.5"
            />
            {content.heroTag}
          </span>

          {photoQrData.newTool && (
            <span className="inline-flex items-center rounded-full border border-silk-wine/25 bg-silk-wine/15 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-silk-wine dark:text-silk-rose-soft sm:text-[10px]">
              {isBangla ? "নতুন" : "New"}
            </span>
          )}

          <span className="inline-flex items-center gap-2 rounded-full border border-silk-rose/15 bg-silk-rose/5 px-3 py-1.5 text-[10px] font-medium text-light-textSecondary dark:text-dark-textSecondary sm:px-4 sm:py-2 sm:text-xs">
            <ShieldCheck
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-silk-rose"
            />
            {isBangla
              ? "ব্রাউজারেই ছবি প্রসেসিং"
              : "Browser-based image processing"}
          </span>
        </motion.div>

        <motion.h1
          id="photo-qr-hero-title"
          initial={{
            opacity: 0,
            y: prefersReduced ? 0 : 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={transition(0.6, 0.1)}
          className="font-display text-[2.25rem] font-black leading-[1.05] tracking-tight text-light-text dark:text-dark-text sm:text-5xl lg:text-6xl"
        >
          <LiveText
            text={photoQrData.name}
            gradient="rose"
            waveAmplitude={prefersReduced ? 0 : 12}
            waveDuration={prefersReduced ? 0 : 2.8}
            letterStagger={prefersReduced ? 0 : 0.09}
          />
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
            y: prefersReduced ? 0 : 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={transition(0.6, 0.2)}
          className="mt-5 max-w-2xl text-[15px] leading-relaxed text-light-textSecondary dark:text-dark-textSecondary sm:mt-7 sm:text-lg lg:text-xl"
        >
          {content.heroSubtitle}
        </motion.p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-light-textSecondary dark:text-dark-textSecondary sm:text-sm">
          <span className="inline-flex items-center gap-2">
            <Scan
              aria-hidden="true"
              className="h-4 w-4 text-silk-rose"
            />
            {isBangla
              ? "স্ক্যানযোগ্য QR ডিজাইন"
              : "Custom QR image design"}
          </span>

          <span className="inline-flex items-center gap-2">
            <ShieldCheck
              aria-hidden="true"
              className="h-4 w-4 text-silk-rose"
            />
            {isBangla
              ? "লোকাল প্রসেসিং"
              : "Local browser processing"}
          </span>
        </div>
      </div>
    </section>
  );
}
