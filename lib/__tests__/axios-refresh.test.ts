import axios, { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance, isRefreshable } from '@/config/axios'
import { getAccessToken, getRefreshToken } from '@/lib/auth-session'

import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'

/** A 401 as the API sends one. */
function unauthorized(config: InternalAxiosRequestConfig): AxiosError {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
    status: 401,
    statusText: 'Unauthorized',
    data: {},
    headers: {},
    config,
  })
}

function ok(config: InternalAxiosRequestConfig, data: unknown) {
  return { data, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config }
}

describe('isRefreshable', () => {
  it('refreshes for authenticated calls, including the ones under /auth', () => {
    expect(isRefreshable('/auth/me')).toBe(true)
    expect(isRefreshable('/auth/totp/enroll')).toBe(true)
    expect(isRefreshable('/jobs?status=draft')).toBe(true)
  })

  it('does not refresh where a 401 means bad credentials', () => {
    expect(isRefreshable('/auth/login')).toBe(false)
    expect(isRefreshable('/auth/login/otp/verify')).toBe(false)
    expect(isRefreshable('/auth/refresh')).toBe(false)
    expect(isRefreshable('/auth/reset-password')).toBe(false)
    expect(isRefreshable('/auth/invite/abc123')).toBe(false)
    expect(isRefreshable(undefined)).toBe(false)
  })
})

describe('expired sessions', () => {
  const originalAdapter = axiosInstance.defaults.adapter

  beforeEach(() => {
    window.sessionStorage.setItem('openhr.auth.access_token', 'stale')
    window.sessionStorage.setItem('openhr.auth.refresh_token', 'refresh')
  })

  afterEach(() => {
    axiosInstance.defaults.adapter = originalAdapter
    window.sessionStorage.clear()
    vi.restoreAllMocks()
  })

  it('refreshes once and repeats /auth/me with the new token', async () => {
    const seen: string[] = []
    const adapter: AxiosAdapter = async (config) => {
      const token = String(config.headers.Authorization)
      seen.push(token)
      if (token === 'Bearer stale') throw unauthorized(config)
      return ok(config, { data: { id: 'u1' } })
    }
    axiosInstance.defaults.adapter = adapter
    const refresh = vi
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { data: { access_token: 'fresh', expires_in: 900 } } })

    const response = await axiosInstance.get('/auth/me')

    expect(response.data).toEqual({ data: { id: 'u1' } })
    expect(refresh).toHaveBeenCalledOnce()
    expect(seen).toEqual(['Bearer stale', 'Bearer fresh'])
    expect(getAccessToken()).toBe('fresh')
  })

  it('ends the session when the refresh token is no good either', async () => {
    axiosInstance.defaults.adapter = async (config) => {
      throw unauthorized(config)
    }
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('401'))

    await expect(axiosInstance.get('/auth/me')).rejects.toMatchObject({
      response: { status: 401 },
    })
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('leaves a wrong password alone: no refresh, session untouched', async () => {
    axiosInstance.defaults.adapter = async (config) => {
      throw unauthorized(config)
    }
    const refresh = vi.spyOn(axios, 'post')

    await expect(axiosInstance.post('/auth/login', {})).rejects.toMatchObject({
      response: { status: 401 },
    })
    expect(refresh).not.toHaveBeenCalled()
    expect(getAccessToken()).toBe('stale')
  })

  it('shares one refresh between requests that fail together', async () => {
    axiosInstance.defaults.adapter = async (config) => {
      if (String(config.headers.Authorization) === 'Bearer stale') throw unauthorized(config)
      return ok(config, {})
    }
    const refresh = vi
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: { data: { access_token: 'fresh', expires_in: 900 } } })

    await Promise.all([axiosInstance.get('/auth/me'), axiosInstance.get('/jobs')])
    expect(refresh).toHaveBeenCalledOnce()
  })
})
