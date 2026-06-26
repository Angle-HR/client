'use client'

import { forwardRef, useId } from 'react'

import { Button } from '../button/button'
import { HelperText, type HelperTextState } from '../input/helper-text'

import { CodeField } from './code-field'

interface InputCodeProps {
  label?: string
  showLabel?: boolean
  helperText?: string
  helperState?: HelperTextState
  showHelper?: boolean
  errorText?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  language?: string
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
  showActionButton?: boolean
  primaryActionLabel?: string
  onPrimaryAction?: () => void
  showSecondaryAction?: boolean
  secondaryActionLabel?: string
  onSecondaryAction?: () => void
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  'aria-label'?: string
  className?: string
}

const InputCode = forwardRef<HTMLTextAreaElement, InputCodeProps>(function InputCode(
  {
    label,
    showLabel = true,
    helperText,
    helperState = 'neutral',
    showHelper = true,
    errorText,
    value,
    defaultValue,
    placeholder,
    language = 'text',
    onChange,
    onBlur,
    showActionButton = true,
    primaryActionLabel = 'Format',
    onPrimaryAction,
    showSecondaryAction = false,
    secondaryActionLabel,
    onSecondaryAction,
    readOnly,
    disabled,
    required,
    name,
    id: externalId,
    className = '',
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const fieldId = externalId || generatedId
  const helperId = `${fieldId}-helper`
  const hasError = !!errorText
  const displayHelperState: HelperTextState = hasError ? 'error' : helperState
  const displayHelperText = hasError ? errorText : helperText

  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {showLabel && label && (
        <label
          htmlFor={fieldId}
          className="text-label font-medium text-text-secondary h-[9px] leading-none pl-[2px]"
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
      <CodeField
        ref={ref}
        id={fieldId}
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        language={language}
        onChange={onChange}
        onBlur={onBlur}
        readOnly={readOnly}
        disabled={disabled}
        showActionButtons={showActionButton}
        showSecondaryAction={showSecondaryAction}
        primaryActionButton={
          showActionButton ? (
            <Button variant="secondary" size="sm" onClick={onPrimaryAction}>
              {primaryActionLabel}
            </Button>
          ) : undefined
        }
        secondaryActionButton={
          showSecondaryAction ? (
            <Button variant="tertiary" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel ?? 'Copy'}
            </Button>
          ) : undefined
        }
        aria-label={props['aria-label']}
        aria-invalid={hasError}
        aria-required={required}
        aria-describedby={showHelper || hasError ? helperId : undefined}
      />
      {(showHelper || hasError) && displayHelperText && (
        <HelperText id={helperId} state={displayHelperState}>
          {displayHelperText}
        </HelperText>
      )}
    </div>
  )
})

export { InputCode }
export type { InputCodeProps }
