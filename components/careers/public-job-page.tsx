'use client'

import { useState, type ReactElement } from 'react'

import {
  CandidateApplicationForm,
  PoweredBy,
} from '@/components/careers/candidate-application-form'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Avatar, Button, Tabs, getInitials } from '@/components/ui'
import { usePublicJob } from '@/lib/queries'

type JobTab = 'description' | 'application'

const JOB_TABS: ReadonlyArray<{ key: JobTab; label: string }> = [
  { key: 'description', label: 'Job description' },
  { key: 'application', label: 'Application form' },
]

interface PublicJobPageProps {
  slug: string
  jobId: string
}

/**
 * One public job: the company, the job's meta and its tabs. "Apply for the
 * role" opens the application form tab. Figma: 9346:561642 (job description),
 * 9346:561694 (application form tab).
 */
function PublicJobPage({ slug, jobId }: PublicJobPageProps): ReactElement | null {
  const { data } = usePublicJob(slug, jobId)
  const [tab, setTab] = useState<JobTab>('description')

  if (!data) return null

  const { company, job } = data
  // The Location row is left out when the job has none, as the design has no value for it.
  const meta = [
    { label: 'Location', value: job.location },
    { label: 'Workplace type', value: job.workplace },
    { label: 'Employment type', value: job.employmentType },
    { label: 'Team', value: job.team },
  ].filter((row): row is { label: string; value: string } => Boolean(row.value))

  return (
    <div className="mx-auto flex w-full max-w-[800px] flex-col gap-[64px] px-[16px] pt-[18px] pb-[48px]">
      <header className="flex items-center gap-[4px] py-[12px]">
        <Avatar
          type="initials"
          text={getInitials(company.name)}
          size={20}
          src={company.logo}
          alt={company.name}
        />
        <span className="text-[15.9px] leading-[24px] font-semibold text-text-primary">
          {company.name}
        </span>
      </header>

      <div className="flex flex-col gap-[44px]">
        <div className="flex flex-col gap-[28px]">
          <a
            href={`/company/${slug}`}
            className="inline-flex w-fit items-center gap-[2px] px-[6px] py-[6px] text-[12px] leading-[19.2px] text-text-secondary"
          >
            {/* The design's icon/arrow-left variant is unverified; the outline arrow is used. */}
            <DashboardIcon name="arrow-left-outline" size={10} />
            View all Jobs
          </a>
          <h1 className="px-[8px] text-[25.3px] leading-[39.7px] font-medium text-text-primary">
            {job.title}
          </h1>
        </div>

        <div className="flex flex-col gap-[64px] md:flex-row">
          <aside className="flex flex-col md:w-[250px] md:shrink-0">
            <dl className="flex flex-col">
              {meta.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-[16px] border-b border-border-transparent-light px-[8px] py-[12px]"
                >
                  <dt className="text-[12px] leading-[19.2px] font-medium text-text-tertiary">
                    {row.label}
                  </dt>
                  <dd className="text-[13.8px] leading-[21px] font-semibold text-text-secondary">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            {/* Only the description tab offers it (9346:561642); the form tabs do not draw it. */}
            <div hidden={tab !== 'description'} className="px-[8px] py-[24px]">
              <Button
                type="button"
                variant="primary"
                accent="blue"
                size="md"
                className="w-full"
                onClick={() => setTab('application')}
              >
                Apply for the role
              </Button>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
            <Tabs tabs={JOB_TABS} value={tab} onValueChange={setTab} aria-label="Job" />

            {/* The description is kept mounted so a half-filled application survives a tab switch. */}
            <div hidden={tab !== 'description'}>
              <div
                className="flex flex-col gap-[44px] text-[14px] leading-[26.5px] tracking-[0.2px] text-text-primary [&_section]:flex [&_section]:flex-col [&_section]:gap-[24px] [&_strong]:font-semibold"
                dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
              />
            </div>
            <div hidden={tab !== 'application'}>
              <CandidateApplicationForm slug={slug} job={job} />
            </div>
          </div>
        </div>
        {tab === 'application' ? (
          <div className="flex justify-center py-[48px]">
            <PoweredBy />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export { PublicJobPage }
export type { PublicJobPageProps }
