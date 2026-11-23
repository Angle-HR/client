'use client'

import { useCallback, useMemo, useState, type ReactElement } from 'react'

import { CandidatePanel } from '@/components/applications/candidate-panel'
import {
  CandidatesTopBar,
  JobHeader,
  WorkflowBanner,
  type HeaderPerson,
} from '@/components/applications/candidates-header'
import { CandidatesTable } from '@/components/applications/candidates-table'
import { CandidatesToolbar } from '@/components/applications/candidates-toolbar'
import { JobToast, type JobToastState } from '@/components/jobs/job-toast'
import { Button, type AvatarColour } from '@/components/ui'
import { statusesForTab, type StageTab } from '@/lib/applications/stages'
import { apiMessage } from '@/lib/jobs/api'
import { previewJobFrom } from '@/lib/jobs/application-preview'
import { useApplications, useJob, useJobMembers, usePeople } from '@/lib/queries'

import type { Applicant } from '@/lib/applications/api'

interface ApplicationsViewProps {
  jobId: string
}

const FALLBACK_COLOUR: AvatarColour = 'grey'

/**
 * The candidates of one job, in the designer's table: the stage tabs, the
 * search, and a side panel per candidate. Stages with no server status are
 * drawn with no data, so their tabs show nothing.
 */
function ApplicationsView({ jobId }: ApplicationsViewProps): ReactElement {
  const [tab, setTab] = useState<StageTab>('all')
  const [search, setSearch] = useState('')
  const [oldestFirst, setOldestFirst] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [toast, setToast] = useState<JobToastState | null>(null)

  const job = useJob(jobId)
  const members = useJobMembers(jobId)
  const people = usePeople()

  // The job-wide counts come from the unfiltered list, so the tabs keep their
  // numbers while a stage without a status is open.
  const summary = useApplications(jobId, { q: '' })
  const statuses = statusesForTab(tab)
  const hasStatus = statuses === undefined || statuses.length > 0
  const applications = useApplications(jobId, { status: statuses, q: search }, hasStatus)

  const counts = summary.data?.pages[0]?.counts ?? {}
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  // Newest first, as the server sends them, unless Sort has flipped the order.
  const rows = useMemo<Applicant[]>(() => {
    const loaded = hasStatus ? (applications.data?.pages ?? []).flatMap((page) => page.items) : []
    const byDate = [...loaded].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
    return oldestFirst ? byDate : byDate.reverse()
  }, [applications.data, hasStatus, oldestFirst])
  const loading = hasStatus && applications.isPending

  const dismissToast = useCallback(() => setToast(null), [])
  const reportError = useCallback(
    (cause: unknown) =>
      setToast({
        id: Date.now(),
        kind: 'error',
        message: apiMessage(cause, 'That did not go through. Try again.'),
      }),
    [],
  )
  const openCandidate = useCallback((appId: string) => setOpenId(appId), [])
  const closeCandidate = useCallback(() => setOpenId(null), [])

  const view = job.data
  const preview = view ? previewJobFrom(view, '') : null
  const details = view
    ? [view.job_code, preview?.team, preview?.workplace, preview?.location]
        .filter(Boolean)
        .join(' · ')
    : ''

  const hiringPeople = people.data ?? []
  const creatorPerson = view?.created_by
    ? hiringPeople.find((person) => person.id === view.created_by)
    : undefined
  const creator: HeaderPerson | null = creatorPerson
    ? { name: creatorPerson.name, colour: creatorPerson.colour }
    : null
  const reviewers: HeaderPerson[] = (members.data ?? [])
    .filter((member) => member.name)
    .map((member) => ({
      name: member.name ?? '',
      colour:
        hiringPeople.find((person) => person.id === member.user_id)?.colour ?? FALLBACK_COLOUR,
    }))

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <CandidatesTopBar title={view?.title ?? ''} total={total} />
      <div className="flex min-h-0 flex-1 flex-col gap-[20px] overflow-y-auto px-[24px] pt-[20px] pb-[24px]">
        <JobHeader
          title={view?.title ?? ''}
          details={details}
          creator={creator}
          reviewers={reviewers}
          publishedOn={view?.published_at?.slice(0, 10) ?? ''}
        />
        <WorkflowBanner />
        <CandidatesToolbar
          tab={tab}
          onTabChange={setTab}
          counts={counts}
          search={search}
          onSearchChange={setSearch}
          onToggleSort={() => setOldestFirst((value) => !value)}
        />

        {applications.isError ? (
          <p role="alert" className="text-body-s text-text-secondary">
            We couldn&apos;t load the applications. Try again in a moment.
          </p>
        ) : rows.length === 0 && !loading ? (
          <p className="text-body-s text-text-secondary">No applications here yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <CandidatesTable rows={rows} selectedId={openId} onOpen={openCandidate} />
          </div>
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
      </div>

      {openId ? (
        <CandidatePanel
          key={openId}
          jobId={jobId}
          appId={openId}
          rows={rows}
          onOpen={openCandidate}
          onClose={closeCandidate}
          onError={reportError}
        />
      ) : null}
      {toast ? <JobToast toast={toast} onDismiss={dismissToast} /> : null}
    </div>
  )
}

export { ApplicationsView }
export type { ApplicationsViewProps }
