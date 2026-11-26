import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Tag } from '../tags/tag'
import { TagRemoveButton } from '../tags/tag-remove-button'
import {
  TAG_COLORS,
  TAG_FIGMA,
  TAG_LAYOUT,
  TAG_REMOVE_LAYOUT,
  type TagSize,
} from '../tags/tag.figma'

import { missingTokens, type States } from './figma-spec'

// Checks tag.tsx and tag-remove-button.tsx against the Figma spec in tag.figma.ts.

function parts(props: Partial<Parameters<typeof Tag>[0]>) {
  const { container, unmount } = render(<Tag label="Tag" onRemove={() => {}} {...props} />)
  const root = container.firstElementChild as HTMLElement
  const label = root.querySelector(':scope > span') as HTMLElement
  const rect = root.querySelector(':scope > svg rect')
  const button = root.querySelector('button')
  const out = {
    root: root.className,
    label: label.className,
    button: button?.className ?? null,
    icon: (button?.firstElementChild as HTMLElement | null)?.style.width ?? null,
    stroke: rect
      ? {
          dash: rect.getAttribute('stroke-dasharray'),
          width: rect.getAttribute('stroke-width'),
          rx: rect.getAttribute('rx'),
          colour: (rect.parentElement as unknown as SVGElement).getAttribute('class'),
        }
      : null,
  }
  unmount()
  return out
}

const sizes: TagSize[] = ['lg', 'sm', 'xs']

describe('Tag matches Figma', () => {
  it('every token exists', () => {
    const missing = TAG_COLORS.flatMap((c) =>
      missingTokens({
        rest: { bg: TAG_FIGMA.bg(c), border: TAG_FIGMA.emptyBorder.token, fg: TAG_FIGMA.text(c) },
        hover: { bg: TAG_FIGMA.remove.hover.bg, border: 'transparent', fg: TAG_FIGMA.text(c) },
      } satisfies States),
    )
    expect(missing).toEqual([])
  })

  for (const color of TAG_COLORS) {
    it(`${color}: bg, text and stroke`, () => {
      const p = parts({ color })
      expect(p.root).toContain(`bg-${TAG_FIGMA.bg(color)}`)
      expect(p.root).toContain(`text-${TAG_FIGMA.text(color)}`)
      if (color === 'empty') {
        const b = TAG_FIGMA.emptyBorder
        expect(p.stroke).toMatchObject({ dash: b.dash.join(' '), width: String(b.width) })
        expect(p.stroke!.colour).toContain(`text-${b.token}`)
      } else expect(p.stroke).toBeNull()
      expect(p.root).not.toContain('shadow-')
      expect(p.root).not.toMatch(/(^|\s)border/)
    })
  }

  const fonts: Record<TagSize, string> = {
    lg: 'text-body-s',
    sm: 'text-body-xs',
    xs: 'text-caption-m',
  }
  for (const size of sizes) {
    const L = TAG_LAYOUT[size]
    it(`${size}: ${L.fixedHeight ? L.height + 'px tall' : 'hugs'}, ${L.paddingX}px padding, ${L.radius}px radius, ${L.fontSize}px text`, () => {
      const p = parts({ size })
      if (L.fixedHeight) expect(p.root).toContain(`h-[${L.height}px]`)
      else {
        expect(p.root).not.toMatch(/h-\[/)
        expect(p.label).toContain(`py-[${L.paddingY}px]`)
      }
      expect(p.label).toContain(`px-[${L.paddingX}px]`)
      expect(p.root).toContain(L.radius === 7 ? 'rounded-sm-7' : 'rounded-xs-4')
      expect(p.stroke!.rx).toBe(String(L.radius))
      expect(p.label).toContain(fonts[size])
      expect(p.label).toContain('text-trim-cap')
      expect(p.label).toContain('whitespace-nowrap')
    })
  }

  it('weight: Regular by default, Medium when asked', () => {
    expect(parts({}).label).toContain('font-regular')
    expect(parts({ weight: 'medium' }).label).toContain('font-medium')
  })

  for (const size of ['lg', 'sm'] as const) {
    it(`${size} removable: label keeps left padding only, 2px gap, 20px button`, () => {
      const p = parts({ size, removable: true })
      expect(p.root).toContain(`gap-[${TAG_REMOVE_LAYOUT.gap}px]`)
      expect(p.label).toContain(`pl-[${TAG_LAYOUT[size].paddingX}px]`)
      expect(p.label).not.toContain('px-[')
      expect(p.button).toContain(`size-[${TAG_REMOVE_LAYOUT.button}px]`)
      expect(p.button).toContain('rounded-r-sm-7')
      expect(p.icon).toBe(`${TAG_REMOVE_LAYOUT.icon}px`)
    })
  }

  it('xs has no removable variant in Figma, so no button', () => {
    expect(parts({ size: 'xs', removable: true }).button).toBeNull()
  })

  it('remove button: icon in the tag colour, hover fill, 150ms ease out', () => {
    for (const color of TAG_COLORS) {
      const { container, unmount } = render(<TagRemoveButton color={color} aria-label="x" />)
      const b = container.querySelector('button')!.className
      expect(b).toContain(`text-${TAG_FIGMA.text(color)}`)
      expect(b).toContain(`hover:bg-${TAG_FIGMA.remove.hover.bg}`)
      expect(b).toContain('duration-150 ease-figma-out')
      expect(b).not.toMatch(/(^|\s)bg-/)
      unmount()
    }
  })

  it('remove button focus (not in Figma): keyboard-only 1px ring', () => {
    const b = parts({ removable: true }).button!
    expect(b).toContain('focus-visible:outline-1')
    expect(b).toContain('focus-visible:outline-bg-selection-controls-selected')
    expect(b).not.toMatch(/(^|\s)focus:/)
  })
})
