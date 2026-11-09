'use client'

import { QueryProvider } from './react-query'
import { ThemeProvider } from './theme'

function Providers({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <ThemeProvider>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  )
}

export { Providers }
