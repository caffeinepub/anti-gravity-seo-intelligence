import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { AIExecution } from "./pages/AIExecution";
import { BacklinkProfile } from "./pages/BacklinkProfile";
import { MarketIntelligence } from "./pages/MarketIntelligence";
import { OnPageSEO } from "./pages/OnPageSEO";
import { Overview } from "./pages/Overview";
import { SEOAudit } from "./pages/SEOAudit";
import { TechnicalAudit } from "./pages/TechnicalAudit";
import { YouTubeSEO } from "./pages/YouTubeSEO";

export type Page =
  | "overview"
  | "on-page"
  | "technical"
  | "seo-audit"
  | "backlinks"
  | "ai-execution"
  | "market"
  | "youtube";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("seo-audit");

  const renderPage = () => {
    switch (currentPage) {
      case "overview":
        return <Overview onNavigate={setCurrentPage} />;
      case "on-page":
        return <OnPageSEO />;
      case "technical":
        return <TechnicalAudit />;
      case "seo-audit":
        return <SEOAudit />;
      case "backlinks":
        return <BacklinkProfile />;
      case "ai-execution":
        return <AIExecution />;
      case "market":
        return <MarketIntelligence />;
      case "youtube":
        return <YouTubeSEO />;
      default:
        return <SEOAudit />;
    }
  };

  return (
    <AppShell currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppShell>
  );
}
