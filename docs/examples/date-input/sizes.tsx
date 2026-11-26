'use client'

import { useState } from 'react'

import { DateInput, EMPTY_DATE } from '@/components/ui/input'

export default function DateInputSizes() {
  const [lg, setLg] = useState(EMPTY_DATE)
  const [md, setMd] = useState(EMPTY_DATE)
  const [sm, setSm] = useState(EMPTY_DATE)
  return (
    <div className="flex w-full max-w-[202px] flex-col gap-16">
      <DateInput label="Large (40px)" size="lg" value={lg} onChange={setLg} />
      <DateInput label="Medium (32px)" size="md" value={md} onChange={setMd} />
      <DateInput label="Small (25px)" size="sm" value={sm} onChange={setSm} />
    </div>
  )
}
