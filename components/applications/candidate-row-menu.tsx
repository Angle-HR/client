'use client'

import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { STAGE_GLYPH } from '@/components/applications/stage-chip'
import { DashboardIcon } from '@/components/dashboard/nav-config'
import { moveOptionsFor, type DesignStage } from '@/lib/applications/stages'

import type { Applicant } from '@/lib/applications/api'

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
        className={`flex w-full items-center gap-[8px] rounded-sm-7 px-[8px] py-[6px] text-left text-body-xs leading-19_2 transition-colors hover:bg-bg-transparent-light disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent ${danger ? 'text-text-error' : 'text-text-primary'}`}
      >
        {icon ? <span className="inline-flex shrink-0 text-text-tertiary">{icon}</span> : null}
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {suffix ? (
          <span className="inline-flex text-text-tertiary">
            <DashboardIcon name={suffix} size={9} />
          </span>
        ) : null}
      </button>
    </li>
  )
}

interface CandidateRowMenuProps {
  row: Applicant
  onView: () => void
  /** Picks a stage from the submenu. Disqualified opens the dialog; Hired moves at once. */
  onPick: (stage: DesignStage) => void
  onDownloadCv: () => void
}

/**
 * The "…" menu on a table row (01, 02): View profile, the Move to stage submenu,
 * Disqualify, and Download CV. The rest are drawn but have no endpoint yet.
 * It is portalled to the body, so the table's scroll box does not clip it.
 */
function CandidateRowMenu({
  row,
  onView,
  onPick,
  onDownloadCv,
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
  const options = moveOptionsFor(row.status, true)

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
              className="fixed z-50 flex w-[200px] flex-col gap-[2px] rounded-lg-10 bg-bg-primary p-[4px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
            >
              {submenu ? (
                <>
                  <li role="none" className="flex items-center gap-[4px] px-[4px] pb-[4px]">
                    <button
                      type="button"
                      aria-label="Back"
                      onClick={() => setSubmenu(false)}
                      className="inline-flex rounded-xs-4 p-[4px] text-text-secondary hover:bg-bg-transparent-light"
                    >
                      <DashboardIcon name="arrow-left-solid" size={10} />
                    </button>
                    <span className="text-body-xs leading-19_2 font-semibold text-text-primary">
                      Move to stage
                    </span>
                  </li>
                  {options.map((option) => (
                    <RowMenuItem
                      key={option.stage}
                      label={option.label}
                      disabled={!option.enabled}
                      icon={
                        <span className={`inline-flex ${STAGE_GLYPH[option.stage].iconClass}`}>
                          <DashboardIcon name={STAGE_GLYPH[option.stage].icon} size={11} />
                        </span>
                      }
                      onClick={() => choose(() => onPick(option.stage))}
                    />
                  ))}
                  {/* No server stages to add, so this is drawn only. */}
                  <RowMenuItem
                    label="+ Add new stage"
                    disabled
                    icon={<DashboardIcon name="plus-solid" size={10} />}
                  />
                </>
              ) : (
                <>
                  <RowMenuItem
                    label="View profile"
                    icon={<DashboardIcon name="user-solid" size={12} />}
                    onClick={() => choose(onView)}
                  />
                  <RowMenuItem
                    label="Send email"
                    disabled
                    icon={<DashboardIcon name="envelope-solid" size={12} />}
                  />
                  <RowMenuItem
                    label="Schedule interview"
                    disabled
                    icon={<DashboardIcon name="calendar-solid" size={12} />}
                  />
                  <RowMenuItem
                    label="Move to stage"
                    suffix="chev-right-solid"
                    onClick={() => setSubmenu(true)}
                  />
                  <RowMenuItem
                    label="Disqualify…"
                    disabled={!options.find((option) => option.stage === 'disqualified')?.enabled}
                    icon={<DashboardIcon name="no-symbol-solid" size={12} />}
                    onClick={() => choose(() => onPick('disqualified'))}
                  />
                  <RowMenuItem
                    label="Add note"
                    disabled
                    icon={<DashboardIcon name="chat-bubble-left-ellipsis-solid" size={12} />}
                  />
                  <RowMenuItem
                    label="Follow"
                    disabled
                    icon={<DashboardIcon name="star-outline" size={12} />}
                  />
                  <RowMenuItem
                    label="Download CV"
                    disabled={!row.hasFiles}
                    icon={<DashboardIcon name="arrow-down-tray-solid" size={12} />}
                    onClick={() => choose(onDownloadCv)}
                  />
                  <li
                    role="separator"
                    className="-mx-[4px] my-[2px] h-px bg-border-transparent-light"
                  />
                  <RowMenuItem
                    label="Delete candidate"
                    danger
                    disabled
                    icon={<DashboardIcon name="trash-solid" size={12} />}
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
