'use client'

import { useState } from 'react'

import { Calendar } from '@/components/ui/input/calendar'

export default function CalendarOverview() {
  const [value, setValue] = useState<string>()
  return (
    <div className="flex h-[300px] flex-col items-center justify-end gap-12">
      <Calendar value={value} onSelect={setValue} />
      <p className="text-body-s text-text-secondary">{value ? `Picked ${value}` : 'Pick a day'}</p>
    </div>
  )
}
