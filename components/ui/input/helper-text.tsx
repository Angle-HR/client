import type { ReactNode } from 'react'

type HelperTextState = 'neutral' | 'error' | 'info' | 'success'

interface HelperTextProps {
  state?: HelperTextState
  /** Text content. Alternatively pass via `children`. */
  helper?: string
  children?: ReactNode
  className?: string
  id?: string
}

// Per Helper Text spec: neutral=text/light, error=text/Error,
// info=text/Secondary, success=text/Secondary.
const stateClasses: Record<HelperTextState, string> = {
  neutral: 'text-text-light',
  error: 'text-text-error',
  info: 'text-text-secondary',
  success: 'text-text-secondary',
}

// Only the success state renders an icon (a green check-circle). The design
// system has no `text/Success` token, so the green primitive is used.
function SuccessIcon() {
  return (
    <svg
      className="h-[9px] w-[9px] shrink-0 text-green-7"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm2.354 3.854l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 01.708-.708L5 6.793l2.646-2.647a.5.5 0 01.708.708z" />
    </svg>
  )
}

function HelperText({ state = 'neutral', helper, children, className = '', id }: HelperTextProps) {
  return (
    <span
      id={id}
      className={`inline-flex items-center gap-[2px] h-[9px] text-label ${stateClasses[state]} ${className}`}
    >
      {state === 'success' && <SuccessIcon />}
      <span className="leading-none">{helper ?? children}</span>
    </span>
  )
}

export { HelperText }
export type { HelperTextProps, HelperTextState }
