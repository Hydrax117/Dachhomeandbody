/**
 * Shared promotional email HTML builder.
 * Used by both the admin campaign composer and the automated weekly cron.
 *
 * Cards use fixed heights throughout so every row is perfectly aligned
 * regardless of product name length or image size.
 */

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://dachhomeandbody.com"

// Fixed dimensions — every card is identical height
const IMAGE_H = 200   // px — image cell
const NAME_H  = 44    // px — product name cell (2 lines max)
const PRICE_H = 24    // px — price cell
const BTN_H   = 36    // px — button cell

export interface EmailProduct {
  name: string
  price: number
  slug: string
  image: string
}

export interface CampaignEmailParams {
  headline: string
  bodyText?: string
  ctaLabel?: string
  ctaUrl?: string
  products: EmailProduct[]
}

function productCard(p: EmailProduct): string {
  const url    = `${SITE_URL}/shop/${p.slug}`
  const imgHtml = p.image
    ? `<img src="${p.image}" alt="${p.name}" width="170" height="${IMAGE_H}"
         style="width:170px;height:${IMAGE_H}px;object-fit:cover;display:block;border:none;" />`
    : `<div style="width:170px;height:${IMAGE_H}px;background-color:#F2EDE8;display:block;"></div>`

  // Truncate long names to 2 lines via fixed height + overflow hidden
  return `
<td style="padding:0 6px 24px;vertical-align:top;width:33%;" align="center">

  <!-- IMAGE — fixed 200px -->
  <a href="${url}" style="text-decoration:none;display:block;line-height:0;">
    ${imgHtml}
  </a>

  <!-- NAME — fixed 44px, 2-line max -->
  <a href="${url}" style="
      text-decoration:none;
      display:block;
      height:${NAME_H}px;
      overflow:hidden;
      padding:10px 4px 0;
      font-family:Georgia,'Times New Roman',serif;
      font-size:13px;
      line-height:1.4;
      color:#111111;
      text-align:center;
  ">${p.name}</a>

  <!-- PRICE — fixed 24px -->
  <p style="
      margin:0;
      height:${PRICE_H}px;
      line-height:${PRICE_H}px;
      font-family:Georgia,'Times New Roman',serif;
      font-size:13px;
      font-weight:600;
      color:#B8965C;
      text-align:center;
      padding:0 4px;
  ">&#8358;${p.price.toLocaleString("en-NG")}</p>

  <!-- BUTTON — fixed 36px -->
  <div style="height:${BTN_H}px;display:block;text-align:center;padding-top:6px;">
    <a href="${url}" style="
        display:inline-block;
        padding:7px 20px;
        background-color:#111111;
        color:#ffffff;
        text-decoration:none;
        font-family:Arial,Helvetica,sans-serif;
        font-size:10px;
        letter-spacing:1.5px;
        text-transform:uppercase;
        line-height:1;
    ">Shop</a>
  </div>

</td>`
}

function buildRows(products: EmailProduct[]): string {
  const rows: string[] = []
  for (let i = 0; i < products.length; i += 3) {
    const chunk = products.slice(i, i + 3)
    // Pad to 3 with empty cells so the row is always balanced
    while (chunk.length < 3) chunk.push({ name: "", price: 0, slug: "", image: "" })
    const cells = chunk
      .map((p) => p.name ? productCard(p) : `<td style="padding:0 6px 24px;width:33%;"></td>`)
      .join("")
    rows.push(`<tr>${cells}</tr>`)
  }
  return rows.join("\n")
}

export function buildCampaignEmail(params: CampaignEmailParams): string {
  const {
    headline,
    bodyText,
    ctaLabel = "Shop All Products",
    ctaUrl = "/shop",
    products,
  } = params

  const fullCtaUrl = ctaUrl.startsWith("http") ? ctaUrl : `${SITE_URL}${ctaUrl}`
  const year = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F5F2;font-family:Arial,Helvetica,sans-serif;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background-color:#F8F5F2;">
  <tr>
    <td align="center" style="padding:40px 16px;">

      <!-- Email shell -->
      <table role="presentation" width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;background-color:#ffffff;">

        <!-- ── HEADER ── -->
        <tr>
          <td style="padding:36px 40px 20px;text-align:center;
                     border-bottom:1px solid #EBEBEB;">
            <a href="${SITE_URL}" style="text-decoration:none;">
              <span style="font-family:Georgia,'Times New Roman',serif;
                           font-size:19px;font-weight:400;
                           letter-spacing:5px;color:#111111;
                           text-transform:uppercase;">
                DACH Home &amp; Body
              </span>
            </a>
          </td>
        </tr>

        <!-- ── HEADLINE ── -->
        <tr>
          <td style="padding:40px 40px 8px;text-align:center;">
            <h1 style="margin:0;
                       font-family:Georgia,'Times New Roman',serif;
                       font-size:30px;font-weight:300;
                       color:#111111;line-height:1.2;">
              ${headline}
            </h1>
          </td>
        </tr>

        ${bodyText ? `
        <!-- ── BODY TEXT ── -->
        <tr>
          <td style="padding:14px 48px 4px;text-align:center;">
            <p style="margin:0;font-size:15px;line-height:1.85;color:#666666;">
              ${bodyText}
            </p>
          </td>
        </tr>` : ""}

        <!-- ── GOLD RULE ── -->
        <tr>
          <td style="padding:28px 40px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="height:1px;background-color:#B8965C;opacity:0.35;
                           font-size:0;line-height:0;">&nbsp;</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ── PRODUCT GRID ── -->
        <tr>
          <td style="padding:0 28px 8px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              ${buildRows(products)}
            </table>
          </td>
        </tr>

        <!-- ── MAIN CTA ── -->
        <tr>
          <td style="padding:12px 40px 44px;text-align:center;">
            <a href="${fullCtaUrl}"
               style="display:inline-block;
                      padding:16px 52px;
                      background-color:#B8965C;
                      color:#111111;
                      text-decoration:none;
                      font-family:Arial,Helvetica,sans-serif;
                      font-size:11px;font-weight:700;
                      letter-spacing:2.5px;text-transform:uppercase;">
              ${ctaLabel}
            </a>
          </td>
        </tr>

        <!-- ── FOOTER ── -->
        <tr>
          <td style="padding:24px 40px;text-align:center;
                     background-color:#F8F5F2;
                     border-top:1px solid #EBEBEB;">
            <p style="margin:0 0 5px;font-size:11px;color:#999999;">
              &copy; ${year} DACH Home &amp; Body &middot; Abuja, Nigeria
            </p>
            <p style="margin:0;font-size:11px;color:#999999;">
              You&rsquo;re receiving this because you subscribed or have an account.
            </p>
          </td>
        </tr>

      </table>
      <!-- /Email shell -->

    </td>
  </tr>
</table>

</body>
</html>`
}
