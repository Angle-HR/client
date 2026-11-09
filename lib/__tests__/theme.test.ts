import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  THEME_INIT_SCRIPT,
  applyThemePreference,
  readThemePreference,
  writeThemePreference,
} from '../theme'

function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() {
      return data.size
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  }
}

describe('theme', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.stubGlobal('localStorage', memoryStorage())
    Object.defineProperty(window, 'localStorage', { value: memoryStorage(), configurable: true })
    document.documentElement.removeAttribute('data-theme')
  })

  it('defaults to system and ignores junk values', () => {
    expect(readThemePreference()).toBe('system')
    window.localStorage.setItem('theme', 'purple')
    expect(readThemePreference()).toBe('system')
  })

  it('persists and applies dark and light, and clears for system', () => {
    writeThemePreference('dark')
    applyThemePreference('dark')
    expect(readThemePreference()).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    applyThemePreference('system')
    writeThemePreference('system')
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false)
    expect(readThemePreference()).toBe('system')
  })

  it('survives storage that throws', () => {
    const blocked = () => {
      throw new Error('blocked')
    }
    vi.spyOn(window.localStorage, 'getItem').mockImplementation(blocked)
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(blocked)
    expect(readThemePreference()).toBe('system')
    expect(() => writeThemePreference('dark')).not.toThrow()
    vi.restoreAllMocks()
  })

  it('init script sets the saved theme', () => {
    window.localStorage.setItem('theme', 'dark')
    new Function(THEME_INIT_SCRIPT)()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })
})
