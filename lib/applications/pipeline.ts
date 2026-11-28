/**
 * The pipeline side of an application: a job's stages, company tags, notes, the
 * activity timeline and the disqualification reasons. Read from the OpenAPI
 * document (`/jobs/{id}/stages`, `.../notes`, `.../activity`, `/hiring/tags`).
 */

type StageKind =
  | 'applied'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'disqualified'
  | 'custom'

const STAGE_KINDS: ReadonlyArray<StageKind> = [
  'applied',
  'shortlisted',
  'interview',
  'offer',
  'hired',
  'disqualified',
  'custom',
]

interface ApiStage {
  id?: string
  key?: string
  name?: string
  kind?: string
  position?: number
  count?: number
  final?: boolean
}

interface PipelineStage {
  id: string
  key: string
  name: string
  kind: StageKind
  position: number
  /** Applications in the stage now. */
  count: number
  /** Hired and Disqualified end the application. */
  final: boolean
}

interface ApiTag {
  id?: string
  name?: string
  color?: string
}

/** The colours a tag can have, as the server lists them. */
const TAG_COLORS = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'purple',
  'pink',
] as const

type TagColor = (typeof TAG_COLORS)[number]

interface Tag {
  id: string
  name: string
  color: TagColor
}

interface ApiNote {
  id?: string
  author_id?: string
  body?: string
  mine?: boolean
  created_at?: string
  updated_at?: string
}

interface Note {
  id: string
  authorId: string
  body: string
  /** Written by the signed-in person: only theirs can be edited or deleted. */
  mine: boolean
  createdAt: string
  updatedAt: string
}

interface ApiActivityEvent {
  id?: number
  type?: string
  actor_id?: string
  actor_name?: string
  created_at?: string
  /** Raw JSON; the OpenAPI document renders it as an integer array. */
  data?: unknown
}

interface ApiActivityPage {
  items?: ApiActivityEvent[]
  next_cursor?: string
}

interface ActivityItem {
  id: number
  type: string
  actorId: string
  actorName: string
  at: string
  data: Record<string, unknown>
}

interface ApiReason {
  code?: string
  label?: string
}

interface DisqualifyReason {
  code: string
  label: string
}

/** Reasons that make the note required. */
const NOTE_REQUIRED_REASONS: ReadonlyArray<string> = ['other']

function toStage(row: ApiStage): PipelineStage {
  const kind = STAGE_KINDS.includes(row.kind as StageKind) ? (row.kind as StageKind) : 'custom'
  return {
    id: row.id ?? '',
    key: row.key ?? '',
    name: row.name ?? '',
    kind,
    position: row.position ?? 0,
    count: row.count ?? 0,
    final: row.final ?? false,
  }
}

function toTag(row: ApiTag): Tag {
  return {
    id: row.id ?? '',
    name: row.name ?? '',
    color: TAG_COLORS.includes(row.color as TagColor) ? (row.color as TagColor) : 'gray',
  }
}

function toNote(row: ApiNote): Note {
  return {
    id: row.id ?? '',
    authorId: row.author_id ?? '',
    body: row.body ?? '',
    mine: row.mine ?? false,
    createdAt: row.created_at ?? '',
    updatedAt: row.updated_at ?? '',
  }
}

function toReason(row: ApiReason): DisqualifyReason {
  return { code: row.code ?? '', label: row.label ?? '' }
}

function eventData(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return {}
}

function toActivity(row: ApiActivityEvent): ActivityItem {
  return {
    id: row.id ?? 0,
    type: row.type ?? '',
    actorId: row.actor_id ?? '',
    actorName: row.actor_name ?? '',
    at: row.created_at ?? '',
    data: eventData(row.data),
  }
}

function text(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function names(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

const STATUS_WORDS: Record<string, string> = {
  received: 'received',
  in_review: 'in review',
  flagged: 'flagged',
  rejected: 'disqualified',
  hired: 'hired',
  withdrawn: 'withdrawn',
}

/**
 * One timeline line as a sentence, without the person: "moved to Interview".
 * The status change that comes with a stage move is left out of the list by
 * `visibleActivity`, so each move reads once.
 */
function describeActivity(item: ActivityItem): string {
  const d = item.data
  switch (item.type) {
    case 'applied':
      return 'applied for the job'
    case 'stage_changed': {
      const to = text(d.to_stage) || 'another stage'
      const from = text(d.from_stage)
      return from ? `moved from ${from} to ${to}` : `moved to ${to}`
    }
    case 'status_changed': {
      const to = STATUS_WORDS[text(d.to)] ?? text(d.to)
      return to ? `marked the application ${to}` : 'changed the status'
    }
    case 'note_added':
      return 'added a note'
    case 'note_edited':
      return 'edited a note'
    case 'note_deleted':
      return 'deleted a note'
    case 'tags_changed': {
      const added = names(d.added)
      const removed = names(d.removed)
      const parts = [
        added.length ? `added ${added.join(', ')}` : '',
        removed.length ? `removed ${removed.join(', ')}` : '',
      ].filter(Boolean)
      return parts.length ? `${parts.join(' and ')} (tags)` : 'changed the tags'
    }
    case 'message_queued':
      return d.calendar === true ? 'sent a calendar invite' : 'wrote an email to the candidate'
    case 'message_sent':
      return 'the email was sent to the candidate'
    case 'message_cancelled':
      return 'cancelled a scheduled email'
    case 'interview_scheduled':
      return 'scheduled an interview'
    case 'interview_updated':
      return 'rescheduled an interview'
    case 'interview_cancelled':
      return 'cancelled an interview'
    case 'interview_completed':
      return 'marked an interview as held'
    case 'offer_sent':
      return 'sent an offer'
    default:
      return 'made a change'
  }
}

/**
 * The timeline without the status change a stage move already explains: both
 * are written in the same moment by the same person.
 */
function visibleActivity(items: ActivityItem[]): ActivityItem[] {
  return items.filter((item) => {
    if (item.type !== 'status_changed') return true
    return !items.some(
      (other) =>
        other.type === 'stage_changed' &&
        other.actorId === item.actorId &&
        Math.abs(new Date(other.at).getTime() - new Date(item.at).getTime()) < 2000,
    )
  })
}

function reasonNeedsNote(code: string): boolean {
  return NOTE_REQUIRED_REASONS.includes(code)
}

export {
  STAGE_KINDS,
  TAG_COLORS,
  describeActivity,
  reasonNeedsNote,
  toActivity,
  toNote,
  toReason,
  toStage,
  toTag,
  visibleActivity,
}
export type {
  ActivityItem,
  ApiActivityPage,
  ApiNote,
  ApiReason,
  ApiStage,
  ApiTag,
  DisqualifyReason,
  Note,
  PipelineStage,
  StageKind,
  Tag,
  TagColor,
}
