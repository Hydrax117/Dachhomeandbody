import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy | DACH Home & Body",
  description:
    "Learn how DACH Home & Body collects, uses, and protects your personal information.",
}

const LAST_UPDATED = "July 2025"

// ---------------------------------------------------------------------------
// Shared layout components
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function PrivacyPolicyPage() {
  return (
    <>
      <main>
        <PageHero title="Privacy Policy" subtitle={LAST_UPDATED} />

        <div className="bg-white">
          <div className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-16 py-14 sm:py-20">

            {/* Intro */}
            <div className="mb-10 p-5 bg-[#FAF7F4] border-l-2 border-[#B8965C]">
              <p className="text-sm text-[#4A4A4A] leading-[1.95]">
                DACH Home &amp; Body (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to protecting
                your personal information. This Privacy Policy explains what we collect, how we use
                it, and your rights regarding your data when you use{" "}
                <strong className="text-[#111111]">dachhomeandbody.com</strong> or purchase from us.
              </p>
            </div>

            <Section id="information-we-collect" number="01" title="Information We Collect">
              <p>
                <strong className="text-[#111111]">Account information:</strong> When you create an
                account, we collect your name, email address, and password (stored securely as a
                hash). If you sign in with Google, we receive your name, email, and profile picture
                from Google.
              </p>
              <p>
                <strong className="text-[#111111]">Order information:</strong> When you place an
                order, we collect your shipping address, phone number, and payment transaction
                reference. We do not store your card details — payments are processed securely by
                Paystack.
              </p>
              <p>
                <strong className="text-[#111111]">Usage information:</strong> We collect
                information about how you use our website, including pages visited, products viewed,
                and actions taken (such as adding to cart or placing an order).
              </p>
              <p>
                <strong className="text-[#111111]">Communications:</strong> If you contact us or
                subscribe to our newsletter, we collect your email address and the content of your
                message.
              </p>
            </Section>

            <Section id="how-we-use-information" number="02" title="How We Use Your Information">
              <p>We use your information to:</p>
              <ul className="space-y-2 list-none pl-4">
                {[
                  "Process and fulfil your orders, and send order confirmation and shipping notifications",
                  "Manage your account and provide customer support",
                  "Send transactional emails (order updates, password resets) via Resend",
                  "Send promotional newsletters if you have opted in — you can unsubscribe at any time",
                  "Improve our website and product offerings based on usage patterns",
                  "Detect and prevent fraud or unauthorised access",
                  "Comply with legal obligations",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[#B8965C] mt-2 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="sharing-information" number="03" title="Sharing Your Information">
              <p>
                We do not sell your personal data. We share your information only with trusted
                service providers necessary to operate our business:
              </p>
              <ul className="space-y-2 list-none pl-4">
                {[
                  "Paystack — payment processing (your card data goes directly to Paystack, never to us)",
                  "Resend — transactional email delivery",
                  "Supabase — secure database hosting for your account and order data",
                  "Cloudinary — image hosting for product photos",
                  "Google — if you choose to sign in with Google",
                  "Sentry — error monitoring to help us fix bugs",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[#B8965C] mt-2 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                All service providers are contractually required to handle your data securely and
                only for the purposes we specify. We may also disclose your information where
                required by Nigerian law or a court order.
              </p>
            </Section>

            <Section id="data-security" number="04" title="Data Security">
              <p>
                We take reasonable technical and organisational measures to protect your data,
                including encrypted connections (HTTPS), hashed passwords, and access controls. Our
                database is hosted on Supabase, which provides enterprise-grade security
                infrastructure.
              </p>
              <p>
                No method of transmission over the internet is 100% secure. While we strive to use
                commercially acceptable means to protect your data, we cannot guarantee absolute
                security. If you believe your account has been compromised, please contact us
                immediately at{" "}
                <a
                  href="mailto:support@dachhomeandbody.com"
                  className="text-[#B8965C] hover:underline"
                >
                  support@dachhomeandbody.com
                </a>
                .
              </p>
            </Section>

            <Section id="cookies" number="05" title="Cookies &amp; Local Storage">
              <p>
                We use essential cookies to keep you signed in and maintain your session. We use
                browser local storage to remember your shopping cart between visits. We do not use
                third-party advertising or tracking cookies.
              </p>
              <p>
                You can disable cookies in your browser settings, but this may prevent some features
                of the site from working correctly, including staying signed in.
              </p>
            </Section>

            <Section id="your-rights" number="06" title="Your Rights">
              <p>You have the right to:</p>
              <ul className="space-y-2 list-none pl-4">
                {[
                  "Access the personal data we hold about you",
                  "Correct inaccurate data via your account profile page",
                  "Request deletion of your account and associated data",
                  "Opt out of marketing emails at any time using the unsubscribe link",
                  "Request a copy of your data in a portable format",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-[#B8965C] mt-2 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                To exercise any of these rights, email us at{" "}
                <a
                  href="mailto:support@dachhomeandbody.com"
                  className="text-[#B8965C] hover:underline"
                >
                  support@dachhomeandbody.com
                </a>
                . We will respond within 30 days.
              </p>
            </Section>

            <Section id="data-retention" number="07" title="Data Retention">
              <p>
                We retain your account and order data for as long as your account is active or as
                needed to provide services. If you request account deletion, we will remove your
                personal data within 30 days, except where we are required to retain it for legal or
                financial record-keeping purposes (e.g., transaction records).
              </p>
            </Section>

            <Section id="children" number="08" title="Children&apos;s Privacy">
              <p>
                Our services are not directed at children under the age of 13. We do not knowingly
                collect personal information from children. If you believe a child has provided us
                with personal data, please contact us and we will delete it promptly.
              </p>
            </Section>

            <Section id="changes" number="09" title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of
                significant changes by posting the new policy on this page with an updated date. We
                encourage you to review this page periodically.
              </p>
            </Section>

            <Section id="contact" number="10" title="Contact Us">
              <p>
                If you have questions about this Privacy Policy or how we handle your data, please
                contact us:
              </p>
              <div className="mt-4 p-4 bg-[#FAF7F4] space-y-1.5 text-sm">
                <p>
                  <strong className="text-[#111111]">DACH Home &amp; Body</strong>
                </p>
                <p>Abuja, FCT, Nigeria</p>
                <p>
                  Email:{" "}
                  <a
                    href="mailto:support@dachhomeandbody.com"
                    className="text-[#B8965C] hover:underline"
                  >
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
              <Link href="/terms" className="text-[#B8965C] hover:underline">
                Terms of Service
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
