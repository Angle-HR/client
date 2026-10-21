/**
 * The hiring catalog and a job's `markets` name a market with its own code (`UK`, `EU`), while the
 * applications and verification endpoints take ISO 3166 country codes. They differ for the UK only.
 */
const ISO_BY_MARKET: Readonly<Record<string, string>> = { UK: 'GB' }

const MARKET_BY_ISO: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(ISO_BY_MARKET).map(([market, iso]) => [iso, market]),
)

/** The ISO country code for a market code. Codes that already match ISO come back unchanged. */
function toCountryCode(market: string): string {
  return ISO_BY_MARKET[market] ?? market
}

/** The market code for an ISO country code, the way the catalog and a job's markets spell it. */
function toMarketCode(country: string): string {
  return MARKET_BY_ISO[country] ?? country
}

/** A market's name, for a market the page has no catalog for. Falls back to the code. */
function marketName(market: string): string {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(toCountryCode(market)) ?? market
  } catch {
    return market
  }
}

export { marketName, toCountryCode, toMarketCode }
