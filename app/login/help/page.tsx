'use client'

import { useRouter } from 'next/navigation'

import { LoginShell } from '@/components/auth/login-shell'
import { StepLoginHelp } from '@/components/auth/steps/step-login-help'

function LoginHelpPage() {
  const router = useRouter()

  return (
    <LoginShell hideContact>
      <StepLoginHelp onBack={() => router.push('/login')} />
    </LoginShell>
  )
}

export default LoginHelpPage
