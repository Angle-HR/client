import type { ApiFormQuestion } from '../jobs/api-types'

/**
 * The public (no sign-in) endpoints, read from the OpenAPI document on
 * 2026-10-20. The document types `config` and `answers` as integer arrays,
 * which is how it renders raw JSON; the shapes below are the ones the form
 * builder already reads and writes.
 */

interface ApiPublicLocation {
  city?: string
  market_code?: string
  subdivision?: string
  timezone?: string
}

interface ApiPublicPay {
  currency?: string
  min?: number
  max?: number
  period?: string
  type?: string
}

/** One question of the frozen application form. Same fields as the builder's, plus `sensitive`. */
interface ApiPublicQuestion extends ApiFormQuestion {
  sensitive?: boolean
}

interface ApiPublicJob {
  title?: string
  company?: string
  department?: string
  employment_type?: string
  workplace_type?: string
  location_mode?: string
  location_text?: string
  locations?: ApiPublicLocation[]
  pay?: ApiPublicPay
  /** Read back as `{ html }` per section, as on the employer's job. */
  description_sections?: Record<string, string | { html?: string }>
  description_text?: string
  questions?: ApiPublicQuestion[]
  skills?: string[]
  closing_date?: string
  job_code?: string
}

/** `open` while it takes applications; closed, paused and archived jobs say so. */
interface ApiPublicJobData {
  public_id?: string
  state?: string
  accepting?: boolean
  url?: string
  job?: ApiPublicJob
  markets?: string[]
  consent_required?: boolean
  privacy_contact_email?: string
  privacy_notice_url?: string
  privacy_notice_version?: string
}

/** The body `POST /public/jobs/{public_id}/applications` takes. */
interface ApiApplicationBody {
  /** Question id to answer: text, a number, option ids, or an upload token. */
  answers: Record<string, unknown>
  /** ISO 3166-1 alpha-2, one of the job's markets. */
  candidate_country?: string
  consent?: boolean
  privacy_notice_acknowledged?: boolean
  /** The `src` of the link the candidate came from. Anything else counts as direct. */
  source?: string
}

interface ApiUploadBody {
  question_id: string
  filename: string
  content_type: string
  size_bytes: number
}

/** A one-time URL to send the file to with the returned method and exactly these headers. */
interface ApiUploadTarget {
  url?: string
  method?: string
  headers?: Record<string, string>
  token?: string
  max_bytes?: number
  expires_at?: string
}

interface ApiApplicationReceipt {
  received?: boolean
}

export type {
  ApiApplicationBody,
  ApiApplicationReceipt,
  ApiPublicJob,
  ApiPublicJobData,
  ApiPublicLocation,
  ApiPublicPay,
  ApiPublicQuestion,
  ApiUploadBody,
  ApiUploadTarget,
}
