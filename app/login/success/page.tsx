'use client'

import { useRouter } from 'next/navigation'

import { clearLoginEmail } from '@/components/auth/flow-storage'
import { LoginShell } from '@/components/auth/login-shell'
import { StepLoginSuccess } from '@/components/auth/steps/step-login-success'

function LoginSuccessPage() {
  const router = useRouter()

  return (
    <LoginShell hideContact>
      <StepLoginSuccess
        onDone={() => {
          clearLoginEmail()
          router.push('/dashboard')
        }}
      />
    </LoginShell>
  )
}

export default LoginSuccessPage
