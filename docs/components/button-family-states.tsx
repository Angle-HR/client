// States grids for Icon Button, Text Button, Flow Button and Label Button.
// Each cell is the real component, pinned to one state with that state's own
// tokens (the same CSS variables the component uses on hover, press and focus).
import { FlowButton, IconButton, LabelButton, TextButton } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'

import { FOCUS_RING, StateTable } from './state-table'

import type { CSSProperties } from 'react'

const STATES = ['rest', 'hover', 'pressed', 'focus', 'disabled'] as const
type State = (typeof STATES)[number]

const CAPTION =
  'Each state is pinned using its own tokens. Hover, press or tab to the examples above to see the real transitions.'

const searchIcon = <MaskIcon src="/dashboard/icons/magnifying-glass-outline.svg" size={14} />
const trashIcon = <MaskIcon src="/dashboard/icons/trash-outline.svg" size={14} />

/** Inline styles that reproduce a state from its tokens. */
function tokenStyle(bg: string, border: string | null, state: State): CSSProperties | undefined {
  if (state === 'rest' || state === 'disabled') return undefined
  const style: CSSProperties = { backgroundColor: `var(--${bg}-${state})` }
  if (border) style.borderColor = `var(--${border}-${state})`
  return state === 'focus' ? { ...style, ...FOCUS_RING } : style
}

function IconButtonStates() {
  const variants = [
    { key: 'primary', token: 'pri' },
    { key: 'secondary', token: 'sec' },
    { key: 'tertiary', token: 'tet' },
  ] as const
  // Figma: `light` never fills; `light-w-hover` fills on hover and press;
  // `error` uses the red tertiary fills and the red focus border.
  const extra = [
    {
      key: 'light',
      style: (state: State): CSSProperties | undefined =>
        state === 'focus' ? FOCUS_RING : undefined,
    },
    {
      key: 'light-w-hover',
      style: (state: State): CSSProperties | undefined =>
        state === 'hover' || state === 'pressed'
          ? { backgroundColor: 'var(--bg-transparent-light)', borderColor: 'transparent' }
          : state === 'focus'
            ? FOCUS_RING
            : undefined,
    },
    {
      key: 'error',
      style: (state: State): CSSProperties | undefined =>
        state === 'hover' || state === 'pressed'
          ? { backgroundColor: `var(--bg-btn-red-tet-${state})`, borderColor: 'transparent' }
          : state === 'focus'
            ? {
                backgroundColor: 'var(--bg-btn-default-pri-focus)',
                borderColor: 'var(--border-btn-red-pri-focus)',
                ...FOCUS_RING,
              }
            : undefined,
    },
  ] as const
  return (
    <StateTable
      columns={STATES}
      rows={[
        ...variants.map((variant) => ({
          label: variant.key,
          cells: STATES.map((state) => (
            <IconButton
              key={state}
              variant={variant.key}
              icon={searchIcon}
              aria-label="Search"
              disabled={state === 'disabled'}
              tabIndex={-1}
              aria-hidden
              style={tokenStyle(
                `bg-btn-default-${variant.token}`,
                `border-btn-default-${variant.token}`,
                state,
              )}
            />
          )),
        })),
        ...extra.map((variant) => ({
          label: variant.key,
          cells: STATES.map((state) => (
            <IconButton
              key={state}
              variant={variant.key}
              icon={variant.key === 'error' ? trashIcon : searchIcon}
              aria-label={variant.key === 'error' ? 'Delete' : 'Search'}
              disabled={state === 'disabled'}
              tabIndex={-1}
              aria-hidden
              style={variant.style(state)}
            />
          )),
        })),
      ]}
      caption={CAPTION}
    />
  )
}

function TextButtonStates() {
  const pinned = (state: State, underline: 'hover' | 'never', wrapped: boolean) => {
    const style: CSSProperties = {}
    if (state === 'hover') style.color = 'var(--text-primary)'
    if (state === 'pressed' || state === 'focus') style.color = 'var(--text-blue-accent)'
    if (underline === 'hover' && (state === 'hover' || state === 'pressed'))
      style.textDecorationLine = 'underline'
    if (wrapped && state === 'hover') style.backgroundColor = 'var(--bg-transparent-light)'
    return state === 'focus' ? { ...style, ...FOCUS_RING } : style
  }
  const rows = [
    ...(['xs', 'sm', 'md', 'lg'] as const).map((size) => ({
      label: size,
      size,
      underline: 'hover' as const,
      wrapped: false,
    })),
    { label: 'md · never', size: 'md' as const, underline: 'never' as const, wrapped: false },
    { label: 'md · wrapped', size: 'md' as const, underline: 'never' as const, wrapped: true },
  ]
  return (
    <StateTable
      columns={STATES}
      rows={rows.map((row, index) => ({
        label: row.label,
        divider: index === 4,
        cells: STATES.map((state) => (
          <TextButton
            key={state}
            size={row.size}
            underline={row.underline}
            wrapped={row.wrapped}
            disabled={state === 'disabled'}
            tabIndex={-1}
            aria-hidden
            style={pinned(state, row.underline, row.wrapped)}
          >
            View details
          </TextButton>
        )),
      }))}
      caption={CAPTION}
    />
  )
}

function FlowButtonStates() {
  const variants = [
    { key: 'primary', token: 'pri' },
    { key: 'secondary', token: 'sec' },
  ] as const
  return (
    <StateTable
      columns={STATES}
      rows={variants.map((variant) => ({
        label: variant.key,
        cells: STATES.map((state) => (
          <FlowButton
            key={state}
            variant={variant.key}
            size="xs"
            disabled={state === 'disabled'}
            tabIndex={-1}
            aria-hidden
            style={tokenStyle(
              `bg-flow-btn-${variant.token}`,
              `border-flow-btn-${variant.token}`,
              state,
            )}
          >
            Continue
          </FlowButton>
        )),
      }))}
      caption={`${CAPTION} Tertiary has no state tokens of its own, so it isn't pinned here.`}
    />
  )
}

function LabelButtonStates() {
  const columns = ['rest', 'hover', 'selected', 'focus', 'disabled'] as const
  const style: Record<(typeof columns)[number], CSSProperties | undefined> = {
    rest: undefined,
    hover: {
      backgroundColor: 'var(--bg-btn-default-pri-hover)',
      borderColor: 'var(--border-btn-default-pri-hover)',
    },
    selected: undefined,
    focus: {
      backgroundColor: 'var(--bg-btn-default-pri-focus)',
      borderColor: 'var(--border-btn-blue-pri-focus)',
    },
    disabled: undefined,
  }
  return (
    <StateTable
      columns={columns}
      rows={[
        {
          label: 'label button',
          cells: columns.map((state) => (
            <LabelButton
              key={state}
              selected={state === 'selected'}
              disabled={state === 'disabled'}
              tabIndex={-1}
              aria-hidden
              style={style[state]}
            >
              Remote
            </LabelButton>
          )),
        },
      ]}
      caption="Each state is pinned using its own tokens. Focus is a blue border, as in Figma."
    />
  )
}

export { FlowButtonStates, IconButtonStates, LabelButtonStates, TextButtonStates }
