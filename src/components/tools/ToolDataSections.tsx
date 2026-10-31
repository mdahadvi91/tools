import { motion } from "framer-motion";
import { tools } from "@data/tools";
import { useLanguage } from "@contexts/LanguageContext";
import { CheckCircle2, AlertTriangle, BarChart3, FileType2 } from "lucide-react";

export function ToolDataSections({ toolId }: { toolId: string }) {
  const { language } = useLanguage();
  const bn = language === "bn";

  const tool = tools.find((t) => t.id === toolId);
  if (!tool) return null;

  const useCases = bn && (tool as any).useCasesBn ? (tool as any).useCasesBn : (tool.useCases || []);
  const limitations = bn && (tool as any).limitationsBn ? (tool as any).limitationsBn : (tool.limitations || []);
  const benchmarks = tool.benchmarks || [];
  const supportedFormats = tool.supportedFormats || [];

  if (useCases.length === 0 && limitations.length === 0 && benchmarks.length === 0 && supportedFormats.length === 0) return null;

  return (
    <div className="mx-auto max-w-3xl mt-12 mb-10 space-y-12">
      {/* Editorial Content */}
      {tool.editorialContent?.map((section, i) => (
        <motion.article key={`editorial-${i}`} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="font-serif font-black text-2xl text-light-text dark:text-dark-text mb-4">{section.heading}</h2>
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-light-textSecondary dark:text-dark-textSecondary" dangerouslySetInnerHTML={{ __html: section.body }} />
        </motion.article>
      ))}

      {/* Deep Dives */}
      {tool.deepDive?.map((section, i) => (
        <motion.article key={`deepdive-${i}`} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="font-serif font-black text-2xl text-light-text dark:text-dark-text mb-4">{section.heading}</h2>
          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-light-textSecondary dark:text-dark-textSecondary" dangerouslySetInnerHTML={{ __html: section.body }} />
        </motion.article>
      ))}
      {benchmarks.length > 0 && (
        <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-silk-rose" />
            <h2 className="font-serif font-black text-2xl text-light-text dark:text-dark-text">Performance Benchmarks</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-silk-rose/20">
            <table className="w-full text-sm text-left">
              <thead className="bg-silk-rose/10 text-light-text dark:text-dark-text border-b border-silk-rose/20">
                <tr>
                  <th className="px-4 py-3 font-semibold">Test Case</th>
                  <th className="px-4 py-3 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-silk-rose/10 text-light-textSecondary dark:text-dark-textSecondary">
                {benchmarks.map((b, i) => (
                  <tr key={i} className="hover:bg-silk-rose/5 transition-colors">
                    <td className="px-4 py-3">{b.label}</td>
                    <td className="px-4 py-3 font-medium text-light-text dark:text-dark-text">{b.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.article>
      )}

      {supportedFormats.length > 0 && (
        <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-2 mb-4">
            <FileType2 className="w-5 h-5 text-blue-500" />
            <h2 className="font-serif font-black text-2xl text-light-text dark:text-dark-text">Supported Formats</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {supportedFormats.map((format, i) => (
              <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {format}
              </span>
            ))}
          </div>
        </motion.article>
      )}

      {useCases.length > 0 && (
        <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="font-serif font-black text-2xl text-light-text dark:text-dark-text mb-4">Real-world use cases</h2>
          <ul className="space-y-3">
            {useCases.map((u: string, i: number) => (
              <li key={i} className="flex gap-3 text-[15px] text-light-textSecondary dark:text-dark-textSecondary">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </motion.article>
      )}

      {limitations.length > 0 && (
        <motion.article initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="font-serif font-black text-2xl text-light-text dark:text-dark-text mb-4">Limitations</h2>
          <ul className="space-y-3">
            {limitations.map((l: string, i: number) => (
              <li key={i} className="flex gap-3 text-[15px] text-light-textSecondary dark:text-dark-textSecondary">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </motion.article>
      )}
    </div>
  );
}
