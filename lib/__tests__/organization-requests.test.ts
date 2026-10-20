import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance } from '@/config/axios'

import { requests } from '../requests'

vi.mock('@/config/axios', () => ({
  axiosInstance: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}))

const api = vi.mocked(axiosInstance)

beforeEach(() => vi.clearAllMocks())

describe('organization requests', () => {
  it('accepts the agreement version it was asked for', async () => {
    api.post.mockResolvedValue({ data: { data: { dpa_accepted: true } } })
    const setup = await requests.acceptAgreements('2026-01')
    expect(api.post).toHaveBeenCalledWith('/organization/agreements', { version: '2026-01' })
    expect(setup.dpa_accepted).toBe(true)
  })

  it('writes the DPIA and privacy contact', async () => {
    api.put.mockResolvedValue({ data: { data: {} } })
    await requests.recordDpia({ reference: 'https://x', summary: 'cv screening' })
    await requests.setPrivacyContact({ privacy_contact_email: 'p@x.io' })
    expect(api.put).toHaveBeenNthCalledWith(1, '/organization/dpia', {
      reference: 'https://x',
      summary: 'cv screening',
    })
    expect(api.put).toHaveBeenNthCalledWith(2, '/organization/privacy-contact', {
      privacy_contact_email: 'p@x.io',
    })
  })

  it('drives the verification endpoints', async () => {
    api.post.mockResolvedValue({ data: { data: { status: 'pending' } } })
    await requests.changeKybCountry('GB')
    await requests.confirmKybAddress('trading')
    await requests.confirmKybName()
    expect(api.post.mock.calls.map((call) => call[0])).toEqual([
      '/organization/verification/change-country',
      '/organization/verification/confirm-address',
      '/organization/verification/confirm-name',
    ])
    expect(api.post.mock.calls[1]?.[1]).toEqual({ address_type: 'trading' })
  })
})

describe('settings requests', () => {
  it('turns screening on and sets the reapply block', async () => {
    api.put.mockResolvedValue({ data: { data: {} } })
    await requests.setAutomatedScreening(true)
    await requests.setApplicantSettings({ reapply_block_months: 6 })
    expect(api.put).toHaveBeenNthCalledWith(1, '/hiring/settings', {
      automated_screening_enabled: true,
    })
    expect(api.put).toHaveBeenNthCalledWith(2, '/hiring/applicant-settings', {
      reapply_block_months: 6,
    })
  })
})
