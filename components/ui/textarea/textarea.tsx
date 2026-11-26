'use client'

import { forwardRef, useId } from 'react'

import { Button } from '../button/button'
import { HelperText, type HelperTextState } from '../input/helper-text'
import { LabelWrapper } from '../input/label-wrapper'

import { TextareaField } from './textarea-field'

interface TextareaProps {
  label?: string
  /** Figma's Show Label 🏷️. */
  showLabel?: boolean
  helperText?: string
  helperState?: HelperTextState
  /** Figma's Show Helper 💬. */
  showHelper?: boolean
  /** Shown under the field in red, and turns its border red. */
  errorText?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
  /** The text as it changes: plain text, or HTML when the toolbar is on. */
  onValueChange?: (value: string) => void
  /**
   * Figma's labelled Text Area has the toolbar off. Turning it on makes the
   * field a rich-text editor whose value is HTML (use `onValueChange`).
   */
  showToolbar?: boolean
  /** Figma's ✨ show-sec_actions: a Tertiary Blue button in the field's top right. */
  showActionButton?: boolean
  actionButtonLabel?: string
  onAction?: () => void
  maxLength?: number
  /** Lines shown before typing, in browsers that can't size the field to its text. */
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

/**
 * A labelled text area. Figma: Inputs/Text Area 📝.
 *
 * Label, field and helper sit 6px apart; the helper isn't inset (Figma's
 * Helper-Text without padding). All values from textarea.figma.ts.
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    showLabel = true,
    helperText,
    helperState = 'neutral',
    showHelper = true,
    errorText,
    showToolbar = false,
    showActionButton = false,
    actionButtonLabel,
    onAction,
    required,
    id: externalId,
    className = '',
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const fieldId = externalId || generatedId
  const helperId = `${fieldId}-helper`
  const labelId = `${fieldId}-label`
  const hasError = !!errorText
  const helper = hasError ? errorText : showHelper ? helperText : undefined

  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      {showLabel && label ? (
        <LabelWrapper label={label} required={required} htmlFor={fieldId} id={labelId} />
      ) : null}
      <TextareaField
        ref={ref}
        id={fieldId}
        showToolbar={showToolbar}
        action={
          showActionButton && actionButtonLabel ? (
            <Button variant="tertiary" accent="blue" size="sm" onClick={onAction}>
              {actionButtonLabel}
            </Button>
          ) : undefined
        }
        // The rich editor is a div, which a <label for> doesn't name.
        aria-labelledby={showLabel && label ? labelId : undefined}
        aria-invalid={hasError || undefined}
        aria-required={required || undefined}
        aria-describedby={helper ? helperId : undefined}
        {...props}
      />
      {helper ? (
        <div role={hasError ? 'alert' : undefined} className="flex">
          <HelperText id={helperId} state={hasError ? 'error' : helperState} inset={false}>
            {helper}
          </HelperText>
        </div>
      ) : null}
    </div>
  )
})

export { Textarea }
export type { TextareaProps }
