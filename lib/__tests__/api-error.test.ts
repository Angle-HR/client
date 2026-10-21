import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { getFieldErrors } from '../api-error'

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
