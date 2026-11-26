import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RADIO_FOCUS_RING } from '../selection-controls/focus'
import { RadioButton } from '../selection-controls/radio-button'
import { RADIO_FIGMA, RADIO_LAYOUT, type RadioSize } from '../selection-controls/radio-button.figma'

import { missingTokens, type States } from './figma-spec'

// Checks radio-button.tsx against the Figma spec in radio-button.figma.ts.

function parts(props: Parameters<typeof RadioButton>[0]) {
  const { container, unmount } = render(<RadioButton name="r" onChange={() => {}} {...props} />)
  const root = container.querySelector('label')!
  const area = root.querySelector(':scope > span') as HTMLElement
  const circle = area.querySelector(':scope > span') as HTMLElement
  const label = root.querySelector(':scope > span + span') as HTMLElement | null
  const out = {
    root: root.className,
    area: area.className,
    circle: circle.className,
    dot: (circle.firstElementChild as HTMLElement | null)?.className ?? null,
    label: label?.className ?? '',
  }
  unmount()
  return out
}

const sizes: RadioSize[] = ['sm', 'md']

describe('RadioButton matches Figma', () => {
  it('every token exists', () => {
    const f = RADIO_FIGMA
    const states: States = {
      rest: { bg: f.selected.bg, border: f.unselected.border, fg: f.label.color },
      hover: { bg: f.hover.unselected, border: f.disabledSelectedBorder, fg: f.label.color },
      selected: { bg: f.hover.selected, border: 'transparent', fg: f.label.color },
    }
    expect(missingTokens(states)).toEqual([])
  })

  for (const size of sizes) {
    const L = RADIO_LAYOUT[size]
    it(`${size}: area, circle, colours and hover`, () => {
      const off = parts({ size, checked: false })
      expect(off.area).toContain(`size-[${L.area}px]`)
      expect(off.area).toContain('rounded-full')
      expect(off.circle).toContain(`size-[${L.circle}px]`)
      expect(off.circle).toContain('bg-transparent')
      expect(off.circle).toContain(
        `shadow-[inset_0_0_0_1px_var(--color-${RADIO_FIGMA.unselected.border})]`,
      )
      expect(off.dot).toBeNull()
      expect(off.area).toContain(`group-hover/radio:bg-${RADIO_FIGMA.hover.unselected}`)

      const on = parts({ size, checked: true })
      expect(on.circle).toContain(`bg-${RADIO_FIGMA.selected.bg}`)
      expect(on.circle).toContain('shadow-none')
      expect(on.dot).toContain('size-[7.63px]')
      expect(on.dot).toContain('bg-white')
      expect(on.area).toContain(`group-hover/radio:bg-${RADIO_FIGMA.hover.selected}`)
    })

    it(`${size}: label is primary, Regular, ${L.fontSize}px, trimmed, 3px either side`, () => {
      const p = parts({ size, label: 'Remote' })
      expect(p.label).toContain('text-text-primary')
      expect(p.label).toContain('font-regular')
      expect(p.label).toContain(size === 'sm' ? 'text-body-s' : 'text-body-m')
      expect(p.label).toContain('text-trim-cap')
      expect(p.label).toContain(`px-[${L.labelPaddingX}px]`)
    })
  }

  it('fades to 30% when disabled, the radio again when labelled, and stops hover', () => {
    const plain = parts({ disabled: true })
    expect(plain.root).toContain('opacity-30')
    expect(plain.area).not.toContain('opacity-30')
    expect(plain.area).not.toContain('group-hover/radio:bg-')
    const labelled = parts({ disabled: true, label: 'x' })
    expect(labelled.area).toContain('opacity-30')
    expect(parts({ disabled: true, checked: true }).circle).toContain(
      `shadow-[inset_0_0_0_1px_var(--color-${RADIO_FIGMA.disabledSelectedBorder})]`,
    )
  })

  it('Figma Focus: hover fill plus a 1px ring, keyboard only', () => {
    const on = parts({ checked: true, label: 'x' })
    expect(on.area).toContain(RADIO_FOCUS_RING)
    expect(on.area).toContain(
      'group-has-[:focus-visible]/radio:bg-bg-selection-controls-hover-selected',
    )
    expect(parts({}).area).toContain(
      'group-has-[:focus-visible]/radio:bg-bg-selection-controls-hover-rest',
    )
    expect([on.root, on.circle, on.label].join(' ')).not.toMatch(/outline/)
    expect(parts({ disabled: true, label: 'x' }).area).not.toMatch(/outline/)
  })

  it('uses Figma motion', () => {
    const p = parts({})
    expect(p.area).toContain('duration-100 ease-figma-out group-hover/radio:ease-figma-in')
    expect(p.circle).toContain('duration-[50ms] ease-figma-out')
  })
})
