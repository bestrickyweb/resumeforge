'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'Will employers know I used ResumeForge?',
    a: 'No. ResumeForge tailors your real experience to the role — it never invents jobs or qualifications. The result reads like a sharper version of your own CV, written by you.',
  },
  {
    q: 'What exactly is an ATS, and why does it matter?',
    a: 'An Applicant Tracking System is software recruiters use to filter CVs before a human reviews them. It scans for keywords and formatting. If your CV does not match the job, it can be rejected automatically — even if you are qualified.',
  },
  {
    q: 'Is my CV and personal data safe?',
    a: 'Yes. Your CV is private to your account and encrypted. We never sell your data or share it with employers, recruiters or third parties.',
  },
  {
    q: 'How do I pay, and is it secure?',
    a: 'Payments are processed by Paystack, Nigeria’s trusted payment gateway. You can pay with your debit card, bank transfer or USSD. You can cancel anytime.',
  },
  {
    q: 'Do the free CVs expire?',
    a: 'No. Your 3 free tailored CVs are yours to use whenever you are ready. Upgrade only when you need more.',
  },
  {
    q: 'Does it work for remote and international roles?',
    a: 'Absolutely. ResumeForge works for any job description you paste in — local Nigerian roles, remote-first companies, and international positions alike.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="bg-secondary/40 py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-heading text-3xl font-extrabold tracking-tight md:text-4xl">
            Questions, answered
          </h2>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div
                key={f.q}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-medium">{f.q}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
