'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { LoginLegalFooter, LoginShell } from '@/components/auth/login-shell'
import { StepLoginVerify } from '@/components/auth/steps/step-login-verify'
import { applyApiError } from '@/lib/api-error'
import {
  getLoginOtpCodeExpiresAt,
  getLoginOtpEmail,
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
      return applyApiError(err, undefined, {}, 'Invalid verification code. Please try again.')
    }
  }

  async function handleResend(): Promise<number> {
    const session = await requestLoginOtp.mutateAsync({ email })
    setLoginOtpSession(session)
    return session.code_expires_in_seconds
  }

  if (!sessionId || !email) {
    return null
  }

  return (
    <LoginShell footer={<LoginLegalFooter />}>
      <StepLoginVerify
        email={email}
        ttlSeconds={secondsUntilExpiry()}
        onVerify={handleVerify}
        onResend={handleResend}
        onBack={() => router.push('/login/password')}
      />
    </LoginShell>
  )
}

export default LoginVerifyPage
