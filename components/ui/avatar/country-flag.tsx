import {
  AO,
  AR,
  BH,
  BB,
  BE,
  BJ,
  BW,
  BR,
  CM,
  CA,
  CN,
  CO,
  EG,
  EE,
  ET,
  EU,
  FI,
  FR,
  GE,
  GY,
  HK,
  IS,
  IN,
  IR,
  IE,
  IT,
  JM,
  JP,
  KE,
  LU,
  ML,
  MC,
  MA,
  NL,
  NE,
  NG,
  MK,
  NO,
  SC,
  ZA,
  SE,
  CH,
  TZ,
  GB,
  US,
  UY,
} from 'country-flag-icons/react/3x2'

// The 49 country/region variants defined in the Figma `country` variant set.
type Country =
  | 'Africa'
  | 'Angola'
  | 'Argentina'
  | 'Bahrain'
  | 'Barbados'
  | 'Belgium'
  | 'Benin'
  | 'Botswana'
  | 'Brazil'
  | 'Cameroon'
  | 'Canada'
  | 'China'
  | 'Colombia'
  | 'Egypt'
  | 'Estonia'
  | 'Ethiopia'
  | 'EU'
  | 'Finland'
  | 'France'
  | 'Georgia'
  | 'Guyana'
  | 'Hong Kong'
  | 'Iceland'
  | 'India'
  | 'Iran'
  | 'Ireland'
  | 'Italy'
  | 'Jamaica'
  | 'Japan'
  | 'Kenya'
  | 'Luxembourg'
  | 'Mali'
  | 'Monaco'
  | 'Morocco'
  | 'Netherlands'
  | 'Niger'
  | 'Nigeria'
  | 'North Macedonia'
  | 'Norway'
  | 'Scotland'
  | 'Seychelles'
  | 'South Africa'
  | 'Sweden'
  | 'Switzerland'
  | 'Tanzania'
  | 'United Kingdom'
  | 'United Nations'
  | 'United States'
  | 'Uruguay'

interface CountryFlagProps {
  country: Country
  className?: string
}

type FlagComponent = typeof US

// Country name → vector flag. `Africa`, `Scotland`, and `United Nations` have no
// flag in country-flag-icons; they fall back to a neutral placeholder.
const flagByCountry: Partial<Record<Country, FlagComponent>> = {
  Angola: AO,
  Argentina: AR,
  Bahrain: BH,
  Barbados: BB,
  Belgium: BE,
  Benin: BJ,
  Botswana: BW,
  Brazil: BR,
  Cameroon: CM,
  Canada: CA,
  China: CN,
  Colombia: CO,
  Egypt: EG,
  Estonia: EE,
  Ethiopia: ET,
  EU: EU,
  Finland: FI,
  France: FR,
  Georgia: GE,
  Guyana: GY,
  'Hong Kong': HK,
  Iceland: IS,
  India: IN,
  Iran: IR,
  Ireland: IE,
  Italy: IT,
  Jamaica: JM,
  Japan: JP,
  Kenya: KE,
  Luxembourg: LU,
  Mali: ML,
  Monaco: MC,
  Morocco: MA,
  Netherlands: NL,
  Niger: NE,
  Nigeria: NG,
  'North Macedonia': MK,
  Norway: NO,
  Seychelles: SC,
  'South Africa': ZA,
  Sweden: SE,
  Switzerland: CH,
  Tanzania: TZ,
  'United Kingdom': GB,
  'United States': US,
  Uruguay: UY,
}

function FallbackFlag() {
  // Neutral globe silhouette for variants with no vector flag in the library.
  return (
    <svg viewBox="0 0 30 20" className="h-full w-full" fill="none" aria-hidden="true">
      <rect width="30" height="20" fill="var(--color-light-grey-3)" />
      <circle cx="15" cy="10" r="6" stroke="var(--color-dark-grey-9)" strokeWidth="1" />
      <path
        d="M9 10h12M15 4v12M11 10a8 8 0 008 0M11 10a8 8 0 0118 0"
        stroke="var(--color-dark-grey-9)"
        strokeWidth="0.75"
      />
    </svg>
  )
}

function CountryFlag({ country, className = '' }: CountryFlagProps) {
  const Flag = flagByCountry[country]

  return (
    <span
      className={`inline-flex h-[20px] w-[30px] items-center justify-center overflow-hidden bg-white ${className}`}
      role="img"
      aria-label={`${country} flag`}
    >
      {Flag ? <Flag className="h-full w-full" aria-hidden="true" /> : <FallbackFlag />}
    </span>
  )
}

export { CountryFlag }
export type { CountryFlagProps }
