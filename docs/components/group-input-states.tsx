'use client'

// States grids for the group input, drawn from group-input.figma.ts. Each cell
// is the real component; hover and focus are pinned with Figma's tokens.
import {
  GroupInputField,
  GroupInputLeftCurrency,
  GroupInputLeftFlag,
  GroupInputLeftText,
  GroupInputRightText,
} from '@/components/ui/group-input'
import {
  GROUP_FIELD_LAYOUT,
  GROUP_FIELD_STATES,
  type GroupFieldState,
  type GroupInputSize,
} from '@/components/ui/group-input/group-input.figma'
import {
  GROUP_SELECTION_LAYOUT,
  GROUP_SELECTION_STATES,
} from '@/components/ui/group-input/group-selection.figma'
import { MaskIcon } from '@/components/ui/icons/mask-icon'
import { SelectionField } from '@/components/ui/input-selection/selection-field'
import { Tag } from '@/components/ui/tags/tag'

import { StateTable } from './state-table'

import type { SelectionState } from '@/components/ui/input-selection/selection-field.figma'

const SIZES: GroupInputSize[] = ['sm', 'md', 'lg']
const STATES = Object.keys(GROUP_FIELD_STATES) as GroupFieldState[]
const column = (s: GroupInputSize) => `${GROUP_FIELD_LAYOUT[s].height}px · ${s}`

const icon = (name: string, size: number) => (
  <MaskIcon src={`/dashboard/icons/${name}.svg`} size={size} />
)

// Pinned states: the classes the field gets on real hover and focus.
const PIN: Partial<Record<GroupFieldState, string>> = {
  hover: 'bg-bg-input-hover! border-border-input-hover!',
  focus:
    'bg-bg-input-focus! border-border-input-focus! [&>span:first-child]:text-text-input-focus!',
}
const PANEL_HOVER = 'bg-bg-input-hover-group-items! border-border-input-hover-group-items!'

function GroupFieldStates() {
  return (
    <StateTable
      columns={SIZES.map(column)}
      rows={STATES.map((state) => ({
        label: state,
        cells: SIZES.map((size) => {
          const px = GROUP_FIELD_LAYOUT[size].icon
          const typed = state === 'focus' || state === 'filled' || state === 'error'
          return (
            <div key={size} className="flex w-[200px]">
              <GroupInputLeftFlag countryCode="NG" size={size} tabIndex={-1} />
              <GroupInputField
                size={size}
                aria-label={`${state} ${size}`}
                className={PIN[state] ?? ''}
                placeholder="Title"
                defaultValue={typed ? 'Title' : undefined}
                readOnly
                tabIndex={-1}
                disabled={state === 'disabled'}
                aria-invalid={state === 'error'}
                prefixIcon={icon('bell-outline', px)}
                suffix="icon"
                suffixIcon={icon('information-circle-outline', px)}
              />
            </div>
          )
        }),
      }))}
      caption="Every field state at every height, as in Figma, here with a flag panel on the left. Hover and focus are pinned; hover over or Tab to the examples above to see them for real. Hover only shows on an empty field."
    />
  )
}

function GroupFieldSuffixes() {
  return (
    <StateTable
      columns={SIZES.map(column)}
      rows={(['none', 'icon', 'button'] as const).map((suffix) => ({
        label: suffix,
        cells: SIZES.map((size) => {
          const px = GROUP_FIELD_LAYOUT[size].icon
          return (
            <div key={size} className="flex w-[200px]">
              <GroupInputLeftText text="https://" size={size} />
              <GroupInputField
                size={size}
                aria-label={`${suffix} suffix ${size}`}
                placeholder="Title"
                readOnly
                tabIndex={-1}
                suffix={suffix}
                suffixIcon={icon('information-circle-outline', px)}
                suffixButton={{ icon: icon('eye-slash-outline', 14), 'aria-label': 'Show' }}
              />
            </div>
          )
        }),
      }))}
      caption="The three suffixes. The button is the light Icon Button: 24px in the 25px field, 32px in the others."
    />
  )
}

function GroupPanelStates() {
  const panels = (size: GroupInputSize, hover: boolean) => (
    <div key={size} className="flex flex-col items-start gap-8">
      <GroupInputLeftCurrency
        value="USD"
        size={size}
        tabIndex={-1}
        className={hover ? PANEL_HOVER : ''}
      />
      <GroupInputLeftFlag
        countryCode="NG"
        size={size}
        tabIndex={-1}
        className={hover ? PANEL_HOVER : ''}
      />
      <GroupInputLeftText text="https://" size={size} className={hover ? PANEL_HOVER : ''} />
      <GroupInputRightText text="yourdomain.com" size={size} className={hover ? PANEL_HOVER : ''} />
    </div>
  )
  return (
    <StateTable
      columns={SIZES.map(column)}
      rows={[
        { label: 'rest', cells: SIZES.map((s) => panels(s, false)) },
        { label: 'hover', cells: SIZES.map((s) => panels(s, true)) },
      ]}
      caption="The four panels: Currency, Flag and Left text go before the field, Right text after it. Hover is pinned here."
    />
  )
}

const SELECTION_STATES = Object.keys(GROUP_SELECTION_STATES) as SelectionState[]
const selectionColumn = (s: GroupInputSize) => `${GROUP_SELECTION_LAYOUT[s].height}px · ${s}`

function GroupSelectionStates({ withSelection = false }: { withSelection?: boolean }) {
  return (
    <StateTable
      columns={SIZES.map(selectionColumn)}
      rows={SELECTION_STATES.map((state) => ({
        label: state,
        cells: SIZES.map((size) => {
          const px = GROUP_SELECTION_LAYOUT[size].icon
          // Figma: only the Place holder variant is empty; the rest show a value or tags.
          const empty = state === 'placeholder'
          return (
            <div key={size} className="flex w-[220px]">
              <GroupInputLeftFlag countryCode="NG" size={size} tabIndex={-1} />
              <SelectionField
                size={size}
                groupPosition="right"
                state={state}
                disabled={state === 'disabled'}
                tabIndex={-1}
                aria-label={`${state} ${size}`}
                placeholder="Search for an option..."
                showPrefixIcon={!withSelection}
                prefixIcon={icon('bell-outline', px)}
                value={withSelection || empty ? undefined : 'Lagos'}
                withSelection={withSelection}
                tags={
                  withSelection && !empty
                    ? [
                        <Tag key="a" label="Tag" color="aqua" />,
                        <Tag key="b" label="Tag" color="green" />,
                        <Tag key="c" label="+4" color="green" />,
                      ]
                    : undefined
                }
              />
            </div>
          )
        }),
      }))}
      caption={
        withSelection
          ? 'With selection, as in Figma: Aqua and Green Large tags 2px apart, no prefix icon. Empty, the text is a darker grey than the plain placeholder.'
          : 'Every state at every height, here after a flag panel (right corners round). Hover and focus are pinned; hover over or open the examples above to see them for real.'
      }
    />
  )
}

export { GroupFieldStates, GroupFieldSuffixes, GroupPanelStates, GroupSelectionStates }
