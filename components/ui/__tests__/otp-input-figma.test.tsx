import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { OTPCell } from '../otp-input/otp-cell'
import { OTPInput } from '../otp-input/otp-input'
import {
  OTP_CELL_LAYOUT,
  OTP_CELL_MOTION,
  OTP_CELL_STATES,
  OTP_INPUT_FIGMA,
  type OTPCellState,
} from '../otp-input/otp-input.figma'

const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/)
const cells = () => screen.getAllByRole('textbox')

describe('OTPCell matches Figma (2711:39040)', () => {
  it(`${OTP_CELL_LAYOUT.width}×${OTP_CELL_LAYOUT.height}px, ${OTP_CELL_LAYOUT.paddingX}px padding (− border), ${OTP_CELL_LAYOUT.radius}px corners, ${OTP_CELL_LAYOUT.text.style} centred, "${OTP_CELL_LAYOUT.placeholder}" when empty`, () => {
    render(<OTPCell position={1} />)
    const c = classes(screen.getByRole('textbox'))
    expect(c).toEqual(
      expect.arrayContaining([
        `w-[${OTP_CELL_LAYOUT.width}px]`,
        `h-[${OTP_CELL_LAYOUT.height}px]`,
        `px-[${OTP_CELL_LAYOUT.paddingX - 1}px]`,
        'border',
        `rounded-sm-${OTP_CELL_LAYOUT.radius}`,
        `md:${OTP_CELL_LAYOUT.text.utility}`,
        'text-center',
      ]),
    )
    expect(screen.getByRole('textbox')).toHaveAttribute('placeholder', OTP_CELL_LAYOUT.placeholder)
  })

  const STATES = Object.keys(OTP_CELL_STATES) as OTPCellState[]
  for (const state of STATES) {
    const spec = OTP_CELL_STATES[state]
    it(`${state}: ${spec.bg}, ${spec.border}, text ${spec.text}`, () => {
      render(
        <OTPCell
          position={1}
          state={state}
          value={state === 'filled' ? '4' : ''}
          disabled={state === 'disabled'}
        />,
      )
      const c = classes(screen.getByRole('textbox'))
      expect(c).toContain(`bg-${spec.bg}`)
      expect(c).toContain(`border-${spec.border}`)
      // Empty states colour the "-"; filled ones the digit.
      const textClass = ['placeholder', 'hover', 'focus'].includes(state)
        ? `placeholder:text-${spec.text}`
        : `text-${spec.text}`
      expect(c).toContain(textClass)
      // Nothing Figma doesn't have.
      expect(c.some((x) => /^opacity-/.test(x))).toBe(false)
      expect(c.some((x) => /^(ring|shadow)-/.test(x))).toBe(false)
    })
  }

  it('success uses Figma’s error fill and text with the success border, not a green fill', () => {
    render(<OTPCell position={1} state="success" value="4" />)
    const c = classes(screen.getByRole('textbox'))
    expect(c).not.toContain('bg-bg-tags-green')
    expect(c).toContain('border-border-input-success')
  })

  it(`hover only when empty: ${OTP_CELL_MOTION.duration}ms, ${OTP_CELL_MOTION.hoverIn} in, ${OTP_CELL_MOTION.out} out`, () => {
    const { rerender } = render(<OTPCell position={1} />)
    let c = classes(screen.getByRole('textbox'))
    expect(c).toEqual(
      expect.arrayContaining([
        'hover:bg-bg-input-hover',
        'hover:border-border-input-hover',
        `hover:${OTP_CELL_MOTION.hoverIn}`,
        `duration-${OTP_CELL_MOTION.duration}`,
        OTP_CELL_MOTION.out,
      ]),
    )
    rerender(<OTPCell position={1} value="4" />)
    c = classes(screen.getByRole('textbox'))
    expect(c.some((x) => x.startsWith('hover:'))).toBe(false)
  })

  it('focus: the focus fill, border and a dark "-"; in an OTPInput every cell takes it', () => {
    render(<OTPCell position={1} />)
    const c = classes(screen.getByRole('textbox'))
    expect(c).toEqual(
      expect.arrayContaining([
        'focus:bg-bg-input-focus!',
        'focus:border-border-input-focus!',
        'focus:placeholder:text-text-input-focus!',
        'group-focus-within/otp:bg-bg-input-focus!',
        'group-focus-within/otp:border-border-input-focus!',
      ]),
    )
  })

  it('every state token is mapped in globals.css', () => {
    for (const s of Object.values(OTP_CELL_STATES))
      for (const token of [s.bg, s.border, s.text])
        expect(globals, token).toContain(`--color-${token}:`)
  })
})

describe('OTPInput matches Figma (2765:34486)', () => {
  it(`${OTP_INPUT_FIGMA.length} cells by default, ${OTP_INPUT_FIGMA.cellGap}px apart; label, row and helper ${OTP_INPUT_FIGMA.gap}px apart`, () => {
    const { container } = render(
      <OTPInput label="Verification Code" helperText="Check your email" />,
    )
    expect(cells()).toHaveLength(OTP_INPUT_FIGMA.length)
    expect(classes(container.firstElementChild!)).toContain(`gap-[${OTP_INPUT_FIGMA.gap}px]`)
    const row = screen.getByRole('group')
    expect(classes(row)).toContain(`gap-[${OTP_INPUT_FIGMA.cellGap}px]`)
    expect(classes(row)).toContain('group/otp')
  })

  it('the label is the label-wrapper and names the group; the helper describes it and is inset', () => {
    render(<OTPInput label="Verification Code" helperText="Check your email" />)
    const row = screen.getByRole('group')
    expect(row).toHaveAccessibleName('Verification Code')
    expect(row).toHaveAccessibleDescription('Check your email')
    const helper = screen.getByText('Check your email').closest('[id]')!
    expect(classes(helper)).toContain('pl-[3px]')
  })

  it(`success: a ${OTP_INPUT_FIGMA.success.size}px ${OTP_INPUT_FIGMA.success.icon} in ${OTP_INPUT_FIGMA.success.colour} after the cells`, () => {
    render(<OTPInput label="Code" state="success" defaultValue="123456" />)
    const badge = screen.getByRole('img', { name: 'Code accepted' })
    expect(classes(badge)).toEqual(
      expect.arrayContaining([
        `size-[${OTP_INPUT_FIGMA.success.size}px]`,
        `text-${OTP_INPUT_FIGMA.success.colour}`,
      ]),
    )
    expect(badge.parentElement).toBe(screen.getByRole('group'))
    // Out of the row's flow, so the row doesn't widen on success.
    expect(classes(badge)).toEqual(expect.arrayContaining(['absolute', 'left-full', 'ml-[4px]']))
    expect(badge.previousElementSibling?.tagName).toBe('INPUT')
    for (const cell of cells()) expect(classes(cell)).toContain('border-border-input-success')
  })

  it('error: every cell red-bordered, marked invalid, and the message announced', () => {
    render(<OTPInput label="Code" errorText="Wrong code" defaultValue="123456" />)
    for (const cell of cells()) {
      expect(classes(cell)).toContain('border-border-input-error')
      expect(cell).toHaveAttribute('aria-invalid', 'true')
    }
    expect(screen.getByRole('alert')).toHaveTextContent('Wrong code')
  })

  it('no badge outside success', () => {
    render(<OTPInput label="Code" />)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('typing moves on, paste fills, and the full code completes', () => {
    const onComplete = vi.fn()
    render(<OTPInput label="Code" onComplete={onComplete} />)
    fireEvent.change(cells()[0]!, { target: { value: '1' } })
    expect(cells()[0]!).toHaveValue('1')
    fireEvent.paste(cells()[0]!, { clipboardData: { getData: () => '987654' } })
    expect(
      cells()
        .map((c) => (c as HTMLInputElement).value)
        .join(''),
    ).toBe('987654')
    expect(onComplete).toHaveBeenCalledWith('987654')
  })
})

describe('OTPInput fills from several characters at once', () => {
  it('a code autofilled into the first cell spreads over every cell', () => {
    const onComplete = vi.fn()
    render(<OTPInput label="Code" onComplete={onComplete} />)
    fireEvent.change(screen.getAllByRole('textbox')[0]!, { target: { value: '482913' } })
    expect(
      screen
        .getAllByRole('textbox')
        .map((c) => (c as HTMLInputElement).value)
        .join(''),
    ).toBe('482913')
    expect(onComplete).toHaveBeenCalledWith('482913')
  })

  it('typing over a filled cell replaces its digit', () => {
    render(<OTPInput label="Code" defaultValue="1" />)
    fireEvent.change(screen.getAllByRole('textbox')[0]!, { target: { value: '17' } })
    expect(screen.getAllByRole('textbox')[0]).toHaveValue('7')
  })
})
