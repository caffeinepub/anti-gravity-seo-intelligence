// Mock data for all SEO panels

export const mockMetrics = {
  onPageScore: 88,
  technicalHealth: 92,
  domainRating: 71,
  visibilityIndex: 84,
  totalKeywordsTracked: 1420,
  backlinksCount: 38640,
};

export const trendData30d = [
  { day: "Mar 1", value: 72 },
  { day: "Mar 4", value: 75 },
  { day: "Mar 7", value: 74 },
  { day: "Mar 10", value: 79 },
  { day: "Mar 13", value: 81 },
  { day: "Mar 16", value: 80 },
  { day: "Mar 19", value: 84 },
  { day: "Mar 22", value: 86 },
  { day: "Mar 25", value: 88 },
];

export const technicalTrend = [
  { day: "Mar 1", value: 78 },
  { day: "Mar 5", value: 80 },
  { day: "Mar 9", value: 82 },
  { day: "Mar 13", value: 85 },
  { day: "Mar 17", value: 87 },
  { day: "Mar 21", value: 89 },
  { day: "Mar 25", value: 92 },
];

export const backlinkTrend = [
  { day: "Mar 1", value: 31200 },
  { day: "Mar 5", value: 33400 },
  { day: "Mar 9", value: 34800 },
  { day: "Mar 13", value: 35600 },
  { day: "Mar 17", value: 36200 },
  { day: "Mar 21", value: 37500 },
  { day: "Mar 25", value: 38640 },
];

export const visibilityTrend = [
  { day: "Mar 1", value: 68 },
  { day: "Mar 5", value: 70 },
  { day: "Mar 9", value: 73 },
  { day: "Mar 13", value: 75 },
  { day: "Mar 17", value: 78 },
  { day: "Mar 21", value: 81 },
  { day: "Mar 25", value: 84 },
];

export const onPageDonut = [
  { name: "Content", value: 34, color: "#2AA9FF" },
  { name: "Meta", value: 28, color: "#2EE38B" },
  { name: "Headings", value: 22, color: "#9B6BFF" },
  { name: "Issues", value: 16, color: "#FF4D4D" },
];

export const mockKeywords = [
  {
    term: "AI SEO tools",
    position: 2,
    searchVolume: 18400,
    difficulty: 62,
    trafficValue: 9200,
    positionTrend: 3,
  },
  {
    term: "technical SEO audit",
    position: 4,
    searchVolume: 12800,
    difficulty: 55,
    trafficValue: 5100,
    positionTrend: 1,
  },
  {
    term: "backlink analysis",
    position: 6,
    searchVolume: 22000,
    difficulty: 71,
    trafficValue: 8800,
    positionTrend: -2,
  },
  {
    term: "keyword rank tracker",
    position: 1,
    searchVolume: 9600,
    difficulty: 48,
    trafficValue: 6700,
    positionTrend: 5,
  },
  {
    term: "competitor SEO spy",
    position: 3,
    searchVolume: 15200,
    difficulty: 58,
    trafficValue: 7300,
    positionTrend: 2,
  },
  {
    term: "on-page optimization",
    position: 5,
    searchVolume: 11000,
    difficulty: 44,
    trafficValue: 4900,
    positionTrend: 0,
  },
  {
    term: "core web vitals fix",
    position: 8,
    searchVolume: 7400,
    difficulty: 39,
    trafficValue: 3200,
    positionTrend: -1,
  },
  {
    term: "link building strategy",
    position: 11,
    searchVolume: 19800,
    difficulty: 75,
    trafficValue: 6100,
    positionTrend: 4,
  },
];

export const mockAuditIssues = [
  {
    title: "Missing meta descriptions",
    severity: "critical",
    category: "On-Page",
    affectedPages: 47,
    description: "47 pages are missing meta description tags",
  },
  {
    title: "Slow page load (>3s)",
    severity: "critical",
    category: "Speed",
    affectedPages: 12,
    description: "12 pages exceed acceptable load time threshold",
  },
  {
    title: "Duplicate H1 tags",
    severity: "warning",
    category: "On-Page",
    affectedPages: 23,
    description: "Multiple H1 tags detected on same page",
  },
  {
    title: "Images missing alt text",
    severity: "warning",
    category: "Accessibility",
    affectedPages: 89,
    description: "Images lack descriptive alt attributes",
  },
  {
    title: "Broken internal links",
    severity: "critical",
    category: "Crawlability",
    affectedPages: 8,
    description: "8 pages have broken internal link references",
  },
  {
    title: "Non-HTTPS resources",
    severity: "warning",
    category: "Security",
    affectedPages: 5,
    description: "Mixed content: HTTP resources on HTTPS pages",
  },
  {
    title: "Large JavaScript bundles",
    severity: "warning",
    category: "Speed",
    affectedPages: 3,
    description: "JS bundles exceed 500KB uncompressed",
  },
  {
    title: "Missing canonical tags",
    severity: "info",
    category: "Crawlability",
    affectedPages: 31,
    description: "Pages without canonical tag declarations",
  },
  {
    title: "Thin content pages",
    severity: "info",
    category: "On-Page",
    affectedPages: 14,
    description: "Pages with less than 300 words of content",
  },
];

export const mockBacklinks = [
  {
    domain: "techcrunch.com",
    authorityScore: 94,
    linkType: "dofollow",
    anchorText: "AI-powered SEO",
    status: "active",
  },
  {
    domain: "searchengineland.com",
    authorityScore: 91,
    linkType: "dofollow",
    anchorText: "SEO intelligence platform",
    status: "active",
  },
  {
    domain: "moz.com",
    authorityScore: 89,
    linkType: "dofollow",
    anchorText: "rank tracking tool",
    status: "new",
  },
  {
    domain: "ahrefs.com",
    authorityScore: 88,
    linkType: "nofollow",
    anchorText: "competitor analysis",
    status: "active",
  },
  {
    domain: "semrush.com",
    authorityScore: 86,
    linkType: "dofollow",
    anchorText: "backlink profile",
    status: "active",
  },
  {
    domain: "marketingland.com",
    authorityScore: 82,
    linkType: "dofollow",
    anchorText: "technical audit",
    status: "lost",
  },
  {
    domain: "searchjournal.com",
    authorityScore: 79,
    linkType: "nofollow",
    anchorText: "on-page optimization",
    status: "active",
  },
  {
    domain: "contentmarketing.com",
    authorityScore: 76,
    linkType: "dofollow",
    anchorText: "AI SEO automation",
    status: "new",
  },
  {
    domain: "digitaltrends.com",
    authorityScore: 74,
    linkType: "dofollow",
    anchorText: "keyword research",
    status: "active",
  },
  {
    domain: "seojournal.io",
    authorityScore: 68,
    linkType: "nofollow",
    anchorText: "rank tracking",
    status: "lost",
  },
];

export const mockAiTasks = [
  {
    id: "T001",
    taskType: "Meta Description Optimization",
    status: "completed",
    priority: 1,
    affectedUrl: "/blog/ai-seo-guide",
    completion: 100,
  },
  {
    id: "T002",
    taskType: "Internal Link Building",
    status: "running",
    priority: 1,
    affectedUrl: "/products/rank-tracker",
    completion: 67,
  },
  {
    id: "T003",
    taskType: "Schema Markup Injection",
    status: "running",
    priority: 2,
    affectedUrl: "/pricing",
    completion: 44,
  },
  {
    id: "T004",
    taskType: "H1 Tag Restructure",
    status: "queued",
    priority: 2,
    affectedUrl: "/features",
    completion: 0,
  },
  {
    id: "T005",
    taskType: "Image Alt Text Generation",
    status: "queued",
    priority: 3,
    affectedUrl: "/case-studies",
    completion: 0,
  },
  {
    id: "T006",
    taskType: "Page Speed Optimization",
    status: "failed",
    priority: 1,
    affectedUrl: "/landing/enterprise",
    completion: 28,
  },
  {
    id: "T007",
    taskType: "Canonical Tag Audit",
    status: "completed",
    priority: 3,
    affectedUrl: "/blog/*",
    completion: 100,
  },
  {
    id: "T008",
    taskType: "Keyword Density Rebalancing",
    status: "queued",
    priority: 2,
    affectedUrl: "/docs/api",
    completion: 0,
  },
];

export const mockCompetitors = [
  {
    domain: "ahrefs.com",
    estimatedTraffic: 2840000,
    keywordOverlap: 4200,
    domainAuthority: 91,
    trendDirection: "up",
  },
  {
    domain: "semrush.com",
    estimatedTraffic: 3100000,
    keywordOverlap: 5600,
    domainAuthority: 92,
    trendDirection: "stable",
  },
  {
    domain: "moz.com",
    estimatedTraffic: 1920000,
    keywordOverlap: 3100,
    domainAuthority: 88,
    trendDirection: "down",
  },
  {
    domain: "searchmetrics.com",
    estimatedTraffic: 480000,
    keywordOverlap: 1800,
    domainAuthority: 72,
    trendDirection: "down",
  },
  {
    domain: "brightedge.com",
    estimatedTraffic: 290000,
    keywordOverlap: 1200,
    domainAuthority: 68,
    trendDirection: "up",
  },
];

export const competitorTrafficShare = [
  { name: "semrush.com", value: 35, color: "#FF4D4D" },
  { name: "ahrefs.com", value: 32, color: "#FF8C42" },
  { name: "moz.com", value: 22, color: "#9B6BFF" },
  { name: "You", value: 11, color: "#2AA9FF" },
];

export const coreWebVitals = [
  { metric: "LCP", value: "2.1s", status: "good", target: "< 2.5s" },
  { metric: "FID", value: "48ms", status: "good", target: "< 100ms" },
  {
    metric: "CLS",
    value: "0.08",
    status: "needs-improvement",
    target: "< 0.1",
  },
  { metric: "TTFB", value: "380ms", status: "good", target: "< 600ms" },
  { metric: "FCP", value: "1.4s", status: "good", target: "< 1.8s" },
  {
    metric: "INP",
    value: "210ms",
    status: "needs-improvement",
    target: "< 200ms",
  },
];
