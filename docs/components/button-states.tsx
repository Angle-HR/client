import { Button, type ButtonAccent, type ButtonVariant } from '@/components/ui/button'

import { FOCUS_RING, StateTable } from './state-table'

import type { CSSProperties } from 'react'

const ACCENTS: ButtonAccent[] = ['default', 'blue', 'red']
const VARIANTS: { key: ButtonVariant; token: string }[] = [
  { key: 'primary', token: 'pri' },
  { key: 'secondary', token: 'sec' },
  { key: 'tertiary', token: 'tet' },
]
const STATES = ['rest', 'hover', 'pressed', 'focus', 'disabled'] as const

/**
 * Pins a real Button to one state by applying that state's own tokens, so
 * every state can be compared side by side, as in Figma. The colours come
 * from the same CSS variables the component uses on hover, press and focus.
 */
function pinnedStyle(
  accent: ButtonAccent,
  token: string,
  state: (typeof STATES)[number],
): CSSProperties | undefined {
  if (state === 'rest' || state === 'disabled') return undefined
  return {
    backgroundColor: `var(--bg-btn-${accent}-${token}-${state})`,
    borderColor: `var(--border-btn-${accent}-${token}-${state})`,
    ...(state === 'focus' ? FOCUS_RING : {}),
  }
}

/** Every variant, accent and state of Button in one grid. */
function ButtonStates() {
  return (
    <StateTable
      columns={STATES}
      rows={ACCENTS.flatMap((accent) =>
        VARIANTS.map((variant, index) => ({
          label: `${accent} · ${variant.key}`,
          divider: index === 0,
          cells: STATES.map((state) => (
            <Button
              key={state}
              variant={variant.key}
              accent={accent}
              disabled={state === 'disabled'}
              tabIndex={-1}
              aria-hidden
              style={pinnedStyle(accent, variant.token, state)}
            >
              Button
            </Button>
          )),
        })),
      )}
      caption="Each state is pinned using its own tokens. Hover, press or tab to the examples above to see the real transitions."
    />
  )
}

export { ButtonStates }
