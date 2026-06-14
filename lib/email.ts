import { Resend } from "resend"

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
// Use RESEND_FROM_EMAIL env var if set (verified domain), otherwise fall back
// to Resend's shared test address which works without domain verification.
const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev"
const SITE_NAME = "Dachhomeandbody"
const SITE_URL = process.env.NEXTAUTH_URL || "https://dachhomeandbody.com"

// ─── Shared helpers ──────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount)
}

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f9f9f9;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 20px;text-align:center;border-bottom:1px solid #e5e5e5;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <h1 style="margin:0;font-size:22px;font-weight:400;letter-spacing:3px;color:#1a1a1a;text-transform:uppercase;">${SITE_NAME}</h1>
              </a>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px;text-align:center;background-color:#f9f9f9;border-top:1px solid #e5e5e5;">
              <p style="margin:0 0 8px;font-size:12px;color:#999999;">
                © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:#999999;">
                <a href="${SITE_URL}" style="color:#999999;text-decoration:underline;">${SITE_URL}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

function ctaButton(href: string, label: string): string {
  return `
<table role="presentation" style="margin:30px 0;">
  <tr>
    <td>
      <a href="${href}" style="display:inline-block;padding:16px 40px;background-color:#1a1a1a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:1.5px;text-transform:uppercase;border-radius:2px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`
}

function orderItemsTable(
  items: Array<{ name: string; quantity: number; price: number }>
): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;">${item.name}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#666666;text-align:center;">×${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#1a1a1a;text-align:right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>`
    )
    .join("")

  return `
<table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0;">
  <thead>
    <tr>
      <th style="padding:8px 0;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#999999;text-align:left;border-bottom:2px solid #e5e5e5;">Item</th>
      <th style="padding:8px 0;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#999999;text-align:center;border-bottom:2px solid #e5e5e5;">Qty</th>
      <th style="padding:8px 0;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#999999;text-align:right;border-bottom:2px solid #e5e5e5;">Price</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrderEmailDetails {
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  discount?: number
  shippingCost?: number
  total: number
  shippingAddress: {
    name: string
    address: string
    city: string
    state?: string | null
    postalCode: string
    country: string
    phone: string
  }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string | null
) {
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${resetToken}`

  const content = `
    ${userName ? `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">Hello ${userName},</p>` : ""}
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">
      We received a request to reset your password. Click the button below to create a new password.
    </p>
    ${ctaButton(resetUrl, "Reset Password")}
    <p style="margin:20px 0 8px;font-size:13px;line-height:1.6;color:#666666;">Or copy this link into your browser:</p>
    <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#666666;word-break:break-all;">
      <a href="${resetUrl}" style="color:#1a1a1a;">${resetUrl}</a>
    </p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:#999999;padding-top:20px;border-top:1px solid #e5e5e5;">
      This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Reset your ${SITE_NAME} password`,
      html: emailWrapper(content),
    })
    if (error) {
      console.error("Resend error (password reset):", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

// ─── Order Confirmation ───────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  orderDetails: OrderEmailDetails,
  userName?: string | null
) {
  const { items, subtotal, discount = 0, shippingCost = 0, total, shippingAddress } = orderDetails
  const orderUrl = `${SITE_URL}/account/orders`

  const addressLines = [
    shippingAddress.name,
    shippingAddress.address,
    [shippingAddress.city, shippingAddress.state].filter(Boolean).join(", "),
    shippingAddress.postalCode,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join("<br>")

  const content = `
    ${userName ? `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">Hello ${userName},</p>` : ""}
    <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#1a1a1a;">
      Thank you for your order. We've received it and will begin processing shortly.
    </p>
    <p style="margin:0 0 30px;font-size:14px;color:#666666;">
      Order number: <strong style="color:#1a1a1a;">${orderNumber}</strong>
    </p>

    ${orderItemsTable(items)}

    <!-- Totals -->
    <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#666666;">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">${formatCurrency(subtotal)}</td>
      </tr>
      ${discount > 0 ? `<tr><td style="padding:6px 0;font-size:14px;color:#666666;">Discount</td><td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">−${formatCurrency(discount)}</td></tr>` : ""}
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#666666;">Shipping</td>
        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">${shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#1a1a1a;border-top:2px solid #e5e5e5;">Total</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#1a1a1a;text-align:right;border-top:2px solid #e5e5e5;">${formatCurrency(total)}</td>
      </tr>
    </table>

    <!-- Shipping address -->
    <div style="margin-top:30px;padding:20px;background-color:#f9f9f9;border-radius:2px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#999999;">Shipping to</p>
      <p style="margin:0;font-size:14px;line-height:1.8;color:#1a1a1a;">${addressLines}</p>
    </div>

    ${ctaButton(orderUrl, "View Order")}

    <p style="margin:0;font-size:13px;line-height:1.6;color:#999999;">
      We'll send you a shipping notification once your order is on its way.
    </p>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Order confirmed — ${orderNumber}`,
      html: emailWrapper(content),
    })
    if (error) {
      console.error("Resend error (order confirmation):", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to send order confirmation email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

// ─── Shipping Notification ────────────────────────────────────────────────────

export async function sendShippingNotificationEmail(
  email: string,
  orderNumber: string,
  trackingNumber?: string | null,
  userName?: string | null
) {
  const orderUrl = `${SITE_URL}/account/orders`

  const content = `
    ${userName ? `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">Hello ${userName},</p>` : ""}
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">
      Great news — your order is on its way.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:#666666;">
      Order number: <strong style="color:#1a1a1a;">${orderNumber}</strong>
    </p>
    ${
      trackingNumber
        ? `<p style="margin:0 0 24px;font-size:14px;color:#666666;">
        Tracking number: <strong style="color:#1a1a1a;">${trackingNumber}</strong>
      </p>`
        : `<p style="margin:0 0 24px;font-size:14px;color:#666666;">
        Tracking information will be available soon.
      </p>`
    }
    ${ctaButton(orderUrl, "Track Order")}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#999999;">
      Estimated delivery is typically 3–7 business days. We'll notify you once your order arrives.
    </p>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your order ${orderNumber} has shipped`,
      html: emailWrapper(content),
    })
    if (error) {
      console.error("Resend error (shipping notification):", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to send shipping notification email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

// ─── Delivery Confirmation ────────────────────────────────────────────────────

export async function sendDeliveryConfirmationEmail(
  email: string,
  orderNumber: string,
  userName?: string | null
) {
  const shopUrl = `${SITE_URL}/shop`

  const content = `
    ${userName ? `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">Hello ${userName},</p>` : ""}
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">
      Your order has been delivered. We hope you love your new fragrance.
    </p>
    <p style="margin:0 0 30px;font-size:14px;color:#666666;">
      Order number: <strong style="color:#1a1a1a;">${orderNumber}</strong>
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#666666;">
      If you have any questions or concerns about your order, please don't hesitate to reach out to us.
    </p>
    ${ctaButton(shopUrl, "Continue Shopping")}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#999999;">
      Enjoyed your purchase? We'd love to hear your thoughts — leave a review on the product page.
    </p>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your order ${orderNumber} has been delivered`,
      html: emailWrapper(content),
    })
    if (error) {
      console.error("Resend error (delivery confirmation):", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to send delivery confirmation email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

// ─── Newsletter Welcome ───────────────────────────────────────────────────────

export async function sendNewsletterWelcomeEmail(email: string) {
  const shopUrl = `${SITE_URL}/shop`

  const content = `
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">
      Welcome to ${SITE_NAME}.
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.8;color:#666666;">
      You're now part of our community. Be the first to discover new arrivals, exclusive collections, and curated fragrance stories.
    </p>
    ${ctaButton(shopUrl, "Explore the Collection")}
    <p style="margin:0;font-size:13px;line-height:1.6;color:#999999;">
      You can unsubscribe at any time by replying to this email.
    </p>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Welcome to ${SITE_NAME}`,
      html: emailWrapper(content),
    })
    if (error) {
      console.error("Resend error (newsletter welcome):", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to send newsletter welcome email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

// ─── Pay-For-Me: Requester Notification ──────────────────────────────────────

export interface PaymentRequestEmailDetails {
  items: Array<{ name: string; quantity: number; price: number }>
  subtotal: number
  discount?: number
  shippingCost?: number
  total: number
  shippingAddress: {
    name: string
    address: string
    city: string
    state?: string | null
    postalCode: string
    country: string
    phone: string
  }
  paymentRequestToken: string
}

/**
 * Sent to the requester when someone else just paid for their items.
 */
export async function sendPaymentRequestFulfilledEmail(
  email: string,
  orderNumber: string,
  payerEmail: string,
  details: PaymentRequestEmailDetails,
  userName?: string | null
) {
  const { items, subtotal, discount = 0, shippingCost = 0, total, shippingAddress } = details
  const orderUrl = `${SITE_URL}/account/orders`

  const addressLines = [
    shippingAddress.name,
    shippingAddress.address,
    [shippingAddress.city, shippingAddress.state].filter(Boolean).join(", "),
    shippingAddress.postalCode,
    shippingAddress.country,
  ]
    .filter(Boolean)
    .join("<br>")

  const content = `
    ${userName ? `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">Hello ${userName},</p>` : ""}
    <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#1a1a1a;">
      Great news — your payment request has been fulfilled.
    </p>
    <p style="margin:0 0 24px;font-size:14px;color:#666666;">
      <strong style="color:#1a1a1a;">${payerEmail}</strong> has paid for your order. We're now processing it.
    </p>
    <p style="margin:0 0 6px;font-size:14px;color:#666666;">
      Order number: <strong style="color:#1a1a1a;">${orderNumber}</strong>
    </p>

    ${orderItemsTable(items)}

    <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#666666;">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">${formatCurrency(subtotal)}</td>
      </tr>
      ${discount > 0 ? `<tr><td style="padding:6px 0;font-size:14px;color:#666666;">Discount</td><td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">−${formatCurrency(discount)}</td></tr>` : ""}
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#666666;">Shipping</td>
        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">${shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#1a1a1a;border-top:2px solid #e5e5e5;">Total</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#1a1a1a;text-align:right;border-top:2px solid #e5e5e5;">${formatCurrency(total)}</td>
      </tr>
    </table>

    <div style="margin-top:30px;padding:20px;background-color:#f9f9f9;border-radius:2px;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#999999;">Delivering to</p>
      <p style="margin:0;font-size:14px;line-height:1.8;color:#1a1a1a;">${addressLines}</p>
    </div>

    ${ctaButton(orderUrl, "View Order")}

    <p style="margin:0;font-size:13px;line-height:1.6;color:#999999;">
      We'll send you a shipping notification once your order is on its way.
    </p>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your payment request was fulfilled — ${orderNumber}`,
      html: emailWrapper(content),
    })
    if (error) {
      console.error("Resend error (payment request fulfilled):", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to send payment request fulfilled email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

/**
 * Sent to the payer after they complete payment for someone else's request.
 */
export async function sendPayerConfirmationEmail(
  payerEmail: string,
  orderNumber: string,
  requesterName: string | null,
  details: PaymentRequestEmailDetails
) {
  const { items, subtotal, discount = 0, shippingCost = 0, total } = details

  const content = `
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">
      Thank you for your payment.
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#666666;">
      You've successfully paid for ${requesterName ? `<strong style="color:#1a1a1a;">${requesterName}</strong>'s` : "someone's"} order. They'll be notified and we'll begin processing immediately.
    </p>
    <p style="margin:0 0 6px;font-size:14px;color:#666666;">
      Order number: <strong style="color:#1a1a1a;">${orderNumber}</strong>
    </p>

    ${orderItemsTable(items)}

    <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:8px;">
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#666666;">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">${formatCurrency(subtotal)}</td>
      </tr>
      ${discount > 0 ? `<tr><td style="padding:6px 0;font-size:14px;color:#666666;">Discount</td><td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">−${formatCurrency(discount)}</td></tr>` : ""}
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#666666;">Shipping</td>
        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">${shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#1a1a1a;border-top:2px solid #e5e5e5;">Total paid</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#1a1a1a;text-align:right;border-top:2px solid #e5e5e5;">${formatCurrency(total)}</td>
      </tr>
    </table>

    <p style="margin:30px 0 0;font-size:13px;line-height:1.6;color:#999999;">
      This is a payment confirmation only. The order will be delivered to the requester's address. Thank you for your generosity!
    </p>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: payerEmail,
      subject: `Payment confirmed — ${orderNumber}`,
      html: emailWrapper(content),
    })
    if (error) {
      console.error("Resend error (payer confirmation):", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to send payer confirmation email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

/**
 * Sent to admin when a payment request is fulfilled.
 */
export async function sendAdminPaymentRequestNotification(
  adminEmail: string,
  orderNumber: string,
  requesterEmail: string,
  payerEmail: string,
  total: number
) {
  const adminOrderUrl = `${SITE_URL}/admin/orders`

  const content = `
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">
      A "Pay For Me" request has been fulfilled.
    </p>
    <table role="presentation" style="width:100%;border-collapse:collapse;margin:20px 0;background-color:#f9f9f9;border-radius:2px;padding:20px;">
      <tr><td style="padding:6px 0;font-size:14px;color:#666666;">Order Number</td><td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;font-weight:600;">${orderNumber}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#666666;">Requester</td><td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">${requesterEmail}</td></tr>
      <tr><td style="padding:6px 0;font-size:14px;color:#666666;">Paid by</td><td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">${payerEmail}</td></tr>
      <tr>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#1a1a1a;border-top:2px solid #e5e5e5;">Total</td>
        <td style="padding:12px 0 0;font-size:16px;font-weight:600;color:#1a1a1a;text-align:right;border-top:2px solid #e5e5e5;">${formatCurrency(total)}</td>
      </tr>
    </table>
    ${ctaButton(adminOrderUrl, "View in Admin")}
  `

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `[Admin] Pay-For-Me order fulfilled — ${orderNumber}`,
      html: emailWrapper(content),
    })
    if (error) {
      console.error("Resend error (admin payment request):", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to send admin payment request notification:", error)
    return { success: false, error: "Failed to send email" }
  }
}

/**
 * Sent to the requester with their shareable payment link.
 */
export async function sendPaymentRequestLinkEmail(
  email: string,
  token: string,
  total: number,
  itemCount: number,
  userName?: string | null
) {
  const payUrl = `${SITE_URL}/pay/${token}`

  const content = `
    ${userName ? `<p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#1a1a1a;">Hello ${userName},</p>` : ""}
    <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:#1a1a1a;">
      Your payment request has been created.
    </p>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#666666;">
      Share the link below with the person you'd like to pay for your ${itemCount} item${itemCount !== 1 ? "s" : ""} totalling <strong style="color:#1a1a1a;">${formatCurrency(total)}</strong>. The link is valid for 48 hours.
    </p>

    ${ctaButton(payUrl, "Share Payment Link")}

    <p style="margin:20px 0 8px;font-size:13px;line-height:1.6;color:#666666;">Or copy this link:</p>
    <p style="margin:0 0 24px;font-size:13px;line-height:1.6;color:#666666;word-break:break-all;">
      <a href="${payUrl}" style="color:#1a1a1a;">${payUrl}</a>
    </p>

    <p style="margin:0;font-size:13px;line-height:1.6;color:#999999;padding-top:20px;border-top:1px solid #e5e5e5;">
      This link can only be used once. Once paid, it will be deactivated automatically.
      You can cancel it from your account if needed.
    </p>`

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your payment request link — ${formatCurrency(total)}`,
      html: emailWrapper(content),
    })
    if (error) {
      console.error("Resend error (payment request link):", error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error("Failed to send payment request link email:", error)
    return { success: false, error: "Failed to send email" }
  }
}
