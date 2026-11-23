'use client'

import { useEffect, useState, type ReactElement } from 'react'

import { CandidateOverview, formatDateTime } from '@/components/applications/candidate-overview'
import { MoveToMenu } from '@/components/applications/move-to-menu'
import { StageChip } from '@/components/applications/stage-chip'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Avatar, Button, IconButton, Tabs, getInitials } from '@/components/ui'
import { currentRoleFromAnswers } from '@/lib/applications/contact'
import {
  DESIGN_STAGES,
  canMoveTo,
  disqualifyPlan,
  moveTarget,
  stageLabel,
  stageOfStatus,
  type DesignStage,
} from '@/lib/applications/stages'
import { useChangeApplicationStatus, useDisqualifyApplication } from '@/lib/mutations'
import { useApplication } from '@/lib/queries'

import type { Applicant } from '@/lib/applications/api'

type PanelTab = 'overview' | 'communications' | 'notes' | 'activity'

/** The tabs as the design draws them. Only Overview has content yet. */
const PANEL_TABS: ReadonlyArray<{ key: PanelTab; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'communications', label: 'Communications' },
  { key: 'notes', label: 'Notes' },
  { key: 'activity', label: 'Activity log' },
]

/** Arrow keys belong to the field being typed in. */
function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

interface CandidatePanelProps {
  jobId: string
  appId: string
  /** The loaded rows of the table, which the arrows and the count walk through. */
  rows: Applicant[]
  onOpen: (appId: string) => void
  onClose: () => void
  onError: (cause: unknown) => void
}

/**
 * One candidate over the page: the stage, the actions, and the overview. The
 * arrows walk the loaded candidates in the same stage, and Escape closes it.
 * It is keyed by candidate, so each one opens on the Overview tab.
 */
function CandidatePanel({
  jobId,
  appId,
  rows,
  onOpen,
  onClose,
  onError,
}: CandidatePanelProps): ReactElement {
  const application = useApplication(jobId, appId)
  const detail = application.data
  const row = rows.find((item) => item.id === appId)
  const status = detail?.status ?? row?.status
  const stage: DesignStage | null = status ? stageOfStatus(status) : null
  const group = stage ? rows.filter((item) => stageOfStatus(item.status) === stage) : []
  const index = group.findIndex((item) => item.id === appId)
  const previousId = index > 0 ? group[index - 1]?.id : undefined
  const nextId = index >= 0 && index < group.length - 1 ? group[index + 1]?.id : undefined

  const [tab, setTab] = useState<PanelTab>('overview')
  const [moveOpen, setMoveOpen] = useState(false)
  const disqualify = useDisqualifyApplication(jobId)
  const change = useChangeApplicationStatus(jobId)
  const busy = disqualify.isPending || change.isPending

  const plan = status ? disqualifyPlan(status, detail?.canDecide ?? false) : null
  const name = detail?.name || row?.name || row?.email || ''
  const role = detail ? currentRoleFromAnswers(detail.answers) : { role: '', company: '' }

  useEffect(() => {
    function handleKey(event: KeyboardEvent): void {
      // A control that used the key (the tab bar, for one) keeps it.
      if (event.defaultPrevented || isTyping(event.target)) return
      if (event.key === 'Escape') {
        // The first Escape closes the menu, the next closes the panel.
        if (moveOpen) setMoveOpen(false)
        else onClose()
      } else if (event.key === 'ArrowLeft' && previousId) onOpen(previousId)
      else if (event.key === 'ArrowRight' && nextId) onOpen(nextId)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [moveOpen, nextId, previousId, onClose, onOpen])

  function disqualifyCandidate(): void {
    if (!status) return
    disqualify.mutate({ appId, status, canDecide: detail?.canDecide ?? false }, { onError })
  }

  function moveTo(next: DesignStage): void {
    const target = moveTarget(next)
    if (target) change.mutate({ appId, status: target }, { onError })
  }

  const moveOptions = DESIGN_STAGES.map((option) => ({
    stage: option.key,
    label: option.label,
    enabled: status ? canMoveTo(option.key, status) : false,
  }))

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-[var(--color-black-6)]"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={name || 'Candidate'}
        className="fixed inset-y-0 right-0 z-50 flex w-[min(915px,100%)] flex-col bg-bg-primary shadow-lg"
      >
        <div className="flex h-[44px] shrink-0 items-center justify-between border-b-[0.5px] border-border-transparent-medium pr-[12px] pl-[16px]">
          <p className="min-w-0 truncate text-body-xs leading-19_2 text-text-secondary">
            {index >= 0 && stage ? (
              <>
                {index + 1} of {group.length} in{' '}
                <span className="font-semibold text-text-primary">{stageLabel(stage)}</span> Stage
              </>
            ) : null}
          </p>
          <div className="flex items-center gap-[8px]">
            <span className="text-caption-m text-text-tertiary">⌘ Shortcuts</span>
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Expand"
              icon={<DashboardIcon name="arrows-pointing-out-solid" size={11} />}
            />
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Close"
              onClick={onClose}
              icon={<DashboardIcon name="x-mark-solid" size={12} />}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[8px] border-b-[0.5px] border-border-transparent-medium px-[16px] py-[10px]">
          <IconButton
            variant="tertiary"
            size="sm"
            aria-label="Previous candidate"
            disabled={!previousId}
            onClick={() => previousId && onOpen(previousId)}
            icon={<DashboardIcon name="chevron-left-solid" size={10} />}
          />
          <IconButton
            variant="tertiary"
            size="sm"
            aria-label="Next candidate"
            disabled={!nextId}
            onClick={() => nextId && onOpen(nextId)}
            icon={<DashboardIcon name="chevron-right-solid" size={10} />}
          />
          {stage ? <StageChip stage={stage} /> : null}
          <div className="ml-auto flex items-center gap-[2px]">
            {/* Drawn with no flow behind them yet. */}
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Email"
              icon={<DashboardIcon name="envelope-solid" size={12} />}
            />
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Schedule"
              icon={<DashboardIcon name="calendar-solid" size={12} />}
            />
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Comment"
              icon={<DashboardIcon name="chat-bubble-left-ellipsis-solid" size={12} />}
            />
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Download"
              icon={<DashboardIcon name="arrow-down-tray-solid" size={12} />}
            />
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Star"
              icon={<DashboardIcon name="star-solid" size={12} />}
            />
          </div>
          <Button
            variant="secondary"
            accent="red"
            size="sm"
            disabled={!plan || busy}
            onClick={disqualifyCandidate}
            iconSuffix={<DashboardIcon name="chev-down-solid" size={10} />}
          >
            Disqualify
          </Button>
          <MoveToMenu
            open={moveOpen}
            onOpenChange={setMoveOpen}
            options={moveOptions}
            onPick={moveTo}
            disabled={!status || busy}
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-col gap-[12px] px-[24px] pt-[20px]">
            <div className="flex items-start gap-[12px]">
              <Avatar size={44} type="initials" colour="green" text={getInitials(name || '?')} />
              <div className="flex min-w-0 flex-col gap-[4px] pt-[2px]">
                <div className="flex items-center gap-[8px]">
                  <h2 className="truncate text-body-m leading-21 font-semibold text-text-primary">
                    {name}
                  </h2>
                  {/* Drawn with no follow behind it yet. */}
                  <span className="flex items-center gap-[2px] text-caption-m text-text-tertiary">
                    <DashboardIcon name="star-outline" size={10} />
                    Follow
                  </span>
                </div>
                {detail ? (
                  <p className="flex items-center gap-[6px] text-caption-m leading-17_6 text-text-tertiary">
                    <DashboardIcon name="clock-solid" size={10} />
                    Applied {formatDateTime(detail.submittedAt)}
                  </p>
                ) : null}
                {role.role || role.company ? (
                  <p className="flex items-center gap-[6px] text-caption-m leading-17_6 text-text-tertiary">
                    <DashboardIcon name="briefcase-solid" size={10} />
                    {[role.role, role.company].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
              </div>
            </div>
            <Tabs
              tabs={PANEL_TABS}
              value={tab}
              onValueChange={setTab}
              aria-label="Candidate details"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-[24px] py-[20px]">
            {application.isError ? (
              <p role="alert" className="text-body-s text-text-secondary">
                We couldn&apos;t open this application.
              </p>
            ) : detail && tab === 'overview' ? (
              <CandidateOverview jobId={jobId} detail={detail} onError={onError} />
            ) : null}
          </div>
        </div>
      </aside>
    </>
  )
}

export { CandidatePanel }
export type { CandidatePanelProps }
