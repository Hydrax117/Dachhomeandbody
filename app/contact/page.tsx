import Link from "next/link"
import type { Metadata } from "next"
import { Newsletter } from "@/app/components/Newsletter"

export const metadata: Metadata = {
  title: "Contact Us | DACH Home & Body",
  description:
    "Get in touch with DACH Home & Body. Reach us for orders, wholesale & corporate gifting enquiries, or general questions about our products.",
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
function ContactHero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 bg-[#0A0A0A] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgb(184 150 92 / 0.08) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
          <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase font-medium">
            Get In Touch
          </p>
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
        </div>
        <h1
          className="font-serif text-white font-light leading-[1.08] mb-5"
          style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
        >
          We&apos;d love to<br />
          <em className="not-italic text-[#B8965C]">hear from you</em>
        </h1>
        <p className="text-white/40 text-sm sm:text-base leading-[1.95] max-w-xl mx-auto">
          Whether you have a question about a product, want to place a custom order, or are
          interested in wholesale — we&apos;re here to help.
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Contact Cards
// ---------------------------------------------------------------------------
function ContactCards() {
  const channels = [
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16h1" />
        </svg>
      ),
      label: "Phone / WhatsApp",
      value: "07064313141",
      href: "tel:07064313141",
      note: "Mon – Sat, 9 am – 6 pm WAT",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      label: "Email",
      value: "adachadzarma@gmail.com",
      href: "mailto:adachadzarma@gmail.com",
      note: "We reply within 24 hours",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      label: "Instagram",
      value: "@dach.ng",
      href: "https://www.instagram.com/dach.ng",
      note: "DMs welcome",
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      label: "Location",
      value: "Abuja, FCT — Nigeria",
      href: null,
      note: "Delivery nationwide",
    },
  ]

  return (
    <section className="py-16 sm:py-24 bg-[#FAF7F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {channels.map((ch) => (
            <div
              key={ch.label}
              className="bg-white border border-[#E8E2D9] p-7 flex flex-col gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F8F5F2] text-[#B8965C]">
                {ch.icon}
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-[#8C8C8C] mb-1">
                  {ch.label}
                </p>
                {ch.href ? (
                  <a
                    href={ch.href}
                    target={ch.href.startsWith("http") ? "_blank" : undefined}
                    rel={ch.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm font-medium text-[#111111] hover:text-[#B8965C] transition-colors duration-200 break-all"
                  >
                    {ch.value}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-[#111111]">{ch.value}</p>
                )}
                <p className="text-xs text-[#8C8C8C] mt-1.5 leading-relaxed">{ch.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------
const FAQS = [
  {
    q: "Do you deliver outside Abuja?",
    a: "Yes — we ship nationwide across Nigeria. Abuja orders typically arrive same day, while other states take 3–5 business days depending on your location.",
  },
  {
    q: "Can I customise a gift box?",
    a: "Absolutely. Use our Gift Box Builder to handpick products, choose a box theme, add a personalised message, and select ribbons & wrapping. For large or corporate orders, reach out directly.",
  },
  {
    q: "Do you offer wholesale or corporate gifting?",
    a: "Yes. We work with businesses, event planners, and corporate clients on bulk orders and branded gift sets. Send us an email or WhatsApp to discuss your needs.",
  },
  {
    q: "Are your products natural / cruelty-free?",
    a: "We use plant-derived ingredients and essential oils. Our products are not tested on animals. Specific ingredient lists are available on each product page.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive a confirmation with tracking information. You can also view live order status in your account under Orders.",
  },
]

function FAQSection() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-7 h-px bg-[#B8965C]" aria-hidden="true" />
            <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase font-medium">
              Common Questions
            </p>
          </div>
          <h2
            className="font-serif text-[#111111] font-light leading-[1.1] mb-10"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
          >
            Frequently asked questions
          </h2>
          <div className="divide-y divide-[#E8E2D9]">
            {FAQS.map((faq) => (
              <div key={faq.q} className="py-6">
                <p className="text-sm font-semibold text-[#111111] mb-2">{faq.q}</p>
                <p className="text-sm text-[#4A4A4A] leading-[1.95]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// CTA
// ---------------------------------------------------------------------------
function ContactCTA() {
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
          <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase">Gift Experiences</p>
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
        </div>
        <h2
          className="font-serif text-white font-light leading-[1.1] mb-5"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
        >
          Ready to explore our<br />
          <em className="not-italic text-[#B8965C]">products &amp; gifting</em>?
        </h2>
        <p className="text-white/40 text-sm sm:text-base leading-[1.95] mb-8 max-w-xl mx-auto">
          Browse our full collection or build a custom gift box — delivered with care across Nigeria.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-4 px-10 py-4 bg-[#B8965C] text-[#111111] text-[10px] tracking-[0.3em] uppercase font-semibold hover:bg-[#CBA96E] transition-all duration-300 min-h-[52px]"
          >
            Shop Now
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/gift-box"
            className="inline-flex items-center justify-center px-10 py-4 border border-white/15 text-white/60 text-[10px] tracking-[0.3em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300 min-h-[52px]"
          >
            Build a Gift Box
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Footer (matches site-wide inline footer on other pages)
// ---------------------------------------------------------------------------
function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-white/50 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgb(184 150 92 / 0.3), transparent)",
        }}
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pt-14 sm:pt-20 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-12 pb-12 border-b border-white/5">
          <div className="lg:col-span-4">
            <p className="font-serif text-white text-lg sm:text-xl tracking-[0.12em] mb-2">
              DACH Home &amp; Body
            </p>
            <div className="w-8 h-px bg-[#B8965C] mb-5" aria-hidden="true" />
            <p className="text-sm leading-[1.9] text-white/35 max-w-xs mb-6">
              Luxury home fragrance, natural skincare, and curated gift services. Crafted
              for intentional living. Based in Abuja, FCT.
            </p>
            <div className="space-y-2.5 text-xs text-white/30">
              <a
                href="tel:07064313141"
                className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] flex items-center"
              >
                07064313141
              </a>
              <a
                href="mailto:adachadzarma@gmail.com"
                className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] flex items-center"
              >
                adachadzarma@gmail.com
              </a>
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
                    <Link href={l.href} className="hover:text-white transition-colors duration-200 leading-relaxed">
                      {l.label}
                    </Link>
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
                    <Link href={l.href} className="hover:text-white transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white text-[10px] tracking-[0.3em] uppercase mb-5">Help</p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Shipping & Returns", href: "#" },
                  { label: "FAQ", href: "#" },
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white transition-colors duration-200">
                      {l.label}
                    </Link>
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
              {
                label: "Instagram",
                href: "https://www.instagram.com/dach.ng",
                path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M2 2h20v20H2z",
              },
              { label: "TikTok", href: "https://www.tiktok.com/@dach.ng", path: "M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" },
            ].map(({ label, href, path }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/30 hover:text-[#B8965C] transition-colors duration-200 w-10 h-10 flex items-center justify-center"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] tracking-wider text-white/20 uppercase">
            <span>Visa</span>
            <span className="text-white/10">·</span>
            <span>Mastercard</span>
            <span className="text-white/10">·</span>
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
export default function ContactPage() {
  return (
    <>
      <main>
        <ContactHero />
        <ContactCards />
        <FAQSection />
        <ContactCTA />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
