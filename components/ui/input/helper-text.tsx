import { MaskIcon } from '../icons/mask-icon'

import type { ReactNode } from 'react'

type HelperTextState = 'neutral' | 'error' | 'info' | 'success'

interface HelperTextProps {
  state?: HelperTextState
  /** Text content. Alternatively pass via `children`. */
  helper?: string
  children?: ReactNode
  className?: string
  id?: string
  /** Figma's "with Padding ?": the 3px inset (yes, the default). The text area's helper has none. */
  inset?: boolean
}

// Per Helper Text spec: neutral=text/light, error=text/Error,
// info=text/Secondary, success=text/Secondary.
const stateClasses: Record<HelperTextState, string> = {
  neutral: 'text-text-light',
  error: 'text-text-error',
  info: 'text-text-secondary',
  success: 'text-text-secondary',
}

// Only the success state has an icon: Figma's check-circle (solid) in a 10px
// box, in text/Success.
function SuccessIcon() {
  return (
    <span className="inline-flex shrink-0 text-text-success" aria-hidden="true">
      <MaskIcon src="/dashboard/icons/check-circle-solid.svg" size={10} />
    </span>
  )
}

function HelperText({
  state = 'neutral',
  helper,
  children,
  className = '',
  id,
  inset = true,
}: HelperTextProps) {
  return (
    <span
      id={id}
      // -my trims the line box to the cap height Figma measures spacing from.
      className={`-my-[5px] inline-flex items-center gap-[2px] ${inset ? 'pl-[3px]' : ''} text-body-xs leading-19_2 ${stateClasses[state]} ${className}`}
    >
      {state === 'success' && <SuccessIcon />}
      <span>{helper ?? children}</span>
    </span>
  )
}

export { HelperText }
export type { HelperTextProps, HelperTextState }
