import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Calendar, monthGrid } from '../input/calendar'
import { DateInput, EMPTY_DATE } from '../input/date-input'

import type { DateParts } from '../input/date-input'

const today = new Date(2026, 9, 7)

describe('monthGrid', () => {
  it('lays a month out in full weeks starting on Monday', () => {
    const weeks = monthGrid(2026, 9)
    // 1 October 2026 is a Thursday, so the first row opens on Monday 28 September.
    expect(weeks).toHaveLength(5)
    expect(weeks.every((week) => week.length === 7)).toBe(true)
    expect(weeks[0]?.[0]).toEqual(new Date(2026, 8, 28))
    expect(weeks[4]?.[6]).toEqual(new Date(2026, 10, 1))
  })

  it('adds a sixth row when a month needs one', () => {
    expect(monthGrid(2026, 7)).toHaveLength(6)
  })
})

describe('Calendar', () => {
  it('marks today and the chosen day', () => {
    render(<Calendar value="2026-10-22" onSelect={() => {}} today={today} />)
    expect(screen.getByRole('gridcell', { name: '7 October 2026' })).toHaveAttribute(
      'aria-current',
      'date',
    )
    expect(screen.getByRole('gridcell', { name: '22 October 2026' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('will not pick days before the minimum or outside the month', () => {
    const onSelect = vi.fn()
    render(<Calendar onSelect={onSelect} min="2026-10-07" today={today} />)
    expect(screen.getByRole('gridcell', { name: '6 October 2026' })).toBeDisabled()
    expect(screen.getByRole('gridcell', { name: '1 November 2026' })).toBeDisabled()

    fireEvent.click(screen.getByRole('gridcell', { name: '8 October 2026' }))
    expect(onSelect).toHaveBeenCalledWith('2026-10-08')
  })

  it('moves to another month from the header', () => {
    render(<Calendar onSelect={() => {}} today={today} />)
    fireEvent.click(screen.getByRole('button', { name: 'October' }))
    fireEvent.click(screen.getByRole('option', { name: 'December' }))
    expect(screen.getByRole('grid', { name: 'December 2026' })).toBeInTheDocument()
  })
})

describe('DateInput', () => {
  function Field() {
    const [value, setValue] = useState<DateParts>(EMPTY_DATE)
    return <DateInput label="Closing date" value={value} onChange={setValue} />
  }

  it('fills its segments from the calendar and closes it', () => {
    render(<Field />)
    fireEvent.click(screen.getByRole('button', { name: 'Open calendar' }))
    const day = screen.getAllByRole('gridcell').find((cell) => !cell.hasAttribute('disabled'))
    fireEvent.click(day as HTMLElement)

    expect(screen.queryByRole('dialog', { name: 'Choose a date' })).not.toBeInTheDocument()
    expect((screen.getByLabelText('Day') as HTMLInputElement).value).toMatch(/^\d{2}$/)
    expect((screen.getByLabelText('Year') as HTMLInputElement).value).toMatch(/^\d{4}$/)
  })

  it('keeps only digits typed into a segment', () => {
    render(<Field />)
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '1a2b' } })
    expect(screen.getByLabelText('Month')).toHaveValue('12')
  })
})

describe('Calendar keyboard (WCAG 2.1.1; not in Figma)', () => {
  const day = (name: string) => screen.getByRole('gridcell', { name })
  const tabStops = () =>
    screen.getAllByRole('gridcell').filter((cell) => cell.getAttribute('tabindex') === '0')

  it('puts one day in the Tab order: the chosen day, else today', () => {
    const { rerender } = render(<Calendar onSelect={() => {}} today={today} />)
    expect(tabStops()).toEqual([day('7 October 2026')])
    rerender(<Calendar value="2026-10-22" onSelect={() => {}} today={today} />)
    expect(tabStops()).toEqual([day('22 October 2026')])
  })

  it('arrow keys move a day or a week, Home and End to the ends of the week', () => {
    render(<Calendar onSelect={() => {}} today={today} />)
    day('7 October 2026').focus()
    const press = (key: string) => fireEvent.keyDown(document.activeElement!, { key })
    press('ArrowRight')
    expect(document.activeElement).toBe(day('8 October 2026'))
    press('ArrowDown')
    expect(document.activeElement).toBe(day('15 October 2026'))
    press('ArrowLeft')
    press('ArrowUp')
    expect(document.activeElement).toBe(day('7 October 2026'))
    press('Home')
    expect(document.activeElement).toBe(day('5 October 2026'))
    press('End')
    expect(document.activeElement).toBe(day('11 October 2026'))
    expect(tabStops()).toEqual([day('11 October 2026')])
  })

  it('crosses into the next month, and Page Down moves a month', () => {
    render(<Calendar onSelect={() => {}} today={new Date(2026, 9, 31)} />)
    day('31 October 2026').focus()
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowRight' })
    expect(screen.getByRole('grid')).toHaveAccessibleName('November 2026')
    expect(document.activeElement).toBe(day('1 November 2026'))
    fireEvent.keyDown(document.activeElement!, { key: 'PageDown' })
    expect(document.activeElement).toBe(day('1 December 2026'))
    fireEvent.keyDown(document.activeElement!, { key: 'PageUp', shiftKey: true })
    expect(document.activeElement).toBe(day('1 December 2025'))
  })

  it('does not move before min', () => {
    render(<Calendar onSelect={() => {}} min="2026-10-07" today={today} />)
    day('7 October 2026').focus()
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(day('7 October 2026'))
  })

  it('a year list takes focus, moves with the arrows and gives focus back on Escape', () => {
    render(<Calendar onSelect={() => {}} today={today} />)
    const yearButton = screen.getByRole('button', { name: '2026' })
    fireEvent.click(yearButton)
    expect(document.activeElement).toBe(screen.getByRole('option', { name: '2026' }))
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(screen.getByRole('option', { name: '2025' }))
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(yearButton)
  })

  it('draws a focus ring on days and list items', () => {
    render(<Calendar onSelect={() => {}} today={today} />)
    expect(day('7 October 2026').className).toContain('focus-visible:outline-1')
    fireEvent.click(screen.getByRole('button', { name: 'October' }))
    expect(screen.getByRole('option', { name: 'October' }).className).toContain(
      'focus-visible:outline-1',
    )
  })
})

describe('DateInput focus (not in Figma)', () => {
  function Field() {
    const [value, setValue] = useState<DateParts>(EMPTY_DATE)
    return (
      <>
        <DateInput label="Start date" value={value} onChange={setValue} />
        <button type="button">After</button>
      </>
    )
  }
  const openButton = () => screen.getByRole('button', { name: 'Open calendar' })

  it('opening moves focus into the calendar; Escape closes it and returns focus', () => {
    render(<Field />)
    fireEvent.click(openButton())
    expect(document.activeElement?.getAttribute('role')).toBe('gridcell')
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(openButton())
  })

  it('Escape in a year list closes only the list', () => {
    render(<Field />)
    fireEvent.click(openButton())
    fireEvent.click(screen.getAllByRole('button', { expanded: false })[1]!)
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(screen.getByRole('dialog')).toBeTruthy()
  })

  it('picking a day returns focus to the button', () => {
    render(<Field />)
    fireEvent.click(openButton())
    fireEvent.click(document.activeElement!)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(openButton())
  })

  it('moving focus out of the field closes the calendar', () => {
    render(<Field />)
    fireEvent.click(openButton())
    fireEvent.blur(document.activeElement!, { relatedTarget: screen.getByText('After') })
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
