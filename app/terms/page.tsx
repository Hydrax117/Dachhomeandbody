import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service | DACH Home & Body",
  description:
    "Read the Terms of Service governing your use of DACH Home & Body's website and purchase of our products.",
}

const LAST_UPDATED = "July 2025"

function PageHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-20 bg-[#0A0A0A] overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgb(184 150 92 / 0.06) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 lg:px-16">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-px bg-[#B8965C]" aria-hidden="true" />
          <p className="text-[#B8965C] text-[10px] tracking-[0.38em] uppercase font-medium">
            Legal
          </p>
        </div>
        <h1
          className="font-serif text-white font-light leading-[1.08] mb-4"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          {title}
        </h1>
        <p className="text-white/40 text-sm">Last updated: {subtitle}</p>
      </div>
    </section>
  )
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="py-8 border-b border-[#E8E2D9] last:border-0">
      <div className="flex items-start gap-4 mb-4">
        <span className="text-[#B8965C] text-[10px] tracking-[0.3em] uppercase font-medium mt-1 shrink-0">
          {number}
        </span>
        <h2 className="font-serif text-[#111111] text-xl sm:text-2xl font-medium leading-snug">
          {title}
        </h2>
      </div>
      <div className="pl-8 space-y-3 text-sm text-[#4A4A4A] leading-[1.95]">
        {children}
      </div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <>
      <main>
        <PageHero title="Terms of Service" subtitle={LAST_UPDATED} />

        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-16 py-14 sm:py-20">

            {/* Intro */}
            <div className="mb-10 p-5 bg-[#FAF7F4] border-l-2 border-[#B8965C]">
              <p className="text-sm text-[#4A4A4A] leading-[1.95]">
                Please read these Terms of Service carefully before using{" "}
                <strong className="text-[#111111]">dachhomeandbody.com</strong> or placing an order.
                By accessing our website or making a purchase, you agree to be bound by these terms.
                If you do not agree, please do not use our services.
              </p>
            </div>

            <Section id="about" number="01" title="About Us">
              <p>
                DACH Home &amp; Body is a luxury home fragrance, natural skincare, and gifting brand
                based in Abuja, FCT, Nigeria. These Terms govern your use of our website and the
                purchase of our products.
              </p>
              <div className="mt-4 p-4 bg-[#FAF7F4] space-y-1.5">
                <p><strong className="text-[#111111]">DACH Home &amp; Body</strong></p>
                <p>Abuja, FCT, Nigeria</p>
                <p>
                  Email:{" "}
                  <a href="mailto:support@dachhomeandbody.com" className="text-[#B8965C] hover:underline">
                    support@dachhomeandbody.com
                  </a>
                </p>
                <p>
                  Phone:{" "}
                  <a href="tel:08099007999" className="text-[#B8965C] hover:underline">
                    08099007999
                  </a>
                </p>
              </div>
            </Section>

            <Section id="eligibility" number="02" title="Eligibility">
              <p>
                You must be at least 18 years old to create an account or place an order. By using
                our services, you represent that you meet this requirement. If you are placing an
                order on behalf of someone else, you confirm you have their authority to do so.
              </p>
            </Section>

            <Section id="accounts" number="03" title="Account Registration">
              <p>
                You may browse our website without an account. To place an order or access your
                order history, you will need to create an account or check out as a guest.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activities that occur under your account. Notify us immediately at{" "}
                <a href="mailto:support@dachhomeandbody.com" className="text-[#B8965C] hover:underline">
                  support@dachhomeandbody.com
                </a>{" "}
                if you suspect unauthorised access.
              </p>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or
                engage in fraudulent activity.
              </p>
            </Section>

            <Section id="products" number="04" title="Products &amp; Availability">
              <p>
                All products are subject to availability. We reserve the right to limit quantities,
                discontinue products, or modify product descriptions at any time without prior
                notice.
              </p>
              <p>
                Our products are handcrafted in small batches. Minor variations in appearance,
                scent intensity, and texture are a natural characteristic of artisanal products and
                do not constitute a defect.
              </p>
              <p>
                Product images are for illustrative purposes. The actual product may differ slightly
                in appearance due to screen colour calibration and the handcrafted nature of our
                items.
              </p>
            </Section>

            <Section id="pricing" number="05" title="Pricing &amp; Payment">
              <p>
                All prices are displayed in Nigerian Naira (₦) and are inclusive of applicable
                taxes. Prices are subject to change without notice, but changes will not affect
                orders already confirmed.
              </p>
              <p>
                Payment is processed securely by Paystack. We accept debit/credit cards, bank
                transfers, and USSD. We do not store your payment card details — these are handled
                entirely by Paystack in accordance with their security standards.
              </p>
              <p>
                Your order is confirmed once payment has been successfully processed. You will
                receive an order confirmation email.
              </p>
            </Section>

            <Section id="orders" number="06" title="Order Processing &amp; Cancellation">
              <p>
                Orders are typically processed within 1–3 business days. During peak periods,
                processing may take longer.
              </p>
              <p>
                If you wish to cancel or modify an order, please contact us as soon as possible at{" "}
                <a href="mailto:support@dachhomeandbody.com" className="text-[#B8965C] hover:underline">
                  support@dachhomeandbody.com
                </a>{" "}
                or{" "}
                <a href="tel:08099007999" className="text-[#B8965C] hover:underline">
                  08099007999
                </a>
                . We cannot guarantee cancellation once an order has been dispatched.
              </p>
              <p>
                We reserve the right to cancel any order if we suspect fraud, if the product is out
                of stock, or if a pricing error has occurred. In such cases, a full refund will be
                issued.
              </p>
            </Section>

            <Section id="delivery" number="07" title="Delivery">
              <p>
                We deliver across Nigeria. Estimated delivery times are:
              </p>
              <ul className="space-y-2 list-none pl-4">
                {[
                  "Abuja, FCT — same day (for standard orders placed before 2pm on business days)",
                  "Nationwide — 3–5 business days",
                  "Custom and gift orders may require additional processing time",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[#B8965C] mt-2 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                Delivery times are estimates and not guaranteed. We are not responsible for delays
                caused by couriers, customs, or circumstances beyond our control. Shipping fees are
                calculated at checkout based on your location.
              </p>
            </Section>

            <Section id="returns" number="08" title="Returns &amp; Exchanges">
              <p>
                Due to the personal and perishable nature of our products, we generally do not
                accept returns on opened or used items.
              </p>
              <p>
                <strong className="text-[#111111]">Damaged or incorrect items:</strong> If your
                order arrives damaged or you receive the wrong item, please contact us within{" "}
                <strong className="text-[#111111]">48 hours</strong> of delivery with your order
                number and photos of the item and packaging. We will arrange a replacement or
                refund at no cost to you.
              </p>
              <p>
                <strong className="text-[#111111]">Unopened items:</strong> If you change your
                mind, please contact us within 7 days of delivery. Unopened items in original
                packaging may be returned at your expense, subject to our approval. Refunds will be
                processed within 7–10 business days after we receive and inspect the return.
              </p>
            </Section>

            <Section id="intellectual-property" number="09" title="Intellectual Property">
              <p>
                All content on this website — including text, images, product descriptions, logos,
                and branding — is the property of DACH Home &amp; Body and is protected by Nigerian
                and international copyright and trademark law.
              </p>
              <p>
                You may not reproduce, distribute, modify, or use any content from this website for
                commercial purposes without our express written permission. Personal, non-commercial
                use (such as sharing a product page link) is permitted.
              </p>
            </Section>

            <Section id="prohibited" number="10" title="Prohibited Uses">
              <p>You agree not to:</p>
              <ul className="space-y-2 list-none pl-4">
                {[
                  "Use our website for any unlawful purpose",
                  "Place fraudulent orders or use stolen payment details",
                  "Attempt to access systems or data you are not authorised to access",
                  "Use automated tools to scrape, crawl, or harvest data from our website",
                  "Post or transmit harmful, offensive, or misleading content through any feature of our platform",
                  "Resell our products without prior written agreement",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[#B8965C] mt-2 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="disclaimers" number="11" title="Disclaimers &amp; Limitation of Liability">
              <p>
                Our website and products are provided &ldquo;as is&rdquo;. While we take every care to
                ensure accuracy, we do not warrant that the website will be uninterrupted,
                error-free, or free of viruses.
              </p>
              <p>
                Our skincare and fragrance products are formulated with natural ingredients. We
                recommend performing a patch test before use, especially if you have sensitive skin
                or allergies. We are not liable for adverse reactions resulting from failure to
                follow product usage instructions.
              </p>
              <p>
                To the maximum extent permitted by Nigerian law, DACH Home &amp; Body shall not be
                liable for indirect, incidental, or consequential damages arising from your use of
                our products or website.
              </p>
            </Section>

            <Section id="governing-law" number="12" title="Governing Law">
              <p>
                These Terms are governed by and construed in accordance with the laws of the Federal
                Republic of Nigeria. Any disputes arising from these Terms or your use of our
                services shall be subject to the exclusive jurisdiction of the Nigerian courts.
              </p>
              <p>
                We encourage you to contact us first to resolve any dispute amicably before
                pursuing legal action.
              </p>
            </Section>

            <Section id="changes" number="13" title="Changes to These Terms">
              <p>
                We reserve the right to update these Terms at any time. Changes will be posted on
                this page with an updated date. Continued use of our website or services after
                changes are posted constitutes acceptance of the revised Terms.
              </p>
            </Section>

            <Section id="contact-legal" number="14" title="Contact">
              <p>
                For questions about these Terms, please contact:
              </p>
              <div className="mt-4 p-4 bg-[#FAF7F4] space-y-1.5 text-sm">
                <p><strong className="text-[#111111]">DACH Home &amp; Body</strong></p>
                <p>Abuja, FCT, Nigeria</p>
                <p>
                  Email:{" "}
                  <a href="mailto:support@dachhomeandbody.com" className="text-[#B8965C] hover:underline">
                    support@dachhomeandbody.com
                  </a>
                </p>
                <p>
                  Phone:{" "}
                  <a href="tel:08099007999" className="text-[#B8965C] hover:underline">
                    08099007999
                  </a>
                </p>
              </div>
            </Section>

          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-[#FAF7F4] py-12 border-t border-[#E8E2D9]">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-16 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#8C8C8C]">
              Also see our{" "}
              <Link href="/privacy-policy" className="text-[#B8965C] hover:underline">
                Privacy Policy
              </Link>
            </p>
            <Link
              href="/contact"
              className="px-6 py-3 border border-[#e5e5e5] text-[#8C8C8C] text-[10px] tracking-[0.2em] uppercase font-medium hover:border-[#B8965C] hover:text-[#B8965C] transition-all duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
