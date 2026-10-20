'use client'

import { useState, type ReactElement } from 'react'

import { ApplicationModal } from '@/components/applications/application-modal'
import { Button, Tabs, TextInput, type TabOption } from '@/components/ui'
import { APPLICATION_STATUSES, type ApplicationStatus } from '@/lib/applications/api'
import { useApplications, useJob } from '@/lib/queries'

type StatusTab = 'all' | ApplicationStatus

interface ApplicationsViewProps {
  jobId: string
}

const DATE = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : DATE.format(date)
}

/** A job's applications: a tab per status with its count, a search, and the application in a dialog. */
function ApplicationsView({ jobId }: ApplicationsViewProps): ReactElement {
  const [tab, setTab] = useState<StatusTab>('all')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const job = useJob(jobId)
  const query = { status: tab === 'all' ? undefined : [tab], q: search }
  const applications = useApplications(jobId, query)

  const pages = applications.data?.pages ?? []
  const items = pages.flatMap((page) => page.items)
  const counts = pages[0]?.counts ?? {}
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)

  const tabs: TabOption<StatusTab>[] = [
    { key: 'all', label: 'All', count: total },
    ...APPLICATION_STATUSES.map(({ key, label }) => ({ key, label, count: counts[key] ?? 0 })),
  ]

  return (
    <div className="flex flex-1 flex-col gap-[16px] p-[24px]">
      <header className="flex flex-col gap-[4px]">
        <h1 className="text-body-xl leading-24 font-semibold text-text-primary">Applicants</h1>
        {job.data ? (
          <p className="text-body-s leading-19_5 text-text-secondary">{job.data.title}</p>
        ) : null}
      </header>

      <Tabs tabs={tabs} value={tab} onValueChange={setTab} aria-label="Application status" />
      <div className="max-w-[320px]">
        <TextInput
          placeholder="Search name or email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {applications.isError ? (
        <p role="alert" className="text-body-s text-text-secondary">
          We couldn&apos;t load the applications. Try again in a moment.
        </p>
      ) : items.length === 0 && !applications.isPending ? (
        <p className="text-body-s text-text-secondary">No applications here yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border-transparent-light">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                className="flex w-full items-center gap-[12px] px-[8px] py-[12px] text-left hover:bg-bg-btn-default-tet-hover"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-s font-semibold text-text-primary">
                    {item.isNew ? (
                      <span aria-label="New" className="mr-[6px]">
                        ●
                      </span>
                    ) : null}
                    {item.name || item.email}
                  </span>
                  <span className="truncate text-caption-m text-text-tertiary">{item.email}</span>
                </span>
                <span className="w-[80px] text-caption-m text-text-secondary">{item.country}</span>
                <span className="w-[90px] text-caption-m text-text-secondary capitalize">
                  {item.source}
                </span>
                <span className="w-[90px] text-caption-m text-text-secondary">
                  {APPLICATION_STATUSES.find((status) => status.key === item.status)?.label}
                  {item.flagCount > 0 ? ` · ${item.flagCount} flagged` : ''}
                </span>
                <span className="w-[100px] text-caption-m text-text-tertiary">
                  {formatDate(item.submittedAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {applications.hasNextPage ? (
        <Button
          type="button"
          variant="secondary"
          size="md"
          className="w-fit"
          loading={applications.isFetchingNextPage}
          onClick={() => void applications.fetchNextPage()}
        >
          Load more
        </Button>
      ) : null}

      <ApplicationModal jobId={jobId} appId={openId} onClose={() => setOpenId(null)} />
    </div>
  )
}

export { ApplicationsView }
export type { ApplicationsViewProps }
