import { beforeEach, describe, expect, it } from 'vitest'

import {
  clearSession,
  hasMfaChallenge,
  landAfterLogin,
  setMfaChallenge,
  setVerificationSession,
  getVerificationSessionId,
} from '@/lib/auth-session'
import { getCsrfToken, setCsrfToken } from '@/lib/csrf'

import type { OnboardingProgressSummary } from '@/lib/types'

const inProgress: OnboardingProgressSummary = {
  status: 'in_progress',
  current_step: 'profile',
  next_step: 'compliance',
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('landAfterLogin', () => {
  it('sends a TOTP challenge to the authenticator screen and remembers it', () => {
    expect(landAfterLogin({ totp_required: true, expires_in: 300 })).toBe('/login/2fa')
    expect(hasMfaChallenge()).toBe(true)
  })

  it('routes a session by its onboarding progress and clears the challenge', () => {
    setMfaChallenge({ totp_required: true, expires_in: 300 })
    expect(landAfterLogin({ csrf_token: 'c', onboarding: inProgress })).toBe(
      '/onboarding/compliance',
    )
    expect(hasMfaChallenge()).toBe(false)
    expect(landAfterLogin({ csrf_token: 'c', onboarding: { status: 'completed' } })).toBe(
      '/login/success',
    )
  })

  it('writes nothing credential-like to storage', () => {
    landAfterLogin({ csrf_token: 'secret-csrf', onboarding: inProgress })
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('secret-csrf')
  })
})

describe('hasMfaChallenge', () => {
  it('drops an expired challenge', () => {
    setMfaChallenge({ totp_required: true, expires_in: -1 })
    expect(hasMfaChallenge()).toBe(false)
  })
})

describe('clearSession', () => {
  it('drops the CSRF token and the in-flight flow state', () => {
    setCsrfToken('abc')
    setVerificationSession({
      email: 'a@b.co',
      verification_session_id: 's1',
      code_expires_in_seconds: 60,
      resend_available_in_seconds: 30,
    })
    clearSession()
    expect(getCsrfToken()).toBeNull()
    expect(getVerificationSessionId()).toBeNull()
  })
})
