'use client'

import { useCallback, useMemo, useRef, useState } from 'react'

import { DashboardErrorState } from '@/components/dashboard/dashboard-states'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { ColumnMenu, JobRowMenu } from '@/components/jobs/job-menus'
import {
  ClosingDateModal,
  DeleteJobsModal,
  ExportJobsModal,
  StatusConfirmModal,
} from '@/components/jobs/job-modals'
import { JOB_STATUS_META, JOB_STATUS_ORDER } from '@/components/jobs/job-status'
import { JobToast } from '@/components/jobs/job-toast'
import { JobsBoard } from '@/components/jobs/jobs-board'
import { JobsTable } from '@/components/jobs/jobs-table'
import { SelectionToolbar } from '@/components/jobs/selection-toolbar'
import { useJobsController } from '@/components/jobs/use-jobs-controller'
import { Button, Tabs, TextButton, TextInput } from '@/components/ui'
import { searchJobs, statusTargets } from '@/lib/jobs/actions'

import type { AnchorRect, JobRowAction } from '@/components/jobs/job-menus'
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

const toAnchor = (rect: DOMRect): AnchorRect => ({
  top: rect.top,
  left: rect.left,
  right: rect.right,
  bottom: rect.bottom,
})

function JobsPage() {
  const controller = useJobsController()
  const { jobs, jobsQuery, dialog } = controller

  const [tab, setTab] = useState<JobsTab>('all')
  const [view, setView] = useState<JobsView>('list')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
  const [rowMenu, setRowMenu] = useState<{ jobId: string; anchor: AnchorRect } | null>(null)
  const [columnMenu, setColumnMenu] = useState<{ status: JobStatus; anchor: AnchorRect } | null>(
    null,
  )

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
    const grouped = groupJobs(searchJobs(jobs, search), TAB_STATUSES[tab])
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
          for (const id of visibleIds.slice(Math.min(from, to), Math.max(from, to) + 1)) {
            next.add(id)
          }
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

  // Selected jobs that still exist — a deleted job drops out on its own.
  const selectedJobs = jobs.filter((job) => selectedIds.has(job.id))
  const selectedJobIds = selectedJobs.map((job) => job.id)
  const menuJob = rowMenu ? jobs.find((job) => job.id === rowMenu.jobId) : undefined
  const dialogJobs = dialog ? jobs.filter((job) => dialog.jobIds.includes(job.id)) : []

  function handleRowAction(job: Job, action: JobRowAction) {
    if (action === 'duplicate') controller.duplicate([job.id])
    else if (action === 'copy-link') void controller.copyLinks([job.id])
    else if (action === 'delete') controller.openDialog({ type: 'delete', jobIds: [job.id] })
    else if (action === 'export') controller.openDialog({ type: 'export', jobIds: [job.id] })
    else if (action === 'closing-date') {
      controller.openDialog({ type: 'closing-date', jobIds: [job.id] })
    }
    // Editing and assigning open flows that are built separately.
  }

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
            {/* The label names the view you would switch to. */}
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
          <JobsTable
            groups={groups}
            selectedIds={selectedIds}
            menuJobId={rowMenu?.jobId ?? null}
            onSelect={selectJob}
            onOpenMenu={(jobId, rect) => setRowMenu({ jobId, anchor: toAnchor(rect) })}
          />
        </div>
      ) : (
        <JobsBoard
          groups={groups}
          selectedIds={selectedIds}
          menuStatus={columnMenu?.status ?? null}
          onSelect={selectJob}
          // A drop is its own confirmation, and the toast offers Undo.
          onMoveJob={(jobId, status) => controller.applyStatus([jobId], status)}
          onOpenColumnMenu={(status, rect) => setColumnMenu({ status, anchor: toAnchor(rect) })}
        />
      )}

      {selectedJobs.length > 0 ? (
        <SelectionToolbar
          count={selectedJobs.length}
          statusOptions={statusTargets(selectedJobs)}
          showClosingDate={selectedJobs.some((job) => job.status === 'open')}
          // The selection is kept after a status change so the moved jobs can
          // still be tracked; Escape or the close button dismisses it.
          onChangeStatus={(status) => controller.requestStatus(selectedJobIds, status)}
          onChangeClosingDate={() =>
            controller.openDialog({ type: 'closing-date', jobIds: selectedJobIds })
          }
          onDuplicate={() => controller.duplicate(selectedJobIds)}
          onCopyLinks={() => void controller.copyLinks(selectedJobIds)}
          onExport={() => controller.openDialog({ type: 'export', jobIds: selectedJobIds })}
          onDelete={() => controller.openDialog({ type: 'delete', jobIds: selectedJobIds })}
          onClear={clearSelection}
        />
      ) : null}

      {controller.toast ? (
        <JobToast toast={controller.toast} onDismiss={controller.dismissToast} />
      ) : null}

      {rowMenu && menuJob ? (
        <JobRowMenu
          job={menuJob}
          anchor={rowMenu.anchor}
          onAction={(action) => handleRowAction(menuJob, action)}
          onChangeStatus={(status) => controller.requestStatus([menuJob.id], status)}
          onClose={() => setRowMenu(null)}
        />
      ) : null}

      {columnMenu ? (
        <ColumnMenu
          label={`${JOB_STATUS_META[columnMenu.status].label} column actions`}
          anchor={columnMenu.anchor}
          onSelectAll={() => {
            const columnIds = groups.find((group) => group.status === columnMenu.status)?.jobs
            setSelectedIds(
              (previous) => new Set([...previous, ...(columnIds ?? []).map((j) => j.id)]),
            )
          }}
          onExport={() => {
            const columnIds = groups.find((group) => group.status === columnMenu.status)?.jobs
            controller.openDialog({ type: 'export', jobIds: (columnIds ?? []).map((j) => j.id) })
          }}
          onClose={() => setColumnMenu(null)}
        />
      ) : null}

      {dialog?.type === 'status' ? (
        <StatusConfirmModal
          status={dialog.status}
          onConfirm={controller.confirmDialog.status}
          onClose={controller.closeDialog}
        />
      ) : null}
      {dialog?.type === 'delete' ? (
        <DeleteJobsModal
          applicantCount={dialogJobs.reduce((total, job) => total + job.totalApplicants, 0)}
          onConfirm={controller.confirmDialog.delete}
          onClose={controller.closeDialog}
        />
      ) : null}
      {dialog?.type === 'closing-date' ? (
        <ClosingDateModal
          onSave={controller.confirmDialog.closingDate}
          onClose={controller.closeDialog}
        />
      ) : null}
      {dialog?.type === 'export' ? (
        <ExportJobsModal
          selectedCount={dialog.jobIds.length}
          onExport={controller.confirmDialog.export}
          onClose={controller.closeDialog}
        />
      ) : null}
    </div>
  )
}

export default JobsPage
