'use client'

// States grid for the date input, drawn from date-input.figma.ts. Each cell is
// the real component; hover and focus are pinned with Figma's tokens.
import { DateInput, EMPTY_DATE, type DateParts } from '@/components/ui/input/date-input'
import { DATE_LAYOUT } from '@/components/ui/input/date-input.figma'

import { StateTable } from './state-table'

import type { InputSize } from '@/components/ui/input/input.figma'

const SIZES: InputSize[] = ['sm', 'md', 'lg']
const STATES = ['placeholder', 'hover', 'focus', 'filled', 'error', 'disabled'] as const
const FILLED: DateParts = { day: '16', month: '06', year: '2026' }

const PIN: Partial<Record<(typeof STATES)[number], string>> = {
  hover: '[&_[role=group]]:bg-bg-input-hover! [&_[role=group]]:border-border-input-hover!',
  focus: '[&_[role=group]]:bg-bg-input-focus! [&_[role=group]]:border-border-input-focus!',
}

function DateInputStates() {
  return (
    <StateTable
      columns={SIZES.map((s) => `${DATE_LAYOUT[s].height}px · ${s}`)}
      rows={STATES.map((state) => ({
        label: state,
        cells: SIZES.map((size) => (
          <DateInput
            key={size}
            label={`${state} ${size}`}
            size={size}
            value={state === 'placeholder' || state === 'hover' ? EMPTY_DATE : FILLED}
            onChange={() => {}}
            errorText={state === 'error' ? 'Pick a later date' : undefined}
            disabled={state === 'disabled'}
            className={`w-[178px] ${PIN[state] ?? ''}`}
          />
        )),
      }))}
      caption="Every state at every height, as in Figma. Hover and focus are pinned here; hover over or type in the examples above to see them for real."
    />
  )
}

export { DateInputStates }
