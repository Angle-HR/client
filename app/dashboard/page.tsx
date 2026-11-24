'use client'

import { useRouter } from 'next/navigation'

import { DashboardErrorState, WelcomeEmptyState } from '@/components/dashboard/dashboard-states'
import { useKyb, useMe } from '@/lib/queries'

function DashboardPage() {
  const router = useRouter()
  const me = useMe()
  const kyb = useKyb()

  if (me.isError) {
    // Offline is its own state in the design; anything else is the generic
    // failure, which is the only one that offers support.
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false
    return (
      <DashboardErrorState
        kind={offline ? 'connection' : 'unknown'}
        onContactSupport={() => router.push('/login/help')}
        onRetry={() => void me.refetch()}
      />
    )
  }

  // The organization's verification decides it (a company's KYB or an individual's identity review). Until
  // it has loaded, or where none can be read, completing onboarding counts as verified, as in the layout.
  const verification = kyb.data
    ? kyb.data.status === 'verified'
      ? 'verified'
      : 'pending'
    : me.data?.onboarding?.status === 'completed'
      ? 'verified'
      : 'pending'

  return (
    <WelcomeEmptyState
      verification={verification}
      onCreateJob={() => router.push('/dashboard/jobs')}
    />
  )
}

export default DashboardPage
