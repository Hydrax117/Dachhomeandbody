/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.dachhomeandbody.com",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      // Block all crawlers from private/admin areas
      {
        userAgent: "*",
        disallow: [
          "/admin",
          "/account",
          "/checkout",
          "/auth",
          "/api",
          "/pay",
        ],
      },
      // Allow everything else
      { userAgent: "*", allow: "/" },
    ],
    additionalSitemaps: [
      "https://www.dachhomeandbody.com/server-sitemap.xml",
    ],
  },
  // Exclude private routes from the static sitemap
  exclude: [
    "/admin/*",
    "/account/*",
    "/checkout/*",
    "/auth/*",
    "/api/*",
    "/pay/*",
    "/test-link",
    "/server-sitemap.xml",
  ],
  // Default change frequency and priority for static pages
  changefreq: "weekly",
  priority: 0.7,
  // Per-path overrides
  transform: async (config, path) => {
    // Homepage
    if (path === "/") {
      return {
        loc: path,
        changefreq: "daily",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }
    // Shop index and gift box — high traffic pages
    if (path === "/shop" || path === "/gift-box") {
      return {
        loc: path,
        changefreq: "daily",
        priority: 0.9,
        lastmod: new Date().toISOString(),
      }
    }
    // About page
    if (path === "/about") {
      return {
        loc: path,
        changefreq: "monthly",
        priority: 0.6,
        lastmod: new Date().toISOString(),
      }
    }
    // Default transform for everything else
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}
