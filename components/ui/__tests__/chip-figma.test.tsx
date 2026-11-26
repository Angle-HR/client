import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Chip } from '../tags/chip'
import { ChipRemoveButton } from '../tags/chip-remove-button'
import {
  CHIP_FIGMA,
  CHIP_FILLS,
  CHIP_LAYOUT,
  CHIP_LOADING,
  CHIP_REMOVE_FIGMA,
  CHIP_TEXT,
  type ChipFill,
} from '../tags/chip.figma'

import { missingTokens } from './figma-spec'

// Checks chip.tsx and chip-remove-button.tsx against the Figma spec in chip.figma.ts.

const icon = <span data-testid="icon">I</span>

function parts(props: Partial<Parameters<typeof Chip>[0]>) {
  const { container, unmount } = render(<Chip label="Chip" icon={icon} {...props} />)
  const root = container.firstElementChild as HTMLElement
  const main = root.firstElementChild as HTMLElement
  const spans = Array.from(main.children) as HTMLElement[]
  const iconWrap = spans.find((s) => s.querySelector('.size-\\[14px\\]')) ?? null
  const label = spans.find((s) => s.textContent === 'Chip' && s.tagName === 'SPAN') ?? null
  const out = {
    root: root.className,
    main: main.className,
    mainTag: main.tagName,
    iconWrap: iconWrap?.className ?? null,
    iconBox: (iconWrap?.firstElementChild as HTMLElement | null)?.className ?? null,
    hasGlyph: !!root.querySelector('[data-testid="icon"]'),
    label: label?.className ?? null,
    button: root.querySelector('button')?.className ?? null,
  }
  unmount()
  return out
}

const bgClass = (t: string | null) => (t ? `bg-${t}` : 'bg-transparent')

describe('Chip matches Figma', () => {
  it('every token exists', () => {
    const names = [
      ...Object.values(CHIP_FIGMA).flatMap((f) => [f.rest, f.hover, f.disabled]),
      CHIP_TEXT.rest,
      CHIP_TEXT.muted,
      CHIP_LOADING.from,
      CHIP_LOADING.to,
      ...Object.values(CHIP_REMOVE_FIGMA).flatMap((c) => [c.rest.icon, c.hover.bg, c.hover.icon]),
    ].filter((n): n is string => !!n)
    for (const n of names) {
      expect(missingTokens({ rest: { bg: n, border: 'transparent', fg: 'transparent' } })).toEqual(
        [],
      )
    }
  })

  it(`layout: ${CHIP_LAYOUT.height}px tall, ${CHIP_LAYOUT.radius}px radius, ${CHIP_LAYOUT.paddingLeft}px left padding`, () => {
    const p = parts({})
    expect(p.root).toContain('h-[20px]')
    expect(p.root).toContain('rounded-sm-7')
    expect(p.main).toContain('pl-[3px]')
    expect(p.iconWrap).toContain('pr-[3px]')
    expect(p.iconBox).toContain('size-[14px]')
    expect(p.iconBox).toContain('rounded-xs-4')
    expect(p.label).toContain('text-body-s')
    expect(p.label).toContain('pl-[1px]')
    expect(p.label).toContain('pr-[4px]')
    expect(p.label).toContain('text-trim-cap')
    expect(p.label).toContain('whitespace-nowrap')
    expect(parts({ removable: true }).label).toContain('pr-[2px]')
  })

  for (const fill of CHIP_FILLS as ChipFill[]) {
    const f = CHIP_FIGMA[fill]
    it(`${fill}: rest, hover and disabled fills`, () => {
      const rest = parts({ fill })
      expect(rest.root).toContain(bgClass(f.rest))
      if (f.hover) {
        expect(rest.root).toContain(`hover:bg-${f.hover}`)
        expect(parts({ fill, state: 'hover' }).root).toContain(`bg-${f.hover}`)
      } else {
        expect(rest.root).not.toContain('hover:bg-')
      }
      const disabled = parts({ fill, disabled: true })
      expect(disabled.root).toContain(bgClass(f.disabled))
      expect(disabled.root).not.toContain('hover:bg-')
      expect(disabled.label).toContain(`text-${CHIP_TEXT.muted}`)
    })

    it(`${fill}: placeholder keeps the rest fill and greys the label`, () => {
      const p = parts({ fill, state: 'placeholder' })
      expect(p.root).toContain(bgClass(f.rest))
      expect(p.label).toContain(`text-${CHIP_TEXT.muted}`)
      expect(p.root).not.toContain('opacity-')
    })
  }

  it('label is text-primary, Regular or Medium', () => {
    expect(parts({}).label).toContain(`text-${CHIP_TEXT.rest}`)
    expect(parts({}).label).toContain('font-regular')
    expect(parts({ boldText: true }).label).toContain('font-medium')
  })

  it('oddity: Placeholder Accent and Green (Regular) put 3px between icon and label', () => {
    expect(parts({ fill: 'accent', state: 'placeholder' }).main).toContain('gap-[3px]')
    expect(parts({ fill: 'green', state: 'placeholder' }).main).toContain('gap-[3px]')
    expect(parts({ fill: 'default', state: 'placeholder' }).main).not.toContain('gap-[3px]')
    expect(parts({ fill: 'accent', state: 'placeholder', boldText: true }).main).not.toContain(
      'gap-[3px]',
    )
  })

  it('oddity: disabled Medium keeps the icon space but hides the glyph', () => {
    const p = parts({ disabled: true, boldText: true })
    expect(p.iconBox).toContain('size-[14px]')
    expect(p.hasGlyph).toBe(false)
    expect(parts({ disabled: true }).hasGlyph).toBe(true)
  })

  it('loading: a 60.09×14 gradient bar, 3px in from each side, no fill', () => {
    const { container } = render(<Chip label="Chip" state="loading" />)
    const root = container.firstElementChild as HTMLElement
    const bar = root.firstElementChild as HTMLElement
    expect(root.getAttribute('role')).toBe('status')
    expect(root.className).toContain('px-[3px]')
    expect(root.className).not.toMatch(/bg-bg-/)
    for (const c of ['h-[14px]', 'w-[60.09px]', 'rounded-xs-4']) expect(bar.className).toContain(c)
    expect(bar.className).toContain(`from-${CHIP_LOADING.from}`)
    expect(bar.className).toContain(`to-${CHIP_LOADING.to}`)
    // Not in Figma: a sweeping highlight, hidden with reduced motion.
    const sheen = bar.firstElementChild as HTMLElement
    expect(sheen.className).toContain('animate-shimmer')
    expect(sheen.className).toContain('motion-reduce:hidden')
    expect(bar.className).toContain('overflow-hidden')
  })

  it('uses Figma motion: 50ms, ease in on hover, ease out after', () => {
    const p = parts({})
    expect(p.root).toContain('duration-[50ms] ease-figma-out hover:ease-figma-in')
  })

  it('remove button is always visible; accent chips use the grey-then-blue x', () => {
    const p = parts({ removable: true })
    expect(p.button).not.toContain('opacity-0')
    expect(p.button).toContain(`text-${CHIP_REMOVE_FIGMA.empty.rest.icon}`)
    const a = parts({ fill: 'accent', removable: true })
    expect(a.button).toContain(`text-${CHIP_REMOVE_FIGMA.empty.rest.icon}`)
    expect(a.button).toContain(`group-hover/chip:text-${CHIP_REMOVE_FIGMA.blue.rest.icon}`)
  })

  it('focus ring (not in Figma) only on a clickable chip', () => {
    expect(parts({}).root).not.toContain('focus-visible:')
    const c = parts({ onClick: () => {} })
    expect(c.mainTag).toBe('BUTTON')
    expect(c.root).toContain('has-[[data-chip-main]:focus-visible]:outline-1')
  })

  it('a clickable, removable chip has two sibling buttons, not one inside the other', () => {
    const { container } = render(
      <Chip label="Chip" onClick={() => {}} removable onRemove={() => {}} />,
    )
    const buttons = container.querySelectorAll('button')
    expect(buttons).toHaveLength(2)
    expect(container.querySelector('button button')).toBeNull()
    expect(buttons[0]!.parentElement).toBe(buttons[1]!.parentElement)
    expect(buttons[0]!.className).toContain('rounded-l-sm-7')
  })
})

describe('ChipRemoveButton matches Figma', () => {
  function cls(props: Partial<Parameters<typeof ChipRemoveButton>[0]>) {
    const { container, unmount } = render(<ChipRemoveButton aria-label="x" {...props} />)
    const c = container.querySelector('button')!.className
    unmount()
    return c
  }
  const L = CHIP_LAYOUT.remove

  it(`${L.size}×${L.size}, ${L.padding}px padding, rounded 0/7/7/0, 150ms ease out`, () => {
    const c = cls({})
    expect(c).toContain('size-[20px]')
    expect(c).toContain('p-[3px]')
    expect(c).toContain('rounded-r-sm-7')
    expect(c).toContain('duration-150 ease-figma-out')
  })

  it('empty and blue colours, rest and hover', () => {
    const e = CHIP_REMOVE_FIGMA.empty
    const empty = cls({ color: 'empty' })
    expect(empty).toContain(`text-${e.rest.icon}`)
    expect(empty).toContain(`hover:bg-${e.hover.bg}`)
    expect(empty).toContain(`hover:text-${e.hover.icon}`)
    expect(cls({ color: 'empty', state: 'hover' })).toContain(`bg-${e.hover.bg}`)

    const b = CHIP_REMOVE_FIGMA.blue
    const blue = cls({ color: 'blue' })
    expect(blue).toContain(`text-${b.rest.icon}`)
    expect(blue).toContain(`hover:bg-${b.hover.bg}`)
  })

  it('transparent state hides it', () => {
    expect(cls({ state: 'transparent' })).toContain('opacity-0')
  })
})
