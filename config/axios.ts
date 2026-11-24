import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { clearAuthState, getCsrfToken, setCsrfToken } from '@/lib/auth-session'
import { ENDPOINTS } from '@/lib/endpoints'

import type { ApiErrorBody, ApiResponse, AuthMeData } from '@/lib/types'

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL

/**
 * The session is an HttpOnly cookie set by the API, so every request carries
 * credentials. Writes also carry the session's CSRF token (see below).
 */
const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Endpoints that work without a session: signing in or up, resetting a
 * password, invites, logout. A 401 from them means what was sent was wrong,
 * not that the session ended, and their writes need no CSRF token.
 */
const PUBLIC_ENDPOINTS = [
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
  // Ends in a slash: stands for every `/auth/invite/{token}`.
  ENDPOINTS.auth.invite(''),
  // The public job and apply endpoints.
  '/public/',
]

/** Whether this URL needs the signed-in session. */
function needsSession(url: string | undefined): boolean {
  if (!url) return false
  const path = url.split('?')[0] ?? ''
  return !PUBLIC_ENDPOINTS.some((endpoint) =>
    endpoint.endsWith('/') ? path.startsWith(endpoint) : path === endpoint,
  )
}

const SAFE_METHODS = ['get', 'head', 'options']

function isWrite(config: InternalAxiosRequestConfig): boolean {
  return !SAFE_METHODS.includes((config.method ?? 'get').toLowerCase())
}

/**
 * The CSRF token lives in memory, so after a reload the first write asks
 * `/auth/me` for it. One request at a time: a page that writes several things
 * at once shares it.
 */
let csrfInFlight: Promise<string | null> | null = null

async function loadCsrfToken(): Promise<string | null> {
  try {
    // Bare axios, not the instance: this call must not be intercepted itself.
    const { data } = await axios.get<ApiResponse<AuthMeData>>(`${baseURL}${ENDPOINTS.auth.me()}`, {
      withCredentials: true,
    })
    setCsrfToken(data.data.csrf_token)
    return getCsrfToken()
  } catch {
    return null
  }
}

function ensureCsrfToken(): Promise<string | null> {
  const token = getCsrfToken()
  if (token) return Promise.resolve(token)
  csrfInFlight =
    csrfInFlight ??
    loadCsrfToken().finally(() => {
      csrfInFlight = null
    })
  return csrfInFlight
}

axiosInstance.interceptors.request.use(async (config) => {
  if (isWrite(config) && needsSession(config.url)) {
    const token = await ensureCsrfToken()
    if (token) config.headers['X-CSRF-Token'] = token
  }
  return config
})

/** Marks a request that has already been retried, so a failure can't loop. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

function errorCode(error: AxiosError): string | undefined {
  return (error.response?.data as Partial<ApiErrorBody> | undefined)?.error?.code
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined
    if (!config || !needsSession(config.url)) return Promise.reject(error)

    // The session ended (idle or absolute timeout, revoked elsewhere). There is
    // no refresh: the cookie session slides by itself, so a 401 is final.
    if (error.response?.status === 401) {
      clearAuthState()
      return Promise.reject(error)
    }

    // A stale token, e.g. the session was rotated in another tab. Read the
    // current one and try once more.
    if (error.response?.status === 403 && errorCode(error) === 'CSRF_INVALID' && !config._retried) {
      config._retried = true
      setCsrfToken(null)
      const token = await ensureCsrfToken()
      if (!token) return Promise.reject(error)
      config.headers['X-CSRF-Token'] = token
      return axiosInstance(config)
    }

    return Promise.reject(error)
  },
)

export { axiosInstance, needsSession }
