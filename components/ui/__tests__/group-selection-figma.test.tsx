import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { GroupInput } from '../group-input/group-input'
import { GroupInputLeftFlag } from '../group-input/group-input-left-flag'
import { GroupInputRightText } from '../group-input/group-input-right-text'
import { GROUP_FIELD_CORNERS, type GroupInputSize } from '../group-input/group-input.figma'
import { GroupSelectionField } from '../group-input/group-selection-field'
import {
  GROUP_SELECTION_FIGMA,
  GROUP_SELECTION_GAP,
  GROUP_SELECTION_LAYOUT,
  GROUP_SELECTION_MOTION,
  GROUP_SELECTION_STATES,
  GROUP_SELECTION_TAGS,
} from '../group-input/group-selection.figma'

const tokens = readFileSync(join(process.cwd(), 'styles/design-system/tokens.css'), 'utf8')
const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/)
const combo = () => screen.getByRole('combobox')
const SIZES: GroupInputSize[] = ['sm', 'md', 'lg']
const OPTIONS = [
  { value: 'ng', label: 'Nigeria' },
  { value: 'ke', label: 'Kenya' },
]
const RADIUS_TOKEN = { 7: 'sm-7', 8: 'sm-8' } as const

describe('GroupSelectionField matches Figma (1061:49770)', () => {
  for (const size of SIZES) {
    const spec = GROUP_SELECTION_LAYOUT[size]
    it(`${spec.figmaSize}: ${spec.height}px, ${spec.paddingX}px padding (− border), ${GROUP_SELECTION_GAP}px gap, ${spec.text.style}, ${spec.icon}px icons`, () => {
      render(
        <GroupSelectionField
          aria-label="Country"
          size={size}
          options={OPTIONS}
          showPrefixIcon
          prefixIcon={<i />}
        />,
      )
      const c = classes(combo())
      expect(c).toEqual(
        expect.arrayContaining([
          'border',
          `h-[${spec.height}px]`,
          `px-[${spec.paddingX - 1}px]`,
          `gap-[${GROUP_SELECTION_GAP}px]`,
        ]),
      )
      expect(combo().querySelector(`.${spec.text.utility}`)).not.toBeNull()
      for (const icon of combo().querySelectorAll(':scope > span[aria-hidden]'))
        expect(classes(icon)).toContain(`size-[${spec.icon}px]`)
    })

    for (const position of ['left', 'center', 'right'] as const) {
      it(`${spec.figmaSize}, ${position}: corners ${GROUP_FIELD_CORNERS[position].join('')} at ${spec.radius}px`, () => {
        render(
          <GroupSelectionField
            aria-label="Country"
            size={size}
            position={position}
            options={OPTIONS}
          />,
        )
        const c = classes(combo())
        const token = RADIUS_TOKEN[spec.radius as 7 | 8]
        const expected =
          position === 'center'
            ? 'rounded-none'
            : `rounded-${position === 'right' ? 'r' : 'l'}-${token}`
        expect(c).toContain(expected)
        // Only the outer side: no all-round radius.
        expect(c.filter((x) => /^rounded-(sm|lg)-/.test(x))).toEqual([])
      })
    }
  }

  it('40px uses 7px corners (Figma), not the plain field’s 10px', () => {
    expect(GROUP_SELECTION_LAYOUT.lg.radius).toBe(7)
    render(<GroupSelectionField aria-label="Country" size="lg" options={OPTIONS} />)
    expect(classes(combo())).not.toContain('rounded-r-lg-10')
  })

  const STATE_CASES = [
    ['placeholder', {}],
    ['filled', { defaultValue: 'ng' }],
    ['disabled', { disabled: true }],
    ['error', { invalid: true }],
  ] as const
  for (const [state, props] of STATE_CASES) {
    const spec = GROUP_SELECTION_STATES[state]
    it(`${state}: ${spec.bg}, ${spec.border}, chevron ${spec.chevron}`, () => {
      render(<GroupSelectionField aria-label="Country" options={OPTIONS} {...props} />)
      const c = classes(combo())
      expect(c).toContain(`bg-${spec.bg}`)
      expect(c).toContain(`border-${spec.border}`)
      const chevron = combo().querySelector(':scope > span[aria-hidden]:last-child')!
      expect(classes(chevron)).toContain(`text-${spec.chevron}`)
      expect(c.some((x) => /^opacity-/.test(x))).toBe(false)
    })
  }

  it('focus (list open): the focus fill and border', () => {
    render(<GroupSelectionField aria-label="Country" options={OPTIONS} />)
    fireEvent.click(combo())
    const c = classes(combo())
    expect(c).toContain(`bg-${GROUP_SELECTION_STATES.focus.bg}`)
    expect(c).toContain(`border-${GROUP_SELECTION_STATES.focus.border}`)
  })

  it(`hover: ${GROUP_SELECTION_STATES.hover.border}, ${GROUP_SELECTION_MOTION.duration}ms ${GROUP_SELECTION_MOTION.easing} both ways`, () => {
    render(<GroupSelectionField aria-label="Country" options={OPTIONS} />)
    const c = classes(combo())
    expect(c).toContain(`hover:border-${GROUP_SELECTION_STATES.hover.border}`)
    expect(c).toContain(`hover:bg-${GROUP_SELECTION_STATES.hover.bg}`)
    expect(c).toContain(`duration-${GROUP_SELECTION_MOTION.duration}`)
    expect(c).toContain(GROUP_SELECTION_MOTION.easing)
    expect(c).toContain(`hover:${GROUP_SELECTION_MOTION.easing}`)
    expect(c).not.toContain('hover:ease-figma-in')
  })

  it(`with selection, empty: ${GROUP_SELECTION_TAGS.placeholder} text and no prefix`, () => {
    render(
      <GroupSelectionField
        aria-label="Countries"
        options={OPTIONS}
        multiple
        placeholder="Search for an option..."
      />,
    )
    const text = screen.getByText('Search for an option...')
    expect(classes(text)).toContain(`text-${GROUP_SELECTION_TAGS.placeholder}`)
  })

  it(`with selection: ${GROUP_SELECTION_TAGS.colour} tags ${GROUP_SELECTION_TAGS.gap}px apart`, () => {
    render(
      <GroupSelectionField
        aria-label="Countries"
        options={OPTIONS}
        multiple
        defaultValue={['ng', 'ke']}
      />,
    )
    const row = screen.getByText('Nigeria').closest('span.inline-flex.gap-\\[2px\\]')
    expect(row).not.toBeNull()
  })

  it('the with-tags placeholder token exists in light and both dark blocks, and is mapped', () => {
    const name = GROUP_SELECTION_TAGS.placeholder
    expect(tokens.match(new RegExp(`--${name}:`, 'g'))?.length).toBe(3)
    expect(tokens).toContain(`--${name}: var(--color-dark-grey-9)`)
    expect(tokens).toContain(`--${name}: var(--color-dark-grey-8)`)
    expect(globals).toContain(`--color-${name}: var(--${name})`)
  })

  it('every state token is mapped in globals.css', () => {
    for (const s of Object.values(GROUP_SELECTION_STATES))
      for (const [kind, token] of [
        ['bg', s.bg],
        ['border', s.border],
        ['text', s.text],
        ['text', s.chevron],
      ] as const)
        expect(globals, `${kind} ${token}`).toContain(`--color-${token}:`)
  })
})

describe('GroupSelectionField in a GroupInput (1066:50424)', () => {
  it(`label, row and an un-inset helper ${GROUP_SELECTION_FIGMA.gap}px apart; the label names the field`, () => {
    const { container } = render(
      <GroupInput label="Country" helperText="Where you live" helperInset={false} size="sm">
        <GroupInputLeftFlag countryCode="NG" />
        <GroupSelectionField position="center" options={OPTIONS} />
        <GroupInputRightText text="+234" />
      </GroupInput>,
    )
    expect(classes(container.firstElementChild!)).toContain(`gap-[${GROUP_SELECTION_FIGMA.gap}px]`)
    expect(combo()).toHaveAccessibleName('Country')
    expect(combo()).toHaveAccessibleDescription('Where you live')
    expect(classes(combo())).toContain('h-[25px]')
    expect(classes(combo())).toContain('rounded-none')
    const helper = screen.getByText('Where you live').closest('[id]')!
    expect(classes(helper)).not.toContain('pl-[3px]')
  })

  it('a group error turns the field red and is announced', () => {
    render(
      <GroupInput label="Country" errorText="Pick a country" helperInset={false}>
        <GroupSelectionField options={OPTIONS} />
      </GroupInput>,
    )
    expect(classes(combo())).toContain(`bg-${GROUP_SELECTION_STATES.error.bg}`)
    expect(combo()).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a country')
  })

  it('a disabled group disables the field', () => {
    render(
      <GroupInput label="Country" disabled helperInset={false}>
        <GroupSelectionField options={OPTIONS} />
      </GroupInput>,
    )
    expect(combo()).toBeDisabled()
  })

  it('picking an option shows it and closes the list', () => {
    render(
      <GroupInput label="Country" helperInset={false}>
        <GroupSelectionField options={OPTIONS} />
      </GroupInput>,
    )
    fireEvent.click(combo())
    fireEvent.click(screen.getByText('Kenya'))
    expect(combo()).toHaveTextContent('Kenya')
    expect(combo()).toHaveAttribute('aria-expanded', 'false')
  })
})
