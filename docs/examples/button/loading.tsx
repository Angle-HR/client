'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

export default function ButtonLoading() {
  const [isSaving, setIsSaving] = useState(false)

  function handleSave() {
    setIsSaving(true)
    setTimeout(() => setIsSaving(false), 1500) // docs-hide
  }

  return (
    <Button variant="primary" loading={isSaving} onClick={handleSave}>
      {isSaving ? 'Saving…' : 'Save changes'}
    </Button>
  )
}
