import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Download, Key, RefreshCw } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

const backlinkTrend = [
  { day: "Mar 1", value: 31200 },
  { day: "Mar 5", value: 33400 },
  { day: "Mar 9", value: 34800 },
  { day: "Mar 13", value: 35600 },
  { day: "Mar 17", value: 36200 },
  { day: "Mar 21", value: 37500 },
  { day: "Mar 25", value: 38640 },
];

export function BacklinkProfile() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  const { data: backlinks, isLoading } = useQuery({
    queryKey: ["backlinks"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllBacklinks();
      } catch (err) {
        console.error("[BacklinkProfile][getAllBacklinks] Error:", err);
        toast.error("Failed to load backlink data");
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });

  const links = (backlinks ?? []).map((b) => ({
    ...b,
    authorityScore: Number(b.authorityScore),
  }));

  const statusColor = (s: string) =>
    s === "active" ? "#2EE38B" : s === "new" ? "#2AA9FF" : "#FF4D4D";
  const statusBg = (s: string) =>
    s === "active"
      ? "rgba(46,227,139,0.12)"
      : s === "new"
        ? "rgba(42,169,255,0.12)"
        : "rgba(255,77,77,0.12)";

  const handleExportCsv = () => {
    if (links.length === 0) {
      toast.error("No backlink data to export");
      return;
    }
    const header = "Domain,AuthorityScore,LinkType,AnchorText,Status";
    const rows = links
      .map(
        (l) =>
          `"${l.domain}",${l.authorityScore},"${l.linkType}","${l.anchorText}","${l.status}"`,
      )
      .join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backlinks.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backlinks exported as CSV");
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["backlinks"] });
    toast.success("Backlink data refreshed");
  };

  return (
    <div className="space-y-5">
      {/* Metrics row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Domain Rating", value: "71", color: "#9B6BFF" },
          { label: "Total Backlinks", value: "38,640", color: "#2AA9FF" },
          { label: "Referring Domains", value: "4,280", color: "#2EE38B" },
          { label: "Toxic Links", value: "127", color: "#FF4D4D" },
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

      {/* Trend chart */}
      <div className="card-seo p-5">
        <h3
          className="text-xs font-bold uppercase tracking-wider mb-4"
          style={{ color: "#8FA3B8" }}
        >
          Backlink Growth (30 Days)
        </h3>
        <div className="h-40">
          <ResponsiveContainer>
            <AreaChart data={backlinkTrend}>
              <defs>
                <linearGradient id="blGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9B6BFF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9B6BFF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#9B6BFF"
                fill="url(#blGrad)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Backlinks table */}
      <div className="card-seo p-5">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: "#8FA3B8" }}
          >
            Top Referring Domains
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="backlinks.secondary_button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
              style={{
                background: "rgba(42,169,255,0.12)",
                border: "1px solid rgba(42,169,255,0.25)",
                color: "#2AA9FF",
              }}
            >
              <RefreshCw size={11} /> Refresh
            </button>
            <button
              type="button"
              data-ocid="backlinks.primary_button"
              onClick={handleExportCsv}
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
        </div>

        {isLoading ? (
          <div data-ocid="backlinks.loading_state" className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-10 w-full rounded"
                style={{ background: "rgba(255,255,255,0.06)" }}
              />
            ))}
          </div>
        ) : links.length === 0 ? (
          <div data-ocid="backlinks.empty_state" className="py-12 text-center">
            <Key size={28} style={{ color: "#8FA3B8", margin: "0 auto 8px" }} />
            <p
              className="text-sm font-semibold mb-1"
              style={{ color: "#EAF1FF" }}
            >
              Connect Ahrefs or SEMrush API Key
            </p>
            <p className="text-xs" style={{ color: "#6F839A" }}>
              Backlink data is sourced from Ahrefs or SEMrush. Add your API key
              in the Integrations settings to see referring domains, authority
              scores, and link types.
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {[
                  "Domain",
                  "Authority Score",
                  "Link Type",
                  "Anchor Text",
                  "Status",
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
              {links.map((link, i) => (
                <tr
                  key={link.domain}
                  data-ocid={`backlinks.item.${i + 1}`}
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <td className="py-3 text-sm" style={{ color: "#2AA9FF" }}>
                    {link.domain}
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
                            width: `${link.authorityScore}%`,
                            background:
                              link.authorityScore >= 80 ? "#2EE38B" : "#2AA9FF",
                          }}
                        />
                      </div>
                      <span className="text-sm" style={{ color: "#EAF1FF" }}>
                        {link.authorityScore}
                      </span>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs"
                      style={{
                        background:
                          link.linkType === "dofollow"
                            ? "rgba(46,227,139,0.12)"
                            : "rgba(255,255,255,0.06)",
                        color:
                          link.linkType === "dofollow" ? "#2EE38B" : "#8FA3B8",
                      }}
                    >
                      {link.linkType}
                    </span>
                  </td>
                  <td className="py-3 text-sm" style={{ color: "#8FA3B8" }}>
                    {link.anchorText}
                  </td>
                  <td className="py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-medium capitalize"
                      style={{
                        background: statusBg(link.status),
                        color: statusColor(link.status),
                      }}
                    >
                      {link.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Link type breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Dofollow Links", value: "72%", sub: "27,820 links" },
          { label: "Nofollow Links", value: "28%", sub: "10,820 links" },
          {
            label: "New Links (30d)",
            value: "+1,240",
            sub: "from 380 domains",
          },
          { label: "Lost Links (30d)", value: "-380", sub: "from 94 domains" },
          { label: "Avg. Domain Rating", value: "62", sub: "of ref. domains" },
          {
            label: "Anchor Text Diversity",
            value: "88%",
            sub: "unique anchors",
          },
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
