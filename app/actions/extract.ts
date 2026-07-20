'use server'

import { getUserId } from '@/lib/session'
import { extractText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'

export type ExtractResult = {
  ok: boolean
  text?: string
  error?: string
  parseWarnings?: string[]
}

// Best-effort, deterministic ATS parse-safety heuristics on extracted text.
// Non-blocking: extraction still succeeds; warnings are advisory.
function detectParseWarnings(text: string, isPdf: boolean): string[] {
  const warnings: string[] = []

  if (isPdf && text.length < 60) {
    warnings.push(
      'This looks like a scanned/image PDF — an ATS may see a blank page. Use a text-based PDF or DOCX.',
    )
  }

  // Multi-column heuristic: many short lines with 2+ tab/space gaps or pipe separators.
  const lines = text.split('\n')
  const pipeHeavy = lines.filter((l) => (l.match(/\|/g) || []).length >= 2).length
  const tabHeavy = lines.filter((l) => l.includes('\t')).length
  if (pipeHeavy > 3 || tabHeavy > lines.length * 0.4) {
    warnings.push(
      'Possible multi-column or table layout detected — ATS parsers often scramble these. Use a single column.',
    )
  }

  // Header/footer contact heuristic: email appears only after many blank-ish lines.
  const emailIdx = lines.findIndex((l) => /[\w.+-]+@[\w-]+\.[\w.-]+/.test(l))
  if (emailIdx > lines.length * 0.85 && emailIdx !== -1) {
    warnings.push(
      'Contact info appears near the end — keep name/email/phone in the document body, not the header/footer.',
    )
  }

  return warnings
}

const MAX_BYTES = 8 * 1024 * 1024 // 8MB

export async function extractCvText(formData: FormData): Promise<ExtractResult> {
  // Require an authenticated user (keeps the endpoint from being abused).
  await getUserId()

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return { ok: false, error: 'No file was uploaded.' }
  }

  if (file.size === 0) {
    return { ok: false, error: 'That file appears to be empty.' }
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, error: 'File is too large. Please upload a file under 8MB.' }
  }

  const name = file.name.toLowerCase()
  const buffer = Buffer.from(await file.arrayBuffer())

  try {
    let text = ''

    if (name.endsWith('.pdf') || file.type === 'application/pdf') {
      const pdf = await getDocumentProxy(new Uint8Array(buffer))
      const { text: pdfText } = await extractText(pdf, { mergePages: true })
      text = Array.isArray(pdfText) ? pdfText.join('\n') : pdfText
    } else if (
      name.endsWith('.docx') ||
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({ buffer })
      text = value
    } else if (name.endsWith('.txt') || file.type === 'text/plain') {
      text = buffer.toString('utf-8')
    } else {
      return {
        ok: false,
        error: 'Unsupported file type. Please upload a PDF, DOCX, or TXT file.',
      }
    }

    // Normalise whitespace: collapse excessive blank lines, trim trailing spaces.
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    if (text.length < 30) {
      return {
        ok: false,
        error:
          'We could not read enough text from that file. If it is a scanned image, paste the text manually.',
      }
    }

    const isPdf =
      name.endsWith('.pdf') || file.type === 'application/pdf'
    const parseWarnings = detectParseWarnings(text, isPdf)

    return { ok: true, text, parseWarnings }
  } catch (err) {
    console.log(
      '[v0] extractCvText error:',
      err instanceof Error ? err.message : err,
    )
    return {
      ok: false,
      error: 'We could not read that file. Please try another file or paste the text.',
    }
  }
}
