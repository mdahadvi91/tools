import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@contexts/LanguageContext";
import { trackRecentTool } from "@lib/recentTools";

import { ToolDataSections } from "@components/tools/ToolDataSections";
import { RelatedToolsBlock } from "@components/tools/RelatedToolsBlock";
import { ToolSchema } from "@components/seo/ToolSchema";
import { ToolBreadcrumb } from "@components/tools/ToolBreadcrumb";
import { ToolFieldNote } from "@components/tools/ToolFieldNote";
import { AdSenseSlot } from "@components/ads/AdSenseSlot";
import { AD_SLOTS } from "@constants/ads";

import { Hero } from "./Hero";
import { ImageToPdfWizardModal } from "./ImageToPdfWizardModal";
import { imageToPdfContent } from "./content";

export default function ImageToPdfTool() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const { language } = useLanguage();
  const content = imageToPdfContent[language];

  useEffect(() => {
    trackRecentTool({ path: "/tools/image-to-pdf", name: "Image to PDF", emoji: "📄" });
  }, []);
  return (
    <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
      <ToolSchema toolId="image-to-pdf" />
      <ToolBreadcrumb toolName="Image to PDF" category="Documents" />

      <Hero />

      <div className="flex justify-center my-8">
        <button onClick={() => setIsWizardOpen(true)} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
          Start Converting Now <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* AEO: How-To Section */}
        <section className="my-12">
          <h2 className="text-2xl font-bold mb-6">How to Convert Images to PDF</h2>
          <ul className="space-y-6">
            {content.howTo.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold shrink-0">{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* GEO: Key Features */}
        <section className="my-12">
          <h2 className="text-2xl font-bold mb-6">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.features.map((f, i) => (
              <div key={i} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        <AdSenseSlot slot={AD_SLOTS.toolBottom} label="Advertisement" />

        {/* AEO: FAQ Section */}
        <section className="my-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {content.faq.map((f, i) => (
              <div key={i} className="p-4 border border-gray-100 dark:border-gray-800 rounded-xl">
                <h3 className="font-semibold mb-2">{f.question}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ToolFieldNote toolId="image-to-pdf" />
      <ToolDataSections toolId="image-to-pdf" />
      <RelatedToolsBlock currentToolId="image-to-pdf" count={3} />

      <ImageToPdfWizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </div>
  );
}
