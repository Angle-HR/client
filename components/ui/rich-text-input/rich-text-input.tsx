'use client'

import { useId } from 'react'

import { Button } from '../button/button'
import { HelperText, type HelperTextState } from '../input/helper-text'

import { RichTextField } from './rich-text-field'

interface RichTextInputProps {
  label?: string
  showLabel?: boolean
  helperText?: string
  helperState?: HelperTextState
  showHelper?: boolean
  errorText?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  showToolbar?: boolean
  showActionButton?: boolean
  actionButtonLabel?: string
  onAction?: () => void
  showSecondaryActions?: boolean
  disabled?: boolean
  required?: boolean
  id?: string
  name?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
}

function RichTextInput({
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
  disabled,
  required,
  id: externalId,
  name,
  className = '',
  ...props
}: RichTextInputProps) {
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
          className="text-body-xs font-medium-550 text-text-secondary h-[9px] leading-none pl-[2px]"
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
      <RichTextField
        id={fieldId}
        value={value}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur ? () => onBlur() : undefined}
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
        disabled={disabled}
        aria-label={props['aria-label']}
        aria-labelledby={props['aria-labelledby']}
        aria-invalid={hasError}
        aria-describedby={showHelper || hasError ? helperId : undefined}
      />
      {name && <input type="hidden" name={name} value={value ?? ''} />}
      {(showHelper || hasError) && displayHelperText && (
        <HelperText id={helperId} state={displayHelperState}>
          {displayHelperText}
        </HelperText>
      )}
    </div>
  )
}

export { RichTextInput }
export type { RichTextInputProps }
