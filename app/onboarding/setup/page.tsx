'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { clearOnboardingDraft } from '@/components/auth/flow-storage'
import { StepSetup } from '@/components/auth/steps/step-setup'
import { BannerSmall } from '@/components/ui'
import { applyApiError } from '@/lib/api-error'
import { requests } from '@/lib/requests'

function OnboardingSetupPage() {
  const router = useRouter()
  const [fallbackError, setFallbackError] = useState<string>()
  const [readyToAnimate, setReadyToAnimate] = useState(false)
  const redirectRef = useRef('/dashboard')
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    async function finalize() {
      try {
        const result = await requests.completeOnboarding()
        clearOnboardingDraft()
        redirectRef.current = result.redirect_url || '/dashboard'
        setReadyToAnimate(true)
      } catch (err) {
        // 409: onboarding was already completed (a reload of this page, or a second
        // tab). Nothing to report; carry on to the dashboard.
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          setReadyToAnimate(true)
          return
        }
        setFallbackError(applyApiError(err))
      }
    }

    void finalize()
  }, [router])

  return (
    <AuthShell variant="centered">
      <div className="flex flex-col items-center gap-[16px]">
        {fallbackError ? (
          <BannerSmall state="error" outline={false} showCloseButton={false}>
            {fallbackError}
          </BannerSmall>
        ) : (
          <StepSetup
            onDone={
              readyToAnimate
                ? () => {
                    router.push(redirectRef.current)
                  }
                : undefined
            }
          />
        )}
      </div>
    </AuthShell>
  )
}

export default OnboardingSetupPage
