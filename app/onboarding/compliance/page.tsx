'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { getOnboardingDraft, patchOnboardingDraft } from '@/components/auth/flow-storage'
import { StepCompliance, type ComplianceValues } from '@/components/auth/steps/step-compliance'
import { useOnboardingDraft } from '@/components/auth/use-flow-storage'
import { BannerSmall } from '@/components/ui'
import { applyApiError } from '@/lib/api-error'
import { routeForOnboarding } from '@/lib/auth-session'
import { useUpsertBusiness } from '@/lib/mutations'

function OnboardingCompliancePage() {
  const router = useRouter()
  const upsertBusiness = useUpsertBusiness()
  const draft = useOnboardingDraft()
  const [fallbackError, setFallbackError] = useState<string>()

  const ready = Boolean(
    draft.accountType && draft.profile && (draft.accountType !== 'business' || draft.workspace),
  )
  const backHref = draft.accountType === 'business' ? '/onboarding/workspace' : '/onboarding'

  // Earlier steps are incomplete — bounce back to the first one that is missing.
  // Reads storage rather than `draft`: the first commit after a fresh load still
  // holds the server snapshot (an empty draft), which would bounce a valid visitor.
  useEffect(() => {
    const stored = getOnboardingDraft()
    if (!stored.accountType || !stored.profile) {
      router.replace('/onboarding')
      return
    }
    if (stored.accountType === 'business' && !stored.workspace) {
      router.replace('/onboarding/workspace')
    }
  }, [router])

  async function handleContinue(values: ComplianceValues) {
    setFallbackError(undefined)
    try {
      const employeeCount = Number.parseInt(values.employeeCount, 10)
      const result = await upsertBusiness.mutateAsync({
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
        <StepCompliance
          submitting={upsertBusiness.isPending}
          onContinue={handleContinue}
          onBack={() => router.push(backHref)}
        />
      </div>
    </AuthShell>
  )
}

export default OnboardingCompliancePage
