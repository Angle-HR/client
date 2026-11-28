'use client'

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { StageAvatar } from '@/components/applications/stage-chip'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { moveOptionsFor } from '@/lib/applications/stages'

import type { Applicant } from '@/lib/applications/api'
import type { PipelineStage } from '@/lib/applications/pipeline'

interface RowMenuItemProps {
  icon?: ReactNode
  label: string
  disabled?: boolean
  danger?: boolean
  /** A chevron after the label, for an item that opens a submenu. */
  suffix?: string
  onClick?: () => void
}

/** One line of the row menu (01, 02). */
function RowMenuItem({
  icon,
  label,
  disabled = false,
  danger = false,
  suffix,
  onClick,
}: RowMenuItemProps): ReactElement {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        disabled={disabled}
        onClick={onClick}
        className={`flex h-[24px] w-full items-center gap-[6px] rounded-sm-7 px-[6px] text-left text-body-s leading-19_5 transition-colors hover:bg-bg-transparent-light disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent ${danger ? 'text-text-error' : 'text-text-secondary'}`}
      >
        {icon ? <span className="inline-flex shrink-0">{icon}</span> : null}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {suffix ? (
          <span className="inline-flex shrink-0 text-text-tertiary">
            <DashboardIcon name={suffix} size={14} />
          </span>
        ) : null}
      </button>
    </li>
  )
}

interface CandidateRowMenuProps {
  row: Applicant
  stages: ReadonlyArray<PipelineStage>
  onView: () => void
  /** Picks a stage from the submenu. Disqualified opens the dialog; the rest move at once. */
  onPick: (stage: PipelineStage) => void
  onAddNote: () => void
  onCompose: () => void
  onSchedule: () => void
  onToggleFollow: () => void
  onDownloadCv: () => void
  /** Whether the signed-in person may move or disqualify this job's applications. */
  canDecide: boolean
}

/**
 * The "…" menu on a table row: View profile, the Move to stage submenu,
 * Disqualify, and Download CV. The rest are drawn but have no endpoint yet.
 * It is portalled to the body, so the table's scroll box does not clip it.
 */
function CandidateRowMenu({
  row,
  stages,
  onView,
  onPick,
  onAddNote,
  onCompose,
  onSchedule,
  onToggleFollow,
  onDownloadCv,
  canDecide,
}: CandidateRowMenuProps): ReactElement {
  const [open, setOpen] = useState(false)
  const [submenu, setSubmenu] = useState(false)
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const name = row.name || row.email

  // A press outside, Escape or a scroll closes the menu.
  useEffect(() => {
    if (!open) return
    function close(): void {
      setOpen(false)
      setSubmenu(false)
    }
    function handlePress(event: MouseEvent): void {
      const target = event.target as Node
      if (buttonRef.current?.contains(target) || menuRef.current?.contains(target)) return
      close()
    }
    function handleKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('mousedown', handlePress)
    document.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('mousedown', handlePress)
      document.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])

  function toggle(): void {
    if (open) {
      setOpen(false)
      setSubmenu(false)
      return
    }
    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) setPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    setOpen(true)
  }

  function choose(action: () => void): void {
    setOpen(false)
    setSubmenu(false)
    action()
  }

  // The list does not say who opened a flagged application, so Disqualify is offered; the
  // server refuses it for anyone but the last opener, and that refusal shows as an error.
  // Move to and Disqualify need a decider on the job; the design draws them disabled otherwise (01).
  const options = moveOptionsFor(stages, { status: row.status, stageId: row.stageId }, canDecide)
  const disqualify = options.find((option) => option.stage.kind === 'disqualified')

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More actions for ${name}`}
        onClick={toggle}
        className="inline-flex items-center justify-center rounded-xs-4 p-[6px] text-text-secondary transition-colors hover:bg-bg-transparent-light hover:text-text-primary"
      >
        <DashboardIcon name="ellipsis-horizontal-solid" size={11} />
      </button>
      {open && typeof document !== 'undefined'
        ? createPortal(
            <ul
              ref={menuRef}
              role="menu"
              // The menu sits in the body, but a click on it must not open the row.
              onClick={(event) => event.stopPropagation()}
              style={{ top: position.top, right: position.right }}
              className="fixed z-50 flex w-[190px] flex-col rounded-lg-10 bg-bg-primary px-[1px] pt-[1px] pb-[5px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
            >
              {submenu ? (
                <>
                  <li role="none" className="flex h-[29px] items-center gap-[2px] px-[2px]">
                    <button
                      type="button"
                      aria-label="Back"
                      onClick={() => setSubmenu(false)}
                      className="inline-flex h-[24px] w-[24px] items-center justify-center rounded-sm-7 text-text-secondary hover:bg-bg-transparent-light"
                    >
                      <DashboardIcon name="chevron-left-solid" size={14} />
                    </button>
                    <span className="text-body-xs leading-19_2 font-medium text-text-secondary">
                      Move to stage
                    </span>
                  </li>
                  {options.map((option) => (
                    <RowMenuItem
                      key={option.stage.id}
                      label={option.stage.name}
                      disabled={!option.enabled}
                      icon={<StageAvatar kind={option.stage.kind} menu />}
                      onClick={() => choose(() => onPick(option.stage))}
                    />
                  ))}
                </>
              ) : (
                <>
                  <RowMenuItem
                    label="View profile"
                    icon={<DashboardIcon name="eye-solid" size={13} />}
                    onClick={() => choose(onView)}
                  />
                  <RowMenuItem
                    label="Send email"
                    disabled={!canDecide}
                    onClick={() => choose(onCompose)}
                    icon={<DashboardIcon name="envelope-solid" size={13} />}
                  />
                  <RowMenuItem
                    label="Schedule interview"
                    disabled={!canDecide}
                    onClick={() => choose(onSchedule)}
                    icon={<DashboardIcon name="calendar-solid" size={13} />}
                  />
                  <RowMenuItem
                    label="Move to stage"
                    disabled={!canDecide}
                    icon={<DashboardIcon name="chevron-double-right-solid" size={13} />}
                    suffix="chev-right-solid"
                    onClick={() => setSubmenu(true)}
                  />
                  <RowMenuItem
                    label="Disqualify…"
                    disabled={!disqualify?.enabled}
                    icon={<DashboardIcon name="minus-circle-solid" size={13} />}
                    onClick={() => disqualify && choose(() => onPick(disqualify.stage))}
                  />
                  <RowMenuItem
                    label="Add note"
                    onClick={() => choose(onAddNote)}
                    icon={<DashboardIcon name="pencil-square-solid" size={13} />}
                  />
                  <RowMenuItem
                    label={row.followed ? 'Unfollow' : 'Follow'}
                    onClick={() => choose(onToggleFollow)}
                    icon={
                      <DashboardIcon
                        name={row.followed ? 'user-minus-solid' : 'user-plus-solid'}
                        size={13}
                      />
                    }
                  />
                  <RowMenuItem
                    label="Download CV"
                    disabled={!row.hasFiles}
                    icon={<DashboardIcon name="arrow-down-tray-solid" size={13} />}
                    onClick={() => choose(onDownloadCv)}
                  />
                  <li
                    role="separator"
                    className="mx-[5px] my-[4px] h-px bg-border-transparent-light"
                  />
                  <RowMenuItem
                    label="Delete candidate"
                    danger
                    disabled
                    icon={<DashboardIcon name="trash-solid" size={14} />}
                  />
                </>
              )}
            </ul>,
            document.body,
          )
        : null}
    </>
  )
}

export { CandidateRowMenu }
export type { CandidateRowMenuProps }
