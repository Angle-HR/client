import { useState } from 'react'

import { Calendar } from './calendar'
import { DateInput, EMPTY_DATE } from './date-input'

import type { DateParts } from './date-input'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

// A fixed "today" keeps the stories stable from one day to the next.
const today = new Date(2026, 5, 15)

const meta: Meta<typeof Calendar> = {
  title: 'UI/Input/Calendar',
  component: Calendar,
  args: { today, onSelect: () => {} },
}

export default meta
type Story = StoryObj<typeof Calendar>

export const Default: Story = {}

export const WithSelection: Story = {
  args: { value: '2026-06-22' },
}

/** Days before `min` are greyed out, as past dates are for a closing date. */
export const WithMinimum: Story = {
  args: { min: '2026-06-15' },
}

function DateField() {
  const [value, setValue] = useState<DateParts>(EMPTY_DATE)
  return (
    <div className="h-[300px] w-[182px]">
      <DateInput label="Job closing date" value={value} onChange={setValue} />
    </div>
  )
}

/** The typed field that opens the calendar from its button. */
export const InsideDateInput: Story = {
  render: () => <DateField />,
}

export const DateInputWithError: Story = {
  render: () => (
    <div className="w-[182px]">
      <DateInput
        label="Job closing date"
        value={{ day: '31', month: '02', year: '2026' }}
        onChange={() => {}}
        errorText="Enter a valid date that is today or later."
      />
    </div>
  ),
}
