'use client'

import { useId, useState, type FormEvent, type ReactElement } from 'react'

import { QuestionControl } from '@/components/careers/question-field'
import { Button, Check, HelperText } from '@/components/ui'
import {
  validateApplication,
  type AnswerValue,
  type ApplicationAnswers,
  type ApplicationErrors,
} from '@/lib/careers/application'
import { useSubmitApplication } from '@/lib/mutations'

import type { CareersJob } from '@/lib/careers/types'
import type { FormQuestion } from '@/lib/jobs/application-form'

interface CandidateApplicationFormProps {
  slug: string
  job: CareersJob
}

/** The legal line under the submit button, as drawn in 9346:561694. */
const LEGAL_TEXT =
  "By submitting you accept our Privacy policy, terms and conditions. We may use AI tools to support parts of the hiring process, reviewing applications, analysing resumes, or flagging inconsistencies in application materials. These tools assist our recruitment team but don't replace human judgment; final hiring decisions are always made by humans. Contact us for more information on how your data is processed."

/**
 * The application form a candidate fills in. Figma: 9346:561694 (the form),
 * 9346:561739 (the received state).
 */
function CandidateApplicationForm({ slug, job }: CandidateApplicationFormProps): ReactElement {
  const idPrefix = useId()
  const [answers, setAnswers] = useState<ApplicationAnswers>({})
  const [errors, setErrors] = useState<ApplicationErrors>({})
  const [received, setReceived] = useState(false)
  const submit = useSubmitApplication(slug, job.id)

  function changeAnswer(key: string, value: AnswerValue): void {
    setAnswers((previous) => ({ ...previous, [key]: value }))
    // A field's error clears as soon as the candidate changes it.
    setErrors((previous) => {
      if (!(key in previous)) return previous
      const next = { ...previous }
      delete next[key]
      return next
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const found = validateApplication(job.questions, answers)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    submit.mutate(answers, { onSuccess: () => setReceived(true) })
  }

  if (received) {
    return (
      <div
        role="status"
        className="flex flex-col gap-[24px] rounded-[20px] bg-bg-banner-success pt-[18px] pr-[20px] pb-[28px] pl-[20px]"
      >
        {/* The check circle is #448039 in 9346:561739; no token has that green. */}
        <span className="flex size-[31.5px] items-center justify-center rounded-full bg-[#448039]">
          <Check className="size-[13px] text-text-inverted" />
        </span>
        <div className="flex flex-col gap-[14px]">
          <p className="text-[15.9px] leading-[24px] font-semibold text-text-primary">
            Your application was received successfully.
          </p>
          <p className="text-[14px] leading-[26.5px] tracking-[0.2px] text-text-secondary">
            We&apos;ll contact you if there are next steps.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
      <div className="flex flex-col gap-[20px] py-[16px]">
        {job.questions.map((question) => (
          <FormField
            key={question.key}
            question={question}
            inputId={`${idPrefix}-${question.key}`}
            placeholder={job.placeholders[question.key]}
            value={answers[question.key]}
            error={errors[question.key]}
            invalid={question.key in errors}
            onChange={(value) => changeAnswer(question.key, value)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-[16px] py-[20px]">
        <Button
          type="submit"
          variant="primary"
          accent="blue"
          size="md"
          disabled={submit.isPending}
          className="h-[40px]! w-full rounded-[10px]!"
        >
          SUBMIT APPLICATION
        </Button>
        <p className="text-[9.6px] leading-[15.36px] text-text-tertiary">{LEGAL_TEXT}</p>
      </div>
    </form>
  )
}

interface FormFieldProps {
  question: FormQuestion
  inputId: string
  placeholder?: string
  value: AnswerValue | undefined
  /** Undefined while the field is valid; null when invalid with no copy to show. */
  error: string | null | undefined
  invalid: boolean
  onChange: (value: AnswerValue) => void
}

/** One question: its label with the required mark, its description, the input and any error. */
function FormField({
  question,
  inputId,
  placeholder,
  value,
  error,
  invalid,
  onChange,
}: FormFieldProps): ReactElement {
  // Autofill has no input of its own, so its label is not tied to one.
  const isButtonOnly = question.type === 'autofill_resume'
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="flex flex-col gap-[2px]">
        {isButtonOnly ? (
          <span className="flex h-[9px] items-center pl-[3px] text-body-xs leading-none font-medium-550 text-text-primary">
            {question.label}
          </span>
        ) : (
          <label
            htmlFor={inputId}
            className="flex h-[9px] items-center pl-[3px] text-body-xs leading-none font-medium-550 text-text-primary"
          >
            {question.label}
            {question.required ? (
              <span aria-hidden="true" className="ml-[4px] text-[9px] text-text-error">
                *
              </span>
            ) : null}
          </label>
        )}
        {question.description ? (
          <span className="text-[12px] leading-[19.2px] text-text-secondary">
            {question.description}
          </span>
        ) : null}
      </div>
      <QuestionControl
        question={question}
        surface="page"
        inputId={inputId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        invalid={invalid}
      />
      {error ? <HelperText state="error">{error}</HelperText> : null}
    </div>
  )
}

/**
 * The page footer on the application tab, centred under the content (9346:561694,
 * 9346:561739). The OPEN HR mark is a vector in the design and is not drawn here.
 */
function PoweredBy(): ReactElement {
  return (
    <div className="flex items-center gap-[8px]">
      <span className="text-[12px] leading-[19.2px] text-text-tertiary">Powered by</span>
      <span className="text-[13px] leading-[19.5px] font-semibold text-text-primary">OPEN HR</span>
    </div>
  )
}

export { CandidateApplicationForm, PoweredBy }
export type { CandidateApplicationFormProps }
