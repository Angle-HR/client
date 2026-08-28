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

    // Only a 401 on a first attempt is worth refreshing for. The auth endpoints
    // answer 401 for bad credentials, which a refresh would not fix.
    const isRetriable =
      error.response?.status === 401 &&
      config &&
      !config._retried &&
      !config.url?.startsWith('/auth/')

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

export { axiosInstance }
