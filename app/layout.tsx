import { Analytics } from '@vercel/analytics/next'
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/sonner'
import {
  GOOGLE_SITE_VERIFICATION,
  SEO_DESCRIPTION,
  SEO_KEYWORDS,
  SEO_TITLE,
  SITE_URL,
  structuredData,
  organizationData,
  webSiteData,
  faqPageData,
  breadcrumbData,
} from '@/lib/seo'
import './globals.css'
import './font.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-heading',
  display: 'swap',
})
const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-geist-mono',
  display: 'swap',
})

const jsonLd = JSON.stringify(structuredData)
const orgJsonLd = JSON.stringify(organizationData)
const webSiteJsonLd = JSON.stringify(webSiteData)
const faqJsonLd = JSON.stringify(faqPageData)
const breadcrumbJsonLd = JSON.stringify(breadcrumbData)
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
            url: '/tailorvance.png',
            width: 1200,
            height: 630,
            alt: 'Tailorvance - Resume Builder That Beats ATS, Gets Interviews',
          },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_TITLE,
    description: SEO_DESCRIPTION,
     images: ['/tailorvance.png'],
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
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className={inter.variable + ' ' + jakarta.variable + ' ' + geistMono.variable + ' font-sans antialiased'}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: orgJsonLd }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: webSiteJsonLd }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqJsonLd }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }}
        />
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

