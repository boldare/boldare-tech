const colors = require("../../src/styles/colors");

module.exports = {
  homeTitle: "Boldare",
  siteTitle: "Boldare Tech Blog",
  shortSiteTitle: "Boldare Tech",
  siteDescription: `Development tips && tricks. From devs. For devs.
Any helpful contributions are welcome. 3 lines, 3 paragraphs? Doesn’t matter.`,
  homeDescription: "Boldare: Digital Product Design & Development Company",
  siteUrl: "https://tech.boldare.com/",
  homeUrl: "https://boldare.com",
  pathPrefix: "/tech-blog/",
  assetPrefix: `https://tech.boldare.com/tech-blog/"`,
  siteImage: "/avatar.jpg",
  siteLanguage: "en",
  // author
  authorName: "Boldare",
  authorTwitterAccount: "boldare_tech",
  homeTwitterAccount: "boldare",
  // info
  infoTitle: "Tech blog",
  infoTitleNote: "by Boldare",
  // manifest.json
  manifestName: "Boldare Tech Blog",
  manifestShortName: "BLDR-TechBlog", // max 12 characters
  manifestStartUrl: "/",
  manifestBackgroundColor: colors.bg,
  manifestThemeColor: colors.bg,
  manifestDisplay: "standalone",
  // social
  authorSocialLinks: [
    { name: "github", url: "https://github.com/boldare" },
    { name: "twitter", url: "https://twitter.com/boldare_tech" },
    { name: "facebook", url: "https://www.facebook.com/boldarecom/" }
  ],
  algolia: {
    appId: process.env.ALGOLIA_APP_ID || "",
    adminApiKey: process.env.ALGOLIA_ADMIN_API_KEY || "",
    searchOnlyApiKey: process.env.ALGOLIA_SEARCH_ONLY_API_KEY || "",
    indexName: process.env.ALGOLIA_INDEX_NAME || ""
  },
  facebook: {
    appId: process.env.FB_APP_ID || ""
  },
  google: {
    analyticsId: process.env.GOOGLE_ANALYTICS_ID || ""
  }
};
