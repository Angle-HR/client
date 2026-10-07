'use client'

import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from 'react'

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
        className={`cursor-pointer rounded-sm-8 p-[7px] text-left transition-colors hover:bg-bg-transparent-light ${
          collapsed ? 'shrink-0' : 'min-w-0 flex-1'
        }`}
      >
        <CompanySelectorItem
          name={currentCompany.name}
          avatarUrl={currentCompany.avatarUrl}
          hideName={collapsed}
        />
      </button>

      <IconButton
        variant="tertiary"
        size="sm"
        icon={onIconButtonIcon ?? <SidebarIcon />}
        aria-label={iconButtonLabel}
        onClick={onIconButtonClick}
      />

      {open && (
        <Slots
          background="light"
          padding="tight"
          shadow="medium"
          scrollable
          className="absolute top-[32px] left-0 z-10 max-h-[240px] w-[246px]"
        >
          <ul id={listId} role="listbox" className="flex w-full flex-col gap-[2px]">
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
                <li>
                  <Divider padded />
                </li>
              </>
            )}
            {menuItems.map((item) => {
              const isActive = submenuKey === item.key
              const handleClick = () => {
                if (item.submenu) {
                  setSubmenuKey((k) => (k === item.key ? null : item.key))
                  return
                }
                item.onClick?.()
                setOpen(false)
              }
              return (
                <Fragment key={item.key}>
                  {item.dividerBefore && (
                    <li role="presentation">
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
          child. Anchored to the whole panel's top rather than the specific
          triggering row — Figma anchors it per-row, but that needs per-item
          DOM measurement for a small, bounded win. */}
      {open && activeSubmenu && (
        <Slots
          background="light"
          padding="tight"
          shadow="medium"
          className="absolute top-[32px] left-[250px] z-20 w-[202px]"
        >
          <ul role="listbox" className="flex w-full flex-col gap-[2px]">
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
