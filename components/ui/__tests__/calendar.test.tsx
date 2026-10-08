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
