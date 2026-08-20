'use client'

import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'

import { HelperText, type HelperTextState } from '../input/helper-text'

import { OTPCell, type OTPCellState } from './otp-cell'

type OTPInputState = 'rest' | 'error' | 'success'

interface OTPInputProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  state?: OTPInputState
  /** Number of OTP cells. Defaults to 4; signup uses 6. */
  length?: number
  label?: string
  showLabel?: boolean
  helperText?: string
  helperState?: HelperTextState
  errorText?: string
  showHelper?: boolean
  disabled?: boolean
  autoSubmit?: boolean
  name?: string
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
  className?: string
}

const DEFAULT_LENGTH = 4

function OTPInput({
  value: controlledValue,
  defaultValue = '',
  onChange,
  onComplete,
  state = 'rest',
  length = DEFAULT_LENGTH,
  label,
  showLabel = true,
  helperText,
  helperState = 'neutral',
  errorText,
  showHelper = true,
  disabled = false,
  autoSubmit = true,
  name,
  id: externalId,
  className = '',
  ...props
}: OTPInputProps) {
  const generatedId = useId()
  const groupId = externalId || generatedId
  const helperId = `${groupId}-helper`
  const [internalValue, setInternalValue] = useState(defaultValue)
  const value = controlledValue ?? internalValue
  const digits = value.padEnd(length).slice(0, length).split('')
  const cellRefs = useRef<(HTMLInputElement | null)[]>([])

  const hasError = !!errorText || state === 'error'
  const compositeState = hasError ? 'error' : state
  const displayHelperState: HelperTextState = hasError ? 'error' : helperState
  const displayHelperText = hasError ? errorText : helperText

  function commit(next: string) {
    const trimmed = next.replace(/\s/g, '').slice(0, length)
    if (controlledValue === undefined) setInternalValue(trimmed)
    onChange?.(trimmed)
    if (trimmed.length === length && autoSubmit) onComplete?.(trimmed)
  }

  function handleChange(index: number, char: string) {
    const arr = value.padEnd(length).split('')
    arr[index] = char || ' '
    commit(arr.join('').replace(/\s+$/g, ''))
    if (char && index < length - 1) cellRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !(digits[index] ?? '').trim() && index > 0) {
      cellRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\s/g, '').slice(0, length)
    commit(pasted)
    cellRefs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  const cellState = (index: number): OTPCellState => {
    if (compositeState === 'error') return 'error'
    if (compositeState === 'success') return 'success'
    return (digits[index] ?? '').trim() ? 'filled' : 'placeholder'
  }

  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {showLabel && label && (
        <span
          className="text-body-xs font-medium-550 text-text-secondary leading-none pl-[2px]"
          id={`${groupId}-label`}
        >
          {label}
        </span>
      )}
      <div
        role="group"
        aria-label={props['aria-label'] || label}
        aria-describedby={showHelper || hasError ? helperId : props['aria-describedby']}
        className="inline-flex items-center gap-[4px]"
      >
        {Array.from({ length }).map((_, i) => (
          <OTPCell
            key={i}
            ref={(el) => {
              cellRefs.current[i] = el
            }}
            position={i + 1}
            value={(digits[i] ?? '').trim()}
            state={cellState(i)}
            disabled={disabled}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            onChange={(char) => handleChange(i, char)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
          />
        ))}
      </div>
      {name && <input type="hidden" name={name} value={value.trim()} />}
      {(showHelper || hasError) && displayHelperText && (
        <HelperText id={helperId} state={displayHelperState}>
          {displayHelperText}
        </HelperText>
      )}
    </div>
  )
}

export { OTPInput }
export type { OTPInputProps, OTPInputState }
