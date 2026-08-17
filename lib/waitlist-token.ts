const STORAGE_KEY = 'waitlistToken'

/** Stash the token from a join-waitlist call so /survey can attach to that signup. */
function storeWaitlistToken(token: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(STORAGE_KEY, token)
}

/**
 * Resolve the waitlist token for an onboarding submission. Two ways in, so two
 * sources: `?token=` is how the survey link in the signup email arrives, and
 * sessionStorage is set by the join-waitlist call when the survey is reached
 * straight from the landing page. A token found in the URL is persisted, so the
 * address bar is no longer needed to carry it.
 *
 * Safe to call during render — it only reads. Removing the token from the URL is
 * `stripWaitlistTokenFromUrl`'s job, and has to happen later.
 */
function resolveWaitlistToken(): string {
  if (typeof window === 'undefined') return ''

  const fromUrl = new URLSearchParams(window.location.search).get('token')?.trim()
  if (fromUrl) {
    storeWaitlistToken(fromUrl)
    return fromUrl
  }

  const stored = sessionStorage.getItem(STORAGE_KEY)
  if (!stored) {
    console.error('No waitlist token in the URL or sessionStorage; submission may fail.')
  }
  return stored ?? ''
}

/**
 * Drop `?token=` from the address bar, keeping any other query params. Query
 * strings ride along into analytics `page_location`, referrer headers and proxy
 * access logs, and this token is what ties a submission to a signup — it has no
 * business being in any of them.
 *
 * Must run from an effect, never during render: the App Router re-syncs the URL
 * as it hydrates, silently undoing any history mutation made before that point.
 */
function stripWaitlistTokenFromUrl(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  if (!params.has('token')) return

  params.delete('token')
  const query = params.toString()
  const url = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  window.history.replaceState(window.history.state, '', url)
}

export { resolveWaitlistToken, storeWaitlistToken, stripWaitlistTokenFromUrl }
