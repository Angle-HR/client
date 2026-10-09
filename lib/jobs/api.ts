import type {
  ApiJobListItem,
  ApiListPerson,
  ApiPerson,
  ApiTemplate,
  JobListQuery,
} from './api-types'
import type { JobTemplate } from './templates'
import type { Job, JobEmploymentType, JobManager, JobStatus, JobWorkplace } from './types'
import type { AvatarColour } from '@/components/ui'

/**
 * Between the hiring API and the jobs screens: API rows in, the screens' types
 * out, and the screens' actions back out as the API's paths and parameters.
 *
 * Where the API has no value for something a screen shows, the comment on that
 * field says what stands in.
 */

const COLOURS: AvatarColour[] = [
  'green',
  'purple',
  'aqua',
  'orange',
  'yellow',
  'blue',
  'fuchsia',
  'red',
  'grey',
  'teal',
]

/** The same person always gets the same initials tint. */
function colourFor(key: string): AvatarColour {
  let hash = 0
  for (const character of key) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return COLOURS[hash % COLOURS.length] ?? 'grey'
}

function toManager(person: ApiListPerson | ApiPerson): JobManager {
  const name = person.name?.trim() || 'Unknown'
  return { id: person.user_id, name, colour: colourFor(person.user_id || name) }
}

// The API calls a live job "published"; the screens call it open.
const STATUS_FROM_API: Record<string, JobStatus> = {
  published: 'open',
  paused: 'paused',
  draft: 'draft',
  // Not live yet, and listed with the drafts until the design says otherwise.
  scheduled: 'draft',
  closed: 'closed',
  archived: 'archived',
  expired: 'expired',
}

const STATUS_TO_API: Record<JobStatus, string> = {
  open: 'published',
  paused: 'paused',
  draft: 'draft',
  closed: 'closed',
  archived: 'archived',
  expired: 'expired',
}

function toStatus(status: string | undefined): JobStatus {
  return STATUS_FROM_API[status ?? ''] ?? 'draft'
}

const EMPLOYMENT_FROM_API: Record<string, JobEmploymentType> = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  internship: 'Internship',
}

const WORKPLACE_FROM_API: Record<string, JobWorkplace> = {
  onsite: 'On-site',
  hybrid: 'Hybrid',
  remote: 'Remote',
}

const invert = <T extends string>(map: Record<string, T>): Record<T, string> =>
  Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key])) as Record<T, string>

const EMPLOYMENT_TO_API = invert(EMPLOYMENT_FROM_API)
const WORKPLACE_TO_API = invert(WORKPLACE_FROM_API)

/** "2026-10-08T12:00:00Z" → "2026-10-08"; anything else, empty. */
const day = (timestamp: string | undefined): string => timestamp?.slice(0, 10) ?? ''

function toJob(row: ApiJobListItem): Job {
  const created = day(row.created_at)
  const updated = day(row.updated_at) || created
  const creator = row.created_by?.trim() || 'Unknown'
  return {
    id: row.id ?? '',
    title: row.title?.trim() || 'Untitled job',
    department: row.department_name ?? '',
    employmentType: EMPLOYMENT_FROM_API[row.employment_type ?? ''] ?? 'Full-time',
    // A row carries market codes rather than place names.
    location:
      row.location_mode === 'anywhere' ? 'Anywhere' : (row.markets ?? []).join(', ') || 'Anywhere',
    workplace: WORKPLACE_FROM_API[row.workplace_type ?? ''] ?? 'Remote',
    status: toStatus(row.status),
    managers: (row.managers ?? []).map(toManager),
    createdBy: { name: creator, colour: colourFor(creator) },
    totalApplicants: row.applicant_count ?? 0,
    // The API has no count of new applicants.
    newApplicants: 0,
    // A job that has never been published is dated by when it was created.
    postedAt: day(row.published_at) || created,
    createdAt: created,
    lastModifiedAt: updated,
    // The API does not record when a job was last viewed.
    lastViewedAt: updated,
    closingDate: day(row.closing_date) || undefined,
    revision: row.revision,
  }
}

/** Company templates only: the caller's personal default is not a template row. */
function toTemplate(row: ApiTemplate, currentUser?: string): JobTemplate {
  const creator = row.created_by?.trim() || 'Unknown'
  return {
    id: row.id ?? '',
    title: row.name?.trim() || 'Untitled template',
    // A template row does not say which department or employment type it holds.
    department: '',
    employmentType: 'Full-time',
    createdBy: { name: creator, colour: colourFor(creator) },
    visibility: row.is_default ? 'Just me' : 'Everyone',
    timesUsed: row.use_count ?? 0,
    lastUsedAt: day(row.last_used_at) || day(row.updated_at),
    pinned: row.pinned ?? false,
    ownedByMe: currentUser !== undefined && row.created_by === currentUser,
  }
}

/**
 * The single-job action that takes a job from one status to another, as the
 * path segment of `POST /jobs/{id}/{action}`; null where there is none.
 * Jobs expire by themselves when their closing date passes.
 */
function transitionFor(from: JobStatus, to: JobStatus): string | null {
  if (from === to) return null
  switch (to) {
    case 'open':
      return from === 'draft' ? 'publish' : from === 'paused' ? 'resume' : 'reopen'
    case 'paused':
      return 'pause'
    case 'closed':
      return 'close'
    case 'archived':
      return 'archive'
    case 'draft':
      return 'to-draft'
    case 'expired':
      return null
  }
}

/** The statuses `POST /jobs/bulk` can move jobs to; the rest go one job at a time. */
const BULK_ACTIONS: Partial<Record<JobStatus, string>> = {
  paused: 'pause',
  closed: 'close',
  archived: 'archive',
  draft: 'to-draft',
}

/** Query parameters for `GET /jobs`, leaving out everything unset. */
function jobListParams(query: JobListQuery): Record<string, string> {
  const params: Record<string, string | undefined> = {
    status: query.status?.length ? query.status.join(',') : undefined,
    department_id: query.departmentId,
    q: query.q?.trim() || undefined,
    created_by: query.createdBy,
    assignee: query.assignee,
    employment_type: query.employmentType,
    workplace_type: query.workplaceType,
    location_mode: query.locationMode,
    market: query.market,
    created_from: query.createdFrom,
    created_to: query.createdTo,
    sort: query.sort,
    order: query.order,
    cursor: query.cursor,
    limit: query.limit === undefined ? undefined : String(query.limit),
  }
  return Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])),
  )
}

export {
  BULK_ACTIONS,
  EMPLOYMENT_TO_API,
  STATUS_TO_API,
  WORKPLACE_TO_API,
  colourFor,
  jobListParams,
  toJob,
  toManager,
  toStatus,
  toTemplate,
  transitionFor,
}
