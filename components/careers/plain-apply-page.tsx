'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useId, useMemo, useState, type FormEvent, type ReactElement } from 'react'

import { QuestionControl } from '@/components/careers/question-field'
import { BannerSmall, HelperText } from '@/components/ui'
import { getApiError, getFieldErrors } from '@/lib/api-error'
import {
  allCountries,
  validateApplication,
  validateDeclaration,
  type AnswerValue,
  type ApplicationAnswers,
  type ApplicationErrors,
} from '@/lib/careers/application'
import { toCountryCode } from '@/lib/markets'
import { useSubmitApplication } from '@/lib/mutations'
import { usePublicJob } from '@/lib/queries'

import type { Declaration } from '@/lib/careers/application'

/** A plain public application form built from the job's questions. The design comes later. */
function PlainApplyPage({ publicId }: { publicId: string }): ReactElement {
  const { data, isPending, isError } = usePublicJob('j', publicId)
  if (isPending) return <p role="status">Loading job…</p>
  if (isError) return <p role="alert">We could not load this job. Try again later.</p>
  if (!data) return <p role="alert">This job does not exist or is no longer available.</p>
  if (data.job.accepting === false || (data.job.state ?? 'open') !== 'open') {
    return <p role="status">This job is not taking applications.</p>
  }
  return <ApplyForm publicId={publicId} data={data} />
}

function ApplyForm({
  publicId,
  data,
}: {
  publicId: string
  data: NonNullable<ReturnType<typeof usePublicJob>['data']>
}): ReactElement {
  const { job, company } = data
  const idPrefix = useId()
  const src = useSearchParams().get('src') ?? undefined
  const submit = useSubmitApplication(job, src)
  const countries = useMemo(() => allCountries(), [])
  // The resume autofill button does nothing yet, so it is not offered.
  const questions = job.questions.filter((question) => question.type !== 'autofill_resume')
  const markets = job.markets ?? []
  const [answers, setAnswers] = useState<ApplicationAnswers>({})
  const [errors, setErrors] = useState<ApplicationErrors>({})
  const [declaration, setDeclaration] = useState<Declaration>({
    country: markets.length === 1 ? toCountryCode(markets[0] as string) : '',
    privacyAcknowledged: false,
    consent: false,
  })
  const [declarationErrors, setDeclarationErrors] = useState<
    Partial<Record<keyof Declaration, string>>
  >({})
  const [formError, setFormError] = useState('')
  const [received, setReceived] = useState(false)
  const jobHref = `/j/${encodeURIComponent(publicId)}`

  function changeAnswer(key: string, value: AnswerValue): void {
    setAnswers((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => {
      if (!(key in previous)) return previous
      const next = { ...previous }
      delete next[key]
      return next
    })
  }

  function showSubmitError(error: unknown): void {
    const found: ApplicationErrors = {}
    let message = ''
    for (const item of getFieldErrors(error)) {
      const id = /^answers\.(.+)$/.exec(item.path)?.[1]
      const question = id ? questions.find((q) => (q.id ?? q.key) === id) : undefined
      if (question) found[question.key] = item.message
      else message = item.message
    }
    if (Object.keys(found).length > 0) {
      setErrors((previous) => ({ ...previous, ...found }))
      message ||= 'Check the highlighted answers and try again.'
    }
    setFormError(
      message || getApiError(error)?.message || "We couldn't send your application. Try again.",
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    const found = validateApplication(questions, answers)
    const missing = validateDeclaration(declaration, job.consentRequired ?? false)
    setErrors(found)
    setDeclarationErrors(missing)
    if (Object.keys(found).length > 0 || Object.keys(missing).length > 0) return
    setFormError('')
    submit.mutate(
      {
        answers,
        declaration: {
          country: declaration.country,
          privacyAcknowledged: true,
          consent: job.consentRequired ? declaration.consent : false,
        },
      },
      { onSuccess: () => setReceived(true), onError: showSubmitError },
    )
  }

  if (received) {
    return (
      <div role="status" className="flex flex-col gap-[12px] text-text-primary">
        <h1 className="text-[25px] leading-[1.3] font-medium">Thank you</h1>
        <p>Your application for {job.title} was received successfully.</p>
        <p className="text-text-secondary">We&apos;ll contact you if there are next steps.</p>
      </div>
    )
  }

  const privacyLink = job.privacyNoticeUrl ? (
    <a href={job.privacyNoticeUrl} target="_blank" rel="noopener noreferrer" className="underline">
      privacy notice
    </a>
  ) : (
    <span>privacy notice</span>
  )

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-[20px] text-text-primary">
      <header className="flex flex-col gap-[4px]">
        <Link href={jobHref} className="w-fit text-body-s underline">
          Back to the job
        </Link>
        <h1 className="text-[25px] leading-[1.3] font-medium">Apply for {job.title}</h1>
        <p className="text-body-s text-text-secondary">{company.name}</p>
      </header>

      {questions.map((question) => {
        const inputId = `${idPrefix}-${question.key}`
        const error = errors[question.key]
        const invalid = question.key in errors
        const isUpload = question.type === 'file_upload' || question.type === 'image_upload'
        const shown =
          error ?? (invalid && isUpload ? `Attach a file for "${question.label}".` : null)
        return (
          <div key={question.key} className="flex flex-col gap-[6px]">
            <label htmlFor={inputId} className="text-body-s font-medium">
              {question.label}
              {question.required ? (
                <span aria-hidden="true" className="ml-[4px] text-text-error">
                  *
                </span>
              ) : null}
            </label>
            {question.description ? (
              <span className="text-body-s text-text-secondary">{question.description}</span>
            ) : null}
            <QuestionControl
              question={question}
              surface="page"
              inputId={inputId}
              placeholder={job.placeholders[question.key]}
              value={answers[question.key]}
              onChange={(value) => changeAnswer(question.key, value)}
              invalid={invalid}
            />
            {shown ? <HelperText state="error">{shown}</HelperText> : null}
          </div>
        )
      })}

      <div className="flex flex-col gap-[6px]">
        <label htmlFor={`${idPrefix}-country`} className="text-body-s font-medium">
          Country you live in
          <span aria-hidden="true" className="ml-[4px] text-text-error">
            *
          </span>
        </label>
        <select
          id={`${idPrefix}-country`}
          value={declaration.country}
          aria-invalid={Boolean(declarationErrors.country)}
          onChange={(event) => {
            setDeclaration((previous) => ({ ...previous, country: event.target.value }))
            setDeclarationErrors((previous) => ({ ...previous, country: undefined }))
          }}
          className="h-[40px] rounded-[10px] border border-border-transparent-light bg-transparent px-[8px] text-body-s text-text-primary"
        >
          <option value="">Select a country</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
        {declarationErrors.country ? (
          <HelperText state="error">{declarationErrors.country}</HelperText>
        ) : null}
      </div>

      <div className="flex flex-col gap-[6px]">
        <label className="flex items-start gap-[8px] text-body-s">
          <input
            type="checkbox"
            checked={declaration.privacyAcknowledged}
            aria-invalid={Boolean(declarationErrors.privacyAcknowledged)}
            onChange={(event) => {
              setDeclaration((previous) => ({
                ...previous,
                privacyAcknowledged: event.target.checked,
              }))
              setDeclarationErrors((previous) => ({ ...previous, privacyAcknowledged: undefined }))
            }}
            className="mt-[3px]"
          />
          <span>I have read the {privacyLink} and understand how my data is used. *</span>
        </label>
        {declarationErrors.privacyAcknowledged ? (
          <HelperText state="error">{declarationErrors.privacyAcknowledged}</HelperText>
        ) : null}
      </div>

      {job.consentRequired ? (
        <div className="flex flex-col gap-[6px]">
          <label className="flex items-start gap-[8px] text-body-s">
            <input
              type="checkbox"
              checked={declaration.consent}
              aria-invalid={Boolean(declarationErrors.consent)}
              onChange={(event) => {
                setDeclaration((previous) => ({ ...previous, consent: event.target.checked }))
                setDeclarationErrors((previous) => ({ ...previous, consent: undefined }))
              }}
              className="mt-[3px]"
            />
            <span>I consent to {company.name} processing my application data. *</span>
          </label>
          {declarationErrors.consent ? (
            <HelperText state="error">{declarationErrors.consent}</HelperText>
          ) : null}
        </div>
      ) : null}

      {formError ? (
        <BannerSmall state="error" showCloseButton={false}>
          {formError}
        </BannerSmall>
      ) : null}
      <button
        type="submit"
        disabled={submit.isPending}
        className="h-[40px] w-fit rounded-[10px] border border-border-btn-blue-pri-rest bg-bg-btn-blue-pri-rest px-[16px] text-body-s font-medium text-text-btn-blue-primary disabled:opacity-40"
      >
        {submit.isPending ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  )
}

export { PlainApplyPage }
