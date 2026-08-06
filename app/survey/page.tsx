'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui'
import { buildSurveyQuestions } from '@/components/waitlist/questions'
import { SurveyQuestionSkeleton } from '@/components/waitlist/skeletons/survey-question-skeleton'
import { StepEarlyAccess } from '@/components/waitlist/steps/step-early-access'
import { StepQuestionnaire } from '@/components/waitlist/steps/step-questionnaire'
import { StepThanks } from '@/components/waitlist/steps/step-thanks'
import { WaitlistShell } from '@/components/waitlist/waitlist-shell'
import { applyApiError } from '@/lib/api-error'
import { useSubmitOnboarding } from '@/lib/mutations'
import { useSurveyOptions } from '@/lib/queries'

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
  const surveyOptions = useSurveyOptions()
  const submitOnboarding = useSubmitOnboarding()

  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(QuestionnaireAnswers | undefined)[]>(() =>
    Array(QUESTION_COUNT).fill(undefined),
  )
  const [early, setEarly] = useState<EarlyAccessState>({ earlyAccess: false, userTesting: false })
  // Two ways in, so two token sources. `?token=` is how the survey link in the
  // signup email arrives; sessionStorage is set by the join-waitlist call when
  // the survey is reached straight from the landing page. Either way the token
  // ties this onboarding submission to that signup.
  const [token] = useState(() => {
    if (typeof window === 'undefined') return ''
    const fromUrl = new URLSearchParams(window.location.search).get('token')?.trim()
    const stored = fromUrl || sessionStorage.getItem('waitlistToken')
    if (!stored) {
      console.error('No waitlist token in the URL or sessionStorage; onboarding submission may fail.')
    }
    return stored ?? ''
  })
  const [fallbackError, setFallbackError] = useState<string>()

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

  const surveyQuestions = useMemo(() => {
    if (surveyOptions.isLoading || surveyOptions.isError) return null
    return buildSurveyQuestions({
      industries: surveyOptions.industries.data ?? [],
      hiringTools: surveyOptions.hiringTools.data ?? [],
      hiringFrustrations: surveyOptions.hiringFrustrations.data ?? [],
      roles: surveyOptions.roles.data ?? [],
      teamSizes: surveyOptions.teamSizes.data ?? [],
    })
  }, [
    surveyOptions.isLoading,
    surveyOptions.isError,
    surveyOptions.industries.data,
    surveyOptions.hiringTools.data,
    surveyOptions.hiringFrustrations.data,
    surveyOptions.roles.data,
    surveyOptions.teamSizes.data,
  ])

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

    setFallbackError(undefined)

    try {
      await submitOnboarding.mutateAsync({
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
      setFallbackError(
        applyApiError(err, undefined, {}, 'Something went wrong submitting your answers. Please try again.'),
      )
    }
  }

  const isQuestionStep = index < QUESTION_COUNT
  const question = surveyQuestions?.[index]
  const thanksHeading = early.userTesting
    ? "Thanks, we'll keep you posted."
    : 'Thanks, your feedback means a lot.'

  const shellStep: WaitlistStep =
    index === THANKS ? 'thanks' : index === EARLY_ACCESS ? 'early-access' : 'survey'

  return (
    <WaitlistShell step={shellStep}>
      {isQuestionStep && surveyOptions.isLoading && <SurveyQuestionSkeleton />}
      {isQuestionStep && surveyOptions.isError && (
        <div className="mx-auto flex w-full max-w-[472px] flex-col items-center gap-16 rounded-sm-7 bg-bg-tertiary py-32">
          <span className="text-body-l font-medium text-text-error" role="alert">
            Failed to load the survey. Please try again.
          </span>
          <Button accent="blue" variant="secondary" size="md" onClick={surveyOptions.refetch}>
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
          submitting={submitOnboarding.isPending}
          errorText={fallbackError}
          onSubmit={handleEarlySubmit}
        />
      )}
      {index === THANKS && <StepThanks heading={thanksHeading} />}
    </WaitlistShell>
  )
}
