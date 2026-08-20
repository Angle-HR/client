'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { getInviteContext } from '@/components/auth/flow-storage'
import { StepInviteJoin, type InviteJoinValues } from '@/components/auth/steps/step-invite-join'
import { useInviteContext } from '@/components/auth/use-flow-storage'

function InviteJoinPage() {
  const router = useRouter()
  const invite = useInviteContext()

  // Landed here without going through /invite first — no context to join with.
  // Reads storage, not the hook value: the first commit after a fresh load still
  // holds the server snapshot (undefined), which would bounce a valid visitor.
  useEffect(() => {
    if (!getInviteContext()?.email) router.replace('/invite')
  }, [router])

  if (!invite?.email) {
    return null
  }

  function handleContinue(_values: InviteJoinValues) {
    void _values
    router.push('/onboarding/setup')
  }

  return (
    <AuthShell>
      <StepInviteJoin onContinue={handleContinue} onBack={() => router.push('/invite')} />
    </AuthShell>
  )
}

export default InviteJoinPage
