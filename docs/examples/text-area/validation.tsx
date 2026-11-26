'use client'

import { useState } from 'react'

import { Textarea } from '@/components/ui/textarea'

export default function TextAreaValidation() {
  const [note, setNote] = useState('')
  const [touched, setTouched] = useState(false)
  const tooShort = touched && note.trim().length < 20
  return (
    <div className="flex w-[320px] max-w-full flex-col gap-16">
      <Textarea
        label="Reason for rejecting"
        required
        value={note}
        onChange={(event) => setNote(event.target.value)}
        onBlur={() => setTouched(true)}
        placeholder="Shared with the candidate"
        helperText="At least 20 characters"
        errorText={tooShort ? 'Add a little more, at least 20 characters' : undefined}
      />
    </div>
  )
}
