import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StepCompliance } from '../step-compliance'

const businessTypes = vi.fn()

vi.mock('@/lib/queries', () => ({
  useBusinessTypes: (enabled?: boolean) => {
    businessTypes(enabled)
    return { data: [{ id: 'bt1', name: 'Limited company' }], isLoading: false, isError: false }
  },
  useOnboardingIndustries: () => ({
    data: [{ id: 'ind1', name: 'Retail' }],
    isLoading: false,
    isError: false,
  }),
}))

describe('StepCompliance for an individual', () => {
  it('asks only for the field they hire in', () => {
    render(<StepCompliance accountType="individual" onContinue={vi.fn()} onBack={vi.fn()} />)
    expect(screen.getByText('What field do you mostly hire in?')).toBeInTheDocument()
    expect(screen.queryByText('What best describes your business?')).not.toBeInTheDocument()
    expect(screen.queryByText(/employees will use/)).not.toBeInTheDocument()
    expect(businessTypes).toHaveBeenLastCalledWith(false)
  })

  it('requires the industry and nothing else', async () => {
    const onContinue = vi.fn()
    render(<StepCompliance accountType="individual" onContinue={onContinue} onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(
      await screen.findByText('Please select the field you mostly hire in.'),
    ).toBeInTheDocument()
    expect(onContinue).not.toHaveBeenCalled()
  })
})

describe('StepCompliance for a business', () => {
  it('still asks the three business questions', async () => {
    const onContinue = vi.fn()
    render(<StepCompliance onContinue={onContinue} onBack={vi.fn()} />)
    expect(screen.getByText('What best describes your business?')).toBeInTheDocument()
    expect(screen.getByText(/employees will use/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() => expect(screen.getByText('Please select an option.')).toBeInTheDocument())
    expect(onContinue).not.toHaveBeenCalled()
  })
})
