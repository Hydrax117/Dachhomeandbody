import { NextRequest } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createHash } from "crypto"

// ── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "model"
  parts: [{ text: string }]
}

interface RequestBody {
  message: string
  history: ChatMessage[]
  sessionId?: string
}

// ── Singleton AI client ────────────────────────────────────────────────────
// Constructed once per process, not on every request

let _ai: GoogleGenAI | null = null
function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY not set")
  if (!_ai) _ai = new GoogleGenAI({ apiKey })
  return _ai
}

// ── Rate limiter (in-memory, per IP) ──────────────────────────────────────
// 20 requests per 60 seconds per IP

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false

  entry.count++
  return true
}

// Clean up old entries every 5 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now()
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key)
  }
}, 5 * 60_000)

// ── IP extraction ──────────────────────────────────────────────────────────

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip + "dach_salt").digest("hex").slice(0, 16)
}

// ── Product catalogue cache ────────────────────────────────────────────────
// Products change infrequently — cache the full catalogue for 5 minutes so we
// don't hit the DB on every chat message.

type ProductWithVariants = Awaited<ReturnType<typeof prisma.product.findMany<{
  include: { category: { select: { name: true } }; variants: true }
}>>>[number]

interface CatalogueCache {
  products: ProductWithVariants[]
  text: string
  expiresAt: number
}

let _catalogueCache: CatalogueCache | null = null
const CATALOGUE_TTL_MS = 5 * 60_000 // 5 minutes

async function getCatalogue(): Promise<{ products: ProductWithVariants[]; text: string }> {
  const now = Date.now()
  if (_catalogueCache && now < _catalogueCache.expiresAt) {
    return { products: _catalogueCache.products, text: _catalogueCache.text }
  }

  const products = await prisma.product.findMany({
    where: { deleted: false, stock: { gt: 0 } },
    include: {
      category: { select: { name: true } },
      variants: {
        where: { stock: { gt: 0 } },
        orderBy: { sortOrder: "asc" },
        take: 5,
      },
    },
    orderBy: [{ featured: "desc" }, { averageRating: { sort: "desc", nulls: "last" } }],
  })

  const text = formatProducts(products)
  _catalogueCache = { products, text, expiresAt: now + CATALOGUE_TTL_MS }
  return { products, text }
}

/** Call this whenever a product is created/updated/deleted to bust the cache immediately. */
export function invalidateCatalogueCache() {
  _catalogueCache = null
}

function formatProducts(products: ProductWithVariants[]): string {
  if (products.length === 0) return "No products currently available."

  return products
    .map((p) => {
      const variants =
        p.variants.length > 0
          ? p.variants
              .map((v) => `  • ${v.name} — ₦${v.price.toLocaleString("en-NG")}`)
              .join("\n")
          : `  • ₦${p.price.toLocaleString("en-NG")}`

      const notes = [
        p.topNotes.length ? `Top notes: ${p.topNotes.join(", ")}` : null,
        p.heartNotes.length ? `Heart notes: ${p.heartNotes.join(", ")}` : null,
        p.baseNotes.length ? `Base notes: ${p.baseNotes.join(", ")}` : null,
        p.moodTags.length ? `Mood: ${p.moodTags.join(", ")}` : null,
        p.gender ? `Gender: ${p.gender}` : null,
        p.longevity ? `Longevity: ${p.longevity.replace("_", " ")}` : null,
        p.averageRating
          ? `Rating: ${p.averageRating.toFixed(1)}/5 (${p.reviewCount} reviews)`
          : null,
      ]
        .filter(Boolean)
        .join(" | ")

      return [
        `**${p.name}** (${p.category.name})`,
        `${p.description.slice(0, 200)}${p.description.length > 200 ? "…" : ""}`,
        `Sizes / Prices:\n${variants}`,
        notes ? `Details: ${notes}` : null,
        `Link: /shop/${p.slug}`,
      ]
        .filter(Boolean)
        .join("\n")
    })
    .join("\n\n---\n\n")
}

// ── Order lookup for authenticated users ───────────────────────────────────

async function getOrderContext(userId: string): Promise<string> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      items: {
        include: { product: { select: { name: true } } },
      },
    },
  })

  if (orders.length === 0) return ""

  const lines = orders.map((o) => {
    const items = o.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ")
    return `Order #${o.orderNumber} — Status: ${o.status} | Payment: ${o.paymentStatus} | Total: ₦${o.total.toLocaleString("en-NG")} | Items: ${items} | Date: ${o.createdAt.toLocaleDateString("en-NG")}`
  })

  return `\n\nThis customer's recent orders:\n${lines.join("\n")}`
}

// ── System prompt ──────────────────────────────────────────────────────────

function buildSystemPrompt(productContext: string, orderContext: string, totalProductCount: number): string {
  return `You are Dach, the personal shopping assistant for DACH Home & Body — a luxury home fragrance, natural skincare, and gift services brand based in Abuja, Nigeria.

Your personality: warm, knowledgeable, elegant, and personal — like a trusted friend who knows every product intimately. You speak with confidence and grace, matching the brand's minimalist luxury aesthetic. Keep responses concise and helpful, typically 2–4 sentences unless more detail is genuinely needed.

About the brand:
- Owner: Adacha B. Dzarma
- Location: Abuja, FCT, Nigeria | Contact: 08099007999 | adachadzarma@gmail.com
- Products: Home Fragrance, Natural Skincare, Curated Gift Boxes
- Delivery: Abuja — same day (except custom orders); Nationwide — 3–5 business days
- Payments: Paystack and Flutterwave (cards, bank transfer, USSD)
- Currency: Nigerian Naira (₦)
- Total products in stock: ${totalProductCount}

What you can help with:
- Recommending products based on mood, occasion, budget, or scent preferences
- Answering questions about ingredients, fragrance notes, longevity, and skin type
- Explaining the gift box builder and gifting services
- Sharing pricing and availability
- Directing customers to the right pages (/shop, /gift-box, /account, etc.)
- Answering FAQs about delivery, returns, and payments
${orderContext ? "- Answering order status questions using the customer's order history below" : ""}

--- FREQUENTLY ASKED QUESTIONS ---

GENERAL
Q: What products do you offer?
A: We offer a carefully curated collection of luxury scented candles, reed diffusers, natural skincare products, and thoughtfully crafted gift sets designed to elevate everyday living.

Q: Are your products handmade?
A: Yes. Each product is carefully handcrafted in small batches to ensure exceptional quality, consistency, and attention to detail.

Q: Do you offer gift packaging?
A: Yes. We offer elegant gift packaging and personalized gifting options for birthdays, weddings, corporate events, and other special occasions.

Q: Do you accept custom or bulk orders?
A: Absolutely. We welcome custom orders and bulk purchases for corporate gifts, weddings, events, hotels, and special celebrations. Please contact us to discuss your requirements.

CANDLES
Q: What type of wax do you use?
A: Our candles are made with premium soy wax selected for its clean burn, excellent fragrance performance, and long-lasting enjoyment.

Q: How long do your candles burn?
A: Burn time depends on the candle size — approximately 50–60 hours for our 250g candle and 90–100 hours for our 450g candle, depending on burning conditions and proper candle care.

Q: How can I get the best burn from my candle?
A: For the best experience: trim the wick to about 5mm before each burn; allow the wax to melt evenly across the surface during the first burn; burn for no more than 3–4 hours at a time; and keep away from drafts and flammable materials.

Q: Why is my candle tunneling?
A: Tunneling occurs when the candle isn't burned long enough during the first few uses. Allow the wax to melt completely to the edges each time you burn it.

Q: Is it normal for candles to have slight imperfections?
A: Yes. Because our candles are handcrafted, slight variations in surface appearance may occur. These do not affect performance or quality.

REED DIFFUSERS
Q: How long do your reed diffusers last?
A: Depending on room conditions and diffuser size, our reed diffusers typically last between 2 and 4 months.

Q: How do I make my diffuser scent stronger?
A: Flip the reeds every few days for a stronger fragrance. The more reeds you use, the stronger the scent throw.

Q: Where should I place my diffuser?
A: Place your diffuser in a well-ventilated area such as an entryway, living room, bedroom, or office. Avoid direct sunlight and heat sources.

Q: Why has the fragrance become lighter over time?
A: This is normal as the reeds become saturated. Replacing the reeds or flipping them regularly can help refresh the fragrance.

NATURAL SKINCARE
Q: Are your skincare products made with natural ingredients?
A: Our skincare products are thoughtfully formulated with naturally derived ingredients chosen for their effectiveness and skin-loving benefits.

Q: Are your products suitable for sensitive skin?
A: Many of our products are suitable for sensitive skin. However, we recommend performing a patch test before full use, especially if you have allergies or highly reactive skin.

Q: Are your skincare products suitable for all skin types?
A: Most of our products are formulated to suit a variety of skin types. Individual product descriptions provide guidance on their best use.

Q: Are your products free from harsh chemicals?
A: We formulate our products with carefully selected ingredients and avoid unnecessary harsh additives wherever possible while maintaining product safety and effectiveness.

Q: How should I store my skincare products?
A: Store products in a cool, dry place away from direct sunlight to help preserve their quality and effectiveness.

ORDERS & SHIPPING
Q: How long will it take to receive my order?
A: Orders are typically processed within 1–3 business days. Delivery times vary depending on your location and selected shipping method.

Q: Do you offer nationwide delivery?
A: Yes, we deliver nationwide. Shipping rates and estimated delivery times are calculated during checkout.

Q: Can I track my order?
A: Yes. Once your order has been shipped, you'll receive tracking details. You can also view your order status at /account/orders.

Q: Can I change or cancel my order?
A: If your order has not yet been processed, we may be able to make changes or cancel it. Please contact us as soon as possible.

RETURNS & EXCHANGES
Q: Do you accept returns?
A: Due to the nature of our products, we generally do not accept returns on opened or used items. If your order arrives damaged or incorrect, please contact us within the timeframe specified in our return policy.

Q: What should I do if my order arrives damaged?
A: Please contact us within 48 hours of delivery with your order number and clear photos of the damaged item and packaging. We'll work to resolve the issue promptly.

SUSTAINABILITY
Q: Are your products environmentally friendly?
A: We are committed to making thoughtful choices in our materials and packaging wherever possible and continually seek ways to reduce our environmental impact.

Q: Can candle jars or diffuser bottles be reused?
A: Yes. Once cleaned, our containers can be repurposed as decorative storage, planters, organizers, or home décor.

SAFETY
Q: Are your candles safe to burn around pets?
A: We recommend burning candles in well-ventilated spaces and keeping them out of reach of pets. If you have concerns about specific fragrances, consult your veterinarian.

Q: Can I leave my candle burning unattended?
A: No. Never leave a burning candle unattended. Keep it away from children, pets, curtains, and flammable objects.

Q: Are reed diffuser oils safe to apply to the skin?
A: No. Reed diffuser oils are intended for home fragrance only and should never be applied to the skin or ingested.

CONTACT
Q: How can I contact your customer service team?
A: You can reach us via email at adachadzarma@gmail.com, by phone/WhatsApp at 08099007999, or through the contact form at /contact. We're always happy to assist.

--- END OF FAQs ---

Current product catalogue (use this to give accurate, real recommendations):
${productContext}
${orderContext}

Important rules:
- Only recommend products that exist in the catalogue above
- Always quote prices in ₦ (Naira)
- If a customer asks about something not in the catalogue, say so honestly and suggest alternatives
- Never make up products, prices, or policies you don't know
- For order tracking links, direct them to /account/orders
- When sharing links, write them as plain paths like /shop or /account/orders — do not use markdown link syntax like [text](url)
- Keep the tone warm and personal — never robotic or salesy`
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Rate limiting ────────────────────────────────────────────────────────
  const ip = getIp(req)
  if (!checkRateLimit(ip)) {
    return Response.json(
      { error: "Too many messages. Please wait a moment before trying again." },
      { status: 429 }
    )
  }

  if (!process.env.GEMINI_API_KEY) {
    return Response.json(
      { error: "Chatbot is not configured. Please add GEMINI_API_KEY." },
      { status: 503 }
    )
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { message, history = [], sessionId } = body

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return Response.json({ error: "Message is required" }, { status: 400 })
  }

  if (message.length > 1000) {
    return Response.json({ error: "Message too long" }, { status: 400 })
  }

  try {
    // ── Fetch catalogue (cached) + auth + order context in parallel ─────────
    const session = await auth()
    const userId = session?.user?.id as string | undefined

    const [{ products: allProducts, text: productContextText }, orderContext] = await Promise.all([
      getCatalogue(),
      userId ? getOrderContext(userId) : Promise.resolve(""),
    ])

    const trimmedHistory = history.slice(-10)
    const firstUserIdx = trimmedHistory.findIndex((t) => t.role === "user")
    const safeHistory = firstUserIdx === -1 ? [] : trimmedHistory.slice(firstUserIdx)

    const chat = getAI().chats.create({
      model: "gemini-3.1-flash-lite",
      config: {
        systemInstruction: buildSystemPrompt(productContextText, orderContext, allProducts.length),
        maxOutputTokens: 512,
        temperature: 0.7,
      },
      history: safeHistory,
    })

    const response = await chat.sendMessage({
      message: [{ text: message.trim() }],
    })
    const reply = response.text ?? ""

    // ── Determine which product cards to return ────────────────────────────
    // Scan the full catalogue for any product the AI mentioned by name or slug
    const replyLower = reply.toLowerCase()
    const mentionedCards = allProducts
      .filter((p) =>
        replyLower.includes(p.name.toLowerCase()) ||
        reply.includes(`/shop/${p.slug}`)
      )
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.variants.length > 0 ? p.variants[0].price : p.price,
        image: p.images[0] ?? "",
        category: p.category.name,
      }))

    // ── Log to DB (non-blocking) ───────────────────────────────────────────
    prisma.chatLog
      .create({
        data: {
          sessionId: sessionId ?? "unknown",
          userId: userId ?? null,
          userMessage: message.trim(),
          botReply: reply,
          ipHash: hashIp(ip),
        },
      })
      .catch((err) => console.error("[Chat] Failed to log conversation:", err))

    return Response.json({ reply, products: mentionedCards })
  } catch (error) {
    console.error("[Chat API] Error:", error)
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}


