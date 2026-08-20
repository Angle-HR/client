'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { getLoginEmail } from '@/components/auth/flow-storage'
import { LoginLegalFooter, LoginShell } from '@/components/auth/login-shell'
import { StepLoginVerify } from '@/components/auth/steps/step-login-verify'
import { useLoginEmail } from '@/components/auth/use-flow-storage'

function LoginVerifyPage() {
  const router = useRouter()
  const email = useLoginEmail()

  // Reads storage, not the hook value — the first commit after a fresh load
  // still holds the server snapshot (''), which would bounce a valid visitor.
  useEffect(() => {
    if (!getLoginEmail()) router.replace('/login')
  }, [router])

  if (!email) {
    return null
  }

  return (
    <LoginShell footer={<LoginLegalFooter />}>
      <StepLoginVerify
        email={email}
        onVerified={() => router.push('/login/success')}
        onBack={() => router.push('/login/password')}
      />
    </LoginShell>
  )
}

export default LoginVerifyPage
