'use client'

import { useGroupInput } from './group-input-context'
import { HELPER_TEXT, LEFT_PANEL, PANEL_BASE } from './group-input-panel'

import type { GroupInputSize } from './group-input.figma'

type GroupInputLeftTextSize = GroupInputSize

interface GroupInputLeftTextProps {
  /** Fixed text before the field, e.g. `https://`. */
  text: string
  /** Inside a GroupInput, defaults to the group's size. */
  size?: GroupInputLeftTextSize
  className?: string
}

/** Fixed text before the field. Figma: .Subcomponents/Group-input/Left/Text-helpers. */
function GroupInputLeftText({ text, size: sizeProp, className = '' }: GroupInputLeftTextProps) {
  const group = useGroupInput()
  const size = sizeProp ?? group?.size ?? 'md'
  return (
    <div className={`${PANEL_BASE} ${LEFT_PANEL[size]} ${HELPER_TEXT[size]} ${className}`}>
      {text}
    </div>
  )
}

export { GroupInputLeftText }
export type { GroupInputLeftTextProps, GroupInputLeftTextSize }
