'use client'

import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from 'react'

import { Avatar } from '../avatar/avatar'
import { IconButton } from '../button/icon-button'
import { ChevronRight, SidebarIcon } from '../icons'
import { ListItemDefault } from '../list/list-item-default'
import { ListItemSelected } from '../list/list-item-selected'
import { ListItemWithIcon } from '../list/list-item-with-icon'
import { Divider } from '../notification/divider'
import { Slots } from '../slots/slots'

import { CompanySelectorItem } from './company-selector-item'

interface CompanySelectorSubmenuItem {
  key: string
  label: string
  icon?: ReactNode
  selected?: boolean
  onClick?: () => void
}

interface CompanySelectorMenuItem {
  key: string
  label: string
  icon?: ReactNode
  onClick?: () => void
  submenu?: CompanySelectorSubmenuItem[]
  /** Starts a new group — the Figma menu splits its rows with dividers. */
  dividerBefore?: boolean
}

interface CompanySelectorCompany {
  id: string
  name: string
  avatarUrl?: string
}

interface CompanySelectorProps {
  currentCompany: { name: string; avatarUrl?: string }
  /**
   * The menu shown in Figma's own mockup (Account settings, Workspace
   * settings, Theme, Sign out, etc.) — not documented in Outline, which
   * only describes company-switching. Left empty by default rather than
   * baking in assumed copy; pass what the consuming screen needs.
   */
  menuItems?: CompanySelectorMenuItem[]
  /** Outline's documented purpose — switching workspace. Opt-in since
   * Figma's example frame doesn't show this list at all. */
  companies?: CompanySelectorCompany[]
  onSwitchCompany?: (companyId: string) => void
  open?: boolean
  onToggle?: (open: boolean) => void
  /**
   * Rail mode: the workspace name and chevron drop away, leaving the avatar
   * stacked above the toggle — Figma's `openSidebar=false` variant.
   */
  collapsed?: boolean
  iconButtonLabel?: string
  onIconButtonIcon?: ReactNode
  onIconButtonClick?: () => void
  className?: string
}

function CompanySelector({
  currentCompany,
  menuItems = [],
  companies,
  onSwitchCompany,
  open: controlledOpen,
  onToggle,
  collapsed = false,
  iconButtonLabel = 'Open sidebar settings',
  onIconButtonIcon,
  onIconButtonClick,
  className = '',
}: CompanySelectorProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const [submenuKey, setSubmenuKey] = useState<string | null>(null)
  const [submenuTop, setSubmenuTop] = useState(32)
  const listId = useId()

  function setOpen(next: boolean) {
    if (controlledOpen === undefined) setInternalOpen(next)
    onToggle?.(next)
    if (!next) setSubmenuKey(null)
  }

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const activeSubmenu = menuItems.find((item) => item.key === submenuKey)?.submenu

  return (
    <div
      ref={wrapperRef}
      className={`relative flex gap-[12px] ${
        collapsed ? 'flex-col items-start justify-center' : 'w-full items-center'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={collapsed ? currentCompany.name : undefined}
        className={`flex h-[28px] cursor-pointer items-center rounded-sm-8 px-[8px] text-left transition-colors hover:bg-bg-transparent-light ${
          collapsed ? 'shrink-0' : 'min-w-0 flex-1'
        }`}
      >
        <CompanySelectorItem
          name={currentCompany.name}
          avatarUrl={currentCompany.avatarUrl}
          hideName={collapsed}
        />
      </button>

      {/* The toggle sits in its own 28px-tall box, inset 3px from the edge:
          right-aligned beside the name when open, under the avatar when
          collapsed. */}
      <span
        className={`flex h-[28px] shrink-0 items-center px-[3px] ${collapsed ? '' : 'justify-end'}`}
      >
        <IconButton
          variant="tertiary"
          size="sm"
          icon={onIconButtonIcon ?? <SidebarIcon />}
          aria-label={iconButtonLabel}
          onClick={onIconButtonClick}
        />
      </span>

      {open && (
        <Slots
          background="light"
          padding="tight"
          shadow="medium"
          scrollable
          className="absolute top-[32px] left-0 z-10 max-h-[240px] w-[246px] rounded-lg-12!"
        >
          <ul id={listId} role="listbox" className="flex w-full flex-col">
            {companies && companies.length > 0 && (
              <>
                {companies.map((company) => (
                  <ListItemDefault
                    key={company.id}
                    mainText={company.name}
                    withIcon={false}
                    leadingVisual={
                      <Avatar
                        size={14}
                        type={company.avatarUrl ? 'image-border' : 'initials'}
                        src={company.avatarUrl}
                        text={company.name[0]}
                        aria-hidden
                      />
                    }
                    onClick={() => onSwitchCompany?.(company.id)}
                  />
                ))}
                <li role="presentation" className="flex h-[4px] items-center">
                  <Divider padded />
                </li>
              </>
            )}
            {menuItems.map((item) => {
              const isActive = submenuKey === item.key
              const handleClick = (event: ReactMouseEvent<HTMLLIElement>) => {
                if (item.submenu) {
                  // The flyout hangs off the row that opened it, 3px above the
                  // row's top so its first item lines up with the row.
                  const wrapperTop = wrapperRef.current?.getBoundingClientRect().top ?? 0
                  setSubmenuTop(event.currentTarget.getBoundingClientRect().top - wrapperTop - 3)
                  setSubmenuKey((k) => (k === item.key ? null : item.key))
                  return
                }
                item.onClick?.()
                setOpen(false)
              }
              return (
                <Fragment key={item.key}>
                  {item.dividerBefore && (
                    <li role="presentation" className="flex h-[4px] items-center">
                      <Divider padded />
                    </li>
                  )}
                  {/* Rows that open a flyout are Figma's "List Item/with Icon",
                      carrying the trailing chevron. */}
                  {item.submenu ? (
                    <ListItemWithIcon
                      mainText={item.label}
                      icon={item.icon}
                      withIcon={!!item.icon}
                      trailingIcon={<ChevronRight className="size-[14px] text-text-tertiary" />}
                      state={isActive ? 'hover' : 'rest'}
                      onClick={handleClick}
                    />
                  ) : (
                    <ListItemDefault
                      mainText={item.label}
                      icon={item.icon}
                      withIcon={!!item.icon}
                      onClick={handleClick}
                      className="w-full!"
                    />
                  )}
                </Fragment>
              )
            })}
          </ul>
        </Slots>
      )}

      {/* A sibling of the main panel, not nested inside it — Slots clips its
          own content to its rounded corners (needed for the scroll-fade
          mechanism), which would invisibly clip a flyout rendered as its
          child. It overlaps the panel's right edge by 5px, as in the design. */}
      {open && activeSubmenu && (
        <Slots
          background="light"
          padding="tight"
          shadow="medium"
          className="absolute left-[241px] z-20 w-[202px] rounded-lg-12!"
          style={{ top: submenuTop }}
        >
          <ul role="listbox" className="flex w-full flex-col">
            {activeSubmenu.map((sub) => (
              <ListItemSelected
                key={sub.key}
                mainText={sub.label}
                icon={sub.icon}
                withIcon={!!sub.icon}
                selected={sub.selected}
                onClick={() => {
                  sub.onClick?.()
                  setOpen(false)
                }}
                className="w-full!"
              />
            ))}
          </ul>
        </Slots>
      )}
    </div>
  )
}

export { CompanySelector }
export type {
  CompanySelectorProps,
  CompanySelectorMenuItem,
  CompanySelectorSubmenuItem,
  CompanySelectorCompany,
}
