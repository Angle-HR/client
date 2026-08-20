import type { AuthSignupData, AuthTokenData, OnboardingProgressSummary } from './types'

const KEYS = {
  accessToken: 'openhr.auth.access_token',
  refreshToken: 'openhr.auth.refresh_token',
  expiresAt: 'openhr.auth.expires_at',
  onboarding: 'openhr.auth.onboarding',
  verificationSessionId: 'openhr.signup.verification_session_id',
  verificationEmail: 'openhr.signup.verification_email',
  codeExpiresAt: 'openhr.signup.code_expires_at',
  resendAvailableAt: 'openhr.signup.resend_available_at',
} as const

function canUseStorage() {
  return typeof window !== 'undefined'
}

function setItem(key: string, value: string) {
  if (!canUseStorage()) return
  window.sessionStorage.setItem(key, value)
}

function getItem(key: string): string | null {
  if (!canUseStorage()) return null
  return window.sessionStorage.getItem(key)
}

function removeItem(key: string) {
  if (!canUseStorage()) return
  window.sessionStorage.removeItem(key)
}

function setAuthTokens(data: AuthTokenData) {
  setItem(KEYS.accessToken, data.access_token)
  setItem(KEYS.refreshToken, data.refresh_token)
  setItem(KEYS.expiresAt, String(Date.now() + data.expires_in * 1000))
  if (data.onboarding) {
    setItem(KEYS.onboarding, JSON.stringify(data.onboarding))
  }
}

function clearAuthTokens() {
  removeItem(KEYS.accessToken)
  removeItem(KEYS.refreshToken)
  removeItem(KEYS.expiresAt)
  removeItem(KEYS.onboarding)
}

function getAccessToken(): string | null {
  return getItem(KEYS.accessToken)
}

function getRefreshToken(): string | null {
  return getItem(KEYS.refreshToken)
}

function getStoredOnboarding(): OnboardingProgressSummary | undefined {
  const raw = getItem(KEYS.onboarding)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as OnboardingProgressSummary
  } catch {
    return undefined
  }
}

function setVerificationSession(data: AuthSignupData) {
  setItem(KEYS.verificationSessionId, data.verification_session_id)
  setItem(KEYS.verificationEmail, data.email)
  setItem(KEYS.codeExpiresAt, String(Date.now() + data.code_expires_in_seconds * 1000))
  setItem(KEYS.resendAvailableAt, String(Date.now() + data.resend_available_in_seconds * 1000))
}

function clearVerificationSession() {
  removeItem(KEYS.verificationSessionId)
  removeItem(KEYS.verificationEmail)
  removeItem(KEYS.codeExpiresAt)
  removeItem(KEYS.resendAvailableAt)
}

function getVerificationSessionId(): string | null {
  return getItem(KEYS.verificationSessionId)
}

function getVerificationEmail(): string | null {
  return getItem(KEYS.verificationEmail)
}

function getCodeExpiresAt(): number | null {
  const raw = getItem(KEYS.codeExpiresAt)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function getResendAvailableAt(): number | null {
  const raw = getItem(KEYS.resendAvailableAt)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

/** Map API onboarding progress to the matching product route. */
function routeForOnboarding(onboarding?: OnboardingProgressSummary | null): string {
  if (!onboarding || onboarding.status === 'completed') return '/dashboard'

  const step = onboarding.next_step || onboarding.current_step || 'profile'
  switch (step) {
    case 'address':
      return '/onboarding/workspace'
    case 'business':
      return '/onboarding/compliance'
    case 'complete':
      return '/onboarding/setup'
    case 'profile':
    case 'verify_email':
    default:
      return '/onboarding'
  }
}

export {
  clearAuthTokens,
  clearVerificationSession,
  getAccessToken,
  getCodeExpiresAt,
  getRefreshToken,
  getResendAvailableAt,
  getStoredOnboarding,
  getVerificationEmail,
  getVerificationSessionId,
  routeForOnboarding,
  setAuthTokens,
  setVerificationSession,
}
