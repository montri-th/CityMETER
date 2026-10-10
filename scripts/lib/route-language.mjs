/** Localized public routes own their language; preferences and query strings do not override their canonical. */
export function languageForPath(pathname) {
  return /\/en\/?(?:index\.html)?$/.test(pathname) ? "en" : "th";
}
