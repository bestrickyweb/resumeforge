import type { Metadata } from 'next'
import { getLandingPageConfig, getLandingPageMetadata } from '@/lib/seo'
import SeoLandingPage from '@/components/marketing/seo-landing-page'

const pagePath = '/resume-tailoring-tool'
const config = getLandingPageConfig(pagePath)

export const metadata: Metadata = getLandingPageMetadata(pagePath)

export default function Page() {
  return <SeoLandingPage config={config} />
}
