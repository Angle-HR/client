'use client'

import { forwardRef, useId, type ReactNode } from 'react'

import { HelperText, type HelperTextState } from '../input/helper-text'

type GroupInputSize = 'sm' | 'md' | 'lg'
type GroupInputPosition = 'right' | 'center'

interface GroupInputProps {
  size?: GroupInputSize
  position?: GroupInputPosition
  label?: string
  showLabel?: boolean
  helperText?: string
  helperState?: HelperTextState
  showHelper?: boolean
  errorText?: string
  disabled?: boolean
  children: ReactNode
  className?: string
  id?: string
}

const GroupInput = forwardRef<HTMLDivElement, GroupInputProps>(function GroupInput(
  {
    // size/position are part of the documented API but propagation is the
    // caller's responsibility — each child panel/field carries its own.
    label,
    showLabel = true,
    helperText,
    helperState = 'neutral',
    showHelper = true,
    errorText,
    disabled,
    children,
    className = '',
    id: externalId,
  },
  ref,
) {
  const generatedId = useId()
  const groupId = externalId || generatedId
  const helperId = `${groupId}-helper`
  const hasError = !!errorText
  const displayHelperState = hasError ? 'error' : helperState
  const displayHelperText = hasError ? errorText : helperText

  return (
    <div ref={ref} className={`flex flex-col gap-[6px] ${className}`}>
      {showLabel && label && (
        <label
          htmlFor={groupId}
          className="text-label font-medium text-text-secondary h-[9px] leading-none"
        >
          {label}
        </label>
      )}
      <div className={`inline-flex ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
        {children}
      </div>
      {(showHelper || hasError) && displayHelperText && (
        <HelperText id={helperId} state={displayHelperState}>
          {displayHelperText}
        </HelperText>
      )}
    </div>
  )
})

export { GroupInput }
export type { GroupInputProps, GroupInputSize, GroupInputPosition }
