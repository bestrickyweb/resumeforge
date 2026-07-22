export type PlanId = 'free' | 'pro' | 'unlimited'
export type PlanFeatureKey =
  | 'cvTailoring'
  | 'coverLetter'
  | 'applicationTracker'
  | 'mockInterview'
  | 'linkedInOptimizer'
  | 'achievementsScanner'
  | 'salaryBenchmarking'
  | 'followUpReminder'
  | 'jobFitAnalyzer'
  | 'jobImport'
  | 'chromeExtension'
  | 'skillsGap'
  | 'interviewCopilot'
  | 'autoApply'

export interface PlanFeatureLimit {
  used: number
  limit: number
  remaining: number
}

export type PlanFeatureMap = {
  [key in PlanFeatureKey]: PlanFeatureLimit
}

export interface Plan {
  id: PlanId
  name: string
  priceNgn: number
  tagline: string
  cvLimit: number
  features: string[]
  featureLimits: Partial<Record<PlanFeatureKey, number>>
  highlight?: boolean
}

export const PLAN_FEATURE_LIMITS: Record<PlanId, Record<PlanFeatureKey, number>> = {
  free: {
    cvTailoring: 3,
    coverLetter: 0,
    applicationTracker: 5,
    mockInterview: 0,
    linkedInOptimizer: 0,
    achievementsScanner: 0,
    salaryBenchmarking: 0,
    followUpReminder: 2,
    jobFitAnalyzer: 0,
    jobImport: 0,
    chromeExtension: 0,
    skillsGap: 0,
    interviewCopilot: 0,
    autoApply: 0,
  },
  pro: {
    cvTailoring: 30,
    coverLetter: Infinity,
    applicationTracker: Infinity,
    mockInterview: 10,
    linkedInOptimizer: Infinity,
    achievementsScanner: 5,
    salaryBenchmarking: Infinity,
    followUpReminder: Infinity,
    jobFitAnalyzer: 10,
    jobImport: 50,
    chromeExtension: Infinity,
    skillsGap: 1,
    interviewCopilot: 0,
    autoApply: 0,
  },
  unlimited: {
    cvTailoring: Infinity,
    coverLetter: Infinity,
    applicationTracker: Infinity,
    mockInterview: Infinity,
    linkedInOptimizer: Infinity,
    achievementsScanner: Infinity,
    salaryBenchmarking: Infinity,
    followUpReminder: Infinity,
    jobFitAnalyzer: Infinity,
    jobImport: Infinity,
    chromeExtension: Infinity,
    skillsGap: Infinity,
    interviewCopilot: 10,
    autoApply: Infinity,
  },
}

export function getPlanFeatureLimit(plan: PlanId, feature: PlanFeatureKey): number {
  return PLAN_FEATURE_LIMITS[plan]?.[feature] ?? 0
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Starter',
    priceNgn: 0,
    tagline: 'Try it on your next application',
    cvLimit: 3,
    features: [
      '3 tailored CVs per week',
      'ATS match score',
      'Keyword suggestions',
      'Application tracker (5 active)',
    ],
    featureLimits: {
      cvTailoring: 3,
      applicationTracker: 5,
      followUpReminder: 2,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceNgn: 3500,
    tagline: 'For the active job hunt',
    cvLimit: 30,
    featureLimits: {
      cvTailoring: 30,
      coverLetter: Infinity,
      applicationTracker: Infinity,
      mockInterview: 10,
      linkedInOptimizer: Infinity,
      achievementsScanner: 5,
      followUpReminder: Infinity,
      jobFitAnalyzer: 10,
      jobImport: 50,
      chromeExtension: Infinity,
      skillsGap: 1,
    },
    highlight: true,
    features: [
      '30 tailored CVs / month',
      'AI cover letters',
      'ATS match score & history',
      'Unlimited application tracking + export',
      'Priority generation',
      '10 AI mock interviews / month',
      'Unlimited LinkedIn optimization',
      '5 achievements scans / month',
      'Unlimited follow-up reminders + ghost detection',
      '10 job fit scans / month',
      '50 job auto-imports / month',
      'Chrome extension (job capture)',
      '1 skills gap analysis / month',
    ],
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    priceNgn: 6500,
    tagline: 'Apply without limits',
    cvLimit: Infinity,
    featureLimits: {
      cvTailoring: Infinity,
      coverLetter: Infinity,
      applicationTracker: Infinity,
      mockInterview: Infinity,
      linkedInOptimizer: Infinity,
      achievementsScanner: Infinity,
      followUpReminder: Infinity,
      jobFitAnalyzer: Infinity,
      jobImport: Infinity,
      chromeExtension: Infinity,
      skillsGap: Infinity,
      interviewCopilot: 10,
      autoApply: Infinity,
    },
    features: [
      'Unlimited tailored CVs',
      'AI cover letters',
      'ATS match score + benchmarking',
      'Unlimited application tracking + export',
      'Priority generation & support',
      'Unlimited AI mock interviews',
      'Unlimited LinkedIn optimization + auto-sync',
      'Unlimited achievements scanner',
      'Unlimited follow-up reminders + ghost + digest',
      'Unlimited job fit analysis',
      'Unlimited job auto-imports',
      'Chrome extension + auto-save',
      'Unlimited skills gap + learning paths',
      '10 real-time interview copilot sessions / month',
      'Auto-apply (capped)',
    ],
  },
}

export function formatNgn(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function planCvLimit(plan: string): number {
  return PLAN_FEATURE_LIMITS[(plan as PlanId) in PLAN_FEATURE_LIMITS ? (plan as PlanId) : 'free'].cvTailoring
}
