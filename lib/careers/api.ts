import { formFromApi, isChoiceType } from '../jobs/application-form'
import { toCountryCode } from '../markets'

import type { ApiApplicationBody, ApiPublicJob, ApiPublicJobData, ApiUploadBody } from './api-types'
import type { ApplicationAnswers } from './application'
import type { CareersEmploymentType, CareersJobPage, CareersWorkplace } from './types'
import type { FormQuestion } from '../jobs/application-form'

const EMPLOYMENT_FROM_API: Record<string, CareersEmploymentType> = {
  full_time: 'Full time',
  part_time: 'Part time',
  contract: 'Contract',
  internship: 'Internship',
}

const WORKPLACE_FROM_API: Record<string, CareersWorkplace> = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
}

/** Job states a candidate can be told about. Anything but `open` takes no applications. */
type PublicJobState = 'open' | 'closed' | 'paused' | 'archived'

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** The description as HTML: the sections in the order the API sends them, else the plain text. */
function descriptionHtml(job: ApiPublicJob): string {
  const sections = Object.values(job.description_sections ?? {})
    .map((section) => (typeof section === 'string' ? section : (section.html ?? '')))
    .filter((html) => html.trim() !== '')
  if (sections.length > 0) return sections.map((html) => `<section>${html}</section>`).join('')
  const text = job.description_text?.trim()
  return text ? `<section><p>${escapeHtml(text)}</p></section>` : ''
}

/** Where the job is done: the free text, else the first market's city. */
function locationOf(job: ApiPublicJob): string | undefined {
  if (job.location_text) return job.location_text
  const first = job.locations?.[0]
  return first?.city || first?.market_code || undefined
}

/**
 * The public job in the shape the careers screens draw. `jobId` is the job's
 * `public_id`, which is what the careers URL carries. Null when the API sent
 * no job.
 */
function toCareersJobPage(data: ApiPublicJobData, jobId: string): CareersJobPage | null {
  const job = data.job
  if (!job) return null
  return {
    company: { name: job.company ?? '', about: '' },
    job: {
      id: jobId,
      title: job.title ?? '',
      team: job.department ?? '',
      location: locationOf(job),
      workplace: WORKPLACE_FROM_API[job.workplace_type ?? ''] ?? 'On-site',
      employmentType: EMPLOYMENT_FROM_API[job.employment_type ?? ''] ?? 'Full time',
      descriptionHtml: descriptionHtml(job),
      questions: formFromApi({ questions: job.questions }).questions,
      placeholders: {},
      markets: data.markets ?? [],
      consentRequired: data.consent_required ?? false,
      state: (data.state as PublicJobState | undefined) ?? 'open',
      accepting: data.accepting ?? true,
    },
  }
}

/** A question's answer as the API takes it. Files are replaced by upload tokens before this runs. */
function answerToApi(question: FormQuestion, value: string | string[] | number): unknown {
  if (typeof value === 'number') return value
  if (!isChoiceType(question.type)) return value
  // The form holds the option labels the candidate saw; the API wants the option ids.
  const idOf = (label: string): string =>
    question.options.find((option) => option.label === label)?.id ?? label
  return Array.isArray(value) ? value.map(idOf) : idOf(value)
}

interface ApplicationBodyInput {
  questions: readonly FormQuestion[]
  answers: ApplicationAnswers
  /** Upload tokens by question key, for the file answers already sent. */
  uploads: Readonly<Record<string, string[]>>
  markets: readonly string[]
  /** The market the candidate picked, for a job in more than one. */
  market?: string
  consentRequired: boolean
  source?: string
}

function candidateCountry(input: ApplicationBodyInput): string | undefined {
  const market = input.market ?? (input.markets.length === 1 ? input.markets[0] : undefined)
  return market ? toCountryCode(market) : undefined
}

/** The body of an application: answered questions only, keyed by question id. */
function toApplicationBody(input: ApplicationBodyInput): ApiApplicationBody {
  const answers: Record<string, unknown> = {}
  for (const question of input.questions) {
    const id = question.id ?? question.key
    const value = input.answers[question.key]
    if (value === undefined) continue
    if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
      const tokens = input.uploads[question.key]
      if (tokens?.length) answers[id] = tokens.length === 1 ? tokens[0] : tokens
      continue
    }
    if (value === '' || (Array.isArray(value) && value.length === 0)) continue
    answers[id] = answerToApi(question, value as string | string[] | number)
  }
  return {
    answers,
    // The API wants the candidate's country as an ISO code, one of the job's markets. A job with one market has no choice.
    candidate_country: candidateCountry(input),
    // The form's legal line is shown above the button, so submitting acknowledges it.
    privacy_notice_acknowledged: true,
    consent: input.consentRequired ? true : undefined,
    source: input.source,
  }
}

function toUploadBody(question: FormQuestion, file: File): ApiUploadBody {
  return {
    question_id: question.id ?? question.key,
    filename: file.name,
    content_type: file.type || 'application/octet-stream',
    size_bytes: file.size,
  }
}

export { descriptionHtml, toApplicationBody, toCareersJobPage, toUploadBody }
export type { ApplicationBodyInput, PublicJobState }
