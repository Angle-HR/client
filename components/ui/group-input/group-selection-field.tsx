'use client'

import { InputSelection, type InputSelectionProps } from '../input-selection/input-selection'

import { useGroupInput } from './group-input-context'

import type { GroupFieldPosition, GroupInputSize } from './group-input.figma'

interface GroupSelectionFieldProps extends Omit<
  InputSelectionProps,
  | 'label'
  | 'showLabel'
  | 'helperText'
  | 'helperState'
  | 'showHelper'
  | 'errorText'
  | 'size'
  | 'groupPosition'
  | 'invalid'
> {
  /** 25, 32 or 40px. Inside a GroupInput, defaults to the group's size. */
  size?: GroupInputSize
  /**
   * Figma's ⛔ Position: where the field sits in the group. `right` ends the
   * group (right corners rounded), `left` starts it, `center` has panels on
   * both sides.
   */
  position?: GroupFieldPosition
  /** Red border. Inside a GroupInput, on while the group shows an error. */
  invalid?: boolean
}

/**
 * The selection field inside a group input. Figma: .Subcomponents/Group-selection
 * (group-selection.figma.ts). The selection field and its list, with corners
 * only on the outer side. Put it in a GroupInput (with `helperInset={false}`)
 * beside the panels.
 */
function GroupSelectionField({
  size: sizeProp,
  position = 'right',
  invalid: invalidProp,
  disabled: disabledProp,
  required: requiredProp,
  id,
  className = '',
  ...props
}: GroupSelectionFieldProps) {
  const group = useGroupInput()
  return (
    <InputSelection
      {...props}
      id={id ?? group?.fieldId}
      size={sizeProp ?? group?.size ?? 'md'}
      groupPosition={position}
      invalid={invalidProp ?? group?.invalid ?? false}
      disabled={disabledProp ?? group?.disabled}
      required={requiredProp ?? group?.required}
      aria-labelledby={props['aria-labelledby'] ?? group?.labelId}
      aria-describedby={props['aria-describedby'] ?? group?.describedBy}
      showLabel={false}
      showHelper={false}
      className={`min-w-0 flex-1 ${className}`}
    />
  )
}

export { GroupSelectionField }
export type { GroupSelectionFieldProps }
