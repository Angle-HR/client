'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardSettingUpState } from '@/components/dashboard/dashboard-states'
import { clearSession, getAccessToken, getRefreshToken } from '@/lib/auth-session'
import { useMe } from '@/lib/queries'
import { requests } from '@/lib/requests'

import type { ReactNode } from 'react'

function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const me = useMe()
  const [collapsed, setCollapsed] = useState(false)

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

  const workspaceName =
    me.data?.legal_full_name || me.data?.first_name || me.data?.email || 'Your workspace'

  // KYB status is not on the API yet, so a workspace counts as still under
  // review until onboarding reports itself complete.
  const verification = me.data?.onboarding?.status === 'completed' ? 'verified' : 'pending'

  // The setup screen replaces the whole shell, so it centres on the viewport
  // rather than in the content card beside the sidebar.
  if (me.isPending) return <DashboardSettingUpState />

  return (
    <div className="flex h-dvh w-full bg-bg-primary">
      <DashboardSidebar
        workspaceName={workspaceName}
        collapsed={collapsed}
        verification={verification}
        onToggleCollapsed={() => setCollapsed((previous) => !previous)}
        onSignOut={() => void handleSignOut()}
      />
      {/* The frame insets the content card 5px from the shell on three sides
          and gives it its own surface, hairline and 10px radius. The hairline
          is an inset outline so it takes no layout space, like a Figma stroke;
          a real border would push every child half a pixel off the design. */}
      <main className="flex min-w-0 flex-1 flex-col py-[5px] pr-[5px]">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-lg-10 bg-bg-secondary outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
