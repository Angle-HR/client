import axios, { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance, needsSession } from '@/config/axios'
import { clearSession, getCsrfToken, setSession } from '@/lib/auth-session'

import type { InternalAxiosRequestConfig } from 'axios'

function failure(config: InternalAxiosRequestConfig, status: number, code: string): AxiosError {
  return new AxiosError(code, 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: code,
    data: { error: { code, message: code } },
    headers: {},
    config,
  })
}

function ok(config: InternalAxiosRequestConfig, data: unknown) {
  return { data, status: 200, statusText: 'OK', headers: new AxiosHeaders(), config }
}

const meWith = (csrf: string) => ({ data: { data: { id: 'u1', csrf_token: csrf } } })

describe('needsSession', () => {
  it('is true for authenticated calls, including the ones under /auth', () => {
    expect(needsSession('/auth/me')).toBe(true)
    expect(needsSession('/auth/totp/enroll')).toBe(true)
    expect(needsSession('/jobs?status=draft')).toBe(true)
  })

  it('is false for sign-in, invites, logout and the public apply endpoints', () => {
    expect(needsSession('/auth/login')).toBe(false)
    expect(needsSession('/auth/login/otp/verify')).toBe(false)
    expect(needsSession('/auth/logout')).toBe(false)
    expect(needsSession('/auth/reset-password')).toBe(false)
    expect(needsSession('/auth/invite/abc123')).toBe(false)
    expect(needsSession('/public/jobs/j1/applications')).toBe(false)
    expect(needsSession(undefined)).toBe(false)
  })
})

describe('cookie session', () => {
  const originalAdapter = axiosInstance.defaults.adapter
  const sent: Array<{ method?: string; url?: string; csrf?: string; credentials?: boolean }> = []

  beforeEach(() => {
    sent.length = 0
    clearSession()
  })

  afterEach(() => {
    axiosInstance.defaults.adapter = originalAdapter
    clearSession()
    vi.restoreAllMocks()
  })

  function record(config: InternalAxiosRequestConfig): void {
    const csrf = config.headers['X-CSRF-Token']
    sent.push({
      method: config.method,
      url: config.url,
      csrf: csrf ? String(csrf) : undefined,
      credentials: config.withCredentials,
    })
  }

  it('sends credentials and no Authorization header', async () => {
    let authorization: unknown
    axiosInstance.defaults.adapter = async (config) => {
      record(config)
      authorization = config.headers.Authorization
      return ok(config, {})
    }
    await axiosInstance.get('/jobs')
    expect(sent[0]).toMatchObject({ credentials: true, csrf: undefined })
    expect(authorization).toBeUndefined()
  })

  it('sends the CSRF token on writes, not on reads', async () => {
    setSession({ csrf_token: 'tok' })
    axiosInstance.defaults.adapter = async (config) => {
      record(config)
      return ok(config, {})
    }
    await axiosInstance.get('/jobs')
    await axiosInstance.post('/jobs', {})
    expect(sent.map((r) => r.csrf)).toEqual([undefined, 'tok'])
  })

  it('reads the token from /auth/me before the first write after a reload, once', async () => {
    axiosInstance.defaults.adapter = async (config) => {
      record(config)
      return ok(config, {})
    }
    const me = vi.spyOn(axios, 'get').mockResolvedValue(meWith('fresh'))

    await Promise.all([axiosInstance.post('/jobs', {}), axiosInstance.patch('/jobs/1', {})])

    expect(me).toHaveBeenCalledOnce()
    expect(sent.map((r) => r.csrf)).toEqual(['fresh', 'fresh'])
    expect(getCsrfToken()).toBe('fresh')
  })

  it('sends no token to public writes', async () => {
    axiosInstance.defaults.adapter = async (config) => {
      record(config)
      return ok(config, {})
    }
    const me = vi.spyOn(axios, 'get')
    await axiosInstance.post('/auth/login', {})
    expect(me).not.toHaveBeenCalled()
    expect(sent[0]?.csrf).toBeUndefined()
  })

  it('retries once with the current token when the server calls it stale', async () => {
    setSession({ csrf_token: 'stale' })
    axiosInstance.defaults.adapter = async (config) => {
      record(config)
      if (config.headers['X-CSRF-Token'] === 'stale') throw failure(config, 403, 'CSRF_INVALID')
      return ok(config, { done: true })
    }
    vi.spyOn(axios, 'get').mockResolvedValue(meWith('current'))

    const response = await axiosInstance.post('/jobs', {})

    expect(response.data).toEqual({ done: true })
    expect(sent.map((r) => r.csrf)).toEqual(['stale', 'current'])
  })

  it('does not retry other 403s', async () => {
    setSession({ csrf_token: 'tok' })
    axiosInstance.defaults.adapter = async (config) => {
      record(config)
      throw failure(config, 403, 'FORBIDDEN')
    }
    await expect(axiosInstance.post('/jobs', {})).rejects.toMatchObject({
      response: { status: 403 },
    })
    expect(sent).toHaveLength(1)
  })

  it('ends the local session on a 401: there is no refresh', async () => {
    setSession({ csrf_token: 'tok' })
    axiosInstance.defaults.adapter = async (config) => {
      record(config)
      throw failure(config, 401, 'UNAUTHORIZED')
    }
    const refresh = vi.spyOn(axios, 'post')
    await expect(axiosInstance.get('/auth/me')).rejects.toMatchObject({
      response: { status: 401 },
    })
    expect(refresh).not.toHaveBeenCalled()
    expect(sent).toHaveLength(1)
    expect(getCsrfToken()).toBeNull()
  })

  it('leaves a wrong password alone: session untouched', async () => {
    setSession({ csrf_token: 'tok' })
    axiosInstance.defaults.adapter = async (config) => {
      throw failure(config, 401, 'INVALID_CREDENTIALS')
    }
    await expect(axiosInstance.post('/auth/login', {})).rejects.toMatchObject({
      response: { status: 401 },
    })
    expect(getCsrfToken()).toBe('tok')
  })
})
