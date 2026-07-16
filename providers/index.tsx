'use client'

import { QueryProvider } from './react-query'

function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  return <QueryProvider>{children}</QueryProvider>
}

export { Providers }
