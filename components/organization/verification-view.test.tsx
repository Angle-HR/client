import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { VerificationView } from './verification-view'

const requestReview = vi.fn()
let kyb: Record<string, unknown>

vi.mock('@/lib/queries', () => ({
  useKyb: () => ({ data: kyb, isPending: false, isError: false }),
  useHiringCatalog: () => ({ data: { markets: [] } }),
}))

const idle = { mutate: vi.fn(), isPending: false, isError: false }
vi.mock('@/lib/mutations', () => ({
  useSubmitKyb: () => idle,
  useRetryKyb: () => idle,
  useConfirmKybName: () => idle,
  useConfirmKybAddress: () => idle,
  useRequestKybReview: () => ({ ...idle, mutate: requestReview }),
}))

describe('VerificationView for an individual', () => {
  beforeEach(() => requestReview.mockClear())

  it('shows a review in progress with no company form', () => {
    kyb = { kind: 'individual', status: 'pending', tier: 2 }
    render(<VerificationView />)
    expect(screen.getByText('Your identity is being reviewed')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Registration number/)).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Submit for verification' }),
    ).not.toBeInTheDocument()
  })

  it('offers a new review after a rejection', () => {
    kyb = { kind: 'individual', status: 'failed', failure_reason: 'id_unclear' }
    render(<VerificationView />)
    expect(screen.getByText('id_unclear')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Request a new review' }))
    expect(requestReview).toHaveBeenCalledOnce()
  })

  it('says so once verified', () => {
    kyb = { kind: 'individual', status: 'verified' }
    render(<VerificationView />)
    expect(screen.getByText('Your account is verified')).toBeInTheDocument()
  })
})

describe('VerificationView for a business', () => {
  it('keeps the company form', () => {
    kyb = { kind: 'business', status: 'pending', display: 'not_started' }
    render(<VerificationView />)
    expect(screen.getByText('Verify your company')).toBeInTheDocument()
  })
})
