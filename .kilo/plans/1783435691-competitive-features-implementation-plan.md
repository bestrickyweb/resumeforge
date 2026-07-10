# ResumeForge — Competitive Feature Implementation Plan

**Timestamp:** 1783435691  
**Target:** ResumeForge (Next.js App Router, Vercel AI SDK, Drizzle ORM, Better Auth, Paystack)  
**Goal:** Evolve from CV optimizer → full career command center by implementing prioritized competitive features.

---

## 1. Design Decisions (Resolved)

| Decision | Answer | Rationale |
|---|---|---|
| **Pricing tier structure** | Keep `free / pro / unlimited`; expand feature gates within each | Minimal migration risk; existing Paystack/webhook logic already keyed to `plan` field |
| **Interview Studio location** | `/dashboard/interview` (top-level dashboard route) | Consistent with `/dashboard/cvs`, `/dashboard/applications`, `/dashboard/billing` |
| **Chrome extension timing** | Phase 2 (after Interview Studio ships) | Requires separate repo, manifest v3 setup, and message-passing API; validate core AI features first |
| **Auto-apply scope** | Browser extension form-fill only in Phase 2; cloud autopilot deferred to Phase 3 | Legal/ethical risk and ATS fragility; extension autofill is lower-risk validation step |
| **Learning academy** | AI-generated micro-lessons from skills-gap analysis, no external content API | Avoids per-seat content licensing; leverages existing Gemini/OpenAI pipeline |
| **ATS detection** | AI-based heuristic from JD + company domain (no external API) | Jobscan's ATS Detection is a moat but requires proprietary data; heuristic is a credible v1 |
| **Salary data** | AI-estimated range from JD + location; no external salary API | Keeps marginal cost at zero; can swap in paid API (Glassdoor/Levels.fyi) later if needed |

---

## 2. Scope by Phase

### Phase 1 — Quick Wins + Interview Studio (Weeks 1–4)
**Goal:** Ship high-engagement features that reuse the existing AI pipeline and prove retention lift.

| # | Feature | New Files | Modified Files |
|---|---|---|---|
| 1.1 | Achievements Scanner (metrics coverage) | `app/actions/scan.ts`, new UI section in `/dashboard/cvs/[id]` | — |
| 1.2 | LinkedIn Optimizer + Import | `app/actions/linkedin.ts`, `/dashboard/profile/page.tsx` | `lib/db/schema.ts`, dashboard nav |
| 1.3 | Job Fit Analyzer (standalone score) | `app/actions/fit.ts`, `/dashboard/fit/page.tsx` | — |
| 1.4 | Smart Follow-Up Reminders | `app/actions/reminders.ts`, cron job, reminder badge in tracker | `lib/db/schema.ts` (add `nextReminderAt`, `lastContactAt` to `application`) |
| 1.5 | Interview Studio (mock + STAR coach) | `app/dashboard/interview/page.tsx`, `app/actions/interview.ts`, `app/api/interview/[...route]/route.ts` (WebSocket or SSE for voice) | — |
| 1.6 | Salary Benchmarking (basic) | `app/actions/salary.ts`, UI panel on application detail | — |
| 1.7 | Post-Interview Debrief + Thank-You Email | Add to Interview Studio page | — |

### Phase 2 — Acquisition & Habit Formation (Weeks 5–8)
**Goal:** Drive daily active use via Chrome extension and job feed.

| # | Feature | New Files | Modified Files |
|---|---|---|---|
| 2.1 | Chrome Extension (job capture + tracker sync) | Separate `extension/` directory with manifest v3; background + content scripts; API routes under `/api/extension/*` | — |
| 2.2 | Smart Job Feed (curated roles) | `app/dashboard/jobs/page.tsx`, `app/actions/jobs.ts` | — |
| 2.3 | Ghost Detection (silent tracker alerts) | Add `lastRecruiterReplyAt` to `application`; logic in reminder cron | `lib/db/schema.ts` |
| 2.4 | Expanded Tracker Statuses | Add `screen`, `assessment`, `accepted`, `declined` to `APPLICATION_STATUSES` | `lib/applications.ts`, dashboard board UI |
| 2.5 | Application Email Composer | Add to application detail view | — |

### Phase 3 — Automation & Scale (Weeks 9–16)
**Goal:** Mature the platform with automation and advanced AI features.

| # | Feature | New Files | Modified Files |
|---|---|---|---|
| 3.1 | Browser Extension Autofill (form fill on external ATS) | Extend extension with form-detection engine; API routes for profile data | — |
| 3.2 | Skills Gap Analysis + Learning Paths | `app/dashboard/skills/page.tsx`, `app/actions/skills.ts` | — |
| 3.3 | Real-Time Interview Copilot | WebSocket endpoint, mobile-responsive overlay UI | — |
| 3.4 | Pipeline Conversion Analytics | `app/dashboard/analytics/page.tsx`, aggregated queries | — |
| 3.5 | Auto-Apply / Autopilot (server-side) | Background worker (Vercel Cron / separate worker), application queue table | `lib/db/schema.ts` |

---

## 3. Database Schema Changes

### 3.1 Application Table Expansion

```sql
-- application table additions
ALTER TABLE application ADD COLUMN nextReminderAt TIMESTAMP;
ALTER TABLE application ADD COLUMN lastContactAt TIMESTAMP;
ALTER TABLE application ADD COLUMN followUpCount INTEGER DEFAULT 0;
ALTER TABLE application ADD COLUMN salaryOffered TEXT;
ALTER TABLE application ADD COLUMN salaryExpected TEXT;
ALTER TABLE application ADD COLUMN offerExpiresAt TIMESTAMP;
ALTER TABLE application ADD COLUMN lastRecruiterReplyAt TIMESTAMP;
ALTER TABLE application ADD COLUMN jobSource TEXT; -- 'manual' | 'extension' | 'feed'
ALTER TABLE application ADD COLUMN jobBoardId TEXT;
```

New status values to add to `APPLICATION_STATUSES`:
```
screen, assessment, accepted, declined
```

### 3.2 New Tables

```sql
-- Interview prep sessions
CREATE TABLE interview_session (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  applicationId INTEGER,
  jobTitle TEXT NOT NULL,
  company TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  userAnswers JSONB NOT NULL DEFAULT '[]',
  aiFeedback JSONB NOT NULL DEFAULT '[]',
  overallScore INTEGER,
  mode TEXT NOT NULL DEFAULT 'mock', -- 'mock' | 'copilot'
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- LinkedIn profile cache
CREATE TABLE linkedin_profile (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL UNIQUE,
  rawText TEXT NOT NULL,
  parsed JSONB NOT NULL DEFAULT '{}',
  optimizedHeadline TEXT,
  optimizedAbout TEXT,
  optimizedSkills JSONB NOT NULL DEFAULT '[]',
  scanScore INTEGER,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Saved job postings (from extension or feed)
CREATE TABLE job_posting (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  salary TEXT,
  url TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'extension' | 'feed'
  boardId TEXT,
  fitScore INTEGER,
  applied BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Reminder log
CREATE TABLE reminder (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  applicationId INTEGER NOT NULL,
  type TEXT NOT NULL, -- 'follow_up' | 'ghost_check' | 'interview_prep'
  scheduledAt TIMESTAMP NOT NULL,
  sentAt TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'sent' | 'dismissed'
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Skills gap analysis results
CREATE TABLE skills_gap_analysis (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  targetRole TEXT NOT NULL,
  targetIndustry TEXT,
  gaps JSONB NOT NULL DEFAULT '[]',
  recommendedLearning JSONB NOT NULL DEFAULT '[]',
  createdAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 3.3 Drizzle Schema Files

All new tables go in `lib/db/schema.ts`. The `application` table alterations require a new migration via `drizzle-kit`.

---

## 4. Server Action Surfaces

All new features follow the existing pattern: `'use server'` files under `app/actions/`, returning `{ ok: boolean, error?: string, data?: T }`.

| Action File | Key Exports | Dependencies |
|---|---|---|
| `app/actions/scan.ts` | `scanAchievements(cvText)` | AI SDK, existing tailorModel |
| `app/actions/linkedin.ts` | `importLinkedInProfile(urlOrText)`, `optimizeLinkedInProfile(profile)` | AI SDK |
| `app/actions/fit.ts` | `analyzeJobFit(jobDescription, cvText)` | AI SDK |
| `app/actions/reminders.ts` | `setReminder(applicationId, date)`, `dismissReminder(id)` | db, revalidatePath |
| `app/actions/interview.ts` | `generateInterviewQuestions(jobTitle, company, cvText)`, `submitMockAnswer(sessionId, questionIndex, answer)`, `scoreInterviewSession(sessionId)` | AI SDK |
| `app/actions/salary.ts` | `benchmarkSalary(jobTitle, location, experience)` | AI SDK |
| `app/actions/jobs.ts` | `saveJobPosting(input)`, `getSavedJobs()`, `matchJobsToProfile()` | db, AI SDK |
| `app/actions/skills.ts` | `analyzeSkillsGap(targetRole, currentCv)`, `generateLearningPath(gaps)` | AI SDK |

---

## 5. AI Prompt Strategy

All new AI calls reuse `tailorModel` (Gemini 2.5 Flash or GPT-5 Mini). New outputs use Zod schemas for structured JSON.

**Prompt reuse rules:**
- Never expose secrets or raw API keys in prompts.
- All prompts include the same ethical guardrail: "never fabricate experience, degrees, or qualifications."
- Use the same plain-text CV output format to maintain ATS compatibility.

**New schemas needed:**
- `AchievementScanResult` — bullets with/without metrics, suggested quantifications
- `LinkedInOptimizationResult` — headline, about, skills arrays with before/after
- `JobFitResult` — match score, matched skills, missing skills, section scores
- `InterviewQuestion[]` — question, category, ideal answer outline, sample follow-up
- `SalaryBenchmarkResult` — range low/high, median, confidence, factors
- `SkillsGapResult` — gap skill, priority, current level, target level, learning resources[]

---

## 6. UI Architecture

### 6.1 New Dashboard Routes

```
/dashboard/
  /cvs/[id]/          (existing — add achievements scanner panel)
  /applications/      (existing — add reminder badges, expanded statuses)
  /billing/           (existing)
  /interview/         (NEW — Interview Studio)
  /profile/           (NEW — LinkedIn Optimizer + Profile)
  /fit/               (NEW — standalone Job Fit Analyzer)
  /jobs/              (NEW — Smart Job Feed + saved jobs)
  /skills/            (NEW — Skills Gap + Learning Paths)
  /analytics/         (NEW — Pipeline funnel, response rates)
```

### 6.2 Component Additions

| Component | Location | Purpose |
|---|---|---|
| `AchievementScanner.tsx` | `components/dashboard/` | Highlights metric-poor bullets on CV detail page |
| `LinkedInOptimizer.tsx` | `components/dashboard/` | Before/after headline, about, skills editor |
| `InterviewStudio.tsx` | `components/dashboard/` | Mock interview flow: generate → answer → score → review |
| `JobFitPanel.tsx` | `components/dashboard/` | Inline score + skill gaps on application detail |
| `ReminderBadge.tsx` | `components/dashboard/` | Pill/badge showing pending reminders |
| `SalaryBenchmarkCard.tsx` | `components/dashboard/` | Salary range display on application detail |
| `SkillsGapRadar.tsx` | `components/dashboard/` | Radar/bar chart of missing skills with learning links |

All new components use existing `components/ui/` primitives (Card, Button, Badge, Tabs, Skeleton, Sonner).

---

## 7. Chrome Extension Plan (Phase 2)

Separate repo: `resumeforge-extension/`

**Manifest:** V3, permissions: `activeTab`, `storage`, `scripting`, host permissions for major job boards.

**Core flows:**
1. **Job Capture** — Content script detects job posting on LinkedIn, Indeed, Greenhouse, etc.; extracts title, company, description; sends to background script → POST to `/api/extension/jobs` → saved to `job_posting` table.
2. **Tracker Sync** — Background script polls `/api/extension/sync` for user's applications; updates local extension state.
3. **Autofill (Phase 2.4)** — Content script fills form fields from user's profile via `/api/extension/profile`.

**Message protocol:**
```
chrome.runtime.sendMessage({ type: 'SAVE_JOB', payload: {...} })
chrome.runtime.sendMessage({ type: 'GET_APPLICATIONS' })
chrome.runtime.sendMessage({ type: 'AUTOFILL_FORM', fields: {...} })
```

---

## 8. Pricing Tier Mapping (Updated)

| Feature | Free | Pro | Unlimited |
|---|---|---|---|
| **Core** | | | |
| CV Tailoring | 3 lifetime | 30/month | Unlimited |
| Cover Letters | — | Unlimited | Unlimited |
| ATS Match Score | Before/after | Before/after + history | Before/after + benchmarking |
| Application Tracker | 5 active | Unlimited + export | Unlimited + export |
| **Interview & Profile** | | | |
| AI Mock Interviews | 1/month | 10/month | Unlimited |
| LinkedIn Optimizer | 1 scan/month | Unlimited | Unlimited + auto-sync |
| Achievements Scanner | — | 5/month | Unlimited |
| Salary Benchmarking | Basic range | Full report + tips | Full report + coach |
| **Automation & Intelligence** | | | |
| Follow-Up Reminders | 2 active | Unlimited + ghost detection | Unlimited + ghost + digest |
| Job Fit Analyzer | — | 10 scans/month | Unlimited |
| Job Auto-Import | — | 50/month | Unlimited |
| Chrome Extension | — | Included + auto-save | Included + auto-save |
| **Advanced** | | | |
| Skills Gap Analysis | — | 1/month | Unlimited + learning paths |
| Real-Time Interview Copilot | — | — | 10 sessions/month |
| Auto-Apply / Autopilot | — | — | Included (capped) |
| Priority Support | Community | Email (48h) | Dedicated (24h) |

**Plan files to modify:**
- `lib/plans.ts` — expand `features` arrays and add new `PlanFeature` enum/type
- `components/dashboard/billing-plans.tsx` — update feature comparison grid
- `app/actions/queries.ts` — update `getUsage()` to return feature-level limits (not just CV count)

---

## 9. Failure Modes & Mitigations

| Failure Mode | Impact | Mitigation |
|---|---|---|
| AI hallucinates salary figures | User distrust | Always label as "AI estimate"; add confidence score; never present as exact |
| Chrome extension breaks on ATS DOM changes | Autofill fails | Version the extension API; graceful fallback to manual entry; monitor error rates |
| Interview copilot latency causes UX lag | Poor live experience | Use streaming (SSE) for answer suggestions; cache common JD embeddings |
| Skills gap analysis returns too many gaps | Overwhelming UX | Cap at top 5 gaps; rank by impact score from job fit analysis |
| Reminder cron floods user notifications | Notification fatigue | Max 1 reminder/day; respect quiet hours; allow user-configurable frequency |
| LinkedIn profile import fails (rate limit / auth) | Broken onboarding flow | Support paste-as-text fallback; cache successful imports for 30 days |

---

## 10. Validation Plan

### Phase 1 Validation
- [ ] **Unit tests:** New server actions return correct shapes; Zod schemas validate AI output
- [ ] **Integration tests:** Application status transitions, reminder cron fires correctly, interview session flow end-to-end
- [ ] **Manual QA:** Test with 3 real JDs and 2 CVs per new feature; verify ATS-safe output format
- [ ] **Usage tracking:** Instrument each new feature with `@vercel/analytics` events (`feature_used`, `feature_completed`)

### Phase 2 Validation
- [ ] **Extension QA:** Test on Chrome, Edge, Brave; verify job capture on 5 major boards
- [ ] **Feed QA:** Verify job deduplication, fit score consistency, stale-job pruning
- [ ] **Ghost detection QA:** Simulate 2-week-old silent applications; verify alert triggers

### Phase 3 Validation
- [ ] **Autofill QA:** Test on Workday, Greenhouse, Lever sample forms; verify field mapping accuracy
- [ ] **Copilot QA:** Measure answer latency; verify 70+ language support if multilingual
- [ ] **Analytics QA:** Verify funnel math matches raw application counts

---

## 11. Migration Path

1. **Schema:** Additive migrations only. No destructive changes to `tailored_cv`, `user`, or `subscription`.
2. **Pricing:** Feature gates enforced at server-action level, not UI-only. Free users attempting a gated feature receive an upgrade prompt via Sonner toast.
3. **AI Model:** All new features route through `tailorModel`. If model fails, fall back to same error handling as `tailorCv`.
4. **Chrome Extension:** Opt-in via dashboard toggle. Extension calls authenticated API routes with Better Auth session token.

---

## 12. Open Questions (Out of Scope for This Plan)

1. **Legal/compliance review** for auto-apply and extension autofill — does this violate ToS for any target ATS?
2. **Voice/audio infrastructure** for real-time interview copilot — WebRTC vs. streaming API?
3. **Content moderation** for AI-generated interview answers and learning paths.
4. **Data retention policy** for scraped job postings (GDPR/NDPR considerations).
5. **Internationalization** — current system prompt is Nigeria/remote-first; expanding to EU/US requires locale-aware salary data and language support.

---

## 13. Execution Order (Recommended)

**Sprint 1 (Week 1–2):** Schema migration + Achievements Scanner + Follow-Up Reminders + Salary Benchmarking  
**Sprint 2 (Week 3–4):** LinkedIn Optimizer + Job Fit Analyzer + Interview Studio (mock + STAR)  
**Sprint 3 (Week 5–6):** Interview Debrief + Expanded Statuses + Ghost Detection + Application Email Composer  
**Sprint 4 (Week 7–8):** Chrome Extension v1 (job capture only) + Smart Job Feed v1  
**Sprint 5 (Week 9–12):** Chrome Extension v2 (autofill) + Skills Gap Analysis + Learning Paths  
**Sprint 6 (Week 13–16):** Real-Time Interview Copilot + Analytics Dashboard + Auto-Apply worker

Each sprint should:
1. Run `npm run lint` and `npm run build` before merging
2. Update `docs/competitive-features-research.md` with shipped features
3. Instrument feature usage via `@vercel/analytics` before launch
