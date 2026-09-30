import { beforeEach, describe, expect, it } from 'vitest'

import {
  getAccessToken,
  getRefreshToken,
  getStoredOnboarding,
  reconcileOnboardingStep,
  setAuthTokens,
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
})

describe('reconcileOnboardingStep', () => {
  it('stores replacement tokens returned after a region migration', () => {
    reconcileOnboardingStep({
      onboarding,
      tokens: {
        access_token: 'regional-access',
        refresh_token: 'regional-refresh',
        expires_in: 3600,
      },
    })

    expect(getAccessToken()).toBe('regional-access')
    expect(getRefreshToken()).toBe('regional-refresh')
    expect(getStoredOnboarding()).toEqual(onboarding)
  })

  it('preserves the current tokens when the step did not migrate regions', () => {
    setAuthTokens({
      access_token: 'existing-access',
      refresh_token: 'existing-refresh',
      expires_in: 3600,
    })

    reconcileOnboardingStep({ onboarding })

    expect(getAccessToken()).toBe('existing-access')
    expect(getRefreshToken()).toBe('existing-refresh')
    expect(getStoredOnboarding()).toEqual(onboarding)
  })
})
