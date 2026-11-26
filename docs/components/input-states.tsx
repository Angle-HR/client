'use client'

// States grids for the text input, drawn from input.figma.ts. Each cell is the
// real component; hover and focus are pinned with Figma's tokens.
import { IconButton } from '@/components/ui/button/icon-button'
import { MaskIcon } from '@/components/ui/icons/mask-icon'
import { Input } from '@/components/ui/input/input'
import { INPUT_LAYOUT, type InputSize, type InputState } from '@/components/ui/input/input.figma'

import { StateTable } from './state-table'

const SIZES: InputSize[] = ['sm', 'md', 'lg']
const STATES: InputState[] = [
  'placeholder',
  'hover',
  'focus',
  'filled',
  'error',
  'success',
  'disabled',
]

const icon = (name: string, size: number) => (
  <MaskIcon src={`/dashboard/icons/${name}.svg`} size={size} />
)

// Pinned states: the classes the field gets on real hover and focus.
const PIN: Partial<Record<InputState, string>> = {
  hover: 'bg-bg-input-hover! border-border-input-hover!',
  focus:
    'bg-bg-input-focus! border-border-input-focus! [&>span:first-child]:text-text-input-focus!',
}

function cell(size: InputSize, state: InputState) {
  const px = INPUT_LAYOUT[size].icon
  const typed = state === 'focus' || state === 'filled' || state === 'error' || state === 'success'
  return (
    <Input
      key={state}
      size={size}
      aria-label={`${state} ${size}`}
      className={`w-[150px]! ${PIN[state] ?? ''}`}
      placeholder="Title"
      defaultValue={typed ? 'Title' : undefined}
      readOnly
      tabIndex={-1}
      disabled={state === 'disabled'}
      aria-invalid={state === 'error'}
      status={state === 'success' ? 'success' : undefined}
      prefixIcon={icon('bell-outline', px)}
      suffix="icon"
      suffixIcon={icon(
        state === 'success' ? 'check-circle-solid' : 'information-circle-outline',
        px,
      )}
    />
  )
}

function InputStates() {
  return (
    <StateTable
      columns={SIZES.map((s) => `${INPUT_LAYOUT[s].height}px · ${s}`)}
      rows={STATES.map((state) => ({
        label: state,
        cells: SIZES.map((size) => cell(size, state)),
      }))}
      caption="Every state at every height, as in Figma. Hover and focus are pinned here; hover over or Tab to the examples above to see them for real. Hover only shows on an empty field."
    />
  )
}

function InputSuffixStates() {
  return (
    <StateTable
      columns={SIZES.map((s) => `${INPUT_LAYOUT[s].height}px · ${s}`)}
      rows={(['none', 'icon', 'button'] as const).map((suffix) => ({
        label: suffix,
        cells: SIZES.map((size) => (
          <Input
            key={size}
            size={size}
            aria-label={`${suffix} ${size}`}
            className="w-[150px]!"
            placeholder="Title"
            prefixIcon={icon('bell-outline', INPUT_LAYOUT[size].icon)}
            suffix={suffix}
            suffixIcon={icon('information-circle-outline', INPUT_LAYOUT[size].icon)}
            suffixButton={
              <IconButton
                variant="light"
                size={INPUT_LAYOUT[size].button.size}
                aria-label="Show password"
                icon={icon('eye-slash-outline', 14)}
              />
            }
          />
        )),
      }))}
      caption="Suffix types. A suffix button is Figma's light Icon Button: 24px in the 25px field, 32px in the others, tucked against the right edge."
    />
  )
}

export { InputStates, InputSuffixStates }
