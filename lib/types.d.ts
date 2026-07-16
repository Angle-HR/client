export type WaitlistStep = 'intro' | 'success' | 'survey' | 'early-access' | 'thanks'

export interface WaitlistPayload {
  full_name: string
  email: string
  country_id: string
}

export interface WaitlistResponse {
  message: string
  region: string
  token: string
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

export interface ApiResponse<T> {
  data: T
  meta: {
    request_id: string
  }
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
  }
  meta?: {
    request_id: string
  }
}
