import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearSession,
  getCsrfToken,
  getStoredOnboarding,
  hasMfaChallenge,
  landAfterLogin,
  reconcileOnboardingStep,
  setSession,
} from '@/lib/auth-session'

import type { OnboardingProgressSummary } from '@/lib/types'

const onboarding: OnboardingProgressSummary = {
  status: 'in_progress',
  current_step: 'profile',
  next_step: 'compliance',
  completed_steps: ['verify_email', 'profile'],
}

beforeEach(() => {
  sessionStorage.clear()
  clearSession()
})

describe('reconcileOnboardingStep', () => {
  it('adopts the new CSRF token after a region migration rotated the session', () => {
    setSession({ csrf_token: 'global' })

    reconcileOnboardingStep({ onboarding, session: { csrf_token: 'regional' } })

    expect(getCsrfToken()).toBe('regional')
    expect(getStoredOnboarding()).toEqual(onboarding)
  })

  it('keeps the current token when the step did not migrate regions', () => {
    setSession({ csrf_token: 'existing' })

    reconcileOnboardingStep({ onboarding })

    expect(getCsrfToken()).toBe('existing')
    expect(getStoredOnboarding()).toEqual(onboarding)
  })
})

describe('landAfterLogin', () => {
  it('keeps the CSRF token and routes by onboarding', () => {
    expect(landAfterLogin({ csrf_token: 'abc', onboarding })).toBe('/onboarding/compliance')
    expect(getCsrfToken()).toBe('abc')
  })

  it('sends a TOTP challenge to the authenticator screen, with no session', () => {
    expect(landAfterLogin({ totp_required: true, expires_in: 300 })).toBe('/login/2fa')
    expect(hasMfaChallenge()).toBe(true)
    expect(getCsrfToken()).toBeNull()
  })

  it('forgets the CSRF token on sign out', () => {
    setSession({ csrf_token: 'abc', onboarding })
    clearSession()
    expect(getCsrfToken()).toBeNull()
    expect(getStoredOnboarding()).toBeUndefined()
  })
})
