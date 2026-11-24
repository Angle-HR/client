/**
 * Countries an employer can register in: the United Kingdom and the 27 EU member states, as ISO 3166-1 alpha-2
 * codes. The server enforces the same list (SUPPORTED_COUNTRIES), so this is only what the form offers.
 */
const EU_MEMBERS = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
] as const

function countryName(code: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

const EMPLOYER_COUNTRIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: 'GB', name: countryName('GB') },
  ...EU_MEMBERS.map((code) => ({ code, name: countryName(code) })).sort((a, b) =>
    a.name.localeCompare(b.name),
  ),
]

export { EMPLOYER_COUNTRIES }
