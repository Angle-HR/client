'use client'

import { useRouter } from 'next/navigation'
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

import type { AuthSessionData } from '@/lib/types'

function VerifyPageContent() {
  const router = useRouter()
  const storedEmail = useSignupEmail()
  const verificationEmail = useVerificationEmail()
  // The address is kept in sessionStorage, never in the URL.
  const email = storedEmail || verificationEmail

  useEffect(() => {
    // Storage is read here rather than reusing `email`: the first commit after a
    // fresh load still holds the server snapshot (''), which would bounce a
    // visitor who does have a session open.
    const resolved = getSignupEmail() || getVerificationEmail() || ''
    if (!resolved || !getVerificationSessionId()) {
      router.replace('/signup')
      return
    }
    setSignupEmail(resolved)
  }, [router])

  if (!email) {
    return null
  }

  function handleVerified(session: AuthSessionData) {
    router.push(routeForOnboarding(session.onboarding))
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
