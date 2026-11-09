'use client'

import { ErrorBoundaryScreen } from '@/components/error-boundary-screen'

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <ErrorBoundaryScreen {...props} className="min-h-dvh bg-bg-primary" />
}
