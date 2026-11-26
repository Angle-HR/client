import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Calendar } from '../input/calendar'
import {
  CALENDAR_DROPDOWN,
  CALENDAR_LAYOUT,
  CALENDAR_WRAPPER,
  DAY_MOTION,
  DAY_STATES,
} from '../input/calendar.figma'

const TODAY = new Date(2026, 5, 17) // 17 June 2026
const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/)
const noop = () => {}
const day = (label: string) => screen.getByRole('gridcell', { name: label })

describe('Calendar matches Figma (5042:50086)', () => {
  for (const spacing of ['loose', 'tight'] as const) {
    for (const wrapped of [true, false]) {
      const w = CALENDAR_LAYOUT.width[spacing][wrapped ? 'wrapped' : 'bare']
      it(`${spacing}, ${wrapped ? 'wrapped' : 'bare'}: ${w}px wide, columns ${CALENDAR_LAYOUT.columnGap[spacing]}px apart`, () => {
        render(<Calendar today={TODAY} onSelect={noop} spacing={spacing} wrapped={wrapped} />)
        expect(classes(screen.getByRole('dialog'))).toContain(`w-[${w}px]`)
        for (const row of screen.getAllByRole('row')) {
          expect(classes(row)).toContain(`gap-[${CALENDAR_LAYOUT.columnGap[spacing]}px]`)
        }
      })
    }
  }

  it('wrapped: a light card, 0.5px border, 4px padding, 10px corners, x-small shadow', () => {
    render(<Calendar today={TODAY} onSelect={noop} />)
    const card = screen.getByRole('dialog').firstElementChild!
    const c = card.className
    expect(c).toContain(`bg-${CALENDAR_WRAPPER.background}`)
    expect(c).toContain(`outline-${CALENDAR_WRAPPER.border}`)
    expect(c).toContain('outline-[0.5px]')
    expect(c).toContain(CALENDAR_WRAPPER.shadow)
    expect(c).toContain(`rounded-lg-${CALENDAR_WRAPPER.radius}`)
    expect(card.firstElementChild!.className).toContain(`p-[${CALENDAR_WRAPPER.padding}px]`)
  })

  it('bare: no card', () => {
    render(<Calendar today={TODAY} onSelect={noop} wrapped={false} />)
    expect(screen.getByRole('dialog').innerHTML).not.toContain('shadow-slots')
  })

  it('header: Tertiary 24px buttons with the solid chevron-down', () => {
    render(<Calendar today={TODAY} onSelect={noop} />)
    for (const name of ['2026', 'June']) {
      const button = screen.getByRole('button', { name })
      expect(button.className).toContain('bg-bg-btn-default-tet-rest')
      expect(button.className).toContain('h-[24px]')
      expect(button.innerHTML).toContain(CALENDAR_LAYOUT.headerIcon)
    }
  })

  it('weekdays: 28 × 13, Body S Medium, tertiary', () => {
    const { container } = render(<Calendar today={TODAY} onSelect={noop} />)
    const m = [...container.querySelectorAll('[aria-hidden="true"] > span')][0]!
    const w = CALENDAR_LAYOUT.weekday
    expect(classes(m)).toEqual(
      expect.arrayContaining([
        `w-[${w.width}px]`,
        `h-[${w.height}px]`,
        w.utility,
        w.weight,
        `text-${w.colour}`,
      ]),
    )
  })

  it('rest day: 28 × 26, primary, hover fills transparent/medium entering 50ms ease out', () => {
    render(<Calendar today={TODAY} onSelect={noop} />)
    const c = classes(day('10 June 2026'))
    expect(c).toEqual(
      expect.arrayContaining(['w-[28px]', 'h-[26px]', 'rounded-full', 'text-body-m']),
    )
    expect(c).toContain(`text-${DAY_STATES.rest.text}`)
    expect(c).toContain(`hover:bg-${DAY_STATES.hover.bg}`)
    expect(c).toContain(`duration-[${DAY_MOTION.duration}ms]`)
    expect(c).toContain(`hover:${DAY_MOTION.enter}`)
    expect(c).toContain(DAY_MOTION.leave)
  })

  it('selected day: inverted fill and text, semibold, 1px transparent border', () => {
    render(<Calendar today={TODAY} onSelect={noop} value="2026-06-10" />)
    const c = classes(day('10 June 2026'))
    const s = DAY_STATES.selected
    expect(c).toEqual(
      expect.arrayContaining([
        `bg-${s.bg}`,
        `text-${s.text}`,
        s.weight,
        'border',
        `border-${s.border}`,
      ]),
    )
  })

  it('today: blue number and a 3px blue dot, no hover', () => {
    render(<Calendar today={TODAY} onSelect={noop} />)
    const t = day('17 June 2026')
    expect(classes(t)).toContain(`text-${DAY_STATES.today.text}`)
    expect(classes(t).filter((x) => x.startsWith('hover:'))).toEqual([])
    const dot = t.querySelector('[aria-hidden="true"]')!
    expect(classes(dot)).toEqual(
      expect.arrayContaining([
        'size-[3px]',
        'top-[21px]',
        'left-[13px]',
        `bg-${DAY_STATES.today.dot}`,
      ]),
    )
  })

  it('disabled: days outside the month or before min are text/light', () => {
    render(<Calendar today={TODAY} onSelect={noop} min="2026-06-05" />)
    for (const name of ['1 June 2026', '1 July 2026']) {
      expect(classes(day(name))).toContain(`text-${DAY_STATES.disabled.text}`)
      expect((day(name) as HTMLButtonElement).disabled).toBe(true)
    }
  })

  it('year list: a 100 × 227 small-shadow Slots, 46px above, 14 years (2017–2030) of 24px items', () => {
    render(<Calendar today={TODAY} onSelect={noop} />)
    fireEvent.click(screen.getByRole('button', { name: '2026' }))
    const list = screen.getByRole('listbox', { name: 'Year' })
    const slots = list.closest('[class*="shadow-slots"]')!
    const d = CALENDAR_DROPDOWN
    expect(classes(slots)).toEqual(
      expect.arrayContaining([
        `w-[${d.width}px]`,
        `h-[${d.height}px]`,
        `top-[${d.top}px]`,
        'left-0',
        d.shadow,
      ]),
    )
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(d.years)
    expect(options[0]!.textContent).toBe('2017')
    expect(options.at(-1)!.textContent).toBe('2030')
    expect(classes(options[0]!)).toEqual(
      expect.arrayContaining([
        `h-[${d.item.height}px]`,
        `pl-[${d.item.paddingLeft}px]`,
        `pr-[${d.item.paddingRight}px]`,
        `rounded-sm-${d.item.radius}`,
        d.item.utility,
        `text-${d.item.colour}`,
        `hover:bg-${d.item.hoverBg}`,
        `duration-${d.item.motion.duration}`,
        d.item.motion.leave,
        `hover:${d.item.motion.enter}`,
      ]),
    )
    // Hover only adds the fill; the text keeps its colour.
    expect(classes(options[0]!).filter((x) => x.startsWith('hover:text-'))).toEqual([])
  })

  for (const spacing of ['loose', 'tight'] as const) {
    for (const wrapped of [true, false]) {
      const left = CALENDAR_DROPDOWN.left.month[spacing][wrapped ? 'wrapped' : 'bare']
      it(`month list, ${spacing} ${wrapped ? 'wrapped' : 'bare'}: ${left}px in, 12 months`, () => {
        render(<Calendar today={TODAY} onSelect={noop} spacing={spacing} wrapped={wrapped} />)
        fireEvent.click(screen.getByRole('button', { name: 'June' }))
        const slots = screen
          .getByRole('listbox', { name: 'Month' })
          .closest('[class*="shadow-slots"]')!
        expect(classes(slots)).toContain(`left-[${left}px]`)
        expect(screen.getAllByRole('option')).toHaveLength(12)
      })
    }
  }

  it('every token the spec names exists', () => {
    for (const state of Object.values(DAY_STATES)) {
      for (const [key, token] of Object.entries(state)) {
        if (key === 'weight') continue
        expect(globals, token).toContain(`--color-${token}:`)
      }
    }
  })
})
