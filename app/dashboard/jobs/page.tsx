'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'

import { DashboardErrorState } from '@/components/dashboard/dashboard-states'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { JOB_STATUS_ORDER } from '@/components/jobs/job-status'
import { JobsBoard } from '@/components/jobs/jobs-board'
import { JobsTable } from '@/components/jobs/jobs-table'
import { SelectionToolbar } from '@/components/jobs/selection-toolbar'
import { Button, Tabs, TextButton, TextInput } from '@/components/ui'
import { useJobs } from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'

import type { JobGroup, SelectJob } from '@/components/jobs/jobs-table'
import type { TabOption } from '@/components/ui'
import type { Job, JobStatus } from '@/lib/jobs/types'

type JobsTab = 'all' | 'drafts' | 'archived' | 'templates'
type JobsView = 'list' | 'board'

/** Which statuses each tab lists; groups always follow JOB_STATUS_ORDER. */
const TAB_STATUSES: Record<JobsTab, JobStatus[]> = {
  all: JOB_STATUS_ORDER,
  drafts: ['draft'],
  archived: ['archived', 'expired'],
  // Templates are their own flow and are not jobs with a status.
  templates: [],
}

// The design sets the bar's actions in secondary text on a 6px hit area, not
// the text button's default link blue.
const barAction =
  'rounded-sm-6 p-[6px] text-text-secondary! hover:bg-bg-transparent-light hover:text-text-primary! disabled:hover:bg-transparent'

/**
 * Icon plus label for a bar action. The icons are 10 or 11px depending on the
 * glyph, which the text button's own fixed 10px icon slot cannot express.
 */
function BarActionLabel({
  icon,
  iconSize,
  label,
}: {
  icon: string
  iconSize: number
  label: string
}) {
  return (
    <span className="flex items-center gap-[2px] leading-none">
      <DashboardIcon name={icon} size={iconSize} />
      {label}
    </span>
  )
}

/**
 * Search matches a job's title or department. Title matches rank above
 * department-only matches, per the designer's note on the search field.
 */
function searchJobs(jobs: Job[], term: string): Job[] {
  if (!term) return jobs
  const inTitle = jobs.filter((job) => job.title.toLowerCase().includes(term))
  const inDepartment = jobs.filter(
    (job) => !job.title.toLowerCase().includes(term) && job.department.toLowerCase().includes(term),
  )
  return [...inTitle, ...inDepartment]
}

function groupJobs(jobs: Job[], statuses: JobStatus[]): JobGroup[] {
  return JOB_STATUS_ORDER.filter((status) => statuses.includes(status))
    .map((status) => ({ status, jobs: jobs.filter((job) => job.status === status) }))
    .filter((group) => group.jobs.length > 0)
}

/** Board columns are always newest first — "ordered by date created". */
function byNewest(groups: JobGroup[]): JobGroup[] {
  return groups.map((group) => ({
    ...group,
    jobs: [...group.jobs].sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
  }))
}

function JobsPage() {
  const jobsQuery = useJobs()
  const [tab, setTab] = useState<JobsTab>('all')
  const [view, setView] = useState<JobsView>('list')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())

  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data])

  const tabs = useMemo<TabOption<JobsTab>[]>(() => {
    const count = (key: JobsTab) =>
      jobs.filter((job) => TAB_STATUSES[key].includes(job.status)).length
    return [
      { key: 'all', label: 'All Job Listing', count: count('all') },
      { key: 'drafts', label: 'Drafts', count: count('drafts') },
      { key: 'archived', label: 'Archived', count: count('archived') },
      { key: 'templates', label: 'Templates', count: 0 },
    ]
  }, [jobs])

  const groups = useMemo(() => {
    const matching = searchJobs(jobs, search.trim().toLowerCase())
    const grouped = groupJobs(matching, TAB_STATUSES[tab])
    return view === 'board' ? byNewest(grouped) : grouped
  }, [jobs, search, tab, view])

  // Jobs in the order they are on screen, which is what a Shift-click range
  // runs across.
  const visibleIds = useMemo(
    () => groups.flatMap((group) => group.jobs.map((job) => job.id)),
    [groups],
  )
  const lastSelectedId = useRef<string | null>(null)

  const selectJob = useCallback<SelectJob>(
    (jobId, { range }) => {
      setSelectedIds((previous) => {
        const next = new Set(previous)
        const anchor = lastSelectedId.current
        const from = anchor ? visibleIds.indexOf(anchor) : -1
        const to = visibleIds.indexOf(jobId)
        if (range && from !== -1 && to !== -1) {
          for (const id of visibleIds.slice(Math.min(from, to), Math.max(from, to) + 1))
            next.add(id)
        } else if (next.has(jobId)) next.delete(jobId)
        else next.add(jobId)
        return next
      })
      lastSelectedId.current = jobId
    },
    [visibleIds],
  )

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    lastSelectedId.current = null
  }, [])

  // There is no jobs API yet, so edits are applied to the cached list.
  const queryClient = useQueryClient()
  const setStatus = useCallback(
    (jobIds: ReadonlySet<string>, status: JobStatus) => {
      queryClient.setQueryData<Job[]>(queryKeys.jobs, (current) =>
        current?.map((job) => (jobIds.has(job.id) ? { ...job, status } : job)),
      )
    },
    [queryClient],
  )

  const selectedJobs = jobs.filter((job) => selectedIds.has(job.id))

  if (jobsQuery.isError) return <DashboardErrorState kind="unknown" />
  if (jobsQuery.isPending) return null

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="flex h-[44px] shrink-0 items-center justify-between border-b-[0.5px] border-border-transparent-medium">
        <h1 className="pl-[18px] text-body-xs leading-19_2 text-text-primary">Jobs</h1>
        <div className="flex items-center p-[10px]">
          <Button
            variant="primary"
            accent="blue"
            size="sm"
            iconPrefix={<DashboardIcon name="plus-solid" size={14} />}
          >
            Create a new job
          </Button>
        </div>
      </header>

      <Tabs
        aria-label="Job listings"
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
        leading={
          <span className="inline-flex p-[10px] text-text-primary">
            <DashboardIcon
              name={view === 'list' ? 'list-bullet-outline' : 'view-columns-outline'}
              size={11}
            />
          </span>
        }
        trailing={
          <>
            {/* Filter and Sort open menus that are not built yet. */}
            <TextButton size="sm" disabled className={barAction}>
              <BarActionLabel icon="funnel-outline" iconSize={11} label="Filter" />
            </TextButton>
            <TextButton size="sm" disabled className={barAction}>
              <BarActionLabel icon="bars-arrow-up-solid" iconSize={10} label="Sort" />
            </TextButton>
            <TextButton
              size="sm"
              className={barAction}
              onClick={() => setView(view === 'list' ? 'board' : 'list')}
            >
              <BarActionLabel
                icon={view === 'list' ? 'view-columns-outline' : 'list-bullet-outline'}
                iconSize={11}
                label={view === 'list' ? 'Grid view' : 'List view'}
              />
            </TextButton>
          </>
        }
      />

      <div className="flex shrink-0 items-center px-[16px] pt-[12px] pb-[20px]">
        <div className="w-[240px]">
          <TextInput
            size="md"
            showLabel={false}
            aria-label="Search jobs"
            placeholder="Search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            showPrefixIcon
            // Placeholder grey in the design, not the input's default icon colour.
            prefixIcon={
              <span className="inline-flex text-text-input-placeholder">
                <DashboardIcon name="magnifying-glass-outline" size={14} />
              </span>
            }
          />
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-[8px] text-center">
          <p className="text-body-s leading-19_5 font-medium text-text-primary">
            {search.trim() ? 'No job matching your search' : 'Nothing here yet'}
          </p>
          {search.trim() ? (
            <TextButton size="sm" onClick={() => setSearch('')}>
              Clear search
            </TextButton>
          ) : null}
        </div>
      ) : view === 'list' ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <JobsTable groups={groups} selectedIds={selectedIds} onSelect={selectJob} />
        </div>
      ) : (
        <JobsBoard
          groups={groups}
          selectedIds={selectedIds}
          onSelect={selectJob}
          onMoveJob={(jobId, status) => setStatus(new Set([jobId]), status)}
        />
      )}

      {selectedJobs.length > 0 ? (
        <SelectionToolbar
          count={selectedJobs.length}
          showClosingDate={selectedJobs.some((job) => job.status === 'open')}
          // The selection is kept after a status change so the moved jobs can
          // still be tracked; Escape or the close button dismisses it.
          onChangeStatus={(status) => setStatus(selectedIds, status)}
          onClear={clearSelection}
        />
      ) : null}
    </div>
  )
}

export default JobsPage
