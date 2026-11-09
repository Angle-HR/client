import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StepIdentificationAddress } from '../step-identification-address'

import type { IdentificationField } from '@/lib/types'

const field = {
  key: 'registration_number',
  label: 'Registration Number',
  required: true,
  pattern: '^RC\\d{7}$',
  format_hint: 'RC followed by 7 digits',
  placeholder: 'RC1234567',
} as IdentificationField

function renderStep() {
  return render(
    <StepIdentificationAddress
      fields={[field]}
      onSearchAddress={vi.fn().mockResolvedValue([])}
      onResolveSuggestion={vi.fn().mockResolvedValue(null)}
      onVerifyAddress={vi.fn().mockResolvedValue({ status: 'verified' })}
      onContinue={vi.fn()}
      onBack={vi.fn()}
    />,
  )
}

describe('StepIdentificationAddress registration number errors', () => {
  it('shows the short copy when the value is empty', async () => {
    renderStep()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(await screen.findByText('Enter a valid registration number.')).toBeInTheDocument()
  })

  it('shows the short copy when the pattern does not match', async () => {
    renderStep()
    fireEvent.change(screen.getByLabelText('Registration Number'), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await waitFor(() =>
      expect(screen.getByText('Enter a valid registration number.')).toBeInTheDocument(),
    )
    expect(screen.queryByText(/RC followed by/)).not.toBeInTheDocument()
  })
})
