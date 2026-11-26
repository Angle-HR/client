// States grids for the selection controls. Each cell is the real component,
// pinned to one state with the tokens from its Figma spec file.
import {
  Checkbox,
  RadioButton,
  Toggle,
  type CheckboxChecked,
} from '@/components/ui/selection-controls'
import {
  CHECKBOX_FIGMA,
  type CheckboxBoxSize,
} from '@/components/ui/selection-controls/checkbox.figma'
import { RADIO_FIGMA, type RadioSize } from '@/components/ui/selection-controls/radio-button.figma'
import {
  TOGGLE_FIGMA,
  TOGGLE_OFF_HOVER_STROKE,
} from '@/components/ui/selection-controls/toggle.figma'

import { StateTable } from './state-table'

import type { CSSProperties } from 'react'

// Figma's Focus state (see focus.ts): the hover fill plus a 1px ring.
const PIN_HOVER = '[&_label>span:first-of-type]:bg-(--pin-hover)'
const PIN_FOCUS =
  '[&_label>span:first-of-type]:bg-(--pin-hover) [&_label>span:first-of-type]:outline-1 [&_label>span:first-of-type]:outline-bg-selection-controls-selected'
const pinClass = (state: string) =>
  state === 'hover' ? PIN_HOVER : state === 'focus' ? PIN_FOCUS : undefined
const pinsFill = (state: string) => state === 'hover' || state === 'focus'

const TYPES: CheckboxChecked[] = [false, true, 'indeterminate']
const SIZES: CheckboxBoxSize[] = [18, 15, 14, 11]

/** Pins the hover area's fill (Figma's Hover state) through a CSS variable. */
function hoverFill(size: CheckboxBoxSize, checked: CheckboxChecked): CSSProperties {
  // Figma oddity: 11px unchecked uses the selected hover fill.
  const token =
    checked !== false || size === 11 ? CHECKBOX_FIGMA.hover.filled : CHECKBOX_FIGMA.hover.unchecked
  return { '--pin-hover': `var(--${token})` } as CSSProperties
}

function CheckboxStates() {
  const columns = ['rest', 'hover', 'focus', 'disabled'] as const
  return (
    <StateTable
      columns={columns}
      rows={SIZES.map((size) => ({
        label: `${size}px`,
        cells: columns.map((state) => (
          <div key={state} className="flex items-center gap-[4px]">
            {TYPES.map((checked) => (
              <span
                key={String(checked)}
                style={pinsFill(state) ? hoverFill(size, checked) : undefined}
                className={pinClass(state)}
              >
                <Checkbox
                  size={size}
                  checked={checked}
                  disabled={state === 'disabled'}
                  readOnly
                  tabIndex={-1}
                  aria-hidden
                  aria-label={`${size}px ${String(checked)}`}
                />
              </span>
            ))}
          </div>
        )),
      }))}
      caption="Each cell shows unchecked, checked and indeterminate, pinned using Figma's tokens. Hover over or Tab to the examples above to see the real states."
    />
  )
}

function RadioStates() {
  const columns = ['rest', 'hover', 'focus', 'disabled'] as const
  const sizes: RadioSize[] = ['sm', 'md']
  return (
    <StateTable
      columns={columns}
      rows={sizes.map((size) => ({
        label: size === 'sm' ? 'sm · 13px' : 'md · 13.8px',
        cells: columns.map((state) => (
          <div key={state} className="flex items-center gap-[4px]">
            {[false, true].map((checked) => (
              <span
                key={String(checked)}
                style={
                  pinsFill(state)
                    ? ({
                        '--pin-hover': `var(--${checked ? RADIO_FIGMA.hover.selected : RADIO_FIGMA.hover.unselected})`,
                      } as CSSProperties)
                    : undefined
                }
                className={pinClass(state)}
              >
                <RadioButton
                  size={size}
                  checked={checked}
                  disabled={state === 'disabled'}
                  readOnly
                  tabIndex={-1}
                  aria-hidden
                  aria-label={`${size} ${checked ? 'selected' : 'unselected'}`}
                />
              </span>
            ))}
          </div>
        )),
      }))}
      caption="Each cell shows unselected and selected, pinned using Figma's tokens. Hover over or Tab to the examples above to see the real states."
    />
  )
}

function ToggleStates() {
  const columns = ['rest', 'hover', 'focus', 'disabled'] as const
  const sizes = ['md', 'sm'] as const
  return (
    <StateTable
      columns={columns}
      rows={sizes.map((size) => ({
        label: size === 'md' ? 'md · 20px' : 'sm · 16px',
        cells: columns.map((state) => (
          <div key={state} className="flex items-center gap-[8px]">
            {[false, true].map((on) => {
              const stroke = on
                ? TOGGLE_FIGMA.on.hoverFocus.stroke!.token
                : TOGGLE_OFF_HOVER_STROKE[size]
              return (
                <span
                  key={String(on)}
                  style={
                    state === 'hover' || state === 'focus'
                      ? ({ '--pin-stroke': `var(--${stroke})` } as CSSProperties)
                      : undefined
                  }
                  className={
                    state === 'hover'
                      ? 'flex [&_button]:shadow-[inset_0_0_0_0.5px_var(--pin-stroke)]'
                      : state === 'focus'
                        ? 'flex [&_button]:shadow-[inset_0_0_0_0.5px_var(--pin-stroke)] [&_button]:outline-solid [&_button]:outline-1 [&_button]:outline-offset-2 [&_button]:outline-bg-selection-controls-selected'
                        : 'flex'
                  }
                >
                  <Toggle
                    size={size}
                    toggled={on}
                    disabled={state === 'disabled'}
                    tabIndex={-1}
                    aria-hidden
                    aria-label={`${size} ${on ? 'on' : 'off'}`}
                  />
                </span>
              )
            })}
          </div>
        )),
      }))}
      caption="Each cell shows off and on, pinned using Figma's tokens. Hover over or Tab to the examples above to see the real states."
    />
  )
}

export { CheckboxStates, RadioStates, ToggleStates }
