'use client'

import { useRef, useState } from 'react'
import { Upload, Loader2, FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { extractCvText } from '@/app/actions/extract'

export function CvUpload({
  onExtracted,
}: {
  onExtracted: (text: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleFile(file: File) {
    setLoading(true)
    setFileName(file.name)
    const formData = new FormData()
    formData.append('file', file)
    const result = await extractCvText(formData)
    setLoading(false)

    if (result.ok && result.text) {
      onExtracted(result.text)
      toast.success(`Imported text from ${file.name}`)
      if (result.parseWarnings && result.parseWarnings.length > 0) {
        result.parseWarnings.forEach((w) => toast.warning(w))
      }
    } else {
      setFileName(null)
      toast.error(result.error ?? 'Could not read that file.')
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    // Reset so the same file can be re-selected.
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files?.[0]
        if (file) void handleFile(file)
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-5 text-center transition-colors',
        dragOver && 'border-primary bg-primary/5',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="sr-only"
        onChange={onInputChange}
      />

      {loading ? (
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading {fileName}...
        </span>
      ) : fileName ? (
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <FileText className="h-4 w-4 text-primary" />
          {fileName}
          <button
            type="button"
            onClick={() => {
              setFileName(null)
              onExtracted('')
            }}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear uploaded file"
          >
            <X className="h-4 w-4" />
          </button>
        </span>
      ) : (
        <>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Upload className="h-4 w-4" />
          </span>
          <p className="text-sm text-foreground">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Upload your CV
            </button>{' '}
            or drag &amp; drop
          </p>
          <p className="text-xs text-muted-foreground">PDF, DOCX, or TXT (max 8MB)</p>
        </>
      )}
    </div>
  )
}
