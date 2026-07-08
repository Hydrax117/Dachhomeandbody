/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.dachhomeandbody.com",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      // Block all crawlers from private/admin areas
      {
        userAgent: "*",
        disallow: ["/admin", "/account", "/checkout", "/auth", "/api", "/pay"],
      },
      // Allow everything else for all crawlers
      { userAgent: "*", allow: "/" },

      // ── AI / LLM crawlers — explicitly allowed for GEO ──────────────────
      // These bots power AI search (ChatGPT, Perplexity, Claude, Gemini)
      // and need access to cite DACH Home & Body accurately.

      { userAgent: "GPTBot",               allow: "/" }, // OpenAI / ChatGPT
      { userAgent: "ChatGPT-User",         allow: "/" }, // ChatGPT browsing
      { userAgent: "anthropic-ai",         allow: "/" }, // Anthropic / Claude
      { userAgent: "ClaudeBot",            allow: "/" }, // Claude web search
      { userAgent: "Google-Extended",      allow: "/" }, // Gemini + AI Overviews
      { userAgent: "PerplexityBot",        allow: "/" }, // Perplexity AI
      { userAgent: "Meta-ExternalAgent",   allow: "/" }, // Meta AI
      { userAgent: "Applebot-Extended",    allow: "/" }, // Apple Intelligence
      { userAgent: "Cohere-ai",            allow: "/" }, // Cohere
      { userAgent: "YouBot",               allow: "/" }, // You.com AI
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
  changefreq: "weekly",
  priority: 0.7,
  transform: async (config, path) => {
    if (path === "/") {
      return { loc: path, changefreq: "daily", priority: 1.0, lastmod: new Date().toISOString() }
    }
    if (path === "/shop" || path === "/gift-box") {
      return { loc: path, changefreq: "daily", priority: 0.9, lastmod: new Date().toISOString() }
    }
    if (path === "/about" || path === "/faq") {
      return { loc: path, changefreq: "monthly", priority: 0.6, lastmod: new Date().toISOString() }
    }
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    }
  },
}
