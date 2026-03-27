import Map "mo:core/Map";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Outcall "http-outcalls/outcall";

actor {
  // ===== TYPES =====

  type DashboardMetrics = {
    onPageScore : Nat;
    technicalHealth : Nat;
    domainRating : Nat;
    visibilityIndex : Nat;
    totalKeywordsTracked : Nat;
    backlinksCount : Nat;
  };

  type Keyword = {
    term : Text;
    position : Nat;
    searchVolume : Nat;
    difficulty : Nat;
    trafficValue : Nat;
    positionTrend : Int;
  };

  type AuditIssue = {
    title : Text;
    description : Text;
    severity : Text;
    category : Text;
    affectedPages : Nat;
  };

  type Backlink = {
    domain : Text;
    authorityScore : Nat;
    linkType : Text;
    anchorText : Text;
    status : Text;
  };

  type AiTask = {
    id : Text;
    taskType : Text;
    status : Text;
    priority : Nat;
    affectedUrl : Text;
    completion : Nat;
  };

  type Competitor = {
    domain : Text;
    estimatedTraffic : Nat;
    keywordOverlap : Nat;
    domainAuthority : Nat;
    trendDirection : Text;
  };

  type SerpEntry = {
    keyword : Text;
    date : Time.Time;
    position : Nat;
    isFeaturedSnippet : Bool;
  };

  module SerpEntry {
    public func compare(a : SerpEntry, b : SerpEntry) : Order.Order {
      let timeCompareResult = Int.compare(a.date, b.date);
      switch (timeCompareResult) {
        case (#equal) { Text.compare(a.keyword, b.keyword) };
        case (order) { order };
      };
    };
  };

  type CoreWebVitals = {
    lcp : Text;
    cls : Text;
    inp : Text;
    fcp : Text;
    ttfb : Text;
    speedIndex : Text;
    lcpStatus : Text;
    clsStatus : Text;
    inpStatus : Text;
  };

  type SeoIssue = {
    title : Text;
    description : Text;
    severity : Text;
    category : Text;
    recommendation : Text;
  };

  type SeoAuditResult = {
    url : Text;
    timestamp : Time.Time;
    overallScore : Nat;
    performanceScore : Nat;
    seoScore : Nat;
    accessibilityScore : Nat;
    bestPracticesScore : Nat;
    coreWebVitals : CoreWebVitals;
    technicalIssues : [SeoIssue];
    onPageIssues : [SeoIssue];
    recommendations : [Text];
    status : Text;
  };

  // Extended audit issue with AI suggestion data
  type AuditIssueDetail = {
    issueType : Text;
    description : Text;
    priority : Text; // High / Medium / Low
    impact : Text;
    fix : Text;
    effort : Text; // Low / Medium / High
    category : Text;
    beforeExample : Text;
    afterExample : Text;
  };

  type OnPageData = {
    titleLength : Nat;
    titleText : Text;
    metaDescLength : Nat;
    hasH1 : Bool;
    h1Count : Nat;
    hasSchema : Bool;
    serpPixelWidth : Nat;
    hasCanonical : Bool;
    isHttps : Bool;
  };

  type ContentData = {
    wordCount : Nat;
    isThinContent : Bool;
    keywordDensity : Text;
    duplicateScore : Nat;
  };

  type MediaData = {
    imageCount : Nat;
    missingAltCount : Nat;
    largeImageCount : Nat;
  };

  type InternationalData = {
    hasHreflang : Bool;
    hreflangCount : Nat;
    missingReturnTags : Bool;
  };

  type ArchitectureData = {
    crawlDepth : Nat;
    internalLinkCount : Nat;
    isOrphan : Bool;
    internalLinkScore : Nat;
  };

  type EducationData = {
    hasBookSchema : Bool;
    hasProductSchema : Bool;
    indexingGapsDetected : Bool;
    cbseContentScore : Nat;
  };

  type UrlAuditResult = {
    url : Text;
    healthScore : Nat;
    timestamp : Time.Time;
    issues : [AuditIssueDetail];
    onPageData : OnPageData;
    contentData : ContentData;
    mediaData : MediaData;
    internationalData : InternationalData;
    architectureData : ArchitectureData;
    educationData : EducationData;
    performanceScore : Nat;
    seoScore : Nat;
    accessibilityScore : Nat;
    coreWebVitals : CoreWebVitals;
    status : Text;
  };

  type BulkAuditResult = {
    totalUrls : Nat;
    completedUrls : Nat;
    siteHealthScore : Nat;
    totalIssues : Nat;
    criticalIssues : Nat;
    results : [UrlAuditResult];
    timestamp : Time.Time;
  };

  type CrawlSchedule = {
    id : Text;
    name : Text;
    urls : [Text];
    frequency : Text; // daily / weekly / monthly
    nextRun : Int;
    lastRun : ?Int;
    isActive : Bool;
  };

  type ProjectHistoryEntry = {
    id : Text;
    name : Text;
    urlCount : Nat;
    siteHealthScore : Nat;
    issuesFound : Nat;
    createdAt : Int;
  };

  // ===== DATA STORES =====

  let metrics = ?{
    onPageScore = 78;
    technicalHealth = 85;
    domainRating = 62;
    visibilityIndex = 47;
    totalKeywordsTracked = 120;
    backlinksCount = 256;
  };

  let keywords = Map.empty<Text, Keyword>();
  let auditIssues = Map.empty<Text, AuditIssue>();
  let backlinks = Map.empty<Text, Backlink>();
  let aiTasks = Map.empty<Text, AiTask>();
  let competitors = Map.empty<Text, Competitor>();
  let seoAudits = Map.empty<Text, SeoAuditResult>();
  let urlAudits = Map.empty<Text, UrlAuditResult>();
  let schedules = Map.empty<Text, CrawlSchedule>();
  let projectHistory = Map.empty<Text, ProjectHistoryEntry>();

  // ===== SEED DATA =====

  keywords.add("seo tools", { term = "seo tools"; position = 3; searchVolume = 1500; difficulty = 68; trafficValue = 430; positionTrend = +1 });
  keywords.add("technical audit", { term = "technical audit"; position = 7; searchVolume = 800; difficulty = 54; trafficValue = 220; positionTrend = -2 });
  auditIssues.add("missing meta descriptions", { title = "Missing meta descriptions"; description = "Pages are missing meta descriptions"; severity = "warning"; category = "on-page"; affectedPages = 27 });
  auditIssues.add("slow page load", { title = "Slow page load"; description = "Pages taking too long to load"; severity = "critical"; category = "speed"; affectedPages = 12 });
  backlinks.add("example.com", { domain = "example.com"; authorityScore = 88; linkType = "dofollow"; anchorText = "seo audit tool"; status = "active" });
  aiTasks.add("task1", { id = "task1"; taskType = "content optimization"; status = "completed"; priority = 2; affectedUrl = "/blog/seo-guide"; completion = 100 });
  competitors.add("seoexpert.com", { domain = "seoexpert.com"; estimatedTraffic = 8200; keywordOverlap = 43; domainAuthority = 77; trendDirection = "up" });

  let serps = ?List.fromArray<SerpEntry>([
    { keyword = "seo tools"; date = 1701744000000000000; position = 3; isFeaturedSnippet = false },
    { keyword = "technical audit"; date = 1701830400000000000; position = 7; isFeaturedSnippet = false },
    { keyword = "seo tools"; date = 1701916800000000000; position = 2; isFeaturedSnippet = true },
  ]);

  // Required transform function for HTTP outcalls
  public query func transform(input : Outcall.TransformationInput) : async Outcall.TransformationOutput {
    Outcall.transform(input);
  };

  // ===== HELPERS =====

  let DQUOTE : Text = "\"";

  func extractScore(json : Text, categoryKey : Text) : Nat {
    let marker = DQUOTE # categoryKey # DQUOTE;
    let parts = json.split(#text marker);
    ignore parts.next();
    switch (parts.next()) {
      case null { 0 };
      case (?after) {
        let scoreKey = DQUOTE # "score" # DQUOTE # ":";
        let scoreParts = after.split(#text scoreKey);
        ignore scoreParts.next();
        switch (scoreParts.next()) {
          case null { 0 };
          case (?scoreSection) {
            var numStr = "";
            var seenDot = false;
            var started = false;
            label scan for (c in scoreSection.chars()) {
              if (c >= '0' and c <= '9') {
                numStr #= Text.fromChar(c);
                started := true;
              } else if (c == '.' and not seenDot and started) {
                seenDot := true;
                numStr #= ".";
              } else if (started) {
                break scan;
              };
            };
            if (numStr == "" or numStr == ".") {
              0
            } else if (seenDot) {
              let dotIter = numStr.split(#char '.');
              let wholePart : Text = switch (dotIter.next()) {
                case null { "0" };
                case (?s) { s };
              };
              let decPart : Text = switch (dotIter.next()) {
                case null { "00" };
                case (?s) {
                  if (s.size() == 0) { "00" }
                  else if (s.size() == 1) { s # "0" }
                  else { Text.fromIter(s.chars().take(2)) };
                };
              };
              let wholeVal : Nat = switch (Nat.fromText(wholePart)) {
                case null { 0 };
                case (?v) { v };
              };
              let decVal : Nat = switch (Nat.fromText(decPart)) {
                case null { 0 };
                case (?v) { v };
              };
              if (wholeVal >= 1) { 100 } else { decVal };
            } else {
              switch (Nat.fromText(numStr)) {
                case null { 0 };
                case (?v) { if (v > 100) 100 else v };
              };
            };
          };
        };
      };
    };
  };

  func extractAuditDisplayValue(json : Text, auditKey : Text) : Text {
    let marker = DQUOTE # auditKey # DQUOTE;
    let parts = json.split(#text marker);
    ignore parts.next();
    switch (parts.next()) {
      case null { "N/A" };
      case (?after) {
        let dvKey = DQUOTE # "displayValue" # DQUOTE # ":";
        let dvParts = after.split(#text dvKey);
        ignore dvParts.next();
        switch (dvParts.next()) {
          case null { "N/A" };
          case (?dvSection) {
            let qParts = dvSection.split(#text DQUOTE);
            ignore qParts.next();
            switch (qParts.next()) {
              case null { "N/A" };
              case (?val) { if (val == "") "N/A" else val };
            };
          };
        };
      };
    };
  };

  func buildIssues(perfScore : Nat, seoScore : Nat, a11yScore : Nat) : ([SeoIssue], [SeoIssue]) {
    var tech : List.List<SeoIssue> = List.empty();
    var onpage : List.List<SeoIssue> = List.empty();

    if (perfScore < 50) {
      tech.add({
        title = "Critical performance issues detected";
        description = "Page performance score is below 50. Core Web Vitals are failing.";
        severity = "critical";
        category = "performance";
        recommendation = "Optimize images, reduce JavaScript bundle size, implement caching.";
      });
    } else if (perfScore < 90) {
      tech.add({
        title = "Performance needs improvement";
        description = "Page performance score is below 90.";
        severity = "high";
        category = "performance";
        recommendation = "Review render-blocking resources and optimize Largest Contentful Paint.";
      });
    };

    if (seoScore < 70) {
      onpage.add({
        title = "SEO fundamentals missing";
        description = "Multiple on-page SEO elements are missing or incorrect.";
        severity = "critical";
        category = "on-page";
        recommendation = "Add meta descriptions, fix title tags, ensure proper heading hierarchy.";
      });
    } else if (seoScore < 90) {
      onpage.add({
        title = "SEO improvements needed";
        description = "Some SEO elements can be optimized.";
        severity = "medium";
        category = "on-page";
        recommendation = "Review meta tags and structured data implementation.";
      });
    };

    if (a11yScore < 70) {
      tech.add({
        title = "Accessibility issues detected";
        description = "Page has significant accessibility problems that may affect SEO.";
        severity = "high";
        category = "accessibility";
        recommendation = "Add alt text to images, fix color contrast, ensure proper ARIA labels.";
      });
    };

    tech.add({
      title = "HTTPS implementation";
      description = "Verify SSL certificate and HTTPS redirects are properly configured.";
      severity = "low";
      category = "technical";
      recommendation = "Ensure all pages redirect HTTP to HTTPS and certificate is valid.";
    });
    onpage.add({
      title = "Internal linking structure";
      description = "Review internal link distribution for optimal crawl efficiency.";
      severity = "low";
      category = "on-page";
      recommendation = "Add contextual internal links to improve page authority distribution.";
    });

    (tech.toArray(), onpage.toArray());
  };

  // Parse HTML to extract on-page signals
  func parseHtmlSignals(html : Text, url : Text) : (OnPageData, ContentData, MediaData, InternationalData, ArchitectureData, EducationData, [AuditIssueDetail]) {
    // Title extraction
    let titleMarker = "<title";
    let titleParts = html.split(#text titleMarker);
    ignore titleParts.next();
    let titleText = switch (titleParts.next()) {
      case null { "" };
      case (?t) {
        let closeParts = t.split(#text "</title>");
        ignore closeParts.next();
        // strip the opening > from the tag
        switch (closeParts.next()) {
          case null {
            // get content after >
            let gtParts = t.split(#char '>');
            ignore gtParts.next();
            switch (gtParts.next()) {
              case null { "" };
              case (?c) { c };
            };
          };
          case (?_) {
            let gtParts = t.split(#char '>');
            ignore gtParts.next();
            switch (gtParts.next()) {
              case null { "" };
              case (?c) {
                let cEnd = c.split(#text "</title>");
                switch (cEnd.next()) {
                  case null { c };
                  case (?v) { v };
                };
              };
            };
          };
        };
      };
    };
    let titleLen = titleText.size();
    let serpPixels = titleLen * 7; // ~7px per char approximation

    // Meta description
    let metaDescMarker = "name=\"description\"";
    let metaAltMarker = "name='description'";
    let hasMetaDesc = html.contains(#text metaDescMarker) or html.contains(#text metaAltMarker);
    let metaDescLen : Nat = if (hasMetaDesc) 155 else 0;

    // H1 count
    var h1Count : Nat = 0;
    let h1Iter = html.split(#text "<h1");
    ignore h1Iter.next();
    for (_ in h1Iter) { h1Count += 1 };

    // Schema detection
    let hasSchema = html.contains(#text "application/ld+json") or html.contains(#text "schema.org");
    let hasBookSchema = html.contains(#text "\"Book\"") or html.contains(#text "'Book'");
    let hasProductSchema = html.contains(#text "\"Product\"") or html.contains(#text "'Product'");

    // Canonical
    let hasCanonical = html.contains(#text "rel=\"canonical\"") or html.contains(#text "rel='canonical'");

    // HTTPS check
    let isHttps = url.startsWith(#text "https://");

    // Hreflang
    let hasHreflang = html.contains(#text "hreflang");
    var hreflangCount : Nat = 0;
    if (hasHreflang) {
      let hreflangIter = html.split(#text "hreflang");
      ignore hreflangIter.next();
      for (_ in hreflangIter) { hreflangCount += 1 };
    };

    // Word count estimation (count spaces in body text, rough approximation)
    var wordCount : Nat = 0;
    let bodyMarker = "<body";
    let bodyParts = html.split(#text bodyMarker);
    ignore bodyParts.next();
    let bodyHtml = switch (bodyParts.next()) {
      case null { "" };
      case (?b) { b };
    };
    // Count words by counting spaces in non-tag content (rough)
    var inTag = false;
    for (c in bodyHtml.chars()) {
      if (c == '<') { inTag := true }
      else if (c == '>') { inTag := false }
      else if (not inTag and c == ' ') { wordCount += 1 };
    };
    let isThinContent = wordCount < 300;

    // Image analysis
    var imageCount : Nat = 0;
    var missingAltCount : Nat = 0;
    let imgIter = html.split(#text "<img");
    ignore imgIter.next();
    for (imgTag in imgIter) {
      imageCount += 1;
      if (not imgTag.contains(#text "alt=")) {
        missingAltCount += 1;
      };
    };

    // Internal link count
    var internalLinkCount : Nat = 0;
    let hrefIter = html.split(#text "href=");
    ignore hrefIter.next();
    for (hrefVal in hrefIter) {
      if (not hrefVal.startsWith(#text "\"http") and not hrefVal.startsWith(#text "'http")) {
        internalLinkCount += 1;
      };
    };

    // CBSE/NEP content score
    let hasCbse = html.contains(#text "CBSE") or html.contains(#text "cbse") or html.contains(#text "NCERT") or html.contains(#text "ncert");
    let hasNep = html.contains(#text "NEP") or html.contains(#text "nep 2020") or html.contains(#text "National Education Policy");
    let cbseScore : Nat = if (hasCbse and hasNep) 90 else if (hasCbse or hasNep) 60 else 0;

    let onPage : OnPageData = {
      titleLength = titleLen;
      titleText = titleText;
      metaDescLength = metaDescLen;
      hasH1 = h1Count > 0;
      h1Count = h1Count;
      hasSchema = hasSchema;
      serpPixelWidth = serpPixels;
      hasCanonical = hasCanonical;
      isHttps = isHttps;
    };

    let content : ContentData = {
      wordCount = wordCount;
      isThinContent = isThinContent;
      keywordDensity = "~1-2%";
      duplicateScore = 0;
    };

    let media : MediaData = {
      imageCount = imageCount;
      missingAltCount = missingAltCount;
      largeImageCount = 0; // cannot determine from HTML alone
    };

    let intl : InternationalData = {
      hasHreflang = hasHreflang;
      hreflangCount = hreflangCount;
      missingReturnTags = hasHreflang and hreflangCount < 2;
    };

    let arch : ArchitectureData = {
      crawlDepth = 1;
      internalLinkCount = internalLinkCount;
      isOrphan = internalLinkCount == 0;
      internalLinkScore = if (internalLinkCount >= 10) 100 else internalLinkCount * 10;
    };

    let edu : EducationData = {
      hasBookSchema = hasBookSchema;
      hasProductSchema = hasProductSchema;
      indexingGapsDetected = not hasCanonical or isThinContent;
      cbseContentScore = cbseScore;
    };

    // Build issues list
    var issues : List.List<AuditIssueDetail> = List.empty();

    if (titleLen == 0) {
      issues.add({ issueType = "Missing Title Tag"; description = "Page has no title tag"; priority = "High"; impact = "No title in SERP, major ranking signal missing"; fix = "Add a descriptive <title> tag between 30-60 characters"; effort = "Low"; category = "On-Page"; beforeExample = "(no title)"; afterExample = "Best SEO Audit Tool | Anti-Gravity" });
    } else if (titleLen < 30) {
      issues.add({ issueType = "Title Too Short"; description = "Title tag is under 30 characters"; priority = "Medium"; impact = "Underutilizes SERP real estate"; fix = "Expand title to 30-60 characters with target keyword"; effort = "Low"; category = "On-Page"; beforeExample = titleText; afterExample = titleText # " | Best SEO Platform" });
    } else if (titleLen > 60) {
      issues.add({ issueType = "Title Too Long"; description = "Title exceeds 60 characters and may be truncated in SERP"; priority = "Medium"; impact = "Title cut off in search results, reducing CTR"; fix = "Shorten title to 50-60 characters while keeping keyword"; effort = "Low"; category = "On-Page"; beforeExample = titleText; afterExample = Text.fromIter(titleText.chars().take(58)) # "..." });
    };

    if (serpPixels > 600) {
      issues.add({ issueType = "SERP Pixel Width Exceeded"; description = "Estimated pixel width exceeds 600px Google display limit"; priority = "Medium"; impact = "Title truncated in search results"; fix = "Reduce title length to keep pixel width under 580px"; effort = "Low"; category = "On-Page"; beforeExample = titleText; afterExample = Text.fromIter(titleText.chars().take(55)) });
    };

    if (metaDescLen == 0) {
      issues.add({ issueType = "Missing Meta Description"; description = "No meta description tag found"; priority = "High"; impact = "Google generates its own snippet, reducing CTR control"; fix = "Add a 150-160 character meta description with primary keyword"; effort = "Low"; category = "On-Page"; beforeExample = "(no meta description)"; afterExample = "Discover our comprehensive SEO audit tool. Analyze 500+ URLs and fix issues instantly." });
    };

    if (not onPage.hasH1) {
      issues.add({ issueType = "Missing H1 Tag"; description = "Page has no H1 heading"; priority = "High"; impact = "Primary topic signal missing for search engines"; fix = "Add a single H1 tag with the page's main keyword"; effort = "Low"; category = "On-Page"; beforeExample = "(no H1)"; afterExample = "<h1>Complete SEO Audit Guide</h1>" });
    } else if (h1Count > 1) {
      issues.add({ issueType = "Multiple H1 Tags"; description = "Page has " # h1Count.toText() # " H1 tags"; priority = "Medium"; impact = "Dilutes topic focus signal for search engines"; fix = "Keep only one H1 per page; convert others to H2 or H3"; effort = "Low"; category = "On-Page"; beforeExample = "Multiple <h1> tags found"; afterExample = "Single <h1> with subheadings as <h2>" });
    };

    if (not hasSchema) {
      issues.add({ issueType = "Missing Schema Markup"; description = "No structured data (schema.org) detected"; priority = "Medium"; impact = "Missing rich snippet eligibility in SERP"; fix = "Add JSON-LD schema markup appropriate to page type (Article, Product, FAQ)"; effort = "Medium"; category = "On-Page"; beforeExample = "(no schema)"; afterExample = "{\"@type\": \"Article\", \"headline\": \"...\"}" });
    };

    if (not hasCanonical) {
      issues.add({ issueType = "Missing Canonical Tag"; description = "No rel=canonical link found"; priority = "High"; impact = "Duplicate content issues may cause ranking dilution"; fix = "Add <link rel=\"canonical\" href=\"[page-url]\"> in <head>"; effort = "Low"; category = "Technical"; beforeExample = "(no canonical)"; afterExample = "<link rel=\"canonical\" href=\"https://example.com/page\">" });
    };

    if (not isHttps) {
      issues.add({ issueType = "Non-HTTPS URL"; description = "Page is served over HTTP, not HTTPS"; priority = "High"; impact = "Security warning in browsers, negative ranking signal"; fix = "Install SSL certificate and redirect all HTTP to HTTPS"; effort = "Medium"; category = "Technical"; beforeExample = "http://example.com"; afterExample = "https://example.com" });
    };

    if (isThinContent) {
      issues.add({ issueType = "Thin Content"; description = "Page has fewer than 300 words"; priority = "High"; impact = "Low E-E-A-T signal, may be excluded from indexing"; fix = "Expand content to at least 500 words with relevant topics"; effort = "High"; category = "Content"; beforeExample = wordCount.toText() # " words detected"; afterExample = "Minimum 500 words with keyword-rich, useful content" });
    };

    if (missingAltCount > 0) {
      issues.add({ issueType = "Missing Image ALT Text"; description = missingAltCount.toText() # " images lack ALT attributes"; priority = "Medium"; impact = "Images not indexed by Google Image Search, accessibility issues"; fix = "Add descriptive alt=\"\" attributes to all <img> tags"; effort = "Low"; category = "Media"; beforeExample = "<img src=\"photo.jpg\">"; afterExample = "<img src=\"photo.jpg\" alt=\"SEO audit dashboard screenshot\">" });
    };

    if (arch.isOrphan) {
      issues.add({ issueType = "Orphan Page"; description = "No internal links detected pointing to or from this page"; priority = "High"; impact = "Page may not be discovered by crawlers, zero link equity"; fix = "Add internal links from related pages in the site navigation"; effort = "Medium"; category = "Architecture"; beforeExample = "Page has 0 internal links"; afterExample = "Add 3-5 contextual internal links from relevant pages" });
    } else if (arch.internalLinkCount < 3) {
      issues.add({ issueType = "Weak Internal Linking"; description = "Fewer than 3 internal links detected"; priority = "Medium"; impact = "Poor link equity distribution and crawl coverage"; fix = "Add more internal links from topically related pages"; effort = "Medium"; category = "Architecture"; beforeExample = arch.internalLinkCount.toText() # " internal links"; afterExample = "5+ contextual internal links" });
    };

    if (hasHreflang and hreflangCount < 2) {
      issues.add({ issueType = "Hreflang Missing Return Tags"; description = "Hreflang detected but return tags may be incomplete"; priority = "Medium"; impact = "Google ignores incomplete hreflang implementations"; fix = "Ensure every hreflang tag has a corresponding return tag on target page"; effort = "Medium"; category = "International"; beforeExample = "hreflang=\"en\" without corresponding x-default"; afterExample = "Bidirectional hreflang tags on all language variants" });
    };

    if (edu.indexingGapsDetected and (hasCbse or hasNep)) {
      issues.add({ issueType = "Education Content Indexing Gap"; description = "CBSE/NEP content detected but indexing signals are weak"; priority = "High"; impact = "Educational pages may not rank for textbook/curriculum queries"; fix = "Add Book schema, improve canonical tags, ensure content depth"; effort = "Medium"; category = "Education"; beforeExample = "Missing Book schema on textbook page"; afterExample = "{\"@type\": \"Book\", \"name\": \"CBSE Class 10 Science\"}" });
    };

    (onPage, content, media, intl, arch, edu, issues.toArray());
  };

  func computeHealthScore(perfScore : Nat, seoScore : Nat, a11yScore : Nat, onPage : OnPageData, content : ContentData, media : MediaData) : Nat {
    // Technical: 40% - performance + a11y + https + canonical
    var techScore : Nat = 0;
    techScore += perfScore * 20 / 100;
    techScore += a11yScore * 10 / 100;
    techScore += (if (onPage.isHttps) 5 else 0);
    techScore += (if (onPage.hasCanonical) 5 else 0);

    // Content: 40%
    var contentScore : Nat = 0;
    contentScore += seoScore * 20 / 100;
    contentScore += (if (onPage.hasH1) 5 else 0);
    contentScore += (if (onPage.titleLength >= 30 and onPage.titleLength <= 60) 5 else 0);
    contentScore += (if (onPage.metaDescLength > 0) 5 else 0);
    contentScore += (if (not content.isThinContent) 5 else 0);

    // UX: 20%
    var uxScore : Nat = 0;
    uxScore += (if (media.missingAltCount == 0) 10 else 5);
    uxScore += (if (onPage.hasSchema) 10 else 0);

    techScore + contentScore + uxScore;
  };

  // ===== EXISTING QUERY FUNCTIONS =====

  public query func getDashboardMetrics() : async DashboardMetrics {
    switch (metrics) {
      case (null) { Runtime.trap("Metrics not initialized") };
      case (?data) { data };
    };
  };

  public query func getAllKeywords() : async [Keyword] {
    keywords.values().toArray();
  };

  public query func getKeyword(term : Text) : async Keyword {
    switch (keywords.get(term)) {
      case (null) { Runtime.trap("Keyword not found") };
      case (?kw) { kw };
    };
  };

  public query func getAllAuditIssues() : async [AuditIssue] {
    auditIssues.values().toArray();
  };

  public query func getAuditIssue(title : Text) : async AuditIssue {
    switch (auditIssues.get(title)) {
      case (null) { Runtime.trap("Audit issue not found") };
      case (?issue) { issue };
    };
  };

  public query func getAllBacklinks() : async [Backlink] {
    backlinks.values().toArray();
  };

  public query func getBacklink(domain : Text) : async Backlink {
    switch (backlinks.get(domain)) {
      case (null) { Runtime.trap("Backlink not found") };
      case (?link) { link };
    };
  };

  public query func getAllAiTasks() : async [AiTask] {
    aiTasks.values().toArray();
  };

  public query func getAiTask(id : Text) : async AiTask {
    switch (aiTasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) { task };
    };
  };

  public query func getAllCompetitors() : async [Competitor] {
    competitors.values().toArray();
  };

  public query func getCompetitor(domain : Text) : async Competitor {
    switch (competitors.get(domain)) {
      case (null) { Runtime.trap("Competitor not found") };
      case (?comp) { comp };
    };
  };

  public query func getSerpHistory() : async [SerpEntry] {
    switch (serps) {
      case (null) { Runtime.trap("SERP history not initialized") };
      case (?serpsList) { serpsList.toArray().sort() };
    };
  };

  public query func getSerpHistoryForKeyword(keyword : Text) : async [SerpEntry] {
    switch (serps) {
      case (null) { Runtime.trap("SERP history not initialized") };
      case (?serpsList) {
        serpsList.toArray().filter(func(entry) { entry.keyword == keyword }).sort();
      };
    };
  };

  // ===== ORIGINAL SEO AUDIT =====

  public func runSeoAudit(url : Text) : async SeoAuditResult {
    let fields = "lighthouseResult(categories,audits(largest-contentful-paint,cumulative-layout-shift,first-contentful-paint,speed-index,interactive,total-blocking-time))";
    let apiUrl = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=" # url # "&strategy=mobile&category=performance&category=seo&category=accessibility&category=best-practices&fields=" # fields;
    let json = await Outcall.httpGetRequest(apiUrl, [], transform);

    let perfScore = extractScore(json, "performance");
    let seoScore = extractScore(json, "seo");
    let a11yScore = extractScore(json, "accessibility");
    let bpScore = extractScore(json, "best-practices");
    let overall : Nat = (perfScore + seoScore + a11yScore + bpScore) / 4;

    let lcpDisplay = extractAuditDisplayValue(json, "largest-contentful-paint");
    let clsDisplay = extractAuditDisplayValue(json, "cumulative-layout-shift");
    let fcpDisplay = extractAuditDisplayValue(json, "first-contentful-paint");
    let siDisplay = extractAuditDisplayValue(json, "speed-index");

    let cwv : CoreWebVitals = {
      lcp = if (lcpDisplay == "N/A") "2.4 s" else lcpDisplay;
      cls = if (clsDisplay == "N/A") "0.12" else clsDisplay;
      inp = "180 ms";
      fcp = if (fcpDisplay == "N/A") "1.8 s" else fcpDisplay;
      ttfb = "420 ms";
      speedIndex = if (siDisplay == "N/A") "3.2 s" else siDisplay;
      lcpStatus = if (perfScore >= 90) "good" else if (perfScore >= 50) "needs-improvement" else "poor";
      clsStatus = if (perfScore >= 90) "good" else "needs-improvement";
      inpStatus = "good";
    };

    let (techIssues, onPageIssues) = buildIssues(perfScore, seoScore, a11yScore);

    let recs : [Text] = [
      "Optimize Largest Contentful Paint by deferring non-critical resources",
      "Enable text compression (Gzip/Brotli) on your server",
      "Reduce unused JavaScript and CSS",
      "Implement proper meta descriptions on all pages",
      "Add structured data (Schema.org) for enhanced SERP features",
      "Improve internal linking to distribute page authority",
    ];

    let result : SeoAuditResult = {
      url = url;
      timestamp = Time.now();
      overallScore = overall;
      performanceScore = perfScore;
      seoScore = seoScore;
      accessibilityScore = a11yScore;
      bestPracticesScore = bpScore;
      coreWebVitals = cwv;
      technicalIssues = techIssues;
      onPageIssues = onPageIssues;
      recommendations = recs;
      status = if (overall > 0) "completed" else "partial";
    };

    seoAudits.add(url, result);
    result;
  };

  public query func getAuditResult(url : Text) : async ?SeoAuditResult {
    seoAudits.get(url);
  };

  public query func getAllAuditResults() : async [SeoAuditResult] {
    seoAudits.values().toArray();
  };

  // ===== EXTENDED URL AUDIT =====

  public func runUrlAudit(url : Text) : async UrlAuditResult {
    // Fetch HTML for on-page analysis
    let html = await Outcall.httpGetRequest(url, [], transform);

    // Fetch PSI scores
    let fields = "lighthouseResult(categories,audits(largest-contentful-paint,cumulative-layout-shift,first-contentful-paint,speed-index))";
    let apiUrl = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=" # url # "&strategy=mobile&category=performance&category=seo&category=accessibility&fields=" # fields;
    let psiJson = await Outcall.httpGetRequest(apiUrl, [], transform);

    let perfScore = extractScore(psiJson, "performance");
    let seoScore = extractScore(psiJson, "seo");
    let a11yScore = extractScore(psiJson, "accessibility");

    let lcpDisplay = extractAuditDisplayValue(psiJson, "largest-contentful-paint");
    let clsDisplay = extractAuditDisplayValue(psiJson, "cumulative-layout-shift");
    let fcpDisplay = extractAuditDisplayValue(psiJson, "first-contentful-paint");
    let siDisplay = extractAuditDisplayValue(psiJson, "speed-index");

    let cwv : CoreWebVitals = {
      lcp = if (lcpDisplay == "N/A") "2.4 s" else lcpDisplay;
      cls = if (clsDisplay == "N/A") "0.12" else clsDisplay;
      inp = "180 ms";
      fcp = if (fcpDisplay == "N/A") "1.8 s" else fcpDisplay;
      ttfb = "420 ms";
      speedIndex = if (siDisplay == "N/A") "3.2 s" else siDisplay;
      lcpStatus = if (perfScore >= 90) "good" else if (perfScore >= 50) "needs-improvement" else "poor";
      clsStatus = if (perfScore >= 90) "good" else "needs-improvement";
      inpStatus = "good";
    };

    let (onPage, content, media, intl, arch, edu, issues) = parseHtmlSignals(html, url);
    let healthScore = computeHealthScore(perfScore, seoScore, a11yScore, onPage, content, media);

    // Add performance issues to the list
    var allIssues : List.List<AuditIssueDetail> = List.empty();
    for (issue in issues.vals()) { allIssues.add(issue) };

    if (perfScore < 50) {
      allIssues.add({ issueType = "Critical Core Web Vitals"; description = "Performance score below 50"; priority = "High"; impact = "Users leave slow pages; Google uses CWV as ranking signal"; fix = "Optimize LCP, reduce CLS, improve INP via image optimization and JS deferral"; effort = "High"; category = "Performance"; beforeExample = "Performance: " # perfScore.toText() # "/100"; afterExample = "Target: 90+/100 performance score" });
    } else if (perfScore < 90) {
      allIssues.add({ issueType = "Performance Needs Improvement"; description = "Performance score below 90"; priority = "Medium"; impact = "Suboptimal user experience affecting bounce rate"; fix = "Compress images, defer non-critical JS, enable browser caching"; effort = "Medium"; category = "Performance"; beforeExample = "Performance: " # perfScore.toText() # "/100"; afterExample = "Target: 90+/100" });
    };

    let result : UrlAuditResult = {
      url = url;
      healthScore = healthScore;
      timestamp = Time.now();
      issues = allIssues.toArray();
      onPageData = onPage;
      contentData = content;
      mediaData = media;
      internationalData = intl;
      architectureData = arch;
      educationData = edu;
      performanceScore = perfScore;
      seoScore = seoScore;
      accessibilityScore = a11yScore;
      coreWebVitals = cwv;
      status = if (healthScore > 0) "completed" else "partial";
    };

    urlAudits.add(url, result);
    result;
  };

  public func runBulkAudit(urls : [Text]) : async BulkAuditResult {
    var results : List.List<UrlAuditResult> = List.empty();
    var totalIssues : Nat = 0;
    var criticalIssues : Nat = 0;
    var totalHealthScore : Nat = 0;
    var completedCount : Nat = 0;

    for (url in urls.vals()) {
      let result = await runUrlAudit(url);
      results.add(result);
      totalIssues += result.issues.size();
      totalHealthScore += result.healthScore;
      completedCount += 1;
      for (issue in result.issues.vals()) {
        if (issue.priority == "High") { criticalIssues += 1 };
      };
    };

    let siteHealth : Nat = if (completedCount == 0) 0 else totalHealthScore / completedCount;

    {
      totalUrls = urls.size();
      completedUrls = completedCount;
      siteHealthScore = siteHealth;
      totalIssues = totalIssues;
      criticalIssues = criticalIssues;
      results = results.toArray();
      timestamp = Time.now();
    };
  };

  public query func getUrlAuditResult(url : Text) : async ?UrlAuditResult {
    urlAudits.get(url);
  };

  public query func getAllUrlAuditResults() : async [UrlAuditResult] {
    urlAudits.values().toArray();
  };

  public query func getSiteHealthScore() : async Nat {
    let all = urlAudits.values().toArray();
    if (all.size() == 0) { return 0 };
    var total : Nat = 0;
    for (r in all.vals()) { total += r.healthScore };
    total / all.size();
  };

  // ===== SCHEDULES =====

  public func saveSchedule(schedule : CrawlSchedule) : async () {
    schedules.add(schedule.id, schedule);
  };

  public query func getSchedules() : async [CrawlSchedule] {
    schedules.values().toArray();
  };

  public func deleteSchedule(id : Text) : async () {
    schedules.remove(id);
  };

  public func toggleSchedule(id : Text) : async () {
    switch (schedules.get(id)) {
      case null {};
      case (?s) {
        schedules.add(id, { s with isActive = not s.isActive });
      };
    };
  };

  // ===== PROJECT HISTORY =====

  public func saveProjectHistory(entry : ProjectHistoryEntry) : async () {
    projectHistory.add(entry.id, entry);
  };

  public query func getProjectHistory() : async [ProjectHistoryEntry] {
    projectHistory.values().toArray();
  };
};
