'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export interface ManualResumeData {
  fullName: string
  email: string
  phone: string
  linkedin: string
  location: string
  headline: string
  summary: string
  experience: Array<{
    id: string
    company: string
    role: string
    startDate: string
    endDate: string
    bullets: string[]
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    gpa: string
  }>
  skills: string
  certifications: string
  projects: Array<{
    id: string
    name: string
    description: string
    url: string
  }>
}

const initialExperience = { id: '1', company: '', role: '', startDate: '', endDate: '', bullets: ['', '', ''] }
const initialEducation = { id: '1', institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }
const initialProject = { id: '1', name: '', description: '', url: '' }

export function ManualResumeForm({
  onDataChange,
}: {
  onDataChange: (data: ManualResumeData) => void
}) {
  const [data, setData] = useState<ManualResumeData>({
    fullName: '',
    email: '',
    phone: '',
    linkedin: '',
    location: '',
    headline: '',
    summary: '',
    experience: [initialExperience],
    education: [initialEducation],
    skills: '',
    certifications: '',
    projects: [],
  })

  const update = (patch: Partial<ManualResumeData>) => {
    const updated = { ...data, ...patch }
    setData(updated)
    onDataChange(updated)
  }

  const addExperience = () => {
    const newExp = { ...initialExperience, id: `exp-${Date.now()}` }
    const updated = { ...data, experience: [...data.experience, newExp] }
    setData(updated)
    onDataChange(updated)
  }

  const removeExperience = (id: string) => {
    const updated = { ...data, experience: data.experience.filter((e) => e.id !== id) }
    setData(updated)
    onDataChange(updated)
  }

  const updateExperience = (id: string, field: string, value: string) => {
    const updated = {
      ...data,
      experience: data.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }
    setData(updated)
    onDataChange(updated)
  }

  const updateExperienceBullets = (id: string, bullets: string[]) => {
    const updated = {
      ...data,
      experience: data.experience.map((e) => (e.id === id ? { ...e, bullets } : e)),
    }
    setData(updated)
    onDataChange(updated)
  }

  const addEducation = () => {
    const newEdu = { ...initialEducation, id: `edu-${Date.now()}` }
    const updated = { ...data, education: [...data.education, newEdu] }
    setData(updated)
    onDataChange(updated)
  }

  const removeEducation = (id: string) => {
    const updated = { ...data, education: data.education.filter((e) => e.id !== id) }
    setData(updated)
    onDataChange(updated)
  }

  const updateEducation = (id: string, field: string, value: string) => {
    const updated = {
      ...data,
      education: data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }
    setData(updated)
    onDataChange(updated)
  }

  const addProject = () => {
    const newProj = { ...initialProject, id: `proj-${Date.now()}` }
    const updated = { ...data, projects: [...data.projects, newProj] }
    setData(updated)
    onDataChange(updated)
  }

  const removeProject = (id: string) => {
    const updated = { ...data, projects: data.projects.filter((p) => p.id !== id) }
    setData(updated)
    onDataChange(updated)
  }

  const updateProject = (id: string, field: string, value: string) => {
    const updated = {
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }
    setData(updated)
    onDataChange(updated)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => update({ fullName: e.target.value })}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={data.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="+234 801 234 5678"
            />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input
              id="linkedin"
              value={data.linkedin}
              onChange={(e) => update({ linkedin: e.target.value })}
              placeholder="linkedin.com/in/janedoe"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={data.location}
              onChange={(e) => update({ location: e.target.value })}
              placeholder="Lagos, Nigeria"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="headline">Professional headline</Label>
            <Input
              id="headline"
              value={data.headline}
              onChange={(e) => update({ headline: e.target.value })}
              placeholder="Senior Product Manager | 8+ years in fintech SaaS"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.summary}
            onChange={(e) => update({ summary: e.target.value })}
            placeholder="2-3 sentence overview of your background, key skills, and top achievement..."
            className="min-h-24 resize-y"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Work Experience</CardTitle>
          <p className="text-xs text-muted-foreground">List your most recent role first.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {data.experience.map((exp, expIdx) => (
            <div key={exp.id} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    placeholder="e.g. Google"
                  />
                </div>
                <div>
                  <Label>Job title</Label>
                  <Input
                    value={exp.role}
                    onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                    placeholder="e.g. Product Manager"
                  />
                </div>
                <div>
                  <Label>Start date</Label>
                  <Input
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                    placeholder="e.g. Jan 2020"
                  />
                </div>
                <div>
                  <Label>End date</Label>
                  <Input
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                    placeholder="Present or Jun 2023"
                  />
                </div>
              </div>
              <div>
                <Label>Key achievements (one per line)</Label>
                {exp.bullets.map((bullet, bulletIdx) => (
                  <div key={bulletIdx} className="mt-2">
                    <Input
                      value={bullet}
                      onChange={(e) => {
                        const bullets = [...exp.bullets]
                        bullets[bulletIdx] = e.target.value
                        updateExperienceBullets(exp.id, bullets)
                      }}
                      placeholder="Led a team of 5 to deliver X feature, increasing Y by Z%..."
                    />
                  </div>
                ))}
              </div>
              {expIdx > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(exp.id)}
                  className="self-start"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addExperience}>
            <Plus className="h-4 w-4" /> Add experience
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Education</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {data.education.map((edu, eduIdx) => (
            <div key={edu.id} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Institution</Label>
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    placeholder="e.g. University of Lagos"
                  />
                </div>
                <div>
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    placeholder="e.g. Bachelor of Science"
                  />
                </div>
                <div>
                  <Label>Field of study</Label>
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                    placeholder="e.g. Computer Science"
                  />
                </div>
                <div>
                  <Label>GPA (optional)</Label>
                  <Input
                    value={edu.gpa}
                    onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                    placeholder="e.g. 4.8/5.0"
                  />
                </div>
                <div>
                  <Label>Start date</Label>
                  <Input
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                    placeholder="e.g. 2016"
                  />
                </div>
                <div>
                  <Label>End date</Label>
                  <Input
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                    placeholder="e.g. 2020"
                  />
                </div>
              </div>
              {eduIdx > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(edu.id)}
                  className="self-start"
                >
                  <Trash2 className="h-4 w-4" /> Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addEducation}>
            <Plus className="h-4 w-4" /> Add education
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.skills}
            onChange={(e) => update({ skills: e.target.value })}
            placeholder="e.g. JavaScript, React, Node.js, AWS, Project Management, SQL..."
            className="min-h-16 resize-y"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Certifications (optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.certifications}
            onChange={(e) => update({ certifications: e.target.value })}
            placeholder="e.g. AWS Certified Solutions Architect – 2023..."
            className="min-h-16 resize-y"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects (optional)</CardTitle>
          <p className="text-xs text-muted-foreground">Showcase 1-3 impactful projects.</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {data.projects.map((proj) => (
            <div key={proj.id} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Project name</Label>
                  <Input
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                    placeholder="e.g. E-commerce Dashboard"
                  />
                </div>
                <div>
                  <Label>Project URL (optional)</Label>
                  <Input
                    value={proj.url}
                    onChange={(e) => updateProject(proj.id, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div>
                <Label>Description & achievements</Label>
                <Textarea
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                  placeholder="What you built, tech used, and quantified results..."
                  className="min-h-16 resize-y"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeProject(proj.id)}
                className="self-start"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={addProject}>
            <Plus className="h-4 w-4" /> Add project
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function formatManualResumeToText(data: ManualResumeData): string {
  const lines: string[] = []

  const contactParts = [data.fullName, data.email, data.phone, data.linkedin, data.location]
    .filter((p) => p.trim())
    .join(' | ')
  if (contactParts) lines.push(contactParts.toUpperCase())

  lines.push('')

  if (data.headline) lines.push(data.headline.toUpperCase())
  lines.push('')

  if (data.summary) lines.push(data.summary.trim())
  lines.push('')

  if (data.experience.length > 0 && data.experience.some((e) => e.company || e.role)) {
    lines.push('WORK EXPERIENCE')
    lines.push('')
    data.experience.forEach((exp) => {
      if (exp.company || exp.role) {
        lines.push(`${exp.role} | ${exp.company}`.trim())
        const dates = [exp.startDate, exp.endDate].filter(Boolean).join(' - ')
        if (dates) lines.push(dates)
        lines.push('')
        exp.bullets.filter(Boolean).forEach((b) => lines.push(`- ${b.trim()}`))
        lines.push('')
      }
    })
  }

  if (data.education.length > 0 && data.education.some((e) => e.institution || e.degree)) {
    lines.push('EDUCATION')
    lines.push('')
    data.education.forEach((edu) => {
      if (edu.institution || edu.degree) {
        lines.push(`${edu.degree} in ${edu.field} | ${edu.institution}`.replace(/^ in /, '').trim())
        const dates = [edu.startDate, edu.endDate].filter(Boolean).join(' - ')
        if (dates) lines.push(dates)
        if (edu.gpa) lines.push(`GPA: ${edu.gpa}`)
        lines.push('')
      }
    })
  }

  if (data.skills) {
    lines.push('SKILLS')
    lines.push('')
    data.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((s) => lines.push(`- ${s}`))
    lines.push('')
  }

  if (data.certifications) {
    lines.push('CERTIFICATIONS')
    lines.push('')
    lines.push(data.certifications.trim())
    lines.push('')
  }

  if (data.projects.length > 0 && data.projects.some((p) => p.name)) {
    lines.push('PROJECTS')
    lines.push('')
    data.projects.forEach((proj) => {
      if (proj.name) {
        const header = proj.url ? `${proj.name} | ${proj.url}` : proj.name
        lines.push(header)
        if (proj.description) lines.push(proj.description.trim())
        lines.push('')
      }
    })
  }

  return lines.join('\n').trim()
}
