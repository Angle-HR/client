'use client'

import { useRouter } from 'next/navigation'

import { DashboardErrorState, WelcomeEmptyState } from '@/components/dashboard/dashboard-states'
import { useMe } from '@/lib/queries'

function DashboardPage() {
  const router = useRouter()
  const me = useMe()

  if (me.isError) {
    // Offline is its own state in the design; anything else is the generic
    // failure, which is the only one that offers support.
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false
    return (
      <DashboardErrorState
        kind={offline ? 'connection' : 'unknown'}
        onContactSupport={() => router.push('/login/help')}
      />
    )
  }

  // KYB status is not on the API yet (backend flagged it as out of scope until
  // job-publish gating), so a workspace is treated as still under review until
  // it says otherwise.
  const verification = me.data?.onboarding?.status === 'completed' ? 'verified' : 'pending'

  return (
    <WelcomeEmptyState
      verification={verification}
      onCreateJob={() => router.push('/dashboard/jobs')}
    />
  )
}

export default DashboardPage
