'use client'

import { useState } from 'react'

import { surveyQuestions } from '@/components/waitlist/questions'
import { StepEarlyAccess } from '@/components/waitlist/steps/step-early-access'
import { StepIntro } from '@/components/waitlist/steps/step-intro'
import { StepQuestionnaire } from '@/components/waitlist/steps/step-questionnaire'
import { StepSuccess } from '@/components/waitlist/steps/step-success'
import { StepThanks } from '@/components/waitlist/steps/step-thanks'
import { WaitlistShell } from '@/components/waitlist/waitlist-shell'
import { WaitlistStep } from '@/lib/types'

// Flow: intro → success → survey questions (data-driven) → early access → thanks.
// Survey questions will later be fetched from the backend.

export default function WaitlistPage() {
  const [step, setStep] = useState<WaitlistStep>('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [thanksHeading, setThanksHeading] = useState('Thanks, your feedback means a lot.')

  function nextQuestion() {
    const next = questionIndex + 1
    if (next >= surveyQuestions.length) {
      setStep('early-access')
      return
    }
    setQuestionIndex(next)
  }

  function submitEarlyAccess({ userTesting }: { earlyAccess: boolean; userTesting: boolean }) {
    setThanksHeading(
      userTesting ? "Thanks, we'll keep you posted." : 'Thanks, your feedback means a lot.',
    )
    setStep('thanks')
  }

  const question = surveyQuestions[questionIndex]

  return (
    <WaitlistShell step={step}>
      {step === 'intro' && <StepIntro onSubmit={() => setStep('success')} />}
      {step === 'success' && <StepSuccess onContinue={() => setStep('survey')} />}
      {step === 'survey' && question && (
        <StepQuestionnaire key={questionIndex} {...question} onContinue={nextQuestion} />
      )}
      {step === 'early-access' && <StepEarlyAccess onSubmit={submitEarlyAccess} />}
      {step === 'thanks' && <StepThanks heading={thanksHeading} />}
    </WaitlistShell>
  )
}
