'use client'

import { useGroupInput } from './group-input-context'
import { HELPER_TEXT, PANEL_BASE, RIGHT_PANEL } from './group-input-panel'

import type { GroupInputSize } from './group-input.figma'

type GroupInputRightTextSize = GroupInputSize

interface GroupInputRightTextProps {
  /** Fixed text after the field, e.g. `yourdomain.com`. */
  text: string
  /** Inside a GroupInput, defaults to the group's size. */
  size?: GroupInputRightTextSize
  className?: string
}

/** Fixed text after the field. Figma: .Subcomponents/Group-input/Right/Text-helpers. */
function GroupInputRightText({ text, size: sizeProp, className = '' }: GroupInputRightTextProps) {
  const group = useGroupInput()
  const size = sizeProp ?? group?.size ?? 'md'
  return (
    <div className={`${PANEL_BASE} ${RIGHT_PANEL[size]} ${HELPER_TEXT[size]} ${className}`}>
      {text}
    </div>
  )
}

export { GroupInputRightText }
export type { GroupInputRightTextProps, GroupInputRightTextSize }
