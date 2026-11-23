import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { clearSession } from '@/lib/auth-session'
import { clearCsrfToken, getCsrfToken, setCsrfToken } from '@/lib/csrf'
import { ENDPOINTS } from '@/lib/endpoints'

import type { ApiErrorBody, ApiResponse, AuthMeData } from '@/lib/types'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

// The session is an HttpOnly cookie the API sets, so every request carries
// credentials; JS never sees or stores the session itself.
const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

const SAFE_METHODS = new Set(['get', 'head', 'options'])

axiosInstance.interceptors.request.use((config) => {
  const token = getCsrfToken()
  if (token && !SAFE_METHODS.has((config.method ?? 'get').toLowerCase())) {
    config.headers['X-CSRF-Token'] = token
  }
  return config
})

/**
 * Endpoints that answer 401 because of what was sent — a wrong password, a bad
 * code — rather than because the session is gone. Those are passed straight
 * back to the caller and do not end the session.
 */
const CREDENTIAL_ENDPOINTS = [
  ENDPOINTS.auth.signup(),
  ENDPOINTS.auth.login(),
  ENDPOINTS.auth.loginOtpRequest(),
  ENDPOINTS.auth.loginOtpVerify(),
  ENDPOINTS.auth.loginTotp(),
  ENDPOINTS.auth.logout(),
  ENDPOINTS.auth.verifyEmail(),
  ENDPOINTS.auth.resendVerification(),
  ENDPOINTS.auth.forgotPassword(),
  ENDPOINTS.auth.resetPassword(),
  ENDPOINTS.auth.acceptInvite(),
  ENDPOINTS.auth.invite(''),
]

/** Whether a 401 from this URL means the session is gone. */
function endsSession(url: string | undefined): boolean {
  if (!url) return false
  const path = url.split('?')[0] ?? ''
  return !CREDENTIAL_ENDPOINTS.some((endpoint) =>
    // `invite('')` ends in a slash and stands for every `/auth/invite/{token}`.
    endpoint.endsWith('/') ? path.startsWith(endpoint) : path === endpoint,
  )
}

/** Marks a request that has already been retried, so a failure can't loop. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

/** One `/auth/me` in flight at a time, however many writes were refused at once. */
let csrfRefreshInFlight: Promise<void> | null = null

async function refreshCsrfToken(): Promise<void> {
  // The instance itself: the response interceptor below stores the new token.
  await axiosInstance.get<ApiResponse<AuthMeData>>(ENDPOINTS.auth.me())
}

axiosInstance.interceptors.response.use(
  (response) => {
    // Every step that starts or advances a session, and `/auth/me`, answers with
    // a fresh token. Taking it here keeps the call sites free of session code.
    const token = (response.data as ApiResponse<{ csrf_token?: unknown }> | undefined)?.data
      ?.csrf_token
    if (typeof token === 'string' && token) setCsrfToken(token)
    return response
  },
  async (error: AxiosError<Partial<ApiErrorBody>>) => {
    const config = error.config as RetriableConfig | undefined

    if (error.response?.status === 403 && error.response.data?.error?.code === 'CSRF_INVALID') {
      if (!config || config._retried) return Promise.reject(error)
      config._retried = true
      try {
        csrfRefreshInFlight = csrfRefreshInFlight ?? refreshCsrfToken()
        await csrfRefreshInFlight
      } catch {
        return Promise.reject(error)
      } finally {
        csrfRefreshInFlight = null
      }
      return axiosInstance(config)
    }

    if (error.response?.status === 401 && endsSession(config?.url)) {
      // No session (or an expired one): drop everything held in memory.
      clearCsrfToken()
      clearSession()
    }
    return Promise.reject(error)
  },
)

export { axiosInstance, endsSession }
