'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { patchOnboardingDraft } from '@/components/auth/flow-storage'
import { StepCompliance, type ComplianceValues } from '@/components/auth/steps/step-compliance'
import { useOnboardingDraft } from '@/components/auth/use-flow-storage'
import { useOnboardingResume } from '@/components/auth/use-onboarding-resume'
import { BannerSmall } from '@/components/ui'
import { applyApiError } from '@/lib/api-error'
import { routeForOnboarding } from '@/lib/auth-session'
import { useUpsertCompliance } from '@/lib/mutations'

function OnboardingCompliancePage() {
  const router = useRouter()
  const upsertCompliance = useUpsertCompliance()
  const draft = useOnboardingDraft()
  const [fallbackError, setFallbackError] = useState<string>()

  // The server decides whether this step is the right one to be on.
  const { checking } = useOnboardingResume()
  const backHref = draft.accountType === 'business' ? '/onboarding/workspace' : '/onboarding'

  async function handleContinue(values: ComplianceValues) {
    setFallbackError(undefined)
    try {
      const employeeCount = Number.parseInt(values.employeeCount, 10)
      const result = await upsertCompliance.mutateAsync({
        business_type_id: values.businessDescriptor,
        industry_id: values.industryId,
        employee_count: Number.isFinite(employeeCount) ? employeeCount : 0,
      })
      patchOnboardingDraft({ compliance: values })
      router.push(routeForOnboarding(result.onboarding) || '/onboarding/setup')
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
        <StepCompliance
          submitting={upsertCompliance.isPending}
          onContinue={handleContinue}
          onBack={() => router.push(backHref)}
        />
      </div>
    </AuthShell>
  )
}

export default OnboardingCompliancePage
