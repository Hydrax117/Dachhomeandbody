import { prisma } from "@/lib/prisma"
import CampaignForm from "./components/CampaignForm"
import ScheduledList from "./components/ScheduledList"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Email Campaigns" }

export default async function CampaignsPage() {
  const [products, subscriberCount, customerCount, scheduled] = await Promise.all([
    prisma.product.findMany({
      where: { deleted: false, stock: { gt: 0 } },
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      select: { id: true, name: true, price: true, images: true },
    }),
    prisma.$queryRaw<[{ count: bigint }]>`SELECT COUNT(*) as count FROM "NewsletterSubscriber"`
      .then((r) => Number(r[0]?.count ?? 0))
      .catch(() => 0),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.$queryRaw<Array<{
      id: string; subject: string; headline: string; sendTo: string;
      scheduledAt: Date; status: string; sentCount: number | null; createdAt: Date
    }>>`
      SELECT id, subject, headline, "sendTo", "scheduledAt", status, "sentCount", "createdAt"
      FROM "ScheduledCampaign"
      ORDER BY "scheduledAt" DESC
      LIMIT 20
    `.catch(() => [] as any[]),
  ])

  const totalAudience = subscriberCount + customerCount

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          Email Campaigns
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Feature products in a branded email — send now or schedule for later.
        </p>
      </div>

      {/* Audience stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Newsletter subscribers", value: subscriberCount },
          { label: "Registered customers",   value: customerCount   },
          { label: "Total audience",         value: totalAudience   },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#F8F5F2] border border-[#e5e5e5] rounded p-4 text-center">
            <p className="font-serif text-2xl font-light text-[#111111]">{value.toLocaleString()}</p>
            <p className="text-[10px] tracking-[0.12em] uppercase text-[#8C8C8C] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-[#f5f0e8] border border-[#e5ddd0] rounded p-4 text-xs text-[#6b5c45] space-y-1.5">
        <p className="font-medium text-[#111111]">Tips for a great campaign</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>Feature 3–6 products for the best layout</li>
          <li>Use a subject line with urgency — &ldquo;New arrivals&rdquo; or &ldquo;Limited stock&rdquo;</li>
          <li>Schedule campaigns for Tuesday–Thursday mornings for best open rates</li>
          <li>The weekly auto-campaign runs every Monday at 8am — use this for extras</li>
        </ul>
      </div>

      {/* Compose form */}
      <div className="bg-white border border-[#e5e5e5] rounded p-6 lg:p-8">
        <CampaignForm products={products} totalAudience={totalAudience} subscriberCount={subscriberCount} customerCount={customerCount} />
      </div>

      {/* Scheduled campaigns list */}
      {scheduled.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-medium text-[#111111]">Scheduled &amp; Sent</h2>
          <ScheduledList campaigns={scheduled} />
        </div>
      )}
    </div>
  )
}
