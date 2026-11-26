import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { GroupInput } from '../group-input/group-input'
import { GroupInputField } from '../group-input/group-input-field'
import { GroupInputLeftCurrency } from '../group-input/group-input-left-currency'
import { GroupInputLeftFlag } from '../group-input/group-input-left-flag'
import { GroupInputLeftText } from '../group-input/group-input-left-text'
import { GroupInputRightText } from '../group-input/group-input-right-text'
import {
  GROUP_FIELD_CORNERS,
  GROUP_FIELD_GAP,
  GROUP_FIELD_LAYOUT,
  GROUP_FIELD_MOTION,
  GROUP_FIELD_STATES,
  GROUP_INPUT_FIGMA,
  GROUP_PANEL_CHEVRON,
  GROUP_PANEL_GAP,
  GROUP_PANEL_LAYOUT,
  GROUP_PANEL_MOTION,
  GROUP_PANEL_STATES,
  GROUP_PANEL_TEXT,
  type GroupInputSize,
} from '../group-input/group-input.figma'

const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/)
const field = () => screen.getByRole('textbox').parentElement!
const SIZES: GroupInputSize[] = ['sm', 'md', 'lg']
const RADIUS_TOKEN = { 7: 'sm-7', 8: 'sm-8', 10: 'lg-10' } as const
const radius = (size: GroupInputSize) => RADIUS_TOKEN[GROUP_FIELD_LAYOUT[size].radius as 7 | 8 | 10]

describe('GroupInputField matches Figma (991:22214)', () => {
  for (const size of SIZES) {
    const spec = GROUP_FIELD_LAYOUT[size]
    it(`${spec.figmaSize}: ${spec.height}px, ${spec.paddingX}px padding (− border), ${GROUP_FIELD_GAP}px gap, ${spec.text.style}, ${spec.icon}px icons`, () => {
      render(
        <GroupInputField
          aria-label="Phone"
          size={size}
          prefixIcon={<i />}
          suffix="icon"
          suffixIcon={<i />}
        />,
      )
      const c = classes(field())
      expect(c).toEqual(
        expect.arrayContaining([
          'border',
          `h-[${spec.height}px]`,
          `px-[${spec.paddingX - 1}px]`,
          `gap-[${GROUP_FIELD_GAP}px]`,
        ]),
      )
      expect(classes(screen.getByRole('textbox'))).toContain(`md:${spec.text.utility}`)
      for (const icon of field().querySelectorAll('span[aria-hidden]'))
        expect(classes(icon)).toContain(`size-[${spec.icon}px]`)
    })

    it(`${spec.figmaSize}: corners only on the outer side, ${spec.radius}px`, () => {
      for (const position of ['left', 'center', 'right'] as const) {
        const { unmount } = render(
          <GroupInputField aria-label="Phone" size={size} position={position} />,
        )
        const c = classes(field())
        const [tl, tr] = GROUP_FIELD_CORNERS[position]
        if (tl) expect(c).toContain(`rounded-l-${radius(size)}`)
        else if (tr) expect(c).toContain(`rounded-r-${radius(size)}`)
        else expect(c).toContain('rounded-none')
        unmount()
      }
    })

    it(`${spec.figmaSize}: the ✅ Button is the ${spec.button.px}px light Icon Button, right padding ${spec.buttonPaddingRight}px`, () => {
      render(
        <GroupInputField
          aria-label="Password"
          size={size}
          suffix="button"
          suffixButton={{ icon: <i />, 'aria-label': 'Show password' }}
        />,
      )
      const button = screen.getByRole('button', { name: 'Show password' })
      expect(classes(button)).toContain(`h-[${spec.button.px}px]`)
      expect(classes(button)).toContain('text-text-btn-default-light!')
      const pr = Math.max(spec.buttonPaddingRight - 1, 0)
      expect(classes(field())).toContain(pr ? `px-[${pr}px]` : 'pr-0')
    })
  }

  it('empty: placeholder tokens; hover only while empty (ease in); focus blue (ease out)', () => {
    render(<GroupInputField aria-label="Phone" prefixIcon={<i />} />)
    const c = classes(field())
    const { placeholder, hover, filled, focus } = GROUP_FIELD_STATES
    expect(c).toContain(`bg-${placeholder.bg}`)
    expect(c).toContain(`border-${placeholder.border}`)
    expect(c).toContain(`has-[input:placeholder-shown]:hover:border-${hover.border}`)
    expect(c).toContain(`has-[input:placeholder-shown]:hover:${GROUP_FIELD_MOTION.hoverIn}`)
    expect(c).toContain(`has-[input:not(:placeholder-shown)]:border-${filled.border}`)
    expect(c).toContain(`focus-within:border-${focus.border}!`)
    expect(c).toContain(`duration-${GROUP_FIELD_MOTION.duration}`)
    expect(c).toContain(GROUP_FIELD_MOTION.out)
    const prefix = classes(field().querySelector('span')!)
    expect(prefix).toContain(`text-${placeholder.prefix}`)
    expect(prefix).toContain(`group-focus-within/input:text-${focus.prefix}`)
  })

  it('error: error tokens and a red suffix icon', () => {
    render(<GroupInputField aria-label="Phone" aria-invalid suffix="icon" suffixIcon={<i />} />)
    expect(classes(field())).toContain(`border-${GROUP_FIELD_STATES.error.border}`)
    const suffix = field().querySelector('span[aria-hidden]')!
    expect(classes(suffix)).toContain(`text-${GROUP_FIELD_STATES.error.suffix}`)
  })

  it('disabled: disabled tokens, no opacity', () => {
    render(<GroupInputField aria-label="Phone" disabled />)
    const c = classes(field())
    expect(c).toContain(`bg-${GROUP_FIELD_STATES.disabled.bg}`)
    expect(c).toContain(`border-${GROUP_FIELD_STATES.disabled.border}`)
    expect(c.filter((x) => x.startsWith('opacity'))).toEqual([])
  })
})

describe('Group input panels match Figma (974:44159, 974:91945, 974:92276, 974:92414)', () => {
  for (const size of SIZES) {
    const spec = GROUP_PANEL_LAYOUT[size]
    it(`${size}: left panels ${spec.height}px, no right border, padding ${spec.left.paddingLeft}/${spec.left.paddingRight}, ${GROUP_PANEL_GAP}px gap`, () => {
      render(
        <>
          <GroupInputLeftCurrency value="USD" size={size} />
          <GroupInputLeftFlag countryCode="NG" size={size} />
          <GroupInputLeftText text="https://" size={size} />
        </>,
      )
      for (const panel of [
        screen.getByRole('button', { name: 'Currency: USD' }),
        screen.getByRole('button', { name: 'Country: NG' }),
        screen.getByText('https://'),
      ]) {
        expect(classes(panel)).toEqual(
          expect.arrayContaining([
            `h-[${spec.height}px]`,
            'border',
            'border-r-0',
            `pl-[${spec.left.paddingLeft - 1}px]`,
            `pr-[${spec.left.paddingRight}px]`,
            `gap-[${GROUP_PANEL_GAP}px]`,
            `rounded-l-${radius(size)}`,
          ]),
        )
      }
    })

    it(`${size}: right panel ${spec.height}px, no left border`, () => {
      render(<GroupInputRightText text="yourdomain.com" size={size} />)
      expect(classes(screen.getByText('yourdomain.com'))).toEqual(
        expect.arrayContaining([
          `h-[${spec.height}px]`,
          'border-l-0',
          `pl-[${spec.right.paddingX}px]`,
          `pr-[${spec.right.paddingX - 1}px]`,
          `rounded-r-${radius(size)}`,
        ]),
      )
    })

    it(`${size}: text styles (currency ${GROUP_PANEL_TEXT.currency[size].style}, helpers ${GROUP_PANEL_TEXT.helper[size].style})`, () => {
      render(
        <>
          <GroupInputLeftCurrency value="USD" size={size} />
          <GroupInputRightText text=".com" size={size} />
        </>,
      )
      const currency = classes(screen.getByRole('button'))
      expect(currency).toContain(GROUP_PANEL_TEXT.currency[size].utility)
      expect(currency).toContain('font-medium')
      expect(classes(screen.getByText('.com'))).toContain(GROUP_PANEL_TEXT.helper[size].utility)
    })
  }

  it('rest and hover tokens, 100ms ease out, on every panel', () => {
    render(<GroupInputRightText text=".com" />)
    const c = classes(screen.getByText('.com'))
    const { rest, hover } = GROUP_PANEL_STATES
    for (const token of [`bg-${rest.bg}`, `border-${rest.border}`, `text-${rest.text}`])
      expect(c).toContain(token)
    expect(c).toContain(`hover:bg-${hover.bg}`)
    expect(c).toContain(`hover:border-${hover.border}`)
    expect(c).toContain(`duration-${GROUP_PANEL_MOTION.duration}`)
    expect(c).toContain(GROUP_PANEL_MOTION.easing)
  })

  it('Currency and Flag: a 12px chevron-down after the value', () => {
    const { container } = render(<GroupInputLeftCurrency value="USD" />)
    const chevron = container.querySelector<HTMLElement>('button > span')!
    expect(chevron.style.maskImage).toContain(GROUP_PANEL_CHEVRON.icon)
    expect(chevron.style.width).toBe(`${GROUP_PANEL_CHEVRON.size}px`)
  })
})

describe('GroupInput matches Figma (1061:48573)', () => {
  it(`label, group and helper ${GROUP_INPUT_FIGMA.gap}px apart; the label names the field`, () => {
    const { container } = render(
      <GroupInput label="Phone" helperText="With the area code">
        <GroupInputLeftFlag countryCode="NG" />
        <GroupInputField />
      </GroupInput>,
    )
    expect(classes(container.firstElementChild!)).toContain(`gap-[${GROUP_INPUT_FIGMA.gap}px]`)
    expect(screen.getByRole('textbox', { name: 'Phone' })).toHaveAccessibleDescription(
      'With the area code',
    )
    expect(screen.getByRole('group', { name: 'Phone' })).toBeInTheDocument()
  })

  it('passes its size to the field and panels', () => {
    render(
      <GroupInput label="Site" size="lg">
        <GroupInputLeftText text="https://" />
        <GroupInputField />
      </GroupInput>,
    )
    expect(classes(field())).toContain('h-[40px]')
    expect(classes(screen.getByText('https://'))).toContain('h-[40px]')
  })

  it('an error turns the field red, is announced, and describes the field', () => {
    render(
      <GroupInput label="Phone" errorText="Enter a number">
        <GroupInputField />
      </GroupInput>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a number')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(classes(field())).toContain(`border-${GROUP_FIELD_STATES.error.border}`)
  })

  it('disabled reaches the field and the pickers, without fading', () => {
    const { container } = render(
      <GroupInput label="Phone" disabled>
        <GroupInputLeftFlag countryCode="NG" />
        <GroupInputField />
      </GroupInput>,
    )
    expect(screen.getByRole('textbox')).toBeDisabled()
    expect(screen.getByRole('button')).toBeDisabled()
    expect(container.innerHTML).not.toMatch(/opacity-/)
  })

  it('the pickers are buttons that open their list', () => {
    const onClick = vi.fn()
    render(<GroupInputLeftCurrency value="NGN" onClick={onClick} aria-haspopup="listbox" />)
    fireEvent.click(screen.getByRole('button', { name: 'Currency: NGN' }))
    expect(onClick).toHaveBeenCalled()
  })

  it('every token the spec names exists', () => {
    for (const state of Object.values(GROUP_FIELD_STATES))
      for (const token of Object.values(state))
        expect(globals, token).toContain(`--color-${token}:`)
    for (const state of Object.values(GROUP_PANEL_STATES))
      for (const token of Object.values(state))
        expect(globals, token).toContain(`--color-${token}:`)
    expect(globals).toContain('--color-text-btn-default-light:')
  })
})
