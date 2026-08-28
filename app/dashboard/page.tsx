'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { Button } from '@/components/ui'
import { WaitlistLogo } from '@/components/waitlist/waitlist-logo'
import { clearSession, getAccessToken, getRefreshToken } from '@/lib/auth-session'
import { useMe } from '@/lib/queries'
import { requests } from '@/lib/requests'

function DashboardPage() {
  const router = useRouter()
  const me = useMe()

  // Nothing signed in — the 401 interceptor already gave the refresh token its
  // one chance before clearing the session.
  useEffect(() => {
    if (!getAccessToken()) router.replace('/login')
  }, [router])

  async function handleSignOut() {
    const refreshToken = getRefreshToken()
    try {
      // Revoking is best-effort: the API treats logout as idempotent, and the
      // local session has to end either way.
      if (refreshToken) await requests.logout({ refresh_token: refreshToken })
    } finally {
      clearSession()
      router.replace('/login')
    }
  }

  const greeting = me.data?.first_name || me.data?.legal_full_name || me.data?.email

  return (
    <div className="relative flex min-h-dvh flex-col bg-bg-secondary px-[24px] pb-[24px] pt-[32px]">
      <header className="flex shrink-0 items-center justify-between gap-[16px]">
        <WaitlistLogo />
        <Button variant="secondary" accent="default" size="md" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-[8px]">
        <h1 className="text-heading-3 font-semibold tracking-wide text-text-primary">DASHBOARD</h1>
        {greeting ? (
          <p className="text-body-l font-medium leading-21 text-text-secondary">
            Signed in as {greeting}
          </p>
        ) : null}
      </main>
    </div>
  )
}

export default DashboardPage
