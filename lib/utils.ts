import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Single source of truth for the ATS "interview cliff" thresholds and their
// presentation. Used by cv-detail, job-fit-panel, and the dashboard lists so
// the 70%/85% boundaries and colors never drift apart.
export const INTERVIEW_CLIFF = 70
export const INTERVIEW_STRONG = 85

export type InterviewBand = 'below-cliff' | 'competitive' | 'strong'

export function interviewBand(pct: number): InterviewBand {
  if (pct >= INTERVIEW_STRONG) return 'strong'
  if (pct >= INTERVIEW_CLIFF) return 'competitive'
  return 'below-cliff'
}

export const bandBadgeClass: Record<InterviewBand, string> = {
  'below-cliff': 'bg-destructive/10 text-destructive',
  competitive: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  strong: 'bg-primary/10 text-primary',
}

export const bandBarClass: Record<InterviewBand, string> = {
  'below-cliff': 'bg-destructive',
  competitive: 'bg-amber-500',
  strong: 'bg-primary',
}

export const bandLabel: Record<InterviewBand, string> = {
  'below-cliff': 'Below 70% — likely filtered',
  competitive: '70–84% — competitive',
  strong: '85%+ — strong',
}

export const INTERVIEW_OUTCOMES = ['interview', 'offer', 'accepted'] as const
export type InterviewOutcome = (typeof INTERVIEW_OUTCOMES)[number]
