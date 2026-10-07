'use client'

import { useRef, type KeyboardEvent, type ReactNode } from 'react'

import { TabItem } from './tab-item'

interface TabOption<Key extends string = string> {
  key: Key
  label: string
  count?: number
}

interface TabsProps<Key extends string = string> {
  tabs: ReadonlyArray<TabOption<Key>>
  value: Key
  onValueChange: (key: Key) => void
  /** Sits before the tabs — the view switcher in the jobs bar. */
  leading?: ReactNode
  /** Right-aligned actions — Filter, Sort and the view toggle in the jobs bar. */
  trailing?: ReactNode
  'aria-label'?: string
  className?: string
}

/**
 * A tab bar with optional leading and trailing slots. Figma: Tab/Tab
 * (7229:133362).
 *
 * The bar is 41px with its 37px row seated on the bottom hairline, so the
 * selected tab's underline lands on top of it.
 */
function Tabs<Key extends string = string>({
  tabs,
  value,
  onValueChange,
  leading,
  trailing,
  className = '',
  ...props
}: TabsProps<Key>): ReactNode {
  const listRef = useRef<HTMLDivElement>(null)

  // Arrow keys move between tabs and select as they go, per the WAI-ARIA tabs
  // pattern with automatic activation.
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = tabs.findIndex((tab) => tab.key === value)
    let next = index
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = tabs.length - 1
    else return

    const target = tabs[next]
    if (!target) return
    event.preventDefault()
    onValueChange(target.key)
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div
      className={`flex h-[41px] w-full shrink-0 items-end justify-between border-b-[0.5px] border-border-transparent-medium ${className}`}
    >
      <div className="-mb-[0.5px] flex h-[37px] min-w-0 items-center px-[7px]">
        {leading}
        <div
          ref={listRef}
          role="tablist"
          aria-label={props['aria-label']}
          className="flex items-center gap-[4px]"
          onKeyDown={handleKeyDown}
        >
          {tabs.map((tab) => (
            <TabItem
              key={tab.key}
              label={tab.label}
              count={tab.count}
              selected={tab.key === value}
              onClick={() => onValueChange(tab.key)}
            />
          ))}
        </div>
      </div>
      {trailing ? (
        <div className="-mb-[0.5px] flex h-[37px] shrink-0 items-center gap-[2px] px-[10px]">
          {trailing}
        </div>
      ) : null}
    </div>
  )
}

export { Tabs }
export type { TabOption, TabsProps }
