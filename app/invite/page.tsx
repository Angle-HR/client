'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { setInviteContext } from '@/components/auth/flow-storage'
import { InviteAcceptFooter, StepInviteAccept } from '@/components/auth/steps/step-invite-accept'
import { BannerSmall } from '@/components/ui'
import { getApiError } from '@/lib/api-error'
import { useInvite } from '@/lib/queries'

import type { AxiosError } from 'axios'

/** The invite email links to {APP_URL}/invite?token=... */
function messageForInviteError(error: unknown): string {
  const status = (error as AxiosError | null)?.response?.status
  if (status === 410) return 'This invite has expired or has already been used.'
  if (status === 404) return 'We could not find this invite. Check the link in your email.'
  return getApiError(error)?.message ?? 'We could not load this invite. Please try again.'
}

function InvitePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')?.trim() ?? ''
  const invite = useInvite(token)

  // Carried forward so /invite/join has the token and company without the query.
  useEffect(() => {
    if (!invite.data) return
    setInviteContext({
      token,
      email: invite.data.email,
      companyName: invite.data.organization_name,
      // Germany/GDPR controller disclaimer is opt-in via the link.
      showGdprDisclaimer:
        searchParams.get('gdpr') === '1' || searchParams.get('region')?.toLowerCase() === 'de',
    })
  }, [invite.data, searchParams, token])

  if (!token || invite.isError) {
    return (
      <AuthShell>
        <div className="flex w-full flex-col gap-[24px]">
          <h1 className="text-heading-4 font-semibold leading-39_7 text-text-primary">
            This invite link isn&apos;t valid
          </h1>
          <BannerSmall state="error" outline={false} showCloseButton={false}>
            {token
              ? messageForInviteError(invite.error)
              : 'This link is missing its invite token. Open the link from your invite email.'}
          </BannerSmall>
        </div>
      </AuthShell>
    )
  }

  if (invite.isLoading || !invite.data) {
    return <AuthShell>{null}</AuthShell>
  }

  return (
    <AuthShell
      footer={
        <InviteAcceptFooter
          companyName={invite.data.organization_name}
          showGdprDisclaimer={
            searchParams.get('gdpr') === '1' || searchParams.get('region')?.toLowerCase() === 'de'
          }
        />
      }
    >
      {/* The GDPR disclaimer belongs to InviteAcceptFooter, above. */}
      <StepInviteAccept
        companyName={invite.data.organization_name}
        email={invite.data.email}
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
