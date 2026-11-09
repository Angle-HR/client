'use client'

import { ErrorBoundaryScreen } from '@/components/error-boundary-screen'

export default function DashboardError(props: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ErrorBoundaryScreen {...props} />
}
