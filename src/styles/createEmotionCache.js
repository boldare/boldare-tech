import createCache from "@emotion/cache";

// MUI 9 styles through Emotion. Both entry points must use a cache with the same
// key, or the class names in the server HTML will not match the ones the client
// generates and React 18 will discard the whole server tree on hydration.
// `prepend` keeps MUI's styles ahead of the app's own JSS, preserving the
// specificity order MUI v3 had via its sheetsManager.
export default function createEmotionCache() {
  return createCache({ key: "mui", prepend: true });
}
