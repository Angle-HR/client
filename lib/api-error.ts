import axios from 'axios'

import type { ApiErrorBody } from './types'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'

// Per-endpoint: which form field a given API error `code` belongs on.
// e.g. { CONFLICT: 'email' } routes a 409 email-conflict onto the email input.
type FieldErrorMap<T extends FieldValues> = Partial<Record<string, Path<T>>>

const DEFAULT_FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

function getApiError(error: unknown): ApiErrorBody['error'] | undefined {
  if (!axios.isAxiosError(error)) return undefined
  const body = error.response?.data as Partial<ApiErrorBody> | undefined
  if (body?.error?.code && body.error?.message) return body.error
  return undefined
}

/**
 * Maps an API error onto a form field via react-hook-form's `setError` when the
 * error `code` is known for this form; otherwise returns a message to show as a
 * fallback (e.g. in a Banner). Returns `undefined` when the error was mapped to
 * a field, since no separate fallback message is needed in that case.
 */
function applyApiError<T extends FieldValues>(
  error: unknown,
  setError?: UseFormSetError<T>,
  fieldMap: FieldErrorMap<T> = {},
  fallbackMessage = DEFAULT_FALLBACK_MESSAGE,
): string | undefined {
  const apiError = getApiError(error)
  if (!apiError) return fallbackMessage

  const field = fieldMap[apiError.code]
  if (field && setError) {
    setError(field, { type: 'server', message: apiError.message })
    return undefined
  }

  return apiError.message || fallbackMessage
}

export { applyApiError, getApiError }
export type { FieldErrorMap }
