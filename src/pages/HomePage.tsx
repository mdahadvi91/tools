import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@contexts/LanguageContext";
import { tools, TOOL_CATEGORIES, CATEGORY_LABEL } from "@/data/tools";
import type { ToolCategory } from "@/types/tool";
import "./HomePage.css";

const ICON_BY_CATEGORY: Record<ToolCategory, string> = {
  documents: "📄",
  design: "🪪",
  qr: "📱",
};

const COLOR_BY_CATEGORY: Record<ToolCategory, string> = {
  documents: "red",
  design: "orange",
  qr: "green",
};

type Filter = "All" | ToolCategory;

export default function HomePage() {
  const { language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const sortedTools = [...tools].sort(
    (a, b) => (b.searchVolume ?? 0) - (a.searchVolume ?? 0)
  );

  const filteredTools =
    activeFilter === "All"
      ? sortedTools
      : sortedTools.filter((t) => t.category === activeFilter);

  const filters: { id: Filter; label: string }[] = [
    { id: "All", label: language === "bn" ? "সব" : "All" },
    ...TOOL_CATEGORIES.map((c) => ({
      id: c,
      label: language === "bn"
        ? c === "documents" ? "ডকুমেন্টস" : c === "design" ? "ডিজাইন" : "কিউআর"
        : CATEGORY_LABEL[c],
    })),
  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>
          {language === "bn"
            ? "ফ্রি, প্রাইভেট ব্রাউজার-ভিত্তিক টুলস"
            : "Free, Private Browser-Based Tools"}
        </h1>
        <p>
          {language === "bn"
            ? `${tools.length}টি ফ্রি ব্রাউজার-ভিত্তিক টুল — আপনার ফাইল আপনার ডিভাইসেই থাকে, কোনো সার্ভারে আপলোড হয় না।`
            : `${tools.length} free browser-based tools — your files stay on your device, nothing is uploaded to any server.`}
        </p>
      </section>

      <nav className="filter-nav">
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? "active" : ""}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </nav>

      <section className="tools-grid">
        {filteredTools.map((tool) => {
          const title = language === "bn" ? tool.nameBn ?? tool.name : tool.name;
          const desc = language === "bn" ? tool.descriptionBn ?? tool.description : tool.description;
          return (
            <Link to={tool.path} key={tool.id} className="tool-card-link">
              <div className="tool-card">
                <div className={`tool-icon ${COLOR_BY_CATEGORY[tool.category]}`}>
                  {ICON_BY_CATEGORY[tool.category]}
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
