'use client'

import { useState } from 'react'

// Flag artwork is served from `public/flags/<code>.svg`, copied out of the
// `flag-icons` package by `scripts/copy-flags.mjs`. Every ISO 3166-1 alpha-2
// country is covered, plus `eu`, `un` and the GB subdivisions, so no code
// change is needed when the backend starts returning a new country.
const FLAG_BASE_PATH = '/flags'

// Codes the API (or a locale string) uses that differ from the flag-icons
// filename. `uk` is the common non-ISO spelling of `gb`.
const codeAliases: Record<string, string> = {
  uk: 'gb',
  scotland: 'gb-sct',
  england: 'gb-eng',
  wales: 'gb-wls',
}

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 code (`NG`), or a region code — `EU` is the only
   * region currently supported. Case-insensitive; `UK` resolves to `GB`. */
  code: string
  /** Country name used for the accessible label. Defaults to `code`. */
  name?: string
  /** Hides the flag from assistive tech — use when the country name is
   * already announced by the parent (e.g. the phone-field country button). */
  decorative?: boolean
  /** Box size in px. Figma default is 30×20; smaller in dense contexts (e.g.
   * a select dropdown). Applied via inline style to stay exact. */
  width?: number
  height?: number
  className?: string
}

function toFlagCode(code: string): string {
  const normalised = code.trim().toLowerCase()
  return codeAliases[normalised] ?? normalised
}

// Neutral placeholder for a code with no artwork — the design system says to
// fall back to the country name rather than a misleading flag.
function FallbackFlag() {
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

function CountryFlag({
  code,
  name,
  decorative = false,
  width = 30,
  height = 20,
  className = '',
}: CountryFlagProps) {
  const flagCode = toFlagCode(code)

  // Tracked per code rather than as a boolean, so a new code always gets a
  // fresh attempt — otherwise one 404 would blank every later flag rendered
  // by the same element (e.g. a re-used dropdown row).
  const [failedCode, setFailedCode] = useState<string>()
  const failed = failedCode === flagCode

  const label = `${name ?? code} flag`

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden bg-white ${className}`}
      style={{ width, height }}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      {failed ? (
        <FallbackFlag />
      ) : (
        // 4x3 artwork cropped to the 30×20 (3:2) container the design system
        // specifies — the flag fills the box edge-to-edge, no letterboxing.
        // Plain <img>: these are static local SVGs, which next/image does not
        // optimise, and the src is resolved from a runtime country code.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${FLAG_BASE_PATH}/${flagCode}.svg`}
          alt=""
          aria-hidden="true"
          width={width}
          height={height}
          className="h-full w-full object-cover"
          onError={() => setFailedCode(flagCode)}
        />
      )}
    </span>
  )
}

export { CountryFlag }
export type { CountryFlagProps }
