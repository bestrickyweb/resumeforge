import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { Hero } from '@/components/marketing/hero'
import { Stats } from '@/components/marketing/stats'
import { BeforeAfter } from '@/components/marketing/before-after'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { Features } from '@/components/marketing/features'
import { Testimonials } from '@/components/marketing/testimonials'
import { Pricing } from '@/components/marketing/pricing'
import { Faq } from '@/components/marketing/faq'
import { FinalCta } from '@/components/marketing/final-cta'
import { MarketingFooter } from '@/components/marketing/marketing-footer'

export default async function HomePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/dashboard')

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main>
        <Hero />
        <Stats />
        <BeforeAfter />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <MarketingFooter />
    </div>
  )
}
