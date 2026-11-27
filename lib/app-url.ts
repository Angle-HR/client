/**
 * Address of the app for links that sit on the static landing site, which is served from a different host
 * (tryopenhr.com) than the app. NEXT_PUBLIC_APP_URL is read at build time. Unset means same origin, so the same
 * components work unchanged inside the app itself.
 */
function appUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/+$/, '')
  return `${base}${path}`
}

export { appUrl }
