import { NextRequest } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { prisma } from "@/lib/prisma"

// ── Types ──────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "model"
  parts: [{ text: string }]
}

interface RequestBody {
  message: string
  history: ChatMessage[]
}

// ── Product context fetcher ────────────────────────────────────────────────

async function getProductContext(query: string): Promise<string> {
  // Fetch products matching the query, plus a general sample
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

  // Merge and deduplicate
  const seen = new Set<string>()
  const products = [...matchedProducts, ...featuredProducts].filter((p) => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })

  if (products.length === 0) {
    // Fall back to a general sample if nothing found
    const sample = await prisma.product.findMany({
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
    return formatProducts(sample)
  }

  return formatProducts(products)
}

function formatProducts(
  products: Awaited<ReturnType<typeof prisma.product.findMany<{
    include: { category: { select: { name: true } }; variants: true }
  }>>>
): string {
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
        p.averageRating ? `Rating: ${p.averageRating.toFixed(1)}/5 (${p.reviewCount} reviews)` : null,
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

// ── System prompt ──────────────────────────────────────────────────────────

function buildSystemPrompt(productContext: string): string {
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

Current product catalogue (use this to give accurate, real recommendations):
${productContext}

Important rules:
- Only recommend products that exist in the catalogue above
- Always quote prices in ₦ (Naira)
- If a customer asks about something not in the catalogue, say so honestly and suggest alternatives
- Never make up products, prices, or policies you don't know
- For order-specific questions (tracking, etc.), direct them to /account/orders or to contact 07064313141
- Keep the tone warm and personal — never robotic or salesy`
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
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

  const { message, history = [] } = body

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return Response.json({ error: "Message is required" }, { status: 400 })
  }

  if (message.length > 1000) {
    return Response.json({ error: "Message too long" }, { status: 400 })
  }

  try {
    // Fetch relevant product context based on the user's message
    const productContext = await getProductContext(message.trim())

    const ai = new GoogleGenAI({ apiKey })

    // Gemini requires history to start with a 'user' turn.
    // Drop any leading 'model' turns (e.g. the bot greeting) before passing history.
    const trimmedHistory = history.slice(-10)
    const firstUserIdx = trimmedHistory.findIndex((t) => t.role === "user")
    const safeHistory = firstUserIdx === -1 ? [] : trimmedHistory.slice(firstUserIdx)

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: buildSystemPrompt(productContext),
        maxOutputTokens: 512,
        temperature: 0.7,
      },
      history: safeHistory,
    })

    const response = await chat.sendMessage({
      message: [{ text: message.trim() }],
    })
    const text = response.text

    return Response.json({ reply: text })
  } catch (error) {
    console.error("[Chat API] Error:", error)
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
