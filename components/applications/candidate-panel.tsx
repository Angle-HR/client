'use client'

import { useEffect, useState, type ReactElement } from 'react'

import { CandidateOverview, formatDateTime } from '@/components/applications/candidate-overview'
import { DisqualifyPopover } from '@/components/applications/disqualify-popover'
import { MoveToMenu } from '@/components/applications/move-to-menu'
import { ShortcutsDialog } from '@/components/applications/shortcuts-dialog'
import { StageChip } from '@/components/applications/stage-chip'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Avatar, Button, IconButton, Tabs, getInitials } from '@/components/ui'
import { currentRoleFromAnswers } from '@/lib/applications/contact'
import {
  disqualifyPlan,
  moveOptionsFor,
  stageLabel,
  stageOfStatus,
  type CandidateTarget,
  type DesignStage,
} from '@/lib/applications/stages'
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
  /** Whether the company emails rejected candidates (send_status_emails), or unknown. */
  sendEmails: boolean | undefined
  /** A stage or disqualification is being saved. */
  pending: boolean
  /** Whether the signed-in person may move or disqualify this job's applications. */
  canDecide: boolean
  onPick: (target: CandidateTarget, stage: DesignStage) => void
  onDisqualify: (target: CandidateTarget, note: string) => void
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
  sendEmails,
  pending,
  canDecide,
  onPick,
  onDisqualify,
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
  const [disqualifyOpen, setDisqualifyOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const name = detail?.name || row?.name || row?.email || ''
  const role = detail ? currentRoleFromAnswers(detail.answers) : { role: '', company: '' }
  // The decision is made for this candidate; canDecide is only known once the detail loads.
  const target: CandidateTarget | null = status
    ? { id: appId, name, status, canDecide: detail?.canDecide ?? false }
    : null

  const moveOptions = target ? moveOptionsFor(target.status, target.canDecide) : []
  const canDisqualify = target ? disqualifyPlan(target.status, target.canDecide) !== null : false
  // D opens the Disqualify popover only where the button would be enabled (01, 03).
  const canOpenDisqualify = canDecide && canDisqualify

  useEffect(() => {
    function handleKey(event: KeyboardEvent): void {
      if (event.defaultPrevented) return
      const typing = isTyping(event.target)
      // Ctrl/⌘ + / toggles the shortcuts dialog, typing or not (03).
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        setShortcutsOpen((open) => !open)
        return
      }
      // The dialog takes the keys while it is open; the Modal handles its own Escape.
      if (shortcutsOpen || event.ctrlKey || event.metaKey) return
      // A field being typed in keeps its keys, except Alt/⌥ combinations.
      if (typing && !event.altKey) return

      if (event.altKey) {
        // ⌥ changes the character, so the physical key is read.
        const letter = event.code.replace('Key', '').toLowerCase()
        if (letter === 'j' && nextId) onOpen(nextId)
        else if (letter === 'k' && previousId) onOpen(previousId)
        return
      }

      if (event.key === 'Escape') {
        // The first Escape closes a menu, the next closes the panel.
        if (moveOpen) setMoveOpen(false)
        else if (disqualifyOpen) setDisqualifyOpen(false)
        else onClose()
        return
      }
      const key = event.key.toLowerCase()
      if ((key === 'j' || event.key === 'ArrowRight') && nextId) onOpen(nextId)
      else if ((key === 'k' || event.key === 'ArrowLeft') && previousId) onOpen(previousId)
      else if (key === 'd' && canOpenDisqualify) {
        setMoveOpen(false)
        setDisqualifyOpen(true)
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [
    moveOpen,
    disqualifyOpen,
    shortcutsOpen,
    canOpenDisqualify,
    nextId,
    previousId,
    onClose,
    onOpen,
  ])

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
        className="fixed inset-y-0 right-0 z-50 flex w-[min(910px,100%)] flex-col bg-bg-primary shadow-lg"
      >
        <div className="flex h-[49px] shrink-0 items-center justify-between border-b-[0.5px] border-border-transparent-medium pr-[18px] pl-[18px]">
          <p className="flex min-w-0 items-center gap-[4px] truncate text-body-xs leading-19_2 text-text-secondary">
            {index >= 0 && stage ? (
              <>
                {index + 1} of {group.length} in{' '}
                <span className="font-medium text-text-primary">{stageLabel(stage)}</span> Stage
              </>
            ) : null}
          </p>
          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="inline-flex items-center gap-[4px] text-body-xs leading-19_2 text-text-secondary transition-colors hover:text-text-primary"
            >
              <DashboardIcon name="cmd-solid" size={10} />
              Shortcuts
            </button>
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Expand"
              icon={<DashboardIcon name="arrows-pointing-out-solid" size={14} />}
            />
            <IconButton
              variant="tertiary"
              size="sm"
              aria-label="Close"
              onClick={onClose}
              icon={<DashboardIcon name="x-mark-solid" size={14} />}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-[8px] border-b-[0.5px] border-border-transparent-medium px-[18px] py-[8px]">
          <IconButton
            variant="secondary"
            size="sm"
            aria-label="Previous candidate"
            disabled={!previousId}
            onClick={() => previousId && onOpen(previousId)}
            icon={<DashboardIcon name="chevron-left-solid" size={14} />}
          />
          <IconButton
            variant="secondary"
            size="sm"
            aria-label="Next candidate"
            disabled={!nextId}
            onClick={() => nextId && onOpen(nextId)}
            icon={<DashboardIcon name="chevron-right-solid" size={14} />}
          />
          {stage ? <StageChip stage={stage} /> : null}
          <div className="ml-auto flex items-center gap-[2px]">
            {/* Drawn with no flow behind them yet. Their tooltips are the design's copy. */}
            <IconButton
              variant="tertiary"
              size="md"
              aria-label="Mail"
              title="Mail"
              icon={<DashboardIcon name="envelope-solid" size={14} />}
            />
            <IconButton
              variant="tertiary"
              size="md"
              aria-label="Schedule event"
              title="Schedule event"
              icon={<DashboardIcon name="calendar-days-solid" size={14} />}
            />
            <IconButton
              variant="tertiary"
              size="md"
              aria-label="Add comment"
              title="Add comment"
              icon={<DashboardIcon name="chat-bubble-oval-left-solid" size={14} />}
            />
            <IconButton
              variant="tertiary"
              size="md"
              aria-label="Download CV"
              title="Download CV"
              icon={<DashboardIcon name="arrow-down-tray-outline" size={14} />}
            />
            <IconButton
              variant="tertiary"
              size="md"
              aria-label="Star"
              title="Star"
              icon={<DashboardIcon name="star-outline" size={14} />}
            />
            <IconButton
              variant="tertiary"
              size="md"
              aria-label="More actions"
              title="Add new stage"
              icon={<DashboardIcon name="ellipsis-horizontal-solid" size={14} />}
            />
          </div>
          {/* A rejected candidate cannot be re-engaged: the server's status is final (18, 19). */}
          {status === 'rejected' ? (
            <Button
              variant="secondary"
              accent="default"
              size="sm"
              disabled
              iconSuffix={<DashboardIcon name="chev-down-solid" size={14} />}
            >
              Re-engage
            </Button>
          ) : (
            <>
              <DisqualifyPopover
                open={disqualifyOpen}
                onOpenChange={setDisqualifyOpen}
                disabled={!target || !canDisqualify || !canDecide}
                sendEmails={sendEmails}
                pending={pending}
                onConfirm={(note) => {
                  setDisqualifyOpen(false)
                  if (target) onDisqualify(target, note)
                }}
              />
              <MoveToMenu
                open={moveOpen}
                onOpenChange={setMoveOpen}
                options={moveOptions}
                onPick={(picked) => {
                  if (target) onPick(target, picked)
                }}
                disabled={!target || pending || !canDecide}
              />
            </>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-col gap-[12px] px-[24px] pt-[20px]">
            <div className="flex flex-col gap-[14px]">
              <Avatar size={32} type="initials" colour="green" text={getInitials(name || '?')} />
              <div className="flex flex-col gap-[8px]">
                <div className="flex items-center gap-[6px]">
                  <h2 className="truncate text-body-xl leading-24 font-semibold text-text-primary">
                    {name}
                  </h2>
                  {/* Drawn with no follow behind it yet. */}
                  <span className="flex shrink-0 items-center gap-[2px] px-[6px] py-[6px] text-body-s leading-19_5 text-text-secondary">
                    <DashboardIcon name="user-plus-solid" size={11} />
                    Follow
                  </span>
                </div>
                {detail ? (
                  <p className="flex items-center gap-[4px] text-caption-m leading-17_6 text-text-secondary">
                    <DashboardIcon name="clock-outline" size={10} />
                    Applied {formatDateTime(detail.submittedAt)}
                  </p>
                ) : null}
                {role.role || role.company ? (
                  <p className="flex items-center gap-[4px] text-caption-m leading-17_6 text-text-secondary">
                    <DashboardIcon name="briefcase-outline" size={10} />
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
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  )
}

export { CandidatePanel }
export type { CandidatePanelProps }
