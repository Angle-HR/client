'use client'

import { forwardRef, useId, useMemo, type ReactNode } from 'react'

import { HelperText, type HelperTextState } from '../input/helper-text'
import { LabelWrapper } from '../input/label-wrapper'

import { GroupInputContext } from './group-input-context'

import type { GroupInputSize } from './group-input.figma'

interface GroupInputProps {
  /** 25, 32 or 40px. The field and panels inside take this size unless they set their own. */
  size?: GroupInputSize
  label?: string
  /** Figma's Show Label 🏷️. */
  showLabel?: boolean
  helperText?: string
  helperState?: HelperTextState
  /** Figma's Show Helper 💬. */
  showHelper?: boolean
  /**
   * Figma's "with Padding ?" on the helper: the 3px inset. On for the text
   * group input, off for the group selection.
   */
  helperInset?: boolean
  /** Shown under the group in red, and turns the field's border red. */
  errorText?: string
  disabled?: boolean
  required?: boolean
  /** The panels and field, left to right, e.g. a flag then a GroupInputField. */
  children: ReactNode
  className?: string
  /** The field's id. Generated when left out. */
  id?: string
}

/**
 * A labelled group of a text field and side panels. Figma: Inputs/Text Group
 * input ✏️, and Inputs/Select Group input 🔽 with a GroupSelectionField
 * (pass `helperInset={false}` for that one).
 *
 * Label, group and helper sit 6px apart; the panels and field touch. All
 * values from group-input.figma.ts.
 */
const GroupInput = forwardRef<HTMLDivElement, GroupInputProps>(function GroupInput(
  {
    size = 'md',
    label,
    showLabel = true,
    helperText,
    helperState = 'neutral',
    showHelper = true,
    helperInset = true,
    errorText,
    disabled = false,
    required = false,
    children,
    className = '',
    id: externalId,
  },
  ref,
) {
  const generatedId = useId()
  const fieldId = externalId || generatedId
  const labelId = `${fieldId}-label`
  const helperId = `${fieldId}-helper`
  const hasError = !!errorText
  const helper = hasError ? errorText : showHelper ? helperText : undefined
  const hasLabel = showLabel && !!label

  const context = useMemo(
    () => ({
      size,
      fieldId,
      labelId: hasLabel ? labelId : undefined,
      describedBy: helper ? helperId : undefined,
      invalid: hasError,
      disabled,
      required,
    }),
    [size, fieldId, hasLabel, labelId, helper, helperId, hasError, disabled, required],
  )

  return (
    <div ref={ref} className={`flex flex-col gap-[6px] ${className}`}>
      {hasLabel ? (
        <LabelWrapper label={label} required={required} htmlFor={fieldId} id={labelId} />
      ) : null}
      <div
        role="group"
        aria-labelledby={hasLabel ? labelId : undefined}
        className="flex w-full items-center"
      >
        <GroupInputContext.Provider value={context}>{children}</GroupInputContext.Provider>
      </div>
      {helper ? (
        <div role={hasError ? 'alert' : undefined} className="flex">
          <HelperText id={helperId} inset={helperInset} state={hasError ? 'error' : helperState}>
            {helper}
          </HelperText>
        </div>
      ) : null}
    </div>
  )
})

export { GroupInput }
export type { GroupInputProps, GroupInputSize }
