'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState, type ReactElement } from 'react'

import { AddStageDialog } from '@/components/applications/add-stage-dialog'
import { BulkBar } from '@/components/applications/bulk-bar'
import { findResume, openApplicationFile } from '@/components/applications/candidate-files'
import { CandidatePanel } from '@/components/applications/candidate-panel'
import {
  CandidatesTopBar,
  JobHeader,
  WorkflowBanner,
  type HeaderPerson,
} from '@/components/applications/candidates-header'
import { CandidatesTable } from '@/components/applications/candidates-table'
import { CandidatesToolbar } from '@/components/applications/candidates-toolbar'
import { DisqualifyDialog } from '@/components/applications/disqualify-dialog'
import { NO_FILTERS, type CandidateFilters } from '@/components/applications/filter-menu'
import { ManageStagesDialog } from '@/components/applications/manage-stages-dialog'
import { OfferPromptDialog } from '@/components/applications/offer-dialog'
import { JobToast, type JobToastState } from '@/components/jobs/job-toast'
import { Button, type AvatarColour } from '@/components/ui'
import { canDecideApplications } from '@/lib/applications/access'
import {
  ALL_TAB,
  firstName,
  stageForTab,
  stageOfKind,
  stageTabs,
  type CandidateTarget,
  type StageTab,
} from '@/lib/applications/stages'
import { apiMessage } from '@/lib/jobs/api'
import { previewJobFrom } from '@/lib/jobs/application-preview'
import {
  useBulkMoveStage,
  useCreateStage,
  useDisqualifyApplication,
  useFollowApplication,
  useMoveApplicationStage,
} from '@/lib/mutations'
import {
  useApplicantSettings,
  useApplications,
  useDisqualificationReasons,
  useHiringMe,
  useJob,
  useJobMembers,
  usePeople,
  useStages,
  useTags,
} from '@/lib/queries'
import { queryKeys } from '@/lib/query-keys'
import { requests } from '@/lib/requests'

import type { PanelTab } from '@/components/applications/candidate-panel'
import type { Applicant } from '@/lib/applications/api'
import type { MessageBody } from '@/lib/applications/communications'
import type { PipelineStage } from '@/lib/applications/pipeline'

interface ApplicationsViewProps {
  jobId: string
}

const FALLBACK_COLOUR: AvatarColour = 'grey'

/**
 * The decision target for a table row. Rows carry no canDecide, so it is taken as
 * true here: the server refuses a flagged row's rejection for anyone but its last opener.
 */
function targetOfRow(row: Applicant): CandidateTarget {
  return {
    id: row.id,
    name: row.name || row.email,
    status: row.status,
    stageId: row.stageId,
    canDecide: true,
  }
}

/**
 * The candidates of one job, in the designer's table: the job's stage tabs,
 * the search, bulk moves, and a side panel per candidate.
 */
function ApplicationsView({ jobId }: ApplicationsViewProps): ReactElement {
  const [tab, setTab] = useState<StageTab>('all')
  const [search, setSearch] = useState('')
  const [oldestFirst, setOldestFirst] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [openTab, setOpenTab] = useState<PanelTab>('overview')
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set())
  const [addingStage, setAddingStage] = useState(false)
  const [managingStages, setManagingStages] = useState(false)
  const [filters, setFilters] = useState<CandidateFilters>(NO_FILTERS)
  const [openAction, setOpenAction] = useState<'compose' | 'schedule' | 'offer' | undefined>()
  // Moving to Offer asks whether to send the letter now.
  const [offerTarget, setOfferTarget] = useState<{
    target: CandidateTarget
    stage: PipelineStage
  } | null>(null)
  const [toast, setToast] = useState<JobToastState | null>(null)

  const job = useJob(jobId)
  const members = useJobMembers(jobId)
  const people = usePeople()
  const me = useHiringMe()
  const stageList = useStages(jobId)
  const stages = useMemo<PipelineStage[]>(() => stageList.data ?? [], [stageList.data])
  const tags = useTags()
  const reasons = useDisqualificationReasons()

  // The job-wide counts come from the unfiltered list, so the tabs keep their
  // numbers while one stage is open. A tab whose stage was removed shows All.
  const summary = useApplications(jobId, { q: '' })
  const activeTab: StageTab =
    tab === ALL_TAB || stages.some((stage) => stage.id === tab) ? tab : ALL_TAB
  const applications = useApplications(jobId, {
    stage: stageForTab(activeTab),
    q: search,
    tag: filters.tag || undefined,
    followed: filters.followed,
  })

  const counts = summary.data?.pages[0]?.counts ?? {}
  const stageCounts = summary.data?.pages[0]?.stageCounts ?? {}
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const tabs = stageTabs(stages, stageCounts, total)
  // Newest first, as the server sends them, unless Sort has flipped the order.
  const rows = useMemo<Applicant[]>(() => {
    const loaded = (applications.data?.pages ?? []).flatMap((page) => page.items)
    const byDate = [...loaded].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))
    return oldestFirst ? byDate : byDate.reverse()
  }, [applications.data, oldestFirst])
  const loading = applications.isPending

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
  const openCandidate = useCallback(
    (appId: string, panelTab: PanelTab = 'overview', action?: 'compose' | 'schedule' | 'offer') => {
      setOpenTab(panelTab)
      setOpenAction(action)
      setOpenId(appId)
    },
    [],
  )
  const closeCandidate = useCallback(() => setOpenId(null), [])

  const queryClient = useQueryClient()
  const settings = useApplicantSettings()
  const sendEmails = settings.data?.send_status_emails
  const move = useMoveApplicationStage(jobId)
  const disqualify = useDisqualifyApplication(jobId)
  const bulk = useBulkMoveStage(jobId)
  const follow = useFollowApplication(jobId)
  const createStage = useCreateStage(jobId)
  // Disqualify asks for a reason: for one candidate, or for every ticked one.
  const [disqualifyTarget, setDisqualifyTarget] = useState<CandidateTarget | 'bulk' | null>(null)
  const saving = move.isPending || disqualify.isPending || bulk.isPending
  const disqualifiedStage = stageOfKind(stages, 'disqualified')

  function done(message: string): void {
    setToast({ id: Date.now(), kind: 'done', message })
  }

  /** A Move to pick: Disqualified opens the dialog; any other stage moves at once. */
  function pickStage(target: CandidateTarget, stage: PipelineStage): void {
    if (!canDecide) return
    if (stage.kind === 'disqualified') {
      setDisqualifyTarget(target)
      return
    }
    if (stage.kind === 'offer') {
      setOfferTarget({ target, stage })
      return
    }
    moveTo(target, stage)
  }

  /** Moves at once. `thenOffer` then opens the offer form on the candidate. */
  function moveTo(target: CandidateTarget, stage: PipelineStage, thenOffer = false): void {
    setOfferTarget(null)
    move.mutate(
      { appId: target.id, stage_id: stage.id },
      {
        onSuccess: () => {
          done(`${firstName(target.name)} moved to ${stage.name}`)
          if (thenOffer) {
            setOpenTab('communications')
            setOpenAction('offer')
            setOpenId(target.id)
          }
        },
        onError: reportError,
      },
    )
  }

  /** Disqualifies with the chosen reason. The server cannot undo it, so there is no Undo. */
  function disqualifyCandidate(
    target: CandidateTarget,
    decision: { reason: string; note: string; message?: MessageBody },
  ): void {
    if (!disqualifiedStage) return
    setDisqualifyTarget(null)
    disqualify.mutate(
      {
        appId: target.id,
        status: target.status,
        canDecide: target.canDecide,
        stageId: disqualifiedStage.id,
        reason: decision.reason,
        note: decision.note || undefined,
        message: decision.message,
      },
      {
        onSuccess: () => done(`${firstName(target.name)} Disqualified`),
        onError: reportError,
      },
    )
  }

  /** Moves every ticked candidate. The server answers for each, so some may be refused. */
  function moveChecked(
    stage: PipelineStage,
    decision?: { reason: string; note: string; message?: MessageBody },
  ): void {
    const ids = [...checked]
    setDisqualifyTarget(null)
    bulk.mutate(
      {
        application_ids: ids,
        stage_id: stage.id,
        reason: decision?.reason,
        note: decision?.note || undefined,
        message: decision?.message,
      },
      {
        onSuccess: (results) => {
          const refused = results.filter((item) => !item.ok).length
          setChecked(new Set())
          if (refused === 0) {
            done(`${ids.length} candidate${ids.length === 1 ? '' : 's'} moved to ${stage.name}`)
            return
          }
          setToast({
            id: Date.now(),
            kind: 'error',
            message: `${ids.length - refused} moved to ${stage.name}, ${refused} could not be moved`,
            detail: 'Flagged applications and ended ones stay where they are.',
          })
        },
        onError: reportError,
      },
    )
  }

  function pickBulkStage(stage: PipelineStage): void {
    if (stage.kind === 'disqualified') setDisqualifyTarget('bulk')
    else moveChecked(stage)
  }

  function toggleFollow(appId: string, next: boolean): void {
    follow.mutate({ appId, follow: next }, { onError: reportError })
  }

  /** Downloads the candidate's resume, the first PDF they uploaded (candidate-files). */
  function downloadCv(appId: string): void {
    void queryClient
      .fetchQuery({
        queryKey: queryKeys.application(jobId, appId),
        queryFn: () => requests.getApplication(jobId, appId),
      })
      .then((detail) => {
        const resume = findResume(detail.files)
        if (resume) return openApplicationFile(jobId, appId, resume.id)
        return undefined
      })
      .catch(reportError)
  }

  const view = job.data
  // The server lets only the creator, a hiring manager or recruiter, or job.manage_any change a status.
  const canDecide = canDecideApplications({
    meUserId: me.data?.user_id,
    creatorId: view?.created_by,
    members: members.data ?? [],
    permissions: me.data?.permissions,
  })
  const preview = view ? previewJobFrom(view, '') : null
  const details = view
    ? [view.job_code, preview?.team, preview?.workplace, preview?.location]
        .filter(Boolean)
        .join(' ⋅ ')
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
          tab={activeTab}
          onTabChange={setTab}
          tabs={tabs}
          onAddStage={canDecide ? () => setAddingStage(true) : undefined}
          onManageStages={canDecide ? () => setManagingStages(true) : undefined}
          tags={tags.data ?? []}
          filters={filters}
          onFiltersChange={setFilters}
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
          <>
            {checked.size > 0 ? (
              <BulkBar
                count={checked.size}
                options={stages
                  .filter((stage) => stage.kind !== 'applied')
                  .map((stage) => ({ stage, enabled: canDecide }))}
                pending={bulk.isPending}
                disabled={!canDecide}
                onPick={pickBulkStage}
                onClear={() => setChecked(new Set())}
              />
            ) : null}
            <div className="overflow-x-auto">
              <CandidatesTable
                rows={rows}
                stages={stages}
                tags={tags.data ?? []}
                selectedId={openId}
                checked={checked}
                onCheck={(id, on) =>
                  setChecked((current) => {
                    const next = new Set(current)
                    if (on) next.add(id)
                    else next.delete(id)
                    return next
                  })
                }
                onCheckAll={(on) => setChecked(on ? new Set(rows.map((row) => row.id)) : new Set())}
                onOpen={openCandidate}
                onPick={(row, stage) => pickStage(targetOfRow(row), stage)}
                onToggleFollow={(row) => toggleFollow(row.id, !row.followed)}
                onDownloadCv={(row) => downloadCv(row.id)}
                canDecide={canDecide}
              />
            </div>
          </>
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
          key={`${openId}:${openAction ?? ''}`}
          jobId={jobId}
          appId={openId}
          rows={rows}
          stages={stages}
          reasons={reasons.data ?? []}
          initialTab={openTab}
          initialAction={openAction}
          jobTitle={view?.title ?? ''}
          onNotify={done}
          onOpen={openCandidate}
          onClose={closeCandidate}
          onError={reportError}
          sendEmails={sendEmails}
          pending={saving}
          canDecide={canDecide}
          canCreateTags={me.data?.permissions?.includes('job.manage_any') ?? false}
          onPick={pickStage}
          onDisqualify={disqualifyCandidate}
          onToggleFollow={toggleFollow}
          onDownloadCv={downloadCv}
        />
      ) : null}
      {disqualifyTarget ? (
        <DisqualifyDialog
          key={disqualifyTarget === 'bulk' ? 'bulk' : disqualifyTarget.id}
          name={
            disqualifyTarget === 'bulk'
              ? `${checked.size} candidate${checked.size === 1 ? '' : 's'}`
              : disqualifyTarget.name
          }
          reasons={reasons.data ?? []}
          sendEmails={sendEmails}
          pending={saving}
          onCancel={() => setDisqualifyTarget(null)}
          onConfirm={(decision) => {
            if (disqualifyTarget === 'bulk') {
              if (disqualifiedStage) moveChecked(disqualifiedStage, decision)
            } else {
              disqualifyCandidate(disqualifyTarget, decision)
            }
          }}
        />
      ) : null}
      {offerTarget ? (
        <OfferPromptDialog
          name={firstName(offerTarget.target.name)}
          pending={move.isPending}
          onClose={() => setOfferTarget(null)}
          onMoveOnly={() => moveTo(offerTarget.target, offerTarget.stage)}
          onSend={() => moveTo(offerTarget.target, offerTarget.stage, true)}
        />
      ) : null}
      {managingStages ? (
        <ManageStagesDialog
          jobId={jobId}
          stages={stages}
          onClose={() => setManagingStages(false)}
        />
      ) : null}
      {addingStage ? (
        <AddStageDialog
          pending={createStage.isPending}
          onCancel={() => setAddingStage(false)}
          onConfirm={(name) =>
            createStage.mutate(name, {
              onSuccess: (stage) => {
                setAddingStage(false)
                setTab(stage.id)
                done(`${stage.name} stage added`)
              },
              onError: reportError,
            })
          }
        />
      ) : null}
      {toast ? <JobToast toast={toast} onDismiss={dismissToast} /> : null}
    </div>
  )
}

export { ApplicationsView }
export type { ApplicationsViewProps }
