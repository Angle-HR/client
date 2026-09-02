'use client'

import { useId } from 'react'

import { SidebarItem, type SidebarItemProps } from './item'
import { SidebarTitle } from './title'

type SidebarItemData = SidebarItemProps

interface SidebarGroupItemProps {
  title: string
  items: SidebarItemData[]
  open?: boolean
  onToggle?: (open: boolean) => void
  className?: string
}

// grid-template-rows 0fr/1fr is the dependency-free way to transition to an
// intrinsic ("auto") height — no JS measurement needed, and it naturally
// handles content whose height isn't known ahead of time.
function SidebarGroupItem({
  title,
  items,
  open = true,
  onToggle,
  className = '',
}: SidebarGroupItemProps) {
  const listId = useId()

  return (
    <section className={`flex w-full flex-col items-start ${className}`} aria-label={title}>
      <SidebarTitle
        label={title}
        closed={!open}
        controls={listId}
        onToggle={onToggle ? () => onToggle(!open) : undefined}
      />
      <div
        id={listId}
        // Removed from the tab order while collapsed — visually hiding via
        // height alone would leave the items keyboard-reachable.
        inert={!open}
        className={`grid w-full transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <ul className="flex min-h-0 flex-col gap-[2px] overflow-hidden">
          {items.map((item, i) => (
            <li key={item.href ?? item.label ?? i}>
              <SidebarItem {...item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { SidebarGroupItem }
export type { SidebarGroupItemProps, SidebarItemData }
