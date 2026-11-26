'use client'

import { useId, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react'

import { MaskIcon } from '../icons/mask-icon'
import { HelperText, type HelperTextState } from '../input/helper-text'
import { LabelWrapper } from '../input/label-wrapper'

import { OTPCell, type OTPCellState } from './otp-cell'
import { OTP_INPUT_FIGMA } from './otp-input.figma'

type OTPInputState = 'rest' | 'error' | 'success'

interface OTPInputProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  state?: OTPInputState
  /** Number of cells. Figma has 6. */
  length?: number
  label?: string
  showLabel?: boolean
  helperText?: string
  helperState?: HelperTextState
  errorText?: string
  showHelper?: boolean
  disabled?: boolean
  required?: boolean
  autoSubmit?: boolean
  name?: string
  id?: string
  'aria-label'?: string
  'aria-describedby'?: string
  className?: string
}

const DEFAULT_LENGTH = OTP_INPUT_FIGMA.length

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
  required = false,
  autoSubmit = true,
  name,
  id: externalId,
  className = '',
  ...props
}: OTPInputProps) {
  const generatedId = useId()
  const groupId = externalId || generatedId
  const helperId = `${groupId}-helper`
  const labelId = `${groupId}-label`
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

  // Several characters at once (SMS autofill, fast typing): fill from here on.
  function handleFill(index: number, text: string) {
    const chars = text.replace(/\s/g, '').split('')
    const arr = value.padEnd(length).split('')
    chars.slice(0, length - index).forEach((char, k) => {
      arr[index + k] = char
    })
    commit(arr.join('').replace(/\s+$/g, ''))
    cellRefs.current[Math.min(index + chars.length, length - 1)]?.focus()
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

  const hasLabel = showLabel && !!label
  const describedBy =
    (showHelper || hasError) && displayHelperText ? helperId : props['aria-describedby']

  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {hasLabel ? <LabelWrapper label={label} required={required} id={labelId} /> : null}
      <div
        role="group"
        aria-labelledby={hasLabel ? labelId : undefined}
        aria-label={hasLabel ? undefined : props['aria-label'] || label}
        aria-describedby={describedBy}
        // group/otp: every cell shows Focus while any of them has it (Figma's All Focused).
        className="group/otp relative inline-flex items-center gap-[4px] self-start"
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
            required={required}
            aria-invalid={hasError || undefined}
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            onChange={(char) => handleChange(i, char)}
            onFill={(text) => handleFill(i, text)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
          />
        ))}
        {compositeState === 'success' ? (
          // Figma: a 24px solid check-badge in text/Success, 4px after the cells.
          // Absolute, so the row keeps its width and nothing shifts on success.
          // The icon file keeps a 16px frame, so the badge lands at 19.2px.
          <span
            role="img"
            aria-label="Code accepted"
            className="absolute top-1/2 left-full ml-[4px] inline-flex size-[24px] -translate-y-1/2 text-text-success"
          >
            <MaskIcon src="/dashboard/icons/check-badge-solid.svg" size={24} />
          </span>
        ) : null}
      </div>
      {name && <input type="hidden" name={name} value={value.trim()} />}
      {(showHelper || hasError) && displayHelperText && (
        <div role={hasError ? 'alert' : undefined} className="flex">
          <HelperText id={helperId} state={displayHelperState}>
            {displayHelperText}
          </HelperText>
        </div>
      )}
    </div>
  )
}

export { OTPInput }
export type { OTPInputProps, OTPInputState }
