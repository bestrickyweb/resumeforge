import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Inter, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
})
const inter = Inter({ variable: '--font-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ResumeForge — Beat the ATS, Land the Interview',
  description:
    'ResumeForge tailors your CV to any job description in seconds. Built for Nigerian job seekers to beat applicant tracking systems and get more interviews.',
  generator: 'v0.app',
  keywords: [
    'CV tailoring',
    'ATS resume',
    'Nigeria jobs',
    'resume optimizer',
    'job application tracker',
    'cover letter generator',
  ],
  openGraph: {
    title: 'ResumeForge — Beat the ATS, Land the Interview',
    description:
      'Tailor your CV to any job in seconds and beat applicant tracking systems. Built for Nigerian job seekers.',
    type: 'website',
    images: [
      {
        url: '/resumeforge.png',
        width: 1200,
        height: 630,
        alt: 'ResumeForge - Beat the ATS, Land the Interview',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
