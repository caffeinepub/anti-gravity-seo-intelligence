import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useAllUrlAuditResults } from "../hooks/useQueries";

export function TechnicalAudit() {
  const { actor, isFetching } = useActor();
  const [filter, setFilter] = useState<string>("all");

  const { data: issues, isLoading: loadingIssues } = useQuery({
    queryKey: ["auditIssues"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllAuditIssues();
      } catch (err) {
        console.error("[TechnicalAudit][getAllAuditIssues] Error:", err);
        toast.error("Failed to load audit issues");
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const { data: urlResults, isLoading: loadingUrls } = useAllUrlAuditResults();

  const issueList = (issues ?? []).map((i) => ({
    ...i,
    affectedPages: Number(i.affectedPages),
  }));
  const filtered =
    filter === "all"
      ? issueList
      : issueList.filter((i) => i.severity === filter);

  // Get CWV from the most recent URL audit result if available
  const latestResult =
    urlResults && urlResults.length > 0 ? urlResults[0] : null;
  const cwv = latestResult?.coreWebVitals ?? null;

  const vitals = cwv
    ? [
        {
          metric: "LCP",
          value: cwv.lcp,
          status: cwv.lcpStatus,
          target: "< 2.5s",
        },
        {
          metric: "CLS",
          value: cwv.cls,
          status: cwv.clsStatus,
          target: "< 0.1",
        },
        {
          metric: "INP",
          value: cwv.inp,
          status: cwv.inpStatus,
          target: "< 200ms",
        },
        { metric: "FCP", value: cwv.fcp, status: "", target: "< 1.8s" },
        { metric: "TTFB", value: cwv.ttfb, status: "", target: "< 600ms" },
        {
          metric: "Speed",
          value: cwv.speedIndex,
          status: "",
          target: "< 3.4s",
        },
      ]
    : [];

  const severityColor = (s: string) =>
    s === "critical" ? "#FF4D4D" : s === "warning" ? "#FFC107" : "#2AA9FF";
  const severityBg = (s: string) =>
    s === "critical"
      ? "rgba(255,77,77,0.12)"
      : s === "warning"
        ? "rgba(255,193,7,0.12)"
        : "rgba(42,169,255,0.12)";

  const isLoading = loadingIssues || loadingUrls;

  return (
    <div className="space-y-5">
      {/* Core Web Vitals */}
      <div className="card-seo p-5">
        <h3
          className="text-xs font-bold uppercase tracking-wider mb-4"
          style={{ color: "#8FA3B8" }}
        >
          Core Web Vitals
        </h3>
        {loadingUrls ? (
          <div className="grid grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-lg"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : vitals.length === 0 ? (
          <div className="py-8 text-center">
            <RefreshCw
              size={22}
              style={{ color: "#8FA3B8", margin: "0 auto 8px" }}
            />
            <p className="text-sm font-medium" style={{ color: "#EAF1FF" }}>
              No Core Web Vitals data yet
            </p>
            <p className="text-xs mt-1" style={{ color: "#6F839A" }}>
              Run an audit in the SEO Audit tab to populate Core Web Vitals.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-3">
            {vitals.map((v) => (
              <div
                key={v.metric}
                className="rounded-lg p-3 text-center"
                style={{
                  background:
                    v.status === "PASS"
                      ? "rgba(46,227,139,0.08)"
                      : v.status === "FAIL"
                        ? "rgba(255,77,77,0.08)"
                        : "rgba(255,193,7,0.08)",
                  border: `1px solid ${
                    v.status === "PASS"
                      ? "rgba(46,227,139,0.2)"
                      : v.status === "FAIL"
                        ? "rgba(255,77,77,0.2)"
                        : "rgba(255,193,7,0.2)"
                  }`,
                }}
              >
                <div
                  className="text-xs font-bold mb-1"
                  style={{ color: "#8FA3B8" }}
                >
                  {v.metric}
                </div>
                <div
                  className="text-lg font-bold"
                  style={{
                    color:
                      v.status === "PASS"
                        ? "#2EE38B"
                        : v.status === "FAIL"
                          ? "#FF4D4D"
                          : "#FFC107",
                  }}
                >
                  {v.value}
                </div>
                <div className="text-xs mt-1" style={{ color: "#6F839A" }}>
                  {v.target}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Health summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Health Score",
            value: isLoading ? "—" : "92",
            color: "#2EE38B",
          },
          {
            label: "Critical Issues",
            value: isLoading
              ? "—"
              : String(
                  issueList.filter((i) => i.severity === "critical").length,
                ),
            color: "#FF4D4D",
          },
          {
            label: "Warnings",
            value: isLoading
              ? "—"
              : String(
                  issueList.filter((i) => i.severity === "warning").length,
                ),
            color: "#FFC107",
          },
          {
            label: "Info",
            value: isLoading
              ? "—"
              : String(issueList.filter((i) => i.severity === "info").length),
            color: "#2AA9FF",
          },
        ].map((s) => (
          <div key={s.label} className="card-seo p-4">
            <div className="text-xs mb-1" style={{ color: "#6F839A" }}>
              {s.label}
            </div>
            <div className="text-3xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Issues table */}
      <div className="card-seo p-5">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "#8FA3B8" }}
          >
            Audit Issues
          </h3>
          <div className="flex gap-2">
            {["all", "critical", "warning", "info"].map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background:
                    filter === f
                      ? "rgba(42,169,255,0.2)"
                      : "rgba(255,255,255,0.05)",
                  color: filter === f ? "#2AA9FF" : "#8FA3B8",
                  border:
                    filter === f
                      ? "1px solid rgba(42,169,255,0.3)"
                      : "1px solid transparent",
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div data-ocid="technical.loading_state" className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-12 w-full rounded"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div data-ocid="technical.empty_state" className="py-12 text-center">
            <AlertTriangle
              size={28}
              style={{ color: "#8FA3B8", margin: "0 auto 8px" }}
            />
            <p className="text-sm font-medium" style={{ color: "#EAF1FF" }}>
              {filter !== "all"
                ? `No ${filter} issues found`
                : "Run an audit in the SEO Audit tab to see technical issues here"}
            </p>
            <p className="text-xs mt-1" style={{ color: "#6F839A" }}>
              Technical issues will appear here after auditing a URL.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  "Severity",
                  "Issue",
                  "Category",
                  "Affected Pages",
                  "Description",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left pb-2 text-xs font-medium"
                    style={{ color: "#6F839A" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((issue, i) => (
                <tr
                  key={`${issue.title}-${i}`}
                  data-ocid={`technical.item.${i + 1}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td className="py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold capitalize"
                      style={{
                        background: severityBg(issue.severity),
                        color: severityColor(issue.severity),
                      }}
                    >
                      {issue.severity}
                    </span>
                  </td>
                  <td
                    className="py-3 text-sm font-medium"
                    style={{ color: "#EAF1FF" }}
                  >
                    {issue.title}
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#8FA3B8" }}>
                    {issue.category}
                  </td>
                  <td className="py-3 text-sm" style={{ color: "#EAF1FF" }}>
                    {issue.affectedPages}
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#6F839A" }}>
                    {issue.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Crawl stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pages Crawled", value: "4,820", sub: "Last crawl: 2h ago" },
          { label: "Crawl Errors", value: "23", sub: "8 critical" },
          { label: "Avg. Load Time", value: "1.8s", sub: "Target: < 2.5s" },
          { label: "Mobile Score", value: "94", sub: "Google Mobile Test" },
          { label: "HTTPS Coverage", value: "99.4%", sub: "5 mixed pages" },
          { label: "Indexable Pages", value: "4,614", sub: "206 noindex" },
        ].map((s) => (
          <div key={s.label} className="card-seo p-4">
            <div className="text-xs mb-1" style={{ color: "#6F839A" }}>
              {s.label}
            </div>
            <div className="text-2xl font-bold" style={{ color: "#EAF1FF" }}>
              {s.value}
            </div>
            <div className="text-xs mt-1" style={{ color: "#8FA3B8" }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
