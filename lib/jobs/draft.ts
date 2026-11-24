import { parseFutureDate, toIsoDate } from './actions'

import type { Job, JobEmploymentType, JobManager, JobWorkplace } from './types'

/**
 * The "Job details" step of job creation. Figma: "First time user Job
 * Creation/Job details/" (8974:29644), full form at 8973:613907.
 *
 * The pick lists come from the hiring API; what is left here is how the
 * design labels them. Per the designer's notes, seniority and years of
 * experience are fixed lists the user can only pick from.
 */

type HiringArea = 'anywhere' | 'area' | 'timezone'
type TravelFrequency = 'never' | 'few' | 'monthly'
type PayType = 'exact' | 'range'
type PayPeriod = 'hourly' | 'monthly' | 'annually'

/** The lawful bases the API accepts for processing applications (`GET /hiring/catalog` lists the same). */
type LawfulBasis = 'contract' | 'legitimate_interests' | 'consent' | 'legal_obligation'

/**
 * Plain-language hints, kept short and neutral. Wording is for the owner's legal review.
 */
const LAWFUL_BASIS_OPTIONS: { value: LawfulBasis; label: string; hint: string }[] = [
  {
    value: 'contract',
    label: 'Contract',
    hint: 'Handling applications to take steps toward employing someone. The usual choice for hiring.',
  },
  {
    value: 'legitimate_interests',
    label: 'Legitimate interests',
    hint: 'Your organisation has a genuine reason to handle applications. Needs a reference to your legitimate interests assessment.',
  },
  {
    value: 'consent',
    label: 'Consent',
    hint: 'Candidates agree to it and can withdraw. Often hard to rely on for hiring; candidates are asked to consent when they apply.',
  },
  {
    value: 'legal_obligation',
    label: 'Legal obligation',
    hint: 'A law requires you to handle this data.',
  },
]

const isLawfulBasis = (value: string): value is LawfulBasis =>
  LAWFUL_BASIS_OPTIONS.some((option) => option.value === value)

/** The server refuses a longer reference. */
const LIA_REFERENCE_MAX = 500

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
  /** Why applications are processed. Publishing needs one; `contract` is the starting value. */
  lawfulBasis: LawfulBasis | ''
  /** Reference to the legitimate interests assessment. Needed to publish on that basis. */
  liaReference: string
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
  lawfulBasis: 'contract',
  liaReference: '',
}

const option = (value: string) => ({ value, label: value })

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

/** How the design labels a currency. `keywords` lets it be found by its code, name or symbol. */
const CURRENCY_OPTIONS = [
  { value: 'USD', label: '$ USD', keywords: 'us dollar dollars' },
  { value: 'GBP', label: '£ GBP', keywords: 'pound sterling' },
  { value: 'EUR', label: '€ Euros', keywords: 'eur euro' },
  { value: 'NGN', label: '₦ Naira', keywords: 'ngn nigeria' },
  { value: 'INR', label: '₹ Rupees', keywords: 'inr india rupee' },
  { value: 'PLN', label: 'zł Polish złoty', keywords: 'pln zloty poland' },
]

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

type DraftErrors = Partial<
  Record<'title' | 'team' | 'closingDate' | 'pay' | 'lawfulBasis' | 'liaReference', string>
>

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
  if (!draft.lawfulBasis) errors.lawfulBasis = 'Choose a lawful basis.'
  else if (!isLawfulBasis(draft.lawfulBasis)) errors.lawfulBasis = 'Choose one of the listed bases.'
  else if (draft.lawfulBasis === 'legitimate_interests') {
    const reference = draft.liaReference.trim()
    if (!reference) {
      errors.liaReference = 'Add a reference to your legitimate interests assessment.'
    } else if (new TextEncoder().encode(reference).length > LIA_REFERENCE_MAX) {
      errors.liaReference = `Keep the reference to ${LIA_REFERENCE_MAX} characters or fewer.`
    }
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
  LAWFUL_BASIS_OPTIONS,
  LIA_REFERENCE_MAX,
  isLawfulBasis,
  CURRENCY_OPTIONS,
  EMPTY_DRAFT,
  TIMEZONE_OFFSET_OPTIONS,
  applyDraftToJob,
  draftFromJob,
  draftToJob,
  formatAmount,
  validateDraft,
  validateTeamName,
}
export type { DraftErrors, HiringArea, JobDraft, LawfulBasis, PayPeriod, PayType, TravelFrequency }
