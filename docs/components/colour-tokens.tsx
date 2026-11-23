'use client'

import { useMemo, useState } from 'react'

import { TextInput } from '@/components/ui/input'
import tokens from '@/docs/generated/tokens.json'

interface Resolved {
  ref: string | null
  value: string
}

interface ColourToken {
  name: string
  light: Resolved
  dark: Resolved
}

const groups = tokens.colours as { name: string; tokens: ColourToken[] }[]

function Swatch({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="docs-checker block h-[28px] w-[40px] shrink-0 overflow-hidden rounded-sm-6 outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium"
    >
      <span className="block h-full w-full" style={{ background: `var(--${name})` }} />
    </span>
  )
}

function Value({ resolved }: { resolved: Resolved }) {
  return (
    <span className="flex flex-col">
      <code className="docs-inline-code w-fit">{resolved.ref ?? resolved.value}</code>
    </span>
  )
}

/**
 * Every semantic colour token, read from styles/design-system/tokens.css at
 * build time. The swatch is the live CSS variable, so it follows the theme
 * switch; the columns show which primitive each mode points at.
 */
function ColourTokens() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map((g) => ({
        ...g,
        tokens: g.tokens.filter(
          (t) =>
            t.name.includes(q) ||
            g.name.toLowerCase().includes(q) ||
            (t.light.ref ?? '').includes(q) ||
            (t.dark.ref ?? '').includes(q),
        ),
      }))
      .filter((g) => g.tokens.length)
  }, [query])
  const count = filtered.reduce((n, g) => n + g.tokens.length, 0)

  return (
    <div className="not-prose my-[16px] flex flex-col gap-[16px]">
      <div className="max-w-[360px]">
        <TextInput
          aria-label="Search colour tokens"
          showLabel={false}
          placeholder="Search tokens, e.g. text-primary or blue-8"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <p className="body-l-regular text-text-secondary" aria-live="polite">
        {count} tokens
      </p>
      {filtered.map((group) => (
        <section key={group.name} aria-label={group.name}>
          <h3 className="mb-[8px] body-l-semibold text-text-primary">{group.name}</h3>
          <div className="overflow-x-auto rounded-lg-10 outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="body-l-medium text-text-primary">
                  <th className="w-[56px] px-[12px] py-[8px] font-medium">
                    <span className="sr-only">Swatch</span>
                  </th>
                  <th className="px-[12px] py-[8px] font-medium">Token</th>
                  <th className="px-[12px] py-[8px] font-medium">Light</th>
                  <th className="px-[12px] py-[8px] font-medium">Dark</th>
                </tr>
              </thead>
              <tbody>
                {group.tokens.map((token) => (
                  <tr
                    key={token.name}
                    className="border-t-[0.5px] border-border-transparent-medium"
                  >
                    <td className="px-[12px] py-[8px]">
                      <Swatch name={token.name} />
                    </td>
                    <td className="px-[12px] py-[8px]">
                      <code className="docs-inline-code">--{token.name}</code>
                    </td>
                    <td className="px-[12px] py-[8px]">
                      <Value resolved={token.light} />
                    </td>
                    <td className="px-[12px] py-[8px]">
                      <Value resolved={token.dark} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {count === 0 && (
        <p className="body-l-regular text-text-secondary">No tokens match “{query}”.</p>
      )}
    </div>
  )
}

export { ColourTokens }
