'use client'

import { useEffect, useState } from 'react'

import {
  getHiringFrustrations,
  getHiringTools,
  getIndustries,
  getRoles,
  getTeamSizes,
  submitOnboarding,
} from '@/api/waitlist'
import { Button } from '@/components/ui'
import { buildSurveyQuestions, type SurveyQuestion } from '@/components/waitlist/questions'
import { StepEarlyAccess } from '@/components/waitlist/steps/step-early-access'
import { StepQuestionnaire } from '@/components/waitlist/steps/step-questionnaire'
import { StepThanks } from '@/components/waitlist/steps/step-thanks'
import { WaitlistShell } from '@/components/waitlist/waitlist-shell'

import type { QuestionnaireAnswers } from '@/components/waitlist/steps/step-questionnaire'
import type { WaitlistStep } from '@/lib/types'

// Flow indices: 0..N-1 = questions, N = early access, N+1 = thanks. The
// question count is structural — fixed by the number of question blocks
// `buildSurveyQuestions` always returns, regardless of API data.
const QUESTION_COUNT = 4
const EARLY_ACCESS = QUESTION_COUNT
const THANKS = QUESTION_COUNT + 1

interface EarlyAccessState {
  earlyAccess: boolean
  userTesting: boolean
}

function toIds(value: string | string[] | undefined): string[] {
  return Array.isArray(value) ? value : value ? [value] : []
}

function toId(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

/**
 * Survey flow. The current step is mirrored into the History API (same URL) so
 * the browser Back/Forward buttons move between questions without a route change
 * — no reload, no UI flash. Answers are held here so navigating back restores
 * prior selections.
 */
export default function SurveyPage() {
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[] | null>(null)
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [questionsError, setQuestionsError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(QuestionnaireAnswers | undefined)[]>(() =>
    Array(QUESTION_COUNT).fill(undefined),
  )
  const [early, setEarly] = useState<EarlyAccessState>({ earlyAccess: false, userTesting: false })
  // The join-waitlist call (on the landing page) stashes its token in
  // sessionStorage; this ties the onboarding submission to that signup.
  const [token] = useState(() => {
    if (typeof window === 'undefined') return ''
    const stored = sessionStorage.getItem('waitlistToken')
    if (!stored) {
      console.error('No waitlist token found in sessionStorage; onboarding submission may fail.')
    }
    return stored ?? ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>()

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

  // Load the survey's question options from the API. No static fallback —
  // while this is in flight or if it fails, the loading/error states below
  // are shown instead of the questionnaire.
  useEffect(() => {
    let cancelled = false

    Promise.all([
      getIndustries(),
      getHiringTools(),
      getHiringFrustrations(),
      getRoles(),
      getTeamSizes(),
    ])
      .then(([industries, hiringTools, hiringFrustrations, roles, teamSizes]) => {
        if (cancelled) return
        setSurveyQuestions(
          buildSurveyQuestions({ industries, hiringTools, hiringFrustrations, roles, teamSizes }),
        )
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load survey questions', err)
        setQuestionsError(true)
      })
      .finally(() => {
        if (!cancelled) setQuestionsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [retryCount])

  function handleRetryQuestions() {
    setQuestionsLoading(true)
    setQuestionsError(false)
    setRetryCount((c) => c + 1)
  }

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

  async function handleEarlySubmit(vals: EarlyAccessState) {
    const [industryAnswers, toolAnswers, frustrationAnswers, roleAnswers] = answers

    setSubmitError(undefined)
    setSubmitting(true)

    try {
      await submitOnboarding({
        token,
        industry_ids: toIds(industryAnswers?.groups[0]),
        tool_ids: toIds(toolAnswers?.groups[0]),
        frustration_ids: toIds(frustrationAnswers?.groups[0]),
        role_id: toId(roleAnswers?.groups[0]),
        team_size_id: toId(roleAnswers?.groups[1]),
        other_industry: industryAnswers?.othersOn ? industryAnswers.other : undefined,
        other_tool: toolAnswers?.othersOn ? toolAnswers.other : undefined,
        other_frustration: frustrationAnswers?.othersOn ? frustrationAnswers.other : undefined,
        wants_early_access: vals.earlyAccess,
        wants_user_testing: vals.userTesting,
      })
      setEarly(vals)
      goTo(THANKS)
    } catch (err) {
      console.error('Failed to submit onboarding form', err)
      setSubmitError('Something went wrong submitting your answers. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isQuestionStep = index < QUESTION_COUNT
  const question = !questionsLoading && !questionsError ? surveyQuestions?.[index] : undefined
  const thanksHeading = early.userTesting
    ? "Thanks, we'll keep you posted."
    : 'Thanks, your feedback means a lot.'

  const shellStep: WaitlistStep =
    index === THANKS ? 'thanks' : index === EARLY_ACCESS ? 'early-access' : 'survey'

  return (
    <WaitlistShell step={shellStep}>
      {isQuestionStep && questionsLoading && (
        <div className="mx-auto flex w-full max-w-[472px] items-center justify-center rounded-sm-7 bg-bg-tertiary py-32">
          <span className="text-body-l font-medium text-text-secondary">
            Loading your survey...
          </span>
        </div>
      )}
      {isQuestionStep && questionsError && (
        <div className="mx-auto flex w-full max-w-[472px] flex-col items-center gap-16 rounded-sm-7 bg-bg-tertiary py-32">
          <span className="text-body-l font-medium text-text-error" role="alert">
            Failed to load the survey. Please try again.
          </span>
          <Button accent="blue" variant="secondary" size="md" onClick={handleRetryQuestions}>
            Try again
          </Button>
        </div>
      )}
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
          submitting={submitting}
          errorText={submitError}
          onSubmit={handleEarlySubmit}
        />
      )}
      {index === THANKS && <StepThanks heading={thanksHeading} />}
    </WaitlistShell>
  )
}
