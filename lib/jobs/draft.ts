import { parseFutureDate, toIsoDate } from './actions'

import type { Job, JobEmploymentType, JobManager, JobWorkplace } from './types'

/**
 * The "Job details" step of job creation. Figma: "First time user Job
 * Creation/Job details/" (8974:29644), full form at 8973:613907.
 *
 * Option lists are stand-ins until the API serves them. Per the designer's
 * notes, seniority and years of experience are fixed lists the user can only
 * pick from.
 */

type HiringArea = 'anywhere' | 'area' | 'timezone'
type TravelFrequency = 'never' | 'few' | 'monthly'
type PayType = 'exact' | 'range'
type PayPeriod = 'hourly' | 'monthly' | 'annually'

interface JobDraft {
  title: string
  team: string
  closingDate: { day: string; month: string; year: string }
  jobId: string
  hiringArea: HiringArea
  /** Used when hiring in specific areas: one or more cities, countries or regions. */
  areas: string[]
  sameAsCompanyAddress: boolean
  /** Used when hiring in a specific timezone. */
  timezone: string
  timezoneOffset: string
  showLocationOnCareerPage: boolean
  workplace: JobWorkplace | ''
  travel: TravelFrequency | ''
  visaSponsorship: 'yes' | 'no' | ''
  description: string
  industry: string
  employmentType: JobEmploymentType | ''
  seniority: string
  experience: string
  skills: string[]
  payType: PayType
  currency: string
  payMin: string
  payMax: string
  payPeriod: PayPeriod
  showPayOnCareerPage: boolean
  saveAsTemplate: boolean
}

const EMPTY_DRAFT: JobDraft = {
  title: '',
  team: '',
  closingDate: { day: '', month: '', year: '' },
  jobId: '',
  hiringArea: 'anywhere',
  areas: [],
  sameAsCompanyAddress: false,
  timezone: '',
  timezoneOffset: '+/-0 hours',
  showLocationOnCareerPage: true,
  workplace: '',
  travel: '',
  visaSponsorship: '',
  description: '',
  industry: '',
  employmentType: '',
  seniority: '',
  experience: '',
  skills: [],
  payType: 'range',
  currency: '',
  payMin: '',
  payMax: '',
  payPeriod: 'annually',
  showPayOnCareerPage: true,
  saveAsTemplate: false,
}

const option = (value: string) => ({ value, label: value })

const TEAM_OPTIONS = ['Engineering', 'Design', 'Sales', 'Marketing', 'Operations', 'People/HR'].map(
  option,
)

/** A team name as the "Create new team" dialog accepts it, or the reason it does not. */
function validateTeamName(name: string, existing: string[]): string | null {
  const trimmed = name.trim()
  if (!trimmed) return 'Enter a team name.'
  if (!/^[\p{L}\p{N} &/-]+$/u.test(trimmed)) return 'Remove special characters from the team name.'
  if (existing.some((team) => team.toLowerCase() === trimmed.toLowerCase())) {
    return 'A team with this name already exists.'
  }
  return null
}

const INDUSTRY_OPTIONS = [
  '💻 Tech / Software',
  '💰 Finance / Fintech',
  '🛍️ Retail / E-commerce',
  '🍽️ Hospitality / Food & Drink',
  '💼 Professional Services',
  '💇 Beauty & Personal Care',
  '🚚 Logistics / Transport',
].map(option)

const SENIORITY_OPTIONS = [
  'Internship',
  'Entry Level',
  'Mid Level',
  'Senior',
  'Lead',
  'Manager',
  'Executive',
].map(option)

const EXPERIENCE_OPTIONS = [
  'No experience required',
  '0–1 year',
  '2–3 years',
  '4–6 years',
  '7–10 years',
  '10+ years',
].map(option)

const SKILL_OPTIONS = [
  'Design',
  'Product design',
  'UX architecture',
  'User research',
  'Prototyping',
  'Figma',
  'React',
  'TypeScript',
  'Node.js',
  'SQL',
  'Data analysis',
  'Copywriting',
  'SEO',
  'Project management',
  'Stakeholder management',
].map(option)

/** `keywords` lets a currency be found by its code, name or symbol. */
const CURRENCY_OPTIONS = [
  { value: 'USD', label: '$ USD', keywords: 'us dollar dollars' },
  { value: 'GBP', label: '£ GBP', keywords: 'pound sterling' },
  { value: 'EUR', label: '€ Euros', keywords: 'eur euro' },
  { value: 'NGN', label: '₦ Naira', keywords: 'ngn nigeria' },
  { value: 'INR', label: '₹ Rupees', keywords: 'inr india rupee' },
  { value: 'PLN', label: 'zł Polish złoty', keywords: 'pln zloty poland' },
]

/** `keywords` carries the abbreviation, so typing "CET" finds Central European Time. */
const TIMEZONE_OPTIONS = [
  { name: 'Algiers (Central European Time) [+01:00]', keywords: 'CET' },
  { name: 'Andorra (Central European Time) [+01:00]', keywords: 'CET' },
  { name: 'Budapest (Central European Time) [+01:00]', keywords: 'CET' },
  { name: 'Belgrade (Central European Time) [+01:00]', keywords: 'CET' },
  { name: 'Berlin (Central European Time) [+01:00]', keywords: 'CET' },
  { name: 'Casablanca (Western European Time) [+01:00]', keywords: 'WET' },
  { name: 'Dublin (Greenwich Mean Time) [+01:00]', keywords: 'GMT IST' },
  { name: 'London (British standard Time) [+01:00]', keywords: 'BST GMT' },
  { name: 'Lagos (West Africa Time) [+01:00]', keywords: 'WAT' },
  { name: 'New York (Eastern Time) [-04:00]', keywords: 'ET EST EDT' },
  { name: 'Toronto (Eastern Time) [-04:00]', keywords: 'ET EST EDT' },
  { name: 'San Francisco (Pacific Time) [-07:00]', keywords: 'PT PST PDT' },
  { name: 'Sydney (Australian Eastern Time) [+10:00]', keywords: 'AET AEST' },
].map(({ name, keywords }) => ({ value: name, label: name, keywords }))

const TIMEZONE_OFFSET_OPTIONS = [
  '+/-0 hours',
  '+/-1 hours',
  '+/-2 hours',
  '+/-3 hours',
  '+/-4 hours',
  '+/-5 hours',
  '+/-6 hours',
].map(option)

/** Places a role can be based in. `flag` is the code of the flag shown beside it. */
const AREA_OPTIONS = [
  { value: 'London, United Kingdom', flag: 'gb' },
  { value: 'European Union', flag: 'eu' },
  { value: 'Lagos, Nigeria', flag: 'ng' },
  { value: 'United Kingdom', flag: 'gb' },
  { value: 'Ireland', flag: 'ie' },
  { value: 'Germany', flag: 'de' },
  { value: 'France', flag: 'fr' },
  { value: 'Netherlands', flag: 'nl' },
  { value: 'Sweden', flag: 'se' },
  { value: 'Spain', flag: 'es' },
  { value: 'Italy', flag: 'it' },
  { value: 'United States', flag: 'us' },
  { value: 'Canada', flag: 'ca' },
  { value: 'Australia', flag: 'au' },
  { value: 'India', flag: 'in' },
  { value: 'Kenya', flag: 'ke' },
  { value: 'Nigeria', flag: 'ng' },
].map(({ value, flag }) => ({ value, label: value, flag }))

/** Where the company is registered; stands in until the workspace profile is served. */
const COMPANY_ADDRESS = 'London, United Kingdom'

type DraftErrors = Partial<Record<'title' | 'team' | 'closingDate' | 'pay', string>>

/** Problems that stop a draft moving on to the next step. Saving as a draft only needs a title. */
function validateDraft(draft: JobDraft, today: Date): DraftErrors {
  const errors: DraftErrors = {}
  const title = draft.title.trim()
  if (!title) errors.title = 'Enter a job title.'
  else if (title.length > 70) errors.title = 'Keep the job title to 70 characters or fewer.'
  else if (!/^[\p{L}\p{N} .,&/()'+-]+$/u.test(title)) {
    errors.title = 'Remove special characters from the job title.'
  }
  if (!draft.team) errors.team = 'Choose a team or department.'

  const { day, month, year } = draft.closingDate
  if ((day || month || year) && !parseFutureDate(day, month, year, today)) {
    errors.closingDate = 'Enter a valid date that is today or later.'
  }

  const min = Number(draft.payMin.replaceAll(',', ''))
  const max = Number(draft.payMax.replaceAll(',', ''))
  if (draft.payType === 'range' && draft.payMin && draft.payMax && min > max) {
    errors.pay = 'The minimum cannot be more than the maximum.'
  }
  return errors
}

/** "39000" → "39,000" as the user types; anything that is not a digit is dropped. */
function formatAmount(input: string): string {
  const digitsOnly = input.replace(/\D/g, '')
  return digitsOnly ? Number(digitsOnly).toLocaleString('en-GB') : ''
}

/** The list-row job a draft becomes when it is saved. */
function draftToJob(draft: JobDraft, id: string, owner: JobManager, today: Date): Job {
  const { day, month, year } = draft.closingDate
  const location =
    draft.hiringArea === 'area' && draft.areas.length > 0
      ? (draft.areas[0] ?? '')
      : draft.hiringArea === 'timezone' && draft.timezone
        ? (draft.timezone.split(' (')[0] ?? draft.timezone)
        : 'Anywhere'
  return {
    id,
    title: draft.title.trim() || 'Untitled job',
    department: draft.team || 'Unassigned',
    employmentType: draft.employmentType || 'Full-time',
    location,
    workplace: draft.workplace || 'Remote',
    status: 'draft',
    managers: [owner],
    createdBy: owner,
    totalApplicants: 0,
    newApplicants: 0,
    postedAt: toIsoDate(today),
    createdAt: toIsoDate(today),
    lastModifiedAt: toIsoDate(today),
    lastViewedAt: toIsoDate(today),
    closingDate: parseFutureDate(day, month, year, today) ?? undefined,
  }
}

/** The form state for editing an existing job, filled from what the list knows about it. */
function draftFromJob(job: Job): JobDraft {
  const [year = '', month = '', day = ''] = job.closingDate?.split('-') ?? []
  const anywhere = job.location === 'Anywhere'
  return {
    ...EMPTY_DRAFT,
    title: job.title,
    team: job.department,
    employmentType: job.employmentType,
    workplace: job.workplace,
    hiringArea: anywhere ? 'anywhere' : 'area',
    areas: anywhere ? [] : [job.location],
    closingDate: { day, month, year },
  }
}

/** An existing job with a saved draft's details applied. Status, people and applicants are kept. */
function applyDraftToJob(job: Job, draft: JobDraft, today: Date): Job {
  const edited = draftToJob(draft, job.id, job.createdBy, today)
  return {
    ...job,
    title: edited.title,
    department: edited.department,
    employmentType: edited.employmentType,
    location: edited.location,
    workplace: edited.workplace,
    closingDate: edited.closingDate,
    lastModifiedAt: toIsoDate(today),
  }
}

export {
  AREA_OPTIONS,
  COMPANY_ADDRESS,
  CURRENCY_OPTIONS,
  EMPTY_DRAFT,
  EXPERIENCE_OPTIONS,
  INDUSTRY_OPTIONS,
  SENIORITY_OPTIONS,
  SKILL_OPTIONS,
  TEAM_OPTIONS,
  TIMEZONE_OFFSET_OPTIONS,
  TIMEZONE_OPTIONS,
  applyDraftToJob,
  draftFromJob,
  draftToJob,
  formatAmount,
  validateDraft,
  validateTeamName,
}
export type { DraftErrors, HiringArea, JobDraft, PayPeriod, PayType, TravelFrequency }
