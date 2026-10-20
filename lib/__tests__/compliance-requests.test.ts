import { beforeEach, describe, expect, it, vi } from 'vitest'

import { axiosInstance } from '@/config/axios'

import { requests } from '../requests'

vi.mock('@/config/axios', () => ({
  axiosInstance: { get: vi.fn(), put: vi.fn(), post: vi.fn() },
}))

const api = vi.mocked(axiosInstance)

beforeEach(() => vi.clearAllMocks())

describe('compliance requests', () => {
  it('confirms a gate with the revision as If-Match', async () => {
    api.put.mockResolvedValue({ data: { data: [{ id: 'g', confirmed: true }] } })
    const gates = await requests.confirmComplianceGate('j1', 'g', true, 4)
    expect(api.put).toHaveBeenCalledWith(
      '/jobs/j1/compliance/g',
      { confirmed: true },
      { headers: { 'If-Match': '4' } },
    )
    expect(gates[0]?.confirmed).toBe(true)
  })

  it('sends no If-Match without a revision', async () => {
    api.put.mockResolvedValue({ data: { data: {} } })
    await requests.setScreeningRules('j1', { rules: [] })
    expect(api.put).toHaveBeenCalledWith(
      '/jobs/j1/disqualification-rules',
      { rules: [] },
      { headers: {} },
    )
  })

  it('reads the share kit and an empty gate list', async () => {
    api.get.mockResolvedValueOnce({ data: { data: { job_url: 'https://x/j', links: [] } } })
    expect((await requests.getShareKit('j1')).job_url).toBe('https://x/j')
    api.get.mockResolvedValueOnce({ data: { data: null } })
    expect(await requests.getComplianceGates('j1')).toEqual([])
  })
})
