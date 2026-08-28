'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { clearInviteContext, getInviteContext } from '@/components/auth/flow-storage'
import { StepInviteJoin, type InviteJoinValues } from '@/components/auth/steps/step-invite-join'
import { useInviteContext } from '@/components/auth/use-flow-storage'
import { applyApiError } from '@/lib/api-error'
import { landAfterLogin } from '@/lib/auth-session'
import { useAcceptInvite } from '@/lib/mutations'

function InviteJoinPage() {
  const router = useRouter()
  const invite = useInviteContext()
  const acceptInvite = useAcceptInvite()
  const [formError, setFormError] = useState<string>()

  // Landed here without going through /invite first — no token to redeem.
  // Reads storage, not the hook value: the first commit after a fresh load still
  // holds the server snapshot (undefined), which would bounce a valid visitor.
  useEffect(() => {
    if (!getInviteContext()?.token) router.replace('/invite')
  }, [router])

  async function handleContinue(values: InviteJoinValues) {
    const token = getInviteContext()?.token
    if (!token) {
      setFormError('This invite is no longer available. Open the link from your email again.')
      return
    }

    setFormError(undefined)
    try {
      const tokens = await acceptInvite.mutateAsync({
        token,
        password: values.password,
        first_name: values.firstName,
        last_name: values.lastName,
      })
      // An invitee joins an existing workspace, so the API marks onboarding
      // complete and landAfterLogin sends them past the owner wizard.
      clearInviteContext()
      router.push(landAfterLogin(tokens))
    } catch (err) {
      setFormError(
        applyApiError(err, undefined, {}, 'We could not complete your invite. Please try again.'),
      )
    }
  }

  if (!invite?.token) {
    return null
  }

  return (
    <AuthShell>
      <StepInviteJoin
        submitting={acceptInvite.isPending}
        formError={formError}
        onContinue={handleContinue}
        onBack={() => router.push('/invite')}
      />
    </AuthShell>
  )
}

export default InviteJoinPage
