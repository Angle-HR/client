/**
 * Places a job can be based in, as the "Specific area" field handles them.
 *
 * Suggestions come from Google Places (see `lib/google-places.ts`) as plain
 * text such as "London, UK". The chip beside a chosen place shows its
 * country's flag, which this works out from that text without a second,
 * billable lookup.
 */

// ISO 3166-1 alpha-2. Names for these come from the browser's own data.
const REGION_CODES =
  'AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(
    ' ',
  )

// Names Google and people use that the browser's list spells differently.
const ALIASES: Record<string, string> = {
  uk: 'gb',
  'great britain': 'gb',
  england: 'gb-eng',
  scotland: 'gb-sct',
  wales: 'gb-wls',
  usa: 'us',
  'united states of america': 'us',
  'european union': 'eu',
  eu: 'eu',
}

let byName: Map<string, string> | null = null

function regionsByName(): Map<string, string> {
  if (byName) return byName
  byName = new Map(Object.entries(ALIASES))
  const names = new Intl.DisplayNames(['en'], { type: 'region' })
  for (const code of REGION_CODES) {
    const name = names.of(code)
    if (name) byName.set(name.toLowerCase(), code.toLowerCase())
  }
  return byName
}

/**
 * The flag code for a place, from the country its text ends with:
 * "London, UK" → "gb", "Lagos, Nigeria" → "ng", "European Union" → "eu".
 * Undefined when the text names no country we know.
 */
function flagCodeFor(place: string): string | undefined {
  const country = place.split(',').pop()?.trim().toLowerCase()
  return country ? regionsByName().get(country) : undefined
}

export { flagCodeFor }
