import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DateInput, EMPTY_DATE } from '../input/date-input'
import { LabelWrapper } from '../input/label-wrapper'
import { LABEL_FIGMA } from '../input/label-wrapper.figma'
import { TextInput } from '../input/text-input'
import { InputSelection } from '../input-selection/input-selection'

const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/)

describe('LabelWrapper matches Figma (5117:122194)', () => {
  it(`default: ${LABEL_FIGMA.height}px line, inset ${LABEL_FIGMA.paddingLeft}px, ${LABEL_FIGMA.colour.default}`, () => {
    render(<LabelWrapper label="Name" />)
    const c = classes(screen.getByText('Name'))
    expect(c).toContain(`h-[${LABEL_FIGMA.height}px]`)
    expect(c).toContain(`pl-[${LABEL_FIGMA.paddingLeft}px]`)
    expect(c).toContain(LABEL_FIGMA.label.utility)
    expect(c).toContain(LABEL_FIGMA.label.weight)
    expect(c).toContain(`text-${LABEL_FIGMA.colour.default}`)
  })

  it(`required: a ${LABEL_FIGMA.required.size}px red "*" ${LABEL_FIGMA.gap}px after the label, no space`, () => {
    render(<LabelWrapper label="Name" required />)
    const label = screen.getByText('Name')
    expect(classes(label)).toContain(`gap-[${LABEL_FIGMA.gap}px]`)
    const star = label.querySelector('[aria-hidden="true"]')!
    expect(star.textContent).toBe(LABEL_FIGMA.required.text)
    expect(classes(star)).toContain(LABEL_FIGMA.required.utility)
    expect(classes(star)).toContain(`text-${LABEL_FIGMA.required.colour}`)
    expect(label.textContent).toBe('Name*')
  })

  it('not required: no asterisk', () => {
    render(<LabelWrapper label="Name" />)
    expect(screen.getByText('Name').querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it(`prod: ${LABEL_FIGMA.colour.prod} title, subtext ${LABEL_FIGMA.subtext.gap}px below, padding ${LABEL_FIGMA.prodPaddingBottom.withSubtext}px`, () => {
    const { container } = render(<LabelWrapper label="Question" subtext="Pick one" prod />)
    expect(classes(screen.getByText('Question'))).toContain(`text-${LABEL_FIGMA.colour.prod}`)
    const root = classes(container.firstElementChild!)
    expect(root).toContain(`gap-[${LABEL_FIGMA.subtext.gap}px]`)
    expect(root).toContain(`pb-[${LABEL_FIGMA.prodPaddingBottom.withSubtext}px]`)
    expect(classes(screen.getByText('Pick one'))).toContain(`text-${LABEL_FIGMA.subtext.colour}`)
  })

  it(`prod without subtext: padding ${LABEL_FIGMA.prodPaddingBottom.without}px`, () => {
    const { container } = render(<LabelWrapper label="Question" prod />)
    expect(classes(container.firstElementChild!)).toContain(
      `pb-[${LABEL_FIGMA.prodPaddingBottom.without}px]`,
    )
  })
})

describe('the inputs share the Figma label and its Required asterisk', () => {
  const cases = {
    TextInput: (required: boolean) => <TextInput label="Field" required={required} />,
    InputSelection: (required: boolean) => (
      <InputSelection label="Field" required={required} options={[{ value: 'a', label: 'A' }]} />
    ),
    DateInput: (required: boolean) => (
      <DateInput label="Field" required={required} value={EMPTY_DATE} onChange={() => {}} />
    ),
  }
  for (const [name, make] of Object.entries(cases)) {
    it(`${name}: asterisk only when required`, () => {
      const { unmount } = render(make(true))
      const star = screen.getByText('Field').querySelector('[aria-hidden="true"]')
      expect(star?.textContent).toBe('*')
      expect(classes(star!)).toContain(LABEL_FIGMA.required.utility)
      unmount()
      render(make(false))
      expect(screen.getByText('Field').querySelector('[aria-hidden="true"]')).toBeNull()
    })
  }

  it('required reaches the field for screen readers', () => {
    render(<TextInput label="Name" required />)
    expect(screen.getByLabelText(/^Name/).getAttribute('aria-required')).toBe('true')
    render(<DateInput label="When" required value={EMPTY_DATE} onChange={() => {}} />)
    expect(screen.getAllByLabelText('Day').at(-1)!.hasAttribute('required')).toBe(true)
  })
})
