'use client'

import { useState } from 'react'

import { StepIndustry } from '@/components/waitlist/steps/step-industry'
import { StepIntro } from '@/components/waitlist/steps/step-intro'
import { StepSuccess } from '@/components/waitlist/steps/step-success'
import { WaitlistShell } from '@/components/waitlist/waitlist-shell'

// Steps mirror the Figma flow: intro → success → survey (industry, tools, role,
// early access) → thanks. Built incrementally.
type Step = 'intro' | 'success' | 'industry'

export default function WaitlistPage() {
  const [step, setStep] = useState<Step>('intro')

  return (
    <WaitlistShell>
      {step === 'intro' && <StepIntro onSubmit={() => setStep('success')} />}
      {step === 'success' && <StepSuccess onContinue={() => setStep('industry')} />}
      {step === 'industry' && <StepIndustry onContinue={() => setStep('industry')} />}
    </WaitlistShell>
  )
}
