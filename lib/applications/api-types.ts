/**
 * The recruiter side of applications (`/jobs/{id}/applications`), read from
 * the OpenAPI document on 2026-10-20. The document types `value`, `flags` and
 * `reasons` as integer arrays, which is how it renders raw JSON; they are
 * `unknown` here and read by the mappers.
 */

/** received | in_review | flagged | rejected | hired | withdrawn */
type ApiApplicationStatus = string

/** One row of the list. Rows carry no answers. */
interface ApiApplicationSummary {
  id?: string
  name?: string
  email?: string
  country?: string
  market?: string
  source?: string
  status?: ApiApplicationStatus
  flag_count?: number
  has_files?: boolean
  /** False until somebody opens the application. */
  opened?: boolean
  submitted_at?: string
}

/** `GET /jobs/{id}/applications`: one page, newest first. `counts` are for the whole job. */
interface ApiApplicationPage {
  items?: ApiApplicationSummary[]
  counts?: Record<string, number>
  next_cursor?: string
}

interface ApiApplicationAnswer {
  question_id?: string
  label?: string
  section?: string
  type?: string
  value?: unknown
  /** Set on a file answer: ask `.../files/{file_id}` for a link. */
  file_id?: string
}

interface ApiApplicationFile {
  id?: string
  question_id?: string
  filename?: string
  content_type?: string
  size_bytes?: number
}

interface ApiApplicationReview {
  status?: string
  decision?: string
  note?: string
  reasons?: unknown
  decided_at?: string
  opened_by_me?: boolean
}

/** `GET /jobs/{id}/applications/{app_id}`. Opening an application is recorded. */
interface ApiApplicationDetail extends ApiApplicationSummary {
  job_id?: string
  answers?: ApiApplicationAnswer[]
  files?: ApiApplicationFile[]
  flags?: unknown
  review?: ApiApplicationReview
  can_decide?: boolean
  status_note?: string
  decided_at?: string
  consent_given_at?: string
  privacy_notice_version?: string
  form_version?: number
  retention_until?: string
}

/** What the filters of the list take. `status` may be repeated. */
interface ApplicationListQuery {
  status?: string[]
  source?: string
  q?: string
  new?: boolean
  limit?: number
}

/** `proceed` moves a flagged application to in_review; `reject` rejects it. */
type ApplicationDecision = 'proceed' | 'reject'

interface ApiApplicationResult {
  status?: string
  decided_at?: string
}

interface ApiFileLink {
  url?: string
  filename?: string
  expires_at?: string
}

export type {
  ApiApplicationAnswer,
  ApiApplicationDetail,
  ApiApplicationFile,
  ApiApplicationPage,
  ApiApplicationResult,
  ApiApplicationReview,
  ApiApplicationStatus,
  ApiApplicationSummary,
  ApiFileLink,
  ApplicationDecision,
  ApplicationListQuery,
}
