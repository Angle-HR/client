'use client'

import { forwardRef, useId, type ReactNode } from 'react'

import { HelperText, type HelperTextState } from './helper-text'
import { Input, type InputSize } from './input'

type TextInputSize = 'sm' | 'md'

interface TextInputProps {
  size?: TextInputSize
  label?: string
  showLabel?: boolean
  showHelper?: boolean
  helperText?: string
  helperState?: HelperTextState
  errorText?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  showPrefixIcon?: boolean
  prefixIcon?: ReactNode
  suffix?: 'none' | 'icon' | 'button'
  suffixIcon?: ReactNode
  suffixButton?: ReactNode
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  type?: string
  name?: string
  id?: string
  autoComplete?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  className?: string
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    size = 'md',
    label,
    showLabel = true,
    showHelper = true,
    helperText,
    helperState = 'neutral',
    errorText,
    placeholder,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    showPrefixIcon = false,
    prefixIcon,
    suffix,
    suffixIcon,
    suffixButton,
    disabled,
    readOnly,
    required,
    type,
    name,
    id: externalId,
    autoComplete,
    className = '',
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const inputId = externalId || generatedId
  const helperId = `${inputId}-helper`
  const hasError = !!errorText
  const displayHelperState = hasError ? 'error' : helperState
  const displayHelperText = hasError ? errorText : helperText

  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {showLabel && label && (
        <label
          htmlFor={inputId}
          className="text-body-xs font-medium-550 text-text-tertiary h-[9px] leading-none pl-[3px]"
        >
          {label}
          {required && (
            <span className="text-text-error" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <Input
        ref={ref}
        id={inputId}
        size={size as InputSize}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        showPrefixIcon={showPrefixIcon}
        prefixIcon={prefixIcon}
        suffix={suffix}
        suffixIcon={suffixIcon}
        suffixButton={suffixButton}
        disabled={disabled}
        readOnly={readOnly}
        type={type}
        name={name}
        autoComplete={autoComplete}
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        aria-invalid={hasError}
        aria-required={required}
        aria-describedby={showHelper || hasError ? helperId : props['aria-describedby']}
      />
      {(showHelper || hasError) && displayHelperText && (
        <HelperText id={helperId} state={displayHelperState}>
          {displayHelperText}
        </HelperText>
      )}
    </div>
  )
})

export { TextInput }
export type { TextInputProps, TextInputSize }
