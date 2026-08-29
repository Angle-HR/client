'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import { IconButton } from '../button/icon-button'
import { SidebarIcon } from '../icons'
import { ListItemDefault } from '../list/list-item-default'
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
      className={`relative flex w-[204px] items-center gap-[12px] ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className="min-w-0 flex-1 cursor-pointer rounded-sm-8 p-[7px] text-left transition-colors hover:bg-bg-transparent-light"
      >
        <CompanySelectorItem name={currentCompany.name} avatarUrl={currentCompany.avatarUrl} />
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
                      <CompanySelectorItem name={company.name} avatarUrl={company.avatarUrl} />
                    }
                    onClick={() => onSwitchCompany?.(company.id)}
                  />
                ))}
                <li>
                  <Divider padded />
                </li>
              </>
            )}
            {menuItems.map((item) => (
              <ListItemDefault
                key={item.key}
                mainText={item.label}
                icon={item.icon}
                withIcon={!!item.icon}
                state={submenuKey === item.key ? 'hover' : 'rest'}
                selected={submenuKey === item.key}
                onClick={() => {
                  if (item.submenu) {
                    setSubmenuKey((k) => (k === item.key ? null : item.key))
                    return
                  }
                  item.onClick?.()
                  setOpen(false)
                }}
                className="w-full!"
              />
            ))}
          </ul>

          {/* Anchored to the whole panel rather than the specific triggering
              row — Figma anchors it per-row, but that needs per-item DOM
              measurement for a small, bounded win. */}
          {activeSubmenu && (
            <Slots
              background="light"
              padding="tight"
              shadow="medium"
              className="absolute top-0 left-full z-20 ml-[4px] w-[202px]"
            >
              <ul role="listbox" className="flex w-full flex-col gap-[2px]">
                {activeSubmenu.map((sub) => (
                  <ListItemDefault
                    key={sub.key}
                    mainText={sub.label}
                    icon={sub.icon}
                    withIcon={!!sub.icon}
                    state={sub.selected ? 'hover' : 'rest'}
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
