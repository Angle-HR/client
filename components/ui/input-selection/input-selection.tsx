'use client'

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react'

import { HelperText, type HelperTextState } from '../input/helper-text'
import { ListItemDefault } from '../list/list-item-default'
import { ListItemMultiSelect } from '../list/list-item-multi-select'
import { ListItemSelected } from '../list/list-item-selected'
import { Divider } from '../notification/divider'
import { Slots } from '../slots/slots'
import { Chip } from '../tags/chip'
import { Tag } from '../tags/tag'

import { SelectionField } from './selection-field'

interface SelectOption {
  value: string
  label: string
  /** Optional leading visual (e.g. a CountryFlag) shown in the trigger and rows. */
  icon?: ReactNode
  /** The visual on this option's chip, when it differs from `icon` (a smaller avatar, say). */
  chipIcon?: ReactNode
  /** Extra words a searchable field matches this option by, e.g. an abbreviation. */
  keywords?: string
}

interface InputSelectionProps {
  label?: string
  showLabel?: boolean
  helperText?: string
  helperState?: HelperTextState
  showHelper?: boolean
  errorText?: string
  size?: 'sm' | 'md'
  value?: string | string[]
  defaultValue?: string | string[]
  placeholder?: string
  options: SelectOption[]
  multiple?: boolean
  withSelection?: boolean
  onChange?: (value: string | string[]) => void
  showPrefixIcon?: boolean
  prefixIcon?: ReactNode
  disabled?: boolean
  required?: boolean
  name?: string
  id?: string
  'aria-label'?: string
  'aria-labelledby'?: string
  className?: string
  /** The field becomes a text box that filters the options as you type. */
  searchable?: boolean
  /** With `searchable`: typed text that matches no option can be added as one. */
  allowCustom?: boolean
  /**
   * How chosen values show in a multi-select: plain tags, or chips that carry
   * the option's icon (a person's avatar, say). With chips the prefix icon
   * gives way once something is chosen.
   */
  selectionStyle?: 'tag' | 'chip'
  /**
   * Puts a search box at the top of the list instead of in the field, with
   * this placeholder. For lists whose field shows chips.
   */
  listSearchPlaceholder?: string
  /** An action pinned under the options, e.g. "Create new team". */
  footerAction?: { label: string; icon?: ReactNode; onClick: () => void }
}

function InputSelection({
  label,
  showLabel = true,
  helperText,
  helperState = 'neutral',
  showHelper = true,
  errorText,
  size = 'md',
  value: controlledValue,
  defaultValue,
  placeholder = 'Select an option',
  options,
  multiple = false,
  withSelection = multiple,
  onChange,
  showPrefixIcon = false,
  prefixIcon,
  disabled,
  required,
  name,
  id: externalId,
  className = '',
  searchable = false,
  allowCustom = false,
  selectionStyle = 'tag',
  listSearchPlaceholder,
  footerAction,
  ...props
}: InputSelectionProps) {
  const generatedId = useId()
  const fieldId = externalId || generatedId
  const listboxId = `${fieldId}-listbox`
  const helperId = `${fieldId}-helper`
  const labelId = `${fieldId}-label`

  const wrapperRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropUp, setDropUp] = useState(false)
  // Mounted stays true slightly past `open=false` so the exit transition can
  // play — a plain `{open && ...}` unmounts before a CSS transition starts.
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue ?? (multiple ? [] : ''),
  )
  const value = controlledValue ?? internalValue

  const hasError = !!errorText
  const displayHelperState: HelperTextState = hasError ? 'error' : helperState
  const displayHelperText = hasError ? errorText : helperText

  const selectedArray = Array.isArray(value) ? value : value ? [value] : []
  const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? v
  // A multi-select without tags shows its choices elsewhere, so the field
  // itself never displays one.
  const showsValue = !withSelection && !multiple

  const term = searchable || listSearchPlaceholder ? query.trim().toLowerCase() : ''
  const shownOptions = term
    ? options.filter((o) => `${o.label} ${o.keywords ?? ''}`.toLowerCase().includes(term))
    : options
  // Typed text that is neither an option nor already chosen can be added.
  const customValue =
    allowCustom &&
    term &&
    !options.some((o) => o.label.toLowerCase() === term) &&
    !selectedArray.some((v) => v.toLowerCase() === term)
      ? query.trim()
      : ''

  // Flip the listbox above the trigger when there isn't enough room below,
  // but only if there's actually more room above — otherwise keep the default
  // (a short list near the bottom of a tall page shouldn't flip needlessly).
  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const listboxSpace = 253 // max-h-[249px] + the 4px gap to the trigger
    setDropUp(spaceBelow < listboxSpace && spaceAbove > spaceBelow)
  }, [open])

  // Adjust state during render rather than in an effect — mounting on open
  // and clearing `visible` on close both need to happen before paint, not
  // after an effect runs.
  if (open && !mounted) setMounted(true)
  if (!open && visible) setVisible(false)
  // What was typed only lasts while the list is open.
  if (!open && query) setQuery('')

  useEffect(() => {
    if (open) {
      // One frame so the enter transition starts from the closed state
      // rather than snapping straight to open (no-op on first paint).
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    }
    const timeout = setTimeout(() => setMounted(false), 150)
    return () => clearTimeout(timeout)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function commit(next: string | string[]) {
    if (controlledValue === undefined) setInternalValue(next)
    onChange?.(next)
  }

  function selectOption(optValue: string) {
    if (multiple) {
      const arr = selectedArray.includes(optValue)
        ? selectedArray.filter((v) => v !== optValue)
        : [...selectedArray, optValue]
      commit(arr)
    } else {
      commit(optValue)
      setOpen(false)
    }
    setQuery('')
  }

  function onSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      // Enter takes the best match; text that matches nothing is added as typed.
      const pick = (term ? shownOptions[0]?.value : undefined) ?? customValue
      if (pick) selectOption(pick)
    } else if (event.key === 'Backspace' && !query && withSelection && selectedArray.length) {
      commit(selectedArray.slice(0, -1))
    } else if (event.key === 'ArrowDown' && !open) {
      setOpen(true)
    }
  }

  const triggerState = disabled
    ? 'disabled'
    : hasError
      ? 'error'
      : open
        ? 'focus'
        : selectedArray.length
          ? 'filled'
          : 'placeholder'

  return (
    <div
      ref={wrapperRef}
      className={`relative flex flex-col gap-[6px] ${className}`}
      // Tabbing on to another control closes the list, as a click outside does.
      onBlur={(event) => {
        const next = event.relatedTarget
        if (next instanceof Node && !event.currentTarget.contains(next)) setOpen(false)
      }}
    >
      {showLabel && label && (
        <label
          id={labelId}
          htmlFor={fieldId}
          // Centred in its cap-height box, like LabelWrapper; a bare 12px line would hang low.
          className="flex h-[9px] items-center pl-[3px] text-body-xs leading-none font-medium-550 text-text-tertiary"
        >
          {label}
          {required && (
            <span className="text-text-error" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}

      <SelectionField
        id={fieldId}
        size={size}
        state={triggerState}
        showPrefixIcon={showPrefixIcon && !(selectionStyle === 'chip' && selectedArray.length > 0)}
        prefixIcon={prefixIcon}
        withSelection={withSelection}
        placeholder={placeholder}
        leadingVisual={
          showsValue ? options.find((o) => o.value === selectedArray[0])?.icon : undefined
        }
        value={
          withSelection
            ? undefined
            : showsValue && selectedArray[0]
              ? labelFor(selectedArray[0])
              : ''
        }
        search={
          searchable
            ? {
                // A closed single field shows its value; open, it shows what is typed.
                value:
                  open || !showsValue ? query : selectedArray[0] ? labelFor(selectedArray[0]) : '',
                onChange: (text) => {
                  setQuery(text)
                  setOpen(true)
                },
                onKeyDown: onSearchKeyDown,
                onFocus: () => setOpen(true),
                placeholder:
                  withSelection && selectedArray.length
                    ? undefined
                    : showsValue && selectedArray[0]
                      ? labelFor(selectedArray[0])
                      : placeholder,
                'aria-label': label,
              }
            : undefined
        }
        tags={
          withSelection
            ? selectedArray.map((v) => {
                const option = options.find((o) => o.value === v)
                const chipIcon = option?.chipIcon ?? option?.icon
                return selectionStyle === 'chip' ? (
                  <Chip
                    key={v}
                    label={labelFor(v)}
                    icon={chipIcon}
                    withIcon={Boolean(chipIcon)}
                    removable
                    onRemove={() => selectOption(v)}
                  />
                ) : (
                  <Tag key={v} label={labelFor(v)} removable onRemove={() => selectOption(v)} />
                )
              })
            : undefined
        }
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={props['aria-label']}
        aria-labelledby={showLabel && label ? labelId : props['aria-labelledby']}
        aria-invalid={hasError}
        aria-required={required}
        aria-describedby={showHelper || hasError ? helperId : undefined}
      />

      {mounted && (
        <Slots
          padding="tight"
          shadow="medium"
          scrollable
          // Figma's floating list is inset 5px, a pixel more than a tight slot.
          className={`absolute z-10 left-0 right-0 max-h-[249px] [&>div:first-child]:p-[5px]! transition-[opacity,transform] duration-150 ease-out motion-reduce:scale-100 motion-reduce:duration-100 ${dropUp ? 'bottom-full mb-[4px] origin-bottom' : 'top-full mt-[4px] origin-top'} ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'}`}
        >
          {listSearchPlaceholder ? (
            // Edge to edge across the list's 5px inset, with a hairline under it.
            <div className="-mx-[5px] -mt-[5px] mb-[4px] flex h-[36px] items-center border-b border-border-transparent-light px-[10px]">
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={listSearchPlaceholder}
                aria-label={listSearchPlaceholder}
                autoComplete="off"
                className="w-full bg-transparent text-body-m leading-21 text-text-primary outline-none placeholder:text-text-tertiary"
              />
            </div>
          ) : null}
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            className="flex w-full flex-col gap-[2px]"
          >
            {shownOptions.map((opt) => {
              const isSelected = selectedArray.includes(opt.value)
              // With chips, a chosen row is ticked at its right rather than
              // carrying a tick box, and keeps its own visual (an avatar).
              if (multiple && selectionStyle === 'chip') {
                return (
                  <ListItemSelected
                    className="w-full!"
                    key={opt.value}
                    mainText={opt.label}
                    icon={opt.icon}
                    withIcon={Boolean(opt.icon)}
                    selected={isSelected}
                    onClick={() => selectOption(opt.value)}
                  />
                )
              }
              return multiple ? (
                <ListItemMultiSelect
                  key={opt.value}
                  mainText={opt.label}
                  selected={isSelected}
                  withCheckbox
                  onChange={() => selectOption(opt.value)}
                />
              ) : (
                <ListItemDefault
                  className="w-full!"
                  key={opt.value}
                  mainText={opt.label}
                  withIcon={false}
                  leadingVisual={opt.icon}
                  state={isSelected ? 'hover' : 'rest'}
                  selected={isSelected}
                  onClick={() => selectOption(opt.value)}
                />
              )
            })}
            {customValue ? (
              <ListItemDefault
                className="w-full!"
                mainText={`Add “${customValue}”`}
                withIcon={false}
                onClick={() => selectOption(customValue)}
              />
            ) : null}
            {shownOptions.length === 0 && !customValue ? (
              <li className="px-[6px] py-[6px] text-body-s text-text-tertiary">No matches</li>
            ) : null}
            {footerAction ? (
              <>
                <li role="presentation" className="-mx-[5px] h-px">
                  <Divider />
                </li>
                <ListItemDefault
                  className="w-full!"
                  mainText={footerAction.label}
                  icon={footerAction.icon}
                  withIcon={!!footerAction.icon}
                  onClick={() => {
                    setOpen(false)
                    footerAction.onClick()
                  }}
                />
              </>
            ) : null}
          </ul>
        </Slots>
      )}

      {name &&
        (Array.isArray(value) ? (
          value.map((v) => <input key={v} type="hidden" name={`${name}[]`} value={v} />)
        ) : (
          <input type="hidden" name={name} value={value} />
        ))}

      {(showHelper || hasError) && displayHelperText && (
        <HelperText id={helperId} state={displayHelperState}>
          {displayHelperText}
        </HelperText>
      )}
    </div>
  )
}

export { InputSelection }
export type { InputSelectionProps, SelectOption }
