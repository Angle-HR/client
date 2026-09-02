'use client'

import { useRouter } from 'next/navigation'

import { AuthShell } from '@/components/auth/auth-shell'
import { setSignupEmail } from '@/components/auth/flow-storage'
import {
  CredentialsFooter,
  StepCredentials,
  type SignupFormValues,
} from '@/components/auth/steps/step-credentials'

import type { AuthSignupData } from '@/lib/types'

function SignupPage() {
  const router = useRouter()

  function handleContinue(result: AuthSignupData, values: SignupFormValues) {
    setSignupEmail(values.email)
    router.push(`/verify?email=${encodeURIComponent(result.email)}`)
  }

  return (
    <AuthShell footer={<CredentialsFooter />}>
      <StepCredentials onContinue={handleContinue} />
    </AuthShell>
  )
}

export default SignupPage
