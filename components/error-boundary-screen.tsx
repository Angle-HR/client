'use client'

import { useEffect } from 'react'

import { Button, TextButton } from '@/components/ui'
import { buildFeedbackMailto } from '@/lib/feedback'

interface ErrorBoundaryScreenProps {
  error: Error & { digest?: string }
  reset: () => void
  className?: string
}

/** Shared body of the Next error.tsx boundaries: explain, retry, and report. */
function ErrorBoundaryScreen({ error, reset, className }: ErrorBoundaryScreenProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      role="alert"
      className={`flex flex-1 flex-col items-center justify-center gap-[16px] p-[24px] text-center ${className ?? ''}`}
    >
      <p className="text-body-m leading-21 font-semibold text-text-primary">Something went wrong</p>
      <p className="max-w-[320px] text-body-xs leading-19_2 text-text-secondary">
        This page hit an unexpected problem. It is usually temporary, so try again. If it keeps
        happening, let us know.
      </p>
      <Button type="button" variant="primary" accent="blue" size="sm" onClick={reset}>
        Try again
      </Button>
      <TextButton
        href={buildFeedbackMailto({ requestId: error.digest, subject: 'Open HR error report' })}
        size="sm"
      >
        Send us feedback
      </TextButton>
    </div>
  )
}

export { ErrorBoundaryScreen }
