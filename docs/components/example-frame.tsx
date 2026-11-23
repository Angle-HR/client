'use client'

import { useId, useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { MaskIcon } from '@/components/ui/icons'
import { Tabs } from '@/components/ui/tabs'

type View = 'preview' | 'code'

const VIEWS = [
  { key: 'preview', label: 'Preview' },
  { key: 'code', label: 'Code' },
] as const

interface ExampleFrameProps {
  name: string
  caption?: string
  code: string
  html: string
  children: ReactNode
}

function ExampleFrame({ name, caption, code, html, children }: ExampleFrameProps) {
  const [view, setView] = useState<View>('preview')
  const [copied, setCopied] = useState(false)
  const panelId = useId()

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard blocked (e.g. insecure context); the code is still selectable.
    }
  }

  return (
    <figure className="not-prose my-[20px] overflow-hidden rounded-lg-10 bg-bg-secondary outline-[0.5px] -outline-offset-[0.5px] outline-border-transparent-medium">
      {/* A compact bar for the card header: 28px tabs in a 36px row, so the hover
          fill stays 8px off the card's top edge, with a 4px inset from the corner. */}
      <Tabs
        className="h-[36px]! pl-[1px] [&>div]:h-[28px]! [&_[role=tab]]:h-[28px]! [&_[role=tab]]:px-[10px]!"
        aria-label={`${name} example`}
        tabs={VIEWS}
        value={view}
        onValueChange={setView}
        trailing={
          view === 'code' ? (
            <Button
              size="sm"
              variant="tertiary"
              onClick={copy}
              iconPrefix={
                copied ? <MaskIcon src="/dashboard/icons/check-outline.svg" size={14} /> : undefined
              }
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          ) : undefined
        }
      />
      <div id={panelId} role="tabpanel" aria-label={view === 'preview' ? 'Preview' : 'Code'}>
        {view === 'preview' ? (
          <div className="docs-stage flex min-h-[140px] items-center justify-center overflow-x-auto bg-bg-secondary border-t-[0.5px] border-border-transparent-medium p-[24px] md:p-[40px]">
            <div className="min-w-0">{children}</div>
          </div>
        ) : (
          // Highlighted at build time by scripts/build-docs.mjs from our own example files.
          <div
            className="docs-code max-h-[480px] overflow-auto bg-bg-primary p-[16px]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}
      </div>
      {caption && (
        <figcaption className="border-t-[0.5px] border-border-transparent-medium px-[16px] py-[10px] body-l-regular text-text-secondary">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export { ExampleFrame }
