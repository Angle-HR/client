'use client'

import { useState } from 'react'

import { FlowButton } from '@/components/ui/button'

export default function FlowButtonLoading() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit() {
    setIsSubmitting(true)
    setTimeout(() => setIsSubmitting(false), 1500) // docs-hide
  }

  return (
    <FlowButton variant="primary" loading={isSubmitting} onClick={handleSubmit}>
      {isSubmitting ? 'Submitting…' : 'Submit application'}
    </FlowButton>
  )
}
