// Plain CommonJS on purpose: gatsby-config.js requires this at build time in
// Node, while the components import it through webpack.

// The pattern gatsby-link uses to spot a URL it must not prefix
// (node_modules/gatsby-link/dist/index.js), plus protocol-relative URLs, which
// that pattern does not cover.
const ABSOLUTE_URL = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

function isAbsoluteUrl(value) {
  return ABSOLUTE_URL.test(value) || value.startsWith("//");
}

// Prefix a site-relative asset path, and leave an already-absolute URL alone.
//
// Decap's image widget accepts "insert from URL", so a post's `cover` is not
// always the `/img/...` path `public_folder` implies -- one pasted Cloudinary
// URL used to come back out as ".../tech-bloghttps://res.cloudinary.com/...",
// which 404s. Anything that is not a non-empty string is returned untouched:
// `cover` is a required CMS field, so a missing one is already a broken post
// and not something to paper over here.
function resolveAssetUrl(base, value) {
  if (typeof value !== "string" || !value) return value;
  return isAbsoluteUrl(value) ? value : `${base}${value}`;
}

module.exports = { isAbsoluteUrl, resolveAssetUrl };
