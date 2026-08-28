'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { patchOnboardingDraft } from '@/components/auth/flow-storage'
import {
  StepAccountType,
  type BusinessValues,
  type IndividualValues,
} from '@/components/auth/steps/step-account-type'
import { useOnboardingDraft } from '@/components/auth/use-flow-storage'
import { useOnboardingResume } from '@/components/auth/use-onboarding-resume'
import { BannerSmall } from '@/components/ui'
import { applyApiError } from '@/lib/api-error'
import { routeForOnboarding } from '@/lib/auth-session'
import { useUpsertProfile } from '@/lib/mutations'

import type { AccountType } from '@/components/auth/onboarding-options'

function OnboardingAccountPage() {
  const router = useRouter()
  const upsertProfile = useUpsertProfile()
  const draft = useOnboardingDraft()
  // The server decides which step a returning user belongs on.
  const { checking } = useOnboardingResume()
  // The saved draft is the starting point; a pick this visit takes precedence.
  const [picked, setPicked] = useState<AccountType>()
  const accountType = picked ?? draft.accountType
  const [fallbackError, setFallbackError] = useState<string>()
  // Mirrored into the workspace preview beside the form.
  const [previewName, setPreviewName] = useState('')

  function handleAccountTypeChange(type: AccountType) {
    setPicked(type)
    patchOnboardingDraft({ accountType: type })
  }

  async function handleIndividualContinue(values: IndividualValues) {
    setFallbackError(undefined)
    try {
      const result = await upsertProfile.mutateAsync({
        account_type: 'individual',
        first_name: values.firstName,
        last_name: values.lastName,
        country_id: values.countryId,
      })
      patchOnboardingDraft({
        accountType: 'individual',
        profile: values,
      })
      router.push(routeForOnboarding(result.onboarding) || '/onboarding/compliance')
    } catch (err) {
      setFallbackError(applyApiError(err))
    }
  }

  async function handleBusinessContinue(values: BusinessValues) {
    setFallbackError(undefined)
    try {
      const result = await upsertProfile.mutateAsync({
        account_type: 'business',
        legal_business_name: values.businessName,
        legal_full_name: values.legalFullName,
        company_role_id: values.roleId,
      })
      patchOnboardingDraft({
        accountType: 'business',
        profile: values,
      })
      router.push(routeForOnboarding(result.onboarding) || '/onboarding/workspace')
    } catch (err) {
      setFallbackError(applyApiError(err))
    }
  }

  if (checking) {
    return null
  }

  return (
    <AuthShell previewName={previewName}>
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
        <StepAccountType
          accountType={accountType}
          onDisplayNameChange={setPreviewName}
          submitting={upsertProfile.isPending}
          onAccountTypeChange={handleAccountTypeChange}
          onIndividualContinue={handleIndividualContinue}
          onBusinessContinue={handleBusinessContinue}
        />
      </div>
    </AuthShell>
  )
}

export default OnboardingAccountPage
