'use client'

import { useState } from 'react'

import { Calendar } from '@/components/ui/input/calendar'

const today = new Date()
const pad = (n: number) => String(n).padStart(2, '0')
const TODAY_ISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`

export default function CalendarMin() {
  const [value, setValue] = useState<string>()
  return (
    <div className="flex h-[280px] items-end justify-center">
      <Calendar value={value} onSelect={setValue} min={TODAY_ISO} spacing="tight" />
    </div>
  )
}
