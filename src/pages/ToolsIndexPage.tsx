import { Link } from "react-router-dom";
import { useLanguage } from "@contexts/LanguageContext";
import { tools, TOOL_CATEGORIES, CATEGORY_LABEL, CATEGORY_ICON } from "@/data/tools";
import type { Tool, ToolCategory } from "@/types/tool";

/* Static Tailwind classes — JIT cannot detect dynamic strings. */
const CATEGORY_BG: Record<ToolCategory, string> = {
  documents: "bg-red-50 border border-red-100",
  design: "bg-orange-50 border border-orange-100",
  qr: "bg-green-50 border border-green-100",
};

export default function ToolsIndexPage() {
  const { language } = useLanguage();
  const bn = language === "bn";

  // Group tools by category, preserving TOOL_CATEGORIES order.
  const byCategory = TOOL_CATEGORIES.reduce(
    (acc, c) => {
      acc[c] = tools
        .filter((t) => t.category === c)
        .sort((a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0));
      return acc;
    },
    {} as Record<ToolCategory, Tool[]>
  );

  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          {bn ? "আমাদের সব টুলস" : "All Our Tools"}
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {bn
            ? `${tools.length}টি ফ্রি ব্রাউজার-ভিত্তিক টুল — আপনার ফাইল আপনার ডিভাইসেই থাকে, কোনো সার্ভারে আপলোড হয় না।`
            : `${tools.length} free browser-based tools — your files stay on your device, nothing is uploaded to any server.`}
        </p>
      </section>

      {/* Category-grouped tool grid — mirrors the SSR output */}
      {TOOL_CATEGORIES.map((category) => {
        const categoryTools = byCategory[category];
        if (categoryTools.length === 0) return null;

        const label = bn
          ? category === "documents"
            ? "ডকুমেন্টস"
            : category === "design"
            ? "ডিজাইন"
            : "কিউআর ও বারকোড"
          : CATEGORY_LABEL[category];

        return (
          <section key={category} className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {label} <span className="text-gray-400 font-normal">({categoryTools.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryTools.map((tool) => {
                const title = bn ? tool.nameBn ?? tool.name : tool.name;
                const desc = bn ? tool.descriptionBn ?? tool.description : tool.description;
                return (
                  <Link
                    key={tool.id}
                    to={tool.path}
                    className="group block p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-red-500 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl text-3xl mb-4 ${CATEGORY_BG[category]}`}>
                      {CATEGORY_ICON[category]}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-red-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {desc}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Info Section */}
      <section className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          {bn
            ? "আরও টুল আসছে। সব টুল ১০০% ফ্রি, কোনো অ্যাকাউন্ট বা সাইন-আপের প্রয়োজন নেই।"
            : "More tools are on the way. All tools are 100% free, with no accounts or sign-ups required."}
        </p>
      </section>
    </div>
  );
}
