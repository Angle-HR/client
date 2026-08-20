'use client'

import { useRouter } from 'next/navigation'

import { setLoginEmail } from '@/components/auth/flow-storage'
import { LoginShell } from '@/components/auth/login-shell'
import {
  StepForgotPassword,
  type ForgotPasswordValues,
} from '@/components/auth/steps/step-forgot-password'
import { useLoginEmail } from '@/components/auth/use-flow-storage'

function ForgotPasswordPage() {
  const router = useRouter()
  const defaultEmail = useLoginEmail()

  function handleContinue(values: ForgotPasswordValues) {
    setLoginEmail(values.email)
    // UI-only: pretend email was sent, land on reset form (as if link clicked).
    router.push('/reset-password')
  }

  return (
    <LoginShell>
      <StepForgotPassword
        defaultEmail={defaultEmail}
        onContinue={handleContinue}
        onBack={() => router.push('/login')}
      />
    </LoginShell>
  )
}

export default ForgotPasswordPage
