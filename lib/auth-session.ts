import type {
  AuthLoginResult,
  AuthMfaRequiredData,
  AuthSessionData,
  AuthSignupData,
  OnboardingProgressSummary,
} from './types'

const KEYS = {
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

/**
 * The session's CSRF token. The session itself is an HttpOnly cookie the page
 * never sees; this token goes with every write as `X-CSRF-Token`. It lives in
 * memory only: after a reload the API client asks `/auth/me` for it again.
 */
let csrfToken: string | null = null

function setCsrfToken(token: string | null | undefined): void {
  csrfToken = token || null
}

function getCsrfToken(): string | null {
  return csrfToken
}

/** Adopt what a login-family response returned: its CSRF token and onboarding progress. */
function setSession(data: AuthSessionData): void {
  setCsrfToken(data.csrf_token)
  if (data.onboarding) {
    setItem(KEYS.onboarding, JSON.stringify(data.onboarding))
  }
}

/** Keep the stored onboarding summary in step with what the API last reported. */
function setStoredOnboarding(onboarding?: OnboardingProgressSummary | null) {
  if (!onboarding) return
  setItem(KEYS.onboarding, JSON.stringify(onboarding))
}

/**
 * Persist progress, and adopt the new CSRF token when the step moved the account
 * out of the global holding region: the server rotated the session, so the old
 * token is dead.
 */
function reconcileOnboardingStep(result: {
  onboarding: OnboardingProgressSummary
  session?: { csrf_token: string }
}): void {
  if (result.session) setCsrfToken(result.session.csrf_token)
  setStoredOnboarding(result.onboarding)
}

function clearAuthState(): void {
  setCsrfToken(null)
  removeItem(KEYS.onboarding)
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
 * Marks a login that answered `totp_required`. The challenge itself is a
 * short-lived HttpOnly cookie; this only remembers when it runs out, so the
 * authenticator screen can send the visitor back once it has.
 */
function setMfaChallenge(data: AuthMfaRequiredData) {
  setItem(KEYS.mfaExpiresAt, String(Date.now() + data.expires_in * 1000))
}

function clearMfaChallenge() {
  removeItem(KEYS.mfaExpiresAt)
}

function hasMfaChallenge(): boolean {
  const expiresAt = readTimestamp(KEYS.mfaExpiresAt)
  if (expiresAt === null) return false
  if (Date.now() > expiresAt) {
    clearMfaChallenge()
    return false
  }
  return true
}

/** Everything a signed-out user should not be carrying around. */
function clearSession() {
  clearAuthState()
  clearVerificationSession()
  clearLoginOtpSession()
  clearMfaChallenge()
}

/** A login answered with an MFA challenge rather than a session. */
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

  setSession(result)
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
  clearAuthState,
  clearLoginOtpSession,
  clearMfaChallenge,
  clearSession,
  clearVerificationSession,
  getCodeExpiresAt,
  getCsrfToken,
  getLoginOtpCodeExpiresAt,
  getLoginOtpEmail,
  getLoginOtpResendAvailableAt,
  getLoginOtpSessionId,
  hasMfaChallenge,
  isMfaRequired,
  landAfterLogin,
  getResendAvailableAt,
  getStoredOnboarding,
  getVerificationEmail,
  getVerificationSessionId,
  reconcileOnboardingStep,
  routeForOnboarding,
  setCsrfToken,
  setLoginOtpSession,
  setMfaChallenge,
  setSession,
  setVerificationSession,
}
