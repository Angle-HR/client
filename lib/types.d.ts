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

export interface ProductAddressPayload {
  country_id: string
  entry_mode: AddressEntryMode
  formatted_address?: string
  line_1?: string
  line_2?: string
  city?: string
  post_code?: string
  state_or_county?: string
}

export interface ProductAddressData extends ProductAddressPayload {
  verification_status?: AddressVerificationStatus
  onboarding?: OnboardingProgressSummary
}

export interface ProductBusinessPayload {
  business_type_id: string
  industry_id: string
  employee_count: number
}

export interface ProductBusinessData extends ProductBusinessPayload {
  onboarding?: OnboardingProgressSummary
}

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
  address?: ProductAddressPayload & { verification_status?: AddressVerificationStatus }
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
