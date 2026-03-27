import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Key,
  Minus,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const competitorTrafficShare = [
  { name: "semrush.com", value: 35, color: "#FF4D4D" },
  { name: "ahrefs.com", value: 32, color: "#FF8C42" },
  { name: "moz.com", value: 22, color: "#9B6BFF" },
  { name: "You", value: 11, color: "#2AA9FF" },
];

export function MarketIntelligence() {
  const { actor, isFetching } = useActor();
  const [trafficFilter, setTrafficFilter] = useState<"all" | "high" | "low">(
    "all",
  );

  const { data: competitors, isLoading } = useQuery({
    queryKey: ["competitors"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllCompetitors();
      } catch (err) {
        console.error("[MarketIntelligence][getAllCompetitors] Error:", err);
        toast.error("Failed to load competitor data");
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const compList = (competitors ?? []).map((c) => ({
    ...c,
    estimatedTraffic: Number(c.estimatedTraffic),
    keywordOverlap: Number(c.keywordOverlap),
    domainAuthority: Number(c.domainAuthority),
  }));

  const filteredComps = compList.filter((c) => {
    if (trafficFilter === "high") return c.estimatedTraffic >= 1000000;
    if (trafficFilter === "low") return c.estimatedTraffic < 1000000;
    return true;
  });

  const trendIcon = (d: string) =>
    d === "up" ? (
      <ArrowUpRight size={12} style={{ color: "#2EE38B" }} />
    ) : d === "down" ? (
      <ArrowDownRight size={12} style={{ color: "#FF4D4D" }} />
    ) : (
      <Minus size={12} style={{ color: "#8FA3B8" }} />
    );

  const handleExportReport = () => {
    if (compList.length === 0) {
      toast.error("No competitor data to export");
      return;
    }
    const header =
      "Domain,EstimatedTraffic,KeywordOverlap,DomainAuthority,Trend";
    const rows = compList
      .map(
        (c) =>
          `"${c.domain}",${c.estimatedTraffic},${c.keywordOverlap},${c.domainAuthority},"${c.trendDirection}"`,
      )
      .join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "competitor-report.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Competitor report exported as CSV");
  };

  const filterBtnStyle = (active: boolean) => ({
    padding: "4px 12px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "500" as const,
    cursor: "pointer" as const,
    transition: "all 0.15s",
    background: active ? "rgba(42,169,255,0.2)" : "rgba(255,255,255,0.04)",
    border: active
      ? "1px solid rgba(42,169,255,0.4)"
      : "1px solid rgba(255,255,255,0.08)",
    color: active ? "#2AA9FF" : "#8FA3B8",
  });

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Tracked Competitors",
            value: isLoading ? "—" : compList.length.toString(),
            color: "#2AA9FF",
          },
          { label: "Market Traffic Share", value: "11%", color: "#2EE38B" },
          {
            label: "Keyword Overlap",
            value: isLoading
              ? "—"
              : compList
                  .reduce((s, c) => s + c.keywordOverlap, 0)
                  .toLocaleString(),
            color: "#9B6BFF",
          },
          { label: "Ranking Gaps", value: "2,840", color: "#FFC107" },
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

      <div className="grid grid-cols-2 gap-5">
        {/* Traffic share donut */}
        <div className="card-seo p-5">
          <h3
            className="text-xs font-bold uppercase tracking-wider mb-4"
            style={{ color: "#8FA3B8" }}
          >
            Traffic Share
          </h3>
          <div className="flex items-center gap-6">
            <div className="w-36 h-36">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={competitorTrafficShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {competitorTrafficShare.map((entry) => (
                      <Cell key={entry.color} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {competitorTrafficShare.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: entry.color }}
                  />
                  <span className="text-xs" style={{ color: "#8FA3B8" }}>
                    {entry.name}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: "#EAF1FF" }}
                  >
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Keyword overlap bar */}
        <div className="card-seo p-5">
          <h3
            className="text-xs font-bold uppercase tracking-wider mb-4"
            style={{ color: "#8FA3B8" }}
          >
            Keyword Overlap
          </h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-8"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              ))}
            </div>
          ) : compList.length === 0 ? (
            <div className="h-40 flex items-center justify-center">
              <p className="text-xs" style={{ color: "#6F839A" }}>
                No competitor data available
              </p>
            </div>
          ) : (
            <div className="h-40">
              <ResponsiveContainer>
                <BarChart data={compList} barSize={24}>
                  <Bar
                    dataKey="keywordOverlap"
                    radius={[4, 4, 0, 0]}
                    fill="#2AA9FF"
                  />
                  <XAxis
                    dataKey="domain"
                    tick={{ fontSize: 9, fill: "#6F839A" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) => v.split(".")[0]}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#6F839A" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#0E1822",
                      border: "1px solid rgba(42,169,255,0.2)",
                      borderRadius: "8px",
                      color: "#EAF1FF",
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Competitor table */}
      <div className="card-seo p-5">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "#8FA3B8" }}
          >
            Competitor Analysis
          </h3>
          <div className="flex items-center gap-2">
            {/* Traffic filter */}
            <div className="flex gap-1">
              {(["all", "high", "low"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  data-ocid="market.tab"
                  onClick={() => setTrafficFilter(f)}
                  style={filterBtnStyle(trafficFilter === f)}
                >
                  {f === "all"
                    ? "All"
                    : f === "high"
                      ? "High Traffic"
                      : "Low Traffic"}
                </button>
              ))}
            </div>
            <button
              type="button"
              data-ocid="market.primary_button"
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
              style={{
                background: "rgba(46,227,139,0.12)",
                border: "1px solid rgba(46,227,139,0.25)",
                color: "#2EE38B",
              }}
            >
              <Download size={11} /> Export Report
            </button>
          </div>
        </div>

        {isLoading ? (
          <div data-ocid="market.loading_state" className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-10 w-full rounded"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : compList.length === 0 ? (
          <div data-ocid="market.empty_state" className="py-12 text-center">
            <Key size={28} style={{ color: "#8FA3B8", margin: "0 auto 8px" }} />
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "#EAF1FF" }}
            >
              Connect SEMrush or Ahrefs API Key
            </p>
            <p className="text-xs" style={{ color: "#6F839A" }}>
              Competitor intelligence data requires a SEMrush or Ahrefs API key.
              Add it in the Integrations panel to track competing domains,
              keyword overlap, and SERP rankings.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  "Domain",
                  "Est. Traffic",
                  "Keyword Overlap",
                  "Domain Authority",
                  "Trend",
                  "vs You",
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
              {filteredComps.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-xs"
                    style={{ color: "#6F839A" }}
                    data-ocid="market.empty_state"
                  >
                    No competitors match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredComps.map((comp, i) => (
                  <tr
                    key={comp.domain}
                    data-ocid={`market.item.${i + 1}`}
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <td
                      className="py-3 text-sm font-medium"
                      style={{ color: "#2AA9FF" }}
                    >
                      {comp.domain}
                    </td>
                    <td className="py-3 text-sm" style={{ color: "#EAF1FF" }}>
                      {(comp.estimatedTraffic / 1000000).toFixed(1)}M
                    </td>
                    <td className="py-3 text-sm" style={{ color: "#EAF1FF" }}>
                      {comp.keywordOverlap.toLocaleString()}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 w-16 rounded-full"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${comp.domainAuthority}%`,
                              background: "#9B6BFF",
                            }}
                          />
                        </div>
                        <span className="text-sm" style={{ color: "#EAF1FF" }}>
                          {comp.domainAuthority}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="flex items-center gap-1">
                        {trendIcon(comp.trendDirection)}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(255,77,77,0.12)",
                          color: "#FF4D4D",
                        }}
                      >
                        -{comp.domainAuthority - 71} DA
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* SERP position comparison — requires Google Search Console */}
      <div className="card-seo p-5">
        <h3
          className="text-xs font-bold uppercase tracking-wider mb-4"
          style={{ color: "#8FA3B8" }}
        >
          SERP Position Comparison
        </h3>
        <div data-ocid="market.empty_state" className="py-10 text-center">
          <Key size={24} style={{ color: "#8FA3B8", margin: "0 auto 8px" }} />
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "#EAF1FF" }}
          >
            Connect Google Search Console
          </p>
          <p className="text-xs" style={{ color: "#6F839A" }}>
            SERP position data requires your Google Search Console API key. Run
            an audit and connect GSC to see keyword ranking comparisons.
          </p>
        </div>
      </div>
    </div>
  );
}
