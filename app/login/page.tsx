'use client'

import { useRouter } from 'next/navigation'

import { setLoginEmail } from '@/components/auth/flow-storage'
import { LoginLegalFooter, LoginShell } from '@/components/auth/login-shell'
import { StepLoginEmail, type LoginEmailValues } from '@/components/auth/steps/step-login-email'
import { useLoginEmail } from '@/components/auth/use-flow-storage'

function LoginPage() {
  const router = useRouter()
  const defaultEmail = useLoginEmail()

  function handleContinue(values: LoginEmailValues) {
    setLoginEmail(values.email)
    router.push('/login/password')
  }

  return (
    <LoginShell footer={<LoginLegalFooter />}>
      <StepLoginEmail defaultEmail={defaultEmail} onContinue={handleContinue} />
    </LoginShell>
  )
}

export default LoginPage
