'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { StepIntro } from '@/components/waitlist/steps/step-intro'
import { StepSuccess } from '@/components/waitlist/steps/step-success'
import { WaitlistShell } from '@/components/waitlist/waitlist-shell'

// Landing page: the intro form → success card. "Get involved" continues to the
// survey, which lives on its own route (/survey).
export default function Home() {
  const [step, setStep] = useState<'intro' | 'success'>('intro')
  const router = useRouter()

  return (
    <WaitlistShell step={step}>
      {step === 'intro' && <StepIntro onSubmit={() => setStep('success')} />}
      {step === 'success' && <StepSuccess onContinue={() => router.push('/survey')} />}
    </WaitlistShell>
  )
}
