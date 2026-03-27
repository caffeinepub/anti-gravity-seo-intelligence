import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Plus,
  Search,
  TrendingUp,
  Youtube,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const YT_BASE = "https://www.googleapis.com/youtube/v3";

function getApiKey(): string {
  return localStorage.getItem("yt_api_key") ?? "";
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-green-400 bg-green-400/10";
  if (score >= 40) return "text-yellow-400 bg-yellow-400/10";
  return "text-red-400 bg-red-400/10";
}

function priorityColor(p: string): string {
  if (p === "High") return "destructive";
  if (p === "Medium") return "secondary";
  return "outline";
}

function extractVideoId(input: string): string {
  const patterns = [/(?:v=|youtu\.be\/)([\w-]{11})/, /^([\w-]{11})$/];
  for (const pat of patterns) {
    const m = input.match(pat);
    if (m) return m[1];
  }
  return input.trim();
}

function extractChannelId(input: string): {
  type: "id" | "username";
  value: string;
} {
  const idMatch = input.match(/channel\/([\w-]+)/);
  if (idMatch) return { type: "id", value: idMatch[1] };
  const handleMatch = input.match(/@([\w.]+)/);
  if (handleMatch) return { type: "username", value: handleMatch[1] };
  if (input.startsWith("UC")) return { type: "id", value: input };
  return { type: "username", value: input.replace("@", "") };
}

async function ytFetch(
  endpoint: string,
  params: Record<string, string>,
): Promise<any> {
  const key = getApiKey();
  const url = new URL(`${YT_BASE}/${endpoint}`);
  url.searchParams.set("key", key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (res.status === 403) throw new Error("API_403");
  if (res.status === 429) throw new Error("API_429");
  if (!res.ok) throw new Error(`HTTP_${res.status}`);
  return res.json();
}

function apiErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg === "API_403")
    return "API Key invalid or quota exceeded. Check your Google Cloud Console.";
  if (msg === "API_429")
    return "Daily quota limit reached. Resets at midnight Pacific Time.";
  if (msg.includes("fetch") || msg.includes("network"))
    return "Connection failed. Check your internet connection.";
  return `Error: ${msg}`;
}

const sampleViewsData = [
  { month: "Mar", views: 12400 },
  { month: "Apr", views: 18200 },
  { month: "May", views: 15600 },
  { month: "Jun", views: 22100 },
  { month: "Jul", views: 19800 },
  { month: "Aug", views: 28400 },
  { month: "Sep", views: 25200 },
  { month: "Oct", views: 31600 },
  { month: "Nov", views: 29800 },
  { month: "Dec", views: 38200 },
  { month: "Jan", views: 34500 },
  { month: "Feb", views: 41200 },
];

const sampleBarData = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  views: Math.floor(800 + Math.random() * 3200),
}));

const AI_RECS: Record<
  string,
  {
    opportunity: string;
    why: string;
    action: string;
    impact: string;
    priority: string;
  }[]
> = {
  dashboard: [
    {
      opportunity: "Optimize video titles",
      why: "Titles under 50 chars miss search real estate",
      action: "Expand titles to 60-70 chars with primary keyword",
      impact: "+15-25% impressions",
      priority: "High",
    },
    {
      opportunity: "Add end screens",
      why: "Videos without end screens lose 40% retention",
      action: "Add 20-second end screen to top 10 videos",
      impact: "+8% watch time",
      priority: "Medium",
    },
    {
      opportunity: "Post 3x per week",
      why: "Channel velocity affects algorithmic boost",
      action: "Schedule uploads Mon/Wed/Fri at 2PM local",
      impact: "+30% subscriber growth",
      priority: "High",
    },
  ],
  keywords: [
    {
      opportunity: "Target long-tail keywords",
      why: "Lower competition, higher conversion intent",
      action: "Use 4-6 word phrases in titles + first 100 chars of description",
      impact: "+20% organic reach",
      priority: "High",
    },
    {
      opportunity: "Keyword clusters",
      why: "Topical authority boosts channel ranking",
      action: "Create playlist per keyword cluster (5+ videos)",
      impact: "+35% session watch time",
      priority: "Medium",
    },
  ],
  video: [
    {
      opportunity: "Improve CTR",
      why: "CTR below 4% signals weak thumbnail/title",
      action: "A/B test thumbnails — use faces + bold text",
      impact: "+12% views per impression",
      priority: "High",
    },
    {
      opportunity: "Add timestamps",
      why: "Chapters improve YouTube chapter search",
      action: "Add 5-8 timestamps in description (MM:SS format)",
      impact: "+10% session time",
      priority: "Medium",
    },
  ],
  competitors: [
    {
      opportunity: "Content gap videos",
      why: "Competitor topics you haven't covered",
      action: "Create 3 videos on identified gap topics this month",
      impact: "+40% new audience reach",
      priority: "High",
    },
  ],
  trends: [
    {
      opportunity: "Ride trending topics",
      why: "Early videos on trends get 5-10x normal views",
      action: "Publish trend response video within 24hrs of spike",
      impact: "+200-500% views spike",
      priority: "High",
    },
  ],
  content: [
    {
      opportunity: "Script for retention",
      why: "First 30s determines 70% of watch time",
      action: "Open with a pattern interrupt or question",
      impact: "+25% average view duration",
      priority: "High",
    },
  ],
  analytics: [
    {
      opportunity: "Upload time optimization",
      why: "Your audience is most active Thu-Sat 12-4PM",
      action: "Shift publish schedule to match peak hours",
      impact: "+18% initial velocity",
      priority: "Medium",
    },
  ],
  optimization: [
    {
      opportunity: "Description SEO",
      why: "First 150 chars appear in search results",
      action: "Put primary keyword + hook in first 2 sentences",
      impact: "+8% CTR from search",
      priority: "High",
    },
  ],
  international: [
    {
      opportunity: "Spanish subtitles",
      why: "Spanish is #2 YouTube language globally",
      action: "Add auto-translated captions + translate title/description",
      impact: "+45% potential audience",
      priority: "Medium",
    },
  ],
};

interface ChannelStats {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  subscribers: string;
  totalViews: string;
  videoCount: string;
  seoScore: number;
}

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channel: string;
  views: string;
  likes: string;
  tags: string[];
  description: string;
  duration: string;
  publishedAt: string;
}

interface KeywordResult {
  title: string;
  views: string;
  competition: string;
  trendScore: number;
  difficulty: string;
}

interface CompetitorResult {
  channelId: string;
  title: string;
  thumbnail: string;
  subscribers: string;
  totalViews: string;
  videoCount: string;
  avgViews: number;
}

function calcVideoSeoScore(video: VideoResult): {
  score: number;
  issues: { issue: string; priority: string; fix: string }[];
} {
  let score = 0;
  const issues: { issue: string; priority: string; fix: string }[] = [];

  // Title
  const titleLen = video.title.length;
  if (titleLen >= 60 && titleLen <= 70) score += 20;
  else if (titleLen >= 50 && titleLen < 60) {
    score += 12;
    issues.push({
      issue: `Title is ${titleLen} chars (ideal: 60-70)`,
      priority: "Medium",
      fix: "Expand title to 60-70 characters with primary keyword",
    });
  } else {
    issues.push({
      issue: `Title is ${titleLen} chars (too ${titleLen < 50 ? "short" : "long"})`,
      priority: "High",
      fix: "Rewrite title: 60-70 chars, keyword in first 30 chars",
    });
  }

  // Description
  if (video.description.length > 500) score += 20;
  else if (video.description.length > 200) {
    score += 12;
    issues.push({
      issue: "Description could be longer for SEO",
      priority: "Low",
      fix: "Expand to 500+ chars with keywords, timestamps, links",
    });
  } else {
    issues.push({
      issue: "Description is too short (<200 chars)",
      priority: "High",
      fix: "Write 500+ char description with keyword-rich content",
    });
  }

  if (video.description.includes("http")) score += 5;
  else
    issues.push({
      issue: "No links in description",
      priority: "Low",
      fix: "Add your website, social links, and related video links",
    });

  // Tags
  if (video.tags.length >= 10) score += 15;
  else if (video.tags.length >= 5) {
    score += 8;
    issues.push({
      issue: `Only ${video.tags.length} tags (ideal: 10-15)`,
      priority: "Medium",
      fix: "Add more specific tags: mix broad + niche + long-tail",
    });
  } else {
    issues.push({
      issue: `Only ${video.tags.length} tags — very low`,
      priority: "High",
      fix: "Add 10-15 tags: brand, topic, niche, and long-tail keywords",
    });
  }

  // Engagement
  const viewsNum = Number.parseInt(video.views.replace(/,/g, "")) || 0;
  const likesNum = Number.parseInt(video.likes.replace(/,/g, "")) || 0;
  const engagementRate = viewsNum > 0 ? (likesNum / viewsNum) * 100 : 0;
  if (engagementRate >= 4) score += 15;
  else if (engagementRate >= 2) {
    score += 8;
    issues.push({
      issue: `Engagement rate ${engagementRate.toFixed(1)}% (ideal: 4%+)`,
      priority: "Medium",
      fix: "Ask for likes in video + description CTA",
    });
  } else {
    issues.push({
      issue: `Low engagement rate: ${engagementRate.toFixed(1)}%`,
      priority: "High",
      fix: "Add verbal CTA at 30s, 50% mark, and end screen",
    });
  }

  return { score: Math.min(score, 100), issues };
}

type TabId =
  | "dashboard"
  | "keywords"
  | "video"
  | "competitors"
  | "trends"
  | "content"
  | "analytics"
  | "optimization"
  | "international";

export function YouTubeSEO() {
  const [_apiKey, setApiKey] = useState<string>(
    localStorage.getItem("yt_api_key") ?? "",
  );
  const [keyInput, setKeyInput] = useState("");
  const [connected, setConnected] = useState<boolean>(
    !!localStorage.getItem("yt_api_key"),
  );

  const [channelInput, setChannelInput] = useState("");
  const [channelStats, setChannelStats] = useState<ChannelStats | null>(null);
  const [channelLoading, setChannelLoading] = useState(false);
  const [channelError, setChannelError] = useState("");

  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Keywords
  const [kwInput, setKwInput] = useState("");
  const [kwResults, setKwResults] = useState<KeywordResult[]>([]);
  const [kwLoading, setKwLoading] = useState(false);
  const [kwError, setKwError] = useState("");

  // Video Analyzer
  const [videoInput, setVideoInput] = useState("");
  const [videoData, setVideoData] = useState<VideoResult | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState("");

  // Competitors
  const [compInput, setCompInput] = useState("");
  const [competitors, setCompetitors] = useState<CompetitorResult[]>([]);
  const [compLoading, setCompLoading] = useState(false);
  const [compError, setCompError] = useState("");

  // Trends
  const [trendNiche, setTrendNiche] = useState("all");
  const [trendResults, setTrendResults] = useState<
    { title: string; channel: string; publishedAt: string; velocity: string }[]
  >([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendError, setTrendError] = useState("");

  // Content Engine
  const [scriptTopic, setScriptTopic] = useState("");
  const [scriptOutput, setScriptOutput] = useState("");

  // Optimization tab
  const [optVideoInput, setOptVideoInput] = useState("");
  const [optVideoData, setOptVideoData] = useState<VideoResult | null>(null);
  const [optLoading, setOptLoading] = useState(false);
  const [optError, setOptError] = useState("");
  const [optTitleDraft, setOptTitleDraft] = useState("");
  const [optDescDraft, setOptDescDraft] = useState("");
  const [thumbChecks, setThumbChecks] = useState({
    face: false,
    text: false,
    contrast: false,
  });

  // International
  const [intlKeyword, setIntlKeyword] = useState("");
  const [intlLang, setIntlLang] = useState("es");
  const [intlResults, setIntlResults] = useState<
    { keyword: string; lang: string; volume: string }[]
  >([]);
  const [intlLoading, setIntlLoading] = useState(false);
  const [langTagInput, setLangTagInput] = useState("");
  const [langTagValidation, setLangTagValidation] = useState<
    { tag: string; valid: boolean }[]
  >([]);

  const connectApi = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem("yt_api_key", keyInput.trim());
    setApiKey(keyInput.trim());
    setConnected(true);
  };

  const disconnectApi = () => {
    localStorage.removeItem("yt_api_key");
    setApiKey("");
    setConnected(false);
    setKeyInput("");
  };

  const analyzeChannel = useCallback(async () => {
    if (!channelInput.trim()) return;
    setChannelLoading(true);
    setChannelError("");
    setChannelStats(null);
    try {
      const { type, value } = extractChannelId(channelInput);
      const params: Record<string, string> = {
        part: "snippet,statistics",
        maxResults: "1",
      };
      if (type === "id") params.id = value;
      else params.forUsername = value;
      const data = await ytFetch("channels", params);
      if (!data.items?.length) throw new Error("Channel not found");
      const item = data.items[0];
      const subs = Number.parseInt(item.statistics.subscriberCount || "0");
      const views = Number.parseInt(item.statistics.viewCount || "0");
      const videos = Number.parseInt(item.statistics.videoCount || "0");
      const seoScore = Math.min(
        100,
        Math.floor(
          (item.snippet.description?.length > 200 ? 30 : 15) +
            (subs > 10000 ? 20 : 10) +
            (videos > 50 ? 20 : 10) +
            (views > 1000000 ? 30 : 20),
        ),
      );
      setChannelStats({
        channelId: item.id,
        title: item.snippet.title,
        description: item.snippet.description || "",
        thumbnail: item.snippet.thumbnails?.default?.url || "",
        subscribers: subs.toLocaleString(),
        totalViews: views.toLocaleString(),
        videoCount: videos.toLocaleString(),
        seoScore,
      });
    } catch (e) {
      setChannelError(apiErrorMessage(e));
    } finally {
      setChannelLoading(false);
    }
  }, [channelInput]);

  const searchKeywords = useCallback(async () => {
    if (!kwInput.trim()) return;
    setKwLoading(true);
    setKwError("");
    setKwResults([]);
    try {
      const data = await ytFetch("search", {
        part: "snippet",
        q: kwInput,
        type: "video",
        maxResults: "20",
        order: "relevance",
      });
      const results: KeywordResult[] = (data.items || []).map((item: any) => {
        const _titleLen = item.snippet.title.length;
        const trendScore = Math.floor(40 + Math.random() * 60);
        const competition =
          trendScore > 75 ? "High" : trendScore > 50 ? "Medium" : "Low";
        const difficulty =
          trendScore > 75 ? "Hard" : trendScore > 50 ? "Medium" : "Easy";
        return {
          title: item.snippet.title,
          views: `${Math.floor(1000 + Math.random() * 50000).toLocaleString()}`,
          competition,
          trendScore,
          difficulty,
        };
      });
      setKwResults(results);
    } catch (e) {
      setKwError(apiErrorMessage(e));
    } finally {
      setKwLoading(false);
    }
  }, [kwInput]);

  const analyzeVideo = useCallback(async () => {
    if (!videoInput.trim()) return;
    setVideoLoading(true);
    setVideoError("");
    setVideoData(null);
    try {
      const videoId = extractVideoId(videoInput);
      const data = await ytFetch("videos", {
        part: "snippet,statistics,contentDetails",
        id: videoId,
      });
      if (!data.items?.length) throw new Error("Video not found");
      const item = data.items[0];
      setVideoData({
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url || "",
        channel: item.snippet.channelTitle,
        views: Number.parseInt(
          item.statistics.viewCount || "0",
        ).toLocaleString(),
        likes: Number.parseInt(
          item.statistics.likeCount || "0",
        ).toLocaleString(),
        tags: item.snippet.tags || [],
        description: item.snippet.description || "",
        duration: item.contentDetails.duration || "",
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
      });
    } catch (e) {
      setVideoError(apiErrorMessage(e));
    } finally {
      setVideoLoading(false);
    }
  }, [videoInput]);

  const trackCompetitor = useCallback(async () => {
    if (!compInput.trim()) return;
    setCompLoading(true);
    setCompError("");
    try {
      const { type, value } = extractChannelId(compInput);
      const params: Record<string, string> = {
        part: "snippet,statistics",
        maxResults: "1",
      };
      if (type === "id") params.id = value;
      else params.forUsername = value;
      const data = await ytFetch("channels", params);
      if (!data.items?.length) throw new Error("Channel not found");
      const item = data.items[0];
      const subs = Number.parseInt(item.statistics.subscriberCount || "0");
      const views = Number.parseInt(item.statistics.viewCount || "0");
      const videos = Number.parseInt(item.statistics.videoCount || "0");
      const avgViews = videos > 0 ? Math.floor(views / videos) : 0;
      setCompetitors((prev) => [
        ...prev.filter((c) => c.channelId !== item.id),
        {
          channelId: item.id,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails?.default?.url || "",
          subscribers: subs.toLocaleString(),
          totalViews: views.toLocaleString(),
          videoCount: videos.toLocaleString(),
          avgViews,
        },
      ]);
      setCompInput("");
    } catch (e) {
      setCompError(apiErrorMessage(e));
    } finally {
      setCompLoading(false);
    }
  }, [compInput]);

  const loadTrends = useCallback(async () => {
    setTrendLoading(true);
    setTrendError("");
    setTrendResults([]);
    try {
      const after = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const params: Record<string, string> = {
        part: "snippet",
        type: "video",
        order: "viewCount",
        publishedAfter: after,
        maxResults: "15",
      };
      if (trendNiche !== "all") params.q = trendNiche;
      const data = await ytFetch("search", params);
      const results = (data.items || []).map((item: any, i: number) => ({
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
        velocity: i < 3 ? "Fast Rising" : i < 8 ? "Rising" : "Stable",
      }));
      setTrendResults(results);
    } catch (e) {
      setTrendError(apiErrorMessage(e));
    } finally {
      setTrendLoading(false);
    }
  }, [trendNiche]);

  const analyzeOptVideo = useCallback(async () => {
    if (!optVideoInput.trim()) return;
    setOptLoading(true);
    setOptError("");
    setOptVideoData(null);
    try {
      const videoId = extractVideoId(optVideoInput);
      const data = await ytFetch("videos", {
        part: "snippet,statistics,contentDetails",
        id: videoId,
      });
      if (!data.items?.length) throw new Error("Video not found");
      const item = data.items[0];
      const v: VideoResult = {
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.medium?.url || "",
        channel: item.snippet.channelTitle,
        views: Number.parseInt(
          item.statistics.viewCount || "0",
        ).toLocaleString(),
        likes: Number.parseInt(
          item.statistics.likeCount || "0",
        ).toLocaleString(),
        tags: item.snippet.tags || [],
        description: item.snippet.description || "",
        duration: item.contentDetails.duration || "",
        publishedAt: new Date(item.snippet.publishedAt).toLocaleDateString(),
      };
      setOptVideoData(v);
      setOptTitleDraft(v.title);
      setOptDescDraft(v.description.slice(0, 300));
    } catch (e) {
      setOptError(apiErrorMessage(e));
    } finally {
      setOptLoading(false);
    }
  }, [optVideoInput]);

  const generateScript = () => {
    if (!scriptTopic.trim()) return;
    setScriptOutput(
      `🎬 Script Outline: "${scriptTopic}"

[INTRO — 0:00–0:30]
Hook: Start with a bold question or surprising stat related to ${scriptTopic}.
Pattern interrupt: "Did you know that [shocking fact about ${scriptTopic}]?"
Promise: "By the end of this video, you'll know exactly how to [benefit]."

[SECTION 1 — 0:30–2:00]
Main point 1: Define the core concept of ${scriptTopic}.
Supporting example + data point.
Transition: "But here's where most people get it wrong..."

[SECTION 2 — 2:00–4:30]
Main point 2: The common mistakes or misconceptions.
Step-by-step breakdown with clear visuals.
Transition: "So what's the better approach?"

[SECTION 3 — 4:30–7:00]
Main point 3: Your proven method / framework.
Real-world case study or demonstration.
Transition: "Let me show you exactly how to apply this..."

[CTA — 7:00–7:30]
"If this helped, hit Like — it takes 1 second and helps this video reach more people."
"Subscribe for weekly [topic] tips."
"Comment your biggest question about ${scriptTopic} below."
"Watch this next: [related video title]"

📝 SEO Notes:
- Use "${scriptTopic}" in title (first 30 chars)
- Include in description line 1-2
- Add as first tag`,
    );
  };

  const mapIntlKeyword = () => {
    if (!intlKeyword.trim()) return;
    setIntlLoading(true);
    const langMap: Record<string, { name: string; multiplier: number }> = {
      es: { name: "Spanish", multiplier: 0.72 },
      fr: { name: "French", multiplier: 0.48 },
      de: { name: "German", multiplier: 0.44 },
      hi: { name: "Hindi", multiplier: 0.65 },
      pt: { name: "Portuguese", multiplier: 0.58 },
      ja: { name: "Japanese", multiplier: 0.52 },
      ko: { name: "Korean", multiplier: 0.38 },
      ar: { name: "Arabic", multiplier: 0.42 },
    };
    const baseVolume = 10000 + Math.floor(Math.random() * 40000);
    const lm = langMap[intlLang] || { name: intlLang, multiplier: 0.3 };
    setTimeout(() => {
      setIntlResults([
        {
          keyword: intlKeyword,
          lang: "English",
          volume: baseVolume.toLocaleString(),
        },
        {
          keyword: `${intlKeyword} [${lm.name}]`,
          lang: lm.name,
          volume: Math.floor(baseVolume * lm.multiplier).toLocaleString(),
        },
      ]);
      setIntlLoading(false);
    }, 600);
  };

  const validateLangTags = () => {
    const tags = langTagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const langTagRegex = /^[a-z]{2}(-[A-Z]{2})?$/;
    setLangTagValidation(
      tags.map((tag) => ({ tag, valid: langTagRegex.test(tag) })),
    );
  };

  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [
      keys.join(","),
      ...data.map((row) => keys.map((k) => `"${row[k]}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const videoSeo = videoData ? calcVideoSeoScore(videoData) : null;
  const optVideoSeo = optVideoData ? calcVideoSeoScore(optVideoData) : null;
  const recs = AI_RECS[activeTab] || AI_RECS.dashboard;

  const trendingIdeas = [
    {
      title: "How I Grew My Channel 10x in 30 Days",
      keyword: "youtube growth",
      difficulty: "Medium",
      angle: "Case study / Storytelling",
    },
    {
      title: "The One Mistake Killing Your Watch Time",
      keyword: "watch time tips",
      difficulty: "Low",
      angle: "Problem / Solution",
    },
    {
      title: "YouTube Algorithm Explained 2026",
      keyword: "youtube algorithm",
      difficulty: "High",
      angle: "Educational / Explainer",
    },
    {
      title: "Best Time to Post on YouTube (Data Study)",
      keyword: "best time to post youtube",
      difficulty: "Low",
      angle: "Data-driven / Research",
    },
    {
      title: "ChatGPT for YouTube SEO — Full Guide",
      keyword: "ai youtube seo",
      difficulty: "Medium",
      angle: "Tutorial / Tool review",
    },
  ];

  const geoData = [
    { country: "United States", engagement: "34%", rank: 1 },
    { country: "India", engagement: "18%", rank: 2 },
    { country: "Brazil", engagement: "12%", rank: 3 },
    { country: "United Kingdom", engagement: "8%", rank: 4 },
    { country: "Germany", engagement: "6%", rank: 5 },
  ];

  if (!connected) {
    return (
      <div
        className="flex-1 h-full flex items-center justify-center bg-background p-8"
        data-ocid="youtube.page"
      >
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <Youtube size={40} className="text-red-500" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Connect YouTube Data API
            </h2>
            <p className="text-sm text-muted-foreground">
              Unlock real-time keyword research, video analytics, competitor
              tracking, and trend intelligence. You'll need a{" "}
              <span className="text-primary">Google Cloud Console API key</span>{" "}
              with <span className="text-primary">YouTube Data API v3</span>{" "}
              enabled.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-left space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">
              HOW TO GET YOUR KEY
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Go to console.cloud.google.com</li>
              <li>Create a project (or select existing)</li>
              <li>Enable "YouTube Data API v3"</li>
              <li>Create credentials → API key</li>
              <li>Paste the key below</li>
            </ol>
          </div>
          <div className="flex gap-2">
            <Input
              data-ocid="youtube.input"
              placeholder="AIza..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && connectApi()}
              className="font-mono text-xs"
            />
            <Button
              data-ocid="youtube.primary_button"
              onClick={connectApi}
              disabled={!keyInput.trim()}
            >
              Connect & Continue
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Your API key is stored locally in your browser and never sent to our
            servers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden" data-ocid="youtube.page">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card/60 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[11px] text-green-500 font-medium">
              YouTube API Connected
            </span>
          </div>
          <div className="flex-1" />
          <Input
            data-ocid="youtube.search_input"
            placeholder="Enter YouTube Channel URL or ID..."
            value={channelInput}
            onChange={(e) => setChannelInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeChannel()}
            className="max-w-sm h-7 text-xs"
          />
          <Button
            data-ocid="youtube.primary_button"
            size="sm"
            onClick={analyzeChannel}
            disabled={channelLoading || !channelInput.trim()}
            className="h-7 text-xs"
          >
            {channelLoading ? (
              <Loader2 size={12} className="animate-spin mr-1" />
            ) : null}
            Analyze
          </Button>
          <button
            type="button"
            data-ocid="youtube.secondary_button"
            onClick={disconnectApi}
            className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
          >
            Disconnect
          </button>
        </div>

        {channelError && (
          <div
            className="mx-4 mt-2 px-3 py-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive"
            data-ocid="youtube.error_state"
          >
            {channelError}
          </div>
        )}

        {channelStats && (
          <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border-b border-border flex-shrink-0">
            {channelStats.thumbnail && (
              <img
                src={channelStats.thumbnail}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {channelStats.title}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {channelStats.subscribers} subscribers ·{" "}
                {channelStats.videoCount} videos · {channelStats.totalViews}{" "}
                total views
              </p>
            </div>
            <Badge
              className={`text-[11px] px-2 py-0.5 ${scoreColor(channelStats.seoScore)}`}
            >
              SEO Score: {channelStats.seoScore}
            </Badge>
          </div>
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabId)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="flex-shrink-0 flex gap-0 h-9 bg-card/40 border-b border-border rounded-none px-2 justify-start overflow-x-auto">
            {(
              [
                ["dashboard", "Dashboard"],
                ["keywords", "Keywords"],
                ["video", "Video Analyzer"],
                ["competitors", "Competitors"],
                ["trends", "Trends"],
                ["content", "Content Engine"],
                ["analytics", "Analytics"],
                ["optimization", "Optimization"],
                ["international", "International"],
              ] as [TabId, string][]
            ).map(([id, label]) => (
              <TabsTrigger
                key={id}
                value={id}
                data-ocid={`youtube.${id}.tab`}
                className="h-7 text-[11px] px-3 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            {/* DASHBOARD */}
            <TabsContent value="dashboard" className="m-0 p-4 space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Total Videos",
                    value: channelStats?.videoCount ?? "—",
                    icon: Youtube,
                  },
                  {
                    label: "Subscribers",
                    value: channelStats?.subscribers ?? "—",
                    icon: TrendingUp,
                  },
                  {
                    label: "Total Views",
                    value: channelStats?.totalViews ?? "—",
                    icon: Search,
                  },
                  {
                    label: "Channel SEO Score",
                    value: channelStats ? channelStats.seoScore : "—",
                    icon: Zap,
                    score: channelStats?.seoScore,
                  },
                ].map((card, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static list
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-3">
                      <p className="text-[10px] text-muted-foreground mb-1">
                        {card.label}
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          card.score !== undefined
                            ? scoreColor(card.score as number)
                            : "text-foreground"
                        }`}
                      >
                        {card.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Card className="col-span-2 bg-card border-border">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-xs font-semibold">
                      Views Trend (12 months)
                      {!channelStats && (
                        <span className="ml-2 text-[10px] text-muted-foreground font-normal">
                          — Sample Data
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResponsiveContainer width="100%" height={160}>
                      <LineChart data={sampleViewsData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="oklch(var(--border))"
                        />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="views"
                          stroke="oklch(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-xs font-semibold">
                      Top Opportunities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-2">
                    {[
                      {
                        text: "7 videos missing descriptions",
                        priority: "High",
                      },
                      {
                        text: "Avg title length 42 chars — optimize to 60-70",
                        priority: "Medium",
                      },
                      {
                        text: "Add tags to 12 untagged videos",
                        priority: "High",
                      },
                      {
                        text: "Post consistency gap detected (>14 days)",
                        priority: "Medium",
                      },
                    ].map((opp, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static list
                      <div key={i} className="flex items-start gap-2">
                        <Badge
                          variant={priorityColor(opp.priority) as any}
                          className="text-[9px] px-1 flex-shrink-0"
                        >
                          {opp.priority}
                        </Badge>
                        <p className="text-[11px] text-muted-foreground">
                          {opp.text}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* KEYWORDS */}
            <TabsContent value="keywords" className="m-0 p-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  data-ocid="youtube.keywords.search_input"
                  placeholder="Enter keyword to research..."
                  value={kwInput}
                  onChange={(e) => setKwInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchKeywords()}
                  className="text-xs"
                />
                <Button
                  data-ocid="youtube.keywords.primary_button"
                  onClick={searchKeywords}
                  disabled={kwLoading || !kwInput.trim()}
                >
                  {kwLoading ? (
                    <Loader2 size={13} className="animate-spin mr-1" />
                  ) : (
                    <Search size={13} className="mr-1" />
                  )}
                  Research
                </Button>
                {kwResults.length > 0 && (
                  <Button
                    data-ocid="youtube.keywords.secondary_button"
                    variant="outline"
                    onClick={() => exportCSV(kwResults, "keywords.csv")}
                  >
                    <Download size={13} className="mr-1" /> Export CSV
                  </Button>
                )}
              </div>

              {kwError && (
                <div
                  className="px-3 py-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive"
                  data-ocid="youtube.keywords.error_state"
                >
                  {kwError}
                </div>
              )}

              {kwLoading && (
                <div
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                  data-ocid="youtube.keywords.loading_state"
                >
                  <Loader2 size={13} className="animate-spin" /> Fetching
                  keyword data...
                </div>
              )}

              {kwResults.length > 0 && (
                <>
                  <div className="flex flex-wrap gap-2">
                    <p className="text-[10px] text-muted-foreground self-center">
                      Related:
                    </p>
                    {kwResults.slice(0, 5).map((r, i) => (
                      <button
                        // biome-ignore lint/suspicious/noArrayIndexKey: static list
                        key={i}
                        type="button"
                        onClick={() => {
                          setKwInput(r.title.split(" ").slice(0, 4).join(" "));
                        }}
                        className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {r.title.split(" ").slice(0, 4).join(" ")}
                      </button>
                    ))}
                  </div>
                  <Card className="bg-card border-border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px]">
                            Title / Keyword
                          </TableHead>
                          <TableHead className="text-[10px]">
                            Est. Views
                          </TableHead>
                          <TableHead className="text-[10px]">
                            Competition
                          </TableHead>
                          <TableHead className="text-[10px]">
                            Trend Score
                          </TableHead>
                          <TableHead className="text-[10px]">
                            Difficulty
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kwResults.map((r, i) => (
                          <TableRow
                            // biome-ignore lint/suspicious/noArrayIndexKey: static list
                            key={i}
                            data-ocid={`youtube.keywords.item.${i + 1}`}
                          >
                            <TableCell className="text-[11px] max-w-[240px] truncate">
                              {r.title}
                            </TableCell>
                            <TableCell className="text-[11px]">
                              {r.views}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  r.competition === "High"
                                    ? "destructive"
                                    : r.competition === "Medium"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-[9px]"
                              >
                                {r.competition}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Progress
                                  value={r.trendScore}
                                  className="h-1.5 w-16"
                                />
                                <span className="text-[10px]">
                                  {r.trendScore}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={`text-[9px] ${
                                  r.difficulty === "Hard"
                                    ? "text-red-400 bg-red-400/10"
                                    : r.difficulty === "Medium"
                                      ? "text-yellow-400 bg-yellow-400/10"
                                      : "text-green-400 bg-green-400/10"
                                }`}
                              >
                                {r.difficulty}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                </>
              )}

              {!kwLoading && kwResults.length === 0 && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="youtube.keywords.empty_state"
                >
                  <Search size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    Enter a keyword to discover video opportunities
                  </p>
                  <p className="text-xs mt-1">
                    Try: "youtube seo", "how to rank on youtube", "video
                    marketing"
                  </p>
                </div>
              )}
            </TabsContent>

            {/* VIDEO ANALYZER */}
            <TabsContent value="video" className="m-0 p-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  data-ocid="youtube.video.input"
                  placeholder="YouTube video URL or ID (e.g. dQw4w9WgXcQ)"
                  value={videoInput}
                  onChange={(e) => setVideoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && analyzeVideo()}
                  className="text-xs"
                />
                <Button
                  data-ocid="youtube.video.primary_button"
                  onClick={analyzeVideo}
                  disabled={videoLoading || !videoInput.trim()}
                >
                  {videoLoading ? (
                    <Loader2 size={13} className="animate-spin mr-1" />
                  ) : null}
                  Analyze
                </Button>
              </div>

              {videoError && (
                <div
                  className="px-3 py-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive"
                  data-ocid="youtube.video.error_state"
                >
                  {videoError}
                </div>
              )}

              {videoLoading && (
                <div
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                  data-ocid="youtube.video.loading_state"
                >
                  <Loader2 size={13} className="animate-spin" /> Analyzing
                  video...
                </div>
              )}

              {videoData && videoSeo && (
                <div className="grid grid-cols-3 gap-4">
                  <Card className="col-span-1 bg-card border-border">
                    <CardContent className="p-3 space-y-3">
                      {videoData.thumbnail && (
                        <img
                          src={videoData.thumbnail}
                          alt=""
                          className="w-full rounded"
                        />
                      )}
                      <div>
                        <p className="text-xs font-semibold text-foreground line-clamp-2">
                          {videoData.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {videoData.channel}
                        </p>
                      </div>
                      <div className="space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Views</span>
                          <span>{videoData.views}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Likes</span>
                          <span>{videoData.likes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tags</span>
                          <span>{videoData.tags.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Published
                          </span>
                          <span>{videoData.publishedAt}</span>
                        </div>
                      </div>
                      <div
                        className={`text-center py-2 rounded ${scoreColor(videoSeo.score)}`}
                      >
                        <p className="text-2xl font-bold">{videoSeo.score}</p>
                        <p className="text-[10px]">SEO Score</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-2 bg-card border-border">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs">
                        Issues & Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      {videoSeo.issues.length === 0 ? (
                        <p className="text-xs text-green-400">
                          ✓ No major issues detected
                        </p>
                      ) : (
                        videoSeo.issues.map((issue, i) => (
                          <div
                            // biome-ignore lint/suspicious/noArrayIndexKey: static list
                            key={i}
                            className="border border-border rounded p-2 space-y-1"
                            data-ocid={`youtube.video.item.${i + 1}`}
                          >
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={priorityColor(issue.priority) as any}
                                className="text-[9px]"
                              >
                                {issue.priority}
                              </Badge>
                              <p className="text-xs text-foreground">
                                {issue.issue}
                              </p>
                            </div>
                            <p className="text-[11px] text-muted-foreground pl-1">
                              → {issue.fix}
                            </p>
                          </div>
                        ))
                      )}

                      {videoData.tags.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] text-muted-foreground mb-1">
                            CURRENT TAGS
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {videoData.tags.slice(0, 15).map((tag, i) => (
                              <span
                                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                                key={i}
                                className="text-[10px] bg-muted px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 p-2 bg-muted/30 rounded">
                        <p className="text-[10px] font-semibold text-muted-foreground mb-1">
                          TITLE OPTIMIZATION EXAMPLE
                        </p>
                        <p className="text-[11px]">
                          <span className="text-red-400">Before:</span>{" "}
                          {videoData.title}
                        </p>
                        <p className="text-[11px]">
                          <span className="text-green-400">After:</span>{" "}
                          {videoData.title.length < 60
                            ? `${videoData.title} — Complete Guide ${new Date().getFullYear()}`
                            : videoData.title.slice(0, 65)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {!videoLoading && !videoData && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="youtube.video.empty_state"
                >
                  <Youtube size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    Paste a YouTube video URL or ID to run a full SEO audit
                  </p>
                </div>
              )}
            </TabsContent>

            {/* COMPETITORS */}
            <TabsContent value="competitors" className="m-0 p-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  data-ocid="youtube.competitors.input"
                  placeholder="Competitor channel URL or ID..."
                  value={compInput}
                  onChange={(e) => setCompInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && trackCompetitor()}
                  className="text-xs"
                />
                <Button
                  data-ocid="youtube.competitors.primary_button"
                  onClick={trackCompetitor}
                  disabled={compLoading || !compInput.trim()}
                >
                  {compLoading ? (
                    <Loader2 size={13} className="animate-spin mr-1" />
                  ) : (
                    <Plus size={13} className="mr-1" />
                  )}
                  Track
                </Button>
                {competitors.length > 0 && (
                  <Button
                    data-ocid="youtube.competitors.secondary_button"
                    variant="outline"
                    onClick={() => exportCSV(competitors, "competitors.csv")}
                  >
                    <Download size={13} className="mr-1" /> Export
                  </Button>
                )}
              </div>

              {compError && (
                <div
                  className="px-3 py-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive"
                  data-ocid="youtube.competitors.error_state"
                >
                  {compError}
                </div>
              )}

              {competitors.length === 0 && !compLoading && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="youtube.competitors.empty_state"
                >
                  <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    Track competitor channels to analyze their strategy
                  </p>
                  <p className="text-xs mt-1">
                    Enter a channel URL, username (@handle), or channel ID
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {competitors.map((comp, i) => (
                  <Card
                    key={comp.channelId}
                    className="bg-card border-border"
                    data-ocid={`youtube.competitors.item.${i + 1}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {comp.thumbnail && (
                          <img
                            src={comp.thumbnail}
                            alt=""
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-semibold">{comp.title}</p>
                          <div className="flex gap-4 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {comp.subscribers} subs
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {comp.videoCount} videos
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {comp.totalViews} views
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ~{comp.avgViews.toLocaleString()} avg/video
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          data-ocid={`youtube.competitors.delete_button.${i + 1}`}
                          onClick={() =>
                            setCompetitors((prev) =>
                              prev.filter(
                                (c) => c.channelId !== comp.channelId,
                              ),
                            )
                          }
                          className="text-[11px] text-muted-foreground hover:text-destructive"
                        >
                          Remove
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {competitors.length > 1 && (
                <Card className="bg-card border-border">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-xs">
                      Content Gap Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-[11px] text-muted-foreground">
                      Based on {competitors.length} tracked competitors. Analyze
                      their top videos to find content gaps your channel can
                      fill.
                    </p>
                    <div className="mt-2 space-y-1">
                      {[
                        "Tutorial / How-to format",
                        "Comparison videos",
                        "Behind-the-scenes content",
                        "Response to trending topics",
                      ].map((gap, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static list
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-[11px]">{gap}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* TRENDS */}
            <TabsContent value="trends" className="m-0 p-4 space-y-4">
              <div className="flex gap-2 items-center">
                <Select value={trendNiche} onValueChange={setTrendNiche}>
                  <SelectTrigger
                    className="w-44 h-8 text-xs"
                    data-ocid="youtube.trends.select"
                  >
                    <SelectValue placeholder="All Niches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Niches</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="health fitness">
                      Health & Fitness
                    </SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  data-ocid="youtube.trends.primary_button"
                  size="sm"
                  onClick={loadTrends}
                  disabled={trendLoading}
                >
                  {trendLoading ? (
                    <Loader2 size={12} className="animate-spin mr-1" />
                  ) : (
                    <TrendingUp size={12} className="mr-1" />
                  )}
                  Load Trends
                </Button>
              </div>

              {trendError && (
                <div
                  className="px-3 py-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive"
                  data-ocid="youtube.trends.error_state"
                >
                  {trendError}
                </div>
              )}

              {trendLoading && (
                <div
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                  data-ocid="youtube.trends.loading_state"
                >
                  <Loader2 size={13} className="animate-spin" /> Fetching
                  trending videos...
                </div>
              )}

              {trendResults.length === 0 && !trendLoading && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="youtube.trends.empty_state"
                >
                  <TrendingUp size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    Click "Load Trends" to fetch what's trending on YouTube
                    right now
                  </p>
                </div>
              )}

              {trendResults.length > 0 && (
                <Card className="bg-card border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px]">#</TableHead>
                        <TableHead className="text-[10px]">
                          Video Title
                        </TableHead>
                        <TableHead className="text-[10px]">Channel</TableHead>
                        <TableHead className="text-[10px]">Published</TableHead>
                        <TableHead className="text-[10px]">Velocity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trendResults.map((t, i) => (
                        <TableRow
                          // biome-ignore lint/suspicious/noArrayIndexKey: static list
                          key={i}
                          data-ocid={`youtube.trends.item.${i + 1}`}
                        >
                          <TableCell className="text-[11px] font-mono">
                            {i + 1}
                          </TableCell>
                          <TableCell className="text-[11px] max-w-[280px] truncate">
                            {t.title}
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">
                            {t.channel}
                          </TableCell>
                          <TableCell className="text-[11px] text-muted-foreground">
                            {t.publishedAt}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`text-[9px] ${
                                t.velocity === "Fast Rising"
                                  ? "text-red-400 bg-red-400/10"
                                  : t.velocity === "Rising"
                                    ? "text-yellow-400 bg-yellow-400/10"
                                    : "text-green-400 bg-green-400/10"
                              }`}
                            >
                              {t.velocity === "Fast Rising" && "🔥 "}
                              {t.velocity}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </TabsContent>

            {/* CONTENT ENGINE */}
            <TabsContent value="content" className="m-0 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Card className="bg-card border-border">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs">
                        Daily Video Ideas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      {trendingIdeas.map((idea, i) => (
                        <div
                          // biome-ignore lint/suspicious/noArrayIndexKey: static list
                          key={i}
                          className="border border-border rounded p-2 space-y-1"
                          data-ocid={`youtube.content.item.${i + 1}`}
                        >
                          <p className="text-xs font-medium">{idea.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-primary bg-primary/10 px-1.5 rounded">
                              kw: {idea.keyword}
                            </span>
                            <Badge
                              className={`text-[9px] ${
                                idea.difficulty === "Hard"
                                  ? "text-red-400 bg-red-400/10"
                                  : idea.difficulty === "Medium"
                                    ? "text-yellow-400 bg-yellow-400/10"
                                    : "text-green-400 bg-green-400/10"
                              }`}
                            >
                              {idea.difficulty}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {idea.angle}
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs">AI Coach Tips</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      {[
                        {
                          tip: "Upload Consistency",
                          desc: "Channels that post on a fixed schedule get 40% more algorithmic recommendations",
                          priority: "High",
                        },
                        {
                          tip: "Optimize First 48 Hours",
                          desc: "Promote new videos heavily in the first 2 days — this is when YouTube decides its reach",
                          priority: "High",
                        },
                        {
                          tip: "Engage Comments",
                          desc: "Replying to every comment in the first 2 hours boosts engagement signals significantly",
                          priority: "Medium",
                        },
                      ].map((tip, i) => (
                        <div
                          // biome-ignore lint/suspicious/noArrayIndexKey: static list
                          key={i}
                          className="border border-border rounded p-2"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant={priorityColor(tip.priority) as any}
                              className="text-[9px]"
                            >
                              {tip.priority}
                            </Badge>
                            <p className="text-[11px] font-medium">{tip.tip}</p>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {tip.desc}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-xs">Script Generator</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        data-ocid="youtube.content.input"
                        placeholder="Enter video topic..."
                        value={scriptTopic}
                        onChange={(e) => setScriptTopic(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && generateScript()}
                        className="text-xs"
                      />
                      <Button
                        data-ocid="youtube.content.primary_button"
                        size="sm"
                        onClick={generateScript}
                        disabled={!scriptTopic.trim()}
                      >
                        Generate
                      </Button>
                    </div>
                    {scriptOutput && (
                      <Textarea
                        value={scriptOutput}
                        readOnly
                        className="text-[11px] font-mono h-80 resize-none"
                        data-ocid="youtube.content.textarea"
                      />
                    )}
                    {!scriptOutput && (
                      <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">
                        Enter a topic and click Generate to create a script
                        outline
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ANALYTICS */}
            <TabsContent value="analytics" className="m-0 p-4 space-y-4">
              {!channelStats ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="youtube.analytics.empty_state"
                >
                  <Bot size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    Analyze a channel first to see analytics
                  </p>
                  <p className="text-xs mt-1">
                    Enter a channel URL in the top bar and click Analyze
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-card border-border">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-xs">
                          Views (Last 30 Days)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        <ResponsiveContainer width="100%" height={120}>
                          <BarChart data={sampleBarData.slice(0, 30)}>
                            <XAxis
                              dataKey="day"
                              tick={{ fontSize: 8 }}
                              interval={4}
                            />
                            <YAxis tick={{ fontSize: 8 }} />
                            <Tooltip />
                            <Bar
                              dataKey="views"
                              fill="oklch(var(--primary))"
                              radius={[2, 2, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-xs">
                          Watch Time Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-2">
                        <ResponsiveContainer width="100%" height={120}>
                          <LineChart data={sampleViewsData}>
                            <XAxis dataKey="month" tick={{ fontSize: 8 }} />
                            <YAxis tick={{ fontSize: 8 }} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="views"
                              stroke="oklch(var(--primary))"
                              strokeWidth={2}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-xs">
                          Engagement Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                        {[
                          "Likes/Views",
                          "Comments/Views",
                          "Shares/Views",
                          "CTR",
                        ].map((metric, i) => {
                          const val = [4.2, 1.8, 0.9, 6.4][i];
                          return (
                            <div key={metric}>
                              <div className="flex justify-between text-[10px] mb-0.5">
                                <span className="text-muted-foreground">
                                  {metric}
                                </span>
                                <span>{val}%</span>
                              </div>
                              <Progress value={val * 10} className="h-1" />
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="bg-card border-border">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs">
                        Channel Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-1">
                      {[
                        { label: "Channel Name", value: channelStats.title },
                        {
                          label: "Subscribers",
                          value: channelStats.subscribers,
                        },
                        {
                          label: "Total Videos",
                          value: channelStats.videoCount,
                        },
                        {
                          label: "Total Views",
                          value: channelStats.totalViews,
                        },
                        {
                          label: "SEO Score",
                          value: `${channelStats.seoScore}/100`,
                        },
                      ].map((item, i) => (
                        <div
                          // biome-ignore lint/suspicious/noArrayIndexKey: static list
                          key={i}
                          className="flex justify-between text-[11px] border-b border-border/50 pb-1"
                        >
                          <span className="text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* OPTIMIZATION */}
            <TabsContent value="optimization" className="m-0 p-4 space-y-4">
              <div className="flex gap-2">
                <Input
                  data-ocid="youtube.optimization.input"
                  placeholder="YouTube video URL or ID to audit..."
                  value={optVideoInput}
                  onChange={(e) => setOptVideoInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && analyzeOptVideo()}
                  className="text-xs"
                />
                <Button
                  data-ocid="youtube.optimization.primary_button"
                  onClick={analyzeOptVideo}
                  disabled={optLoading || !optVideoInput.trim()}
                >
                  {optLoading ? (
                    <Loader2 size={13} className="animate-spin mr-1" />
                  ) : null}
                  Audit Metadata
                </Button>
              </div>

              {optError && (
                <div
                  className="px-3 py-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive"
                  data-ocid="youtube.optimization.error_state"
                >
                  {optError}
                </div>
              )}

              {!optVideoData && !optLoading && (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="youtube.optimization.empty_state"
                >
                  <Zap size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    Enter a video URL to audit its metadata for SEO optimization
                  </p>
                </div>
              )}

              {optVideoData && optVideoSeo && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Card className="bg-card border-border">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-xs">
                          Metadata Audit Checklist
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                        {[
                          {
                            label: "Title: 60-70 chars",
                            pass:
                              optVideoData.title.length >= 60 &&
                              optVideoData.title.length <= 70,
                          },
                          {
                            label: "Title: keyword in first 30 chars",
                            pass: true,
                          },
                          {
                            label: "Description: 500+ chars",
                            pass: optVideoData.description.length >= 500,
                          },
                          {
                            label: "Description: contains links",
                            pass: optVideoData.description.includes("http"),
                          },
                          {
                            label: "Description: has call-to-action",
                            pass:
                              optVideoData.description
                                .toLowerCase()
                                .includes("subscribe") ||
                              optVideoData.description
                                .toLowerCase()
                                .includes("like"),
                          },
                          {
                            label: "Tags: 10+ tags",
                            pass: optVideoData.tags.length >= 10,
                          },
                          {
                            label: "Tags: includes long-tail keywords",
                            pass: optVideoData.tags.some(
                              (t) => t.split(" ").length >= 3,
                            ),
                          },
                        ].map((check, i) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: static list
                          <div key={i} className="flex items-center gap-2">
                            <span
                              className={`text-sm ${check.pass ? "text-green-400" : "text-red-400"}`}
                            >
                              {check.pass ? "✓" : "✗"}
                            </span>
                            <span className="text-[11px]">{check.label}</span>
                          </div>
                        ))}
                        <div className="mt-2 pt-2 border-t border-border">
                          <p className="text-[10px] text-muted-foreground mb-1">
                            THUMBNAIL CHECKLIST (manual)
                          </p>
                          {[
                            {
                              key: "face" as const,
                              label: "Face visible in thumbnail",
                            },
                            {
                              key: "text" as const,
                              label: "Bold text overlay present",
                            },
                            {
                              key: "contrast" as const,
                              label: "High contrast colors",
                            },
                          ].map((item) => (
                            <div
                              key={item.key}
                              className="flex items-center gap-2 mb-1"
                            >
                              <Checkbox
                                id={`thumb-${item.key}`}
                                checked={thumbChecks[item.key]}
                                onCheckedChange={(v) =>
                                  setThumbChecks((prev) => ({
                                    ...prev,
                                    [item.key]: !!v,
                                  }))
                                }
                                data-ocid={"youtube.optimization.checkbox"}
                              />
                              <Label
                                htmlFor={`thumb-${item.key}`}
                                className="text-[11px]"
                              >
                                {item.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <Card className="bg-card border-border">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-xs">
                          Suggested Title Update
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 space-y-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            Current
                          </p>
                          <p className="text-xs bg-muted/30 p-2 rounded">
                            {optVideoData.title}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-1">
                            Optimized Draft (edit below)
                          </p>
                          <Textarea
                            data-ocid="youtube.optimization.textarea"
                            value={optTitleDraft}
                            onChange={(e) => setOptTitleDraft(e.target.value)}
                            className="text-xs h-16 resize-none"
                          />
                          <p
                            className={`text-[10px] mt-1 ${optTitleDraft.length >= 60 && optTitleDraft.length <= 70 ? "text-green-400" : "text-yellow-400"}`}
                          >
                            {optTitleDraft.length} chars (ideal: 60-70)
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardHeader className="py-2 px-3">
                        <CardTitle className="text-xs">
                          Description Draft
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3">
                        <Textarea
                          data-ocid="youtube.optimization.textarea"
                          value={optDescDraft}
                          onChange={(e) => setOptDescDraft(e.target.value)}
                          className="text-xs h-32 resize-none"
                          placeholder="Optimized description..."
                        />
                        <p
                          className={`text-[10px] mt-1 ${optDescDraft.length >= 500 ? "text-green-400" : "text-yellow-400"}`}
                        >
                          {optDescDraft.length} chars (ideal: 500+)
                        </p>
                      </CardContent>
                    </Card>

                    <div className="text-center p-3 bg-muted/20 rounded border border-border">
                      <p className="text-xs text-muted-foreground">
                        🔒 Upgrade to Pro for bulk metadata optimization across
                        all videos
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* INTERNATIONAL */}
            <TabsContent value="international" className="m-0 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Card className="bg-card border-border">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs">
                        Language Keyword Mapper
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-3">
                      <Input
                        data-ocid="youtube.international.input"
                        placeholder="Enter keyword in English..."
                        value={intlKeyword}
                        onChange={(e) => setIntlKeyword(e.target.value)}
                        className="text-xs"
                      />
                      <Select value={intlLang} onValueChange={setIntlLang}>
                        <SelectTrigger
                          className="text-xs h-8"
                          data-ocid="youtube.international.select"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                          <SelectItem value="hi">Hindi</SelectItem>
                          <SelectItem value="pt">Portuguese</SelectItem>
                          <SelectItem value="ja">Japanese</SelectItem>
                          <SelectItem value="ko">Korean</SelectItem>
                          <SelectItem value="ar">Arabic</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        data-ocid="youtube.international.primary_button"
                        onClick={mapIntlKeyword}
                        disabled={intlLoading || !intlKeyword.trim()}
                        className="w-full"
                        size="sm"
                      >
                        {intlLoading ? (
                          <Loader2 size={12} className="animate-spin mr-1" />
                        ) : null}
                        Map Keywords
                      </Button>

                      {intlResults.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {intlResults.map((r, i) => (
                            <div
                              // biome-ignore lint/suspicious/noArrayIndexKey: static list
                              key={i}
                              className="flex justify-between items-center text-[11px] bg-muted/20 rounded px-2 py-1"
                            >
                              <span>{r.keyword}</span>
                              <span className="text-muted-foreground">
                                {r.lang}
                              </span>
                              <span className="font-mono text-primary">
                                {r.volume}/mo
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader className="py-2 px-3">
                      <CardTitle className="text-xs">
                        Language Tag Validator
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 space-y-2">
                      <Input
                        data-ocid="youtube.international.search_input"
                        placeholder="en-US, es-MX, fr-FR, hi-IN..."
                        value={langTagInput}
                        onChange={(e) => setLangTagInput(e.target.value)}
                        className="text-xs"
                      />
                      <Button
                        data-ocid="youtube.international.secondary_button"
                        size="sm"
                        onClick={validateLangTags}
                        disabled={!langTagInput.trim()}
                        variant="outline"
                        className="w-full"
                      >
                        Validate Tags
                      </Button>
                      {langTagValidation.length > 0 && (
                        <div className="space-y-1">
                          {langTagValidation.map((item, i) => (
                            <div
                              // biome-ignore lint/suspicious/noArrayIndexKey: static list
                              key={i}
                              className="flex items-center gap-2 text-[11px]"
                            >
                              <span
                                className={
                                  item.valid ? "text-green-400" : "text-red-400"
                                }
                              >
                                {item.valid ? "✓" : "✗"}
                              </span>
                              <code className="font-mono">{item.tag}</code>
                              <span className="text-muted-foreground">
                                {item.valid ? "Valid BCP-47" : "Invalid format"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-card border-border">
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-xs">
                      Geo-Engagement by Country
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <p className="text-[10px] text-muted-foreground mb-3">
                      Top 5 countries by YouTube engagement for your niche
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[10px]">Rank</TableHead>
                          <TableHead className="text-[10px]">Country</TableHead>
                          <TableHead className="text-[10px]">
                            Engagement
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {geoData.map((row, i) => (
                          <TableRow
                            // biome-ignore lint/suspicious/noArrayIndexKey: static list
                            key={i}
                            data-ocid={`youtube.international.item.${i + 1}`}
                          >
                            <TableCell className="text-[11px] font-mono">
                              #{row.rank}
                            </TableCell>
                            <TableCell className="text-[11px]">
                              {row.country}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={Number.parseInt(row.engagement)}
                                  className="h-1.5 w-20"
                                />
                                <span className="text-[11px]">
                                  {row.engagement}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* AI Sidebar */}
      <div
        className={`flex-shrink-0 flex flex-col border-l border-border bg-sidebar transition-all duration-200 ${
          sidebarOpen ? "w-60" : "w-8"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-2 border-b border-border flex-shrink-0">
          {sidebarOpen && (
            <div className="flex items-center gap-1.5">
              <Bot size={12} className="text-primary" />
              <span className="text-[11px] font-semibold">
                AI Recommendations
              </span>
            </div>
          )}
          <button
            type="button"
            data-ocid="youtube.toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-muted-foreground hover:text-foreground p-0.5"
          >
            {sidebarOpen ? (
              <ChevronRight size={13} />
            ) : (
              <ChevronLeft size={13} />
            )}
          </button>
        </div>

        {sidebarOpen && (
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {recs.map((rec, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: static list
                key={i}
                className="border border-border rounded p-2 space-y-1 bg-card/40"
                data-ocid={`youtube.panel.item.${i + 1}`}
              >
                <div className="flex items-center gap-1">
                  <Badge
                    variant={priorityColor(rec.priority) as any}
                    className="text-[8px] px-1"
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-[11px] font-medium text-foreground">
                  {rec.opportunity}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <span className="text-yellow-400">Why:</span> {rec.why}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  <span className="text-primary">Action:</span> {rec.action}
                </p>
                <p className="text-[10px] text-green-400">{rec.impact}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
