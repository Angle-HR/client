import type {
  ApiApplicationAnswer,
  ApiApplicationDetail,
  ApiApplicationSummary,
  ApplicationListQuery,
} from './api-types'

type ApplicationStatus = 'received' | 'in_review' | 'flagged' | 'rejected' | 'hired' | 'withdrawn'

/** Tab order, and the label each status shows under. */
const APPLICATION_STATUSES: ReadonlyArray<{ key: ApplicationStatus; label: string }> = [
  { key: 'received', label: 'Received' },
  { key: 'in_review', label: 'In review' },
  { key: 'flagged', label: 'Flagged' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'withdrawn', label: 'Withdrawn' },
]

/** The next statuses `POST .../status` accepts. Flagged ones are decided through their review. */
const STATUS_TARGETS: Record<ApplicationStatus, ApplicationStatus[]> = {
  received: ['in_review', 'withdrawn'],
  in_review: ['rejected', 'hired', 'withdrawn'],
  flagged: [],
  rejected: [],
  hired: [],
  withdrawn: [],
}

interface Applicant {
  id: string
  name: string
  email: string
  country: string
  source: string
  status: ApplicationStatus
  flagCount: number
  hasFiles: boolean
  isNew: boolean
  submittedAt: string
}

interface ApplicantAnswer {
  questionId: string
  label: string
  section: string
  /** The answer as text. Empty for a file, which shows its link instead. */
  text: string
  fileId?: string
}

interface ApplicantDetail extends Applicant {
  answers: ApplicantAnswer[]
  canDecide: boolean
  statusNote: string
  decidedAt: string
  consentGivenAt: string
  retentionUntil: string
  reviewNote: string
}

function toStatus(status: string | undefined): ApplicationStatus {
  return APPLICATION_STATUSES.some((item) => item.key === status)
    ? (status as ApplicationStatus)
    : 'received'
}

function toApplicant(row: ApiApplicationSummary): Applicant {
  return {
    id: row.id ?? '',
    name: row.name ?? '',
    email: row.email ?? '',
    country: row.country ?? '',
    source: row.source ?? 'direct',
    status: toStatus(row.status),
    flagCount: row.flag_count ?? 0,
    hasFiles: row.has_files ?? false,
    isNew: row.opened === false,
    submittedAt: row.submitted_at ?? '',
  }
}

/** An answer's value as text: strings and numbers as they are, lists joined, anything else as JSON. */
function answerText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(answerText).filter(Boolean).join(', ')
  return JSON.stringify(value)
}

function toAnswer(answer: ApiApplicationAnswer): ApplicantAnswer {
  return {
    questionId: answer.question_id ?? '',
    label: answer.label ?? '',
    section: answer.section ?? '',
    text: answer.file_id ? '' : answerText(answer.value),
    fileId: answer.file_id || undefined,
  }
}

function toApplicantDetail(row: ApiApplicationDetail): ApplicantDetail {
  return {
    ...toApplicant(row),
    answers: (row.answers ?? []).map(toAnswer),
    canDecide: row.can_decide ?? false,
    statusNote: row.status_note ?? '',
    decidedAt: row.decided_at ?? '',
    consentGivenAt: row.consent_given_at ?? '',
    retentionUntil: row.retention_until ?? '',
    reviewNote: row.review?.note ?? '',
  }
}

/** The query string the list takes: `status` is sent comma separated. */
function applicationListParams(
  query: ApplicationListQuery,
  cursor?: string,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}
  if (query.status?.length) params.status = query.status.join(',')
  if (query.source) params.source = query.source
  if (query.q?.trim()) params.q = query.q.trim()
  if (query.new) params.new = true
  if (query.limit) params.limit = query.limit
  if (cursor) params.cursor = cursor
  return params
}

export {
  APPLICATION_STATUSES,
  STATUS_TARGETS,
  applicationListParams,
  answerText,
  toApplicant,
  toApplicantDetail,
}
export type { Applicant, ApplicantAnswer, ApplicantDetail, ApplicationStatus }
