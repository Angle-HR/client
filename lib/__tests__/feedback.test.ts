import { describe, expect, it } from 'vitest'

import { buildFeedbackMailto } from '../feedback'

describe('buildFeedbackMailto', () => {
  it('targets support and prefills the request id', () => {
    const url = buildFeedbackMailto({ requestId: 'abc123' })
    expect(url.startsWith('mailto:support@tryopenhr.com?')).toBe(true)
    expect(decodeURIComponent(url)).toContain('Error/request id: abc123')
  })
})
