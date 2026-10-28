import { useEffect, useState } from "react";
import { trackRecentTool } from "@lib/recentTools";
import { ToolDataSections } from "@components/tools/ToolDataSections";
import { CVBuilderHero } from "./components/Hero";
import { CVBuilderIntro } from "./components/Intro";
import { CVBuilderFeatures } from "./components/Features";
import { CVBuilderHowTo } from "./components/HowTo";
import { CVBuilderPrivacyNote } from "./components/PrivacyNote";
import { CVBuilderFAQ } from "./components/FAQ";
import { CVBuilderRelatedTools } from "./components/RelatedTools";
import { ToolBreadcrumb } from "@components/tools/ToolBreadcrumb";
import { ToolSchema } from "@components/seo/ToolSchema";
import { AdSenseSlot } from "@components/ads/AdSenseSlot";
import { AD_SLOTS } from "@constants/ads";
import { CVWizardModal } from "./CVWizardModal";
import { ArrowRight } from "lucide-react";

export default function CVBuilderTool() {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  useEffect(() => {
    trackRecentTool({ path: "/tools/cv-builder", name: "Cv Builder", emoji: "🔧" });
  }, []);
  return (
    <>
      <ToolSchema toolId="cv-builder" />
      <ToolBreadcrumb toolName="CV Builder" category="Design Tools" />
      
      <div className="mx-auto max-w-[1400px] px-3 sm:px-6 lg:px-8">
        <CVBuilderHero />
        
        {/* Start Button to open Wizard */}
        <div className="flex justify-center my-8">
          <button 
            onClick={() => setIsWizardOpen(true)} 
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
          >
            Start Building Now <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <CVBuilderIntro />
        <CVBuilderFeatures />
        <CVBuilderHowTo />
        <CVBuilderPrivacyNote />
        <AdSenseSlot slot={AD_SLOTS.toolBottom} label="Advertisement" />
        <CVBuilderFAQ />
        
        <div className="pb-16">
          <CVBuilderRelatedTools />
        </div>
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <ToolDataSections toolId="cv-builder" />
        </div>
      </div>

      {/* Wizard Modal */}
      <CVWizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
    </>
  );
}
