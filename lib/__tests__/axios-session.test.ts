import { AxiosError, AxiosHeaders } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { axiosInstance, endsSession } from '@/config/axios'
import { clearCsrfToken, getCsrfToken, setCsrfToken } from '@/lib/csrf'

import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'

function reply(config: InternalAxiosRequestConfig, status: number, data: unknown) {
  const response = {
    data,
    status,
    statusText: '',
    headers: new AxiosHeaders(),
    config,
  }
  if (status < 400) return response
  throw new AxiosError('failed', 'ERR_BAD_REQUEST', config, null, response)
}

const originalAdapter = axiosInstance.defaults.adapter

beforeEach(() => clearCsrfToken())
afterEach(() => {
  axiosInstance.defaults.adapter = originalAdapter
  window.sessionStorage.clear()
})

describe('endsSession', () => {
  it('treats a 401 as a lost session for authenticated calls only', () => {
    expect(endsSession('/auth/me')).toBe(true)
    expect(endsSession('/jobs?status=draft')).toBe(true)
    expect(endsSession('/auth/login')).toBe(false)
    expect(endsSession('/auth/login/totp')).toBe(false)
    expect(endsSession('/auth/invite/abc')).toBe(false)
    expect(endsSession(undefined)).toBe(false)
  })
})

describe('requests', () => {
  it('send credentials, and the CSRF header on writes only', async () => {
    const seen: Array<{ method?: string; csrf: unknown; credentials?: boolean }> = []
    const adapter: AxiosAdapter = async (config) => {
      seen.push({
        method: config.method,
        csrf: config.headers.get('X-CSRF-Token'),
        credentials: config.withCredentials,
      })
      return reply(config, 200, { data: {} })
    }
    axiosInstance.defaults.adapter = adapter
    setCsrfToken('tok')

    await axiosInstance.get('/jobs')
    await axiosInstance.post('/jobs', {})
    await axiosInstance.delete('/jobs/1')

    expect(seen.map((s) => s.credentials)).toEqual([true, true, true])
    expect(seen.map((s) => s.csrf)).toEqual([undefined, 'tok', 'tok'])
  })

  it('keep the token a response hands out in memory, not in storage', async () => {
    axiosInstance.defaults.adapter = async (config) =>
      reply(config, 200, { data: { csrf_token: 'fresh', onboarding: { status: 'completed' } } })

    await axiosInstance.post('/auth/login', {})

    expect(getCsrfToken()).toBe('fresh')
    expect(JSON.stringify({ ...sessionStorage, ...localStorage })).not.toContain('fresh')
  })
})

describe('CSRF_INVALID', () => {
  const csrfError = { error: { code: 'CSRF_INVALID', message: 'bad token' } }

  it('refetches /auth/me once and repeats the write with the new token', async () => {
    const calls: string[] = []
    axiosInstance.defaults.adapter = async (config) => {
      calls.push(`${config.method} ${config.url} ${config.headers.get('X-CSRF-Token') ?? '-'}`)
      if (config.url === '/auth/me') return reply(config, 200, { data: { csrf_token: 'new' } })
      if (config.headers.get('X-CSRF-Token') !== 'new') return reply(config, 403, csrfError)
      return reply(config, 200, { data: { ok: true } })
    }
    setCsrfToken('old')

    const res = await axiosInstance.post('/jobs', {})

    expect(res.data).toEqual({ data: { ok: true } })
    expect(calls).toEqual(['post /jobs old', 'get /auth/me -', 'post /jobs new'])
  })

  it('does not retry a second time', async () => {
    let writes = 0
    axiosInstance.defaults.adapter = async (config) => {
      if (config.url === '/auth/me') return reply(config, 200, { data: { csrf_token: 'new' } })
      writes += 1
      return reply(config, 403, csrfError)
    }

    await expect(axiosInstance.post('/jobs', {})).rejects.toBeInstanceOf(AxiosError)
    expect(writes).toBe(2)
  })
})

describe('an expired session', () => {
  it('drops the token and flow state on a 401, but not on a bad password', async () => {
    axiosInstance.defaults.adapter = async (config) =>
      reply(config, 401, { error: { code: 'UNAUTHORIZED', message: 'no' } })
    setCsrfToken('tok')
    window.sessionStorage.setItem('openhr.signup.verification_email', 'a@b.co')

    await expect(axiosInstance.post('/auth/login', {})).rejects.toBeInstanceOf(AxiosError)
    expect(getCsrfToken()).toBe('tok')

    await expect(axiosInstance.get('/auth/me')).rejects.toBeInstanceOf(AxiosError)
    expect(getCsrfToken()).toBeNull()
    expect(window.sessionStorage.getItem('openhr.signup.verification_email')).toBeNull()
  })
})
