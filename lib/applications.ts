export const APPLICATION_STATUSES = [
  'saved',
  'applied',
  'screen',
  'assessment',
  'interview',
  'offer',
  'accepted',
  'declined',
  'rejected',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: 'Saved',
  applied: 'Applied',
  screen: 'Screening',
  assessment: 'Assessment',
  interview: 'Interview',
  offer: 'Offer',
  accepted: 'Accepted',
  declined: 'Declined',
  rejected: 'Rejected',
}
