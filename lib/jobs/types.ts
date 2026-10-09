import type { AvatarColour } from '@/components/ui'

type JobStatus = 'open' | 'paused' | 'draft' | 'closed' | 'archived' | 'expired'

type JobWorkplace = 'Remote' | 'Hybrid' | 'On-site'

type JobEmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship'

interface JobManager {
  /** The person's user id, once people come from the API. */
  id?: string
  name: string
  /** Initials-avatar tint; stands in until managers carry a photo. */
  colour: AvatarColour
  /** Photo, for people who have uploaded one. */
  avatarUrl?: string
}

interface Job {
  id: string
  title: string
  department: string
  /** Empty on a draft that has not chosen one yet. */
  employmentType: JobEmploymentType | ''
  /** Short form shown in the table and on cards, e.g. "UK" or "Germany". */
  location: string
  /** Empty on a draft that has not chosen one yet. */
  workplace: JobWorkplace | ''
  status: JobStatus
  /** Who the job is assigned to. Never empty: the first is the lead. */
  managers: JobManager[]
  createdBy: JobManager
  totalApplicants: number
  newApplicants: number
  /** ISO date (yyyy-mm-dd). */
  postedAt: string
  /** ISO dates (yyyy-mm-dd) the list can be sorted by. */
  createdAt: string
  lastModifiedAt: string
  lastViewedAt: string
  /** ISO date (yyyy-mm-dd). Only set once a closing date has been chosen. */
  closingDate?: string
  /** The API's version of the job, sent back as `If-Match` when it is changed. */
  revision?: number
}

export type { Job, JobEmploymentType, JobManager, JobStatus, JobWorkplace }
