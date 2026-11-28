import { describe, expect, it } from 'vitest'

import {
  fillPlaceholders,
  formatFileSize,
  isLiveOffer,
  messageState,
  toMessage,
  toOffer,
} from '../applications/communications'

describe('messageState', () => {
  it('says where a message stands', () => {
    expect(messageState(toMessage({ status: 'sent' })).tone).toBe('ok')
    expect(messageState(toMessage({ status: 'scheduled' })).label).toBe('Scheduled')
    expect(messageState(toMessage({ status: 'failed' })).tone).toBe('bad')
    expect(messageState(toMessage({ status: 'cancelled' })).tone).toBe('off')
  })
})

describe('isLiveOffer', () => {
  it('is true for a draft, a sent or an opened offer only', () => {
    for (const status of ['draft', 'sent', 'viewed']) {
      expect(isLiveOffer(toOffer({ status }))).toBe(true)
    }
    for (const status of ['signed', 'declined', 'expired', 'withdrawn']) {
      expect(isLiveOffer(toOffer({ status }))).toBe(false)
    }
  })
})

describe('fillPlaceholders', () => {
  it('fills the known words and leaves unknown ones as typed', () => {
    expect(
      fillPlaceholders('Hi {{candidate_name}}, {{ company }} {{nope}}', {
        candidate_name: 'Ada',
        company: 'Acme',
      }),
    ).toBe('Hi Ada, Acme {{nope}}')
  })
})

describe('formatFileSize', () => {
  it('uses the largest unit that fits', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2 KB')
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB')
  })
})
