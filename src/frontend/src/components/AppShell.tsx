import {
  Activity,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  Globe,
  LayoutDashboard,
  Link2,
  Search,
  Shield,
  TrendingUp,
  Wrench,
  Youtube,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { Page } from "../App";

interface AppShellProps {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

interface NavGroup {
  label: string;
  items: { id: Page; label: string; icon: React.ElementType }[];
}

const navGroups: NavGroup[] = [
  {
    label: "AUDIT",
    items: [{ id: "seo-audit", label: "SEO Audit", icon: Search }],
  },
  {
    label: "ANALYSIS",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "on-page", label: "On-Page SEO", icon: Shield },
      { id: "technical", label: "Technical", icon: Wrench },
      { id: "ai-execution", label: "AI Insights", icon: Bot },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { id: "backlinks", label: "Backlinks", icon: Link2 },
      { id: "market", label: "Market Intel", icon: TrendingUp },
    ],
  },
  {
    label: "YOUTUBE",
    items: [{ id: "youtube", label: "YouTube SEO", icon: Youtube }],
  },
];

const pageTitles: Record<Page, { title: string; breadcrumb: string }> = {
  overview: { title: "System Overview", breadcrumb: "Overview" },
  "on-page": { title: "On-Page SEO", breadcrumb: "On-Page SEO" },
  technical: { title: "Technical Audit", breadcrumb: "Technical" },
  "seo-audit": { title: "SEO Audit Engine", breadcrumb: "SEO Audit" },
  backlinks: { title: "Backlink Profile", breadcrumb: "Backlinks" },
  "ai-execution": { title: "AI Insights", breadcrumb: "AI Insights" },
  market: { title: "Market Intelligence", breadcrumb: "Market" },
  youtube: { title: "YouTube SEO Intelligence", breadcrumb: "YouTube SEO" },
};

export function AppShell({ children, currentPage, onNavigate }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { title, breadcrumb } = pageTitles[currentPage];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col bg-sidebar border-r border-border transition-all duration-200 ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="h-12 flex items-center justify-between px-3 border-b border-border flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                <BarChart3 size={13} className="text-primary" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-foreground leading-tight truncate">
                  Anti-Gravity SEO
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">
                  Intelligence
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center mx-auto">
              <BarChart3 size={14} className="text-primary" />
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-muted-foreground hover:text-foreground p-0.5 rounded"
            >
              <ChevronLeft size={14} />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center py-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight size={14} />
          </button>
        )}

        {/* Nav Groups */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div className="text-[9px] font-semibold tracking-widest text-muted-foreground/60 px-2 mb-1">
                  {group.label}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-ocid={`nav.${item.id}.link`}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-left transition-all duration-100 text-xs font-medium ${
                        isActive ? "nav-active" : "nav-inactive"
                      }`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon size={14} className="flex-shrink-0" />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
              U
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-foreground truncate">
                  Admin User
                </div>
                <div className="text-[10px] text-warning font-mono">
                  Free Plan
                </div>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1">
              <Activity size={10} className="text-success" />
              <span className="text-[10px] text-success">Operational</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-12 flex items-center justify-between px-4 border-b border-border flex-shrink-0 bg-card/40">
          <div className="flex items-center gap-2">
            <Globe size={13} className="text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">/</span>
            <span className="text-[11px] text-muted-foreground">
              {breadcrumb}
            </span>
            <span className="text-[11px] text-muted-foreground mx-1">·</span>
            <span className="text-[12px] font-semibold text-foreground">
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-mono text-muted-foreground">
              v2.1.0
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
