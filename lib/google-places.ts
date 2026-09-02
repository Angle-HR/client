import type { ProductAddressSuggestion } from './types'

/**
 * Address lookup through the Google Places API (New) — `places:autocomplete`
 * for suggestions and `places/{id}` for the structured address behind one.
 *
 * Everything Google-shaped stops here. Callers get `ProductAddressSuggestion`,
 * the same shape the backend search returned, so the search field, the
 * suggestion list and the verification modal did not have to change.
 *
 * The key is a browser key and ships in the bundle, so it must be restricted by
 * HTTP referrer and to the Places API in the Google Cloud console.
 */

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete'
const DETAILS_URL = 'https://places.googleapis.com/v1/places'

/** Only what we map below, so Google bills for the smallest useful response. */
const DETAILS_FIELD_MASK = 'id,formattedAddress,addressComponents'

function apiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
}

/** False when no key is configured — callers degrade instead of failing. */
function isGooglePlacesConfigured(): boolean {
  return Boolean(apiKey())
}

/**
 * Groups the keystrokes of one lookup with the details call that follows it, so
 * Google bills the pair as a single session rather than per request. Rotate it
 * once an address has been resolved.
 */
function createSessionToken(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

interface GoogleAutocompleteResponse {
  suggestions?: {
    placePrediction?: {
      placeId?: string
      text?: { text?: string }
      structuredFormat?: { mainText?: { text?: string }; secondaryText?: { text?: string } }
    }
  }[]
}

interface GoogleAddressComponent {
  longText?: string
  shortText?: string
  types?: string[]
}

interface GooglePlaceDetails {
  id?: string
  formattedAddress?: string
  addressComponents?: GoogleAddressComponent[]
}

function componentText(
  components: GoogleAddressComponent[],
  type: string,
  form: 'longText' | 'shortText' = 'longText',
): string | undefined {
  return components.find((component) => component.types?.includes(type))?.[form]
}

/**
 * Google returns a flat list of typed components; this picks the ones our
 * address form has fields for. `postal_town` is the UK's answer to `locality`,
 * and administrative levels vary by country, hence the fallbacks.
 */
function toAddressParts(details: GooglePlaceDetails): Omit<ProductAddressSuggestion, 'place_id'> {
  const components = details.addressComponents ?? []
  const streetNumber = componentText(components, 'street_number')
  const route = componentText(components, 'route')

  return {
    description: details.formattedAddress ?? '',
    formatted_address: details.formattedAddress ?? '',
    line_1: [streetNumber, route].filter(Boolean).join(' ') || undefined,
    line_2: componentText(components, 'subpremise') ?? componentText(components, 'premise'),
    city:
      componentText(components, 'postal_town') ??
      componentText(components, 'locality') ??
      componentText(components, 'administrative_area_level_2'),
    state_or_county:
      componentText(components, 'administrative_area_level_1') ??
      componentText(components, 'administrative_area_level_2'),
    post_code: componentText(components, 'postal_code'),
  }
}

interface AutocompleteOptions {
  /** ISO-3166-1 alpha-2, e.g. `gb`. Confines results to the business's country. */
  regionCode?: string
  sessionToken?: string
  signal?: AbortSignal
}

/**
 * Suggestions for a partial address. Returns `place_id` and the display text
 * only; the structured address needs `fetchPlaceAddress`, which is the call
 * Google charges for.
 */
async function autocompleteAddresses(
  input: string,
  { regionCode, sessionToken, signal }: AutocompleteOptions = {},
): Promise<ProductAddressSuggestion[]> {
  const key = apiKey()
  if (!key || !input.trim()) return []

  const response = await fetch(AUTOCOMPLETE_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': key,
    },
    body: JSON.stringify({
      input,
      ...(sessionToken ? { sessionToken } : {}),
      ...(regionCode ? { includedRegionCodes: [regionCode.toLowerCase()] } : {}),
    }),
  })

  if (!response.ok) return []

  const data = (await response.json()) as GoogleAutocompleteResponse
  return (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((prediction): prediction is NonNullable<typeof prediction> =>
      Boolean(prediction?.placeId),
    )
    .map((prediction) => ({
      place_id: prediction.placeId as string,
      description:
        prediction.text?.text ??
        [
          prediction.structuredFormat?.mainText?.text,
          prediction.structuredFormat?.secondaryText?.text,
        ]
          .filter(Boolean)
          .join(', '),
    }))
}

/** The structured address behind a suggestion the person picked. */
async function fetchPlaceAddress(
  placeId: string,
  sessionToken?: string,
): Promise<ProductAddressSuggestion | null> {
  const key = apiKey()
  if (!key) return null

  const url = new URL(`${DETAILS_URL}/${placeId}`)
  if (sessionToken) url.searchParams.set('sessionToken', sessionToken)

  const response = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': key,
      'X-Goog-FieldMask': DETAILS_FIELD_MASK,
    },
  })

  if (!response.ok) return null

  const details = (await response.json()) as GooglePlaceDetails
  return { place_id: placeId, ...toAddressParts(details) }
}

/**
 * Looks up a whole address the person typed themselves and returns Google's
 * best match, or null when it recognises nothing. Used to check the manual form
 * so the same "you entered / suggested" choice can be offered.
 */
async function resolveTypedAddress(
  input: string,
  options: AutocompleteOptions = {},
): Promise<ProductAddressSuggestion | null> {
  const [best] = await autocompleteAddresses(input, options)
  if (!best) return null
  return fetchPlaceAddress(best.place_id, options.sessionToken)
}

export {
  autocompleteAddresses,
  createSessionToken,
  fetchPlaceAddress,
  isGooglePlacesConfigured,
  resolveTypedAddress,
}
