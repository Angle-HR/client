/**
 * The company's publishing requirements and verification (KYB), read from the
 * OpenAPI document on 2026-10-20.
 */

/** `GET`/`POST /organization/agreements` and the DPIA and privacy-contact writes all return this. */
interface ApiCompanySetup {
  /** The version of the data processing agreement that must be accepted. */
  dpa_version?: string
  dpa_accepted?: boolean
  dpa_accepted_at?: string
  automated_screening_enabled?: boolean
  /** 0 when no DPIA is recorded. */
  dpia_version?: number
  dpia_recorded_at?: string
  dpo_contact?: string
  privacy_contact_email?: string
  kyb_status?: string
}

interface ApiDpiaBody {
  /** Where the full assessment lives. */
  reference: string
  /** What automated screening the DPIA covers. */
  summary: string
}

interface ApiPrivacyContactBody {
  dpo_contact?: string
  privacy_contact_email: string
}

type ApiKybStatus = 'not_started' | 'pending' | 'verified' | 'failed'
type ApiKybDisplay = 'verified' | 'pending_review' | 'action_required' | 'failed' | 'not_started'

interface ApiKybState {
  /** `individual` for a personal organization: manual identity review, no registry questions. */
  kind?: 'individual' | 'business'
  status?: ApiKybStatus
  /** What to show: `action_required` is a warning the user can resolve in place. */
  display?: ApiKybDisplay
  /** 1 is checked at once; other countries are queued for manual review. */
  tier?: number
  country_code?: string
  can_publish?: boolean
  can_retry?: boolean
  /** A retry that only needs the name and number again. */
  light_retry?: boolean
  name_confirmable?: boolean
  address_confirmable?: boolean
  registry_name?: string
  registered_address?: string
  failure_reason?: string
  checked_at?: string
  verified_at?: string
}

interface ApiKybAddress {
  line1?: string
  line2?: string
  city?: string
  region?: string
  post_code?: string
  country?: string
}

interface ApiKybSubmitBody {
  country_code: string
  legal_name: string
  registration_number?: string
  identifiers?: Record<string, string>
  address?: ApiKybAddress
  address_type?: 'registered' | 'trading'
}

interface ApiKybRetryBody {
  legal_name?: string
  registration_number?: string
}

export type {
  ApiCompanySetup,
  ApiDpiaBody,
  ApiKybAddress,
  ApiKybDisplay,
  ApiKybRetryBody,
  ApiKybState,
  ApiKybStatus,
  ApiKybSubmitBody,
  ApiPrivacyContactBody,
}
