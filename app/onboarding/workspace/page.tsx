'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { getOnboardingDraft, patchOnboardingDraft } from '@/components/auth/flow-storage'
import { StepWorkspace, type WorkspaceValues } from '@/components/auth/steps/step-workspace'
import { useOnboardingDraft } from '@/components/auth/use-flow-storage'
import { BannerSmall } from '@/components/ui'
import { applyApiError } from '@/lib/api-error'
import { routeForOnboarding } from '@/lib/auth-session'
import { useUpsertAddress } from '@/lib/mutations'

import type { ProductAddressPayload } from '@/lib/types'

function toAddressPayload(values: WorkspaceValues): ProductAddressPayload {
  if (values.addressMode === 'manual') {
    return {
      country_id: values.countryId,
      entry_mode: 'manual',
      line_1: values.addressLine1 || values.address,
      line_2: values.addressLine2,
      city: values.city,
      post_code: values.postcode,
      formatted_address: values.address,
    }
  }

  return {
    country_id: values.countryId,
    entry_mode: 'search',
    formatted_address: values.address,
    line_1: values.address,
  }
}

function OnboardingWorkspacePage() {
  const router = useRouter()
  const upsertAddress = useUpsertAddress()
  const draft = useOnboardingDraft()
  const [fallbackError, setFallbackError] = useState<string>()

  const ready = draft.accountType === 'business' && Boolean(draft.profile)

  // Only the business path collects a workspace address. Reads storage rather
  // than `ready`: the first commit after a fresh load still holds the server
  // snapshot (an empty draft), which would bounce a valid visitor.
  useEffect(() => {
    const stored = getOnboardingDraft()
    if (stored.accountType !== 'business' || !stored.profile) router.replace('/onboarding')
  }, [router])

  async function handleContinue(values: WorkspaceValues) {
    setFallbackError(undefined)
    try {
      const result = await upsertAddress.mutateAsync(toAddressPayload(values))
      patchOnboardingDraft({ workspace: values })
      router.push(routeForOnboarding(result.onboarding) || '/onboarding/compliance')
    } catch (err) {
      setFallbackError(applyApiError(err))
    }
  }

  if (!ready) {
    return null
  }

  return (
    <AuthShell>
      <div className="flex w-full flex-col gap-[16px]">
        {fallbackError ? (
          <BannerSmall
            state="error"
            outline={false}
            showCloseButton
            onClose={() => setFallbackError(undefined)}
          >
            {fallbackError}
          </BannerSmall>
        ) : null}
        <StepWorkspace
          submitting={upsertAddress.isPending}
          onContinue={handleContinue}
          onBack={() => router.push('/onboarding')}
        />
      </div>
    </AuthShell>
  )
}

export default OnboardingWorkspacePage
