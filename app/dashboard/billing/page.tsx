import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { getUsage } from "@/app/actions/queries"
import { PageHeader } from "@/components/dashboard/page-header"
import { BillingPlans } from "@/components/dashboard/billing-plans"

export const metadata = { title: "Billing & Plans | ResumeForge" }
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BillingPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/sign-in")

  const usage = await getUsage()

  return (
    <div className="space-y-8">
      <PageHeader
        title="Billing & Plans"
        description="Upgrade to tailor more CVs and land interviews faster."
      />
      <BillingPlans usage={usage} />
    </div>
  )
}
