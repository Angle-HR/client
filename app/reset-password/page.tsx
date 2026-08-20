'use client'

import { useRouter } from 'next/navigation'

import { LoginShell } from '@/components/auth/login-shell'
import {
  StepResetPassword,
  type ResetPasswordValues,
} from '@/components/auth/steps/step-reset-password'

function ResetPasswordPage() {
  const router = useRouter()

  function handleContinue(_values: ResetPasswordValues) {
    void _values
    router.push('/login/success')
  }

  return (
    <LoginShell>
      <StepResetPassword onContinue={handleContinue} onBack={() => router.push('/login')} />
    </LoginShell>
  )
}

export default ResetPasswordPage
