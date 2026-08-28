'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { patchOnboardingDraft } from '@/components/auth/flow-storage'
import {
  StepIdentificationAddress,
  type AddressParts,
  type IdentificationAddressValues,
} from '@/components/auth/steps/step-identification-address'
import { useOnboardingDraft } from '@/components/auth/use-flow-storage'
import { useOnboardingResume } from '@/components/auth/use-onboarding-resume'
import { applyApiError } from '@/lib/api-error'
import { routeForOnboarding } from '@/lib/auth-session'
import { useUpsertAddress } from '@/lib/mutations'
import { useIdentificationRequirements, useOnboardingStatus } from '@/lib/queries'
import { requests } from '@/lib/requests'

function OnboardingWorkspacePage() {
  const router = useRouter()
  const draft = useOnboardingDraft()
  const { checking } = useOnboardingResume()

  const upsertAddress = useUpsertAddress()
  const [fallbackError, setFallbackError] = useState<string>()

  // The country was chosen on the profile step and decides which identification
  // fields this step asks for, so it comes from the server's saved profile.
  const status = useOnboardingStatus()
  const countryId = status.data?.profile?.country_id ?? ''
  const requirements = useIdentificationRequirements(countryId || undefined)

  // Calls the request directly rather than through a mutation hook: the hook
  // returns a fresh object each render, which would change this callback's
  // identity, restart the search field's debounce effect, and fire a lookup per
  // render instead of per keystroke.
  const handleSearchAddress = useCallback(
    async (query: string) => {
      if (!countryId) return []
      const result = await requests.searchAddress({ query, country_id: countryId })
      return result.suggestions
    },
    [countryId],
  )

  const handleVerifyAddress = useCallback(
    async (parts: AddressParts, entryMode: 'search' | 'manual') => {
      try {
        const result = await requests.verifyAddress({
          country_id: countryId,
          entry_mode: entryMode,
          ...parts,
        })

        if (result.verification_status === 'verified') {
          return { status: 'verified' as const, suggested: result.formatted_address }
        }
        // `invalid_address` still means "we judged it"; the fields carry the
        // detail, and manual entry is the way to correct them.
        return { status: 'not_verifiable' as const }
      } catch {
        // A verifier that is down must never block onboarding.
        return { status: 'verified' as const }
      }
    },
    [countryId],
  )

  async function handleContinue(values: IdentificationAddressValues) {
    setFallbackError(undefined)
    try {
      const result = await upsertAddress.mutateAsync({
        country_id: countryId,
        entry_mode: values.entryMode,
        line_1: values.address.line_1,
        line_2: values.address.line_2,
        city: values.address.city,
        state_or_county: values.address.state_or_county,
        post_code: values.address.post_code,
        formatted_address: values.address.formatted_address,
        identification: values.identification,
      })
      patchOnboardingDraft({
        workspace: {
          countryId,
          addressMode: values.entryMode,
          address: values.address.formatted_address ?? '',
        },
      })
      router.push(routeForOnboarding(result.onboarding) || '/onboarding/compliance')
    } catch (err) {
      setFallbackError(applyApiError(err))
    }
  }

  if (checking) {
    return null
  }

  // Whatever they called the workspace on the profile step.
  const profile = draft.profile
  const previewName =
    profile && 'businessName' in profile ? profile.businessName : (profile?.firstName ?? '')

  return (
    <AuthShell previewName={previewName}>
      <StepIdentificationAddress
        fields={requirements.data?.fields ?? []}
        fieldsLoading={requirements.isPending && Boolean(countryId)}
        submitting={upsertAddress.isPending}
        formError={fallbackError}
        onSearchAddress={handleSearchAddress}
        onVerifyAddress={handleVerifyAddress}
        onContinue={handleContinue}
        onBack={() => router.push('/onboarding')}
      />
    </AuthShell>
  )
}

export default OnboardingWorkspacePage
