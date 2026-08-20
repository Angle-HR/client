'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { setInviteContext } from '@/components/auth/flow-storage'
import { InviteAcceptFooter, StepInviteAccept } from '@/components/auth/steps/step-invite-accept'
import { useInviteContext } from '@/components/auth/use-flow-storage'

const DEFAULT_COMPANY = 'Acme Inc'
const DEFAULT_EMAIL = 'jerryoluwasegun3@gmail.com'

function InvitePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromStorage = useInviteContext()

  // The invite link's query params win over whatever a previous visit stored.
  const invite = useMemo(
    () => ({
      companyName:
        searchParams.get('company')?.trim() || fromStorage?.companyName || DEFAULT_COMPANY,
      email: searchParams.get('email')?.trim() || fromStorage?.email || DEFAULT_EMAIL,
      showGdprDisclaimer:
        searchParams.get('gdpr') === '1' ||
        searchParams.get('region')?.toLowerCase() === 'de' ||
        fromStorage?.showGdprDisclaimer === true,
    }),
    [searchParams, fromStorage],
  )

  // Carried forward so /invite/join keeps the same context without the query.
  useEffect(() => {
    setInviteContext(invite)
  }, [invite])

  return (
    <AuthShell
      footer={
        <InviteAcceptFooter
          companyName={invite.companyName}
          showGdprDisclaimer={invite.showGdprDisclaimer}
        />
      }
    >
      {/* The GDPR disclaimer belongs to InviteAcceptFooter, above. */}
      <StepInviteAccept
        companyName={invite.companyName}
        email={invite.email}
        onContinue={() => router.push('/invite/join')}
      />
    </AuthShell>
  )
}

function InvitePage() {
  return (
    <Suspense fallback={null}>
      <InvitePageContent />
    </Suspense>
  )
}

export default InvitePage
