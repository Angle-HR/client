import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveWaitlistToken, storeWaitlistToken } from '@/lib/waitlist-token'

function visit(url: string): void {
  window.history.replaceState({}, '', url)
}

describe('resolveWaitlistToken', () => {
  beforeEach(() => {
    sessionStorage.clear()
    visit('/survey')
    vi.restoreAllMocks()
  })

  it('reads the token from sessionStorage when the URL has none', () => {
    storeWaitlistToken('stored-token')
    expect(resolveWaitlistToken()).toBe('stored-token')
  })

  it('prefers a token from the URL over one already stored', () => {
    storeWaitlistToken('stored-token')
    visit('/survey?token=url-token')
    expect(resolveWaitlistToken()).toBe('url-token')
  })

  it('strips the token from the URL and moves it into sessionStorage', () => {
    visit('/survey?token=url-token')
    resolveWaitlistToken()
    expect(window.location.search).toBe('')
    expect(sessionStorage.getItem('waitlistToken')).toBe('url-token')
  })

  it('keeps other query params when stripping the token', () => {
    visit('/survey?utm_source=email&token=url-token')
    resolveWaitlistToken()
    expect(window.location.search).toBe('?utm_source=email')
  })

  it('trims surrounding whitespace on a URL token', () => {
    visit(`/survey?token=${encodeURIComponent('  padded-token  ')}`)
    expect(resolveWaitlistToken()).toBe('padded-token')
  })

  it('falls back to storage when the URL token is blank, and still strips it', () => {
    storeWaitlistToken('stored-token')
    visit('/survey?token=')
    expect(resolveWaitlistToken()).toBe('stored-token')
    expect(window.location.search).toBe('')
  })

  it('returns an empty string and logs when no token is available', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveWaitlistToken()).toBe('')
    expect(error).toHaveBeenCalled()
  })
})
