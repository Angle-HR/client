'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

import { LoginShell } from '@/components/auth/login-shell'
import {
  StepResetPassword,
  type ResetPasswordValues,
} from '@/components/auth/steps/step-reset-password'
import { applyApiError } from '@/lib/api-error'
import { clearSession } from '@/lib/auth-session'
import { useResetPassword } from '@/lib/mutations'

const MISSING_TOKEN_MESSAGE =
  'This reset link is missing its token. Request a new link from the sign-in page.'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetPassword = useResetPassword()
  const [formError, setFormError] = useState<string>()

  // The link in the reset email is {APP_URL}/reset-password?token=...
  const token = searchParams.get('token')?.trim() ?? ''

  async function handleContinue(values: ResetPasswordValues) {
    if (!token) {
      setFormError(MISSING_TOKEN_MESSAGE)
      return
    }

    setFormError(undefined)
    try {
      await resetPassword.mutateAsync({ token, password: values.password })
      // Any half-finished sign-in belongs to the old password.
      clearSession()
      router.push('/login')
    } catch (err) {
      setFormError(
        applyApiError(err, undefined, {}, 'This reset link is no longer valid. Request a new one.'),
      )
    }
  }

  return (
    <LoginShell>
      <StepResetPassword
        submitting={resetPassword.isPending}
        formError={formError ?? (token ? undefined : MISSING_TOKEN_MESSAGE)}
        onContinue={handleContinue}
        onBack={() => router.push('/login')}
      />
    </LoginShell>
  )
}

function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}

export default ResetPasswordPage
