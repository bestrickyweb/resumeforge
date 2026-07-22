'use server'

import { z } from 'zod'
import { db } from '@/lib/db'
import { resumeProfile } from '@/lib/db/schema'
import { getUserId } from '@/lib/session'
import { and, eq } from 'drizzle-orm'

const workExperienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
})

const educationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  gpa: z.string().optional(),
})

const skillSchema = z.object({
  name: z.string(),
  keywords: z.array(z.string()).default([]),
  category: z.string().optional(),
})

const certificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string().optional(),
  expires: z.string().optional(),
  url: z.string().optional(),
})

const projectSchema = z.object({
  name: z.string(),
  role: z.string().optional(),
  link: z.string().optional(),
  summary: z.string(),
  highlights: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
})

const languageSchema = z.object({
  language: z.string(),
  fluency: z.string().optional(),
})

const awardSchema = z.object({
  title: z.string(),
  date: z.string().optional(),
  awarder: z.string().optional(),
  summary: z.string().optional(),
})

const volunteeringSchema = z.object({
  organization: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
})

const referenceSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  company: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
})

const resumeProfileSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  summary: z.string().optional(),
  workExperience: z.array(workExperienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  languages: z.array(languageSchema).default([]),
  awards: z.array(awardSchema).default([]),
  volunteering: z.array(volunteeringSchema).default([]),
  references: z.array(referenceSchema).default([]),
})

export type ResumeProfileInput = z.infer<typeof resumeProfileSchema>

export async function getResumeProfile() {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(resumeProfile)
    .where(eq(resumeProfile.userId, userId))
    .limit(1)

  if (rows.length === 0) {
    return null
  }

  const row = rows[0]
  return {
    id: row.id,
    userId: row.userId,
    fullName: row.fullName,
    email: row.email,
    phone: row.phone,
    location: row.location,
    linkedinUrl: row.linkedinUrl,
    portfolioUrl: row.portfolioUrl,
    githubUrl: row.githubUrl,
    summary: row.summary,
    workExperience: JSON.parse(row.workExperience) as ResumeProfileInput['workExperience'],
    education: JSON.parse(row.education) as ResumeProfileInput['education'],
    skills: JSON.parse(row.skills) as ResumeProfileInput['skills'],
    certifications: JSON.parse(row.certifications) as ResumeProfileInput['certifications'],
    projects: JSON.parse(row.projects) as ResumeProfileInput['projects'],
    languages: JSON.parse(row.languages) as ResumeProfileInput['languages'],
    awards: JSON.parse(row.awards) as ResumeProfileInput['awards'],
    volunteering: JSON.parse(row.volunteering) as ResumeProfileInput['volunteering'],
    references: JSON.parse(row.references) as ResumeProfileInput['references'],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export async function saveResumeProfile(input: ResumeProfileInput) {
  const userId = await getUserId()

  const validated = resumeProfileSchema.parse(input)

  await db
    .insert(resumeProfile)
    .values({
      userId,
      fullName: validated.fullName,
      email: validated.email,
      phone: validated.phone,
      location: validated.location,
      linkedinUrl: validated.linkedinUrl || null,
      portfolioUrl: validated.portfolioUrl || null,
      githubUrl: validated.githubUrl || null,
      summary: validated.summary,
      workExperience: JSON.stringify(validated.workExperience),
      education: JSON.stringify(validated.education),
      skills: JSON.stringify(validated.skills),
      certifications: JSON.stringify(validated.certifications),
      projects: JSON.stringify(validated.projects),
      languages: JSON.stringify(validated.languages),
      awards: JSON.stringify(validated.awards),
      volunteering: JSON.stringify(validated.volunteering),
      references: JSON.stringify(validated.references),
    })
    .onConflictDoUpdate({
      target: resumeProfile.userId,
      set: {
        fullName: validated.fullName,
        email: validated.email,
        phone: validated.phone,
        location: validated.location,
        linkedinUrl: validated.linkedinUrl || null,
        portfolioUrl: validated.portfolioUrl || null,
        githubUrl: validated.githubUrl || null,
        summary: validated.summary,
        workExperience: JSON.stringify(validated.workExperience),
        education: JSON.stringify(validated.education),
        skills: JSON.stringify(validated.skills),
        certifications: JSON.stringify(validated.certifications),
        projects: JSON.stringify(validated.projects),
        languages: JSON.stringify(validated.languages),
        awards: JSON.stringify(validated.awards),
        volunteering: JSON.stringify(validated.volunteering),
        references: JSON.stringify(validated.references),
        updatedAt: new Date(),
      },
    })

  return { ok: true }
}

export async function deleteResumeProfile() {
  const userId = await getUserId()
  await db
    .delete(resumeProfile)
    .where(and(eq(resumeProfile.userId, userId)))
  return { ok: true }
}

export async function profileToCvText(profile: ResumeProfileInput): Promise<string> {
  const lines: string[] = []

  lines.push(profile.fullName.toUpperCase())
  if (profile.email) lines.push(`Email: ${profile.email}`)
  if (profile.phone) lines.push(`Phone: ${profile.phone}`)
  if (profile.location) lines.push(`Location: ${profile.location}`)
  if (profile.linkedinUrl) lines.push(`LinkedIn: ${profile.linkedinUrl}`)
  if (profile.portfolioUrl) lines.push(`Portfolio: ${profile.portfolioUrl}`)
  if (profile.githubUrl) lines.push(`GitHub: ${profile.githubUrl}`)
  lines.push('')

  if (profile.summary) {
    lines.push('PROFESSIONAL SUMMARY')
    lines.push(profile.summary)
    lines.push('')
  }

  if (profile.workExperience.length > 0) {
    lines.push('WORK EXPERIENCE')
    for (const exp of profile.workExperience) {
      lines.push(`${exp.role} at ${exp.company}${exp.location ? `, ${exp.location}` : ''}`)
      const dates = `${exp.startDate}${exp.current || !exp.endDate ? ' – Present' : ` – ${exp.endDate}`}`
      lines.push(dates)
      for (const highlight of exp.highlights) {
        lines.push(`- ${highlight}`)
      }
      lines.push('')
    }
  }

  if (profile.projects.length > 0) {
    lines.push('PROJECTS')
    for (const proj of profile.projects) {
      lines.push(`${proj.name}${proj.role ? ` — ${proj.role}` : ''}`)
      if (proj.link) lines.push(`Link: ${proj.link}`)
      lines.push(proj.summary)
      for (const highlight of proj.highlights) {
        lines.push(`- ${highlight}`)
      }
      lines.push('')
    }
  }

  if (profile.skills.length > 0) {
    lines.push('SKILLS')
    const grouped = profile.skills.reduce<Record<string, string[]>>((acc, skill) => {
      const category = skill.category || 'Other'
      if (!acc[category]) acc[category] = []
      acc[category].push(skill.name)
      return acc
    }, {})
    for (const [category, items] of Object.entries(grouped)) {
      lines.push(`${category}: ${items.join(', ')}`)
    }
    lines.push('')
  }

  if (profile.education.length > 0) {
    lines.push('EDUCATION')
    for (const edu of profile.education) {
      lines.push(`${edu.degree} in ${edu.field}`)
      lines.push(`${edu.school}`)
      const dates = `${edu.startDate}${edu.current || !edu.endDate ? ' – Present' : ` – ${edu.endDate}`}`
      lines.push(dates)
      if (edu.gpa) lines.push(`GPA: ${edu.gpa}`)
      lines.push('')
    }
  }

  if (profile.certifications.length > 0) {
    lines.push('CERTIFICATIONS')
    for (const cert of profile.certifications) {
      lines.push(`${cert.name} — ${cert.issuer}${cert.date ? ` (${cert.date})` : ''}`)
    }
    lines.push('')
  }

  if (profile.languages.length > 0) {
    lines.push('LANGUAGES')
    for (const lang of profile.languages) {
      lines.push(`${lang.language}${lang.fluency ? ` — ${lang.fluency}` : ''}`)
    }
    lines.push('')
  }

  if (profile.awards.length > 0) {
    lines.push('AWARDS')
    for (const award of profile.awards) {
      lines.push(`${award.title}${award.awarder ? ` — ${award.awarder}` : ''}${award.date ? ` (${award.date})` : ''}`)
    }
    lines.push('')
  }

  if (profile.volunteering.length > 0) {
    lines.push('VOLUNTEERING')
    for (const vol of profile.volunteering) {
      lines.push(`${vol.role} at ${vol.organization}`)
      const dates = `${vol.startDate}${vol.current || !vol.endDate ? ' – Present' : ` – ${vol.endDate}`}`
      lines.push(dates)
      for (const highlight of vol.highlights) {
        lines.push(`- ${highlight}`)
      }
      lines.push('')
    }
  }

  return lines.join('\n').trim()
}
