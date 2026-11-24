import { Button, type ButtonAccent, type ButtonVariant } from '@/components/ui/button'
import { BUTTON_FIGMA, type ButtonState } from '@/components/ui/button/button.figma'

import { StateTable } from './state-table'

import type { CSSProperties } from 'react'

const ACCENTS: ButtonAccent[] = ['default', 'blue', 'red']
const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'tertiary']
const STATES: ButtonState[] = ['rest', 'hover', 'pressed', 'focus', 'disabled']

const cssVar = (name: string) => (name === 'transparent' ? 'transparent' : `var(--${name})`)

/**
 * Pins a real Button to one state using the Figma spec (button.figma.ts), the
 * same file the component is tested against, so this grid can't drift from it.
 */
function pinnedStyle(accent: ButtonAccent, variant: ButtonVariant, state: ButtonState) {
  if (state === 'rest' || state === 'disabled') return undefined
  const spec = BUTTON_FIGMA[`${accent}-${variant}`][state]
  const style: CSSProperties = {
    backgroundColor: cssVar(spec.bg),
    borderColor: cssVar(spec.border),
    color: cssVar(spec.text),
  }
  if (spec.ring) style.boxShadow = `0 0 0 1px ${cssVar(spec.ring)}`
  return style
}

/** Every variant, accent and state of Button in one grid. */
function ButtonStates() {
  return (
    <StateTable
      columns={STATES}
      rows={ACCENTS.flatMap((accent) =>
        VARIANTS.map((variant, index) => ({
          label: `${accent} · ${variant}`,
          divider: index === 0,
          cells: STATES.map((state) => (
            <Button
              key={state}
              variant={variant}
              accent={accent}
              disabled={state === 'disabled'}
              tabIndex={-1}
              aria-hidden
              style={pinnedStyle(accent, variant, state)}
            >
              Button
            </Button>
          )),
        })),
      )}
      caption="Each state is pinned using Figma's tokens. Hover, press or tab to the examples above to see the real transitions."
    />
  )
}

export { ButtonStates }
