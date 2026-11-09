import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DashboardErrorState } from '../dashboard-states'

describe('DashboardErrorState', () => {
  it('offers a retry that calls onRetry', () => {
    const onRetry = vi.fn()
    render(<DashboardErrorState kind="unknown" onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('omits retry when none is given', () => {
    render(<DashboardErrorState kind="connection" />)
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
  })
})
