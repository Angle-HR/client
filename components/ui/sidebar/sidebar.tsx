import type { ReactNode } from 'react'

interface SidebarProps {
  companySelector?: ReactNode
  /** Group Item sections for the scrollable nav area. */
  children: ReactNode
  /** Upgrade/invite CTA above the footer. */
  cta?: ReactNode
  footer?: ReactNode
  className?: string
}

// Composes Company Selector + scrollable nav + CTA + footer per the
// documented layout. The shell's own padding/gap wasn't pulled from Figma
// (its Figma node is a large assembled composition frame, not an isolated
// component — pulled the atomic pieces instead) — these are reasonable
// values from the project's spacing scale, not Figma-verified.
function Sidebar({ companySelector, children, cta, footer, className = '' }: SidebarProps) {
  return (
    <nav
      aria-label="Primary"
      className={`flex h-full w-[220px] shrink-0 flex-col gap-[16px] border-r border-border-light bg-bg-secondary p-[16px] ${className}`}
    >
      {companySelector}
      <div className="flex min-h-0 flex-1 flex-col gap-[4px] overflow-y-auto">{children}</div>
      {cta}
      {footer}
    </nav>
  )
}

export { Sidebar }
export type { SidebarProps }
