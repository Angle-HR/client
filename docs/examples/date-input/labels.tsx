'use client'

import { useState } from 'react'

import { DateInput, EMPTY_DATE } from '@/components/ui/input'

export default function DateInputLabels() {
  const [closing, setClosing] = useState(EMPTY_DATE)
  const [start, setStart] = useState(EMPTY_DATE)
  return (
    <div className="flex w-full max-w-[202px] flex-col gap-16">
      <DateInput label="Closing date" value={closing} onChange={setClosing} required />
      <DateInput label="Start date" value={start} onChange={setStart} />
    </div>
  )
}
