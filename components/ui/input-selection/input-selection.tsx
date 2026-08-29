'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'

import { HelperText, type HelperTextState } from '../input/helper-text'
import { ListItemDefault } from '../list/list-item-default'
import { ListItemMultiSelect } from '../list/list-item-multi-select'
import { Slots } from '../slots/slots'
import { Tag } from '../tags/tag'

import { SelectionField } from './selection-field'

interface SelectOption {
  value: string
  label: string
  /** Optional leading visual (e.g. a CountryFlag) shown in the trigger and rows. */
  icon?: ReactNode
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
  ...props
}: InputSelectionProps) {
  const generatedId = useId()
  const fieldId = externalId || generatedId
  const listboxId = `${fieldId}-listbox`
  const helperId = `${fieldId}-helper`
  const labelId = `${fieldId}-label`

  const wrapperRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
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

  // Flip the listbox above the trigger when there isn't enough room below,
  // but only if there's actually more room above — otherwise keep the default
  // (a short list near the bottom of a tall page shouldn't flip needlessly).
  useLayoutEffect(() => {
    if (!open || !wrapperRef.current) return
    const rect = wrapperRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const listboxSpace = 244 // max-h-[240px] + the 4px gap to the trigger
    setDropUp(spaceBelow < listboxSpace && spaceAbove > spaceBelow)
  }, [open])

  // Adjust state during render rather than in an effect — mounting on open
  // and clearing `visible` on close both need to happen before paint, not
  // after an effect runs.
  if (open && !mounted) setMounted(true)
  if (!open && visible) setVisible(false)

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
    <div ref={wrapperRef} className={`relative flex flex-col gap-[6px] ${className}`}>
      {showLabel && label && (
        <label
          id={labelId}
          htmlFor={fieldId}
          className="text-body-xs font-medium-550 text-text-secondary h-[9px] leading-none pl-[2px]"
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
        showPrefixIcon={showPrefixIcon}
        prefixIcon={prefixIcon}
        withSelection={withSelection}
        placeholder={placeholder}
        leadingVisual={
          !withSelection ? options.find((o) => o.value === selectedArray[0])?.icon : undefined
        }
        value={!withSelection ? (selectedArray[0] ? labelFor(selectedArray[0]) : '') : undefined}
        tags={
          withSelection
            ? selectedArray.map((v) => (
                <Tag key={v} label={labelFor(v)} removable onRemove={() => selectOption(v)} />
              ))
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
          className={`absolute z-10 left-0 right-0 max-h-[240px] transition-[opacity,transform] duration-150 ease-out motion-reduce:scale-100 motion-reduce:duration-100 ${dropUp ? 'bottom-full mb-[4px] origin-bottom' : 'top-full mt-[4px] origin-top'} ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.96]'}`}
        >
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            className="flex w-full flex-col gap-[2px]"
          >
            {options.map((opt) => {
              const isSelected = selectedArray.includes(opt.value)
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
                  onClick={() => selectOption(opt.value)}
                />
              )
            })}
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
