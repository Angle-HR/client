import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SelectionField } from '../input-selection/selection-field'
import {
  SELECTION_CHEVRON,
  SELECTION_LAYOUT,
  SELECTION_STATES,
  SELECTION_TAGS,
  type SelectionState,
} from '../input-selection/selection-field.figma'

const SIZES = ['sm', 'md', 'lg'] as const
const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/)

function parts(container: HTMLElement) {
  const field = container.firstElementChild as HTMLElement
  const prefix = field.querySelector('[aria-hidden="true"]') as HTMLElement | null
  const chevron = field.lastElementChild as Element
  return { field, prefix, chevron }
}

describe('SelectionField matches Figma (915:21577)', () => {
  for (const size of SIZES) {
    const spec = SELECTION_LAYOUT[size]
    it(`${size}: ${spec.height}px tall, padding ${spec.paddingX} − 1px, radius ${spec.radius}, ${spec.text.style}`, () => {
      const { container } = render(
        <SelectionField size={size} placeholder="Pick" showPrefixIcon prefixIcon={<i />} />,
      )
      const { field, prefix, chevron } = parts(container)
      const c = classes(field)
      expect(c).toContain(`h-[${spec.height}px]`)
      expect(c).toContain(`px-[${spec.paddingX - 1}px]`)
      expect(c).toContain(`gap-[${spec.gap}px]`)
      expect(field.className).toMatch(new RegExp(`rounded-[a-z]+-${spec.radius}\\b`))
      expect(classes(screen.getByText('Pick'))).toContain(spec.text.utility)
      expect(classes(prefix!)).toContain(`size-[${spec.icon}px]`)
      expect(classes(chevron)).toContain(`size-[${spec.icon}px]`)
    })
  }

  const cases: { name: SelectionState; props: Record<string, unknown> }[] = [
    { name: 'placeholder', props: {} },
    { name: 'filled', props: { value: 'Lagos' } },
    { name: 'hover', props: { state: 'hover' } },
    { name: 'focus', props: { state: 'focus' } },
    { name: 'disabled', props: { disabled: true } },
    { name: 'error', props: { state: 'error' } },
  ]
  for (const { name, props } of cases) {
    const spec = SELECTION_STATES[name]
    it(`${name}: fill, border, prefix and chevron`, () => {
      const { container } = render(
        <SelectionField placeholder="Pick" showPrefixIcon prefixIcon={<i />} {...props} />,
      )
      const { field, prefix, chevron } = parts(container)
      const c = classes(field)
      expect(c).toContain(`bg-${spec.bg}`)
      expect(c).toContain(`border-${spec.border}`)
      expect(classes(prefix!)).toContain(`text-${spec.prefix}`)
      expect(classes(chevron)).toContain(`text-${spec.chevron}`)
    })
  }

  for (const size of SIZES) {
    const px = SELECTION_LAYOUT[size].icon
    it(`${size}: the chevron is ${SELECTION_CHEVRON.icon} in a ${px}px frame, not stretched to fill it`, () => {
      const { chevron } = parts(render(<SelectionField size={size} />).container)
      const mask = chevron.firstElementChild as HTMLElement
      expect(mask.getAttribute('style')).toContain(`${SELECTION_CHEVRON.icon}.svg`)
      expect(mask.getAttribute('style')).toContain(`${px}px`)
      expect(chevron.querySelector('svg')).toBeNull()
    })
  }

  it('the value is dark and the placeholder grey', () => {
    render(<SelectionField value="Lagos" />)
    expect(classes(screen.getByText('Lagos'))).toContain(`text-${SELECTION_STATES.filled.text}`)
    render(<SelectionField placeholder="Pick" />)
    expect(classes(screen.getByText('Pick'))).toContain(`text-${SELECTION_STATES.placeholder.text}`)
  })

  it('hover only applies to an empty field, entering with ease-in', () => {
    const empty = classes(parts(render(<SelectionField />).container).field)
    expect(empty).toContain(`hover:bg-${SELECTION_STATES.hover.bg}`)
    expect(empty).toContain(`hover:border-${SELECTION_STATES.hover.border}`)
    expect(empty).toContain('hover:ease-figma-in')
    const filled = classes(parts(render(<SelectionField value="x" />).container).field)
    expect(filled.filter((x) => x.startsWith('hover:'))).toEqual([])
  })

  it('keyboard focus and an open list give the focus state; 100ms ease-out', () => {
    const c = classes(parts(render(<SelectionField />).container).field)
    expect(c).toContain(`focus-visible:border-${SELECTION_STATES.focus.border}!`)
    expect(c).toContain(`focus-within:border-${SELECTION_STATES.focus.border}!`)
    expect(c).toContain('duration-100')
    expect(c).toContain('ease-figma-out')
  })

  it('disabled: no opacity on the field', () => {
    const c = classes(parts(render(<SelectionField disabled />).container).field)
    expect(c.filter((x) => x.startsWith('opacity'))).toEqual([])
  })

  it(`with selection: tags ${SELECTION_TAGS.gap}px apart`, () => {
    const { container } = render(<SelectionField withSelection tags={[<b key="a">A</b>]} />)
    expect(classes(screen.getByText('A').parentElement!)).toContain(`gap-[${SELECTION_TAGS.gap}px]`)
    expect(classes(parts(container).field)).toContain(`bg-${SELECTION_STATES.filled.bg}`)
  })

  it('draws no ring, outline or shadow', () => {
    const { field } = parts(render(<SelectionField />).container)
    expect(field.className).not.toMatch(/\b(ring|shadow)-/)
    expect(field.className).not.toMatch(/(^|\s)outline-(?!none)/)
  })

  it('every token the spec names exists', () => {
    for (const state of Object.values(SELECTION_STATES)) {
      for (const token of Object.values(state)) {
        expect(globals, token).toContain(`--color-${token}:`)
      }
    }
  })
})

describe('InputSelection tags match Figma (915:21577, with-selection)', () => {
  it(`chosen values are ${SELECTION_TAGS.colour} tags`, async () => {
    const { InputSelection } = await import('../input-selection/input-selection')
    const { container } = render(
      <InputSelection
        label="Skills"
        multiple
        withSelection
        options={[{ value: 'a', label: 'Alpha' }]}
        defaultValue={['a']}
      />,
    )
    expect(container.innerHTML).toContain(`bg-bg-tags-${SELECTION_TAGS.colour}`)
  })
})
