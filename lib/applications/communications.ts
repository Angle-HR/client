/**
 * Everything a recruiter sends or schedules for one candidate: emails and their
 * files, interviews, and offers, plus the company's templates for each.
 * Read from the OpenAPI document (`.../emails`, `.../interviews`, `.../offers`,
 * `/hiring/email-templates`, `/hiring/offer-templates`).
 */

/** scheduled | queued | sent | failed | cancelled */
type MessageStatus = string

interface ApiAttachment {
  id?: string
  filename?: string
  content_type?: string
  size?: number
}

interface Attachment {
  id: string
  filename: string
  contentType: string
  sizeBytes: number
}

interface ApiMessage {
  id?: string
  subject?: string
  body?: string
  status?: MessageStatus
  error?: string
  sender_id?: string
  template_id?: string
  scheduled_at?: string
  sent_at?: string
  created_at?: string
  attachments?: ApiAttachment[]
}

interface Message {
  id: string
  subject: string
  body: string
  status: MessageStatus
  error: string
  senderId: string
  templateId: string
  scheduledAt: string
  sentAt: string
  createdAt: string
  attachments: Attachment[]
}

/** What is sent to write a message: the template is optional, the recipient is never sent. */
interface MessageBody {
  subject: string
  body: string
  template_id?: string
  /** An RFC 3339 time a minute to 90 days ahead; omitted to send now. */
  schedule_at?: string
  attachment_ids?: string[]
}

interface ApiEmailTemplate {
  id?: string
  name?: string
  subject?: string
  body?: string
  updated_at?: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  updatedAt: string
}

/** The words a message or template may use between double braces. */
const PLACEHOLDERS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'candidate_name', label: 'Candidate name' },
  { key: 'job_title', label: 'Job title' },
  { key: 'company', label: 'Company' },
  { key: 'sender_name', label: 'Your name' },
]

/** Offer letters may also use these. */
const OFFER_PLACEHOLDERS: ReadonlyArray<{ key: string; label: string }> = [
  ...PLACEHOLDERS,
  { key: 'start_date', label: 'Start date' },
  { key: 'compensation', label: 'Compensation' },
]

type InterviewKind = 'video' | 'phone' | 'onsite'

const INTERVIEW_KINDS: ReadonlyArray<{ key: InterviewKind; label: string; hint: string }> = [
  { key: 'video', label: 'Video call', hint: 'Meeting link (https://…)' },
  { key: 'phone', label: 'Phone call', hint: '' },
  { key: 'onsite', label: 'On site', hint: 'Address' },
]

interface ApiInterview {
  id?: string
  job_id?: string
  application_id?: string
  candidate_name?: string
  job_title?: string
  job_code?: string
  kind?: string
  location?: string
  notes?: string
  starts_at?: string
  ends_at?: string
  duration_minutes?: number
  timezone?: string
  interviewer_ids?: string[]
  status?: string
  created_by?: string
}

interface Interview {
  id: string
  jobId: string
  applicationId: string
  candidateName: string
  jobTitle: string
  kind: InterviewKind
  location: string
  notes: string
  startsAt: string
  endsAt: string
  durationMinutes: number
  timezone: string
  interviewerIds: string[]
  /** scheduled | completed | cancelled */
  status: string
}

/** What schedules or reschedules an interview. */
interface InterviewBody {
  starts_at: string
  timezone: string
  duration_minutes: number
  kind: InterviewKind
  location?: string
  notes?: string
  interviewer_ids?: string[]
  /** Email the candidate a calendar invite. */
  invite?: boolean
  invite_note?: string
}

interface ApiOffer {
  id?: string
  application_id?: string
  title?: string
  body?: string
  compensation?: string
  start_date?: string
  expires_at?: string
  status?: string
  sent_at?: string
  viewed_at?: string
  signed_at?: string
  signed_name?: string
  declined_at?: string
  decline_reason?: string
  has_document?: boolean
  created_at?: string
}

interface Offer {
  id: string
  title: string
  body: string
  compensation: string
  startDate: string
  expiresAt: string
  /** draft | sent | viewed | signed | declined | expired | withdrawn */
  status: string
  sentAt: string
  viewedAt: string
  signedAt: string
  signedName: string
  declinedAt: string
  declineReason: string
  hasDocument: boolean
  createdAt: string
}

interface OfferBody {
  title: string
  body: string
  compensation?: string
  start_date?: string
  template_id?: string
  expires_in_days?: number
  /** Send at once instead of saving a draft. */
  send?: boolean
}

interface ApiOfferTemplate {
  id?: string
  name?: string
  body?: string
  updated_at?: string
}

interface OfferTemplate {
  id: string
  name: string
  body: string
  updatedAt: string
}

interface ApiOfferEvent {
  id?: number
  type?: string
  actor_id?: string
  created_at?: string
  ip?: string
  user_agent?: string
}

interface OfferEvent {
  id: number
  type: string
  at: string
  ip: string
  userAgent: string
}

const OFFER_EVENT_LABELS: Record<string, string> = {
  created: 'Offer created',
  sent: 'Offer sent',
  viewed: 'Candidate opened the offer',
  signed: 'Candidate signed',
  declined: 'Candidate declined',
  withdrawn: 'Offer withdrawn',
  expired: 'Offer expired',
}

function toAttachment(row: ApiAttachment): Attachment {
  return {
    id: row.id ?? '',
    filename: row.filename ?? 'File',
    contentType: row.content_type ?? '',
    sizeBytes: row.size ?? 0,
  }
}

function toMessage(row: ApiMessage): Message {
  return {
    id: row.id ?? '',
    subject: row.subject ?? '',
    body: row.body ?? '',
    status: row.status ?? '',
    error: row.error ?? '',
    senderId: row.sender_id ?? '',
    templateId: row.template_id ?? '',
    scheduledAt: row.scheduled_at ?? '',
    sentAt: row.sent_at ?? '',
    createdAt: row.created_at ?? '',
    attachments: (row.attachments ?? []).map(toAttachment),
  }
}

function toEmailTemplate(row: ApiEmailTemplate): EmailTemplate {
  return {
    id: row.id ?? '',
    name: row.name ?? '',
    subject: row.subject ?? '',
    body: row.body ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

function toInterview(row: ApiInterview): Interview {
  const kind = (['video', 'phone', 'onsite'] as const).find((item) => item === row.kind) ?? 'video'
  return {
    id: row.id ?? '',
    jobId: row.job_id ?? '',
    applicationId: row.application_id ?? '',
    candidateName: row.candidate_name ?? '',
    jobTitle: row.job_title ?? '',
    kind,
    location: row.location ?? '',
    notes: row.notes ?? '',
    startsAt: row.starts_at ?? '',
    endsAt: row.ends_at ?? '',
    durationMinutes: row.duration_minutes ?? 0,
    timezone: row.timezone ?? '',
    interviewerIds: row.interviewer_ids ?? [],
    status: row.status ?? '',
  }
}

function toOffer(row: ApiOffer): Offer {
  return {
    id: row.id ?? '',
    title: row.title ?? '',
    body: row.body ?? '',
    compensation: row.compensation ?? '',
    startDate: row.start_date ?? '',
    expiresAt: row.expires_at ?? '',
    status: row.status ?? '',
    sentAt: row.sent_at ?? '',
    viewedAt: row.viewed_at ?? '',
    signedAt: row.signed_at ?? '',
    signedName: row.signed_name ?? '',
    declinedAt: row.declined_at ?? '',
    declineReason: row.decline_reason ?? '',
    hasDocument: row.has_document ?? false,
    createdAt: row.created_at ?? '',
  }
}

function toOfferTemplate(row: ApiOfferTemplate): OfferTemplate {
  return {
    id: row.id ?? '',
    name: row.name ?? '',
    body: row.body ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

function toOfferEvent(row: ApiOfferEvent): OfferEvent {
  return {
    id: row.id ?? 0,
    type: row.type ?? '',
    at: row.created_at ?? '',
    ip: row.ip ?? '',
    userAgent: row.user_agent ?? '',
  }
}

/** An offer a person can still act on: sent, or a draft to finish. */
function isLiveOffer(offer: Offer): boolean {
  return offer.status === 'draft' || offer.status === 'sent' || offer.status === 'viewed'
}

/** How a message is shown: where it stands for the candidate. */
function messageState(message: Message): { label: string; tone: 'ok' | 'wait' | 'bad' | 'off' } {
  switch (message.status) {
    case 'sent':
      return { label: 'Sent', tone: 'ok' }
    case 'queued':
      return { label: 'Sending', tone: 'wait' }
    case 'scheduled':
      return { label: 'Scheduled', tone: 'wait' }
    case 'failed':
      return { label: 'Could not be sent', tone: 'bad' }
    case 'cancelled':
      return { label: 'Cancelled', tone: 'off' }
    default:
      return { label: message.status, tone: 'off' }
  }
}

/** Fills `{{placeholders}}` the way the preview shows them, leaving unknown ones as typed. */
function fillPlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (whole, key: string) => values[key] ?? whole)
}

function offerEventLabel(event: OfferEvent): string {
  return OFFER_EVENT_LABELS[event.type] ?? event.type
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Types the server takes as an attachment, and the most it takes. */
const ATTACHMENT_ACCEPT = '.pdf,.docx,.png,.jpg,.jpeg,.txt'
const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024
const MAX_ATTACHMENTS_PER_MESSAGE = 3

export {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_BYTES,
  INTERVIEW_KINDS,
  MAX_ATTACHMENTS_PER_MESSAGE,
  OFFER_PLACEHOLDERS,
  PLACEHOLDERS,
  fillPlaceholders,
  formatFileSize,
  isLiveOffer,
  messageState,
  offerEventLabel,
  toAttachment,
  toEmailTemplate,
  toInterview,
  toMessage,
  toOffer,
  toOfferEvent,
  toOfferTemplate,
}
export type {
  ApiAttachment,
  ApiInterview,
  ApiMessage,
  ApiOffer,
  ApiOfferEvent,
  ApiOfferTemplate,
  ApiEmailTemplate,
  Attachment,
  EmailTemplate,
  Interview,
  InterviewBody,
  InterviewKind,
  Message,
  MessageBody,
  MessageStatus,
  Offer,
  OfferBody,
  OfferEvent,
  OfferTemplate,
}
