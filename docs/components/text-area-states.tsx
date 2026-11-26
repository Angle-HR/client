'use client'

// States grid for the text area, drawn from textarea.figma.ts. Each cell is
// the real component with its Figma state pinned.
import { TextareaField } from '@/components/ui/textarea'
import { TEXTAREA_STATES, type TextareaState } from '@/components/ui/textarea/textarea.figma'

import { StateTable } from './state-table'

const TEXT =
  'What experience do you have working with UX principles such as user journeys, wireframing, or information architecture?'
const EMPTY: TextareaState[] = ['placeholder', 'hover', 'disabled']

function TextAreaStates() {
  return (
    <StateTable
      columns={['Field with toolbar']}
      rows={(Object.keys(TEXTAREA_STATES) as TextareaState[]).map((state) => ({
        label: state,
        cells: [
          <div key={state} className="w-[374px]">
            <TextareaField
              aria-label={`${state} text area`}
              state={state === 'placeholder' ? undefined : state}
              placeholder="Enter some Placeholder"
              defaultValue={EMPTY.includes(state) ? undefined : TEXT}
              disabled={state === 'disabled'}
              readOnly={state !== 'placeholder'}
            />
          </div>,
        ],
      }))}
      caption="Every state, as in Figma. Hover, focus and selected are pinned here; hover over or type in the examples above to see them for real."
    />
  )
}

export { TextAreaStates }
