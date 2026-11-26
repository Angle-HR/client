import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Checkbox, type CheckboxChecked } from '../selection-controls/checkbox'
import {
  CHECKBOX_FIGMA,
  CHECKBOX_LAYOUT,
  type CheckboxBoxSize,
} from '../selection-controls/checkbox.figma'
import { CHECKBOX_FOCUS_RING_AREA, CHECKBOX_FOCUS_RING_BOX } from '../selection-controls/focus'

import { missingTokens, type States } from './figma-spec'

// Checks checkbox.tsx against the Figma spec in checkbox.figma.ts.

const sizes = [18, 15, 14, 11] as CheckboxBoxSize[]
const types: CheckboxChecked[] = [false, true, 'indeterminate']

function parts(props: Parameters<typeof Checkbox>[0]) {
  const { container, unmount } = render(<Checkbox onChange={() => {}} {...props} />)
  const root = container.querySelector('label')!
  const spans = [...root.children].filter((e) => e.tagName === 'SPAN') as HTMLElement[]
  const hover = props.hoverable === false ? null : spans[0]
  const box = (hover ? hover.firstElementChild : spans[0]) as HTMLElement
  const label = spans.find((s) => s.textContent && !s.querySelector('span')) ?? null
  const out = {
    root: root.className,
    hover: hover?.className ?? '',
    box: box.className,
    label: label?.className ?? '',
    icon: box.querySelector('span') as HTMLElement | null,
  }
  unmount()
  return out
}

describe('Checkbox matches Figma', () => {
  it('every token exists', () => {
    const f = CHECKBOX_FIGMA
    const states: States = {
      rest: { bg: f.filled.bg, border: f.unchecked.border, fg: f.label },
      hover: { bg: f.hover.unchecked, border: 'transparent', fg: f.filled.icon },
      selected: { bg: f.hover.filled, border: 'transparent', fg: f.label },
    }
    expect(missingTokens(states)).toEqual([])
  })

  for (const size of sizes) {
    const L = CHECKBOX_LAYOUT[size]
    for (const checked of types) {
      it(`${size}px ${String(checked)}: box, colours, icon, hover area`, () => {
        const p = parts({ size, checked, hoverable: true })
        expect(p.box).toContain(`size-[${L.box}px]`)
        if (checked === false) {
          expect(p.box).toContain('bg-transparent')
          // Inset shadow, not a border: browsers round border widths to device pixels.
          expect(p.box.split(' ')).toContain(
            `shadow-[inset_0_0_0_${L.stroke}px_var(--color-${CHECKBOX_FIGMA.unchecked.border})]`,
          )
          expect(p.icon).toBeNull()
        } else {
          expect(p.box).toContain(`bg-${CHECKBOX_FIGMA.filled.bg}`)
          expect(p.box).toContain('shadow-none')
          expect(p.box).toContain(CHECKBOX_FIGMA.filled.icon)
          expect(p.icon!.style.width).toBe(`${L.icon}px`)
          expect(p.icon!.style.maskImage).toContain(
            checked === true ? 'check-outline' : 'long-dash-outline',
          )
        }
        expect(p.hover).toContain(`size-[${L.hoverArea.size}px]`)
        expect(p.hover).toContain(`p-[${L.hoverArea.padding}px]`)
        const filledHover = checked !== false || size === 11 // 11px unchecked: Figma oddity
        expect(p.hover).toContain(
          `group-hover/checkbox:bg-${filledHover ? CHECKBOX_FIGMA.hover.filled : CHECKBOX_FIGMA.hover.unchecked}`,
        )
      })
    }
  }

  it('labels are secondary grey, Regular, trimmed to cap height, with Figma spacing', () => {
    const fonts = { 18: 'text-body-l', 15: 'text-body-m', 11: 'text-body-xs' } as const
    for (const size of [18, 15, 11] as const) {
      const L = CHECKBOX_LAYOUT[size].label!
      const plain = parts({ size, label: 'Remote', hoverable: false })
      expect(plain.label).toContain('text-text-secondary')
      expect(plain.label).toContain(fonts[size])
      expect(plain.label).toContain('font-regular')
      expect(plain.label).toContain('text-trim-cap')
      expect(plain.root).toContain(`p-[${L.plain.padding}px]`)
      expect(plain.root).toContain(`gap-[${L.plain.gap}px]`)
      if (L.plain.labelPaddingX) expect(plain.label).toContain(`px-[${L.plain.labelPaddingX}px]`)
      const hov = parts({ size, label: 'Remote', hoverable: true })
      expect(hov.root).toContain(L.hoverable.gap ? `gap-[${L.hoverable.gap}px]` : 'gap-0')
      if (L.hoverable.labelPaddingX)
        expect(hov.label).toContain(`px-[${L.hoverable.labelPaddingX}px]`)
    }
  })

  it('fades the whole component when disabled: 30% unchecked, 40% checked', () => {
    expect(parts({ disabled: true, checked: false }).root).toContain('opacity-30')
    expect(parts({ disabled: true, checked: true }).root).toContain('opacity-40')
    expect(parts({ disabled: true, checked: 'indeterminate' }).root).toContain('opacity-40')
    expect(parts({ disabled: true, checked: false }).hover).not.toContain(
      'group-hover/checkbox:bg-',
    )
  })

  it('Figma Focus: hover fill plus a 1px ring, keyboard only', () => {
    const on = parts({ checked: true, label: 'x' })
    expect(on.hover).toContain(CHECKBOX_FOCUS_RING_AREA)
    expect(on.hover).toContain(
      'group-has-[:focus-visible]/checkbox:bg-bg-selection-controls-hover-selected',
    )
    expect(on.box).not.toMatch(/outline/)
    expect(parts({ checked: false }).hover).toContain(
      'group-has-[:focus-visible]/checkbox:bg-bg-selection-controls-hover-rest',
    )
    const plain = parts({ checked: false, hoverable: false })
    expect(plain.box).toContain(CHECKBOX_FOCUS_RING_BOX)
    // Disabled controls can't take focus, so no ring.
    expect(Object.values(parts({ disabled: true, label: 'x' })).join(' ')).not.toMatch(/outline/)
    // Only keyboard focus, never a plain :focus ring.
    expect(on.hover).not.toMatch(/(^|\s)focus:/)
  })

  it('uses Figma motion', () => {
    const p = parts({ checked: false })
    expect(p.hover).toEqual(
      expect.stringContaining(
        'duration-[50ms] ease-figma-out group-hover/checkbox:duration-[70ms] group-hover/checkbox:ease-figma-in',
      ),
    )
    expect(p.box).toContain('duration-[50ms]')
    expect(parts({ checked: true }).box).toContain('duration-[10ms]')
  })

  it('keeps legacy sizes working', () => {
    render(<Checkbox size="sm" />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })
})
