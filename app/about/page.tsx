import Link from "next/link"
import Image from "next/image"
import { Newsletter } from "@/app/components/Newsletter"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us | DACH Home & Body",
  description:
    "Dach Home & Body is a proudly Nigerian brand transforming everyday spaces into calming, luxurious experiences through home fragrance and aromatherapy-based skincare.",
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
function AboutHero() {
  return (
    <section className="relative min-h-[60vh] flex items-end overflow-hidden bg-[#0A0A0A]">
      <Image
        src="/homepage-image.jpeg"
        alt="DACH Home & Body — crafted with intention"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,10,0.35) 0%, rgba(10,10,10,0.6) 60%, rgba(10,10,10,0.92) 100%)",
        }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-16 pb-16 sm:pb-20 lg:pb-24">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-px bg-[#B8965C]" aria-hidden="true" />
          <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase font-medium">
            Our Story
          </p>
        </div>
        <h1
          className="font-serif text-white font-light leading-[1.08] max-w-2xl"
          style={{ fontSize: "clamp(2.25rem, 6vw, 4.5rem)" }}
        >
          Proudly Nigerian.<br />
          <em className="not-italic text-[#B8965C]">Purposefully Crafted.</em>
        </h1>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Mission Statement
// ---------------------------------------------------------------------------
function MissionStatement() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-[#FAF7F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
            <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase">Who We Are</p>
            <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
          </div>
          <p
            className="font-serif text-[#111111] font-light leading-[1.5] text-center mb-6"
            style={{ fontSize: "clamp(1.35rem, 3vw, 2rem)" }}
          >
            Dach Home &amp; Body is a proudly Nigerian brand transforming everyday spaces
            into calming, luxurious experiences.
          </p>
          <div className="space-y-4 text-[#4A4A4A] leading-[1.95] text-sm sm:text-base text-left max-w-2xl mx-auto">
            <p>
              Our handcrafted candles, reed diffusers, fragrance oils, body oils, and soaps
              are inspired by nature — designed to enhance wellness and elevate daily living
              through home fragrance and aromatherapy-based skincare.
            </p>
            <p>
              Committed to sustainability, we use responsibly sourced ingredients and
              eco-friendly minimal wastage. By partnering with local suppliers and creating
              opportunities for women and youth, we promote inclusive economic growth.
            </p>
            <p>
              We also offer curated gifting services for individuals, businesses, and special
              events, delivering memorable, personalised experiences. Through digital sales,
              gift sets, and wholesale partnerships, we combine purpose, beauty, and growth
              in every product.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Values Grid
// ---------------------------------------------------------------------------
const values = [
  {
    icon: "✦",
    title: "Nature-Inspired",
    body:
      "Every formula begins with nature. We blend responsibly sourced botanicals, essential oils, and natural waxes to create products that are as good for your body as they are for your home.",
  },
  {
    icon: "◎",
    title: "Sustainability First",
    body:
      "Committed to minimal wastage, eco-friendly packaging, and responsible sourcing. We make luxury that doesn't cost the earth.",
  },
  {
    icon: "◈",
    title: "Community & Inclusion",
    body:
      "By partnering with local suppliers and creating meaningful opportunities for women and youth, we champion inclusive economic growth rooted in Abuja and beyond.",
  },
  {
    icon: "★",
    title: "Curated Gifting",
    body:
      "We craft memorable, personalized gift experiences for individuals, businesses, and special events — because every occasion deserves something beautiful.",
  },
]

function ValuesGrid() {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-px bg-[#B8965C]" aria-hidden="true" />
          <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase">Our Values</p>
        </div>
        <h2
          className="font-serif text-[#111111] font-light leading-[1.1] mb-12 sm:mb-16"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
        >
          What drives us
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {values.map(({ icon, title, body }) => (
            <div key={title} className="flex flex-col gap-4">
              <span className="text-[#B8965C] text-2xl" aria-hidden="true">{icon}</span>
              <div className="w-8 h-px bg-[#EBEBEB]" aria-hidden="true" />
              <h3 className="font-serif text-[#111111] text-lg font-light">{title}</h3>
              <p className="text-[#4A4A4A] text-sm leading-[1.9]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Products Highlight
// ---------------------------------------------------------------------------
const products = [
  { name: "Handcrafted Candles", desc: "Slow-burning soy and coconut wax candles scented with nature-derived fragrance blends." },
  { name: "Reed Diffusers", desc: "Long-lasting, alcohol-free diffusers that fill your space with subtle, luxurious scent." },
  { name: "Fragrance & Body Oils", desc: "Skin-safe oils that nourish while wrapping you in signature scents all day." },
  { name: "Artisan Soaps", desc: "Cold-processed, naturally moisturising soaps crafted to cleanse without stripping." },
]

function ProductsHighlight() {
  return (
    <section className="py-16 sm:py-24 bg-[#111111] relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgb(184 150 92 / 0.07) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />

      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#B8965C]" aria-hidden="true" />
              <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase">What We Make</p>
            </div>
            <h2
              className="font-serif text-white font-light leading-[1.1] mb-6"
              style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
            >
              Home fragrance &amp;<br />
              <em className="not-italic text-[#B8965C]">natural skincare</em>
            </h2>
            <p className="text-white/45 text-sm leading-[1.95] max-w-md mb-10">
              Every product is handcrafted with carefully chosen ingredients — inspired by
              nature, designed to elevate your space and your skin. No shortcuts, no
              compromise.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-4 px-10 py-4 bg-[#B8965C] text-[#111111] text-[10px] tracking-[0.3em] uppercase font-semibold hover:bg-[#CBA96E] transition-all duration-300 min-h-[52px]"
            >
              Shop the Collection
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5">
            {products.map(({ name, desc }) => (
              <div
                key={name}
                className="bg-[#111111] p-6 sm:p-7 hover:bg-[#1A1A1A] transition-colors duration-300"
              >
                <p className="text-white text-sm font-medium tracking-[0.08em] mb-2">{name}</p>
                <p className="text-white/35 text-xs leading-[1.85]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Stats Bar
// ---------------------------------------------------------------------------
const stats = [
  { value: "100%", label: "Natural Ingredients" },
  { value: "ABJ", label: "Same-Day Delivery" },
  { value: "5★", label: "Customer Rating" },
  { value: "∞", label: "Passion for Craft" },
]

function StatsBar() {
  return (
    <div className="bg-[#F8F5F2] border-b border-[#EBEBEB]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-[#EBEBEB]">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center py-8 px-4 gap-1">
              <p className="font-serif text-[#111111] text-2xl sm:text-3xl font-light">{value}</p>
              <p className="text-[#8C8C8C] text-[10px] tracking-[0.18em] uppercase text-center">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sustainability & Community
// ---------------------------------------------------------------------------
function SustainabilitySection() {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-[#FAF7F4]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Visual placeholder */}
          <div className="relative min-h-[340px] sm:min-h-[440px] overflow-hidden order-last lg:order-first">
            <Image
              src="/homepage-image.jpeg"
              alt="DACH Home & Body — sustainability and community"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-px bg-[#B8965C]" aria-hidden="true" />
              <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase">Purpose</p>
            </div>
            <h2
              className="font-serif text-[#111111] font-light leading-[1.1] mb-6"
              style={{ fontSize: "clamp(1.75rem, 4.5vw, 2.75rem)" }}
            >
              Beauty with<br />
              <em className="not-italic text-[#B8965C]">purpose &amp; impact</em>
            </h2>

            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="text-[#B8965C] mt-0.5 shrink-0 text-lg" aria-hidden="true">◎</span>
                <div>
                  <p className="text-[#111111] text-sm font-medium mb-1">Eco-Friendly &amp; Minimal Wastage</p>
                  <p className="text-[#4A4A4A] text-sm leading-[1.85]">
                    We use responsibly sourced ingredients and eco-conscious packaging that
                    minimises waste without sacrificing the luxury you deserve.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#B8965C] mt-0.5 shrink-0 text-lg" aria-hidden="true">✦</span>
                <div>
                  <p className="text-[#111111] text-sm font-medium mb-1">Supporting Local Suppliers</p>
                  <p className="text-[#4A4A4A] text-sm leading-[1.85]">
                    By sourcing locally and partnering with Nigerian artisans and suppliers,
                    we keep wealth and opportunity circulating in our communities.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-[#B8965C] mt-0.5 shrink-0 text-lg" aria-hidden="true">◈</span>
                <div>
                  <p className="text-[#111111] text-sm font-medium mb-1">Empowering Women &amp; Youth</p>
                  <p className="text-[#4A4A4A] text-sm leading-[1.85]">
                    We actively create opportunities for women and young people, promoting
                    inclusive economic growth that extends well beyond the products we sell.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Gifting Services CTA
// ---------------------------------------------------------------------------
function GiftingCTA() {
  return (
    <section className="relative overflow-hidden bg-[#111111] py-16 sm:py-20 lg:py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 60% 50%, rgb(184 150 92 / 0.08) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
          <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase">Gift Experiences</p>
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
        </div>
        <h2
          className="font-serif text-white font-light leading-[1.1] mb-5"
          style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}
        >
          Curated gifting for every<br />
          <em className="not-italic text-[#B8965C]">occasion &amp; audience</em>
        </h2>
        <p className="text-white/45 text-sm sm:text-base leading-[1.95] mb-8 max-w-xl mx-auto">
          We offer personalised gift services for individuals, businesses, and special events.
          Through digital sales, curated gift sets, and wholesale partnerships, we combine
          purpose, beauty, and growth in every product.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/gift-box"
            className="inline-flex items-center justify-center gap-4 px-10 py-4 bg-[#B8965C] text-[#111111] text-[10px] tracking-[0.3em] uppercase font-semibold hover:bg-[#CBA96E] transition-all duration-300 min-h-[52px]"
          >
            Build a Gift Box
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
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-4 border border-white/15 text-white/60 text-[10px] tracking-[0.3em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300 min-h-[52px]"
          >
            Wholesale &amp; Corporate
          </Link>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Footer (shared inline — uses same layout as homepage)
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
              <p>
                <a
                  href="tel:07064313141"
                  className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] flex items-center"
                >
                  07064313141
                </a>
              </p>
              <p>
                <a
                  href="mailto:adachadzarma@gmail.com"
                  className="hover:text-[#B8965C] transition-colors duration-200 min-h-[44px] flex items-center"
                >
                  adachadzarma@gmail.com
                </a>
              </p>
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
                    <Link
                      href={l.href}
                      className="hover:text-white transition-colors duration-200 leading-relaxed"
                    >
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
export default function AboutPage() {
  return (
    <>
      <main>
        <AboutHero />
        <MissionStatement />
        <StatsBar />
        <ValuesGrid />
        <ProductsHighlight />
        <SustainabilitySection />
        <GiftingCTA />
        <Newsletter />
      </main>
      <Footer />
    </>
  )
}
