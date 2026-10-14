'use client'

import { type ReactNode } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Floating, clampLeft } from '@/components/jobs/floating'

import type { AnchorRect } from '@/components/jobs/floating'

/**
 * The popover behind a person's access button on the Permissions step: opens
 * under its trigger, right-aligned to it. Figma: the access menus in 9270:377592,
 * 9270:377732 and the status sheet 9270:378362. Built on the jobs `Floating`
 * popover so it portals out of the scrolling page.
 */

interface AccessMenuProps {
  label: string
  anchor: AnchorRect
  onClose: () => void
  children: ReactNode
}

function AccessMenu({ label, anchor, onClose, children }: AccessMenuProps) {
  return (
    <Floating
      anchor={anchor}
      place={({ width }) => ({
        top: anchor.bottom + 4,
        left: clampLeft(anchor.right - width, width),
      })}
      className="w-[170px] gap-[2px] rounded-lg-10 p-[5px] shadow-md"
      onClose={onClose}
    >
      <ul role="menu" aria-label={label} className="contents">
        {children}
      </ul>
    </Floating>
  )
}

interface AccessMenuItemProps {
  label: string
  /** Set on a level row: the row becomes a checkable item, ticked when it is the current level. */
  checked?: boolean
  danger?: boolean
  onSelect: () => void
}

function AccessMenuItem({ label, checked, danger = false, onSelect }: AccessMenuItemProps) {
  const checkable = checked !== undefined
  return (
    <li role="none">
      <button
        type="button"
        role={checkable ? 'menuitemcheckbox' : 'menuitem'}
        aria-checked={checkable ? checked : undefined}
        onClick={onSelect}
        className={`group flex h-[24px] w-full cursor-pointer items-center justify-between gap-[6px] rounded-sm-8 px-[6px] text-left transition-colors focus-visible:outline-none ${danger ? 'hover:bg-bg-danger focus-visible:bg-bg-danger' : 'hover:bg-bg-transparent-light focus-visible:bg-bg-transparent-light'}`}
      >
        <span
          className={`truncate text-body-s leading-19_5 ${danger ? 'text-text-error' : 'text-text-secondary group-hover:text-text-primary group-focus-visible:text-text-primary'}`}
        >
          {label}
        </span>
        {checked ? (
          <span className="inline-flex text-text-primary">
            <DashboardIcon name="check-solid" size={12} />
          </span>
        ) : null}
      </button>
    </li>
  )
}

/** The small grey heading inside a menu, such as "Actions". */
function AccessMenuHeading({ label }: { label: string }) {
  return (
    <li
      role="presentation"
      className="px-[6px] pt-[6px] pb-[2px] text-caption-s text-text-tertiary"
    >
      {label}
    </li>
  )
}

/** The hairline between a menu's levels and its actions. */
function AccessMenuSeparator() {
  return <li role="separator" className="my-[4px] h-[0.5px] bg-border-transparent-medium" />
}

export { AccessMenu, AccessMenuHeading, AccessMenuItem, AccessMenuSeparator }
