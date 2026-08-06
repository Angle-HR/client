'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'

import { Button, ListItemMultiSelect, RadioButton, Textarea, TextInput } from '@/components/ui'

import { ArrowRightIcon } from '../icons'

type SelectMode = 'single' | 'multi'

interface QuestionOption {
  value: string
  label: string
  /** Optional leading brand icon; when omitted the label may carry an emoji. */
  icon?: ReactNode
}
 
interface QuestionGroup {
  options: QuestionOption[]
  mode?: SelectMode
  columns?: 1 | 2
}

interface OthersConfig {
  label?: string
  input?: 'text' | 'textarea'
  placeholder: string
  /** The backend's own "Others" catalog entry id, when the option list already
   * seeds one — its id is merged into the group's selection so the checkbox
   * reports a real option instead of only the freeform text. */
  optionId?: string
}

interface QuestionnaireAnswers {
  groups: (string | string[])[]
  othersOn: boolean
  other?: string
}

interface StepQuestionnaireProps {
  eyebrow?: string
  question: string
  hint?: string
  groups: QuestionGroup[]
  others?: OthersConfig
  errorText?: string
  /** Prior answers, used to restore state when navigating back to a question. */
  defaultAnswers?: QuestionnaireAnswers
  onContinue?: (answers: QuestionnaireAnswers) => void
}

// Row styling shared by both selection controls so radio/checkbox rows look
// identical (h-32, px-6, rounded-sm-8, hover tint).
const rowClasses =
  'w-full h-[32px] px-[6px] rounded-sm-8 hover:bg-bg-transparent-light transition-colors'

const dividerTop = 'pt-10 border-t-[1.5px] border-border-notification border-dashed'
const dividerBottom = 'pb-10 border-b-[1.5px] border-border-notification border-dashed'

/**
 * Reusable questionnaire screen. Every survey question (industry, tools,
 * frustrations, role/team size, …) renders through this — driven by data so it
 * can later be fed straight from the backend.
 */
function StepQuestionnaire({
  eyebrow = 'Tell us a bit about your team',
  question,
  hint,
  groups,
  others,
  errorText = 'Please make a selection to continue.',
  defaultAnswers,
  onContinue,
}: StepQuestionnaireProps) {
  const [answers, setAnswers] = useState<(Set<string> | string)[]>(() =>
    groups.map((g, i) => {
      const prior = defaultAnswers?.groups[i]
      if (g.mode === 'single') return typeof prior === 'string' ? prior : ''
      return new Set<string>(Array.isArray(prior) ? prior : [])
    }),
  )
  const [othersOn, setOthersOn] = useState(defaultAnswers?.othersOn ?? false)
  const [otherText, setOtherText] = useState(defaultAnswers?.other ?? '')
  const [error, setError] = useState(false)
  const otherFieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null)

  useEffect(() => {
    if (othersOn) otherFieldRef.current?.focus()
  }, [othersOn])

  function clearError() {
    setError(false)
  }

  function selectSingle(groupIndex: number, value: string) {
    setAnswers((prev) => prev.map((a, i) => (i === groupIndex ? value : a)))
    clearError()
  }

  function toggleMulti(groupIndex: number, value: string) {
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (i !== groupIndex || typeof a === 'string') return a
        const next = new Set(a)
        if (next.has(value)) next.delete(value)
        else next.add(value)
        return next
      }),
    )
    clearError()
  }

  function handleContinue() {
    const singlesFilled = groups.every(
      (g, i) => g.mode !== 'single' || (answers[i] as string).length > 0,
    )
    const hasMultiOrOthers = groups.some((g) => g.mode !== 'single') || !!others
    const multiOrOthersFilled =
      groups.some((g, i) => g.mode !== 'single' && (answers[i] as Set<string>).size > 0) ||
      (othersOn && otherText.trim().length > 0)

    if (!singlesFilled || (hasMultiOrOthers && !multiOrOthersFilled)) {
      setError(true)
      return
    }
    onContinue?.({
      // `others` (when present) always describes groups[0] — every question
      // that has one only ever has a single group.
      groups: answers.map((a, i) => {
        if (typeof a === 'string') return a
        const withOthers =
          othersOn && others?.optionId && i === 0 ? new Set(a).add(others.optionId) : a
        return [...withOthers]
      }),
      othersOn,
      other: othersOn ? otherText.trim() : undefined,
    })
  }

  // Sections = each group, then an optional "Others" reveal — dashed dividers between them.
  const sectionCount = groups.length + (others ? 1 : 0)

  return (
    <div className="mx-auto w-full max-w-[472px]">
      {/* Outer ring: black @2% (bg/transparent/lighter) over the page; inner panel is white. */}
      <div className="sm:rounded-lg-12 sm:bg-bg-transparent-lighter sm:p-6 sm:pt-12">
        <div className="flex flex-col items-center gap-28 rounded-sm-7 sm:bg-bg-tertiary sm:px-24 sm:py-32">
          {/* Header */}
          <div className="flex w-full flex-col gap-12">
            <span className="text-body-l font-medium leading-21 text-text-secondary">
              {eyebrow}
            </span>
            <h1 className="text-heading-5 font-semibold leading-33.1 text-text-primary">
              {question}
            </h1>
            {hint && <span className="text-body-s font-normal text-text-tags-blue">{hint}</span>}
          </div>

          {/* Options */}
          <div className="flex w-full flex-col">
            {groups.map((group, gi) => {
              const isSingle = group.mode === 'single'
              const gridClass = group.columns === 2 ? 'grid grid-cols-2 gap-x-24' : 'flex flex-col'
              const sectionClass = [
                gridClass,
                gi > 0 ? dividerTop : '',
                gi < sectionCount - 1 ? dividerBottom : '',
              ].join(' ')

              if (isSingle) {
                return (
                  <div key={gi} className={sectionClass}>
                    {group.options.map((opt) => (
                      <RadioButton
                        key={opt.value}
                        name={`q-${gi}`}
                        label={opt.label}
                        checked={answers[gi] === opt.value}
                        onChange={() => selectSingle(gi, opt.value)}
                        className={rowClasses}
                      />
                    ))}
                  </div>
                )
              }

              return (
                <ul key={gi} className={sectionClass}>
                  {group.options.map((opt) => (
                    <ListItemMultiSelect
                      key={opt.value}
                      mainText={opt.label}
                      icon={opt.icon}
                      withIcon={!!opt.icon}
                      selected={(answers[gi] as Set<string>).has(opt.value)}
                      onChange={() => toggleMulti(gi, opt.value)}
                    />
                  ))}
                </ul>
              )
            })}

            {others && (
              <div className={`flex flex-col gap-[2px] ${sectionCount > 1 ? dividerTop : ''}`}>
                <ListItemMultiSelect
                  mainText={others.label ?? 'Others'}
                  withIcon={false}
                  selected={othersOn}
                  onChange={() => {
                    setOthersOn((v) => !v)
                    clearError()
                  }}
                />
                {others.input === 'textarea' ? (
                  <Textarea
                    ref={otherFieldRef}
                    showLabel={false}
                    showHelper={false}
                    showToolbar={false}
                    placeholder={others.placeholder}
                    rows={3}
                    disabled={!othersOn}
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                  />
                ) : (
                  <TextInput
                    ref={otherFieldRef}
                    showLabel={false}
                    showHelper={false}
                    placeholder={others.placeholder}
                    size="md"
                    disabled={!othersOn}
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                  />
                )}
              </div>
            )}

            {error && (
              <span className="text-body-xs text-text-error" role="alert">
                {errorText}
              </span>
            )}
          </div>

          {/* Action */}
          <Button
            accent="blue"
            variant="secondary"
            size="md"
            iconSuffix={<ArrowRightIcon />}
            onClick={handleContinue}
            className="max-sm:w-full"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}

export { StepQuestionnaire }
export type { StepQuestionnaireProps, QuestionGroup, QuestionOption, QuestionnaireAnswers }
