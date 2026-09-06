interface OverlayProps {
  onClick?: () => void
  className?: string
}

// Fade timing is the consumer's responsibility (pair with the same
// delayed-unmount pattern used for the panel it accompanies) — this stays a
// simple, documented two-prop component rather than owning its own open state.
function Overlay({ onClick, className = '' }: OverlayProps) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className={`fixed inset-0 z-40 bg-[rgba(0,0,0,0.25)] transition-opacity ${className}`}
    />
  )
}

export { Overlay }
export type { OverlayProps }
