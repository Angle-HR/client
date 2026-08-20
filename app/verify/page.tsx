'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import { AuthShell } from '@/components/auth/auth-shell'
import { getSignupEmail, setSignupEmail } from '@/components/auth/flow-storage'
import { StepVerify, VerifyFooter } from '@/components/auth/steps/step-verify'
import { useSignupEmail, useVerificationEmail } from '@/components/auth/use-flow-storage'
import {
  getVerificationEmail,
  getVerificationSessionId,
  routeForOnboarding,
} from '@/lib/auth-session'

import type { AuthTokenData } from '@/lib/types'

function VerifyPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromQuery = searchParams.get('email')?.trim() ?? ''
  const storedEmail = useSignupEmail()
  const verificationEmail = useVerificationEmail()
  const email = fromQuery || storedEmail || verificationEmail

  useEffect(() => {
    // Storage is read here rather than reusing `email`: the first commit after a
    // fresh load still holds the server snapshot (''), which would bounce a
    // visitor who does have a session open.
    const resolved = fromQuery || getSignupEmail() || getVerificationEmail() || ''
    if (!resolved || !getVerificationSessionId()) {
      router.replace('/signup')
      return
    }
    setSignupEmail(resolved)
  }, [fromQuery, router])

  if (!email) {
    return null
  }

  function handleVerified(tokens: AuthTokenData) {
    router.push(routeForOnboarding(tokens.onboarding))
  }

  return (
    <AuthShell footer={<VerifyFooter />}>
      <StepVerify
        email={email}
        onEditEmail={() => router.push('/signup')}
        onVerified={handleVerified}
      />
    </AuthShell>
  )
}

function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageContent />
    </Suspense>
  )
}

export default VerifyPage
