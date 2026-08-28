'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { LoginLegalFooter, LoginShell } from '@/components/auth/login-shell'
import { StepLogin2fa } from '@/components/auth/steps/step-login-2fa'
import { applyApiError } from '@/lib/api-error'
import { getMfaToken, landAfterLogin } from '@/lib/auth-session'
import { useVerifyLoginTotp } from '@/lib/mutations'

function Login2faPage() {
  const router = useRouter()
  const verifyTotp = useVerifyLoginTotp()

  // The challenge is short-lived; getMfaToken drops it once expired, which sends
  // the visitor back to sign in rather than leaving them on a dead screen.
  useEffect(() => {
    if (!getMfaToken()) router.replace('/login')
  }, [router])

  async function handleVerify(code: string): Promise<string | undefined> {
    const mfaToken = getMfaToken()
    if (!mfaToken) return 'Your sign-in session expired. Please sign in again.'

    try {
      const tokens = await verifyTotp.mutateAsync({ mfa_token: mfaToken, code })
      router.push(landAfterLogin(tokens))
      return undefined
    } catch (err) {
      return applyApiError(err, undefined, {}, 'Incorrect two-factor authentication code.')
    }
  }

  return (
    <LoginShell footer={<LoginLegalFooter />}>
      <StepLogin2fa onVerify={handleVerify} onBack={() => router.push('/login/password')} />
    </LoginShell>
  )
}

export default Login2faPage
