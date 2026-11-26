'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

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
  const resetPassword = useResetPassword()
  const [formError, setFormError] = useState<string>()

  // The link in the reset email is {APP_URL}/reset-password?token=... The token is read once
  // from the address bar and the URL is cleaned straight away, so it does not stay in the
  // history, the address bar or a Referer. The page also sends Referrer-Policy: no-referrer.
  const tokenRef = useRef('')
  useEffect(() => {
    const found = new URLSearchParams(window.location.search).get('token')?.trim() ?? ''
    if (found) {
      tokenRef.current = found
      window.history.replaceState(window.history.state, '', window.location.pathname)
    }
  }, [])

  async function handleContinue(values: ResetPasswordValues) {
    const token = tokenRef.current
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
        formError={formError}
        onContinue={handleContinue}
        onBack={() => router.push('/login')}
      />
    </LoginShell>
  )
}

function ResetPasswordPage() {
  return <ResetPasswordContent />
}

export default ResetPasswordPage
