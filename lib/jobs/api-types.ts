/**
 * The hiring API's own shapes, as its OpenAPI document gives them (read on
 * 2026-10-09). Every field is optional there, so every field is optional here;
 * `lib/jobs/api.ts` turns these into the types the screens use.
 */

/** A row of `GET /jobs`. */
interface ApiJobListItem {
  id?: string
  title?: string
  job_code?: string
  status?: string
  department_name?: string
  employment_type?: string
  workplace_type?: string
  location_mode?: string
  /** Market codes, e.g. "UK". */
  markets?: string[]
  managers?: ApiListPerson[]
  created_by?: string
  /** Always 0 until candidate applications exist in the API. */
  applicant_count?: number
  created_at?: string
  updated_at?: string
  published_at?: string
  closing_date?: string
  current_step?: string
  /** Sent back as `If-Match` when the job is changed. */
  revision?: number
}

interface ApiListPerson {
  user_id?: string
  name?: string
}

/** A row of `GET /hiring/people`. */
interface ApiPerson {
  user_id?: string
  name?: string
  email?: string
  roles?: string[]
}

/** A row of `GET /hiring/templates`. */
interface ApiTemplate {
  id?: string
  name?: string
  kind?: string
  /** The caller's own "keep this setup" default, not a company template. */
  is_default?: boolean
  created_by?: string
  pinned?: boolean
  use_count?: number
  last_used_at?: string
  updated_at?: string
  payload?: unknown
}

interface ApiTemplateExport {
  version?: number
  kind?: string
  name?: string
  payload?: unknown
}

/** `POST /jobs/bulk`: what changed, and what could not be. */
interface ApiBulkResult {
  action?: string
  done?: { id?: string; before?: string; after?: string }[]
  skipped?: { id?: string; reason?: string }[]
}

interface ApiDepartment {
  id?: string
  name?: string
}

interface ApiTimezone {
  name?: string
  offset?: string
  offset_seconds?: number
}

interface ApiCatalogItem {
  id?: string
  name?: string
  slug?: string
}

interface ApiOption {
  value?: string
  label?: string
}

/** `GET /hiring/catalog`: the job form's pick lists. */
interface ApiCatalog {
  currencies?: string[]
  employment_types?: ApiOption[]
  workplace_types?: ApiOption[]
  location_modes?: ApiOption[]
  travel_frequencies?: ApiOption[]
  visa_policies?: ApiOption[]
  pay_periods?: ApiOption[]
  pay_types?: ApiOption[]
  seniority_levels?: ApiCatalogItem[]
  experience_ranges?: ApiCatalogItem[]
  industries?: ApiCatalogItem[]
  markets?: { code?: string; name?: string; is_open?: boolean; currencies?: string[] }[]
  max_title_length?: number
}

/** The filters and ordering `GET /jobs` accepts. */
interface JobListQuery {
  status?: string[]
  departmentId?: string
  q?: string
  createdBy?: string
  assignee?: string
  employmentType?: string
  workplaceType?: string
  locationMode?: string
  market?: string
  createdFrom?: string
  createdTo?: string
  sort?: 'updated_at' | 'created_at'
  order?: 'asc' | 'desc'
  cursor?: string
  limit?: number
}

export type {
  ApiBulkResult,
  ApiCatalog,
  ApiCatalogItem,
  ApiDepartment,
  ApiJobListItem,
  ApiListPerson,
  ApiOption,
  ApiPerson,
  ApiTemplate,
  ApiTemplateExport,
  ApiTimezone,
  JobListQuery,
}
