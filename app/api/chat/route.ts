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
    return true // allowed
  }

  if (entry.count >= RATE_LIMIT) return false // blocked

  entry.count++
  return true // allowed
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

// ── Product context fetcher ────────────────────────────────────────────────

type ProductWithVariants = Awaited<ReturnType<typeof prisma.product.findMany<{
  include: { category: { select: { name: true } }; variants: true }
}>>>[number]

async function getProductContext(query: string): Promise<{
  text: string
  cards: ProductWithVariants[]
}> {
  const [matchedProducts, featuredProducts] = await Promise.all([
    prisma.product.findMany({
      where: {
        deleted: false,
        stock: { gt: 0 },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { moodTags: { hasSome: [query] } },
          { category: { name: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: {
        category: { select: { name: true } },
        variants: {
          where: { stock: { gt: 0 } },
          orderBy: { sortOrder: "asc" },
          take: 5,
        },
      },
      take: 8,
      orderBy: { averageRating: { sort: "desc", nulls: "last" } },
    }),
    prisma.product.findMany({
      where: { deleted: false, featured: true, stock: { gt: 0 } },
      include: {
        category: { select: { name: true } },
        variants: {
          where: { stock: { gt: 0 } },
          orderBy: { sortOrder: "asc" },
          take: 3,
        },
      },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
  ])

  const seen = new Set<string>()
  let products = [...matchedProducts, ...featuredProducts].filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })

  if (products.length === 0) {
    products = await prisma.product.findMany({
      where: { deleted: false, stock: { gt: 0 } },
      include: {
        category: { select: { name: true } },
        variants: {
          where: { stock: { gt: 0 } },
          orderBy: { sortOrder: "asc" },
          take: 3,
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    })
  }

  return { text: formatProducts(products), cards: products }
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

function buildSystemPrompt(productContext: string, orderContext: string): string {
  return `You are Dach, the personal shopping assistant for DACH Home & Body — a luxury home fragrance, natural skincare, and gift services brand based in Abuja, Nigeria.

Your personality: warm, knowledgeable, elegant, and personal — like a trusted friend who knows every product intimately. You speak with confidence and grace, matching the brand's minimalist luxury aesthetic. Keep responses concise and helpful, typically 2–4 sentences unless more detail is genuinely needed.

About the brand:
- Owner: Adacha B. Dzarma
- Location: Abuja, FCT, Nigeria | Contact: 07064313141 | adachadzarma@gmail.com
- Products: Home Fragrance, Natural Skincare, Curated Gift Boxes
- Delivery: Abuja — same day (except custom orders); Nationwide — 3–5 business days
- Payments: Paystack and Flutterwave (cards, bank transfer, USSD)
- Currency: Nigerian Naira (₦)

What you can help with:
- Recommending products based on mood, occasion, budget, or scent preferences
- Answering questions about ingredients, fragrance notes, longevity, and skin type
- Explaining the gift box builder and gifting services
- Sharing pricing and availability
- Directing customers to the right pages (/shop, /gift-box, /account, etc.)
- Answering FAQs about delivery, returns, and payments
${orderContext ? "- Answering order status questions using the customer's order history below" : ""}

Current product catalogue (use this to give accurate, real recommendations):
${productContext}
${orderContext}

Important rules:
- Only recommend products that exist in the catalogue above
- Always quote prices in ₦ (Naira)
- If a customer asks about something not in the catalogue, say so honestly and suggest alternatives
- Never make up products, prices, or policies you don't know
- For order tracking links, direct them to /account/orders
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

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
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
    // ── Auth check for order lookup ────────────────────────────────────────
    const session = await auth()
    const userId = session?.user?.id as string | undefined

    // ── Fetch product context + order context in parallel ──────────────────
    const [{ text: productContextText, cards: productCards }, orderContext] = await Promise.all([
      getProductContext(message.trim()),
      userId ? getOrderContext(userId) : Promise.resolve(""),
    ])

    const ai = new GoogleGenAI({ apiKey })

    const trimmedHistory = history.slice(-10)
    const firstUserIdx = trimmedHistory.findIndex((t) => t.role === "user")
    const safeHistory = firstUserIdx === -1 ? [] : trimmedHistory.slice(firstUserIdx)

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: buildSystemPrompt(productContextText, orderContext),
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
    // Return cards only for the products mentioned/recommended in the reply
    const mentionedCards = productCards
      .filter((p) =>
        reply.toLowerCase().includes(p.name.toLowerCase()) ||
        reply.includes(`/shop/${p.slug}`)
      )
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.variants.length > 0 ? p.variants[0].price : p.price,
        image: p.images[0] ?? "",
        category: p.category.name,
      }))

    // ── Log to DB (non-blocking — don't await) ─────────────────────────────
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
