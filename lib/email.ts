import { Resend } from "resend"

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Email configuration
const FROM_EMAIL = "noreply@dachhomeandbody.com"
const SITE_NAME = "Dachhomeandbody"

/**
 * Send password reset email with secure token link
 * @param email - Recipient email address
 * @param resetToken - Secure reset token
 * @param userName - User's name (optional)
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName?: string | null
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Reset your ${SITE_NAME} password`,
      html: getPasswordResetEmailTemplate(resetUrl, userName),
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

/**
 * Password reset email template
 * Luxury design matching the brand aesthetic
 */
function getPasswordResetEmailTemplate(
  resetUrl: string,
  userName?: string | null
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9f9f9;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e5e5;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 2px; color: #1a1a1a; text-transform: uppercase;">
                ${SITE_NAME}
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${userName ? `<p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #1a1a1a;">Hello ${userName},</p>` : ""}
              
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #1a1a1a;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; border-radius: 2px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; font-size: 14px; line-height: 1.6; color: #666666;">
                Or copy and paste this link into your browser:
              </p>
              
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #666666; word-break: break-all;">
                <a href="${resetUrl}" style="color: #1a1a1a; text-decoration: underline;">
                  ${resetUrl}
                </a>
              </p>
              
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                This link will expire in 1 hour for security reasons.
              </p>
              
              <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f9f9f9; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; line-height: 1.6; color: #999999;">
                © ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Send order confirmation email
 * @param email - Recipient email address
 * @param orderNumber - Order number
 * @param orderDetails - Order details object
 */
export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  orderDetails: {
    items: Array<{ name: string; quantity: number; price: number }>
    total: number
    shippingAddress: any
  }
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Order Confirmation - ${orderNumber}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order ${orderNumber} has been confirmed.</p>
        <p>We'll send you a shipping notification when your order is on its way.</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send order confirmation email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

/**
 * Send shipping notification email
 * @param email - Recipient email address
 * @param orderNumber - Order number
 * @param trackingNumber - Tracking number (optional)
 */
export async function sendShippingNotificationEmail(
  email: string,
  orderNumber: string,
  trackingNumber?: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your order ${orderNumber} has shipped`,
      html: `
        <h1>Your order is on its way!</h1>
        <p>Order ${orderNumber} has been shipped.</p>
        ${trackingNumber ? `<p>Tracking number: ${trackingNumber}</p>` : ""}
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send shipping notification email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

/**
 * Send delivery confirmation email
 * @param email - Recipient email address
 * @param orderNumber - Order number
 */
export async function sendDeliveryConfirmationEmail(
  email: string,
  orderNumber: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your order ${orderNumber} has been delivered`,
      html: `
        <h1>Your order has been delivered!</h1>
        <p>Order ${orderNumber} has been successfully delivered.</p>
        <p>We hope you enjoy your purchase!</p>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send delivery confirmation email:", error)
    return { success: false, error: "Failed to send email" }
  }
}
