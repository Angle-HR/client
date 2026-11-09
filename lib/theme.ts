type ThemePreference = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'theme'

function isThemePreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

/** Reads the saved choice. Storage can be blocked or throw, so default to system. */
function readThemePreference(): ThemePreference {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

function writeThemePreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY)
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Not persisted; the choice still applies for this page view.
  }
}

/** Light/dark choices set `data-theme`; "system" removes it so the OS decides. */
function applyThemePreference(preference: ThemePreference): void {
  const root = document.documentElement
  if (preference === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', preference)
}

/**
 * Runs inline in <head> before first paint so a saved choice does not flash the
 * wrong palette. Keep it self-contained and in step with the helpers above.
 */
const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}`

export {
  THEME_INIT_SCRIPT,
  THEME_STORAGE_KEY,
  applyThemePreference,
  isThemePreference,
  readThemePreference,
  writeThemePreference,
}
export type { ThemePreference }
