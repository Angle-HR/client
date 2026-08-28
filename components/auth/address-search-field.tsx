'use client'

import { useEffect, useRef, useState } from 'react'

import { ListItemLocation, TextInput } from '@/components/ui'

import type { ProductAddressSuggestion } from '@/lib/types'

/** Long enough that a first keystroke doesn't fire a lookup on its own. */
const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

interface AddressSearchFieldProps {
  label: string
  value: string
  placeholder?: string
  errorText?: string
  disabled?: boolean
  onChange: (value: string) => void
  /** Runs per settled keystroke; the caller does the network call. */
  onSearch: (query: string) => Promise<ProductAddressSuggestion[]>
  onSelect: (suggestion: ProductAddressSuggestion) => void
}

/**
 * Address input with a suggestion list underneath, opened on focus and refreshed
 * as the person types. The list stays open with a hint before there is anything
 * to show, so it is clear that typing is what produces results.
 */
function AddressSearchField({
  label,
  value,
  placeholder = 'Search address',
  errorText,
  disabled = false,
  onChange,
  onSearch,
  onSelect,
}: AddressSearchFieldProps) {
  const [suggestions, setSuggestions] = useState<ProductAddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  // Only the newest query may write results; a slow earlier one must not win.
  const queryIdRef = useRef(0)

  useEffect(() => {
    const query = value.trim()
    const id = ++queryIdRef.current

    // Every state write happens inside the timer rather than during the effect
    // itself, which also means "Searching..." only appears once typing settles.
    const timer = window.setTimeout(async () => {
      if (query.length < MIN_QUERY_LENGTH) {
        setSuggestions([])
        setSearching(false)
        return
      }

      setSearching(true)
      try {
        const results = await onSearch(query)
        if (queryIdRef.current === id) setSuggestions(results)
      } catch {
        if (queryIdRef.current === id) setSuggestions([])
      } finally {
        if (queryIdRef.current === id) setSearching(false)
      }
    }, DEBOUNCE_MS)

    return () => window.clearTimeout(timer)
  }, [value, onSearch])

  // A click outside dismisses the list without clearing what they typed.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [open])

  const hint =
    value.trim().length < MIN_QUERY_LENGTH
      ? 'Type to start searching...'
      : searching
        ? 'Searching...'
        : 'No matches found'

  return (
    <div ref={containerRef} className="relative flex w-full flex-col">
      <TextInput
        label={label}
        size="md"
        autoComplete="off"
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        errorText={errorText}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          onChange(event.target.value)
          setOpen(true)
        }}
      />

      {open && !disabled ? (
        <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col gap-[2px] rounded-lg-12 border border-border-transparent-medium bg-bg-secondary p-[4px] shadow-sm">
          {suggestions.length === 0 ? (
            <ListItemLocation title="Suggested Address:" address={hint} disabled />
          ) : (
            suggestions.map((suggestion) => (
              <ListItemLocation
                key={suggestion.place_id}
                title="Suggested Address:"
                address={suggestion.description || suggestion.formatted_address || ''}
                onClick={() => {
                  onSelect(suggestion)
                  setOpen(false)
                }}
              />
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}

export { AddressSearchField }
