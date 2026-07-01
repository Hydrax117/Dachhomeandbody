import Link from "next/link"
import type { Metadata } from "next"
import { Newsletter } from "@/app/components/Newsletter"

export const metadata: Metadata = {
  title: "Frequently Asked Questions | DACH Home & Body",
  description:
    "Find answers to common questions about DACH Home & Body products, candle care, skincare, delivery, returns, and more.",
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const faqSections = [
  {
    id: "general",
    title: "General",
    questions: [
      {
        q: "What products do you offer?",
        a: "We offer a carefully curated collection of luxury scented candles, reed diffusers, natural skincare products, and thoughtfully crafted gift sets designed to elevate everyday living.",
      },
      {
        q: "Are your products handmade?",
        a: "Yes. Each product is carefully handcrafted in small batches to ensure exceptional quality, consistency, and attention to detail.",
      },
      {
        q: "Do you offer gift packaging?",
        a: "Yes. We offer elegant gift packaging and personalised gifting options for birthdays, weddings, corporate events, and other special occasions.",
      },
      {
        q: "Do you accept custom or bulk orders?",
        a: "Absolutely. We welcome custom orders and bulk purchases for corporate gifts, weddings, events, hotels, and special celebrations. Please contact us to discuss your requirements.",
      },
    ],
  },
  {
    id: "candles",
    title: "Candles",
    questions: [
      {
        q: "What type of wax do you use?",
        a: "Our candles are made with premium soy wax selected for its clean burn, excellent fragrance performance, and long-lasting enjoyment.",
      },
      {
        q: "How long do your candles burn?",
        a: "Burn time depends on the candle size — approximately 50–60 hours for our 250g candle and 90–100 hours for our 450g candle, depending on burning conditions and proper candle care.",
      },
      {
        q: "How can I get the best burn from my candle?",
        a: null,
        list: [
          "Trim the wick to about 5 mm before each burn.",
          "Allow the wax to melt evenly across the surface during the first burn.",
          "Burn for no more than 3–4 hours at a time.",
          "Keep away from drafts and flammable materials.",
        ],
      },
      {
        q: "Why is my candle tunneling?",
        a: "Tunneling occurs when the candle isn't burned long enough during the first few uses. Allow the wax to melt completely to the edges each time you burn it.",
      },
      {
        q: "Is it normal for candles to have slight imperfections?",
        a: "Yes. Because our candles are handcrafted, slight variations in surface appearance may occur. These do not affect performance or quality.",
      },
    ],
  },
  {
    id: "reed-diffusers",
    title: "Reed Diffusers",
    questions: [
      {
        q: "How long do your reed diffusers last?",
        a: "Depending on room conditions and diffuser size, our reed diffusers typically last between 2 and 4 months.",
      },
      {
        q: "How do I make my diffuser scent stronger?",
        a: "Flip the reeds every few days for a stronger fragrance. The more reeds you use, the stronger the scent throw.",
      },
      {
        q: "Where should I place my diffuser?",
        a: "Place your diffuser in a well-ventilated area such as an entryway, living room, bedroom, or office. Avoid direct sunlight and heat sources.",
      },
      {
        q: "Why has the fragrance become lighter over time?",
        a: "This is normal as the reeds become saturated. Replacing the reeds or flipping them regularly can help refresh the fragrance.",
      },
    ],
  },
  {
    id: "skincare",
    title: "Natural Skincare",
    questions: [
      {
        q: "Are your skincare products made with natural ingredients?",
        a: "Our skincare products are thoughtfully formulated with naturally derived ingredients chosen for their effectiveness and skin-loving benefits.",
      },
      {
        q: "Are your products suitable for sensitive skin?",
        a: "Many of our products are suitable for sensitive skin. However, we recommend performing a patch test before full use, especially if you have allergies or highly reactive skin.",
      },
      {
        q: "Are your skincare products suitable for all skin types?",
        a: "Most of our products are formulated to suit a variety of skin types. Individual product descriptions provide guidance on their best use.",
      },
      {
        q: "Are your products free from harsh chemicals?",
        a: "We formulate our products with carefully selected ingredients and avoid unnecessary harsh additives wherever possible while maintaining product safety and effectiveness.",
      },
      {
        q: "How should I store my skincare products?",
        a: "Store products in a cool, dry place away from direct sunlight to help preserve their quality and effectiveness.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders & Shipping",
    questions: [
      {
        q: "How long will it take to receive my order?",
        a: "Orders are typically processed within 1–3 business days. Delivery times vary depending on your location and selected shipping method.",
      },
      {
        q: "Do you offer nationwide delivery?",
        a: "Yes, we deliver nationwide. Shipping rates and estimated delivery times are calculated during checkout.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. Once your order has been shipped, you'll receive tracking details so you can monitor its progress.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "If your order has not yet been processed, we may be able to make changes or cancel it. Please contact us as soon as possible.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & Exchanges",
    questions: [
      {
        q: "Do you accept returns?",
        a: "Due to the nature of our products, we generally do not accept returns on opened or used items. If your order arrives damaged or incorrect, please contact us within the timeframe specified in our return policy.",
      },
      {
        q: "What should I do if my order arrives damaged?",
        a: "Please contact us within 48 hours of delivery with your order number and clear photos of the damaged item and packaging. We'll work to resolve the issue promptly.",
      },
    ],
  },
  {
    id: "sustainability",
    title: "Sustainability",
    questions: [
      {
        q: "Are your products environmentally friendly?",
        a: "We are committed to making thoughtful choices in our materials and packaging wherever possible and continually seek ways to reduce our environmental impact.",
      },
      {
        q: "Can candle jars or diffuser bottles be reused?",
        a: "Yes. Once cleaned, our containers can be repurposed as decorative storage, planters, organisers, or home décor.",
      },
    ],
  },
  {
    id: "safety",
    title: "Safety",
    questions: [
      {
        q: "Are your candles safe to burn around pets?",
        a: "We recommend burning candles in well-ventilated spaces and keeping them out of reach of pets. If you have concerns about specific fragrances, consult your veterinarian.",
      },
      {
        q: "Can I leave my candle burning unattended?",
        a: "No. Never leave a burning candle unattended. Keep it away from children, pets, curtains, and flammable objects.",
      },
      {
        q: "Are reed diffuser oils safe to apply to the skin?",
        a: "No. Reed diffuser oils are intended for home fragrance only and should never be applied to the skin or ingested.",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact",
    questions: [
      {
        q: "How can I contact your customer service team?",
        a: "You can reach us via email, phone, WhatsApp, or the contact form on our website. We're always happy to assist with product recommendations, order enquiries, and gifting advice.",
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function FAQHero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 bg-[#0A0A0A] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgb(184 150 92 / 0.07) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
          <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase font-medium">
            Help Centre
          </p>
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
        </div>
        <h1
          className="font-serif text-white font-light leading-[1.08] mb-5"
          style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
        >
          Frequently Asked<br />
          <em className="not-italic text-[#B8965C]">Questions</em>
        </h1>
        <p className="text-white/40 text-sm sm:text-base leading-[1.95] max-w-xl mx-auto">
          Everything you need to know about our products, candle care, delivery, and more.
        </p>

        {/* Section jump links */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {faqSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-4 py-2 border border-white/10 text-white/40 text-[10px] tracking-[0.2em] uppercase hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-200"
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

function FAQSection({
  section,
  globalIndex,
}: {
  section: (typeof faqSections)[number]
  globalIndex: number
}) {
  return (
    <section id={section.id} className={globalIndex % 2 === 0 ? "bg-white" : "bg-[#FAF7F4]"}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-16 py-14 sm:py-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-7 h-px bg-[#B8965C]" aria-hidden="true" />
          <h2 className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase font-medium">
            {section.title}
          </h2>
        </div>

        <div className="divide-y divide-[#E8E2D9]">
          {section.questions.map((faq, i) => (
            <div key={i} className="py-6 sm:py-7">
              <p className="font-serif text-lg sm:text-xl font-medium text-[#111111] mb-3 leading-snug">
                {faq.q}
              </p>
              {faq.a && (
                <p className="text-sm sm:text-base text-[#4A4A4A] leading-[1.95]">{faq.a}</p>
              )}
              {faq.list && (
                <ul className="mt-3 space-y-2">
                  {faq.list.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm sm:text-base text-[#4A4A4A] leading-[1.8]">
                      <span className="w-1 h-1 rounded-full bg-[#B8965C] mt-2.5 shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function StillNeedHelp() {
  return (
    <section className="py-20 sm:py-28 bg-[#0A0A0A] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgb(184 150 92 / 0.07) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
          <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase">Still need help?</p>
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
        </div>
        <h2
          className="font-serif text-white font-light leading-[1.1] mb-5"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
        >
          Can&apos;t find your answer?
        </h2>
        <p className="text-white/40 text-sm sm:text-base leading-[1.95] mb-8 max-w-xl mx-auto">
          Our team is always here to help. Reach us by phone, WhatsApp, or email and we&apos;ll
          get back to you promptly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="tel:08099007999"
            className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-[#B8965C] text-[#111111] text-[10px] tracking-[0.3em] uppercase font-semibold hover:bg-[#CBA96E] transition-all duration-300 min-h-[52px]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16h1" />
            </svg>
            08099007999
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-4 border border-white/15 text-white/60 text-[10px] tracking-[0.3em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300 min-h-[52px]"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white/50 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgb(184 150 92 / 0.3), transparent)" }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pt-14 sm:pt-20 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-12 pb-12 border-b border-white/5">
          <div className="lg:col-span-4">
            <p className="font-serif text-white text-lg sm:text-xl tracking-[0.12em] mb-2">DACH Home &amp; Body</p>
            <div className="w-8 h-px bg-[#B8965C] mb-5" aria-hidden="true" />
            <p className="text-sm leading-[1.9] text-white/35 max-w-xs mb-6">
              Luxury home fragrance, natural skincare, and curated gift services. Based in Abuja, FCT.
            </p>
            <div className="space-y-2.5 text-xs text-white/30">
              <a href="tel:08099007999" className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] flex items-center">08099007999</a>
              <a href="mailto:adachadzarma@gmail.com" className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] flex items-center">adachadzarma@gmail.com</a>
            </div>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6">
            <div>
              <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-5">Shop</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Best Sellers", href: "/shop?sort=bestsellers" },
                  { label: "New Arrivals", href: "/shop?sort=newest" },
                  { label: "Home Fragrance", href: "/shop?category=home-fragrance" },
                  { label: "Natural Skincare", href: "/shop?category=natural-skincare" },
                  { label: "Gift Boxes", href: "/gift-box" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors duration-200 leading-relaxed">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-5">Company</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Contact", href: "/contact" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors duration-200">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-5">Help</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "FAQ", href: "/faq" },
                  { label: "Shipping & Returns", href: "#" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors duration-200">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-5">Delivery</p>
              <div className="space-y-4 text-xs text-white/30 leading-relaxed">
                <div>
                  <p className="text-white/50 mb-1">Abuja, FCT</p>
                  <p>Same day delivery</p>
                </div>
                <div>
                  <p className="text-white/50 mb-1">Nationwide</p>
                  <p>3–5 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-[10px] text-white/20 tracking-wide text-center sm:text-left">
            © {new Date().getFullYear()} DACH Home &amp; Body. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Instagram", href: "https://www.instagram.com/dach.ng", path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M2 2h20v20H2z" },
              { label: "TikTok", href: "https://www.tiktok.com/@dach.ng", path: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" },
            ].map(({ label, href, path }) => (
              <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                className="text-white/30 hover:text-[#B8965C] transition-colors duration-200 w-10 h-10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-wider text-white/20 uppercase">
            <span>Visa</span><span className="text-white/10">·</span>
            <span>Mastercard</span><span className="text-white/10">·</span>
            <span>Paystack</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function FAQPage() {
  return (
    <>
      <main>
        <FAQHero />
        {faqSections.map((section, i) => (
          <FAQSection key={section.id} section={section} globalIndex={i} />
        ))}
        <StillNeedHelp />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}


