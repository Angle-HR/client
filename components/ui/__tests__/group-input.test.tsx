import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { GroupInput } from '../group-input/group-input'
import { GroupInputField } from '../group-input/group-input-field'
import { GroupInputLeftCurrency } from '../group-input/group-input-left-currency'
import { GroupInputLeftFlag } from '../group-input/group-input-left-flag'
import { GroupInputLeftText } from '../group-input/group-input-left-text'
import { GroupInputRightText } from '../group-input/group-input-right-text'

describe('GroupInput', () => {
  it('renders label', () => {
    render(
      <GroupInput label="Phone">
        <GroupInputField placeholder="Enter phone" />
      </GroupInput>,
    )
    expect(screen.getByText('Phone')).toBeInTheDocument()
  })

  it('hides label when showLabel=false', () => {
    render(
      <GroupInput label="Phone" showLabel={false}>
        <GroupInputField />
      </GroupInput>,
    )
    expect(screen.queryByText('Phone')).not.toBeInTheDocument()
  })

  it('shows error text', () => {
    render(
      <GroupInput label="Phone" errorText="Invalid phone">
        <GroupInputField />
      </GroupInput>,
    )
    expect(screen.getByText('Invalid phone')).toBeInTheDocument()
  })

  it('shows helper text', () => {
    render(
      <GroupInput label="Phone" showHelper helperText="Include country code">
        <GroupInputField />
      </GroupInput>,
    )
    expect(screen.getByText('Include country code')).toBeInTheDocument()
  })
})

describe('GroupInputField', () => {
  it('renders input', () => {
    render(<GroupInputField placeholder="test" aria-label="test" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('supports all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach((size) => {
      const { unmount } = render(<GroupInputField size={size} aria-label="test" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      unmount()
    })
  })

  it('supports all positions', () => {
    const positions = ['left', 'center', 'right'] as const
    positions.forEach((position) => {
      const { unmount } = render(<GroupInputField position={position} aria-label="test" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      unmount()
    })
  })

  it('disables input', () => {
    render(<GroupInputField disabled aria-label="test" />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})

describe('GroupInputLeftFlag', () => {
  it('renders as button', () => {
    render(<GroupInputLeftFlag countryCode="NG" />)
    expect(screen.getByRole('button', { name: 'Select country' })).toBeInTheDocument()
  })

  it('supports custom aria-label', () => {
    render(<GroupInputLeftFlag countryCode="NG" aria-label="Choose country" />)
    expect(screen.getByRole('button', { name: 'Choose country' })).toBeInTheDocument()
  })
})

describe('GroupInputLeftCurrency', () => {
  it('renders currency code', () => {
    render(<GroupInputLeftCurrency value="NGN" />)
    expect(screen.getByText('NGN')).toBeInTheDocument()
  })

  it('renders as button', () => {
    render(<GroupInputLeftCurrency value="USD" />)
    expect(screen.getByRole('button', { name: 'Select currency' })).toBeInTheDocument()
  })
})

describe('GroupInputLeftText', () => {
  it('renders text', () => {
    render(<GroupInputLeftText text="https://" />)
    expect(screen.getByText('https://')).toBeInTheDocument()
  })

  it('is aria-hidden', () => {
    const { container } = render(<GroupInputLeftText text="https://" />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })
})

describe('GroupInputRightText', () => {
  it('renders text', () => {
    render(<GroupInputRightText text=".com" />)
    expect(screen.getByText('.com')).toBeInTheDocument()
  })

  it('is aria-hidden', () => {
    const { container } = render(<GroupInputRightText text=".com" />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })
})
