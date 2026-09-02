'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

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
import {
  autocompleteAddresses,
  createSessionToken,
  fetchPlaceAddress,
  isGooglePlacesConfigured,
  resolveTypedAddress,
} from '@/lib/google-places'
import { useUpsertAddress } from '@/lib/mutations'
import { useCountries, useIdentificationRequirements, useOnboardingStatus } from '@/lib/queries'

import type { ProductAddressSuggestion } from '@/lib/types'

function OnboardingWorkspacePage() {
  const router = useRouter()
  const draft = useOnboardingDraft()
  const { checking } = useOnboardingResume()

  const upsertAddress = useUpsertAddress()
  const [fallbackError, setFallbackError] = useState<string>()

  // The country was chosen on the profile step and decides which identification
  // fields this step asks for, so it comes from the server's saved profile.
  const status = useOnboardingStatus()
  // Falls back to the local draft: the server is the source of truth, but this
  // keeps the step usable if the saved profile comes back without a country.
  const draftProfile = draft.profile
  const draftCountryId =
    draftProfile && 'countryId' in draftProfile ? (draftProfile.countryId ?? '') : ''
  const countryId = status.data?.profile?.country_id || draftCountryId
  const requirements = useIdentificationRequirements(countryId || undefined)

  // Google wants an ISO-3166-1 alpha-2 code to confine results to the business's
  // country; the countries list already carries it on `icon_key` ("flag-gb").
  const countries = useCountries()
  const regionCode = (() => {
    const country = countries.data?.find((candidate) => candidate.id === countryId)
    if (!country) return undefined
    return (country.icon_key?.replace(/^flag-/, '') || country.slug)?.toLowerCase()
  })()

  // One token spans the keystrokes of a lookup plus the details call that ends
  // it, so Google bills the pair as a single session. Rotated once resolved.
  const sessionTokenRef = useRef(createSessionToken())

  // Kept as a stable callback: an unstable identity would restart the search
  // field's debounce effect and fire a lookup per render instead of per
  // keystroke — which also means paying Google per render.
  const handleSearchAddress = useCallback(
    async (query: string) =>
      autocompleteAddresses(query, {
        regionCode,
        sessionToken: sessionTokenRef.current,
      }),
    [regionCode],
  )

  const handleResolveSuggestion = useCallback(async (suggestion: ProductAddressSuggestion) => {
    const resolved = await fetchPlaceAddress(suggestion.place_id, sessionTokenRef.current)
    // The details call closes the billing session, so the next lookup starts one.
    sessionTokenRef.current = createSessionToken()
    if (!resolved) return null
    return {
      place_id: resolved.place_id,
      line_1: resolved.line_1,
      line_2: resolved.line_2,
      city: resolved.city,
      state_or_county: resolved.state_or_county,
      post_code: resolved.post_code,
      formatted_address: resolved.formatted_address,
    }
  }, [])

  /**
   * Checks an address against Google rather than the backend verifier. A typed
   * address — whether free text in the search box or the whole manual form — is
   * run through autocomplete, and Google's best match is offered back so the
   * person can keep theirs or take the corrected one.
   */
  const handleVerifyAddress = useCallback(
    async (parts: AddressParts, entryMode: 'search' | 'manual') => {
      // Nothing to check against: never block someone from finishing onboarding.
      if (!isGooglePlacesConfigured()) return { status: 'verified' as const }

      // A picked suggestion is already a Google place; there is nothing to correct.
      if (parts.place_id) return { status: 'verified' as const }

      const typed = parts.formatted_address?.trim()
      if (!typed) return { status: 'verified' as const }

      try {
        const match = await resolveTypedAddress(typed, {
          regionCode,
          sessionToken: sessionTokenRef.current,
        })
        sessionTokenRef.current = createSessionToken()

        if (!match) {
          // Google recognised nothing. In search mode that sends them to the
          // manual form; in manual there is nowhere further to go, so their
          // address stands as typed.
          return entryMode === 'search'
            ? { status: 'not_verifiable' as const }
            : { status: 'verified' as const }
        }

        return { status: 'verified' as const, suggested: match.formatted_address }
      } catch {
        return { status: 'verified' as const }
      }
    },
    [regionCode],
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
        formError={
          fallbackError ??
          (!status.isPending && !countryId
            ? 'We could not tell which country your business is registered in. Go back and set it on the previous step.'
            : undefined)
        }
        onSearchAddress={handleSearchAddress}
        onResolveSuggestion={handleResolveSuggestion}
        onVerifyAddress={handleVerifyAddress}
        onContinue={handleContinue}
        onBack={() => router.push('/onboarding')}
      />
    </AuthShell>
  )
}

export default OnboardingWorkspacePage
