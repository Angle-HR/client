import { parseFutureDate } from './actions'

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
  /** Used when hiring in a specific area. */
  area: string
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
  area: '',
  timezone: '',
  timezoneOffset: '',
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
  currency: 'GBP',
  payMin: '',
  payMax: '',
  payPeriod: 'annually',
  showPayOnCareerPage: true,
  saveAsTemplate: false,
}

const option = (value: string) => ({ value, label: value })

const TEAM_OPTIONS = [
  'Analytics',
  'Content',
  'Design',
  'Development',
  'Engineering',
  'IT Support',
  'Management',
  'Marketing',
  'Product',
  'Research',
].map(option)

const INDUSTRY_OPTIONS = [
  '💻 Tech / Software',
  '🏦 Finance / Banking',
  '🏥 Healthcare',
  '🎓 Education',
  '🛍️ Retail / E-commerce',
  '🏭 Manufacturing',
  '🎬 Media / Entertainment',
  '🏗️ Construction / Real estate',
  '✈️ Travel / Hospitality',
].map(option)

const SENIORITY_OPTIONS = [
  'Internship',
  'Entry Level',
  'Associate',
  'Mid-Senior Level',
  'Senior',
  'Lead',
  'Director',
  'Executive',
].map(option)

const EXPERIENCE_OPTIONS = [
  '0–1 year',
  '1–3 years',
  '3–5 years',
  '5–8 years',
  '8–10 years',
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

const CURRENCY_OPTIONS = ['GBP', 'EUR', 'USD', 'CAD', 'AUD', 'NGN', 'SEK', 'NOK', 'CHF'].map(option)

const TIMEZONE_OPTIONS = [
  'Dublin (Greenwich Mean Time) [+01:00]',
  'London (Greenwich Mean Time) [+01:00]',
  'Lagos (West Africa Time) [+01:00]',
  'Berlin (Central European Time) [+02:00]',
  'New York (Eastern Time) [-04:00]',
  'Toronto (Eastern Time) [-04:00]',
  'San Francisco (Pacific Time) [-07:00]',
  'Sydney (Australian Eastern Time) [+10:00]',
].map(option)

const TIMEZONE_OFFSET_OPTIONS = [
  'Exact timezone',
  '+/-1 hour',
  '+/-2 hours',
  '+/-3 hours',
  '+/-4 hours',
].map(option)

const AREA_OPTIONS = [
  'United Kingdom',
  'Ireland',
  'Germany',
  'France',
  'Netherlands',
  'Sweden',
  'Spain',
  'Italy',
  'United States',
  'Canada',
  'Australia',
  'Nigeria',
].map(option)

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
    draft.hiringArea === 'area' && draft.area
      ? draft.area
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
    postedAt: today.toISOString().slice(0, 10),
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
    area: anywhere ? '' : job.location,
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
  }
}

export {
  AREA_OPTIONS,
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
}
export type { DraftErrors, HiringArea, JobDraft, PayPeriod, PayType, TravelFrequency }
