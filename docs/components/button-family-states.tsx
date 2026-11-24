// States grids for Icon Button, Text Button, Flow Button and Label Button.
// Each cell is the real component, pinned to one state with that state's own
// tokens (the same CSS variables the component uses on hover, press and focus).
import {
  FlowButton,
  IconButton,
  LabelButton,
  TextButton,
  type FlowButtonSize,
  type FlowButtonVariant,
  type IconButtonVariant,
} from '@/components/ui/button'
import {
  FLOW_BUTTON_FIGMA,
  FLOW_PRIMARY_FOCUS_SMALL,
  flowShadowStates,
} from '@/components/ui/button/flow-button.figma'
import { ICON_BUTTON_FIGMA } from '@/components/ui/button/icon-button.figma'
import { LABEL_BUTTON_FIGMA } from '@/components/ui/button/label-button.figma'
import {
  TEXT_BUTTON_FIGMA,
  TEXT_BUTTON_LAYOUT,
  TEXT_BUTTON_SHARED,
  TEXT_BUTTON_UNDERLINE,
  TEXT_BUTTON_UNDERLINE_STYLE,
} from '@/components/ui/button/text-button.figma'
import { MaskIcon } from '@/components/ui/icons'

import { StateTable } from './state-table'

import type { TextButtonSize, TextButtonUnderline } from '@/components/ui/button/text-button'
import type { CSSProperties } from 'react'

const STATES = ['rest', 'hover', 'pressed', 'focus', 'disabled'] as const
type State = (typeof STATES)[number]

const searchIcon = <MaskIcon src="/dashboard/icons/magnifying-glass-outline.svg" size={14} />
const trashIcon = <MaskIcon src="/dashboard/icons/trash-outline.svg" size={14} />

/** Inline styles for one state from a Figma spec entry (token names). */
function specStyle(spec: { bg: string; border: string; fg: string; ring?: string }): CSSProperties {
  const v = (name: string) => (name === 'transparent' ? 'transparent' : `var(--${name})`)
  return {
    backgroundColor: v(spec.bg),
    borderColor: v(spec.border),
    color: v(spec.fg),
    ...(spec.ring ? { boxShadow: `0 0 0 1px ${v(spec.ring)}` } : {}),
  }
}

/** For states Figma doesn't have. */
const NotInFigma = () => (
  <span className="body-xs-regular text-text-tertiary" title="Not in Figma">
    –
  </span>
)

function IconButtonStates() {
  const variants: IconButtonVariant[] = [
    'primary',
    'secondary',
    'tertiary',
    'light',
    'light-w-hover',
    'error',
  ]
  return (
    <StateTable
      columns={STATES}
      rows={variants.map((variant) => ({
        label: variant,
        cells: STATES.map((state) => {
          const spec = ICON_BUTTON_FIGMA[variant][state]
          if (!spec) return <NotInFigma key={state} />
          return (
            <IconButton
              key={state}
              variant={variant}
              icon={variant === 'error' ? trashIcon : searchIcon}
              aria-label={variant === 'error' ? 'Delete' : 'Search'}
              disabled={state === 'disabled'}
              tabIndex={-1}
              aria-hidden
              style={
                state === 'rest' || state === 'disabled'
                  ? undefined
                  : specStyle({ ...spec, fg: spec.icon })
              }
            />
          )
        }),
      }))}
      caption={`Each state is pinned using Figma's tokens. A dash means Figma has no such state. Hover, press or tab to the examples above to see the real transitions.`}
    />
  )
}

function TextButtonStates() {
  const F = TEXT_BUTTON_FIGMA
  const colour = (state: State, underline: TextButtonUnderline) =>
    state === 'rest' ? F.rest[underline] : F[state]
  const pinned = (
    state: State,
    underline: TextButtonUnderline,
    wrapped: boolean,
  ): CSSProperties | undefined => {
    if (state === 'rest' || state === 'disabled') return undefined
    const style: CSSProperties = { color: `var(--${colour(state, underline)})` }
    if (TEXT_BUTTON_UNDERLINE[underline][state]) {
      style.textDecorationLine = 'underline'
      style.textUnderlineOffset = TEXT_BUTTON_UNDERLINE_STYLE.offset
    }
    if (wrapped && state === 'hover')
      style.backgroundColor = `var(--${TEXT_BUTTON_SHARED.wrapped.hoverBg})`
    return style
  }
  // Figma oddity: at md and lg the left icon stays primary grey on press and focus.
  const leftIcon = (size: TextButtonSize, state: State) => {
    const keep = (size === 'md' || size === 'lg') && (state === 'pressed' || state === 'focus')
    return (
      <span
        className="inline-flex"
        style={keep ? { color: `var(--${F.leftIconPressedFocusMdLg})` } : undefined}
      >
        <MaskIcon
          src="/dashboard/icons/arrow-left-outline.svg"
          size={TEXT_BUTTON_LAYOUT[size].leftIcon}
        />
      </span>
    )
  }
  const rows = [
    ...(['xs', 'sm', 'md', 'lg'] as const).map((size) => ({
      label: size,
      size,
      underline: 'hover' as TextButtonUnderline,
      wrapped: false,
    })),
    {
      label: 'md · never',
      size: 'md' as const,
      underline: 'never' as TextButtonUnderline,
      wrapped: false,
    },
    {
      label: 'md · always',
      size: 'md' as const,
      underline: 'always' as TextButtonUnderline,
      wrapped: false,
    },
    {
      label: 'md · wrapped',
      size: 'md' as const,
      underline: 'never' as TextButtonUnderline,
      wrapped: true,
    },
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
            iconLeft={leftIcon(row.size, state)}
            disabled={state === 'disabled'}
            tabIndex={-1}
            aria-hidden
            style={pinned(state, row.underline, row.wrapped)}
          >
            View details
          </TextButton>
        )),
      }))}
      caption={`Each state is pinned using Figma's tokens. Focus is the blue text alone, as in Figma. Hover, press or tab to the examples above to see the real transitions.`}
    />
  )
}

function FlowButtonStates() {
  const rows: { label: string; variant: FlowButtonVariant; size: FlowButtonSize }[] = [
    { label: 'primary', variant: 'primary', size: 'sm' },
    { label: 'primary · 40px', variant: 'primary', size: 'md' },
    { label: 'secondary', variant: 'secondary', size: 'sm' },
    { label: 'tertiary', variant: 'tertiary', size: 'sm' },
  ]
  const pinned = (
    variant: FlowButtonVariant,
    size: FlowButtonSize,
    state: State,
  ): CSSProperties | undefined => {
    if (state === 'rest' || state === 'disabled') return undefined
    const spec =
      variant === 'primary' && state === 'focus' && size !== 'md'
        ? FLOW_PRIMARY_FOCUS_SMALL
        : FLOW_BUTTON_FIGMA[variant][state]
    const shadow = flowShadowStates(variant, size, 'left').includes(state)
      ? 'var(--shadow-flow-btn)'
      : 'none'
    return { ...specStyle({ ...spec, fg: spec.text }), boxShadow: shadow }
  }
  return (
    <StateTable
      columns={STATES}
      rows={rows.map((row) => ({
        label: row.label,
        cells: STATES.map((state) => (
          <FlowButton
            key={state}
            variant={row.variant}
            size={row.size}
            disabled={state === 'disabled'}
            tabIndex={-1}
            aria-hidden
            style={pinned(row.variant, row.size, state)}
          >
            Continue
          </FlowButton>
        )),
      }))}
      caption={`Each state is pinned using Figma's tokens. Hover, press or tab to the examples above to see the real transitions.`}
    />
  )
}

function LabelButtonStates() {
  const columns = ['rest', 'hover', 'selected', 'focus', 'disabled'] as const
  const pinned = (state: (typeof columns)[number]): CSSProperties | undefined =>
    state === 'hover' || state === 'focus'
      ? specStyle({ ...LABEL_BUTTON_FIGMA[state], fg: LABEL_BUTTON_FIGMA[state].text })
      : undefined
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
              style={pinned(state)}
            >
              Remote
            </LabelButton>
          )),
        },
      ]}
      caption="Each state is pinned using Figma's tokens. Focus is a blue border, as in Figma."
    />
  )
}

export { FlowButtonStates, IconButtonStates, LabelButtonStates, TextButtonStates }
