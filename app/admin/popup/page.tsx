import { getPopupConfig } from "@/lib/popup"
import { prisma } from "@/lib/prisma"
import { updatePopupConfigAction } from "./actions"
import PopupConfigForm from "./components/PopupConfigForm"

export const metadata = {
  title: "Promotional Popup",
}

export default async function AdminPopupPage() {
  const [config, products] = await Promise.all([
    getPopupConfig(),
    prisma.product.findMany({
      where: { deleted: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, price: true, images: true },
    }),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl lg:text-3xl font-medium text-[#111111]">
          Promotional Popup
        </h1>
        <p className="text-sm text-[#8C8C8C] mt-1">
          Configure the promotional popup shown to visitors on the storefront.
        </p>
      </div>

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase font-medium px-2.5 py-1 rounded-full ${
            config?.enabled
              ? "bg-[#2E7D52]/10 text-[#2E7D52]"
              : "bg-[#e5e5e5] text-[#8C8C8C]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${config?.enabled ? "bg-[#2E7D52]" : "bg-[#C4C4C4]"}`}
            aria-hidden="true"
          />
          {config?.enabled ? "Live" : "Disabled"}
        </span>
        {config?.enabled && config.endDate && (
          <span className="text-[11px] text-[#8C8C8C]">
            Ends {new Date(config.endDate).toLocaleDateString("en-NG", { dateStyle: "medium" })}
          </span>
        )}
      </div>

      <PopupConfigForm
        config={config}
        products={products}
        updateAction={updatePopupConfigAction}
      />
    </div>
  )
}
