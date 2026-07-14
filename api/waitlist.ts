interface WaitlistPayload {
  full_name: string
  email: string
  country_id: string
}

interface WaitlistResponse {
  message: string
  region: string
  token: string
}

interface Country {
  id: string
  name: string
  slug: string
  region: string
  icon_key: string
}

interface Industry {
  id: string
  name: string
  slug: string
  emoji?: string
}

interface HiringFrustration {
  id: string
  description: string
  slug: string
  emoji?: string
}

interface HiringTool {
  id: string
  name: string
  slug: string
  icon_url?: string
}

interface Role {
  id: string
  name: string
  slug: string
  emoji?: string
}

interface TeamSize {
  id: string
  label: string
  min_size: number
  max_size?: number
}

interface OnboardingPayload {
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

interface OnboardingResponse {
  message: string
}

interface ApiResponse<T> {
  data: T
  meta: {
    request_id: string
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const baseUrl = 'https://internal-server.0110100001110010.org/api/v1/'

async function joinWaitlist(payload: WaitlistPayload): Promise<WaitlistResponse> {
  if (!baseUrl) {
    throw new ApiError('NEXT_PUBLIC_API_BASE_URL is not set')
  }

  const res = await fetch(`${baseUrl}/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new ApiError(`Failed to join waitlist (${res.status})`, res.status)
  }

  const body = (await res.json()) as ApiResponse<WaitlistResponse>
  return body.data
}

async function fetchList<T>(path: string): Promise<T[]> {
  if (!baseUrl) {
    throw new ApiError('NEXT_PUBLIC_API_BASE_URL is not set')
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!res.ok) {
    throw new ApiError(`Failed to retrieve ${path} (${res.status})`, res.status)
  }

  const body = (await res.json()) as ApiResponse<T[]>
  return body.data
}

const getCountries = () => fetchList<Country>('/countries')
const getHiringFrustrations = () => fetchList<HiringFrustration>('/hiring-frustrations')
const getHiringTools = () => fetchList<HiringTool>('/hiring-tools')
const getIndustries = () => fetchList<Industry>('/industries')
const getRoles = () => fetchList<Role>('/roles')
const getTeamSizes = () => fetchList<TeamSize>('/team-sizes')

async function submitOnboarding(payload: OnboardingPayload): Promise<OnboardingResponse> {
  if (!baseUrl) {
    throw new ApiError('NEXT_PUBLIC_API_BASE_URL is not set')
  }

  const res = await fetch(`${baseUrl}/waitlist/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new ApiError(`Failed to submit onboarding form (${res.status})`, res.status)
  }

  const body = (await res.json()) as ApiResponse<OnboardingResponse>
  return body.data
}

export {
  joinWaitlist,
  getCountries,
  getHiringFrustrations,
  getHiringTools,
  getIndustries,
  getRoles,
  getTeamSizes,
  submitOnboarding,
  ApiError,
}
export type {
  WaitlistPayload,
  WaitlistResponse,
  Country,
  Industry,
  HiringFrustration,
  HiringTool,
  Role,
  TeamSize,
  OnboardingPayload,
  OnboardingResponse,
}
