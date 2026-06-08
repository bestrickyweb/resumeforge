'use server'

import { getUserId } from '@/lib/session'
import { extractText, getDocumentProxy } from 'unpdf'
import mammoth from 'mammoth'

export type ExtractResult = {
  ok: boolean
  text?: string
  error?: string
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

    return { ok: true, text }
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
