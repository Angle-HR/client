import type {
  AuthLoginResult,
  AuthMfaRequiredData,
  AuthSignupData,
  AuthTokenData,
  OnboardingProgressSummary,
} from './types'

const KEYS = {
  accessToken: 'openhr.auth.access_token',
  refreshToken: 'openhr.auth.refresh_token',
  expiresAt: 'openhr.auth.expires_at',
  onboarding: 'openhr.auth.onboarding',
  verificationSessionId: 'openhr.signup.verification_session_id',
  verificationEmail: 'openhr.signup.verification_email',
  codeExpiresAt: 'openhr.signup.code_expires_at',
  resendAvailableAt: 'openhr.signup.resend_available_at',
  // Passwordless sign-in keeps its own session so it can't clobber a signup
  // verification that is still in flight in another tab.
  loginOtpSessionId: 'openhr.login.otp_session_id',
  loginOtpEmail: 'openhr.login.otp_email',
  loginOtpCodeExpiresAt: 'openhr.login.otp_code_expires_at',
  loginOtpResendAvailableAt: 'openhr.login.otp_resend_available_at',
  mfaToken: 'openhr.login.mfa_token',
  mfaExpiresAt: 'openhr.login.mfa_expires_at',
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

/** Replace just the access token after a refresh; the refresh token is unchanged. */
function setAccessToken(token: string, expiresInSeconds: number) {
  setItem(KEYS.accessToken, token)
  setItem(KEYS.expiresAt, String(Date.now() + expiresInSeconds * 1000))
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

function readTimestamp(key: string): number | null {
  const raw = getItem(key)
  if (!raw) return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

function getCodeExpiresAt(): number | null {
  return readTimestamp(KEYS.codeExpiresAt)
}

function getResendAvailableAt(): number | null {
  return readTimestamp(KEYS.resendAvailableAt)
}

function setLoginOtpSession(data: AuthSignupData) {
  setItem(KEYS.loginOtpSessionId, data.verification_session_id)
  setItem(KEYS.loginOtpEmail, data.email)
  setItem(KEYS.loginOtpCodeExpiresAt, String(Date.now() + data.code_expires_in_seconds * 1000))
  setItem(
    KEYS.loginOtpResendAvailableAt,
    String(Date.now() + data.resend_available_in_seconds * 1000),
  )
}

function clearLoginOtpSession() {
  removeItem(KEYS.loginOtpSessionId)
  removeItem(KEYS.loginOtpEmail)
  removeItem(KEYS.loginOtpCodeExpiresAt)
  removeItem(KEYS.loginOtpResendAvailableAt)
}

function getLoginOtpSessionId(): string | null {
  return getItem(KEYS.loginOtpSessionId)
}

function getLoginOtpEmail(): string | null {
  return getItem(KEYS.loginOtpEmail)
}

function getLoginOtpCodeExpiresAt(): number | null {
  return readTimestamp(KEYS.loginOtpCodeExpiresAt)
}

function getLoginOtpResendAvailableAt(): number | null {
  return readTimestamp(KEYS.loginOtpResendAvailableAt)
}

/**
 * Held between a login that answered `totp_required` and the authenticator
 * screen that redeems it. Short-lived by design — the API expires it too.
 */
function setMfaChallenge(data: AuthMfaRequiredData) {
  setItem(KEYS.mfaToken, data.mfa_token)
  setItem(KEYS.mfaExpiresAt, String(Date.now() + data.expires_in * 1000))
}

function clearMfaChallenge() {
  removeItem(KEYS.mfaToken)
  removeItem(KEYS.mfaExpiresAt)
}

function getMfaToken(): string | null {
  const expiresAt = readTimestamp(KEYS.mfaExpiresAt)
  if (expiresAt !== null && Date.now() > expiresAt) {
    clearMfaChallenge()
    return null
  }
  return getItem(KEYS.mfaToken)
}

/** Everything a signed-out user should not be carrying around. */
function clearSession() {
  clearAuthTokens()
  clearVerificationSession()
  clearLoginOtpSession()
  clearMfaChallenge()
}

/** A login answered with an MFA challenge rather than tokens. */
function isMfaRequired(result: AuthLoginResult): result is AuthMfaRequiredData {
  return 'totp_required' in result && result.totp_required
}

/**
 * Take whatever a login attempt returned — password, passwordless OTP, TOTP or
 * accepted invite — persist it, and answer with the route the user belongs on.
 * Every entry point lands the same way, so the branching lives here once.
 */
function landAfterLogin(result: AuthLoginResult): string {
  if (isMfaRequired(result)) {
    setMfaChallenge(result)
    return '/login/2fa'
  }

  setAuthTokens(result)
  clearMfaChallenge()
  clearLoginOtpSession()
  clearVerificationSession()

  if (result.onboarding?.status === 'completed') return '/login/success'
  return routeForOnboarding(result.onboarding)
}

/** Map API onboarding progress to the matching product route. */
function routeForOnboarding(onboarding?: OnboardingProgressSummary | null): string {
  if (!onboarding || onboarding.status === 'completed') return '/dashboard'

  const step = onboarding.next_step || onboarding.current_step || 'profile'
  switch (step) {
    // `address` and `business` are the pre-rename values. They can still turn up
    // for users who were mid-flow when the API changed, so both map to the step
    // that replaced them.
    case 'identification_address':
    case 'address':
      return '/onboarding/workspace'
    case 'compliance':
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
  clearLoginOtpSession,
  clearMfaChallenge,
  clearSession,
  clearVerificationSession,
  getAccessToken,
  getCodeExpiresAt,
  getLoginOtpCodeExpiresAt,
  getLoginOtpEmail,
  getLoginOtpResendAvailableAt,
  getLoginOtpSessionId,
  getMfaToken,
  getRefreshToken,
  isMfaRequired,
  landAfterLogin,
  getResendAvailableAt,
  getStoredOnboarding,
  getVerificationEmail,
  getVerificationSessionId,
  routeForOnboarding,
  setAccessToken,
  setAuthTokens,
  setLoginOtpSession,
  setMfaChallenge,
  setVerificationSession,
}
