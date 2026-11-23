'use client'

import { type ReactElement } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { formatPostedDate } from '@/components/jobs/job-status'
import { Avatar, Button, TextButton, getInitials, type AvatarColour } from '@/components/ui'
import { listNames } from '@/lib/jobs/people'

/** A person named in the header, with the tint their initials avatar wears. */
interface HeaderPerson {
  name: string
  colour: AvatarColour
}

interface CandidatesTopBarProps {
  title: string
  /** Every applicant of the job, across all stages. */
  total: number
}

/** The top bar: "Candidates › Marketing Specialist (32)" and the add action, which has no flow yet. */
function CandidatesTopBar({ title, total }: CandidatesTopBarProps): ReactElement {
  return (
    <header className="flex h-[44px] shrink-0 items-center justify-between border-b-[0.5px] border-border-transparent-medium pr-[16px] pl-[18px]">
      <p className="flex min-w-0 items-center gap-[6px] text-body-xs leading-19_2 text-text-secondary">
        <span>Candidates</span>
        <span aria-hidden="true" className="text-text-tertiary">
          ›
        </span>
        <span className="truncate text-text-primary">
          {title} ({total})
        </span>
      </p>
      <Button
        variant="tertiary"
        accent="blue"
        size="sm"
        iconPrefix={<DashboardIcon name="plus-solid" size={12} />}
      >
        Add Candidates
      </Button>
    </header>
  )
}

interface JobHeaderProps {
  title: string
  /** "DS-001 · Design Team · Remote · United States", without the empty parts. */
  details: string
  creator: HeaderPerson | null
  reviewers: HeaderPerson[]
  /** ISO date (yyyy-mm-dd), or empty before the job is published. */
  publishedOn: string
}

function PersonAvatar({ person }: { person: HeaderPerson }): ReactElement {
  return (
    <Avatar
      size={16}
      type="initials"
      text={getInitials(person.name)}
      colour={person.colour}
      aria-label={person.name}
    />
  )
}

/** The job's title, its details, who made it and reviews it, and when it went live. */
function JobHeader({
  title,
  details,
  creator,
  reviewers,
  publishedOn,
}: JobHeaderProps): ReactElement {
  return (
    <div className="flex flex-col gap-[6px]">
      <h1 className="text-body-l leading-24 font-semibold text-text-primary">{title}</h1>
      {details ? <p className="text-body-xs leading-19_2 text-text-secondary">{details}</p> : null}
      <div className="flex flex-wrap items-center gap-x-[16px] gap-y-[4px] text-body-xs leading-19_2 text-text-secondary">
        {creator ? (
          <p className="flex items-center gap-[6px]">
            <span>Created by:</span>
            <PersonAvatar person={creator} />
            <span className="text-text-primary">{creator.name}</span>
          </p>
        ) : null}
        {reviewers.length > 0 ? (
          <p className="flex items-center gap-[6px]">
            <span>Reviewers:</span>
            <span className="flex items-center gap-[2px]">
              {reviewers.map((person) => (
                <PersonAvatar key={person.name} person={person} />
              ))}
            </span>
            <span className="text-text-primary">{listNames(reviewers.map((p) => p.name))}</span>
          </p>
        ) : null}
        {publishedOn ? <p>Published on {formatPostedDate(publishedOn)}</p> : null}
      </div>
    </div>
  )
}

/**
 * The workflow promotion under the header. Its two buttons lead nowhere until
 * Workflow is designed, so they are drawn and inert.
 */
function WorkflowBanner(): ReactElement {
  return (
    <div className="flex flex-wrap items-center justify-between gap-[12px] rounded-lg-10 bg-blue-alpha-5 px-[12px] py-[10px]">
      <div className="flex min-w-0 flex-col gap-[2px]">
        <p className="text-body-s leading-19_5 font-medium text-text-blue-accent">
          Automate Applicant review with Workflow
        </p>
        <p className="text-body-xs leading-19_2 text-text-secondary">
          Approve or Disqualified candidates and refine your hiring expectations
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-[12px]">
        <TextButton size="sm">Learn more</TextButton>
        <Button variant="secondary" accent="blue" size="sm">
          Create Workflow
        </Button>
      </div>
    </div>
  )
}

export { CandidatesTopBar, JobHeader, WorkflowBanner }
export type { HeaderPerson, JobHeaderProps }
