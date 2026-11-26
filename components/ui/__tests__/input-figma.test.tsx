import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { HelperText } from '../input/helper-text'
import { Input } from '../input/input'
import {
  HELPER_TEXT_FIGMA,
  INPUT_LAYOUT,
  INPUT_STATES,
  TEXT_INPUT_FIGMA,
  type InputSize,
} from '../input/input.figma'
import { TextInput } from '../input/text-input'

const SIZES: InputSize[] = ['sm', 'md', 'lg']
const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')

const field = (container: HTMLElement) => container.firstElementChild as HTMLElement
const classes = (el: Element) => el.className.split(/\s+/)

describe('Input field matches Figma (840:39704)', () => {
  for (const size of SIZES) {
    const spec = INPUT_LAYOUT[size]
    it(`${size}: ${spec.height}px tall, padding ${spec.paddingX} − 1px border, radius ${spec.radius}`, () => {
      const { container } = render(<Input size={size} />)
      const c = classes(field(container))
      expect(c).toContain(`h-[${spec.height}px]`)
      expect(c).toContain(`px-[${spec.paddingX - 1}px]`)
      expect(c).toContain('border')
      expect(c).toContain(`gap-[${spec.gap}px]`)
      expect(field(container).className).toMatch(new RegExp(`rounded-[a-z]+-${spec.radius}\\b`))
    })

    it(`${size}: text is ${spec.text.style} from md up (16px below, for iOS)`, () => {
      render(<Input size={size} aria-label="x" />)
      const c = classes(screen.getByLabelText('x'))
      expect(c).toContain(`md:${spec.text.utility}`)
      expect(c).toContain('text-[1rem]')
    })

    it(`${size}: prefix and suffix icons are ${spec.icon}px`, () => {
      const { container } = render(
        <Input size={size} prefixIcon={<i />} suffix="icon" suffixIcon={<b />} />,
      )
      const [prefix, , suffix] = [...field(container).children]
      expect(classes(prefix!)).toContain(`size-[${spec.icon}px]`)
      expect(classes(suffix!)).toContain(`size-[${spec.icon}px]`)
    })

    it(`${size}: a suffix button gets right padding ${spec.buttonPaddingRight} − 1px`, () => {
      const { container } = render(<Input size={size} suffix="button" suffixButton={<button />} />)
      const c = field(container).className
      const pr = spec.buttonPaddingRight - 1
      if (pr <= 0) expect(c).toMatch(/\bpr-0\b/)
      else expect(c).toContain(`pr-[${pr}px]`)
      expect(c).toContain(`pl-[${spec.paddingX - 1}px]`)
      if (pr < 0) {
        const slot = field(container).lastElementChild as HTMLElement
        expect(slot.className).toContain(`-mr-[${-pr}px]`)
      }
    })
  }

  it('empty (placeholder) state: Figma placeholder fill, border, text and prefix', () => {
    const { container } = render(<Input prefixIcon={<i />} aria-label="x" />)
    const c = classes(field(container))
    expect(c).toContain(`bg-${INPUT_STATES.placeholder.bg}`)
    expect(c).toContain(`border-${INPUT_STATES.placeholder.border}`)
    expect(classes(screen.getByLabelText('x'))).toContain(
      `placeholder:text-${INPUT_STATES.placeholder.text}`,
    )
    expect(classes(field(container).firstElementChild!)).toContain(
      `text-${INPUT_STATES.placeholder.prefix}`,
    )
  })

  it('filled state: switches fill, border and prefix once the input has text', () => {
    const { container } = render(<Input prefixIcon={<i />} aria-label="x" />)
    const c = classes(field(container))
    expect(c).toContain(`has-[input:not(:placeholder-shown)]:bg-${INPUT_STATES.filled.bg}`)
    expect(c).toContain(`has-[input:not(:placeholder-shown)]:border-${INPUT_STATES.filled.border}`)
    expect(classes(screen.getByLabelText('x'))).toContain(`text-${INPUT_STATES.filled.text}`)
    expect(classes(field(container).firstElementChild!)).toContain(
      `group-has-[input:not(:placeholder-shown)]/input:text-${INPUT_STATES.filled.prefix}`,
    )
  })

  it('a blank placeholder is set so an empty field counts as empty', () => {
    render(<Input aria-label="x" />)
    expect(screen.getByLabelText('x').getAttribute('placeholder')).toBe(' ')
  })

  it('hover only applies to an empty field, entering with ease-in', () => {
    const { container } = render(<Input />)
    const c = classes(field(container))
    expect(c).toContain(`has-[input:placeholder-shown]:hover:bg-${INPUT_STATES.hover.bg}`)
    expect(c).toContain(`has-[input:placeholder-shown]:hover:border-${INPUT_STATES.hover.border}`)
    expect(c).toContain('has-[input:placeholder-shown]:hover:ease-figma-in')
    expect(c.filter((x) => x.startsWith('hover:'))).toEqual([])
  })

  it('focus state: blue border, focus fill, ease-out, 100ms', () => {
    const { container } = render(<Input prefixIcon={<i />} />)
    const c = classes(field(container))
    expect(c).toContain(`focus-within:bg-${INPUT_STATES.focus.bg}!`)
    expect(c).toContain(`focus-within:border-${INPUT_STATES.focus.border}!`)
    expect(c).toContain('focus-within:ease-figma-out!')
    expect(c).toContain('duration-100')
    expect(c).toContain('ease-figma-out')
    expect(classes(field(container).firstElementChild!)).toContain(
      `group-focus-within/input:text-${INPUT_STATES.focus.prefix}`,
    )
  })

  it('error state (aria-invalid or status): error fill, border, red suffix icon', () => {
    for (const props of [{ 'aria-invalid': true as const }, { status: 'error' as const }]) {
      const { container, unmount } = render(
        <Input {...props} prefixIcon={<i />} suffix="icon" suffixIcon={<b />} />,
      )
      const c = classes(field(container))
      expect(c).toContain(`bg-${INPUT_STATES.error.bg}`)
      expect(c).toContain(`border-${INPUT_STATES.error.border}`)
      expect(classes(field(container).firstElementChild!)).toContain(
        `text-${INPUT_STATES.error.prefix}`,
      )
      expect(classes(field(container).lastElementChild!)).toContain(
        `text-${INPUT_STATES.error.suffix}`,
      )
      unmount()
    }
  })

  it('success state: green border and suffix icon', () => {
    const { container } = render(
      <Input status="success" prefixIcon={<i />} suffix="icon" suffixIcon={<b />} />,
    )
    const c = classes(field(container))
    expect(c).toContain(`bg-${INPUT_STATES.success.bg}`)
    expect(c).toContain(`border-${INPUT_STATES.success.border}`)
    expect(classes(field(container).firstElementChild!)).toContain(
      `text-${INPUT_STATES.success.prefix}`,
    )
    expect(classes(field(container).lastElementChild!)).toContain(
      `text-${INPUT_STATES.success.suffix}`,
    )
  })

  it('disabled state: disabled fill and border, 20% text, no opacity on the field', () => {
    const { container } = render(<Input disabled prefixIcon={<i />} aria-label="x" />)
    const c = classes(field(container))
    expect(c).toContain(`bg-${INPUT_STATES.disabled.bg}`)
    expect(c).toContain(`border-${INPUT_STATES.disabled.border}`)
    expect(c.filter((x) => x.startsWith('opacity'))).toEqual([])
    expect(classes(screen.getByLabelText('x'))).toContain(
      `disabled:text-${INPUT_STATES.disabled.text}`,
    )
    expect(classes(field(container).firstElementChild!)).toContain(
      `text-${INPUT_STATES.disabled.prefix}`,
    )
  })

  it('draws no ring, outline or shadow', () => {
    const { container } = render(<Input aria-label="x" />)
    expect(field(container).className).not.toMatch(/\b(ring|shadow|outline)-/)
  })

  it('every token the spec names exists', () => {
    for (const state of Object.values(INPUT_STATES)) {
      for (const token of Object.values(state)) {
        expect(globals, token).toContain(`--color-${token}:`)
      }
    }
  })
})

describe('TextInput matches Figma (1053:47802)', () => {
  it('stacks label, field and helper 6px apart; label inset 3px, weight 550, tertiary', () => {
    const { container } = render(<TextInput label="Name" helperText="Help" />)
    const root = container.firstElementChild as HTMLElement
    expect(classes(root)).toContain(`gap-[${TEXT_INPUT_FIGMA.gap}px]`)
    const label = screen.getByText('Name')
    expect(classes(label)).toContain('pl-[3px]')
    expect(classes(label)).toContain('font-medium-550')
    expect(classes(label)).toContain(`text-${TEXT_INPUT_FIGMA.label.colour}`)
  })

  it('helperState="success" puts the field in its success state', () => {
    const { container } = render(
      <TextInput label="Name" helperText="Looks good" helperState="success" />,
    )
    expect(container.innerHTML).toContain('border-border-input-success')
  })

  it('errorText puts the field in its error state', () => {
    const { container } = render(<TextInput label="Name" errorText="Required" />)
    expect(container.innerHTML).toContain('border-border-input-error')
  })
})

describe('HelperText matches Figma (1061:48521)', () => {
  for (const [state, colour] of Object.entries(HELPER_TEXT_FIGMA.colour)) {
    it(`${state} is ${colour}, inset 3px`, () => {
      const { container } = render(
        <HelperText state={state as keyof typeof HELPER_TEXT_FIGMA.colour}>Hi</HelperText>,
      )
      const c = classes(container.firstElementChild!)
      expect(c).toContain(`text-${colour}`)
      expect(c).toContain('pl-[3px]')
      expect(c).toContain('gap-[2px]')
    })
  }

  it('success shows the solid check-circle at 10px in text-success', () => {
    const { container } = render(<HelperText state="success">Done</HelperText>)
    const icon = container.querySelector('.text-text-success')!
    expect(icon).not.toBeNull()
    const mask = icon.firstElementChild as HTMLElement
    expect(mask.getAttribute('style')).toContain('check-circle-solid')
    expect(mask.getAttribute('style')).toContain('10px')
  })
})
