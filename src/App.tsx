import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { MainLayout } from "@components/layout/MainLayout";
import { tools } from "@/data/tools";
import { ThemeProvider } from "@contexts/ThemeContext";
import { LanguageProvider } from "@contexts/LanguageContext";
import { Loader } from "@components/common/Loader";
import { ToolSkeleton } from "@components/common/ToolSkeleton";

/* ------------------------------------------------------------------
 * Pages
 * ------------------------------------------------------------------ */
const HomePage = lazy(() => import("@pages/HomePage"));
const ToolsIndexPage = lazy(() => import("@pages/ToolsIndexPage")); // 🚨 নতুন ইমপোর্ট
const AboutPage = lazy(() => import("@pages/AboutPage"));
const ContactPage = lazy(() => import("@pages/ContactPage"));
const PrivacyPage = lazy(() => import("@pages/PrivacyPage"));
const TermsPage = lazy(() => import("@pages/TermsPage"));
const DisclaimerPage = lazy(() => import("@pages/DisclaimerPage"));
const CookiePolicyPage = lazy(() => import("@pages/CookiePolicyPage"));
const NotFoundPage = lazy(() => import("@pages/NotFoundPage"));

/* ------------------------------------------------------------------
 * Tools
 * ------------------------------------------------------------------ */

const CVBuilderEditor = lazy(() =>
  import("@tools/documents/cv-builder/editor").then((m) => ({
    default: m.CVEditor,
  }))
);

const VisitingCardEditor = lazy(() =>
  import("@tools/design/visiting-card/editor").then((m) => ({
    default: m.Editor,
  }))
);

/* ------------------------------------------------------------------
 * Dynamic Tool Components (Vite Glob Import)
 * ------------------------------------------------------------------ */
const toolModules = import.meta.glob("./tools/**/index.tsx");

/* ------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------ */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

function ToolSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ToolSkeleton />}>
      {children}
    </Suspense>
  );
}

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loader />}>
      {children}
    </Suspense>
  );
}

/* ------------------------------------------------------------------
 * App
 * ------------------------------------------------------------------ */
export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ScrollToTop />

          <Routes>
            <Route element={<MainLayout />}>
              {/* Home */}
              <Route
                index
                element={
                  <PageSuspense>
                    <HomePage />
                  </PageSuspense>
                }
              />
              
              {/* 🚨 /tools route now renders the Tools listing page instead of redirecting */}
              <Route path="tools" element={<PageSuspense><ToolsIndexPage /></PageSuspense>} />

              {/* ── Dynamic Tools from Central Registry ── */}
              {tools.map((tool) => {
                const modulePath = Object.keys(toolModules).find((path) =>
                  path.endsWith(`/${tool.id}/index.tsx`)
                );
                if (!modulePath) {
                  console.warn(`[App] No component found for tool: ${tool.id}`);
                  return null;
                }
                const Component = lazy(
                  toolModules[modulePath] as () => Promise<{ default: React.ComponentType }>
                );
                return (
                  <Route
                    key={tool.id}
                    path={tool.path.replace(/^\//, "")}
                    element={
                      <ToolSuspense>
                        <Component />
                      </ToolSuspense>
                    }
                  />
                );
              })}

              {/* Tool editors */}
              <Route path="tools/cv-builder/edit/:templateId" element={<ToolSuspense><CVBuilderEditor /></ToolSuspense>} />
              <Route path="tools/visiting-card/edit/:templateId" element={<ToolSuspense><VisitingCardEditor /></ToolSuspense>} />

              {/* Static pages */}
              <Route path="about" element={<PageSuspense><AboutPage /></PageSuspense>} />
              <Route path="contact" element={<PageSuspense><ContactPage /></PageSuspense>} />
              <Route path="privacy" element={<PageSuspense><PrivacyPage /></PageSuspense>} />
              <Route path="terms" element={<PageSuspense><TermsPage /></PageSuspense>} />
              <Route path="disclaimer" element={<PageSuspense><DisclaimerPage /></PageSuspense>} />
              <Route path="cookie-policy" element={<PageSuspense><CookiePolicyPage /></PageSuspense>} />

              {/* Global Guides */}

              {/* Fallback */}
              <Route path="404" element={<PageSuspense><NotFoundPage /></PageSuspense>} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
