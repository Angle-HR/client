'use client'

// States grid for the selection field, drawn from selection-field.figma.ts.
// Each cell is the real component; hover and focus are pinned through its
// `state` prop.
import { MaskIcon } from '@/components/ui/icons/mask-icon'
import { SelectionField } from '@/components/ui/input-selection/selection-field'
import {
  SELECTION_LAYOUT,
  type SelectionState,
} from '@/components/ui/input-selection/selection-field.figma'
import { Tag } from '@/components/ui/tags/tag'

import { StateTable } from './state-table'

import type { InputSize } from '@/components/ui/input/input.figma'

const SIZES: InputSize[] = ['sm', 'md', 'lg']
const STATES: SelectionState[] = ['placeholder', 'hover', 'focus', 'filled', 'disabled', 'error']

function cell(size: InputSize, state: SelectionState, withSelection: boolean) {
  const filled = state === 'filled' || state === 'focus' || state === 'error'
  return (
    <SelectionField
      key={state}
      size={size}
      state={state === 'filled' || state === 'placeholder' ? undefined : state}
      disabled={state === 'disabled'}
      tabIndex={-1}
      aria-label={`${state} ${size}`}
      className="w-[144px]!"
      placeholder="Choose…"
      value={!withSelection && filled ? 'Lagos' : undefined}
      showPrefixIcon={!withSelection}
      prefixIcon={
        <MaskIcon src="/dashboard/icons/bell-outline.svg" size={SELECTION_LAYOUT[size].icon} />
      }
      withSelection={withSelection}
      tags={
        withSelection && filled
          ? [<Tag key="a" label="Tag" color="green" />, <Tag key="b" label="Tag" color="green" />]
          : undefined
      }
    />
  )
}

function SelectionStates({ withSelection = false }: { withSelection?: boolean }) {
  return (
    <StateTable
      columns={SIZES.map((s) => `${SELECTION_LAYOUT[s].height}px · ${s}`)}
      rows={STATES.map((state) => ({
        label: state,
        cells: SIZES.map((size) => cell(size, state, withSelection)),
      }))}
      caption={
        withSelection
          ? 'With selection: chosen values show as green tags, 2px apart, and the prefix icon is hidden.'
          : 'Every state at every height, as in Figma. Hover and focus are pinned here; hover over or Tab to the examples above to see them for real. Hover only shows on an empty field.'
      }
    />
  )
}

export { SelectionStates }
