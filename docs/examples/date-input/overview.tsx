'use client'

import { useState } from 'react'

import { DateInput, EMPTY_DATE } from '@/components/ui/input'

export default function DateInputOverview() {
  const [date, setDate] = useState(EMPTY_DATE)
  return (
    <div className="flex h-[280px] w-full max-w-[202px] flex-col">
      <DateInput label="Closing date" value={date} onChange={setDate} />
    </div>
  )
}
