/**
 * JSON-LD structured data generators.
 *
 * Structured data helps AI crawlers (and Google) understand the site's
 * entities — brand, products, reviews, breadcrumbs — so they can cite
 * DACH Home & Body accurately when answering user questions.
 *
 * References:
 *   - https://schema.org/Product
 *   - https://schema.org/Organization
 *   - https://schema.org/BreadcrumbList
 */

const SITE_URL = "https://www.dachhomeandbody.com"
const BRAND_NAME = "DACH Home & Body"

// ── Organisation / Brand ───────────────────────────────────────────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/Dach Logo png (1).PNG`,
    description:
      "Luxury home fragrance, natural skincare, and curated gift services crafted for the wellness lifestyle. Handcrafted in small batches and delivered across Abuja and Nigeria.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Abuja",
      addressRegion: "FCT",
      addressCountry: "NG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+2348099007999",
      contactType: "customer service",
      email: "adachadzarma@gmail.com",
      availableLanguage: "English",
    },
    sameAs: [],
    foundingLocation: {
      "@type": "Place",
      name: "Abuja, Nigeria",
    },
    knowsAbout: [
      "Luxury home fragrance",
      "Natural skincare",
      "Scented candles",
      "Reed diffusers",
      "Body oils",
      "Body butter",
      "Gift boxes Nigeria",
      "Wellness lifestyle",
    ],
  }
}

// ── Local Business ─────────────────────────────────────────────────────────

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BRAND_NAME,
    url: SITE_URL,
    description:
      "Premium home fragrance and natural skincare brand based in Abuja, Nigeria. Same-day delivery across Abuja, nationwide delivery in 3–5 business days.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Abuja",
      addressRegion: "Federal Capital Territory",
      addressCountry: "NG",
    },
    telephone: "+2348099007999",
    email: "adachadzarma@gmail.com",
    priceRange: "₦₦₦",
    currenciesAccepted: "NGN",
    paymentAccepted: "Credit Card, Bank Transfer, USSD",
    areaServed: [
      { "@type": "City", name: "Abuja" },
      { "@type": "Country", name: "Nigeria" },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "DACH Home & Body Products",
      itemListElement: [
        { "@type": "OfferCatalog", name: "Home Fragrance" },
        { "@type": "OfferCatalog", name: "Natural Skincare" },
        { "@type": "OfferCatalog", name: "Gift Boxes" },
      ],
    },
  }
}

// ── Product ────────────────────────────────────────────────────────────────

interface ProductSchemaParams {
  name: string
  description: string
  price: number
  compareAtPrice?: number | null
  images: string[]
  slug: string
  sku: string
  stock: number
  averageRating?: number | null
  reviewCount?: number
  categoryName: string
  topNotes?: string[]
  heartNotes?: string[]
  baseNotes?: string[]
}

export function productSchema(p: ProductSchemaParams) {
  const availability =
    p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"

  const offers: Record<string, unknown> = {
    "@type": "Offer",
    url: `${SITE_URL}/shop/${p.slug}`,
    priceCurrency: "NGN",
    price: p.price,
    availability,
    seller: { "@type": "Organization", name: BRAND_NAME },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        currency: "NGN",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 0,
          maxValue: 1,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: 5,
          unitCode: "DAY",
        },
      },
    },
  }

  if (p.compareAtPrice && p.compareAtPrice > p.price) {
    offers.priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
  }

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.images,
    sku: p.sku,
    brand: { "@type": "Brand", name: BRAND_NAME },
    category: p.categoryName,
    offers,
  }

  // Add aggregate rating if available
  if (p.averageRating && p.reviewCount && p.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.averageRating.toFixed(1),
      reviewCount: p.reviewCount,
      bestRating: "5",
      worstRating: "1",
    }
  }

  // Add fragrance notes as additionalProperty for AI context
  const additionalProperties: unknown[] = []
  if (p.topNotes?.length) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Top Notes",
      value: p.topNotes.join(", "),
    })
  }
  if (p.heartNotes?.length) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Heart Notes",
      value: p.heartNotes.join(", "),
    })
  }
  if (p.baseNotes?.length) {
    additionalProperties.push({
      "@type": "PropertyValue",
      name: "Base Notes",
      value: p.baseNotes.join(", "),
    })
  }
  if (additionalProperties.length) {
    schema.additionalProperty = additionalProperties
  }

  return schema
}

// ── BreadcrumbList ─────────────────────────────────────────────────────────

export function breadcrumbSchema(
  crumbs: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}

// ── WebSite (enables Sitelinks search box) ────────────────────────────────

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: SITE_URL,
    description:
      "Luxury home fragrance, natural skincare, and curated gift services. Delivering wellness to Abuja and Nigeria.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }
}

// ── FAQPage (for About/FAQ — boosts AI citation) ──────────────────────────

export function faqSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}
