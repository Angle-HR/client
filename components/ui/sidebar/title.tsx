'use client'

import { ChevronDown } from '../icons'

interface SidebarTitleProps {
  label: string
  hoverable?: boolean
  closed?: boolean
  onToggle?: () => void
  /** id of the item list this title controls, for aria-controls. */
  controls?: string
  className?: string
}

// hoverable=false renders as a real heading — Figma's export tags every
// variant as a <button>, including the non-interactive ones, which is an
// artifact of the design tool rather than real intent (a static label has
// nothing to activate). See Sidebar Title docs for the explicit guidance.
function SidebarTitle({
  label,
  hoverable = true,
  closed = false,
  onToggle,
  controls,
  className = '',
}: SidebarTitleProps) {
  if (!hoverable) {
    return (
      <h3
        className={`flex h-[28px] w-[204px] items-center gap-[4px] px-[8px] py-[7px] text-[12px] leading-[19.2px] font-medium text-text-secondary ${className}`}
      >
        {label}
      </h3>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!closed}
      aria-controls={controls}
      className={`group flex h-[28px] w-[204px] cursor-pointer items-center gap-[4px] rounded-sm-7 px-[8px] py-[7px] text-left text-[12px] leading-[19.2px] font-medium text-text-secondary transition-colors hover:bg-bg-transparent-lighter hover:text-text-primary ${className}`}
    >
      {label}
      <ChevronDown
        className={`size-[10px] shrink-0 text-current transition-transform duration-150 ease-out ${closed ? '-rotate-90' : ''}`}
      />
    </button>
  )
}

export { SidebarTitle }
export type { SidebarTitleProps }
