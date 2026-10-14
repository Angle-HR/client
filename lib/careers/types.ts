/** Where a role is done, as the role's meta line shows it. */
type CareersWorkplace = 'Remote' | 'On-site' | 'Hybrid'

/** The employment types the meta line shows. */
type CareersEmploymentType = 'Full time' | 'Part time' | 'Contract'

interface CareersCompany {
  name: string
  /** The paragraph under the company name. */
  about: string
  /** Image URL. Without one the header shows the company's initials. */
  logo?: string
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

export type { CareersCompany, CareersEmploymentType, CareersPage, CareersRole, CareersWorkplace }
