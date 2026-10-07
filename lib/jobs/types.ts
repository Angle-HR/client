import type { AvatarColour } from '@/components/ui'

type JobStatus = 'open' | 'paused' | 'draft' | 'closed' | 'archived' | 'expired'

type JobWorkplace = 'Remote' | 'Hybrid' | 'On-site'

type JobEmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance'

interface JobManager {
  name: string
  /** Initials-avatar tint; stands in until managers carry a photo. */
  colour: AvatarColour
}

interface Job {
  id: string
  title: string
  department: string
  employmentType: JobEmploymentType
  /** Short form shown in the table and on cards, e.g. "UK" or "Germany". */
  location: string
  workplace: JobWorkplace
  status: JobStatus
  manager: JobManager
  totalApplicants: number
  newApplicants: number
  /** ISO date (yyyy-mm-dd). */
  postedAt: string
  /** ISO date (yyyy-mm-dd). Only set once a closing date has been chosen. */
  closingDate?: string
}

export type { Job, JobEmploymentType, JobManager, JobStatus, JobWorkplace }
