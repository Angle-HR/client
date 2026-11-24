'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar'
import { DashboardSettingUpState } from '@/components/dashboard/dashboard-states'
import { clearSession } from '@/lib/auth-session'
import { useKyb, useMe } from '@/lib/queries'
import { requests } from '@/lib/requests'

import type { ReactNode } from 'react'

function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const me = useMe()
  const [collapsed, setCollapsed] = useState(false)

  // Nothing signed in: the session cookie is missing, expired or revoked, so
  // the account request answers 401.
  const signedOut = axios.isAxiosError(me.error) && me.error.response?.status === 401
  useEffect(() => {
    if (signedOut) router.replace('/login')
  }, [router, signedOut])

  async function handleSignOut() {
    try {
      // Revoking is best-effort: the API treats logout as idempotent, and the
      // local session has to end either way.
      await requests.logout()
    } finally {
      clearSession()
      router.replace('/login')
    }
  }

  const workspaceName =
    me.data?.legal_full_name || me.data?.first_name || me.data?.email || 'Your workspace'

  // The company's KYB state decides it; until that has loaded, or where none can
  // be read, a workspace counts as still under review until onboarding completes.
  const kyb = useKyb()
  const verification = kyb.data
    ? kyb.data.status === 'verified'
      ? 'verified'
      : 'pending'
    : me.data?.onboarding?.status === 'completed'
      ? 'verified'
      : 'pending'

  // The setup screen replaces the whole shell, so it centres on the viewport
  // rather than in the content card beside the sidebar.
  // Only for the first load. A query that has failed goes back to "pending"
  // each time something asks for it again, and swapping the shell out for the
  // setup screen then would unmount the page, which asks again when it
  // remounts — an endless loop of requests behind a screen that never clears.
  if (me.isPending && me.errorUpdateCount === 0) return <DashboardSettingUpState />

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
