import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SeoIssue {
    title: string;
    description: string;
    category: string;
    severity: string;
    recommendation: string;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface Competitor {
    domainAuthority: bigint;
    domain: string;
    estimatedTraffic: bigint;
    trendDirection: string;
    keywordOverlap: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface SerpEntry {
    date: Time;
    isFeaturedSnippet: boolean;
    keyword: string;
    position: bigint;
}
export interface AuditIssue {
    affectedPages: bigint;
    title: string;
    description: string;
    category: string;
    severity: string;
}
export interface AiTask {
    id: string;
    completion: bigint;
    status: string;
    taskType: string;
    priority: bigint;
    affectedUrl: string;
}
export interface Keyword {
    difficulty: bigint;
    trafficValue: bigint;
    term: string;
    positionTrend: bigint;
    searchVolume: bigint;
    position: bigint;
}
export interface Backlink {
    status: string;
    domain: string;
    anchorText: string;
    authorityScore: bigint;
    linkType: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface DashboardMetrics {
    visibilityIndex: bigint;
    technicalHealth: bigint;
    onPageScore: bigint;
    totalKeywordsTracked: bigint;
    domainRating: bigint;
    backlinksCount: bigint;
}
export interface CoreWebVitals {
    cls: string;
    fcp: string;
    inp: string;
    lcp: string;
    ttfb: string;
    inpStatus: string;
    lcpStatus: string;
    clsStatus: string;
    speedIndex: string;
}
export interface SeoAuditResult {
    url: string;
    onPageIssues: Array<SeoIssue>;
    status: string;
    coreWebVitals: CoreWebVitals;
    accessibilityScore: bigint;
    overallScore: bigint;
    performanceScore: bigint;
    recommendations: Array<string>;
    seoScore: bigint;
    bestPracticesScore: bigint;
    timestamp: Time;
    technicalIssues: Array<SeoIssue>;
}
export interface AuditIssueDetail {
    issueType: string;
    description: string;
    priority: string;
    impact: string;
    fix: string;
    effort: string;
    category: string;
    beforeExample: string;
    afterExample: string;
}
export interface OnPageData {
    titleLength: bigint;
    titleText: string;
    metaDescLength: bigint;
    hasH1: boolean;
    h1Count: bigint;
    hasSchema: boolean;
    serpPixelWidth: bigint;
    hasCanonical: boolean;
    isHttps: boolean;
}
export interface ContentData {
    wordCount: bigint;
    isThinContent: boolean;
    keywordDensity: string;
    duplicateScore: bigint;
}
export interface MediaData {
    imageCount: bigint;
    missingAltCount: bigint;
    largeImageCount: bigint;
}
export interface InternationalData {
    hasHreflang: boolean;
    hreflangCount: bigint;
    missingReturnTags: boolean;
}
export interface ArchitectureData {
    crawlDepth: bigint;
    internalLinkCount: bigint;
    isOrphan: boolean;
    internalLinkScore: bigint;
}
export interface EducationData {
    hasBookSchema: boolean;
    hasProductSchema: boolean;
    indexingGapsDetected: boolean;
    cbseContentScore: bigint;
}
export interface UrlAuditResult {
    url: string;
    healthScore: bigint;
    timestamp: Time;
    issues: Array<AuditIssueDetail>;
    onPageData: OnPageData;
    contentData: ContentData;
    mediaData: MediaData;
    internationalData: InternationalData;
    architectureData: ArchitectureData;
    educationData: EducationData;
    performanceScore: bigint;
    seoScore: bigint;
    accessibilityScore: bigint;
    coreWebVitals: CoreWebVitals;
    status: string;
}
export interface BulkAuditResult {
    totalUrls: bigint;
    completedUrls: bigint;
    siteHealthScore: bigint;
    totalIssues: bigint;
    criticalIssues: bigint;
    results: Array<UrlAuditResult>;
    timestamp: Time;
}
export interface CrawlSchedule {
    id: string;
    name: string;
    urls: Array<string>;
    frequency: string;
    nextRun: bigint;
    lastRun: bigint | null;
    isActive: boolean;
}
export interface ProjectHistoryEntry {
    id: string;
    name: string;
    urlCount: bigint;
    siteHealthScore: bigint;
    issuesFound: bigint;
    createdAt: bigint;
}
export interface backendInterface {
    getAiTask(id: string): Promise<AiTask>;
    getAllAiTasks(): Promise<Array<AiTask>>;
    getAllAuditIssues(): Promise<Array<AuditIssue>>;
    getAllAuditResults(): Promise<Array<SeoAuditResult>>;
    getAllBacklinks(): Promise<Array<Backlink>>;
    getAllCompetitors(): Promise<Array<Competitor>>;
    getAllKeywords(): Promise<Array<Keyword>>;
    getAllUrlAuditResults(): Promise<Array<UrlAuditResult>>;
    getAuditIssue(title: string): Promise<AuditIssue>;
    getAuditResult(url: string): Promise<SeoAuditResult | null>;
    getBacklink(domain: string): Promise<Backlink>;
    getCompetitor(domain: string): Promise<Competitor>;
    getDashboardMetrics(): Promise<DashboardMetrics>;
    getKeyword(term: string): Promise<Keyword>;
    getProjectHistory(): Promise<Array<ProjectHistoryEntry>>;
    getSchedules(): Promise<Array<CrawlSchedule>>;
    getSerpHistory(): Promise<Array<SerpEntry>>;
    getSerpHistoryForKeyword(keyword: string): Promise<Array<SerpEntry>>;
    getSiteHealthScore(): Promise<bigint>;
    getUrlAuditResult(url: string): Promise<UrlAuditResult | null>;
    runBulkAudit(urls: Array<string>): Promise<BulkAuditResult>;
    runSeoAudit(url: string): Promise<SeoAuditResult>;
    runUrlAudit(url: string): Promise<UrlAuditResult>;
    saveProjectHistory(entry: ProjectHistoryEntry): Promise<void>;
    saveSchedule(schedule: CrawlSchedule): Promise<void>;
    deleteSchedule(id: string): Promise<void>;
    toggleSchedule(id: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
}
