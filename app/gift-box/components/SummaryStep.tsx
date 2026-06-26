"use client"

import { useActionState, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useGiftBuilder } from "@/app/gift-box/context/GiftBuilderContext"
import { placeGiftOrderAction } from "@/app/actions/gift-boxes"
import {
  GIFT_BOX_THEME_META,
  GIFT_CARD_STYLE_META,
  GIFT_RIBBON_STYLE_META,
  GIFT_RIBBON_COLOR_META,
  type GiftBoxTheme,
} from "@/lib/gift-boxes"

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n)

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: string | React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[#f0ece4] last:border-0">
      <span className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] shrink-0 mr-4">
        {label}
      </span>
      <span className="text-sm text-[#111111] text-right font-medium">
        {value}
      </span>
    </div>
  )
}

export default function SummaryStep() {
  const { state, setStep, subtotal, total, reset } = useGiftBuilder()
  const { selectedBox, items, customization } = state

  // Size tier for display and price
  const sizeTier = state.selectedSizeTier

  const [formState, formAction, isPending] = useActionState(
    placeGiftOrderAction,
    {}
  )

  const [shippingData, setShippingData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
  })

  if (!selectedBox) return null

  // If order placed successfully
  if (formState.success && formState.orderNumber) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="max-w-lg mx-auto text-center py-16 space-y-6"
      >
        <div className="w-16 h-16 bg-[#B8965C] flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-3">
            Order Confirmed
          </p>
          <h2 className="font-serif text-3xl font-medium text-[#111111] mb-3">
            Your gift is being prepared
          </h2>
          <p className="text-[#8C8C8C] text-sm leading-relaxed">
            Order{" "}
            <span className="text-[#111111] font-medium">
              {formState.orderNumber}
            </span>{" "}
            has been placed. We will reach out to confirm delivery details.
          </p>
        </div>
        <button
          onClick={reset}
          className="px-8 py-3.5 bg-[#111111] text-white text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300"
        >
          Build Another Gift
        </button>
      </motion.div>
    )
  }

  const meta = GIFT_BOX_THEME_META[selectedBox.theme as GiftBoxTheme]

  // Deduplicate items for display
  const itemMap = new Map<string, { product: (typeof items)[0]; qty: number }>()
  for (const p of items) {
    const existing = itemMap.get(p.id)
    if (existing) existing.qty++
    else itemMap.set(p.id, { product: p, qty: 1 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="grid lg:grid-cols-2 gap-12 lg:gap-16"
    >
      {/* Left: Order summary */}
      <div className="space-y-8">
        <div>
          <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-2">
            Your Curation
          </p>
          <h2 className="font-serif text-3xl font-medium text-[#111111]">
            Order Summary
          </h2>
        </div>

        {/* Box */}
        <div
          className={`relative overflow-hidden bg-gradient-to-br ${meta.palette} p-5 flex items-center gap-4`}
        >
          <div className="relative w-16 h-20 shrink-0 overflow-hidden">
            <Image
              src={selectedBox.image}
              alt={selectedBox.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div>
            <p className="text-[#B8965C] text-[10px] tracking-[0.2em] uppercase mb-1">
              {meta.label}
            </p>
            <p
              className={`font-serif text-lg font-medium ${
                selectedBox.theme === "NOIR_LUXURY"
                  ? "text-[#F8F5F2]"
                  : "text-[#111111]"
              }`}
            >
              {selectedBox.title}
            </p>
            <p
              className={`text-xs mt-1 ${
                selectedBox.theme === "NOIR_LUXURY"
                  ? "text-[#F8F5F2]/50"
                  : "text-[#8C8C8C]"
              }`}
            >
              {items.length} item{items.length !== 1 ? "s" : ""} inside
            </p>
          </div>
        </div>

        {/* Products */}
        <div className="space-y-3">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C]">
            Contents
          </p>
          {Array.from(itemMap.values()).map(({ product, qty }) => (
            <div
              key={product.id}
              className="flex items-center gap-3 py-2 border-b border-[#f0ece4] last:border-0"
            >
              <div className="relative w-10 h-12 shrink-0 overflow-hidden bg-[#F2EDE8]">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111111] truncate">
                  {product.name}
                </p>
                <p className="text-[11px] text-[#8C8C8C]">
                  {formatCurrency(product.price)}
                  {qty > 1 && ` × ${qty}`}
                </p>
              </div>
              <span className="text-sm font-medium text-[#111111] shrink-0">
                {formatCurrency(product.price * qty)}
              </span>
            </div>
          ))}
        </div>

        {/* Customization details */}
        <div className="bg-[#FAF7F4] p-5 space-y-0">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#8C8C8C] mb-3">
            Personalisation
          </p>
          <SummaryRow
            label="Card"
            value={GIFT_CARD_STYLE_META[customization.cardStyle].label}
          />
          <SummaryRow
            label="Ribbon Style"
            value={GIFT_RIBBON_STYLE_META[customization.ribbonStyle].label}
          />
          <SummaryRow
            label="Ribbon Color"
            value={
              <span className="flex items-center gap-2 justify-end">
                <span
                  className="inline-block w-3 h-3 rounded-full border border-[#e5e5e5]"
                  style={{ backgroundColor: GIFT_RIBBON_COLOR_META[customization.ribbonColor].hex }}
                />
                {GIFT_RIBBON_COLOR_META[customization.ribbonColor].label}
              </span>
            }
          />
          {sizeTier && (
            <SummaryRow label="Box Size" value={`${sizeTier.label} (${sizeTier.itemRange})`} />
          )}
          {customization.deliveryDate && (
            <SummaryRow
              label="Delivery"
              value={new Date(customization.deliveryDate).toLocaleDateString(
                "en-NG",
                { weekday: "long", year: "numeric", month: "long", day: "numeric" }
              )}
            />
          )}
          {customization.message && (
            <SummaryRow
              label="Message"
              value={
                <span className="italic text-[#8C8C8C] font-normal">
                  &ldquo;{customization.message}&rdquo;
                </span>
              }
            />
          )}
          {customization.anonymous && (
            <SummaryRow label="Sender" value="Anonymous" />
          )}
        </div>

        {/* Price breakdown */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between text-sm text-[#8C8C8C]">
            <span>Products subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[#8C8C8C]">
            <span>Gift box ({sizeTier?.label ?? "Box"})</span>
            <span>
              {(sizeTier?.price ?? 0) > 0
                ? formatCurrency(sizeTier!.price)
                : "Complimentary"}
            </span>
          </div>
          <div className="flex justify-between font-serif text-xl font-medium text-[#111111] pt-3 border-t border-[#e5e5e5]">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Right: Shipping + checkout form */}
      <div className="space-y-8">
        <div>
          <p className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase mb-2">
            Delivery Details
          </p>
          <h2 className="font-serif text-3xl font-medium text-[#111111]">
            Where to Send
          </h2>
        </div>

        <form action={formAction} className="space-y-4">
          {/* Hidden fields */}
          <input type="hidden" name="giftBoxId" value={selectedBox.id} />
          <input
            type="hidden"
            name="productIds"
            value={items.map((p) => p.id).join(",")}
          />
          <input
            type="hidden"
            name="message"
            value={customization.message}
          />
          <input
            type="hidden"
            name="cardStyle"
            value={customization.cardStyle}
          />
          <input
            type="hidden"
            name="ribbonStyle"
            value={customization.ribbonStyle}
          />
          <input
            type="hidden"
            name="ribbonColor"
            value={customization.ribbonColor}
          />
          <input
            type="hidden"
            name="boxSize"
            value={customization.boxSize}
          />
          <input
            type="hidden"
            name="deliveryDate"
            value={customization.deliveryDate}
          />
          <input
            type="hidden"
            name="anonymous"
            value={String(customization.anonymous)}
          />
          <input type="hidden" name="paymentMethod" value="paystack" />

          {/* Shipping fields */}
          {[
            { name: "shippingName", label: "Full Name", placeholder: "Recipient's full name" },
            { name: "shippingPhone", label: "Phone", placeholder: "+234 800 000 0000" },
            { name: "shippingAddress", label: "Address", placeholder: "Street address" },
            { name: "shippingCity", label: "City", placeholder: "Abuja" },
            { name: "shippingState", label: "State", placeholder: "FCT (optional)" },
            { name: "shippingPostalCode", label: "Postal Code", placeholder: "900001" },
          ].map((field) => (
            <div key={field.name}>
              <label className="label">{field.label}</label>
              <input
                type="text"
                name={field.name}
                placeholder={field.placeholder}
                required={field.name !== "shippingState"}
                value={
                  shippingData[
                    field.name.replace(
                      "shipping",
                      ""
                    ).charAt(0).toLowerCase() +
                      field.name.replace("shipping", "").slice(1) as keyof typeof shippingData
                  ] ?? ""
                }
                onChange={(e) =>
                  setShippingData((prev) => ({
                    ...prev,
                    [field.name.replace("shipping", "").charAt(0).toLowerCase() +
                      field.name.replace("shipping", "").slice(1)]: e.target.value,
                  }))
                }
                className="input"
              />
            </div>
          ))}

          <input
            type="hidden"
            name="shippingCountry"
            value={shippingData.country}
          />

          {/* Form error */}
          {formState.errors?._form && (
            <p className="text-[#B83232] text-xs" role="alert">
              {formState.errors._form[0]}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#e5e5e5]">
            <button
              type="button"
              onClick={() => setStep("customize")}
              className="text-xs tracking-[0.18em] uppercase text-[#8C8C8C] hover:text-[#111111] transition-colors duration-200 flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-3.5 bg-[#111111] text-white text-[10px] tracking-[0.25em] uppercase font-medium hover:bg-[#B8965C] hover:text-[#111111] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Placing Order…" : `Place Order · ${formatCurrency(total)}`}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
