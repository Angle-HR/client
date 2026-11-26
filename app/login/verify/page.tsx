'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { LoginLegalFooter, LoginShell } from '@/components/auth/login-shell'
import { StepLoginVerify } from '@/components/auth/steps/step-login-verify'
import { getRetryAfterSeconds, verificationCodeError } from '@/lib/api-error'
import {
  getLoginOtpCodeExpiresAt,
  getLoginOtpEmail,
  getLoginOtpResendAvailableAt,
  getLoginOtpSessionId,
  landAfterLogin,
  setLoginOtpSession,
} from '@/lib/auth-session'
import { useRequestLoginOtp, useVerifyLoginOtp } from '@/lib/mutations'

/** Seconds left on the code, from the expiry the request response gave us. */
function secondsUntilExpiry(): number {
  const expiresAt = getLoginOtpCodeExpiresAt()
  if (expiresAt === null) return 0
  return Math.max(0, Math.round((expiresAt - Date.now()) / 1000))
}

/** Seconds until a new code may be requested, from the stored cooldown. */
function secondsUntilResend(): number {
  const availableAt = getLoginOtpResendAvailableAt()
  if (availableAt === null) return 0
  return Math.max(0, Math.ceil((availableAt - Date.now()) / 1000))
}

function LoginVerifyPage() {
  const router = useRouter()
  const verifyLoginOtp = useVerifyLoginOtp()
  const requestLoginOtp = useRequestLoginOtp()

  const email = getLoginOtpEmail() ?? ''
  const sessionId = getLoginOtpSessionId()

  // No open passwordless session — the code was never requested, or it has been
  // consumed. Reads storage directly since this runs after hydration.
  useEffect(() => {
    if (!getLoginOtpSessionId() || !getLoginOtpEmail()) router.replace('/login')
  }, [router])

  async function handleVerify(code: string): Promise<string | undefined> {
    if (!sessionId) return 'Your session expired. Request a new code.'
    try {
      const result = await verifyLoginOtp.mutateAsync({
        verification_session_id: sessionId,
        code,
      })
      router.push(landAfterLogin(result))
      return undefined
    } catch (err) {
      return verificationCodeError(err)
    }
  }

  async function handleResend() {
    try {
      const session = await requestLoginOtp.mutateAsync({ email })
      setLoginOtpSession(session)
      return {
        expiresIn: session.code_expires_in_seconds,
        resendIn: session.resend_available_in_seconds,
      }
    } catch (err) {
      // Rate limited: keep the current code and show the server's countdown.
      const retryAfter = getRetryAfterSeconds(err)
      if (retryAfter) return { expiresIn: null, resendIn: retryAfter }
      throw err
    }
  }

  if (!sessionId || !email) {
    return null
  }

  return (
    <LoginShell footer={<LoginLegalFooter />}>
      <StepLoginVerify
        email={email}
        ttlSeconds={secondsUntilExpiry()}
        resendInSeconds={secondsUntilResend()}
        onVerify={handleVerify}
        onResend={handleResend}
        onBack={() => router.push('/login/password')}
      />
    </LoginShell>
  )
}

export default LoginVerifyPage
