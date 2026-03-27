import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Key,
  Minus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
import { useActor } from "../hooks/useActor";

const contentScores = [
  { category: "Content Depth", score: 88 },
  { category: "Keyword Usage", score: 82 },
  { category: "Readability", score: 91 },
  { category: "Structure", score: 79 },
  { category: "Freshness", score: 74 },
  { category: "E-E-A-T Signals", score: 86 },
];

const metaIssues = [
  {
    page: "/blog/ai-seo-guide",
    title: "AI SEO Complete Guide 2026",
    metaDesc: "Missing",
    h1: "OK",
    canonical: "OK",
  },
  {
    page: "/products/rank-tracker",
    title: "Rank Tracker Tool",
    metaDesc: "OK",
    h1: "Duplicate",
    canonical: "OK",
  },
  {
    page: "/pricing",
    title: "Pricing Plans",
    metaDesc: "Short (42 chars)",
    h1: "OK",
    canonical: "Missing",
  },
  {
    page: "/features",
    title: "Platform Features",
    metaDesc: "OK",
    h1: "OK",
    canonical: "OK",
  },
  {
    page: "/about",
    title: "About Us",
    metaDesc: "OK",
    h1: "Missing",
    canonical: "OK",
  },
  {
    page: "/contact",
    title: "Contact",
    metaDesc: "Duplicate",
    h1: "OK",
    canonical: "OK",
  },
];

const radarData = [
  { subject: "Content", score: 88 },
  { subject: "Meta", score: 84 },
  { subject: "Headings", score: 91 },
  { subject: "Images", score: 72 },
  { subject: "Links", score: 86 },
  { subject: "Schema", score: 65 },
];

export function OnPageSEO() {
  const { actor, isFetching } = useActor();
  const { data: keywords, isLoading } = useQuery({
    queryKey: ["keywords"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllKeywords();
      } catch (err) {
        console.error("[OnPageSEO][getAllKeywords] Error:", err);
        toast.error("Failed to load keyword data");
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
  const kws = (keywords ?? []).map((k) => ({
    ...k,
    position: Number(k.position),
    searchVolume: Number(k.searchVolume),
    difficulty: Number(k.difficulty),
    trafficValue: Number(k.trafficValue),
    positionTrend: Number(k.positionTrend),
  }));

  const handleExportKeywords = () => {
    if (kws.length === 0) {
      toast.error("No keyword data to export");
      return;
    }
    const header = "Keyword,Position,Volume,Difficulty,TrafficValue,Trend";
    const rows = kws
      .map(
        (k) =>
          `"${k.term}",${k.position},${k.searchVolume},${k.difficulty},${k.trafficValue},${k.positionTrend}`,
      )
      .join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keyword-rankings.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Keyword rankings exported as CSV");
  };

  const handleExportMetaIssues = () => {
    const header = "Page,Title,MetaDescription,H1Tag,Canonical";
    const rows = metaIssues
      .map(
        (m) =>
          `"${m.page}","${m.title}","${m.metaDesc}","${m.h1}","${m.canonical}"`,
      )
      .join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "meta-issues.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Meta issues exported as CSV");
  };

  return (
    <div className="space-y-5">
      {/* Score overview */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "On-Page Score",
            value: "88",
            color: "#2AA9FF",
            delta: "+4",
          },
          {
            label: "Content Score",
            value: "91",
            color: "#2EE38B",
            delta: "+2",
          },
          { label: "Meta Score", value: "84", color: "#9B6BFF", delta: "-1" },
          {
            label: "Structure Score",
            value: "87",
            color: "#FFC107",
            delta: "+3",
          },
        ].map((s) => (
          <div key={s.label} className="card-seo p-4">
            <div className="text-xs mb-1" style={{ color: "#6F839A" }}>
              {s.label}
            </div>
            <div className="text-3xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div
              className="text-xs"
              style={{ color: s.delta.startsWith("+") ? "#2EE38B" : "#FF4D4D" }}
            >
              {s.delta} this month
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Radar */}
        <div className="card-seo p-5">
          <h3
            className="text-xs font-bold uppercase tracking-wider mb-4"
            style={{ color: "#8FA3B8" }}
          >
            On-Page Breakdown
          </h3>
          <div className="h-52">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 11, fill: "#8FA3B8" }}
                />
                <Radar
                  dataKey="score"
                  stroke="#2AA9FF"
                  fill="#2AA9FF"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content scores bar */}
        <div className="card-seo p-5">
          <h3
            className="text-xs font-bold uppercase tracking-wider mb-4"
            style={{ color: "#8FA3B8" }}
          >
            Content Signal Scores
          </h3>
          <div className="space-y-3">
            {contentScores.map((s) => (
              <div key={s.category}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: "#8FA3B8" }}>{s.category}</span>
                  <span style={{ color: "#EAF1FF" }}>{s.score}</span>
                </div>
                <div
                  className="h-1.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.score}%`,
                      background:
                        s.score >= 85
                          ? "#2EE38B"
                          : s.score >= 70
                            ? "#2AA9FF"
                            : "#FF4D4D",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyword table */}
      <div className="card-seo p-5">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "#8FA3B8" }}
          >
            Keyword Rankings
          </h3>
          <button
            type="button"
            data-ocid="onpage.primary_button"
            onClick={handleExportKeywords}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              background: "rgba(46,227,139,0.12)",
              border: "1px solid rgba(46,227,139,0.25)",
              color: "#2EE38B",
            }}
          >
            <Download size={11} /> Export CSV
          </button>
        </div>

        {isLoading ? (
          <div data-ocid="onpage.loading_state" className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-10 w-full rounded"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : kws.length === 0 ? (
          <div data-ocid="onpage.empty_state" className="py-12 text-center">
            <Key size={28} style={{ color: "#8FA3B8", margin: "0 auto 8px" }} />
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "#EAF1FF" }}
            >
              Connect Google Search Console
            </p>
            <p className="text-xs" style={{ color: "#6F839A" }}>
              Keyword ranking data is pulled from Google Search Console. Run an
              audit and connect GSC to track position, search volume, and
              ranking trends.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  "Keyword",
                  "Position",
                  "Volume",
                  "Difficulty",
                  "Traffic Value",
                  "Trend",
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
              {kws.map((kw) => (
                <tr
                  key={kw.term}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td className="py-2.5 text-sm" style={{ color: "#EAF1FF" }}>
                    {kw.term}
                  </td>
                  <td className="py-2.5">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-bold"
                      style={{
                        background:
                          kw.position <= 3
                            ? "rgba(46,227,139,0.15)"
                            : kw.position <= 10
                              ? "rgba(42,169,255,0.15)"
                              : "rgba(255,255,255,0.06)",
                        color:
                          kw.position <= 3
                            ? "#2EE38B"
                            : kw.position <= 10
                              ? "#2AA9FF"
                              : "#8FA3B8",
                      }}
                    >
                      #{kw.position}
                    </span>
                  </td>
                  <td className="py-2.5 text-sm" style={{ color: "#8FA3B8" }}>
                    {kw.searchVolume.toLocaleString()}
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-1 w-12 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${kw.difficulty}%`,
                            background:
                              kw.difficulty >= 70
                                ? "#FF4D4D"
                                : kw.difficulty >= 50
                                  ? "#FFC107"
                                  : "#2EE38B",
                          }}
                        />
                      </div>
                      <span className="text-xs" style={{ color: "#6F839A" }}>
                        {kw.difficulty}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 text-sm" style={{ color: "#8FA3B8" }}>
                    ${kw.trafficValue.toLocaleString()}
                  </td>
                  <td className="py-2.5">
                    <span
                      className="text-xs flex items-center gap-0.5"
                      style={{
                        color:
                          kw.positionTrend > 0
                            ? "#2EE38B"
                            : kw.positionTrend < 0
                              ? "#FF4D4D"
                              : "#8FA3B8",
                      }}
                    >
                      {kw.positionTrend > 0 ? (
                        <ArrowUpRight size={11} />
                      ) : kw.positionTrend < 0 ? (
                        <ArrowDownRight size={11} />
                      ) : (
                        <Minus size={11} />
                      )}
                      {kw.positionTrend !== 0
                        ? Math.abs(kw.positionTrend)
                        : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Meta tags table */}
      <div className="card-seo p-5">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "#8FA3B8" }}
          >
            Meta Tag Audit
          </h3>
          <button
            type="button"
            data-ocid="onpage.secondary_button"
            onClick={handleExportMetaIssues}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
            style={{
              background: "rgba(42,169,255,0.12)",
              border: "1px solid rgba(42,169,255,0.25)",
              color: "#2AA9FF",
            }}
          >
            <Download size={11} /> Export Issues
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {["Page", "Title", "Meta Description", "H1 Tag", "Canonical"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left pb-2 text-xs font-medium"
                    style={{ color: "#6F839A" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {metaIssues.map((row) => (
              <tr
                key={row.page}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <td className="py-2 text-xs" style={{ color: "#2AA9FF" }}>
                  {row.page}
                </td>
                <td className="py-2 text-xs" style={{ color: "#EAF1FF" }}>
                  {row.title}
                </td>
                {(
                  [row.metaDesc, row.h1, row.canonical] as [
                    string,
                    string,
                    string,
                  ]
                ).map((v) => (
                  <td key={v + row.page} className="py-2">
                    <span
                      className="px-1.5 py-0.5 rounded text-xs"
                      style={{
                        background:
                          v === "OK"
                            ? "rgba(46,227,139,0.12)"
                            : "rgba(255,77,77,0.12)",
                        color: v === "OK" ? "#2EE38B" : "#FF4D4D",
                      }}
                    >
                      {v}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
