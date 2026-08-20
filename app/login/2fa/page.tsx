'use client'

import { useRouter } from 'next/navigation'

import { LoginShell } from '@/components/auth/login-shell'
import { StepLogin2fa } from '@/components/auth/steps/step-login-2fa'

function Login2faPage() {
  const router = useRouter()

  return (
    <LoginShell>
      <StepLogin2fa
        onVerified={() => router.push('/login/success')}
        onBack={() => router.push('/login/password')}
      />
    </LoginShell>
  )
}

export default Login2faPage
