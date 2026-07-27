import jsPDF from 'jspdf'
import type { CareerRoadmap } from '@/app/actions/roadmap'

export function exportRoadmapToPdf(roadmap: CareerRoadmap & { targetRole?: string | null }, hoursPerWeek?: number) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 15
  let y = 20

  function checkPage(needed: number) {
    if (y + needed > 280) {
      doc.addPage()
      y = 20
    }
  }

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Career Roadmap', pageWidth / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Target Role: ${roadmap.targetRole ?? 'Target Role'}`, margin, y)
  y += 6
  doc.text(`Readiness Score: ${roadmap.readinessScore}%`, margin, y)
  y += 6
  if (hoursPerWeek) {
    doc.text(`Pace: ${hoursPerWeek} hours/week`, margin, y)
    y += 6
  }
  if (roadmap.timeline?.totalWeeks) {
    doc.text(`Timeline: ${roadmap.timeline.totalWeeks} weeks`, margin, y)
    y += 6
  }
  if (roadmap.timeline?.completionDate) {
    doc.text(`Estimated Completion: ${new Date(roadmap.timeline.completionDate).toLocaleDateString()}`, margin, y)
    y += 6
  }
  y += 4

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Summary', margin, y)
  y += 6
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const summaryLines = doc.splitTextToSize(roadmap.summary ?? '', pageWidth - margin * 2)
  doc.text(summaryLines, margin, y)
  y += summaryLines.length * 5 + 4

  if ((roadmap.matchedSkills ?? []).length > 0) {
    checkPage(10)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Matched Skills', margin, y)
    y += 6
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text((roadmap.matchedSkills ?? []).map(s => s.name).join(', '), margin, y)
    y += 8
  }

  if ((roadmap.missingSkills ?? []).length > 0) {
    checkPage(10)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Skill Gaps', margin, y)
    y += 6

    for (const gap of roadmap.missingSkills ?? []) {
      checkPage(12)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`${gap.name} (${gap.severity})`, margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const whyLines = doc.splitTextToSize(gap.whyItMatters ?? '', pageWidth - margin * 2)
      doc.text(whyLines, margin, y)
      y += whyLines.length * 4
      doc.text(`Estimated: ${gap.estimatedHours}h | Difficulty: ${gap.difficulty}`, margin, y)
      y += 5
      if ((gap.resources ?? []).length > 0) {
        doc.text('Resources:', margin, y)
        y += 4
        for (const r of gap.resources ?? []) {
          checkPage(6)
          doc.text(`- ${r.type}: ${r.title}${r.provider ? ` (${r.provider})` : ''}`, margin + 3, y)
          y += 4
        }
      }
      y += 3
    }
  }

  if ((roadmap.timeline?.schedule ?? []).length > 0) {
    checkPage(10)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Timeline', margin, y)
    y += 6

    for (const item of roadmap.timeline?.schedule ?? []) {
      checkPage(10)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(`Week ${item.startWeek}${item.endWeek !== item.startWeek ? `-${item.endWeek}` : ''}: ${item.skill}`, margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const milestoneLines = doc.splitTextToSize(item.milestone ?? '', pageWidth - margin * 2)
      doc.text(milestoneLines, margin, y)
      y += milestoneLines.length * 4
      doc.text(`${item.totalHours}h total | ${item.hoursPerWeek} hrs/week`, margin, y)
      y += 6
    }
  }

  if ((roadmap.portfolioProjects ?? []).length > 0) {
    checkPage(10)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Portfolio Projects', margin, y)
    y += 6

    for (const project of roadmap.portfolioProjects ?? []) {
      checkPage(10)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(project.title, margin, y)
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      const descLines = doc.splitTextToSize(project.description ?? '', pageWidth - margin * 2)
      doc.text(descLines, margin, y)
      y += descLines.length * 4
      doc.text(`${project.estimatedHours}h estimated | Skills: ${project.skillsDemonstrated.join(', ')}`, margin, y)
      y += 8
    }
  }

  doc.save(`career-roadmap-${roadmap.targetRole ?? 'plan'}.pdf`)
}
