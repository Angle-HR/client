'use client'

import { type ReactNode } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Floating, clampLeft } from '@/components/jobs/floating'
import { JOB_STATUS_META } from '@/components/jobs/job-status'
import { statusTargets } from '@/lib/jobs/actions'

import type { AnchorRect, FloatingProps } from '@/components/jobs/floating'
import type { Job, JobStatus } from '@/lib/jobs/types'

/**
 * Popover menus for a single job row and for a board column. Figma: the row
 * menu is the "Inputs/Floating Input" in "Each job more action menu"
 * (7964:213402); the column menu is Table/.Subcomponents/more-button
 * (7122:155007).
 *
 * Both render through `Floating`, since their triggers live inside scroll
 * containers that would otherwise clip them.
 */

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
  place: FloatingProps['place']
  className: string
  onClose: () => void
  children: ReactNode
}

function FloatingMenu({ label, anchor, place, className, onClose, children }: FloatingMenuProps) {
  return (
    <Floating anchor={anchor} place={place} className={className} onClose={onClose}>
      <ul role="menu" aria-label={label} className="contents">
        {children}
      </ul>
    </Floating>
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
        left: clampLeft((anchor.left + anchor.right) / 2 - width / 2, width),
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

export { ColumnMenu, JobRowMenu, MenuRow }
export type { JobRowAction }
