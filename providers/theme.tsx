'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  applyThemePreference,
  readThemePreference,
  writeThemePreference,
  type ThemePreference,
} from '@/lib/theme'

interface ThemeContextValue {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'system', setTheme: () => {} })

function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  // Start on "system" so server and first client render match; the real
  // choice is read after mount (the head script has already painted it).
  const [theme, setThemeState] = useState<ThemePreference>('system')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage after hydration
    setThemeState(readThemePreference())
  }, [])

  const setTheme = useCallback((next: ThemePreference) => {
    setThemeState(next)
    applyThemePreference(next)
    writeThemePreference(next)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

export { ThemeProvider, useTheme }
