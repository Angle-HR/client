'use client'

import { useEffect, useState } from 'react'

import { surveyQuestions } from '@/components/waitlist/questions'
import { StepEarlyAccess } from '@/components/waitlist/steps/step-early-access'
import { StepQuestionnaire } from '@/components/waitlist/steps/step-questionnaire'
import { StepThanks } from '@/components/waitlist/steps/step-thanks'
import { WaitlistShell } from '@/components/waitlist/waitlist-shell'

import type { QuestionnaireAnswers } from '@/components/waitlist/steps/step-questionnaire'
import type { WaitlistStep } from '@/lib/types'

// Flow indices: 0..N-1 = questions, N = early access, N+1 = thanks.
const QUESTION_COUNT = surveyQuestions.length
const EARLY_ACCESS = QUESTION_COUNT
const THANKS = QUESTION_COUNT + 1

interface EarlyAccessState {
  earlyAccess: boolean
  userTesting: boolean
}

/**
 * Survey flow. The current step is mirrored into the History API (same URL) so
 * the browser Back/Forward buttons move between questions without a route change
 * — no reload, no UI flash. Answers are held here so navigating back restores
 * prior selections.
 */
export default function SurveyPage() {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(QuestionnaireAnswers | undefined)[]>(() =>
    Array(QUESTION_COUNT).fill(undefined),
  )
  const [early, setEarly] = useState<EarlyAccessState>({ earlyAccess: false, userTesting: false })

  // Seed the current history entry so Back from step 0 exits to the landing page,
  // and Back/Forward within the survey move between steps.
  useEffect(() => {
    window.history.replaceState({ ...window.history.state, wlStep: 0 }, '')
    const onPop = (e: PopStateEvent) => {
      const step = e.state?.wlStep
      setIndex(typeof step === 'number' ? Math.max(0, Math.min(THANKS, step)) : 0)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function goTo(next: number) {
    window.history.pushState({ ...window.history.state, wlStep: next }, '')
    setIndex(next)
  }

  function handleQuestionContinue(next: QuestionnaireAnswers) {
    setAnswers((prev) => {
      const copy = [...prev]
      copy[index] = next
      return copy
    })
    goTo(index + 1)
  }

  function handleEarlySubmit(vals: EarlyAccessState) {
    setEarly(vals)
    goTo(THANKS)
  }

  const question = index < QUESTION_COUNT ? surveyQuestions[index] : undefined
  const thanksHeading = early.userTesting
    ? "Thanks, we'll keep you posted."
    : 'Thanks, your feedback means a lot.'

  const shellStep: WaitlistStep =
    index === THANKS ? 'thanks' : index === EARLY_ACCESS ? 'early-access' : 'survey'

  return (
    <WaitlistShell step={shellStep}>
      {question && (
        <StepQuestionnaire
          key={index}
          {...question}
          defaultAnswers={answers[index]}
          onContinue={handleQuestionContinue}
        />
      )}
      {index === EARLY_ACCESS && (
        <StepEarlyAccess
          defaultEarlyAccess={early.earlyAccess}
          defaultUserTesting={early.userTesting}
          onSubmit={handleEarlySubmit}
        />
      )}
      {index === THANKS && <StepThanks heading={thanksHeading} />}
    </WaitlistShell>
  )
}
