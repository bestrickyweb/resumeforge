import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import {
  GOOGLE_SITE_VERIFICATION,
  SEO_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_TITLE,
  SITE_URL,
  structuredData,
} from '@/lib/seo'
import './globals.css'
import './font.css'

const jsonLd = JSON.stringify(structuredData)
const bingSiteVerification = process.env.BING_SITE_VERIFICATION

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SEO_TITLE,
  description: SEO_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  alternates: { canonical: SITE_URL },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
    ...(bingSiteVerification ? { bing: bingSiteVerification } : {}),
  },
  openGraph: {
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    type: 'website',
    url: SITE_URL,
    images: [
      {
        url: '/resumeforge.png',
        width: 1200,
        height: 630,
        alt: 'ResumeForge - Beat the ATS, Land the Interview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
    images: ['/resumeforge.png'],
  },
  generator: 'v0.app',
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
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
