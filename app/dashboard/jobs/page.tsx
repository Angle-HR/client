'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DashboardErrorState } from '@/components/dashboard/dashboard-states'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { ChooseTemplateModal, StartJobModal } from '@/components/jobs/create/start-modals'
import { toAnchor } from '@/components/jobs/floating'
import { FilterBar, FilterPopovers } from '@/components/jobs/job-filters'
import { ColumnMenu, JobRowMenu } from '@/components/jobs/job-menus'
import {
  AssignJobsModal,
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
import { TemplatesPanel } from '@/components/jobs/templates/templates-panel'
import { useJobsController } from '@/components/jobs/use-jobs-controller'
import { Button, Tabs, TextButton, TextInput } from '@/components/ui'
import { searchJobs, statusTargets } from '@/lib/jobs/actions'
import { applyFilters, applySort } from '@/lib/jobs/filters'
import { useJobTemplates, useMe } from '@/lib/queries'

import type { AnchorRect } from '@/components/jobs/floating'
import type { FilterPopover } from '@/components/jobs/job-filters'
import type { JobRowAction } from '@/components/jobs/job-menus'
import type { JobGroup, SelectJob } from '@/components/jobs/jobs-table'
import type { TabOption } from '@/components/ui'
import type { JobFilter, JobSort } from '@/lib/jobs/filters'
import type { Job, JobManager, JobStatus } from '@/lib/jobs/types'

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

function JobsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const controller = useJobsController()
  const { jobs, jobsQuery, dialog } = controller
  const templates = useJobTemplates().data ?? []
  const templateCount = templates.length
  const me = useMe()

  // Deep links such as ?tab=templates open on that tab.
  const [tab, setTab] = useState<JobsTab>(() => {
    const requested = searchParams.get('tab')
    return requested === 'drafts' || requested === 'archived' || requested === 'templates'
      ? requested
      : 'all'
  })
  const [starting, setStarting] = useState<'choice' | 'template' | null>(null)
  const [view, setView] = useState<JobsView>('list')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<JobFilter[]>([])
  const [sort, setSort] = useState<JobSort | null>(null)
  const [filterPopover, setFilterPopover] = useState<FilterPopover | null>(null)
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
      { key: 'templates', label: 'Templates', count: templateCount },
    ]
  }, [jobs, templateCount])

  // Search, then filters, then sort; grouping keeps the sorted order within
  // each status. The board has its own fixed order unless a sort is chosen.
  const tabJobs = useMemo(
    () => jobs.filter((job) => TAB_STATUSES[tab].includes(job.status)),
    [jobs, tab],
  )
  const groups = useMemo(() => {
    const matching = applySort(applyFilters(searchJobs(tabJobs, search), filters), sort)
    const grouped = groupJobs(matching, TAB_STATUSES[tab])
    return view === 'board' && !sort ? byNewest(grouped) : grouped
  }, [tabJobs, search, filters, sort, tab, view])
  const shownCount = groups.reduce((total, group) => total + group.jobs.length, 0)
  const narrowed = search.trim() !== '' || filters.length > 0

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
  const meName = me.data?.first_name || me.data?.legal_full_name || me.data?.email || 'You'
  const currentUser: JobManager = { name: meName, colour: 'blue' }
  const menuJob = rowMenu ? jobs.find((job) => job.id === rowMenu.jobId) : undefined
  const dialogJobs = dialog ? jobs.filter((job) => dialog.jobIds.includes(job.id)) : []

  function handleRowAction(job: Job, action: JobRowAction) {
    if (action === 'duplicate') controller.duplicate([job.id])
    else if (action === 'copy-link') void controller.copyLinks([job.id])
    else if (action === 'delete') controller.openDialog({ type: 'delete', jobIds: [job.id] })
    else if (action === 'export') controller.openDialog({ type: 'export', jobIds: [job.id] })
    else if (action === 'assign') controller.openDialog({ type: 'assign', jobIds: [job.id] })
    else if (action === 'closing-date') {
      controller.openDialog({ type: 'closing-date', jobIds: [job.id] })
    } else if (action === 'edit') router.push(`/dashboard/jobs/new?job=${job.id}`)
  }

  // Coming back from the job form: confirm the save once, then tidy the URL.
  const { notify } = controller
  useEffect(() => {
    const saved = searchParams.get('saved')
    if (!saved) return
    const messages: Record<string, string> = {
      draft: 'Job saved as a draft',
      'draft-template': 'Job saved as a draft and as a template',
      changes: 'Changes saved',
    }
    if (messages[saved]) notify({ kind: 'done', message: messages[saved] })
    router.replace(tab === 'templates' ? '/dashboard/jobs?tab=templates' : '/dashboard/jobs')
  }, [searchParams, notify, router, tab])

  if (jobsQuery.isError) return <DashboardErrorState kind="unknown" />
  if (jobsQuery.isPending) return null

  // Nothing created yet: the first-job invitation replaces the whole list.
  // Figma: 8973:608566.
  if (jobs.length === 0) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col">
        <header className="flex h-[44px] shrink-0 items-center border-b-[0.5px] border-border-transparent-medium">
          <h1 className="pl-[18px] text-body-xs leading-19_2 text-text-primary">Jobs</h1>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center gap-[32px] pb-[140px]">
          <Image
            aria-hidden="true"
            alt=""
            src="/dashboard/illustration/empty-screen.svg"
            width={180}
            height={149}
            className="h-[149px] w-[180px] max-w-none shrink-0"
          />
          <div className="flex w-[273px] flex-col items-center gap-[24px] text-center">
            <div className="flex flex-col gap-[12px]">
              <p className="-my-[5px] text-body-m leading-21 font-semibold text-text-primary">
                Create your first job
              </p>
              <p className="-my-[5px] text-body-xs leading-19_2 text-text-secondary">
                Post a role, track candidates, and onboard them
              </p>
            </div>
            <div className="flex flex-col items-center gap-[10px]">
              <Button
                variant="primary"
                accent="blue"
                size="sm"
                iconSuffix={<DashboardIcon name="plus-solid" size={14} />}
                onClick={() => router.push('/dashboard/jobs/new')}
              >
                Create a new job
              </Button>
              {/* The AI-assisted flow is still being designed. */}
              <Button
                variant="tertiary"
                accent="blue"
                size="sm"
                disabled
                iconSuffix={<DashboardIcon name="sparkles-solid" size={14} />}
              >
                Create with AI
              </Button>
            </div>
          </div>
        </div>
        <TextButton
          size="sm"
          href="/dashboard/help"
          className="absolute bottom-[33px] left-1/2 -translate-x-1/2 text-text-primary!"
          iconRight={<DashboardIcon name="arrow-top-right-on-square-solid" size={10} />}
        >
          Learn How to create job on OpenHR
        </TextButton>
        {controller.toast ? (
          <JobToast toast={controller.toast} onDismiss={controller.dismissToast} />
        ) : null}
      </div>
    )
  }

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
            onClick={() => setStarting('choice')}
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
            <TextButton
              size="sm"
              aria-haspopup="menu"
              // Job filters and sorts do not apply to templates.
              disabled={tab === 'templates'}
              className={barAction}
              onClick={(event) =>
                setFilterPopover({
                  type: 'filter-menu',
                  align: 'right',
                  anchor: toAnchor(event.currentTarget.getBoundingClientRect()),
                })
              }
            >
              <BarActionLabel icon="funnel-outline" iconSize={11} label="Filter" />
            </TextButton>
            <TextButton
              size="sm"
              aria-haspopup="menu"
              // Job filters and sorts do not apply to templates.
              disabled={tab === 'templates'}
              className={barAction}
              onClick={(event) =>
                setFilterPopover({
                  type: 'sort-menu',
                  anchor: toAnchor(event.currentTarget.getBoundingClientRect()),
                })
              }
            >
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

      {/* 12px of padding either side, plus the 8px gap to the list below. */}
      <div className="flex shrink-0 flex-col gap-[16px] px-[16px] pt-[12px] pb-[20px]">
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
        {tab === 'templates' ? null : (
          <FilterBar
            jobs={tabJobs}
            filters={filters}
            sort={sort}
            onFiltersChange={setFilters}
            onSortChange={setSort}
            onOpen={setFilterPopover}
          />
        )}
      </div>

      {tab === 'templates' ? (
        <TemplatesPanel view={view} search={search} />
      ) : groups.length === 0 ? (
        narrowed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-[20px] text-center">
            <span className="inline-flex text-text-light">
              <DashboardIcon name="funnel-outline" size={32} />
            </span>
            <div className="flex flex-col gap-[14px]">
              <p className="text-body-s leading-none font-semibold text-text-secondary">
                No job matching the filters set
              </p>
              <p className="text-body-s leading-none text-text-tertiary">
                {tabJobs.length - shownCount} {tabJobs.length - shownCount === 1 ? 'job' : 'jobs'}{' '}
                hidden by filters
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setFilters([])
              }}
              className="flex h-[24px] cursor-pointer items-center gap-[4px] rounded-sm-7 px-[8px] text-body-s leading-19_5 font-medium text-text-tertiary transition-colors hover:bg-bg-transparent-light hover:text-text-primary"
            >
              <DashboardIcon name="x-mark-solid" size={14} />
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-body-s leading-19_5 font-medium text-text-tertiary">
              Nothing here yet
            </p>
          </div>
        )
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
          onAssign={() => controller.openDialog({ type: 'assign', jobIds: selectedJobIds })}
          onDuplicate={() => controller.duplicate(selectedJobIds)}
          onCopyLinks={() => void controller.copyLinks(selectedJobIds)}
          onExport={() => controller.openDialog({ type: 'export', jobIds: selectedJobIds })}
          onDelete={() => controller.openDialog({ type: 'delete', jobIds: selectedJobIds })}
          onClear={clearSelection}
        />
      ) : null}

      <FilterPopovers
        popover={filterPopover}
        jobs={tabJobs}
        filters={filters}
        sort={sort}
        onFiltersChange={setFilters}
        onSortChange={setSort}
        onClose={() => setFilterPopover(null)}
      />

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

      {starting === 'choice' ? (
        <StartJobModal
          onClose={() => setStarting(null)}
          onContinue={(choice) => {
            if (choice === 'template') setStarting('template')
            else router.push('/dashboard/jobs/new')
          }}
        />
      ) : null}
      {starting === 'template' ? (
        <ChooseTemplateModal
          templates={templates}
          onBack={() => setStarting('choice')}
          onOpenTemplates={() => {
            setStarting(null)
            setTab('templates')
          }}
          onClose={() => setStarting(null)}
          onContinue={(id) => router.push(`/dashboard/jobs/new?template=${id}`)}
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
      {dialog?.type === 'assign' ? (
        <AssignJobsModal
          me={currentUser}
          // Pre-select the current managers only when every job agrees on them.
          current={
            dialogJobs.every(
              (job) =>
                job.managers.map((m) => m.name).join() ===
                dialogJobs[0]?.managers.map((m) => m.name).join(),
            )
              ? (dialogJobs[0]?.managers ?? [])
              : []
          }
          onSave={controller.confirmDialog.assign}
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

/** `useSearchParams` needs a Suspense boundary to keep the route statically renderable. */
function JobsRoute() {
  return (
    <Suspense fallback={null}>
      <JobsPage />
    </Suspense>
  )
}

export default JobsRoute
