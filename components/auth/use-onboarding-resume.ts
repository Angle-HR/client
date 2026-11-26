'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { isUnauthorized } from '@/lib/api-error'
import { routeForOnboarding } from '@/lib/auth-session'
import { useMe, useOnboardingStatus } from '@/lib/queries'

/**
 * Keeps every onboarding page on the step the server says the user is on.
 *
 * This is the *only* gate on these pages. The draft in sessionStorage supplies
 * form defaults and nothing else: it is a convenience for one sitting, and it
 * disagrees with the server the moment someone switches device or clears their
 * browser. Two gates reading two sources would bounce a visitor between them,
 * so there is one gate and one source.
 *
 * `checking` covers both "still asking" and "about to move you", so a page can
 * render nothing rather than flash a step the user is being taken off.
 */
function useOnboardingResume(): { checking: boolean } {
  const router = useRouter()
  const pathname = usePathname()
  // The account query is the session check: it answers 401 without a session,
  // and it is what hands this page its CSRF token after a reload.
  const me = useMe()
  const status = useOnboardingStatus()
  const signedOut = isUnauthorized(me.error) || isUnauthorized(status.error)

  const target = status.data ? routeForOnboarding(status.data) : null
  const redirecting = target !== null && target !== pathname

  useEffect(() => {
    if (signedOut) router.replace('/login')
    else if (redirecting && target) router.replace(target)
  }, [signedOut, redirecting, target, router])

  // Any other failed call leaves the page rendered rather than stuck: it is a
  // transient error the step's own submit will surface.
  return { checking: status.isPending || redirecting || signedOut }
}

export { useOnboardingResume }
