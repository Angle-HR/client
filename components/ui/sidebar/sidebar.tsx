import type { ReactNode } from 'react'

interface SidebarProps {
  /**
   * Icon-only rail. 52px against 220px open, per Figma's "Closed" state — the
   * children are responsible for rendering themselves collapsed.
   */
  collapsed?: boolean
  companySelector?: ReactNode
  /** Group Item sections for the scrollable nav area. */
  children: ReactNode
  /** Upgrade/invite CTA above the footer. */
  cta?: ReactNode
  footer?: ReactNode
  className?: string
}

/**
 * Composes Company Selector + scrollable nav + CTA + footer.
 *
 * Every value below is derived from the Figma sidebar-state nodes rather than
 * chosen: the 220x832 open frame puts its content wrapper at x=8 y=12 (so px-8
 * pt-12), ends the help row 12px above the bottom (pb-12), and leaves 8px
 * between the wrapper, the CTA and the footer. Inside, the selector sits 24px
 * above the nav, groups are 13px apart, and the two ungrouped items 2px. The
 * collapsed frame shares all of it except its width and outer gap.
 */
function Sidebar({
  collapsed = false,
  companySelector,
  children,
  cta,
  footer,
  className = '',
}: SidebarProps) {
  return (
    <nav
      aria-label="Primary"
      className={`flex h-full shrink-0 flex-col px-[8px] py-[12px] transition-[width] duration-200 ease-out motion-reduce:transition-none ${
        collapsed ? 'w-[52px] gap-[40px]' : 'w-[220px] gap-[8px]'
      } ${className}`}
    >
      {/* Only the nav scrolls. The selector's menu is 246px wide and its theme
          flyout sits beyond that, so it can't live inside an overflow box —
          overflow-y:auto forces overflow-x too and clipped both to 220px. */}
      <div className="flex min-h-0 flex-1 flex-col gap-[24px]">
        {companySelector}
        <div className="flex min-h-0 flex-1 flex-col gap-[13px] overflow-y-auto">{children}</div>
      </div>
      {cta}
      {footer}
    </nav>
  )
}

export { Sidebar }
export type { SidebarProps }
