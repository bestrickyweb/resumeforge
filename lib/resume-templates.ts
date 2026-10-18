export type TemplateTier = 'free' | 'pro' | 'unlimited'

export interface ResumeTemplate {
  slug: string
  name: string
  description: string
  tier: TemplateTier
  aiGuidance: string
}

// Slugs are persisted on tailored_cv.template, so never rename them — only the
// display name and guidance.
export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    slug: 'google',
    name: 'Impact',
    description:
      'Clean, ATS-safe, single-column layout with standard headings. The safest choice for passing automated screening systems.',
    tier: 'free',
    aiGuidance:
      'Format: Impact resume. Single column, ATS-safe, standard ALL CAPS headings (CONTACT, PROFESSIONAL SUMMARY, EXPERIENCE, SKILLS, EDUCATION). Emphasise the real, measurable impact the candidate achieved. Use concise, results-oriented bullets. Keep to 1-2 pages. Place contact info in the body, not header/footer.',
  },
  {
    slug: 'classic',
    name: 'Classic',
    description:
      'A timeless, universally accepted format that works across industries. Clean sections, clear hierarchy, and ATS-friendly.',
    tier: 'free',
    aiGuidance:
      'Format: Classic professional resume. Single column, ATS-safe, standard ALL CAPS headings (CONTACT, SUMMARY, WORK EXPERIENCE, SKILLS, EDUCATION). Reverse chronological work experience. Concise 2-3 line summary. Strong action verbs. Quantified achievements. Works for any industry. Place contact info in body, not header/footer.',
  },
  {
    slug: 'meta',
    name: 'Product Builder',
    description:
      'Project-focused format with a dedicated "Selected Projects" section. Emphasizes measurable outcomes and rapid iteration — ideal for product and engineering roles.',
    tier: 'pro',
    aiGuidance:
      'Format: Product/engineering resume. Key differences from generic: (1) Include a "PROJECTS" section after Experience with 2-3 major projects, each with 3-4 bullets showing impact (users, % improvement, cost savings) using only figures the candidate provided. (2) Where a real metric exists, lead the bullet with it (e.g. "Increased X by 30%"). (3) Use product keywords like "growth", "engagement", "retention", "A/B testing" where truthful. (4) Keep skills section concise with core languages and frameworks. (5) Single column, plain text ATS-safe. No "References available upon request".',
  },
  {
    slug: 'nigeria',
    name: 'Nigeria Local',
    description:
      'Format tailored for the Nigerian job market, including NYSC, WAEC/UME sections and local conventions expected by Nigerian recruiters.',
    tier: 'pro',
    aiGuidance:
      'Format: Nigerian-style CV. Include these sections in order: CONTACT, PROFESSIONAL SUMMARY, SKILLS, WORK EXPERIENCE, EDUCATION (include O\'Level/SSCE results with subjects and grades), NYSC (include NYSC certificate details, state of service, and any awards like "Best Corper"), PROFESSIONAL CERTIFICATIONS, HONOURS/AWARDS, PROJECTS (if applicable). Use UK English spelling. Keep experience reverse-chronological. Quantify where possible. ATS-safe plain text with ALL CAPS headings.',
  },
  {
    slug: 'microsoft',
    name: 'Enterprise',
    description:
      'Corporate, structured format with a "Core Competencies" skills matrix and achievement-focused bullets. Ideal for enterprise and technical roles.',
    tier: 'pro',
    aiGuidance:
      'Format: Corporate enterprise resume. Include a "CORE COMPETENCIES" section near the top with categorized skills (e.g. Languages: ..., Cloud: ..., Tools: ...). Work experience bullets follow CAR format (Challenge, Action, Result), leading with the result where a real metric exists. Use plain, specific action verbs (Built, Led, Designed, Reduced, Delivered) rather than buzzwords. Single column, plain text, ALL CAPS headings (PROFESSIONAL SUMMARY, CORE COMPETENCIES, PROFESSIONAL EXPERIENCE, EDUCATION). Keep 1-2 pages.',
  },
  {
    slug: 'apple',
    name: 'Minimalist',
    description:
      'Minimalist, design-forward format that emphasises simplicity and elegance. Focuses on innovation, design thinking, and high-impact achievements.',
    tier: 'unlimited',
    aiGuidance:
      'Format: Minimalist resume. Extremely concise. "PROFESSIONAL SUMMARY" is 1-2 punchy lines, not a paragraph. Work experience bullets are sparse but powerful — 2-3 bullets per role, each starting with a strong verb and a concrete outcome. Include a "DESIGN" or "INNOVATION" callout if the candidate has relevant projects. Use clean section headings. No graphics, single column, plain text. ATS-safe. Less is more — whitespace between sections.',
  },
]

export function getTemplate(slug: string): ResumeTemplate | undefined {
  return RESUME_TEMPLATES.find((t) => t.slug === slug)
}

export function getTemplatesByTier(tier: 'free' | 'pro' | 'unlimited'): ResumeTemplate[] {
  const tierOrder: Record<TemplateTier, number> = { free: 1, pro: 2, unlimited: 3 }
  const userTierLevel = tierOrder[tier]
  return RESUME_TEMPLATES.filter((t) => tierOrder[t.tier] <= userTierLevel)
}

export const DEFAULT_TEMPLATE_SLUG = 'google'
