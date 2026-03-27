# Anti-Gravity SEO Intelligence — Production QA & Stability Pass

## Current State

The platform is a full-stack ICP app with:
- Motoko backend: `runUrlAudit`, `runBulkAudit`, `runSeoAudit`, `saveSchedule`, `getSchedules`, `deleteSchedule`, `toggleSchedule`, `saveProjectHistory`, `getProjectHistory`, `getAllAiTasks`, `getAllBacklinks`, `getAllCompetitors`, `getAllKeywords`, `getDashboardMetrics` — all implemented
- Frontend: 8 page components (Overview, SEOAudit, YouTubeSEO, OnPageSEO, BacklinkProfile, MarketIntelligence, TechnicalAudit, AIExecution) + AppShell
- `backend.did.d.ts` is outdated — missing newer backend methods (runUrlAudit, runBulkAudit, getUrlAuditResult, getAllUrlAuditResults, getSiteHealthScore, saveSchedule/getSchedules/deleteSchedule/toggleSchedule, saveProjectHistory/getProjectHistory)
- `mockData.ts` is used as fallback in: AIExecution, BacklinkProfile, MarketIntelligence, OnPageSEO, TechnicalAudit — these must fall back to "Connect API" prompts or loading skeletons, NOT mock arrays
- TechnicalAudit.tsx imports `mockAuditIssues` and uses it directly with no live fetch
- Error handling is inconsistent — some pages silently fail, others show no feedback
- All 9 YouTube SEO tabs need proper empty/loading/error state handling when API key is absent

## Requested Changes (Diff)

### Add
- Complete type definitions in `backend.did.d.ts` for all missing backend methods
- Robust error boundaries on every page (try/catch with user-visible error messages)
- Loading skeleton states on all async data fetches
- Empty state components when no data is available (no mock fallbacks)
- Toast notifications for all user actions (audit started, export downloaded, schedule saved, error occurred)
- Input validation on all form fields (URL format check before submitting audit, channel ID format for YouTube)
- Retry logic on failed backend calls (max 2 retries with exponential backoff)
- Console logging for all backend errors (structured: module, action, error)

### Modify
- `AIExecution.tsx`: Replace `mockAiTasks` fallback with backend call to `getAllAiTasks`; show empty state if no tasks
- `BacklinkProfile.tsx`: Replace `mockBacklinks` fallback with backend `getAllBacklinks`; show "Connect API key" empty state with instructions
- `MarketIntelligence.tsx`: Replace `mockCompetitors`/`mockKeywords` fallbacks with backend calls; show empty state with connect prompt
- `OnPageSEO.tsx`: Replace `mockKeywords` fallback with backend `getAllKeywords`; show empty state
- `TechnicalAudit.tsx`: Replace `mockAuditIssues` direct import and static render with backend `getAllAuditIssues`; show skeleton loading + empty state
- `SEOAudit.tsx`: Wire `saveSchedule`/`getSchedules`/`deleteSchedule`/`toggleSchedule` and `saveProjectHistory`/`getProjectHistory` to actual backend calls; show real persisted data in Automation and Reporting tabs
- `Overview.tsx`: Wire getDashboardMetrics to show live scores; handle error state gracefully
- All pages: Replace any remaining static/placeholder numbers with real data or "--" when unavailable

### Remove
- All `mockData` imports from page components (mockAiTasks, mockBacklinks, mockCompetitors, mockKeywords, mockAuditIssues)
- All silent fallbacks to mock arrays (e.g., `?? mockBacklinks`)
- Any hardcoded static metric values not coming from backend

## Implementation Plan

1. Update `backend.did.d.ts` to include all missing method signatures
2. Fix `TechnicalAudit.tsx` — replace mock import with live backend fetch + skeleton + empty state
3. Fix `AIExecution.tsx` — remove mock fallback, add empty state
4. Fix `BacklinkProfile.tsx` — remove mock fallback, add "Connect API Key" empty state
5. Fix `MarketIntelligence.tsx` — remove mock fallbacks, add proper empty/connect states
6. Fix `OnPageSEO.tsx` — remove mock fallback, add empty state
7. Fix `SEOAudit.tsx` — wire schedule/project history CRUD to backend; add error handling on audit failures
8. Fix `Overview.tsx` — live metrics from backend, error state
9. Add input validation to URL inputs across SEOAudit and Overview
10. Add toast notifications for key user actions
11. Validate build compiles with zero TypeScript errors
