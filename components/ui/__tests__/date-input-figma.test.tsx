import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DateInput, EMPTY_DATE, placeCalendar, type DateParts } from '../input/date-input'
import { DATE_LAYOUT, DATE_OPEN, DATE_SEGMENTS, DATE_STATES } from '../input/date-input.figma'

const SIZES = ['sm', 'md', 'lg'] as const
const FILLED: DateParts = { day: '16', month: '06', year: '2026' }
const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/)
const noop = () => {}
const field = () => screen.getByRole('group')
const pinned = () => screen.getByRole('dialog').parentElement!

/** Puts every element at 100–132px tall, 50–252px across, in a 1000 × 800 window. */
function fakeLayout() {
  const rect = Element.prototype.getBoundingClientRect
  const root = document.documentElement
  Element.prototype.getBoundingClientRect = () =>
    ({
      top: 100,
      bottom: 132,
      left: 50,
      right: 252,
      width: 202,
      height: 32,
      x: 50,
      y: 100,
    }) as DOMRect
  Object.defineProperty(root, 'clientWidth', { configurable: true, value: 1000 })
  Object.defineProperty(root, 'clientHeight', { configurable: true, value: 800 })
  return () => {
    Element.prototype.getBoundingClientRect = rect
    delete (root as unknown as Record<string, unknown>).clientWidth
    delete (root as unknown as Record<string, unknown>).clientHeight
  }
}

describe('DateInput matches Figma (5042:53560, 840:39704 Calendar suffix)', () => {
  for (const size of SIZES) {
    const spec = DATE_LAYOUT[size]
    it(`${size}: ${spec.height}px, padding ${spec.paddingX} − 1px, right ${spec.buttonPaddingRight} − 1px, radius ${spec.radius}, ${spec.text.style}`, () => {
      render(<DateInput label="Date" size={size} value={EMPTY_DATE} onChange={noop} />)
      const c = classes(field())
      expect(c).toContain(`h-[${spec.height}px]`)
      expect(c).toContain(`pl-[${spec.paddingX - 1}px]`)
      const pr = spec.buttonPaddingRight - 1
      expect(c).toContain(pr <= 0 ? 'pr-0' : `pr-[${pr}px]`)
      expect(c).toContain(`gap-[${DATE_SEGMENTS.gap}px]`)
      expect(field().className).toMatch(new RegExp(`rounded-[a-z]+-${spec.radius}\\b`))
      expect(classes(screen.getByLabelText('Day'))).toContain(`md:${spec.text.utility}`)
    })

    it(`${size}: Tertiary ${spec.calendarButton} calendar button with ${spec.calendarIcon}`, () => {
      render(<DateInput label="Date" size={size} value={EMPTY_DATE} onChange={noop} />)
      const button = screen.getByRole('button', { name: 'Open calendar' })
      expect(button.className).toContain('bg-bg-btn-default-tet-rest')
      expect(classes(button)).toContain(spec.calendarButton === 'sm' ? 'h-[24px]' : 'h-[32px]')
      expect(button.innerHTML).toContain(spec.calendarIcon)
    })
  }

  it('DD ⋅ MM ⋅ YYYY, the dots in text/light and hugging their width', () => {
    const { container } = render(<DateInput label="Date" value={EMPTY_DATE} onChange={noop} />)
    const dots = [...container.querySelectorAll('[aria-hidden="true"]')].filter(
      (el) => el.textContent === DATE_SEGMENTS.separator,
    )
    expect(dots).toHaveLength(2)
    for (const dot of dots) {
      expect(classes(dot)).toContain(`text-${DATE_SEGMENTS.separatorColour}`)
      expect(classes(dot)).toContain(`w-[${DATE_SEGMENTS.separatorWidth.md}px]`)
    }
    DATE_SEGMENTS.placeholders.forEach((p) => expect(screen.getByPlaceholderText(p)).toBeTruthy())
  })

  it('empty: placeholder tokens, hover with ease-in', () => {
    render(<DateInput label="Date" value={EMPTY_DATE} onChange={noop} />)
    const c = classes(field())
    expect(c).toContain(`bg-${DATE_STATES.placeholder.bg}`)
    expect(c).toContain(`border-${DATE_STATES.placeholder.border}`)
    expect(c).toContain(`hover:border-${DATE_STATES.hover.border}`)
    expect(c).toContain('hover:ease-figma-in')
  })

  it('filled: filled tokens and no hover', () => {
    render(<DateInput label="Date" value={FILLED} onChange={noop} />)
    const c = classes(field())
    expect(c).toContain(`bg-${DATE_STATES.filled.bg}`)
    expect(c).toContain(`border-${DATE_STATES.filled.border}`)
    expect(c.filter((x) => x.startsWith('hover:'))).toEqual([])
    expect(classes(screen.getByLabelText('Day'))).toContain(`text-${DATE_STATES.filled.text}`)
  })

  it('typing in a part gives the focus state, 100ms ease-out', () => {
    render(<DateInput label="Date" value={EMPTY_DATE} onChange={noop} />)
    const c = classes(field())
    expect(c).toContain(`has-[input:focus]:border-${DATE_STATES.focus.border}!`)
    expect(c).toContain('duration-100')
    expect(c).toContain('ease-figma-out')
  })

  it(`open: the field takes the ${DATE_OPEN.fieldState} look and the calendar sits ${DATE_OPEN.offset}px away`, () => {
    // jsdom has no layout: the field is at 100–132px in an 800px window.
    const restore = fakeLayout()
    const { rerender } = render(<DateInput label="Date" value={EMPTY_DATE} onChange={noop} />)
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }))
    expect(classes(field())).toContain(`border-${DATE_STATES.hover.border}`)
    expect(pinned().style.top).toBe(`${132 + DATE_OPEN.offset}px`)
    rerender(<DateInput label="Date" value={EMPTY_DATE} onChange={noop} calendarPosition="up" />)
    expect(pinned().style.bottom).toBe(`${800 - 100 + DATE_OPEN.offset}px`)
    restore()
  })

  it('error: error tokens and red helper text', () => {
    render(<DateInput label="Date" value={FILLED} onChange={noop} errorText="Too early" />)
    const c = classes(field())
    expect(c).toContain(`bg-${DATE_STATES.error.bg}`)
    expect(c).toContain(`border-${DATE_STATES.error.border}`)
    expect(screen.getByText('Too early').closest('.text-text-error')).not.toBeNull()
  })

  it('disabled: disabled tokens, 20% text, no opacity', () => {
    render(<DateInput label="Date" value={FILLED} onChange={noop} disabled />)
    const c = classes(field())
    expect(c).toContain(`bg-${DATE_STATES.disabled.bg}`)
    expect(c).toContain(`border-${DATE_STATES.disabled.border}`)
    expect(c.filter((x) => x.startsWith('opacity'))).toEqual([])
    expect(classes(screen.getByLabelText('Day'))).toContain(`text-${DATE_STATES.disabled.text}`)
    const button = screen.getByRole('button', { name: 'Open calendar' })
    expect(button.hasAttribute('disabled')).toBe(false)
    expect(button.getAttribute('aria-disabled')).toBe('true')
    expect(button.tabIndex).toBe(-1)
  })

  it('never gets narrower than its date, so the button stays inside the border', () => {
    render(<DateInput label="Date" size="lg" value={EMPTY_DATE} onChange={noop} />)
    expect(classes(field())).toContain('min-w-fit')
  })

  it('draws no ring, outline or shadow on the field', () => {
    render(<DateInput label="Date" value={EMPTY_DATE} onChange={noop} />)
    expect(field().className).not.toMatch(/\b(ring|shadow|outline)-/)
  })

  describe('auto placement (not in Figma: Figma has Down and Up)', () => {
    const view = { width: 1000, height: 800 }
    const cal = { width: 264, height: 220 }
    const at = (top: number, left = 100, width = 202) => ({
      top,
      bottom: top + 32,
      left,
      right: left + width,
    })

    it('opens Down when the calendar fits below', () => {
      expect(placeCalendar(at(100), cal, view)).toEqual({ vertical: 'down', align: 'left' })
    })

    it('opens Up near the bottom, when there is more room above', () => {
      expect(placeCalendar(at(650), cal, view).vertical).toBe('up')
    })

    it('stays Down when neither side fits but below has more room', () => {
      expect(placeCalendar(at(150), cal, { width: 1000, height: 380 }).vertical).toBe('down')
    })

    it('needs the 3px gap as well as the calendar', () => {
      // 800 - (546 + 32) = 222: room for the 220px calendar but not the 3px gap.
      expect(placeCalendar(at(546), cal, view).vertical).toBe('up')
      expect(placeCalendar(at(545), cal, view).vertical).toBe('down')
    })

    it('lines up the right edges when the left edge would run off-screen', () => {
      expect(placeCalendar(at(100, 800), cal, view).align).toBe('right')
    })

    it('keeps left edges aligned when right-aligning would run off the other side', () => {
      expect(placeCalendar(at(100, 0, 150), cal, { width: 200, height: 800 }).align).toBe('left')
    })

    it('a fixed Down or Up is kept whatever the room', () => {
      expect(placeCalendar(at(650), cal, view, 'down').vertical).toBe('down')
      expect(placeCalendar(at(100), cal, view, 'up').vertical).toBe('up')
    })

    it('the open calendar is pinned to the window, so containers that clip or scroll cannot cut it off', () => {
      const restore = fakeLayout()
      render(<DateInput label="Date" value={EMPTY_DATE} onChange={noop} />)
      fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }))
      const box = pinned()
      expect(classes(box)).toContain('fixed')
      expect(box.dataset.placement).toBe('down left')
      expect(box.style.left).toBe('50px')
      restore()
    })
  })
})
