'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { JOB_STATUS_META } from '@/components/jobs/job-status'
import { statusTargets } from '@/lib/jobs/actions'

import type { Job, JobStatus } from '@/lib/jobs/types'

/**
 * Popover menus for a single job row and for a board column. Figma: the row
 * menu is the "Inputs/Floating Input" in "Each job more action menu"
 * (7964:213402); the column menu is Table/.Subcomponents/more-button
 * (7122:155007).
 *
 * Both are fixed to the viewport and portalled out, because their triggers
 * live inside scroll containers that would otherwise clip them.
 */

interface AnchorRect {
  top: number
  left: number
  right: number
  bottom: number
}

interface MenuRowProps {
  icon: string
  iconSize?: number
  label: string
  danger?: boolean
  onClick: () => void
}

function MenuRow({ icon, iconSize = 13, label, danger = false, onClick }: MenuRowProps) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className={`group flex h-[24px] w-full cursor-pointer items-center gap-[6px] rounded-sm-8 px-[6px] text-left transition-colors focus-visible:outline-none ${danger ? 'hover:bg-bg-danger focus-visible:bg-bg-danger' : 'hover:bg-bg-transparent-light focus-visible:bg-bg-transparent-light'}`}
      >
        <span className={`inline-flex ${danger ? 'text-text-error' : 'text-text-tertiary'}`}>
          <DashboardIcon name={icon} size={iconSize} />
        </span>
        <span
          className={`truncate text-body-s leading-19_5 ${danger ? 'text-text-error' : 'text-text-secondary group-hover:text-text-primary group-focus-visible:text-text-primary'}`}
        >
          {label}
        </span>
      </button>
    </li>
  )
}

interface FloatingMenuProps {
  label: string
  anchor: AnchorRect
  /** Given the menu's measured size, where its top-left corner goes. */
  place: (size: { width: number; height: number }) => { top: number; left: number }
  className: string
  onClose: () => void
  children: ReactNode
}

function FloatingMenu({ label, anchor, place, className, onClose, children }: FloatingMenuProps) {
  const ref = useRef<HTMLUListElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)

  // Measured before paint so the menu never flashes in the wrong place.
  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return
    setPosition(place({ width: element.offsetWidth, height: element.offsetHeight }))
    element.querySelector<HTMLElement>('[role="menuitem"]')?.focus({ preventScroll: true })
    // `place` is recreated every render; the anchor is what actually changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor.top, anchor.left])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
      const items = [...(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
      const index = items.indexOf(document.activeElement as HTMLElement)
      const next = event.key === 'ArrowDown' ? index + 1 : index - 1
      event.preventDefault()
      items[(next + items.length) % items.length]?.focus()
    }
    function handlePointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose()
    }
    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  return createPortal(
    <ul
      ref={ref}
      role="menu"
      aria-label={label}
      style={position ?? { top: 0, left: 0, visibility: 'hidden' }}
      className={`fixed z-50 flex flex-col bg-bg-secondary outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium ${className}`}
    >
      {children}
    </ul>,
    document.body,
  )
}

type JobRowAction =
  | 'edit'
  | 'closing-date'
  | 'assign'
  | 'duplicate'
  | 'copy-link'
  | 'export'
  | 'delete'

interface JobRowMenuProps {
  job: Job
  anchor: AnchorRect
  onAction: (action: JobRowAction) => void
  onChangeStatus: (status: JobStatus) => void
  onClose: () => void
}

function JobRowMenu({ job, anchor, onAction, onChangeStatus, onClose }: JobRowMenuProps) {
  const act = (action: JobRowAction) => () => {
    onClose()
    onAction(action)
  }

  return (
    <FloatingMenu
      label={`Actions for ${job.title}`}
      anchor={anchor}
      onClose={onClose}
      // Opens to the left of the trigger, level with it, and slides up when it
      // would run off the bottom of the window.
      place={({ width, height }) => ({
        left: Math.max(8, anchor.left - width - 3),
        top: Math.max(8, Math.min(anchor.top, window.innerHeight - height - 6)),
      })}
      className="w-[190px] gap-[2px] rounded-t-lg-10 rounded-b-lg-12 p-[5px] shadow-md"
    >
      <MenuRow icon="pencil-square-solid" label="Edit Job" onClick={act('edit')} />
      {/* Only a published listing has a closing date to change. */}
      {job.status === 'open' ? (
        <MenuRow icon="calendar-solid" label="Change closing date" onClick={act('closing-date')} />
      ) : null}
      <MenuRow icon="user-circle-solid" label="Assign to…" onClick={act('assign')} />
      <MenuRow icon="document-duplicate-solid" label="Duplicate" onClick={act('duplicate')} />
      <MenuRow icon="link-solid" label="Copy link" onClick={act('copy-link')} />
      <MenuRow icon="arrow-up-tray-solid" label="Export" onClick={act('export')} />

      <li
        role="presentation"
        className="flex h-[21px] items-center px-[4px] pt-[5px] text-caption-m leading-none font-medium text-text-tertiary"
      >
        Change status
      </li>
      {/* The list depends on the job's current status. */}
      {statusTargets([job]).map((status) => (
        <MenuRow
          key={status}
          icon={JOB_STATUS_META[status].icon}
          label={JOB_STATUS_META[status].shortLabel}
          onClick={() => {
            onClose()
            onChangeStatus(status)
          }}
        />
      ))}

      <li role="presentation" className="h-[2px]" />
      <MenuRow icon="trash-solid" iconSize={14} label="Delete" danger onClick={act('delete')} />
    </FloatingMenu>
  )
}

interface ColumnMenuProps {
  label: string
  anchor: AnchorRect
  onSelectAll: () => void
  onExport: () => void
  onClose: () => void
}

function ColumnMenu({ label, anchor, onSelectAll, onExport, onClose }: ColumnMenuProps) {
  return (
    <FloatingMenu
      label={label}
      anchor={anchor}
      onClose={onClose}
      // Centred under the trigger, 1px below it, kept inside the window.
      place={({ width }) => ({
        top: anchor.bottom + 1,
        left: Math.max(
          8,
          Math.min((anchor.left + anchor.right) / 2 - width / 2, window.innerWidth - width - 8),
        ),
      })}
      className="w-[162px] rounded-lg-10 p-[4px] shadow-slots-xsmall"
    >
      <MenuRow
        icon="double-check-solid"
        label="Select all in column"
        onClick={() => {
          onClose()
          onSelectAll()
        }}
      />
      <MenuRow
        icon="arrow-up-tray-solid"
        label="Export selection"
        onClick={() => {
          onClose()
          onExport()
        }}
      />
    </FloatingMenu>
  )
}

export { ColumnMenu, JobRowMenu }
export type { AnchorRect, JobRowAction }
