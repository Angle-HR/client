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

/** `GET /jobs/counts`: how many jobs there are, in all and in each status. */
interface ApiJobCounts {
  all?: number
  by_status?: Record<string, number>
}

/** `GET /hiring/me`: the signed-in person in the hiring workspace. */
interface ApiHiringMe {
  user_id?: string
  company_name?: string
  /** The registered address from onboarding; empty when there is none. */
  company_address?: string
  roles?: string[]
  permissions?: string[]
}

/** A row of `GET /hiring/people`. */
interface ApiPerson {
  user_id?: string
  name?: string
  email?: string
  roles?: string[]
}

/** A row of `GET /jobs/{id}/members`: someone on the job's hiring team. The creator is not listed. */
interface ApiJobMember {
  user_id?: string
  name?: string
  email?: string
  role?: string
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

/** One problem the publish check or the publish call found. Figma: the compliance check, 9270:377288. */
interface ApiPublishIssue {
  code?: string
  message?: string
  severity?: string
  path?: string
  gate_id?: string
}

/** A compliance gate of the job's markets, and whether it is confirmed. */
interface ApiPublishGate {
  id?: string
  market_code?: string
  severity?: string
  requirement?: string
  legal_basis?: string
  version?: string
  auto?: boolean
  confirmed?: boolean
  stale?: boolean
  detail?: string
  platform?: string
}

/** `GET /jobs/{id}/publish-check`: a dry run that writes nothing. */
interface ApiPublishCheck {
  blocking?: ApiPublishIssue[]
  warnings?: ApiPublishIssue[]
  gates?: ApiPublishGate[]
}

/** `POST /jobs/{id}/publish`. A blocked job is refused with 422 PUBLISH_BLOCKED instead. */
interface ApiPublishResult {
  job?: ApiJobView
  warnings?: ApiPublishIssue[]
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

/** A place a job hires in. `market_code` is always required. */
interface ApiJobMarket {
  market_code?: string
  city?: string
  timezone?: string
}

/** A skill from the catalogue, or one the user typed. */
interface ApiJobSkill {
  skill_id?: string
  name?: string
  custom_label?: string
}

interface ApiJobPay {
  type?: string
  currency?: string
  period?: string
  min?: number | null
  max?: number | null
  visible?: boolean
}

/** The job-details fields, as `POST /jobs`, `PATCH /jobs/{id}` and `PUT /jobs/{id}/details` take them. */
interface ApiJobBody {
  title?: string
  department_id?: string
  closing_date?: string
  location_mode?: string
  location_text?: string
  use_company_address?: boolean
  show_on_career_page?: boolean
  workplace_type?: string
  travel_frequency?: string
  visa_sponsorship?: string
  /** Sent as HTML per section; read back as `{ html }`. */
  description_sections?: Record<string, string | { html?: string }>
  industry_id?: string
  custom_industry?: string
  employment_type?: string
  seniority_level_id?: string
  experience_range_id?: string
  pay?: ApiJobPay
  skills?: ApiJobSkill[]
  markets?: ApiJobMarket[]
  /** `POST /jobs` only: the template the job starts from. */
  template_id?: string
}

/** `GET /jobs/{id}`: one job in full. */
interface ApiJobView extends ApiJobBody {
  id?: string
  job_code?: string
  status?: string
  revision?: number
  department_name?: string
  created_by?: string
}

/** A choice option. The API gives it an id once the form is saved. */
interface ApiFormOption {
  id?: string
  label?: string
}

/** The config a question takes: choice options, a linear scale, or upload limits. */
interface ApiFormConfig {
  options?: ApiFormOption[]
  min?: number
  max?: number
  min_label?: string
  max_label?: string
  accept?: string[]
  max_mb?: number
}

/** One question of `GET` and `PUT /jobs/{id}/application-form`. */
interface ApiFormQuestion {
  /** Absent on a question not yet saved; the server assigns it. */
  id?: string
  /** personal_information | profile | eligibility | screening */
  section?: string
  position?: number
  /** e.g. short_text, phone_number, single_choice, file_upload. */
  type?: string
  label?: string
  description?: string
  helper_text?: string
  required?: boolean
  /** Set by the server; a locked question cannot be removed or made optional. */
  locked?: boolean
  system_key?: string | null
  config?: ApiFormConfig
  /** Not drawn in the design; sent back as received. */
  knockout?: unknown
  special_category?: unknown
}

/** A special category the candidate is asked about. */
interface ApiFormDeclaration {
  /** health_disability | race_ethnicity | religion_belief | criminal_records */
  category?: string
  legal_condition?: string
  purpose?: string
}

/** The body `PUT /jobs/{id}/application-form` takes. It replaces the whole form. */
interface ApiApplicationFormBody {
  questions?: ApiFormQuestion[]
  declarations?: ApiFormDeclaration[]
}

/** `GET /jobs/{id}/application-form`: the form for one job. */
interface ApiApplicationForm extends ApiApplicationFormBody {
  job_id?: string
  job_revision?: number
  automated_screening_enabled?: boolean
  warnings?: unknown[]
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
  ApiApplicationForm,
  ApiApplicationFormBody,
  ApiBulkResult,
  ApiPublishCheck,
  ApiPublishGate,
  ApiPublishIssue,
  ApiPublishResult,
  ApiCatalog,
  ApiCatalogItem,
  ApiDepartment,
  ApiFormConfig,
  ApiFormDeclaration,
  ApiFormOption,
  ApiFormQuestion,
  ApiHiringMe,
  ApiJobBody,
  ApiJobCounts,
  ApiJobListItem,
  ApiJobMarket,
  ApiJobPay,
  ApiJobSkill,
  ApiJobView,
  ApiListPerson,
  ApiOption,
  ApiJobMember,
  ApiPerson,
  ApiTemplate,
  ApiTemplateExport,
  ApiTimezone,
  JobListQuery,
}
