'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { JOB_STATUS_META } from '@/components/jobs/job-status'

import type { JobStatus } from '@/lib/jobs/types'

/**
 * The floating bar that appears once jobs are selected. Figma:
 * Table/SelectionToolbar (7075:115583) and its menus,
 * Table/.Subcomponents/SelectionToolbar-items (7075:115385).
 *
 * The bar is dark in both themes — it is bound to fixed greys in the design,
 * not to the surface tokens — so the same greys are used directly here.
 */

interface SelectionToolbarProps {
  count: number
  /** Statuses the selection can move to; depends on what is selected. */
  statusOptions: JobStatus[]
  /** Only offered when the selection includes an open job. */
  showClosingDate: boolean
  onChangeStatus: (status: JobStatus) => void
  onChangeClosingDate?: () => void
  onAssign?: () => void
  onDuplicate?: () => void
  onCopyLinks?: () => void
  onExport?: () => void
  onDelete?: () => void
  onClear: () => void
}

type OpenMenu = 'status' | 'more' | null

const surface =
  'rounded-xl-14 bg-dark-grey-3 outline-[0.5px] -outline-offset-[0.5px] outline-white/10 shadow-[0_8px_16px_#00000014,0_0_4px_#0000000a]'
const control =
  'inline-flex h-[24px] shrink-0 cursor-pointer items-center justify-center rounded-sm-7 text-light-grey-7 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-white/40'

function MenuItem({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className="flex h-[24px] w-full cursor-pointer items-center gap-[6px] rounded-sm-8 pr-[8px] pl-[6px] text-left text-light-grey-7 transition-colors hover:bg-white/8 hover:text-white focus-visible:bg-white/8 focus-visible:outline-none"
      >
        <DashboardIcon name={icon} size={13} />
        <span className="truncate text-body-s leading-19_5">{label}</span>
      </button>
    </li>
  )
}

function Menu({
  label,
  className,
  children,
}: {
  label: string
  className: string
  children: ReactNode
}) {
  return (
    <ul
      role="menu"
      aria-label={label}
      className={`absolute bottom-full flex w-[147px] flex-col gap-[2px] p-[5px] ${surface} ${className}`}
    >
      {children}
    </ul>
  )
}

function SelectionToolbar({
  count,
  statusOptions,
  showClosingDate,
  onChangeStatus,
  onChangeClosingDate,
  onAssign,
  onDuplicate,
  onCopyLinks,
  onExport,
  onDelete,
  onClear,
}: SelectionToolbarProps) {
  const [menu, setMenu] = useState<OpenMenu>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // Escape closes an open menu first, and only then drops the selection.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      if (menu) setMenu(null)
      else onClear()
    }
    function handlePointerDown(event: PointerEvent) {
      if (menu && !rootRef.current?.contains(event.target as Node)) setMenu(null)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [menu, onClear])

  const run = (action?: () => void) => () => {
    setMenu(null)
    action?.()
  }

  return (
    <div
      ref={rootRef}
      role="toolbar"
      aria-label="Selected jobs"
      className={`absolute bottom-[24px] left-1/2 z-20 flex h-[35px] -translate-x-1/2 items-center gap-[6px] px-[7px] ${surface}`}
    >
      <span
        aria-live="polite"
        className="flex h-[16px] items-center border-r border-white/6 px-[10px] text-caption-m leading-17_6 font-medium whitespace-nowrap text-light-grey-7"
      >
        {count} selected
      </span>

      <div className="relative flex">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menu === 'status'}
          onClick={() => setMenu(menu === 'status' ? null : 'status')}
          className={`${control} gap-[4px] px-[8px]`}
        >
          <DashboardIcon name="viewfinder-circle-solid" size={14} />
          <span className="text-body-s leading-19_5 font-medium">Change status</span>
          <DashboardIcon
            name={menu === 'status' ? 'chevron-up-solid' : 'chevron-down-solid'}
            size={14}
          />
        </button>
        {menu === 'status' ? (
          <Menu label="Change status" className="left-0 mb-[5.5px]">
            {statusOptions.map((status) => (
              <MenuItem
                key={status}
                icon={JOB_STATUS_META[status].icon}
                label={JOB_STATUS_META[status].shortLabel}
                onClick={run(() => onChangeStatus(status))}
              />
            ))}
          </Menu>
        ) : null}
      </div>

      {showClosingDate ? (
        <button
          type="button"
          onClick={run(onChangeClosingDate)}
          className={`${control} gap-[4px] px-[8px]`}
        >
          <DashboardIcon name="calendar-solid" size={14} />
          <span className="text-body-s leading-19_5 font-medium">Change closing date</span>
        </button>
      ) : null}

      {/* Not a positioning context: its menu hangs off the bar's right edge. */}
      <div className="flex">
        <button
          type="button"
          aria-label="More actions"
          aria-haspopup="menu"
          aria-expanded={menu === 'more'}
          onClick={() => setMenu(menu === 'more' ? null : 'more')}
          className={`${control} w-[24px]`}
        >
          <DashboardIcon name="ellipsis-horizontal-solid" size={14} />
        </button>
        {menu === 'more' ? (
          <Menu label="More actions" className="right-0">
            <MenuItem icon="user-circle-solid" label="Assign to…" onClick={run(onAssign)} />
            <MenuItem
              icon="document-duplicate-solid"
              label="Duplicate"
              onClick={run(onDuplicate)}
            />
            <MenuItem icon="link-solid" label="Copy links" onClick={run(onCopyLinks)} />
            <MenuItem icon="arrow-up-tray-solid" label="Export selection" onClick={run(onExport)} />
          </Menu>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Delete selected jobs"
        onClick={run(onDelete)}
        className={`${control} w-[24px] text-red-7! hover:text-red-7!`}
      >
        <DashboardIcon name="trash-solid" size={14} />
      </button>
      <button
        type="button"
        aria-label="Clear selection"
        onClick={onClear}
        className={`${control} w-[24px]`}
      >
        <DashboardIcon name="x-mark-solid" size={14} />
      </button>
    </div>
  )
}

export { SelectionToolbar, control as toolbarControl, surface as toolbarSurface }
export type { SelectionToolbarProps }
