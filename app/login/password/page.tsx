'use client'

import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { getLoginEmail, setLoginEmail, setSignupEmail } from '@/components/auth/flow-storage'
import { LoginLegalFooter, LoginShell } from '@/components/auth/login-shell'
import {
  StepLoginPassword,
  type LoginPasswordValues,
} from '@/components/auth/steps/step-login-password'
import { useLoginEmail } from '@/components/auth/use-flow-storage'
import { applyApiError, getApiError, getApiErrorDetails } from '@/lib/api-error'
import { landAfterLogin, setLoginOtpSession, setVerificationSession } from '@/lib/auth-session'
import { useLogin, useRequestLoginOtp } from '@/lib/mutations'

import type { AuthSignupData } from '@/lib/types'

function LoginPasswordPage() {
  const router = useRouter()
  const login = useLogin()
  const requestLoginOtp = useRequestLoginOtp()
  const email = useLoginEmail()
  const [formError, setFormError] = useState<string>()

  // Reached directly, with no email captured upstream — send them back to start.
  // Reads storage rather than the hook value: on a fresh page load the first
  // commit still holds the server snapshot (''), which would bounce a visitor
  // who does have an email stored.
  useEffect(() => {
    if (!getLoginEmail()) router.replace('/login')
  }, [router])

  async function handleSignIn(values: LoginPasswordValues) {
    setLoginEmail(values.email)
    setFormError(undefined)

    try {
      // Either tokens or a TOTP challenge; landAfterLogin persists whichever
      // came back and answers with the next route.
      const result = await login.mutateAsync({
        email: values.email,
        password: values.password,
      })
      router.push(landAfterLogin(result))
    } catch (err) {
      const apiError = getApiError(err)
      const details = getApiErrorDetails(err)

      // Valid credentials but unverified email → resume verification.
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        const sessionId =
          typeof details?.verification_session_id === 'string'
            ? details.verification_session_id
            : undefined
        const codeExpires =
          typeof details?.code_expires_in_seconds === 'number'
            ? details.code_expires_in_seconds
            : 300
        const resendIn =
          typeof details?.resend_available_in_seconds === 'number'
            ? details.resend_available_in_seconds
            : 30

        if (sessionId) {
          const session: AuthSignupData = {
            email: values.email,
            verification_session_id: sessionId,
            code_expires_in_seconds: codeExpires,
            resend_available_in_seconds: resendIn,
          }
          setVerificationSession(session)
          setSignupEmail(values.email)
          router.push(`/verify?email=${encodeURIComponent(values.email)}`)
          return
        }
      }

      setFormError(
        applyApiError(err, undefined, {}, apiError?.message || 'Incorrect email or password'),
      )
    }
  }

  async function handleEmailCode() {
    setFormError(undefined)
    try {
      const session = await requestLoginOtp.mutateAsync({ email })
      setLoginOtpSession(session)
      router.push('/login/verify')
    } catch (err) {
      setFormError(applyApiError(err))
    }
  }

  if (!email) {
    return null
  }

  return (
    <LoginShell footer={<LoginLegalFooter />}>
      <StepLoginPassword
        defaultEmail={email}
        formError={formError}
        submitting={login.isPending}
        onSignIn={handleSignIn}
        onEmailCode={handleEmailCode}
        onBack={() => router.push('/login')}
      />
    </LoginShell>
  )
}

export default LoginPasswordPage
