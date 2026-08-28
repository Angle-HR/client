export type WaitlistStep = 'intro' | 'success' | 'survey' | 'early-access' | 'thanks'

export interface WaitlistPayload {
  email: string
  // LEGACY: `POST /waitlist` takes `email` alone. These stay optional only so
  // the retired StepIntro form (no longer routed) still compiles — the API
  // ignores them. Don't send them from new code.
  full_name?: string
  country_id?: string
}

export interface WaitlistResponse {
  message: string
  region: string
}

export interface Country {
  id: string
  name: string
  slug: string
  region: string
  icon_key: string
}

export interface Industry {
  id: string
  name: string
  slug: string
  emoji?: string
}

export interface HiringFrustration {
  id: string
  description: string
  slug: string
  emoji?: string
}

export interface HiringTool {
  id: string
  name: string
  slug: string
  icon_url?: string
}

export interface Role {
  id: string
  name: string
  slug: string
  emoji?: string
}

export interface TeamSize {
  id: string
  label: string
  min_size: number
  max_size?: number
}

export interface OnboardingPayload {
  token: string
  industry_ids: string[]
  tool_ids: string[]
  frustration_ids: string[]
  role_id: string
  team_size_id: string
  other_industry?: string
  other_tool?: string
  other_frustration?: string
  wants_early_access: boolean
  wants_user_testing: boolean
}

export interface OnboardingResponse {
  message: string
}

// Envelope `meta`. `request_id` is always present; the cursor fields only carry
// meaning on paginated collections, so they're optional here.
export interface ApiMeta {
  request_id: string
  has_more?: boolean
  next_cursor?: string
}

export interface ApiResponse<T> {
  data: T
  meta: ApiMeta
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: ApiMeta
}

/** Product auth — POST /auth/signup, PATCH /auth/signup, resend */
export interface AuthSignupPayload {
  email: string
  password: string
}

export interface AuthSignupPatchPayload {
  email: string
  verification_session_id: string
}

export interface AuthSignupData {
  email: string
  verification_session_id: string
  code_expires_in_seconds: number
  resend_available_in_seconds: number
}

export interface AuthVerifyEmailPayload {
  code: string
  verification_session_id: string
}

export interface AuthResendVerificationPayload {
  verification_session_id: string
}

export interface AuthLoginPayload {
  email: string
  password: string
}

export interface AuthRefreshPayload {
  refresh_token: string
}

export interface AuthRefreshData {
  access_token: string
  expires_in: number
}

export interface AuthLogoutPayload {
  refresh_token: string
}

/** Passwordless login — POST /auth/login/otp/request, /auth/login/otp/verify. */
export interface AuthLoginOtpRequestPayload {
  email: string
}

export interface AuthLoginOtpVerifyPayload {
  verification_session_id: string
  code: string
}

/**
 * Returned by password login and OTP verify when the account has TOTP enabled:
 * no tokens yet, just a short-lived token to exchange on /auth/login/totp.
 */
export interface AuthMfaRequiredData {
  totp_required: true
  mfa_token: string
  expires_in: number
}

/** Login can land on either full tokens or an MFA challenge — branch on `totp_required`. */
export type AuthLoginResult = AuthTokenData | AuthMfaRequiredData

export interface AuthTotpLoginPayload {
  mfa_token: string
  code: string
}

export interface AuthForgotPasswordPayload {
  email: string
}

export interface AuthForgotPasswordData {
  message: string
}

/** `token` comes from the emailed link: {APP_URL}/reset-password?token=... */
export interface AuthResetPasswordPayload {
  token: string
  password: string
}

export interface AuthResetPasswordData {
  message: string
}

export interface AuthMeData {
  id: string
  email: string
  email_verified: boolean
  account_type?: AccountTypeApi
  first_name?: string | null
  last_name?: string | null
  legal_full_name?: string | null
  country_id?: string | null
  region?: string
  totp_enabled: boolean
  onboarding?: OnboardingProgressSummary
}

/** Product invite — GET /auth/invite/{token}, POST /auth/accept-invite. */
export interface AuthInviteData {
  email: string
  organization_name: string
  expires_at: string
}

export interface AuthAcceptInvitePayload {
  token: string
  password: string
  first_name: string
  last_name: string
}

export interface AuthTotpEnrollData {
  secret: string
  otpauth_url: string
}

export interface AuthTotpConfirmPayload {
  code: string
}

export interface AuthTotpDisablePayload {
  code: string
  password: string
}

export interface OrganizationInvitePayload {
  email: string
}

export interface OrganizationInviteData {
  email: string
  expires_at?: string
}

export type OnboardingStatusValue = 'in_progress' | 'completed'

export interface OnboardingProgressSummary {
  status: OnboardingStatusValue
  current_step?: string
  next_step?: string
  completed_steps?: string[]
}

export interface AuthTokenData {
  access_token: string
  refresh_token: string
  expires_in: number
  onboarding?: OnboardingProgressSummary
}

export type AccountTypeApi = 'individual' | 'business'
export type AddressEntryMode = 'search' | 'manual'
export type AddressVerificationStatus = 'unverified' | 'verified' | 'failed'

export interface ProductProfilePayload {
  account_type: AccountTypeApi
  first_name?: string
  last_name?: string
  country_id?: string
  legal_business_name?: string
  legal_full_name?: string
  company_role_id?: string
}

export interface ProductProfileData extends ProductProfilePayload {
  region?: string
  onboarding?: OnboardingProgressSummary
}

/** Identification keys vary by country, so this is a map, not fixed fields. */
export type ProductIdentification = Record<string, string>

export interface ProductAddressPayload {
  country_id: string
  entry_mode: AddressEntryMode
  /** Required when `entry_mode` is `search`. */
  formatted_address?: string
  line_1?: string
  line_2?: string
  city?: string
  post_code?: string
  state_or_county?: string
  /** Business identification, saved alongside the address on the same step. */
  identification?: ProductIdentification
}

export interface ProductAddressData extends ProductAddressPayload {
  verification_status?: AddressVerificationStatus
  onboarding?: OnboardingProgressSummary
}

/**
 * POST /onboarding/address/verify. Takes the address as entered and reports what
 * the verifier made of it, optionally with a corrected address to offer back.
 * In prod without a verification provider this endpoint answers 501, which the
 * caller treats as "unverified but fine to continue".
 */
/** Verify takes the address as typed; `place_id` comes from a picked suggestion. */
export interface ProductAddressVerifyPayload extends ProductAddressPayload {
  place_id?: string
}

/**
 * `not_verifiable` means the verifier could not judge it — offer manual entry.
 * `invalid_address` means it judged it and found it wrong — show field errors.
 */
export type AddressFailureReason = 'not_verifiable' | 'invalid_address'

export interface ProductAddressVerifyData extends ProductAddressPayload {
  verification_status: AddressVerificationStatus
  failure_reason?: AddressFailureReason
}

export interface ProductAddressSearchPayload {
  query: string
  country_id: string
}

export interface ProductAddressSuggestion {
  place_id: string
  description: string
  line_1?: string
  line_2?: string
  city?: string
  state_or_county?: string
  post_code?: string
  formatted_address?: string
}

export interface ProductAddressSearchData {
  suggestions: ProductAddressSuggestion[]
}

/**
 * One identification input for the selected country. Labels, formats and how
 * many there are all come from the API — never hardcode them, or a new market
 * needs a frontend release.
 */
export interface IdentificationField {
  key: string
  label: string
  format_hint?: string
  placeholder?: string
  /** Anchored regex the value must match. */
  pattern?: string
  required: boolean
}

export interface IdentificationRequirementsData {
  country_id: string
  country_slug: string
  fields: IdentificationField[]
}

export interface ProductBusinessPayload {
  business_type_id: string
  industry_id: string
  employee_count: number
}

export interface ProductBusinessData extends ProductBusinessPayload {
  onboarding?: OnboardingProgressSummary
}

/** `PUT /onboarding/compliance` — same shape, for both account types. */
export type ProductCompliancePayload = ProductBusinessPayload
export type ProductComplianceData = ProductBusinessData

export interface CompanyRole {
  id: string
  name: string
  slug: string
  icon_key?: string
}

export interface BusinessType {
  id: string
  name: string
  slug: string
}

export interface OnboardingIndustry {
  id: string
  name: string
  slug: string
  emoji?: string
}

export interface ProductOnboardingStatusData {
  status: OnboardingStatusValue
  account_type?: AccountTypeApi
  current_step?: string
  next_step?: string
  completed_steps?: string[]
  profile?: ProductProfilePayload
  address?: ProductAddressPayload & {
    verification_status?: AddressVerificationStatus
    identification?: ProductIdentification
  }
  compliance?: ProductBusinessPayload
  /** Deprecated alias of `compliance`, same data. */
  business?: ProductBusinessPayload
}

export interface ProductWorkspaceStub {
  id: string
  slug: string
}

export interface ProductOnboardingCompleteData {
  status: string
  redirect_url?: string
  workspace?: ProductWorkspaceStub
}
