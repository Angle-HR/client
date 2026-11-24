import type { FormQuestion } from '../jobs/application-form'

/** Where a role is done, as the role's meta line shows it. */
type CareersWorkplace = 'Remote' | 'On-site' | 'Hybrid'

/** The employment types the meta line shows. */
type CareersEmploymentType = 'Full time' | 'Part time' | 'Contract' | 'Internship'

interface CareersCompany {
  name: string
  /** The paragraph under the company name. */
  about: string
  /** Image URL. Without one the header shows the company's initials. */
  logo?: string
}

/** One public job: a role's meta with the drawn description and application form. */
interface CareersJob {
  id: string
  title: string
  /** Rows are grouped by team, and the Team filter picks one. */
  team: string
  /** Country the job is open in. The Location row is left out when absent. */
  location?: string
  workplace: CareersWorkplace
  employmentType: CareersEmploymentType
  /** Pay as a display string, e.g. "GBP 50,000 - 70,000 per year". Absent when the employer hides it. */
  pay?: string
  seniority?: string
  experience?: string
  skills?: readonly string[]
  /** Rich text from the hiring team, as HTML. */
  descriptionHtml: string
  /** The application form, in the order the candidate sees it. */
  questions: readonly FormQuestion[]
  /** Input placeholders by question key. The form model has none, so the job carries them. */
  placeholders: Readonly<Record<string, string>>
  /** Markets the job is open in, ISO 3166-1 alpha-2. Absent on fixtures. */
  markets?: readonly string[]
  /** Whether the candidate must consent, as the job's lawful basis is consent. */
  consentRequired?: boolean
  /** open | closed | paused | archived. Absent on fixtures, which are always open. */
  state?: 'open' | 'closed' | 'paused' | 'archived'
  /** False once the job takes no more applications. */
  accepting?: boolean
  /** The employer's privacy notice, when the API sends one. */
  privacyNoticeUrl?: string
}

interface CareersJobPage {
  company: CareersCompany
  job: CareersJob
}

/** One open role as the public careers page lists it. */
interface CareersRole {
  id: string
  title: string
  /** Rows are grouped by team, and the Team filter picks one. */
  team: string
  /** Country the role is open in. Absent where the design's meta line has none. */
  location?: string
  workplace: CareersWorkplace
  employmentType: CareersEmploymentType
}

interface CareersPage {
  company: CareersCompany
  roles: CareersRole[]
}

export type {
  CareersCompany,
  CareersEmploymentType,
  CareersJob,
  CareersJobPage,
  CareersPage,
  CareersRole,
  CareersWorkplace,
}
