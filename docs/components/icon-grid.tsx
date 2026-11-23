'use client'

import { useMemo, useState } from 'react'

import { MaskIcon } from '@/components/ui/icons/mask-icon'
import { TextInput } from '@/components/ui/input'
import { Tabs } from '@/components/ui/tabs'
import tokens from '@/docs/generated/tokens.json'

const names = tokens.icons as string[]
type Style = 'outline' | 'solid'

/**
 * The Figma icon library from public/dashboard/icons. Each icon is drawn with
 * MaskIcon, so it takes the text colour and follows the theme.
 */
function IconGrid() {
  const [query, setQuery] = useState('')
  const [style, setStyle] = useState<Style>('outline')
  const [copied, setCopied] = useState<string | null>(null)
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, '-')
    return q ? names.filter((n) => n.includes(q)) : names
  }, [query])

  async function copy(name: string) {
    const path = `/dashboard/icons/${name}-${style}.svg`
    try {
      await navigator.clipboard.writeText(path)
      setCopied(name)
      setTimeout(() => setCopied((c) => (c === name ? null : c)), 1500)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="not-prose my-[16px] flex flex-col gap-[12px]">
      <div className="flex flex-wrap items-end gap-[12px]">
        <div className="w-full max-w-[320px]">
          <TextInput
            aria-label="Search icons"
            showLabel={false}
            placeholder="Search 359 icons"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-lg-10 outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
        <Tabs
          aria-label="Icon style"
          tabs={[
            { key: 'outline', label: 'Outline' },
            { key: 'solid', label: 'Solid' },
          ]}
          value={style}
          onValueChange={setStyle}
          trailing={
            <span className="body-l-regular text-text-secondary" aria-live="polite">
              {shown.length} icons
            </span>
          }
        />
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(112px,1fr))] gap-[2px] p-[8px]">
          {shown.map((name) => (
            <li key={name}>
              <button
                type="button"
                onClick={() => copy(name)}
                title={`Copy /dashboard/icons/${name}-${style}.svg`}
                className="flex h-[88px] w-full flex-col items-center justify-center gap-[10px] rounded-sm-7 px-[6px] text-text-primary transition-colors hover:bg-bg-transparent-light focus-visible:outline-2 focus-visible:outline-bg-selection-controls-selected"
              >
                <MaskIcon src={`/dashboard/icons/${name}-${style}.svg`} size={20} />
                <span className="w-full truncate text-center body-xs-regular text-text-secondary">
                  {copied === name ? 'Copied path' : name}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {shown.length === 0 && (
          <p className="p-[16px] body-l-regular text-text-secondary">No icons match “{query}”.</p>
        )}
      </div>
    </div>
  )
}

export { IconGrid }
