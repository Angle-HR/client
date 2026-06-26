'use client'

import { forwardRef, useId } from 'react'

import { Button } from '../button/button'
import { HelperText, type HelperTextState } from '../input/helper-text'

import { TextareaField } from './textarea-field'

interface TextareaProps {
  label?: string
  showLabel?: boolean
  helperText?: string
  helperState?: HelperTextState
  showHelper?: boolean
  errorText?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
  showToolbar?: boolean
  showActionButton?: boolean
  actionButtonLabel?: string
  onAction?: () => void
  showSecondaryActions?: boolean
  maxLength?: number
  rows?: number
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  name?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
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
    onChange,
    onBlur,
    showToolbar = true,
    showActionButton = false,
    actionButtonLabel,
    onAction,
    showSecondaryActions = false,
    maxLength,
    rows = 4,
    disabled,
    readOnly,
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
      <TextareaField
        ref={ref}
        id={fieldId}
        name={name}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        showToolbar={showToolbar}
        showActionButton={showActionButton}
        actionButton={
          showActionButton ? (
            <>
              {showSecondaryActions && (
                <Button variant="secondary" size="sm" onClick={onAction}>
                  Cancel
                </Button>
              )}
              <Button variant="primary" size="sm" onClick={onAction}>
                {actionButtonLabel}
              </Button>
            </>
          ) : undefined
        }
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        readOnly={readOnly}
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
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

export { Textarea }
export type { TextareaProps }
