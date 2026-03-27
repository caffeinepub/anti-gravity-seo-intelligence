import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Globe, Search } from "lucide-react";
import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Page } from "../App";
import { useActor } from "../hooks/useActor";
import { useProjectHistory, useSiteHealthScore } from "../hooks/useQueries";

interface OverviewProps {
  onNavigate: (page: Page) => void;
}

const RECENT_AUDITS = [
  {
    domain: "voltlearning.in",
    score: 72,
    issues: 10,
    date: "2026-03-27",
    urls: 48,
  },
  {
    domain: "example-edu.com",
    score: 85,
    issues: 4,
    date: "2026-03-25",
    urls: 130,
  },
  {
    domain: "testdomain.org",
    score: 61,
    issues: 16,
    date: "2026-03-20",
    urls: 22,
  },
];

function isValidUrl(url: string): boolean {
  return /^https?:\/\/.+/.test(url.trim());
}

export function Overview({ onNavigate }: OverviewProps) {
  const [auditUrl, setAuditUrl] = useState("");
  const [urlError, setUrlError] = useState("");

  const navigateToAudit = (url: string) => {
    const trimmed = url.trim();
    if (trimmed && !isValidUrl(trimmed)) {
      setUrlError("URL must start with http:// or https://");
      return;
    }
    setUrlError("");
    if (trimmed) {
      localStorage.setItem("pendingAuditUrl", trimmed);
    }
    onNavigate("seo-audit");
  };

  const { actor, isFetching } = useActor();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["dashboardMetrics"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getDashboardMetrics();
      } catch (err) {
        console.error("[Overview][getDashboardMetrics] Error:", err);
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });

  const onPageScore = metrics ? Number(metrics.onPageScore) : null;
  const technicalHealth = metrics ? Number(metrics.technicalHealth) : null;
  const domainRating = metrics ? Number(metrics.domainRating) : null;
  const visibility = metrics ? Number(metrics.visibilityIndex) : null;

  const { data: siteHealth } = useSiteHealthScore();
  const { data: _projectHistory = [] } = useProjectHistory();

  const pieData = [
    { name: "On-Page", value: onPageScore ?? 0, fill: "oklch(var(--chart-1))" },
    {
      name: "Technical",
      value: technicalHealth ?? 0,
      fill: "oklch(var(--chart-2))",
    },
    {
      name: "Off-Page",
      value: domainRating ?? 0,
      fill: "oklch(var(--chart-3))",
    },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Quick Audit Input */}
        <div className="bg-card border border-border rounded p-3 space-y-1">
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-muted-foreground flex-shrink-0" />
            <input
              data-ocid="overview.search_input"
              type="text"
              placeholder="https://example.com"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none font-mono"
              value={auditUrl}
              onChange={(e) => {
                setAuditUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && navigateToAudit(auditUrl)}
            />
            <button
              data-ocid="overview.primary_button"
              type="button"
              onClick={() => navigateToAudit(auditUrl)}
              className="text-xs bg-primary/20 text-primary px-3 py-1 rounded hover:bg-primary/30 font-medium"
            >
              Audit
            </button>
          </div>
          {urlError && (
            <p
              data-ocid="overview.error_state"
              className="text-xs text-destructive pl-5"
            >
              {urlError}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          {metricsLoading
            ? ["a", "b", "c", "d"].map((k) => (
                <Card
                  key={`skeleton-stat-${k}`}
                  className="bg-card border-border"
                >
                  <CardContent className="p-3">
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))
            : [
                {
                  label: "Total Projects",
                  value: 3,
                  icon: Globe,
                  color: "text-primary",
                },
                {
                  label: "URLs Audited",
                  value: 200,
                  icon: Search,
                  color: "text-foreground",
                },
                {
                  label: "Issues Found",
                  value: 30,
                  icon: AlertTriangle,
                  color: "text-destructive",
                },
                {
                  label: "Avg Health Score",
                  value: siteHealth ?? "--",
                  icon: CheckCircle2,
                  color: "text-success",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="bg-card border-border">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <Icon size={13} className={stat.color} />
                        <span
                          className={`text-xl font-bold font-mono ${stat.color}`}
                        >
                          {stat.value}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border-border col-span-1">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pb-3">
              {metricsLoading ? (
                <Skeleton className="w-36 h-36 rounded-full" />
              ) : (
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={3}
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(var(--popover))",
                        border: "1px solid oklch(var(--border))",
                        borderRadius: 4,
                        fontSize: 10,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border col-span-2">
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              {metricsLoading
                ? ["a", "b", "c", "d"].map((k) => (
                    <div key={`skeleton-metric-${k}`} className="space-y-1">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-1.5 w-full" />
                    </div>
                  ))
                : [
                    {
                      label: "On-Page Score",
                      value: onPageScore ?? 0,
                      display: onPageScore != null ? String(onPageScore) : "--",
                      color: "bg-primary",
                    },
                    {
                      label: "Technical Health",
                      value: technicalHealth ?? 0,
                      display:
                        technicalHealth != null
                          ? String(technicalHealth)
                          : "--",
                      color: "bg-success",
                    },
                    {
                      label: "Visibility Index",
                      value: visibility ?? 0,
                      display: visibility != null ? String(visibility) : "--",
                      color: "bg-warning",
                    },
                    {
                      label: "Domain Rating",
                      value: domainRating ?? 0,
                      display:
                        domainRating != null ? String(domainRating) : "--",
                      color: "bg-destructive",
                    },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[11px] text-muted-foreground">
                          {m.label}
                        </span>
                        <span className="text-[11px] font-mono text-foreground">
                          {m.display}
                        </span>
                      </div>
                      <Progress value={m.value} className="h-1" />
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Audits */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recent Audits
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  {["Domain", "Health", "Issues", "URLs", "Date", "Action"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {RECENT_AUDITS.map((a, i) => (
                  <tr
                    key={a.domain}
                    data-ocid={`overview.item.${i + 1}`}
                    className="data-row border-b border-border/50"
                  >
                    <td className="px-2 py-2 font-mono text-primary">
                      {a.domain}
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`font-mono font-bold text-xs ${
                          a.score >= 80
                            ? "text-success"
                            : a.score >= 60
                              ? "text-warning"
                              : "text-destructive"
                        }`}
                      >
                        {a.score}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-mono text-destructive">
                      {a.issues}
                    </td>
                    <td className="px-2 py-2 font-mono text-muted-foreground">
                      {a.urls}
                    </td>
                    <td className="px-2 py-2 font-mono text-muted-foreground">
                      {a.date}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        type="button"
                        data-ocid={`overview.edit_button.${i + 1}`}
                        onClick={() => onNavigate("seo-audit")}
                        className="text-[10px] text-primary hover:underline"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-2">
          <p className="text-[10px] text-muted-foreground/50">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="text-primary/60 hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
