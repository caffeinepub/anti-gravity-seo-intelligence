import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Globe,
  Image,
  Info,
  Link2,
  Loader2,
  Map as MapIcon,
  Minus,
  Play,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import type {
  AuditIssueDetail,
  CrawlSchedule,
  UrlAuditResult,
} from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useAllUrlAuditResults,
  useDeleteSchedule,
  useProjectHistory,
  useSaveProjectHistory,
  useSaveSchedule,
  useSchedules,
  useToggleSchedule,
} from "../hooks/useQueries";

// ─── helpers ────────────────────────────────────────────────────────────────

function scoreColor(n: number) {
  if (n >= 80) return "text-success";
  if (n >= 60) return "text-warning";
  return "text-destructive";
}

function priorityBadge(p: string) {
  if (p === "High") return "badge-error";
  if (p === "Medium") return "badge-warning";
  return "badge-info";
}

function exportCsv(results: UrlAuditResult[]) {
  const rows = [
    [
      "URL",
      "Health Score",
      "Issues",
      "Critical",
      "Performance",
      "SEO Score",
      "Status",
    ].join(","),
    ...results.map((r) =>
      [
        r.url,
        Number(r.healthScore),
        r.issues.length,
        r.issues.filter((i) => i.priority === "High").length,
        Number(r.performanceScore),
        Number(r.seoScore),
        r.status,
      ].join(","),
    ),
  ];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "seo-audit-results.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function exportJson(results: UrlAuditResult[]) {
  const data = results.map((r) => ({
    url: r.url,
    health_score: Number(r.healthScore),
    issues: r.issues.map((i) => ({
      issue: i.issueType,
      priority: i.priority,
      impact: i.impact,
      fix: i.fix,
      effort: i.effort,
      category: i.category,
      ai_example: { before: i.beforeExample, after: i.afterExample },
    })),
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "seo-audit-results.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

// ─── URL Detail Panel ────────────────────────────────────────────────────────

function UrlDetailPanel({
  result,
  onClose,
}: { result: UrlAuditResult; onClose: () => void }) {
  const hs = Number(result.healthScore);
  const perf = Number(result.performanceScore);
  const seo = Number(result.seoScore);
  const acc = Number(result.accessibilityScore);

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-[540px] max-w-full bg-card border-border overflow-y-auto p-0"
      >
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="text-sm font-mono text-primary truncate">
            {result.url}
          </SheetTitle>
        </SheetHeader>
        <div className="p-4 space-y-4">
          {/* Scores row */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Health", val: hs },
              { label: "Perf", val: perf },
              { label: "SEO", val: seo },
              { label: "A11y", val: acc },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-background rounded p-2 text-center"
              >
                <div
                  className={`text-lg font-bold font-mono ${scoreColor(s.val)}`}
                >
                  {s.val}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <Tabs defaultValue="onpage">
            <TabsList className="h-7 text-xs">
              <TabsTrigger value="onpage" className="text-[11px] px-2 py-0.5">
                On-Page
              </TabsTrigger>
              <TabsTrigger
                value="technical"
                className="text-[11px] px-2 py-0.5"
              >
                Technical
              </TabsTrigger>
              <TabsTrigger value="content" className="text-[11px] px-2 py-0.5">
                Content
              </TabsTrigger>
              <TabsTrigger value="issues" className="text-[11px] px-2 py-0.5">
                Issues ({result.issues.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="onpage" className="mt-3 space-y-2">
              {(
                [
                  ["Title", result.onPageData.titleText || "—"],
                  [
                    "Title Length",
                    `${Number(result.onPageData.titleLength)} chars`,
                  ],
                  [
                    "Meta Desc Length",
                    `${Number(result.onPageData.metaDescLength)} chars`,
                  ],
                  ["H1 Count", Number(result.onPageData.h1Count)],
                  ["Has Schema", result.onPageData.hasSchema ? "Yes" : "No"],
                  [
                    "Canonical",
                    result.onPageData.hasCanonical ? "Present" : "Missing",
                  ],
                  ["HTTPS", result.onPageData.isHttps ? "Yes" : "No"],
                  [
                    "SERP Width",
                    `${Number(result.onPageData.serpPixelWidth)}px`,
                  ],
                ] as [string, string | number][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono text-foreground">{String(v)}</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="technical" className="mt-3 space-y-2">
              {(
                [
                  [
                    "LCP",
                    result.coreWebVitals.lcp,
                    result.coreWebVitals.lcpStatus,
                  ],
                  [
                    "CLS",
                    result.coreWebVitals.cls,
                    result.coreWebVitals.clsStatus,
                  ],
                  [
                    "INP",
                    result.coreWebVitals.inp,
                    result.coreWebVitals.inpStatus,
                  ],
                  ["FCP", result.coreWebVitals.fcp, ""],
                  ["TTFB", result.coreWebVitals.ttfb, ""],
                ] as [string, string, string][]
              ).map(([k, v, s]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span
                    className={`font-mono ${s === "PASS" ? "text-success" : s === "FAIL" ? "text-destructive" : "text-warning"}`}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="content" className="mt-3 space-y-2">
              {(
                [
                  ["Word Count", Number(result.contentData.wordCount)],
                  [
                    "Thin Content",
                    result.contentData.isThinContent ? "⚠ Yes" : "✓ No",
                  ],
                  ["Keyword Density", result.contentData.keywordDensity],
                  [
                    "Duplicate Score",
                    `${Number(result.contentData.duplicateScore)}%`,
                  ],
                  ["Images", Number(result.mediaData.imageCount)],
                  ["Missing ALT", Number(result.mediaData.missingAltCount)],
                  ["Large Images", Number(result.mediaData.largeImageCount)],
                ] as [string, string | number][]
              ).map(([k, v]) => (
                <div key={k} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono text-foreground">{String(v)}</span>
                </div>
              ))}
            </TabsContent>
            <TabsContent value="issues" className="mt-3 space-y-2">
              {result.issues.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No issues detected.
                </p>
              )}
              {result.issues.map((issue, i) => (
                <div
                  key={`${issue.issueType}-${i}`}
                  className="bg-background rounded p-2 space-y-1"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${priorityBadge(issue.priority)}`}
                    >
                      {issue.priority}
                    </span>
                    <span className="text-xs font-medium text-foreground">
                      {issue.issueType}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {issue.impact}
                  </p>
                  <p className="text-[11px] text-foreground">{issue.fix}</p>
                  {issue.beforeExample && (
                    <div className="text-[10px] mt-1">
                      <span className="text-destructive">Before: </span>
                      <span className="text-muted-foreground">
                        {issue.beforeExample}
                      </span>
                    </div>
                  )}
                  {issue.afterExample && (
                    <div className="text-[10px]">
                      <span className="text-success">After: </span>
                      <span className="text-muted-foreground">
                        {issue.afterExample}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Crawler Tab ─────────────────────────────────────────────────────────────

interface CrawlerTabProps {
  results: UrlAuditResult[];
  onResultsChange: (r: UrlAuditResult[]) => void;
}

function CrawlerTab({ results, onResultsChange }: CrawlerTabProps) {
  const { actor } = useActor();
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [singleUrl, setSingleUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [selectedResult, setSelectedResult] = useState<UrlAuditResult | null>(
    null,
  );
  const saveHistory = useSaveProjectHistory();
  useEffect(() => {
    const pending = localStorage.getItem("pendingAuditUrl");
    if (pending) {
      setSingleUrl(pending);
      localStorage.removeItem("pendingAuditUrl");
    }
  }, []);

  const runSingle = async () => {
    if (!actor || !singleUrl.trim()) return;
    const trimmed = singleUrl.trim();
    if (!/^https?:\/\/.+/.test(trimmed)) {
      setUrlError("URL must start with http:// or https://");
      return;
    }
    setUrlError("");
    setRunning(true);
    setProgress({ current: 0, total: 1 });
    try {
      // biome-ignore lint/suspicious/noExplicitAny: backend.ts is generated
      const r = await (actor as any).runUrlAudit(trimmed);
      setProgress({ current: 1, total: 1 });
      onResultsChange([r]);
      await saveHistory.mutateAsync({
        id: crypto.randomUUID(),
        name: trimmed,
        urlCount: 1n,
        siteHealthScore: r.healthScore,
        issuesFound: BigInt(r.issues.length),
        createdAt: BigInt(Date.now()),
      });
      toast.success("Audit complete!");
    } catch (err) {
      console.error("[SEOAudit][runUrlAudit] Error:", err);
      toast.error("Audit failed. Check the URL and try again.");
    } finally {
      setRunning(false);
    }
  };

  const runBulk = async () => {
    if (!actor) return;
    const urls = bulkText
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      toast.error("Enter at least one URL");
      return;
    }
    if (urls.length > 500) {
      toast.error("Free tier supports up to 500 URLs");
      return;
    }

    setRunning(true);
    const batches: string[][] = [];
    for (let i = 0; i < urls.length; i += 10)
      batches.push(urls.slice(i, i + 10));
    const allResults: UrlAuditResult[] = [];
    setProgress({ current: 0, total: urls.length });

    for (const batch of batches) {
      try {
        // biome-ignore lint/suspicious/noExplicitAny: backend.ts is generated
        const res = await (actor as any).runBulkAudit(batch);
        allResults.push(...res.results);
        setProgress({ current: allResults.length, total: urls.length });
      } catch {
        toast.error(`Batch failed for ${batch[0]}`);
      }
    }
    onResultsChange(allResults);
    if (allResults.length > 0) {
      const avgHealth = Math.round(
        allResults.reduce((s, r) => s + Number(r.healthScore), 0) /
          allResults.length,
      );
      await saveHistory.mutateAsync({
        id: crypto.randomUUID(),
        name: `Bulk Audit (${urls.length} URLs)`,
        urlCount: BigInt(urls.length),
        siteHealthScore: BigInt(avgHealth),
        issuesFound: BigInt(
          allResults.reduce((s, r) => s + r.issues.length, 0),
        ),
        createdAt: BigInt(Date.now()),
      });
      toast.success(`Audited ${allResults.length} URLs`);
    }
    setRunning(false);
  };

  const overview =
    results.length > 0
      ? {
          total: results.length,
          avgHealth: Math.round(
            results.reduce((s, r) => s + Number(r.healthScore), 0) /
              results.length,
          ),
          totalIssues: results.reduce((s, r) => s + r.issues.length, 0),
          critical: results.reduce(
            (s, r) => s + r.issues.filter((i) => i.priority === "High").length,
            0,
          ),
        }
      : null;

  return (
    <div className="space-y-4">
      {/* Mode switcher */}
      <div className="flex gap-2">
        <button
          type="button"
          data-ocid="crawler.tab"
          onClick={() => setMode("single")}
          className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
            mode === "single"
              ? "bg-primary/20 text-primary"
              : "bg-muted/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          Single URL
        </button>
        <button
          type="button"
          data-ocid="crawler.tab"
          onClick={() => setMode("bulk")}
          className={`text-xs px-3 py-1.5 rounded font-medium transition-colors ${
            mode === "bulk"
              ? "bg-primary/20 text-primary"
              : "bg-muted/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          Bulk URLs (up to 500)
        </button>
      </div>

      {mode === "single" ? (
        <div className="space-y-1">
          <div className="flex gap-2">
            <Input
              data-ocid="crawler.input"
              value={singleUrl}
              onChange={(e) => {
                setSingleUrl(e.target.value);
                if (urlError) setUrlError("");
              }}
              placeholder="https://example.com"
              className="font-mono text-xs h-8"
              onKeyDown={(e) => e.key === "Enter" && runSingle()}
            />
            <Button
              data-ocid="crawler.primary_button"
              size="sm"
              onClick={runSingle}
              disabled={running || !singleUrl.trim()}
              className="h-8 text-xs px-4"
            >
              {running ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <Play size={12} className="mr-1" />
              )}
              Run Deep Audit
            </Button>
          </div>
          {urlError && (
            <p
              data-ocid="crawler.error_state"
              className="text-xs text-destructive"
            >
              {urlError}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            data-ocid="crawler.textarea"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={
              "https://example.com/page1\nhttps://example.com/page2\n(one URL per line, max 500)"
            }
            className="font-mono text-xs min-h-[100px] resize-y"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {bulkText.split("\n").filter(Boolean).length} URLs entered
              {bulkText.split("\n").filter(Boolean).length > 10 &&
                " — will be processed in batches of 10"}
            </span>
            <Button
              data-ocid="crawler.primary_button"
              size="sm"
              onClick={runBulk}
              disabled={running}
              className="h-8 text-xs px-4"
            >
              {running ? (
                <Loader2 size={12} className="animate-spin mr-1" />
              ) : (
                <Play size={12} className="mr-1" />
              )}
              Run Bulk Audit
            </Button>
          </div>
        </div>
      )}

      {/* Progress */}
      {running && (
        <div data-ocid="crawler.loading_state" className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Auditing {progress.current} / {progress.total} URLs...
            </span>
            <span className="font-mono">
              {progress.total > 0
                ? Math.round((progress.current / progress.total) * 100)
                : 0}
              %
            </span>
          </div>
          <Progress
            value={
              progress.total > 0 ? (progress.current / progress.total) * 100 : 0
            }
            className="h-1.5"
          />
        </div>
      )}

      {/* Overview cards */}
      {overview && (
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: "URLs Audited",
              val: overview.total,
              color: "text-primary",
            },
            {
              label: "Avg Health Score",
              val: `${overview.avgHealth}/100`,
              color: scoreColor(overview.avgHealth),
            },
            {
              label: "Total Issues",
              val: overview.totalIssues,
              color: "text-warning",
            },
            {
              label: "Critical Issues",
              val: overview.critical,
              color: "text-destructive",
            },
          ].map((c) => (
            <Card key={c.label} className="bg-card border-border">
              <CardContent className="p-3">
                <div className={`text-xl font-bold font-mono ${c.color}`}>
                  {c.val}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {c.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results table */}
      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Audit Results
            </span>
            <Button
              data-ocid="crawler.secondary_button"
              size="sm"
              variant="outline"
              onClick={() => exportCsv(results)}
              className="h-6 text-[10px] px-2"
            >
              <Download size={10} className="mr-1" /> Export CSV
            </Button>
          </div>
          <div className="border border-border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  {[
                    "URL",
                    "Health",
                    "Issues",
                    "Critical",
                    "Perf",
                    "SEO",
                    "Status",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => {
                  const hs = Number(r.healthScore);
                  return (
                    <tr
                      key={r.url}
                      data-ocid={`crawler.item.${i + 1}`}
                      className="data-row border-b border-border/40"
                      onClick={() => setSelectedResult(r)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && setSelectedResult(r)
                      }
                    >
                      <td className="px-2 py-1.5 font-mono text-primary max-w-[200px] truncate">
                        {r.url}
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={`font-mono font-bold ${scoreColor(hs)}`}
                        >
                          {hs}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 font-mono text-muted-foreground">
                        {r.issues.length}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-destructive">
                        {r.issues.filter((x) => x.priority === "High").length}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-muted-foreground">
                        {Number(r.performanceScore)}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-muted-foreground">
                        {Number(r.seoScore)}
                      </td>
                      <td className="px-2 py-1.5">
                        <span
                          className={`text-[10px] font-semibold ${
                            r.status === "success"
                              ? "text-success"
                              : r.status === "error"
                                ? "text-destructive"
                                : "text-warning"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-2 py-1.5">
                        <button
                          type="button"
                          className="text-[10px] text-primary hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedResult(r);
                          }}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedResult && (
        <UrlDetailPanel
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}

// ─── Issues Tab ───────────────────────────────────────────────────────────────

function IssuesTab({ results }: { results: UrlAuditResult[] }) {
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showAI, setShowAI] = useState(false);

  const allIssues: (AuditIssueDetail & { url: string })[] = results.flatMap(
    (r) => r.issues.map((i) => ({ ...i, url: r.url })),
  );

  const filtered = allIssues
    .filter((i) => priorityFilter === "all" || i.priority === priorityFilter)
    .filter((i) => categoryFilter === "all" || i.category === categoryFilter)
    .sort((a, b) => {
      const order: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
      return (order[a.priority] ?? 3) - (order[b.priority] ?? 3);
    });

  const categories = Array.from(
    new Set(allIssues.map((i) => i.category)),
  ).filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger data-ocid="issues.select" className="w-32 h-7 text-xs">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger data-ocid="issues.select" className="w-36 h-7 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <button
          type="button"
          data-ocid="issues.toggle"
          onClick={() => setShowAI(!showAI)}
          className={`text-xs px-3 py-1 rounded flex items-center gap-1 transition-colors ${
            showAI
              ? "bg-primary/20 text-primary"
              : "bg-muted/40 text-muted-foreground"
          }`}
        >
          <Bot size={11} /> AI Format
        </button>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {filtered.length} issues
        </span>
      </div>

      {filtered.length === 0 && (
        <div
          data-ocid="issues.empty_state"
          className="text-center py-8 text-muted-foreground text-sm"
        >
          No issues found. Run an audit first.
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((issue, idx) => (
          <div
            key={`${issue.issueType}::${issue.url}`}
            data-ocid={`issues.item.${idx + 1}`}
            className="bg-card border border-border rounded p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${priorityBadge(issue.priority)}`}
                >
                  {issue.priority}
                </span>
                {issue.category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">
                    {issue.category}
                  </span>
                )}
                <span className="text-xs font-semibold text-foreground">
                  {issue.issueType}
                </span>
              </div>
              {issue.effort && (
                <span className="text-[10px] text-muted-foreground shrink-0">
                  Effort: {issue.effort}
                </span>
              )}
            </div>

            {showAI ? (
              <div className="space-y-1 text-[11px] bg-background rounded p-2">
                <div>
                  <span className="text-muted-foreground">Issue → </span>
                  <span>{issue.issueType}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Impact → </span>
                  <span className="text-warning">{issue.impact}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Fix → </span>
                  <span>{issue.fix}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Priority → </span>
                  <span
                    className={
                      issue.priority === "High"
                        ? "text-destructive"
                        : issue.priority === "Medium"
                          ? "text-warning"
                          : "text-primary"
                    }
                  >
                    {issue.priority}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Effort → </span>
                  <span>{issue.effort}</span>
                </div>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground">
                  {issue.impact}
                </p>
                <p className="text-[11px] text-foreground">{issue.fix}</p>
              </>
            )}

            {(issue.beforeExample || issue.afterExample) && (
              <div className="grid grid-cols-2 gap-2">
                {issue.beforeExample && (
                  <div className="bg-destructive/10 rounded p-2 text-[10px]">
                    <div className="text-destructive font-semibold mb-0.5">
                      Before
                    </div>
                    <div className="text-muted-foreground">
                      {issue.beforeExample}
                    </div>
                  </div>
                )}
                {issue.afterExample && (
                  <div className="bg-success/10 rounded p-2 text-[10px]">
                    <div className="text-success font-semibold mb-0.5">
                      After
                    </div>
                    <div className="text-muted-foreground">
                      {issue.afterExample}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-[10px] text-muted-foreground font-mono truncate">
              {issue.url}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── On-Page Tab ──────────────────────────────────────────────────────────────

function OnPageTab({ results }: { results: UrlAuditResult[] }) {
  if (results.length === 0)
    return (
      <EmptyState
        message="Run an audit to see on-page analysis"
        ocid="onpage.empty_state"
      />
    );

  return (
    <div className="border border-border rounded overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/30 border-b border-border">
            {[
              "URL",
              "Title",
              "Title Len",
              "Meta Len",
              "H1 Count",
              "Schema",
              "Canonical",
              "SERP Width",
            ].map((h) => (
              <th
                key={h}
                className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const tl = Number(r.onPageData.titleLength);
            const ml = Number(r.onPageData.metaDescLength);
            const sw = Number(r.onPageData.serpPixelWidth);
            return (
              <tr
                key={r.url}
                data-ocid={`onpage.item.${i + 1}`}
                className="data-row border-b border-border/40"
              >
                <td className="px-2 py-1.5 font-mono text-primary max-w-[160px] truncate">
                  {r.url}
                </td>
                <td className="px-2 py-1.5 max-w-[180px] truncate text-foreground">
                  {r.onPageData.titleText || "—"}
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={`font-mono ${tl < 30 || tl > 60 ? "text-destructive" : tl < 50 ? "text-warning" : "text-success"}`}
                  >
                    {tl}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={`font-mono ${ml < 50 ? "text-destructive" : ml > 160 ? "text-warning" : "text-success"}`}
                  >
                    {ml}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={`font-mono ${Number(r.onPageData.h1Count) === 1 ? "text-success" : "text-destructive"}`}
                  >
                    {Number(r.onPageData.h1Count)}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={
                      r.onPageData.hasSchema
                        ? "text-success"
                        : "text-destructive"
                    }
                  >
                    {r.onPageData.hasSchema ? "✓" : "✗"}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={
                      r.onPageData.hasCanonical
                        ? "text-success"
                        : "text-warning"
                    }
                  >
                    {r.onPageData.hasCanonical ? "✓" : "—"}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-16 bg-muted/30 rounded h-1.5">
                      <div
                        className={`h-1.5 rounded ${sw > 600 ? "bg-destructive" : "bg-success"}`}
                        style={{ width: `${Math.min(100, (sw / 600) * 100)}%` }}
                      />
                    </div>
                    <span
                      className={`font-mono text-[10px] ${sw > 600 ? "text-destructive" : "text-success"}`}
                    >
                      {sw}px
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Technical Tab ────────────────────────────────────────────────────────────

function TechnicalTab({ results }: { results: UrlAuditResult[] }) {
  if (results.length === 0)
    return (
      <EmptyState
        message="Run an audit to see technical SEO data"
        ocid="technical.empty_state"
      />
    );

  return (
    <div className="space-y-3">
      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {[
                "URL",
                "HTTPS",
                "Canonical",
                "Schema",
                "LCP",
                "CLS",
                "INP",
                "FCP",
                "TTFB",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const cv = r.coreWebVitals;
              return (
                <tr
                  key={r.url}
                  data-ocid={`technical.item.${i + 1}`}
                  className="data-row border-b border-border/40"
                >
                  <td className="px-2 py-1.5 font-mono text-primary max-w-[160px] truncate">
                    {r.url}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={
                        r.onPageData.isHttps
                          ? "text-success"
                          : "text-destructive"
                      }
                    >
                      {r.onPageData.isHttps ? "✓" : "✗"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={
                        r.onPageData.hasCanonical
                          ? "text-success"
                          : "text-warning"
                      }
                    >
                      {r.onPageData.hasCanonical ? "✓" : "—"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={
                        r.onPageData.hasSchema
                          ? "text-success"
                          : "text-muted-foreground"
                      }
                    >
                      {r.onPageData.hasSchema ? "✓" : "—"}
                    </span>
                  </td>
                  {[
                    { v: cv.lcp, s: cv.lcpStatus, k: "lcp" },
                    { v: cv.cls, s: cv.clsStatus, k: "cls" },
                    { v: cv.inp, s: cv.inpStatus, k: "inp" },
                    { v: cv.fcp, s: "", k: "fcp" },
                    { v: cv.ttfb, s: "", k: "ttfb" },
                  ].map(({ v, s, k }) => (
                    <td key={k} className="px-2 py-1.5">
                      <span
                        className={`font-mono text-[10px] ${s === "PASS" ? "text-success" : s === "FAIL" ? "text-destructive" : "text-muted-foreground"}`}
                      >
                        {v || "—"}
                      </span>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Content Intelligence Tab ─────────────────────────────────────────────────

function ContentTab({ results }: { results: UrlAuditResult[] }) {
  if (results.length === 0)
    return (
      <EmptyState
        message="Run an audit to see content intelligence"
        ocid="content.empty_state"
      />
    );

  const chartData = results.slice(0, 20).map((r) => ({
    url: r.url.replace(/https?:\/\/[^/]+/, "").slice(0, 20) || "/",
    words: Number(r.contentData.wordCount),
    fill: r.contentData.isThinContent
      ? "oklch(var(--destructive))"
      : "oklch(var(--chart-2))",
  }));

  return (
    <div className="space-y-4">
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 8, left: 0, bottom: 20 }}
          >
            <XAxis
              dataKey="url"
              tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(var(--popover))",
                border: "1px solid oklch(var(--border))",
                borderRadius: 4,
                fontSize: 10,
              }}
            />
            <Bar dataKey="words" name="Word Count" radius={[2, 2, 0, 0]}>
              {chartData.map((d) => (
                <Cell key={d.url} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {[
                "URL",
                "Word Count",
                "Thin Content",
                "Keyword Density",
                "Duplicate Score",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr
                key={r.url}
                data-ocid={`content.item.${i + 1}`}
                className="data-row border-b border-border/40"
              >
                <td className="px-2 py-1.5 font-mono text-primary max-w-[180px] truncate">
                  {r.url}
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={`font-mono ${Number(r.contentData.wordCount) < 300 ? "text-destructive" : "text-success"}`}
                  >
                    {Number(r.contentData.wordCount)}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={
                      r.contentData.isThinContent
                        ? "badge-error text-[10px] px-1.5 py-0.5 rounded"
                        : "text-success text-[10px]"
                    }
                  >
                    {r.contentData.isThinContent ? "⚠ Thin" : "✓ OK"}
                  </span>
                </td>
                <td className="px-2 py-1.5 font-mono text-muted-foreground">
                  {r.contentData.keywordDensity}
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={`font-mono ${Number(r.contentData.duplicateScore) > 50 ? "text-warning" : "text-success"}`}
                  >
                    {Number(r.contentData.duplicateScore)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Media Tab ────────────────────────────────────────────────────────────────

function MediaTab({ results }: { results: UrlAuditResult[] }) {
  if (results.length === 0)
    return (
      <EmptyState
        message="Run an audit to see media SEO data"
        ocid="media.empty_state"
      />
    );

  const totals = results.reduce(
    (acc, r) => ({
      images: acc.images + Number(r.mediaData.imageCount),
      missingAlt: acc.missingAlt + Number(r.mediaData.missingAltCount),
      large: acc.large + Number(r.mediaData.largeImageCount),
    }),
    { images: 0, missingAlt: 0, large: 0 },
  );
  const altCoverage =
    totals.images > 0
      ? Math.round(((totals.images - totals.missingAlt) / totals.images) * 100)
      : 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Images", val: totals.images, color: "text-primary" },
          {
            label: "Missing ALT",
            val: totals.missingAlt,
            color: "text-destructive",
          },
          {
            label: "Oversized Images",
            val: totals.large,
            color: "text-warning",
          },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="p-3">
              <div className={`text-xl font-bold font-mono ${c.color}`}>
                {c.val}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {c.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">ALT Text Coverage</span>
          <span
            className={`font-mono ${altCoverage >= 80 ? "text-success" : "text-warning"}`}
          >
            {altCoverage}%
          </span>
        </div>
        <Progress value={altCoverage} className="h-2" />
      </div>

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {[
                "URL",
                "Images",
                "Missing ALT",
                "ALT Coverage",
                "Large Images",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => {
              const imgs = Number(r.mediaData.imageCount);
              const missing = Number(r.mediaData.missingAltCount);
              const cov =
                imgs > 0 ? Math.round(((imgs - missing) / imgs) * 100) : 100;
              return (
                <tr
                  key={r.url}
                  data-ocid={`media.item.${i + 1}`}
                  className="data-row border-b border-border/40"
                >
                  <td className="px-2 py-1.5 font-mono text-primary max-w-[180px] truncate">
                    {r.url}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-muted-foreground">
                    {imgs}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`font-mono ${missing > 0 ? "text-destructive" : "text-success"}`}
                    >
                      {missing}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <div className="w-12 bg-muted/30 rounded h-1.5">
                        <div
                          className={`h-1.5 rounded ${cov >= 80 ? "bg-success" : "bg-warning"}`}
                          style={{ width: `${cov}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {cov}%
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`font-mono ${Number(r.mediaData.largeImageCount) > 0 ? "text-warning" : "text-success"}`}
                    >
                      {Number(r.mediaData.largeImageCount)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Architecture Tab ─────────────────────────────────────────────────────────

function ArchitectureTab({ results }: { results: UrlAuditResult[] }) {
  if (results.length === 0)
    return (
      <EmptyState
        message="Run an audit to see site architecture data"
        ocid="architecture.empty_state"
      />
    );

  const orphans = results.filter((r) => r.architectureData.isOrphan);
  const radarData = results.slice(0, 6).map((r) => ({
    url: r.url.replace(/https?:\/\/[^/]+/, "").slice(0, 15) || "/",
    score: Number(r.architectureData.internalLinkScore),
    links: Number(r.architectureData.internalLinkCount),
    depth: Number(r.architectureData.crawlDepth),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Pages", val: results.length, color: "text-primary" },
          {
            label: "Orphan Pages",
            val: orphans.length,
            color: "text-destructive",
          },
          {
            label: "Avg Link Score",
            val: Math.round(
              results.reduce(
                (s, r) => s + Number(r.architectureData.internalLinkScore),
                0,
              ) / results.length,
            ),
            color: "text-success",
          },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="p-3">
              <div className={`text-xl font-bold font-mono ${c.color}`}>
                {c.val}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {c.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {radarData.length > 2 && (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="oklch(var(--border))" />
              <PolarAngleAxis
                dataKey="url"
                tick={{ fontSize: 9, fill: "oklch(var(--muted-foreground))" }}
              />
              <Radar
                name="Link Score"
                dataKey="score"
                stroke="oklch(var(--primary))"
                fill="oklch(var(--primary))"
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{
                  background: "oklch(var(--popover))",
                  border: "1px solid oklch(var(--border))",
                  borderRadius: 4,
                  fontSize: 10,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {orphans.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-destructive mb-2">
            ⚠ Orphan Pages ({orphans.length})
          </div>
          <div className="space-y-1">
            {orphans.map((r, i) => (
              <div
                key={r.url}
                data-ocid={`architecture.item.${i + 1}`}
                className="text-[11px] font-mono text-destructive bg-destructive/10 px-2 py-1 rounded"
              >
                {r.url}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {[
                "URL",
                "Crawl Depth",
                "Internal Links",
                "Link Score",
                "Orphan",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr
                key={r.url}
                data-ocid={`architecture.row.${i + 1}`}
                className="data-row border-b border-border/40"
              >
                <td className="px-2 py-1.5 font-mono text-primary max-w-[180px] truncate">
                  {r.url}
                </td>
                <td className="px-2 py-1.5 font-mono text-muted-foreground">
                  {Number(r.architectureData.crawlDepth)}
                </td>
                <td className="px-2 py-1.5 font-mono text-muted-foreground">
                  {Number(r.architectureData.internalLinkCount)}
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-12 bg-muted/30 rounded h-1.5">
                      <div
                        className="h-1.5 rounded bg-primary"
                        style={{
                          width: `${Number(r.architectureData.internalLinkScore)}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {Number(r.architectureData.internalLinkScore)}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={
                      r.architectureData.isOrphan
                        ? "text-destructive"
                        : "text-success"
                    }
                  >
                    {r.architectureData.isOrphan ? "⚠ Yes" : "✓ No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── International Tab ────────────────────────────────────────────────────────

function InternationalTab({ results }: { results: UrlAuditResult[] }) {
  const [logContent, setLogContent] = useState("");
  const [botCount, setBotCount] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setLogContent(text);
      const matches = (text.match(/Googlebot/gi) || []).length;
      setBotCount(matches);
      toast.success(`Log parsed: ${matches} Googlebot mentions found`);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {results.length === 0 ? (
        <EmptyState
          message="Run an audit to see international SEO data"
          ocid="international.empty_state"
        />
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {[
                  "URL",
                  "Has Hreflang",
                  "Hreflang Count",
                  "Missing Return Tags",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={r.url}
                  data-ocid={`international.item.${i + 1}`}
                  className="data-row border-b border-border/40"
                >
                  <td className="px-2 py-1.5 font-mono text-primary max-w-[200px] truncate">
                    {r.url}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={
                        r.internationalData.hasHreflang
                          ? "text-success"
                          : "text-muted-foreground"
                      }
                    >
                      {r.internationalData.hasHreflang ? "✓ Yes" : "—"}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-mono text-muted-foreground">
                    {Number(r.internationalData.hreflangCount)}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={
                        r.internationalData.missingReturnTags
                          ? "text-destructive"
                          : "text-success"
                      }
                    >
                      {r.internationalData.missingReturnTags
                        ? "⚠ Missing"
                        : "✓ OK"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Log File Analyzer
        </div>
        <p className="text-[11px] text-muted-foreground">
          Upload a server log file (.log) to detect Googlebot crawl frequency.
        </p>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".log,.txt"
            className="hidden"
            onChange={handleLogUpload}
          />
          <Button
            data-ocid="international.upload_button"
            size="sm"
            variant="outline"
            onClick={() => fileRef.current?.click()}
            className="h-7 text-xs"
          >
            <Upload size={11} className="mr-1" /> Upload Log File
          </Button>
          {botCount !== null && (
            <span className="text-xs text-success font-mono">
              Googlebot mentions: {botCount}
            </span>
          )}
        </div>
        {logContent && (
          <div className="bg-background rounded p-2 max-h-32 overflow-y-auto">
            <pre className="text-[10px] font-mono text-muted-foreground whitespace-pre-wrap">
              {logContent.slice(0, 2000)}
              {logContent.length > 2000 ? "..." : ""}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Education Tab ────────────────────────────────────────────────────────────

function EducationTab({ results }: { results: UrlAuditResult[] }) {
  if (results.length === 0)
    return (
      <EmptyState
        message="Run an audit to see education publishing data"
        ocid="education.empty_state"
      />
    );

  const withBook = results.filter((r) => r.educationData.hasBookSchema).length;
  const withProduct = results.filter(
    (r) => r.educationData.hasProductSchema,
  ).length;
  const withGaps = results.filter(
    (r) => r.educationData.indexingGapsDetected,
  ).length;
  const avgCbse = Math.round(
    results.reduce((s, r) => s + Number(r.educationData.cbseContentScore), 0) /
      results.length,
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Book Schema",
            val: `${withBook}/${results.length}`,
            color: "text-primary",
          },
          {
            label: "Product Schema",
            val: `${withProduct}/${results.length}`,
            color: "text-success",
          },
          { label: "Indexing Gaps", val: withGaps, color: "text-destructive" },
          { label: "Avg CBSE Score", val: avgCbse, color: scoreColor(avgCbse) },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="p-3">
              <div className={`text-xl font-bold font-mono ${c.color}`}>
                {c.val}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {c.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={12} /> Education Publishing Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          {[
            {
              text: "Add Book schema markup to all textbook and course pages for Google rich results.",
              icon: "📚",
            },
            {
              text: "Ensure Product schema includes ISBN, author, publisher, and educational level for CBSE/NEP alignment.",
              icon: "🏷️",
            },
            {
              text: "Check indexing gaps — pages with no inbound internal links won't be discovered by Googlebot.",
              icon: "🔍",
            },
            {
              text: "CBSE/NEP content: include subject keywords, grade level, and curriculum alignment in page titles.",
              icon: "📝",
            },
            {
              text: "Implement hreflang for multilingual educational content (Hindi/English/regional).",
              icon: "🌐",
            },
          ].map((rec) => (
            <div key={rec.text} className="flex items-start gap-2 text-[11px]">
              <span>{rec.icon}</span>
              <span className="text-muted-foreground">{rec.text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="border border-border rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {[
                "URL",
                "Book Schema",
                "Product Schema",
                "CBSE Score",
                "Indexing Gaps",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr
                key={r.url}
                data-ocid={`education.item.${i + 1}`}
                className="data-row border-b border-border/40"
              >
                <td className="px-2 py-1.5 font-mono text-primary max-w-[180px] truncate">
                  {r.url}
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={
                      r.educationData.hasBookSchema
                        ? "text-success"
                        : "text-muted-foreground"
                    }
                  >
                    {r.educationData.hasBookSchema ? "✓" : "—"}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={
                      r.educationData.hasProductSchema
                        ? "text-success"
                        : "text-muted-foreground"
                    }
                  >
                    {r.educationData.hasProductSchema ? "✓" : "—"}
                  </span>
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1">
                    <div className="w-12 bg-muted/30 rounded h-1.5">
                      <div
                        className={`h-1.5 rounded ${Number(r.educationData.cbseContentScore) >= 70 ? "bg-success" : "bg-warning"}`}
                        style={{
                          width: `${Number(r.educationData.cbseContentScore)}%`,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {Number(r.educationData.cbseContentScore)}
                    </span>
                  </div>
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className={
                      r.educationData.indexingGapsDetected
                        ? "text-destructive"
                        : "text-success"
                    }
                  >
                    {r.educationData.indexingGapsDetected ? "⚠ Yes" : "✓ No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Automation Tab ───────────────────────────────────────────────────────────

function AutomationTab() {
  const { data: schedules = [], isLoading: loadingSchedules } = useSchedules();
  const { data: history = [], isLoading: loadingHistory } = useProjectHistory();
  const saveSchedule = useSaveSchedule();
  const deleteSchedule = useDeleteSchedule();
  const toggleSchedule = useToggleSchedule();

  const [form, setForm] = useState({ name: "", urls: "", frequency: "weekly" });
  const [showForm, setShowForm] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Enter a schedule name");
      return;
    }
    await saveSchedule.mutateAsync({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      urls: form.urls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean),
      frequency: form.frequency,
      nextRun: BigInt(Date.now() + 86400000),
      lastRun: null,
      isActive: true,
    });
    setForm({ name: "", urls: "", frequency: "weekly" });
    setShowForm(false);
    toast.success("Schedule saved");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Crawl Schedules
        </span>
        <Button
          data-ocid="automation.open_modal_button"
          size="sm"
          onClick={() => setShowForm(!showForm)}
          className="h-7 text-xs"
        >
          <Plus size={11} className="mr-1" /> New Schedule
        </Button>
      </div>

      {showForm && (
        <Card data-ocid="automation.card" className="bg-card border-border">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-[11px]">Schedule Name</Label>
              <Input
                data-ocid="automation.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Weekly site audit"
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">URLs (one per line)</Label>
              <Textarea
                data-ocid="automation.textarea"
                value={form.urls}
                onChange={(e) =>
                  setForm((p) => ({ ...p, urls: e.target.value }))
                }
                placeholder="https://example.com"
                className="text-xs min-h-[60px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Frequency</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) => setForm((p) => ({ ...p, frequency: v }))}
              >
                <SelectTrigger
                  data-ocid="automation.select"
                  className="h-7 text-xs w-36"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                data-ocid="automation.submit_button"
                size="sm"
                onClick={handleSave}
                disabled={saveSchedule.isPending}
                className="h-7 text-xs"
              >
                {saveSchedule.isPending && (
                  <Loader2 size={10} className="animate-spin mr-1" />
                )}{" "}
                Save
              </Button>
              <Button
                data-ocid="automation.cancel_button"
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loadingSchedules ? (
        <div data-ocid="automation.loading_state" className="space-y-2">
          {[1, 2].map((n) => (
            <Skeleton key={n} className="h-10 rounded" />
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div
          data-ocid="automation.empty_state"
          className="text-xs text-muted-foreground text-center py-4"
        >
          No schedules yet.
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map((s, i) => (
            <div
              key={s.id}
              data-ocid={`automation.item.${i + 1}`}
              className="flex items-center justify-between bg-card border border-border rounded px-3 py-2"
            >
              <div>
                <div className="text-xs font-medium text-foreground">
                  {s.name}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {s.frequency} · {s.urls.length} URLs
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${s.isActive ? "badge-success" : "bg-muted/40 text-muted-foreground"}`}
                >
                  {s.isActive ? "Active" : "Paused"}
                </span>
                <button
                  type="button"
                  data-ocid={`automation.toggle.${i + 1}`}
                  onClick={() => toggleSchedule.mutate(s.id)}
                  className="text-[10px] text-primary hover:underline"
                >
                  {s.isActive ? "Pause" : "Resume"}
                </button>
                <button
                  type="button"
                  data-ocid={`automation.delete_button.${i + 1}`}
                  onClick={() => deleteSchedule.mutate(s.id)}
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Project History
      </div>
      {loadingHistory ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-10 rounded" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div
          data-ocid="automation.empty_state"
          className="text-xs text-muted-foreground text-center py-4"
        >
          No project history yet. Run an audit to create history.
        </div>
      ) : (
        <div className="border border-border rounded overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {["Name", "URLs", "Health", "Issues", "Date"].map((h) => (
                  <th
                    key={h}
                    className="px-2 py-1.5 text-left text-[10px] font-semibold text-muted-foreground uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr
                  key={h.id}
                  data-ocid={`automation.row.${i + 1}`}
                  className="data-row border-b border-border/40"
                >
                  <td className="px-2 py-1.5 text-foreground">{h.name}</td>
                  <td className="px-2 py-1.5 font-mono text-muted-foreground">
                    {Number(h.urlCount)}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`font-mono font-bold ${scoreColor(Number(h.siteHealthScore))}`}
                    >
                      {Number(h.siteHealthScore)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 font-mono text-warning">
                    {Number(h.issuesFound)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-muted-foreground">
                    {new Date(Number(h.createdAt)).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Reporting Tab ────────────────────────────────────────────────────────────

function ReportingTab({ results }: { results: UrlAuditResult[] }) {
  const allIssues = results.flatMap((r) => r.issues);
  const categories = Array.from(
    new Set(allIssues.map((i) => i.category).filter(Boolean)),
  );
  const pieData = categories.map((cat) => ({
    name: cat,
    value: allIssues.filter((i) => i.category === cat).length,
  }));
  const PIE_COLORS = [
    "oklch(var(--chart-1))",
    "oklch(var(--chart-2))",
    "oklch(var(--chart-3))",
    "oklch(var(--chart-4))",
    "oklch(var(--chart-5))",
  ];

  const avgHealth =
    results.length > 0
      ? Math.round(
          results.reduce((s, r) => s + Number(r.healthScore), 0) /
            results.length,
        )
      : 0;

  const top5Types = Object.entries(
    allIssues.reduce((acc: Record<string, number>, i) => {
      acc[i.issueType] = (acc[i.issueType] || 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total URLs Audited",
            val: results.length,
            color: "text-primary",
          },
          {
            label: "Avg Health Score",
            val: avgHealth,
            color: scoreColor(avgHealth),
          },
          {
            label: "Total Issues Found",
            val: allIssues.length,
            color: "text-warning",
          },
        ].map((c) => (
          <Card key={c.label} className="bg-card border-border">
            <CardContent className="p-3">
              <div className={`text-xl font-bold font-mono ${c.color}`}>
                {c.val}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {c.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Issues by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-3">
            {pieData.length > 0 ? (
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[i % PIE_COLORS.length]}
                      />
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
            ) : (
              <p className="text-xs text-muted-foreground py-8">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-1 pt-3 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Top 5 Issue Types
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            {top5Types.length === 0 ? (
              <p className="text-xs text-muted-foreground">No issues yet</p>
            ) : (
              top5Types.map(([type, count]) => (
                <div key={type}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                      {type}
                    </span>
                    <span className="text-[11px] font-mono text-foreground">
                      {count}
                    </span>
                  </div>
                  <Progress
                    value={
                      allIssues.length > 0
                        ? (count / allIssues.length) * 100
                        : 0
                    }
                    className="h-1"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button
          data-ocid="reporting.primary_button"
          size="sm"
          onClick={() => exportCsv(results)}
          disabled={results.length === 0}
          className="h-8 text-xs"
        >
          <Download size={12} className="mr-1" /> Export CSV
        </Button>
        <Button
          data-ocid="reporting.secondary_button"
          size="sm"
          variant="outline"
          onClick={() => exportJson(results)}
          disabled={results.length === 0}
          className="h-8 text-xs"
        >
          <FileText size={12} className="mr-1" /> Export JSON
        </Button>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ message, ocid }: { message: string; ocid: string }) {
  return (
    <div data-ocid={ocid} className="text-center py-12">
      <Search size={28} className="mx-auto text-muted-foreground/30 mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// ─── Main SEOAudit Component ──────────────────────────────────────────────────

export function SEOAudit() {
  const [auditResults, setAuditResults] = useState<UrlAuditResult[]>([]);
  const { data: storedResults = [] } = useAllUrlAuditResults();

  // Merge live + stored results (live takes priority)
  const allResults = auditResults.length > 0 ? auditResults : storedResults;

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-foreground">
              SEO Audit Engine
            </h1>
            <p className="text-[11px] text-muted-foreground">
              AI-powered audit: crawl, analyze, and fix SEO issues at scale
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-[10px] text-muted-foreground">
              Free Tier · 500 URLs
            </span>
          </div>
        </div>

        <Tabs defaultValue="crawler">
          <ScrollArea className="w-full" type="scroll">
            <TabsList className="h-8 text-xs bg-muted/30 flex w-full justify-start gap-0.5 p-0.5 overflow-x-auto">
              {[
                { value: "crawler", label: "Crawler", icon: Search },
                { value: "issues", label: "Issues", icon: AlertTriangle },
                { value: "onpage", label: "On-Page", icon: FileText },
                { value: "technical", label: "Technical", icon: Shield },
                { value: "content", label: "Content", icon: Bot },
                { value: "media", label: "Media", icon: Image },
                { value: "architecture", label: "Architecture", icon: MapIcon },
                { value: "international", label: "International", icon: Globe },
                { value: "education", label: "Education", icon: BookOpen },
                { value: "automation", label: "Automation", icon: Calendar },
                { value: "reporting", label: "Reporting", icon: TrendingUp },
              ].map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  data-ocid={`seoaudit.${value}.tab`}
                  className="text-[11px] h-7 px-2.5 flex items-center gap-1 shrink-0"
                >
                  <Icon size={10} />
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          <div className="mt-3">
            <TabsContent value="crawler">
              <CrawlerTab
                results={allResults}
                onResultsChange={setAuditResults}
              />
            </TabsContent>
            <TabsContent value="issues">
              <IssuesTab results={allResults} />
            </TabsContent>
            <TabsContent value="onpage">
              <OnPageTab results={allResults} />
            </TabsContent>
            <TabsContent value="technical">
              <TechnicalTab results={allResults} />
            </TabsContent>
            <TabsContent value="content">
              <ContentTab results={allResults} />
            </TabsContent>
            <TabsContent value="media">
              <MediaTab results={allResults} />
            </TabsContent>
            <TabsContent value="architecture">
              <ArchitectureTab results={allResults} />
            </TabsContent>
            <TabsContent value="international">
              <InternationalTab results={allResults} />
            </TabsContent>
            <TabsContent value="education">
              <EducationTab results={allResults} />
            </TabsContent>
            <TabsContent value="automation">
              <AutomationTab />
            </TabsContent>
            <TabsContent value="reporting">
              <ReportingTab results={allResults} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="text-center py-2">
          <p className="text-[10px] text-muted-foreground/50">
            © {new Date().getFullYear()}. Built with ❤ using{" "}
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
