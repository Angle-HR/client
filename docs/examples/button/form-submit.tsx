'use client'

import { Button } from '@/components/ui/button'

export default function ButtonFormSubmit() {
  return (
    <form onSubmit={(event) => event.preventDefault()} className="flex gap-8">
      <Button type="submit" variant="primary">
        Create account
      </Button>
      <Button type="button" variant="secondary">
        Cancel
      </Button>
    </form>
  )
}
