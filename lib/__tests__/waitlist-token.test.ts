import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  resolveWaitlistToken,
  storeWaitlistToken,
  stripWaitlistTokenFromUrl,
} from '@/lib/waitlist-token'

function visit(url: string): void {
  window.history.replaceState({}, '', url)
}

beforeEach(() => {
  sessionStorage.clear()
  visit('/survey')
  vi.restoreAllMocks()
})

describe('resolveWaitlistToken', () => {
  it('reads the token from sessionStorage when the URL has none', () => {
    storeWaitlistToken('stored-token')
    expect(resolveWaitlistToken()).toBe('stored-token')
  })

  it('prefers a token from the URL over one already stored', () => {
    storeWaitlistToken('stored-token')
    visit('/survey?token=url-token')
    expect(resolveWaitlistToken()).toBe('url-token')
  })

  it('persists a URL token so later reads no longer need the query string', () => {
    visit('/survey?token=url-token')
    resolveWaitlistToken()
    expect(sessionStorage.getItem('waitlistToken')).toBe('url-token')
  })

  it('trims surrounding whitespace on a URL token', () => {
    visit(`/survey?token=${encodeURIComponent('  padded-token  ')}`)
    expect(resolveWaitlistToken()).toBe('padded-token')
  })

  it('falls back to storage when the URL token is blank', () => {
    storeWaitlistToken('stored-token')
    visit('/survey?token=')
    expect(resolveWaitlistToken()).toBe('stored-token')
  })

  it('returns an empty string and logs when no token is available', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resolveWaitlistToken()).toBe('')
    expect(error).toHaveBeenCalled()
  })

  it('leaves the URL untouched — stripping is a separate, effect-time step', () => {
    visit('/survey?token=url-token')
    resolveWaitlistToken()
    expect(window.location.search).toBe('?token=url-token')
  })
})

describe('stripWaitlistTokenFromUrl', () => {
  it('removes the token from the address bar', () => {
    visit('/survey?token=url-token')
    stripWaitlistTokenFromUrl()
    expect(window.location.search).toBe('')
  })

  it('keeps other query params', () => {
    visit('/survey?utm_source=email&token=url-token&ref=x')
    stripWaitlistTokenFromUrl()
    expect(window.location.search).toBe('?utm_source=email&ref=x')
  })

  it('strips a blank token param too', () => {
    visit('/survey?token=')
    stripWaitlistTokenFromUrl()
    expect(window.location.search).toBe('')
  })

  it('preserves the hash', () => {
    visit('/survey?token=url-token#step-2')
    stripWaitlistTokenFromUrl()
    expect(window.location.pathname + window.location.hash).toBe('/survey#step-2')
  })

  it('does nothing when there is no token param', () => {
    visit('/survey?utm_source=email')
    stripWaitlistTokenFromUrl()
    expect(window.location.search).toBe('?utm_source=email')
  })
})
