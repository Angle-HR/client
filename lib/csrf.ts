/**
 * The CSRF token paired with the session cookie. Held in module memory only: it
 * is never written to storage, so a reload starts without one and `/auth/me`
 * hands out a fresh one.
 */
let csrfToken: string | null = null

function getCsrfToken(): string | null {
  return csrfToken
}

function setCsrfToken(token: string): void {
  csrfToken = token
}

function clearCsrfToken(): void {
  csrfToken = null
}

export { clearCsrfToken, getCsrfToken, setCsrfToken }
