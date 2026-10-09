import type {
  ApiJobBody,
  ApiJobListItem,
  ApiListPerson,
  ApiPerson,
  ApiTemplate,
  JobListQuery,
} from './api-types'
import type { JobFilter, JobSort } from './filters'
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

/** Names for the ids a row only carries as ids: people and departments. */
interface Lookups {
  /** user id → name */
  people?: ReadonlyMap<string, string>
  /** department id → name */
  departments?: ReadonlyMap<string, string>
  /** The signed-in person's user id. */
  me?: string
}

function toJob(row: ApiJobListItem, lookups: Lookups = {}): Job {
  const created = day(row.created_at)
  const updated = day(row.updated_at) || created
  // `created_by` is a user id; the name comes from the workspace's people.
  const creatorId = row.created_by ?? ''
  const creator = lookups.people?.get(creatorId) ?? 'Unknown'
  return {
    id: row.id ?? '',
    title: row.title?.trim() || 'Untitled job',
    department: row.department_name ?? '',
    employmentType: EMPLOYMENT_FROM_API[row.employment_type ?? ''] ?? '',
    // A row carries market codes rather than place names.
    location: row.location_mode === 'anywhere' ? 'Anywhere' : (row.markets ?? []).join(', '),
    workplace: WORKPLACE_FROM_API[row.workplace_type ?? ''] ?? '',
    status: toStatus(row.status),
    managers: (row.managers ?? []).map(toManager),
    createdBy: {
      id: creatorId || undefined,
      name: creator,
      colour: colourFor(creatorId || creator),
    },
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

function toTemplate(row: ApiTemplate, lookups: Lookups = {}): JobTemplate {
  const creatorId = row.created_by ?? ''
  const creator = lookups.people?.get(creatorId) ?? 'Unknown'
  // A job-details template holds the job-details fields.
  const payload = (row.payload ?? {}) as ApiJobBody
  return {
    id: row.id ?? '',
    title: row.name?.trim() || 'Untitled template',
    department: lookups.departments?.get(payload.department_id ?? '') ?? '',
    employmentType: EMPLOYMENT_FROM_API[payload.employment_type ?? ''] ?? '',
    createdBy: {
      id: creatorId || undefined,
      name: creator,
      colour: colourFor(creatorId || creator),
    },
    // A personal default is the caller's own; everything else is the company's.
    visibility: row.is_default ? 'Just me' : 'Everyone',
    timesUsed: row.use_count ?? 0,
    lastUsedAt: day(row.last_used_at) || day(row.updated_at),
    pinned: row.pinned ?? false,
    ownedByMe: lookups.me !== undefined && creatorId === lookups.me,
    details: payload,
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
  // The bulk endpoint spells it with an underscore; the single-job path with a hyphen.
  draft: 'to_draft',
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

interface ServerQueryInput {
  search: string
  filters: JobFilter[]
  sort: JobSort | null
  /** The workspace's people, to turn a chosen name into the user id the API filters by. */
  people: JobManager[]
  today?: Date
}

const CREATED_WITHIN_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '12m': 365 }

/**
 * The part of the page's search, filters and sort that `GET /jobs` can apply
 * itself. It only ever narrows: the page still applies everything to what
 * comes back, so a filter the API cannot express — several values, "is not",
 * "and", applicant counts, the other sorts — simply stays local.
 */
function serverJobQuery({
  search,
  filters,
  sort,
  people,
  today = new Date(),
}: ServerQueryInput): JobListQuery {
  const query: JobListQuery = {}
  if (search.trim()) query.q = search.trim()

  const userId = (name: string) => people.find((person) => person.name === name)?.id

  for (const filter of filters) {
    if (filter.operator !== 'is' || filter.values.length === 0) continue
    const [only] = filter.values
    const single = filter.values.length === 1 ? only : undefined

    switch (filter.field) {
      case 'status':
        // The one filter the API takes several values for.
        query.status = filter.values.map((value) => STATUS_TO_API[value as JobStatus])
        break
      case 'employmentType':
        if (single && EMPLOYMENT_TO_API[single as JobEmploymentType]) {
          query.employmentType = EMPLOYMENT_TO_API[single as JobEmploymentType]
        }
        break
      case 'createdBy':
        if (single) query.createdBy = userId(single)
        break
      case 'assignee':
      case 'managedBy':
        if (single) query.assignee = userId(single)
        break
      case 'location':
        if (single === 'Anywhere') query.locationMode = 'anywhere'
        else if (single && /^[A-Z]{2}$/.test(single)) query.market = single
        break
      case 'createdOn': {
        const days = single ? CREATED_WITHIN_DAYS[single] : undefined
        if (days) {
          const from = new Date(today)
          from.setDate(from.getDate() - days)
          query.createdFrom = localIso(from)
        }
        break
      }
      default:
        break
    }
  }

  if (sort?.field === 'dateCreated') {
    query.sort = 'created_at'
    query.order = sort.direction
  } else if (sort?.field === 'lastModified') {
    query.sort = 'updated_at'
    query.order = sort.direction
  }
  return query
}

const two = (value: number) => String(value).padStart(2, '0')
const localIso = (date: Date) =>
  `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}`

/**
 * What to tell the user when a call fails: the API's own message, with the
 * first field it names when it is a validation error.
 */
function apiMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const body = (error as { response?: { data?: { error?: ApiError } } })?.response?.data?.error
  if (!body?.message) return fallback
  const field = body.details?.fields?.[0]?.message
  return field ? capitalise(field) : capitalise(body.message)
}

interface ApiError {
  code?: string
  message?: string
  details?: { fields?: { path?: string; message?: string }[] }
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

export type { Lookups }
export {
  BULK_ACTIONS,
  apiMessage,
  serverJobQuery,
  EMPLOYMENT_FROM_API,
  EMPLOYMENT_TO_API,
  WORKPLACE_FROM_API,
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
