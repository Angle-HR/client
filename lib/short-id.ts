/**
 * Short ids for the address bar. The API names a job, template or application by a
 * 36-character UUID; the browser address shows the same 128 bits as 22 URL-safe
 * characters instead (`b64url` of the 16 bytes), so a link no longer reads as an
 * internal record id. The id is not a secret and access is still checked by the API.
 * An old link that carries the UUID keeps working: `fromShortId` passes it through.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const SHORT = /^[A-Za-z0-9_-]{22}$/

function toShortId(uuid: string): string {
  if (!UUID.test(uuid)) return uuid
  const hex = uuid.replace(/-/g, '')
  let binary = ''
  for (let i = 0; i < 32; i += 2) binary += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromShortId(value: string): string {
  if (!SHORT.test(value)) return value
  const binary = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '==')
  const hex = Array.from(binary, (char) => char.charCodeAt(0).toString(16).padStart(2, '0')).join(
    '',
  )
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

/** The id from an address, as the API knows it; null when there is none. */
function idFromAddress(value: string | null | undefined): string | null {
  return value ? fromShortId(value) : null
}

export { fromShortId, idFromAddress, toShortId }
