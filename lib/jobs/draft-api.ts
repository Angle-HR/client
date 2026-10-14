import { parseFutureDate } from './actions'
import { EMPLOYMENT_FROM_API, EMPLOYMENT_TO_API, WORKPLACE_FROM_API, WORKPLACE_TO_API } from './api'
import { flagCodeFor } from './areas'
import { EMPTY_DRAFT } from './draft'

import type {
  ApiCatalog,
  ApiCatalogItem,
  ApiDepartment,
  ApiJobBody,
  ApiJobMarket,
  ApiJobView,
  ApiTimezone,
} from './api-types'
import type { DraftErrors, HiringArea, JobDraft, PayPeriod, TravelFrequency } from './draft'

/**
 * Between the "Job details" form and the hiring API: the form's draft out as
 * the body the API takes, and a job from the API back in as a draft.
 *
 * The form holds names (a team, an industry, a level); the API holds ids, so
 * both directions need the lists those names come from.
 */

interface DraftLookups {
  departments?: ApiDepartment[]
  catalog?: ApiCatalog
  /** Skills the catalogue knows; anything else is sent as the user's own label. */
  skills?: ApiCatalogItem[]
  /** The company's registered address, which the job can be based at. */
  companyAddress?: string
}

const HIRING_AREA_TO_API: Record<HiringArea, string> = {
  anywhere: 'anywhere',
  area: 'specific_area',
  timezone: 'specific_timezone',
}

const TRAVEL_TO_API: Record<TravelFrequency, string> = {
  never: 'none',
  few: 'occasional',
  monthly: 'frequent',
}

const PAY_PERIOD_TO_API: Record<PayPeriod, string> = {
  hourly: 'hour',
  monthly: 'month',
  annually: 'year',
}

const keyOf = <T extends string>(
  map: Record<T, string>,
  value: string | undefined,
): T | undefined => (Object.keys(map) as T[]).find((key) => map[key] === value)

/** Several places are kept in the API's one line of location text, in the order they were chosen. */
const AREA_SEPARATOR = '; '

const idOf = (items: ApiCatalogItem[] | undefined, name: string): string =>
  items?.find((item) => item.name === name)?.id ?? ''

const nameOf = (items: ApiCatalogItem[] | undefined, id: string | undefined): string =>
  (id && items?.find((item) => item.id === id)?.name) || ''

/**
 * The market a place belongs to, from the country its text ends with:
 * "London, UK" → UK with the city London; "United States" → US.
 */
function marketFor(place: string): ApiJobMarket {
  const parts = place.split(',').map((part) => part.trim())
  const flag = flagCodeFor(place)
  // The API's code for the United Kingdom is UK, not the ISO "GB".
  const code = flag?.startsWith('gb') ? 'UK' : (flag?.toUpperCase() ?? '')
  const city = parts.length > 1 ? parts[0] : undefined
  return city ? { market_code: code, city } : { market_code: code }
}

function marketsOf(draft: JobDraft, companyAddress: string | undefined): ApiJobMarket[] {
  if (draft.hiringArea === 'area') {
    const seen = new Set<string>()
    const markets = draft.areas.map((area) =>
      // The API has the company's address itself, so only its market is named.
      area === companyAddress ? { market_code: marketFor(area).market_code } : marketFor(area),
    )
    return markets.filter((market) => {
      const key = `${market.market_code}/${market.city ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
  // The form asks for a timezone only; the API also wants a market, which the
  // design has no field for, so none is sent and the API says so.
  if (draft.hiringArea === 'timezone' && draft.timezone) return [{ timezone: draft.timezone }]
  return []
}

const amount = (text: string): number | null => {
  const digits = text.replaceAll(',', '')
  return digits ? Number(digits) : null
}

/** The body that saves a draft: every field the form holds, empty ones cleared. */
function draftToBody(draft: JobDraft, lookups: DraftLookups, today: Date): ApiJobBody {
  const { day, month, year } = draft.closingDate
  const industryId = idOf(lookups.catalog?.industries, draft.industry)

  return {
    title: draft.title.trim(),
    department_id:
      lookups.departments?.find((department) => department.name === draft.team)?.id ?? '',
    closing_date: parseFutureDate(day, month, year, today) ?? '',
    location_mode: HIRING_AREA_TO_API[draft.hiringArea],
    location_text: draft.hiringArea === 'area' ? draft.areas.join(AREA_SEPARATOR) : '',
    use_company_address: draft.hiringArea === 'area' && draft.sameAsCompanyAddress,
    show_on_career_page: draft.showLocationOnCareerPage,
    workplace_type: draft.workplace ? WORKPLACE_TO_API[draft.workplace] : '',
    travel_frequency: draft.travel ? TRAVEL_TO_API[draft.travel] : '',
    visa_sponsorship: draft.visaSponsorship,
    description_sections: { role: draft.description },
    industry_id: industryId,
    // An industry the list does not have is one the user typed.
    custom_industry: industryId ? '' : draft.industry,
    employment_type: draft.employmentType ? EMPLOYMENT_TO_API[draft.employmentType] : '',
    seniority_level_id: idOf(lookups.catalog?.seniority_levels, draft.seniority),
    experience_range_id: idOf(lookups.catalog?.experience_ranges, draft.experience),
    pay: {
      type: draft.payType,
      currency: draft.currency,
      period: PAY_PERIOD_TO_API[draft.payPeriod],
      min: amount(draft.payMin),
      max: draft.payType === 'range' ? amount(draft.payMax) : null,
      visible: draft.showPayOnCareerPage,
    },
    skills: draft.skills.map((skill) => {
      const id = idOf(lookups.skills, skill)
      return id ? { skill_id: id } : { custom_label: skill }
    }),
    markets: marketsOf(draft, lookups.companyAddress),
  }
}

const sectionHtml = (section: string | { html?: string } | undefined): string =>
  typeof section === 'string' ? section : (section?.html ?? '')

const money = (value: number | null | undefined): string =>
  typeof value === 'number' ? value.toLocaleString('en-GB') : ''

/** The form state for a job (or a template's payload) as the API holds it. */
function draftFromView(view: ApiJobView, lookups: DraftLookups): JobDraft {
  const [year = '', month = '', day = ''] = view.closing_date?.slice(0, 10).split('-') ?? []
  const hiringArea = keyOf(HIRING_AREA_TO_API, view.location_mode) ?? EMPTY_DRAFT.hiringArea
  const markets = view.markets ?? []
  const marketName = (code: string | undefined) =>
    lookups.catalog?.markets?.find((market) => market.code === code)?.name ?? code ?? ''
  const areas = view.location_text
    ? view.location_text.split(AREA_SEPARATOR)
    : markets.map((market) =>
        market.city
          ? `${market.city}, ${marketName(market.market_code)}`
          : marketName(market.market_code),
      )
  const payType = view.pay?.type === 'exact' ? 'exact' : EMPTY_DRAFT.payType

  return {
    ...EMPTY_DRAFT,
    title: view.title ?? '',
    team:
      view.department_name ??
      lookups.departments?.find((department) => department.id === view.department_id)?.name ??
      '',
    closingDate: { day, month, year },
    jobId: view.job_code ?? '',
    hiringArea,
    areas: hiringArea === 'area' ? areas.filter(Boolean) : [],
    sameAsCompanyAddress: view.use_company_address ?? false,
    timezone: markets.find((market) => market.timezone)?.timezone ?? '',
    showLocationOnCareerPage: view.show_on_career_page ?? EMPTY_DRAFT.showLocationOnCareerPage,
    workplace: WORKPLACE_FROM_API[view.workplace_type ?? ''] ?? '',
    travel: keyOf(TRAVEL_TO_API, view.travel_frequency) ?? '',
    visaSponsorship:
      view.visa_sponsorship === 'yes' || view.visa_sponsorship === 'no'
        ? view.visa_sponsorship
        : '',
    description: sectionHtml(view.description_sections?.role),
    industry: nameOf(lookups.catalog?.industries, view.industry_id) || view.custom_industry || '',
    employmentType: EMPLOYMENT_FROM_API[view.employment_type ?? ''] ?? '',
    seniority: nameOf(lookups.catalog?.seniority_levels, view.seniority_level_id),
    experience: nameOf(lookups.catalog?.experience_ranges, view.experience_range_id),
    skills: (view.skills ?? [])
      .map((skill) => skill.name ?? skill.custom_label ?? nameOf(lookups.skills, skill.skill_id))
      .filter(Boolean),
    payType,
    currency: view.pay?.currency ?? '',
    payMin: money(view.pay?.min),
    payMax: payType === 'range' ? money(view.pay?.max) : '',
    payPeriod: keyOf(PAY_PERIOD_TO_API, view.pay?.period) ?? EMPTY_DRAFT.payPeriod,
    showPayOnCareerPage: view.pay?.visible ?? EMPTY_DRAFT.showPayOnCareerPage,
  }
}

/** "Europe/London" at +01:00 → "London (British Summer Time) [+01:00]", as the design lists zones. */
function timezoneLabel(zone: ApiTimezone, today: Date): string {
  const name = zone.name ?? ''
  const city = (name.split('/').pop() ?? name).replaceAll('_', ' ')
  const offset = zone.offset ? ` [${zone.offset}]` : ''
  try {
    const long = new Intl.DateTimeFormat('en-GB', { timeZone: name, timeZoneName: 'long' })
      .formatToParts(today)
      .find((part) => part.type === 'timeZoneName')?.value
    return long ? `${city} (${long})${offset}` : `${city}${offset}`
  } catch {
    return `${city}${offset}`
  }
}

const FIELD_ERRORS: Record<string, keyof DraftErrors> = {
  title: 'title',
  department_id: 'team',
  closing_date: 'closingDate',
}

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * The API's validation problems, placed on the form fields that show errors.
 * Problems with any other field come back in `other`, in the API's words.
 */
function draftErrorsFrom(error: unknown): { errors: DraftErrors; other: string[] } {
  const fields =
    (
      error as {
        response?: {
          data?: { error?: { details?: { fields?: { path?: string; message?: string }[] } } }
        }
      }
    )?.response?.data?.error?.details?.fields ?? []
  const errors: DraftErrors = {}
  const other: string[] = []
  for (const field of fields) {
    if (!field.message) continue
    const path = field.path ?? ''
    const key = path.startsWith('pay') ? 'pay' : FIELD_ERRORS[path]
    if (key) errors[key] ??= capitalise(field.message)
    else other.push(capitalise(field.message))
  }
  return { errors, other }
}

export { draftErrorsFrom, draftFromView, draftToBody, marketFor, timezoneLabel }
export type { DraftLookups }
