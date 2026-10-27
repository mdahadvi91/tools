import { TrustPageLayout } from "@components/trust/TrustPageLayout";
import { useLanguage } from "@contexts/LanguageContext";
import { CONTENT } from "./content";

export { SEO } from "./seo";
export { SCHEMA, FAQ } from "./schema";

export default function CookiePolicyPage() {
  const { language } = useLanguage();
  return <TrustPageLayout content={CONTENT[language]} icon="cookie" />;
}
