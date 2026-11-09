import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { getFieldErrors, getRetryAfterSeconds } from '../api-error'

function failure(details: Record<string, unknown> | undefined): AxiosError {
  return new AxiosError('bad', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 400,
    statusText: 'Bad Request',
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { error: { code: 'VALIDATION_ERROR', message: 'some fields need attention', details } },
  })
}

describe('getFieldErrors', () => {
  it('reads the hiring endpoints, which name the field `path`', () => {
    const error = failure({ fields: [{ path: 'answers.q1', message: 'required' }] })
    expect(getFieldErrors(error)).toEqual([{ path: 'answers.q1', message: 'required' }])
  })

  it('reads the auth endpoints, which name the field `field`', () => {
    const error = failure({ fields: [{ field: 'email', message: 'invalid email format' }] })
    expect(getFieldErrors(error)).toEqual([{ path: 'email', message: 'invalid email format' }])
  })

  it('is empty without details or for a malformed list', () => {
    expect(getFieldErrors(failure(undefined))).toEqual([])
    expect(getFieldErrors(failure({ fields: [null, { path: 1 }, 'x'] }))).toEqual([])
    expect(getFieldErrors(new Error('x'))).toEqual([])
  })
})

function rateLimited(details: Record<string, unknown> | undefined, headers = {}): AxiosError {
  return new AxiosError('limited', 'ERR_BAD_REQUEST', undefined, undefined, {
    status: 429,
    statusText: 'Too Many Requests',
    headers,
    config: { headers: new AxiosHeaders() },
    data: { error: { code: 'verification_rate_limited', message: 'rate limited', details } },
  })
}

describe('getRetryAfterSeconds', () => {
  it('reads the countdown from the body', () => {
    expect(getRetryAfterSeconds(rateLimited({ retry_after_seconds: 17 }))).toBe(17)
  })

  it('falls back to the Retry-After header', () => {
    expect(getRetryAfterSeconds(rateLimited(undefined, { 'retry-after': '9' }))).toBe(9)
  })

  it('is undefined for other statuses, missing values and non-axios errors', () => {
    expect(getRetryAfterSeconds(failure({ retry_after_seconds: 5 }))).toBeUndefined()
    expect(getRetryAfterSeconds(rateLimited(undefined))).toBeUndefined()
    expect(getRetryAfterSeconds(rateLimited({ retry_after_seconds: 0 }))).toBeUndefined()
    expect(getRetryAfterSeconds(new Error('x'))).toBeUndefined()
  })
})
