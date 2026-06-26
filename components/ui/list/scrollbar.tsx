import { type HTMLAttributes, type ReactNode } from 'react'

interface ScrollContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

/**
 * ScrollContainer applies the design system's custom scrollbar styling to a
 * scrollable list/dropdown container. It styles the native scrollbar (so
 * keyboard, screen-reader, and OS scroll behaviour stay intact): a 2px rounded
 * thumb that thickens to 4px with a track tint on hover/drag.
 *
 * Tokens: thumb = text/input/hover (#b3b3b3, via currentColor of the rule),
 * track tint = bg/transparent/light. See Scrollbar sub-component spec.
 */
const SCROLLBAR_CSS = `
.ds-scroll {
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #b3b3b3 transparent;
}
.ds-scroll::-webkit-scrollbar {
  width: 12px;
}
.ds-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.ds-scroll::-webkit-scrollbar-thumb {
  background: #b3b3b3;
  border-radius: 99px;
  border: 5px solid transparent;
  background-clip: content-box;
}
.ds-scroll::-webkit-scrollbar-thumb:hover,
.ds-scroll::-webkit-scrollbar-thumb:active {
  border-width: 4px;
}
.ds-scroll::-webkit-scrollbar-track:hover {
  background: rgba(0, 0, 0, 0.04);
}
`

function ScrollContainer({ children, className = '', ...props }: ScrollContainerProps) {
  return (
    <>
      <style>{SCROLLBAR_CSS}</style>
      <div className={`ds-scroll ${className}`} {...props}>
        {children}
      </div>
    </>
  )
}

export { ScrollContainer }
export type { ScrollContainerProps }
