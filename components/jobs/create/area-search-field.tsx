'use client'

import { useEffect, useId, useRef, useState } from 'react'

import { HelperText, ListItemLocation, SelectionField } from '@/components/ui'
import { autocompleteAddresses, isGooglePlacesConfigured } from '@/lib/google-places'
import { AREA_OPTIONS } from '@/lib/jobs/draft'

/** Long enough that a first keystroke doesn't fire a lookup on its own. */
const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300

interface AreaSearchFieldProps {
  /** Places already chosen, which are left out of the suggestions. */
  chosen: string[]
  onSelect: (place: string) => void
}

/** Without a Google key (tests, a fresh checkout) the built-in list answers. */
async function searchPlaces(query: string, signal: AbortSignal): Promise<string[]> {
  if (isGooglePlacesConfigured()) {
    const suggestions = await autocompleteAddresses(query, { signal, regionsOnly: true })
    return suggestions.map((suggestion) => suggestion.description).filter(Boolean)
  }
  const term = query.toLowerCase()
  return AREA_OPTIONS.filter((option) => option.label.toLowerCase().includes(term)).map(
    (option) => option.value,
  )
}

/**
 * The "Country" field of a specific-area job: type a city, state or country
 * and pick from the suggested addresses. Figma: 8973:609418.
 *
 * It is the same Google Places lookup as the onboarding address field, with
 * the same "Suggested Address:" rows; what is picked is added as a chip by the
 * form, so the field itself always goes back to empty.
 */
function AreaSearchField({ chosen, onSelect }: AreaSearchFieldProps) {
  const fieldId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<string[]>([])

  useEffect(() => {
    const term = query.trim()
    const controller = new AbortController()
    // State is only written from the timer, once typing has settled.
    const timer = window.setTimeout(async () => {
      if (term.length < MIN_QUERY_LENGTH) {
        setResults([])
        return
      }
      try {
        const found = await searchPlaces(term, controller.signal)
        if (!controller.signal.aborted) setResults(found)
      } catch {
        if (!controller.signal.aborted) setResults([])
      }
    }, DEBOUNCE_MS)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  useEffect(() => {
    if (!open) return
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const suggestions = results.filter((place) => !chosen.includes(place))

  function pick(place: string) {
    onSelect(place)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-[6px]">
      <label
        htmlFor={fieldId}
        className="flex h-[9px] items-center pl-[3px] text-body-xs leading-none font-medium-550 text-text-tertiary"
      >
        Country
      </label>
      <SelectionField
        id={fieldId}
        state={open ? 'focus' : 'placeholder'}
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        onClick={() => setOpen(true)}
        search={{
          value: query,
          onChange: (text) => {
            setQuery(text)
            setOpen(true)
          },
          onFocus: () => setOpen(true),
          onKeyDown: (event) => {
            if (event.key === 'Enter' && suggestions[0]) {
              event.preventDefault()
              pick(suggestions[0])
            }
          },
          placeholder: 'Search',
          'aria-label': 'Country',
        }}
      />
      <HelperText>Enter the city, state or country where this role is based.</HelperText>

      {open && suggestions.length > 0 ? (
        // 322px wide, 1px under the field, as the design hangs it.
        <div
          role="listbox"
          aria-label="Suggested addresses"
          className="absolute top-[48px] left-0 z-20 flex w-[322px] flex-col gap-[2px] rounded-lg-12 bg-bg-secondary p-[4px] shadow-md outline-[0.5px] -outline-offset-[0.5px] outline-border-light"
        >
          {suggestions.map((place) => (
            <ListItemLocation
              key={place}
              title="Suggested Address:"
              address={place}
              onClick={() => pick(place)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export { AreaSearchField }
export type { AreaSearchFieldProps }
