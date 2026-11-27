import { type ReactNode } from 'react'

interface SocialFollowButtonProps {
  href: string
  icon: ReactNode
  children: ReactNode
}

// Visually a FlowButton (secondary/sm) but built as a real <a>, not a
// reused <button>, since these navigate to an external site. A button
// driving window.open loses native link behavior (middle-click, right-click
// "open in new tab", status-bar URL preview, screen readers announcing
// "link" instead of "button") that an external follow link should have.
function SocialFollowButton({ href, icon, children }: SocialFollowButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="border-border-flow-btn-sec-rest bg-bg-flow-btn-sec-rest text-text-flow-btn-secondary shadow-flow-btn hover:bg-bg-flow-btn-sec-hover focus-visible:bg-bg-flow-btn-sec-focus focus-visible:border-border-flow-btn-sec-focus rounded-lg-10 text-body-l inline-flex h-[32px] items-center justify-center gap-[8px] border px-[10px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bg-selection-controls-selected"
    >
      <span className="inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center">
        {icon}
      </span>
      <span>{children}</span>
    </a>
  )
}

export { SocialFollowButton }
