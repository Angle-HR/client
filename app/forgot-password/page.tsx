'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { setLoginEmail } from '@/components/auth/flow-storage'
import { LoginShell } from '@/components/auth/login-shell'
import {
  StepForgotPassword,
  type ForgotPasswordValues,
} from '@/components/auth/steps/step-forgot-password'
import { useLoginEmail } from '@/components/auth/use-flow-storage'
import { applyApiError } from '@/lib/api-error'
import { useForgotPassword } from '@/lib/mutations'

function ForgotPasswordPage() {
  const router = useRouter()
  const forgotPassword = useForgotPassword()
  const defaultEmail = useLoginEmail()
  const [formError, setFormError] = useState<string>()
  const [sent, setSent] = useState(false)

  async function handleContinue(values: ForgotPasswordValues) {
    setLoginEmail(values.email)
    setFormError(undefined)

    try {
      // The API answers 200 with a generic message whether or not the address
      // has an account, so there is nothing here to branch on — show what it said.
      await forgotPassword.mutateAsync({ email: values.email })
      setSent(true)
    } catch (err) {
      setFormError(applyApiError(err))
    }
  }

  return (
    <LoginShell>
      <StepForgotPassword
        defaultEmail={defaultEmail}
        submitting={forgotPassword.isPending}
        formError={formError}
        sent={sent}
        onContinue={handleContinue}
        onBack={() => router.push('/login')}
      />
    </LoginShell>
  )
}

export default ForgotPasswordPage
