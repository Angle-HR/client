'use client'

import { useState, type ReactNode } from 'react'

import { DashboardIcon } from '@/components/dashboard/nav-config'
import { Floating, clampLeft, toAnchor } from '@/components/jobs/floating'
import { JOB_STATUS_META } from '@/components/jobs/job-status'
import { PersonAvatar } from '@/components/jobs/person-avatar'
import {
  FILTER_FIELDS,
  FILTER_FIELD_ORDER,
  SORT_FIELDS,
  SORT_FIELD_ORDER,
  filterOptions,
  summariseValues,
} from '@/lib/jobs/filters'

import type { AnchorRect } from '@/components/jobs/floating'
import type {
  FilterField,
  FilterOperator,
  FilterOption,
  JobFilter,
  JobSort,
  SortDirection,
} from '@/lib/jobs/filters'
import type { Job } from '@/lib/jobs/types'

/**
 * Filter and sort controls for the jobs list. Figma: "Search, Filtering and
 * Sorting" (8440:566101) — the Filter and Sort menus, the value and operator
 * pickers, and the chip row that appears under the search field once a filter
 * or sort is set.
 */

/** Which popover is open, and what it is anchored to. */
type FilterPopover =
  | { type: 'filter-menu'; anchor: AnchorRect; align: 'left' | 'right' }
  | { type: 'sort-menu'; anchor: AnchorRect }
  | { type: 'values'; index: number; anchor: AnchorRect }
  | { type: 'operator'; index: number; anchor: AnchorRect }
  | { type: 'direction'; anchor: AnchorRect }

// The floating panel every picker shares: 220px, hairline, 10/12 radii.
const panel = 'w-[220px] rounded-t-lg-10 rounded-b-lg-12 px-px pt-px pb-[5px] shadow-md'
const rowBase =
  'group flex h-[32px] w-full cursor-pointer items-center gap-[6px] rounded-sm-8 pr-[8px] pl-[6px] text-left transition-colors hover:bg-bg-transparent-light focus-visible:bg-bg-transparent-light focus-visible:outline-none'
const rowText =
  'min-w-0 flex-1 truncate text-body-s leading-19_5 text-text-secondary group-hover:text-text-primary group-focus-visible:text-text-primary'
const hairline = 'border-b border-border-transparent-light'

/** Below the trigger, right edges aligned — where the design hangs the Filter and Sort menus. */
const belowRight = (anchor: AnchorRect) => (size: { width: number }) => ({
  top: anchor.bottom + 3,
  left: clampLeft(anchor.right - size.width, size.width),
})

/** Below the trigger, left edges aligned. */
const belowLeft = (anchor: AnchorRect) => (size: { width: number }) => ({
  top: anchor.bottom + 2,
  left: clampLeft(anchor.left, size.width),
})

function PanelHeader({
  title,
  icon,
  iconLabel,
  onIconClick,
}: {
  title: string
  icon: string
  iconLabel: string
  onIconClick: () => void
}) {
  return (
    <div className={`flex h-[33px] shrink-0 items-center gap-[4px] p-[4px] ${hairline}`}>
      <button
        type="button"
        aria-label={iconLabel}
        onClick={onIconClick}
        className="inline-flex size-[24px] cursor-pointer items-center justify-center rounded-sm-7 text-text-tertiary transition-colors hover:bg-bg-transparent-light hover:text-text-primary"
      >
        <DashboardIcon name={icon} size={14} />
      </button>
      <span className="min-w-0 flex-1 truncate text-body-s leading-19_5 font-medium text-text-primary">
        {title}
      </span>
    </div>
  )
}

/** The tick box inside an option row. Drawn, not an input: the row is the control. */
function CheckMark({ checked }: { checked: boolean }) {
  // Rows space their icon 6px from the label; a tick box sits 8px away.
  return (
    <span
      aria-hidden="true"
      className={`mr-[2px] flex size-[14px] shrink-0 items-center justify-center rounded-sm-5 transition-colors ${checked ? 'bg-bg-selection-controls-selected text-white' : 'border border-border-selection-controls-rest'}`}
    >
      {checked ? <DashboardIcon name="check-outline" size={12} /> : null}
    </span>
  )
}

function OptionVisual({ option, onChip = false }: { option: FilterOption; onChip?: boolean }) {
  if (option.status) {
    return (
      <span className={`inline-flex ${JOB_STATUS_META[option.status].iconClass}`}>
        <DashboardIcon name={JOB_STATUS_META[option.status].icon} size={14} />
      </span>
    )
  }
  if (option.avatarColour) {
    return (
      <PersonAvatar
        person={{ name: option.label, colour: option.avatarColour, avatarUrl: option.avatarUrl }}
        size={onChip ? 14 : 16}
        circular={onChip}
      />
    )
  }
  return null
}

interface OptionsListProps {
  field: FilterField
  options: FilterOption[]
  values: string[]
  onChange: (values: string[]) => void
}

/** Search box, "Select all" and the tick-list of values for one field. */
function OptionsList({ field, options, values, onChange }: OptionsListProps) {
  const [query, setQuery] = useState('')
  const config = FILTER_FIELDS[field]
  const term = query.trim().toLowerCase()
  const shown = term
    ? options.filter((option) => option.label.toLowerCase().includes(term))
    : options
  const allSelected = shown.length > 0 && shown.every((option) => values.includes(option.value))

  function toggle(value: string) {
    onChange(values.includes(value) ? values.filter((v) => v !== value) : [...values, value])
  }

  function toggleAll() {
    const shownValues = shown.map((option) => option.value)
    onChange(
      allSelected
        ? values.filter((value) => !shownValues.includes(value))
        : [...new Set([...values, ...shownValues])],
    )
  }

  return (
    <>
      {config.searchable ? (
        <div className={`flex h-[36px] shrink-0 items-center px-[10px] ${hairline}`}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`${config.label.replace('…', '')}…`}
            aria-label={`Search ${config.label}`}
            className="w-full bg-transparent text-body-m leading-21 text-text-primary outline-none placeholder:text-text-tertiary"
          />
        </div>
      ) : null}
      <ul
        role="listbox"
        aria-multiselectable="true"
        aria-label={config.label}
        className="flex max-h-[304px] flex-col gap-[2px] overflow-y-auto px-[4px] pt-[4px]"
      >
        {config.searchable && shown.length > 1 ? (
          <li role="none">
            <button
              type="button"
              role="option"
              aria-selected={allSelected}
              onClick={toggleAll}
              className={rowBase}
            >
              <CheckMark checked={allSelected} />
              <span className={rowText}>Select all</span>
            </button>
          </li>
        ) : null}
        {shown.map((option) => {
          const checked = values.includes(option.value)
          return (
            <li key={option.value} role="none">
              <button
                type="button"
                role="option"
                aria-selected={checked}
                onClick={() => toggle(option.value)}
                className={`${rowBase} ${checked ? 'bg-bg-transparent-light' : ''}`}
              >
                <CheckMark checked={checked} />
                <span className="flex min-w-0 flex-1 items-center gap-[6px]">
                  <OptionVisual option={option} />
                  <span className={rowText}>{option.label}</span>
                </span>
              </button>
            </li>
          )
        })}
        {shown.length === 0 ? (
          <li className="px-[6px] py-[8px] text-body-s leading-19_5 text-text-tertiary">
            No matches
          </li>
        ) : null}
      </ul>
    </>
  )
}

interface FilterMenuProps {
  jobs: Job[]
  filters: JobFilter[]
  anchor: AnchorRect
  align: 'left' | 'right'
  onChange: (filters: JobFilter[]) => void
  onClose: () => void
}

/** The "Filter" menu: pick a field, then tick its values. Long lists replace the menu; short fixed ones (status, employment type) fly out beside it. */
function FilterMenu({ jobs, filters, anchor, align, onChange, onClose }: FilterMenuProps) {
  const [field, setField] = useState<FilterField | null>(null)
  const [query, setQuery] = useState('')
  const [flyout, setFlyout] = useState<{ field: FilterField; top: number } | null>(null)
  const place = align === 'right' ? belowRight(anchor) : belowLeft(anchor)
  const current = field ? filters.find((filter) => filter.field === field) : undefined

  function setValues(target: FilterField, values: string[]) {
    const existing = filters.find((filter) => filter.field === target)
    if (existing) {
      // Unticking the last value removes the filter rather than leaving an empty chip.
      onChange(
        values.length === 0
          ? filters.filter((filter) => filter.field !== target)
          : filters.map((filter) => (filter.field === target ? { ...filter, values } : filter)),
      )
    } else if (values.length > 0) {
      onChange([...filters, { field: target, operator: 'is', values }])
    }
  }

  function toggleValue(target: FilterField, value: string) {
    const values = filters.find((filter) => filter.field === target)?.values ?? []
    setValues(
      target,
      values.includes(value) ? values.filter((v) => v !== value) : [...values, value],
    )
  }

  const term = query.trim().toLowerCase()
  const fields = FILTER_FIELD_ORDER.filter((key) =>
    FILTER_FIELDS[key].label.toLowerCase().includes(term),
  )
  const flyoutValues = flyout
    ? (filters.find((filter) => filter.field === flyout.field)?.values ?? [])
    : []

  return (
    <Floating
      anchor={anchor}
      place={place}
      // `fixed` already anchors the absolutely placed flyout below.
      className={panel}
      onClose={onClose}
      focusFirstItem={false}
    >
      {field ? (
        <>
          <PanelHeader
            title={FILTER_FIELDS[field].label.replace('…', '')}
            icon="chevron-left-outline"
            iconLabel="Back to filters"
            onIconClick={() => setField(null)}
          />
          <div
            className={`flex h-[22px] shrink-0 items-center px-[8px] text-caption-s leading-none font-medium text-text-tertiary ${hairline}`}
          >
            {FILTER_FIELDS[field].operatorLabel}
          </div>
          <OptionsList
            field={field}
            options={filterOptions(jobs, field)}
            values={current?.values ?? []}
            onChange={(values) => setValues(field, values)}
          />
        </>
      ) : (
        <>
          <PanelHeader
            title="Filter"
            icon="x-mark-outline"
            iconLabel="Close"
            onIconClick={onClose}
          />
          <div className={`flex h-[36px] shrink-0 items-center px-[10px] ${hairline}`}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by…"
              aria-label="Find a filter"
              className="w-full bg-transparent text-body-m leading-21 text-text-primary outline-none placeholder:text-text-tertiary"
            />
          </div>
          <ul
            role="menu"
            aria-label="Filter by"
            className="flex flex-col gap-[2px] px-[4px] pt-[4px]"
          >
            {fields.map((key) => {
              const config = FILTER_FIELDS[key]
              const count = filters.find((filter) => filter.field === key)?.values.length ?? 0
              const open = flyout?.field === key
              // The flyout hangs 6px above its row, measured from the panel.
              const openFlyout = (row: HTMLElement) => {
                const panelTop = row.closest('.fixed')?.getBoundingClientRect().top ?? 0
                setFlyout({ field: key, top: row.getBoundingClientRect().top - panelTop - 6 })
              }
              return (
                <li key={key} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup={config.flyout ? 'menu' : undefined}
                    aria-expanded={config.flyout ? open : undefined}
                    onMouseEnter={(event) =>
                      config.flyout ? openFlyout(event.currentTarget) : setFlyout(null)
                    }
                    onFocus={(event) =>
                      config.flyout ? openFlyout(event.currentTarget) : setFlyout(null)
                    }
                    onClick={(event) =>
                      config.flyout ? openFlyout(event.currentTarget) : setField(key)
                    }
                    className={`${rowBase} ${open ? 'bg-bg-transparent-light' : ''}`}
                  >
                    <span
                      className={`inline-flex ${open ? 'text-text-secondary' : 'text-text-tertiary'}`}
                    >
                      <DashboardIcon name={config.icon} size={14} />
                    </span>
                    <span className={rowText}>{config.label}</span>
                    {count > 0 ? (
                      <span className="text-caption-s leading-none font-medium text-text-primary">
                        {count}
                      </span>
                    ) : null}
                    {config.flyout ? null : (
                      <span className="inline-flex text-text-light">
                        <DashboardIcon name="chevron-right-solid" size={14} />
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
            {fields.length === 0 ? (
              <li className="px-[6px] py-[8px] text-body-s leading-19_5 text-text-tertiary">
                No matches
              </li>
            ) : null}
          </ul>

          {flyout ? (
            <ul
              role="menu"
              aria-label={FILTER_FIELDS[flyout.field].label}
              style={{ top: flyout.top }}
              className="absolute right-full flex w-[165px] flex-col gap-[2px] rounded-t-lg-10 rounded-b-lg-12 bg-bg-secondary p-[5px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
            >
              {filterOptions(jobs, flyout.field).map((option) => {
                const checked = flyoutValues.includes(option.value)
                return (
                  <li key={option.value} role="none">
                    <button
                      type="button"
                      role="menuitemcheckbox"
                      aria-checked={checked}
                      onClick={() => toggleValue(flyout.field, option.value)}
                      className={`${rowBase} ${checked ? 'bg-bg-transparent-light' : ''}`}
                    >
                      {option.status ? (
                        <span
                          className={`inline-flex ${checked ? 'text-text-secondary' : 'text-text-tertiary'}`}
                        >
                          <DashboardIcon name={JOB_STATUS_META[option.status].icon} size={14} />
                        </span>
                      ) : null}
                      <span className={rowText}>{option.label}</span>
                      {checked ? (
                        <span className="inline-flex text-text-secondary">
                          <DashboardIcon name="check-outline" size={14} />
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </>
      )}
    </Floating>
  )
}

interface SortMenuProps {
  sort: JobSort | null
  anchor: AnchorRect
  onChange: (sort: JobSort | null) => void
  onClose: () => void
}

function DirectionRows({
  direction,
  onPick,
}: {
  direction: SortDirection | null
  onPick: (d: SortDirection) => void
}) {
  const rows: { value: SortDirection; label: string; icon: string }[] = [
    { value: 'asc', label: 'Ascending Order', icon: 'bars-arrow-up-solid' },
    { value: 'desc', label: 'Descending Order', icon: 'bars-arrow-down-solid' },
  ]
  return (
    <>
      {rows.map((row) => (
        <li key={row.value} role="none">
          <button
            type="button"
            role="menuitemradio"
            aria-checked={direction === row.value}
            onClick={() => onPick(row.value)}
            className={rowBase}
          >
            <span className="inline-flex text-text-tertiary">
              <DashboardIcon name={row.icon} size={14} />
            </span>
            <span className={rowText}>{row.label}</span>
            {direction === row.value ? (
              <span className="inline-flex text-text-secondary">
                <DashboardIcon name="check-outline" size={14} />
              </span>
            ) : null}
          </button>
        </li>
      ))}
    </>
  )
}

/** The "Sort by" menu: a field list, then the direction. */
function SortMenu({ sort, anchor, onChange, onClose }: SortMenuProps) {
  return (
    <Floating
      anchor={anchor}
      place={belowRight(anchor)}
      className={panel}
      onClose={onClose}
      focusFirstItem={false}
    >
      <PanelHeader title="Sort by" icon="x-mark-outline" iconLabel="Close" onIconClick={onClose} />
      <ul role="menu" aria-label="Sort by" className="flex flex-col gap-[2px] px-[4px] pt-[4px]">
        {SORT_FIELD_ORDER.map((key) => {
          const active = sort?.field === key
          return (
            <li key={key} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => onChange({ field: key, direction: sort?.direction ?? 'asc' })}
                className={`${rowBase} ${active ? 'bg-bg-transparent-light' : ''}`}
              >
                <span
                  className={`inline-flex ${active ? 'text-text-secondary' : 'text-text-tertiary'}`}
                >
                  <DashboardIcon name={SORT_FIELDS[key].icon} size={14} />
                </span>
                <span className={rowText}>{SORT_FIELDS[key].label}</span>
              </button>
            </li>
          )
        })}
        <li
          role="separator"
          className="mx-[-4px] -mt-[2px] mb-[2px] h-px bg-border-transparent-light"
        />
        <DirectionRows
          direction={sort?.direction ?? null}
          onPick={(direction) => onChange({ field: sort?.field ?? 'datePosted', direction })}
        />
      </ul>
    </Floating>
  )
}

// One segment of a chip: 22px tall inside the chip's 1px border.
const segment =
  'flex h-[22px] shrink-0 items-center gap-[2px] px-[6px] text-body-s leading-19_5 text-text-secondary'
const segmentButton = `${segment} cursor-pointer transition-colors hover:bg-bg-transparent-lighter hover:text-text-primary`
const chip =
  'flex h-[24px] shrink-0 items-stretch divide-x divide-border-light overflow-hidden rounded-sm-7 border border-border-light bg-bg-secondary'

function RemoveSegment({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`${segmentButton} w-[24px] justify-center`}
    >
      <DashboardIcon name="x-mark-outline" size={12} />
    </button>
  )
}

interface FilterBarProps {
  jobs: Job[]
  filters: JobFilter[]
  sort: JobSort | null
  onFiltersChange: (filters: JobFilter[]) => void
  onSortChange: (sort: JobSort | null) => void
  onOpen: (popover: FilterPopover) => void
}

/** The chip row under the search field. Renders nothing until a filter or sort is set. */
function FilterBar({
  jobs,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onOpen,
}: FilterBarProps): ReactNode {
  if (filters.length === 0 && !sort) return null

  return (
    <div className="flex items-start gap-[12px]">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-[8px]">
        {sort ? (
          <>
            <div className={chip}>
              <button
                type="button"
                aria-haspopup="menu"
                onClick={(event) =>
                  onOpen({
                    type: 'direction',
                    anchor: toAnchor(event.currentTarget.getBoundingClientRect()),
                  })
                }
                className={`${segmentButton} gap-[4px]`}
              >
                <span className="inline-flex text-text-tertiary">
                  <DashboardIcon
                    name={
                      sort.direction === 'asc' ? 'bars-arrow-up-solid' : 'bars-arrow-down-solid'
                    }
                    size={14}
                  />
                </span>
                {SORT_FIELDS[sort.field].label}
              </button>
              <RemoveSegment label="Remove sort" onClick={() => onSortChange(null)} />
            </div>
            {filters.length > 0 ? (
              <span aria-hidden="true" className="h-[12px] w-[1.5px] shrink-0 bg-border-light" />
            ) : null}
          </>
        ) : null}

        {filters.map((filter, index) => {
          const config = FILTER_FIELDS[filter.field]
          const options = filterOptions(jobs, filter.field)
          const only =
            filter.values.length === 1
              ? options.find((option) => option.value === filter.values[0])
              : undefined
          const people = options.filter(
            (option) => option.avatarColour && filter.values.includes(option.value),
          )
          return (
            <div key={filter.field} className={chip}>
              <span className={segment}>
                <span className="inline-flex text-text-tertiary">
                  <DashboardIcon name={config.icon} size={14} />
                </span>
                {config.chipLabel}
              </span>
              <button
                type="button"
                aria-haspopup="menu"
                aria-label={`Change condition for ${config.label}`}
                onClick={(event) =>
                  onOpen({
                    type: 'operator',
                    index,
                    anchor: toAnchor(event.currentTarget.getBoundingClientRect()),
                  })
                }
                className={`${segmentButton} text-text-tertiary`}
              >
                {filter.operator === 'is'
                  ? config.operatorLabel
                  : filter.operator === 'and'
                    ? 'and'
                    : `not ${config.operatorLabel}`}
              </button>
              <button
                type="button"
                aria-haspopup="listbox"
                onClick={(event) =>
                  onOpen({
                    type: 'values',
                    index,
                    anchor: toAnchor(event.currentTarget.getBoundingClientRect()),
                  })
                }
                className={`${segmentButton} ${people.length > 0 ? 'gap-[3px]' : ''}`}
              >
                {/* One value shows its own avatar or status glyph; several
                    people show as a stack of two with a "more" tile. */}
                {only ? <OptionVisual option={only} onChip /> : null}
                {!only && people.length > 0 ? (
                  <span className="inline-flex items-center">
                    {people.slice(0, 2).map((person, i) => (
                      <span
                        key={person.value}
                        className={i === 0 ? 'inline-flex' : '-ml-[4px] inline-flex'}
                      >
                        <OptionVisual option={person} onChip />
                      </span>
                    ))}
                    {people.length > 2 ? (
                      <span className="-ml-[4px] inline-flex size-[14px] items-center justify-center rounded-full bg-bg-avatar-blue text-text-avatar-blue outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-light">
                        <DashboardIcon name="ellipsis-horizontal-solid" size={10} />
                      </span>
                    ) : null}
                  </span>
                ) : null}
                {summariseValues(options, filter.values)}
              </button>
              <RemoveSegment
                label={`Remove ${config.label} filter`}
                onClick={() => onFiltersChange(filters.filter((_, i) => i !== index))}
              />
            </div>
          )
        })}

        <button
          type="button"
          aria-haspopup="menu"
          onClick={(event) =>
            onOpen({
              type: 'filter-menu',
              align: 'left',
              anchor: toAnchor(event.currentTarget.getBoundingClientRect()),
            })
          }
          className="flex h-[22px] shrink-0 cursor-pointer items-center gap-[2px] rounded-sm-6 px-[6px] text-body-xs leading-19_2 text-text-secondary transition-colors hover:bg-bg-transparent-light hover:text-text-primary"
        >
          <DashboardIcon name="plus-outline" size={10} />
          Add filter
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          onFiltersChange([])
          onSortChange(null)
        }}
        className="flex h-[22px] shrink-0 cursor-pointer items-center rounded-sm-6 px-[6px] text-body-xs leading-19_2 text-text-secondary transition-colors hover:bg-bg-transparent-light hover:text-text-primary"
      >
        Clear
      </button>
    </div>
  )
}

interface FilterPopoversProps {
  popover: FilterPopover | null
  jobs: Job[]
  filters: JobFilter[]
  sort: JobSort | null
  onFiltersChange: (filters: JobFilter[]) => void
  onSortChange: (sort: JobSort | null) => void
  onClose: () => void
}

/** Renders whichever filter or sort popover is open. */
function FilterPopovers({
  popover,
  jobs,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  onClose,
}: FilterPopoversProps): ReactNode {
  if (!popover) return null

  if (popover.type === 'filter-menu') {
    return (
      <FilterMenu
        jobs={jobs}
        filters={filters}
        anchor={popover.anchor}
        align={popover.align}
        onChange={onFiltersChange}
        onClose={onClose}
      />
    )
  }

  if (popover.type === 'sort-menu') {
    return (
      <SortMenu sort={sort} anchor={popover.anchor} onChange={onSortChange} onClose={onClose} />
    )
  }

  if (popover.type === 'direction') {
    return (
      <Floating
        anchor={popover.anchor}
        place={belowLeft(popover.anchor)}
        className={`${panel} pt-[5px]`}
        onClose={onClose}
      >
        <ul
          role="menu"
          aria-label="Sort direction"
          className="flex flex-col gap-[2px] px-[4px] pt-[4px]"
        >
          <DirectionRows
            direction={sort?.direction ?? null}
            onPick={(direction) => {
              if (sort) onSortChange({ ...sort, direction })
              onClose()
            }}
          />
        </ul>
      </Floating>
    )
  }

  const filter = filters[popover.index]
  if (!filter) return null
  const update = (patch: Partial<JobFilter>) =>
    onFiltersChange(filters.map((f, i) => (i === popover.index ? { ...f, ...patch } : f)))

  if (popover.type === 'operator') {
    const config = FILTER_FIELDS[filter.field]
    // The design lists six conditions. "By", "To" and "On" are the plain
    // match under each field's own preposition, so they behave as "Is".
    const operators: { key: string; value: FilterOperator; label: string }[] = [
      { key: 'is', value: 'is', label: 'Is' },
      { key: 'isNot', value: 'isNot', label: 'Is not' },
      { key: 'and', value: 'and', label: 'And' },
      { key: 'by', value: 'is', label: 'By' },
      { key: 'to', value: 'is', label: 'To' },
      { key: 'on', value: 'is', label: 'On' },
    ]
    const activeKey =
      filter.operator === 'is'
        ? (operators.find((o) => o.label.toLowerCase() === config.operatorLabel)?.key ?? 'is')
        : filter.operator
    return (
      <Floating
        anchor={popover.anchor}
        place={belowLeft(popover.anchor)}
        className={`${panel} pt-[5px]`}
        onClose={onClose}
      >
        <ul
          role="menu"
          aria-label="Condition"
          className="flex flex-col gap-[2px] px-[4px] pt-[4px]"
        >
          {operators.map((operator) => (
            <li key={operator.key} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={activeKey === operator.key}
                onClick={() => {
                  update({ operator: operator.value })
                  onClose()
                }}
                className={rowBase}
              >
                <span className={rowText}>{operator.label}</span>
                {activeKey === operator.key ? (
                  <span className="inline-flex text-text-secondary">
                    <DashboardIcon name="check-outline" size={14} />
                  </span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </Floating>
    )
  }

  return (
    <Floating
      anchor={popover.anchor}
      place={belowLeft(popover.anchor)}
      className={panel}
      onClose={onClose}
      focusFirstItem={false}
    >
      <OptionsList
        field={filter.field}
        options={filterOptions(jobs, filter.field)}
        values={filter.values}
        onChange={(values) => {
          // Unticking the last value removes the chip and closes the picker.
          if (values.length === 0) {
            onFiltersChange(filters.filter((_, i) => i !== popover.index))
            onClose()
          } else update({ values })
        }}
      />
    </Floating>
  )
}

export { FilterBar, FilterPopovers }
export type { FilterPopover }
