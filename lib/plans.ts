export type PlanId = 'free' | 'pro' | 'unlimited'

export interface Plan {
  id: PlanId
  name: string
  priceNgn: number // monthly, in Naira
  tagline: string
  cvLimit: number // tailored CVs per month; Infinity for unlimited
  features: string[]
  highlight?: boolean
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Starter',
    priceNgn: 0,
    tagline: 'Try it on your next application',
    cvLimit: 3,
    features: [
      '3 tailored CVs total',
      'ATS match score',
      'Keyword suggestions',
      'Application tracker',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceNgn: 3500,
    tagline: 'For the active job hunt',
    cvLimit: 30,
    highlight: true,
    features: [
      '30 tailored CVs / month',
      'AI cover letters',
      'ATS match score & insights',
      'Unlimited application tracking',
      'Priority generation',
    ],
  },
  unlimited: {
    id: 'unlimited',
    name: 'Unlimited',
    priceNgn: 6500,
    tagline: 'Apply without limits',
    cvLimit: Infinity,
    features: [
      'Unlimited tailored CVs',
      'AI cover letters',
      'ATS match score & insights',
      'Unlimited application tracking',
      'Priority generation & support',
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
  return PLANS[(plan as PlanId) in PLANS ? (plan as PlanId) : 'free'].cvLimit
}
