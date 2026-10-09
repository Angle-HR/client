import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { clearSession, getAccessToken, getRefreshToken, setAccessToken } from '@/lib/auth-session'
import { ENDPOINTS } from '@/lib/endpoints'

import type { ApiResponse, AuthRefreshData } from '@/lib/types'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Endpoints that answer 401 because of what was sent — a wrong password, a bad
 * code, a spent refresh token — rather than because the session has expired. A
 * refresh would not fix those, so they are passed straight back to the caller.
 *
 * Everything else under `/auth/` (`/auth/me`, the TOTP settings) is an ordinary
 * authenticated call and gets its one refresh like any other.
 */
const CREDENTIAL_ENDPOINTS = [
  ENDPOINTS.auth.signup(),
  ENDPOINTS.auth.login(),
  ENDPOINTS.auth.loginOtpRequest(),
  ENDPOINTS.auth.loginOtpVerify(),
  ENDPOINTS.auth.loginTotp(),
  ENDPOINTS.auth.refresh(),
  ENDPOINTS.auth.logout(),
  ENDPOINTS.auth.verifyEmail(),
  ENDPOINTS.auth.resendVerification(),
  ENDPOINTS.auth.forgotPassword(),
  ENDPOINTS.auth.resetPassword(),
  ENDPOINTS.auth.acceptInvite(),
  ENDPOINTS.auth.invite(''),
]

/** Whether a 401 from this URL means the session expired and is worth a refresh. */
function isRefreshable(url: string | undefined): boolean {
  if (!url) return false
  const path = url.split('?')[0] ?? ''
  return !CREDENTIAL_ENDPOINTS.some((endpoint) =>
    // `invite('')` ends in a slash and stands for every `/auth/invite/{token}`.
    endpoint.endsWith('/') ? path.startsWith(endpoint) : path === endpoint,
  )
}

/** Marks a request that has already been retried, so a failure can't loop. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

/**
 * One refresh in flight at a time. Without this, a page that fires several
 * requests at once would send one refresh per 401 and the later ones would race
 * against a rotated token.
 */
let refreshInFlight: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return null

  try {
    // Bare axios, not the instance: this call must not be intercepted itself.
    const { data } = await axios.post<ApiResponse<AuthRefreshData>>(
      `${baseURL}${ENDPOINTS.auth.refresh()}`,
      { refresh_token: refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )
    setAccessToken(data.data.access_token, data.data.expires_in)
    return data.data.access_token
  } catch {
    return null
  }
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined

    // Only a 401 on a first attempt is worth refreshing for, and only where it
    // means the session expired.
    const isRetriable =
      error.response?.status === 401 && config && !config._retried && isRefreshable(config.url)

    if (!isRetriable) {
      return Promise.reject(error)
    }

    config._retried = true
    refreshInFlight = refreshInFlight ?? refreshAccessToken()
    const token = await refreshInFlight
    refreshInFlight = null

    if (!token) {
      // Refresh itself failed: the session is over, so stop carrying its tokens.
      clearSession()
      return Promise.reject(error)
    }

    config.headers.Authorization = `Bearer ${token}`
    return axiosInstance(config)
  },
)

export { axiosInstance, isRefreshable }
