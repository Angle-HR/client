'use client'

import { useState } from 'react'

import { TextareaField } from '@/components/ui/textarea'

export default function TextAreaToolbar() {
  const [html, setHtml] = useState('')
  return (
    <div className="flex w-[374px] max-w-full flex-col gap-8">
      <TextareaField
        aria-label="Interview feedback"
        placeholder="Select some text and press B, or start a list"
        onValueChange={setHtml}
      />
      <code className="docs-inline-code block max-w-full truncate">
        {html || 'The HTML shows here'}
      </code>
    </div>
  )
}
