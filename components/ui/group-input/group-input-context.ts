'use client'

import { createContext, useContext } from 'react'

import type { GroupInputSize } from './group-input.figma'

/** What a labelled GroupInput hands down to its field and panels. */
interface GroupInputContextValue {
  size: GroupInputSize
  fieldId: string
  /** The label's id, when the group shows one. */
  labelId?: string
  describedBy?: string
  invalid: boolean
  disabled: boolean
  required: boolean
}

const GroupInputContext = createContext<GroupInputContextValue | null>(null)

function useGroupInput() {
  return useContext(GroupInputContext)
}

export { GroupInputContext, useGroupInput }
export type { GroupInputContextValue }
