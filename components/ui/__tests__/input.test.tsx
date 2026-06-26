import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { HelperText } from '../input/helper-text'
import { Input } from '../input/input'
import { TextInput } from '../input/text-input'

describe('Input', () => {
  it('renders input element', () => {
    render(<Input aria-label="Test" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('supports all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach((size) => {
      const { unmount } = render(<Input size={size} aria-label="Test" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      unmount()
    })
  })

  it('renders prefix icon', () => {
    render(
      <Input showPrefixIcon prefixIcon={<span data-testid="prefix">P</span>} aria-label="Test" />,
    )
    expect(screen.getByTestId('prefix')).toBeInTheDocument()
  })

  it('hides prefix icon when showPrefixIcon=false', () => {
    render(
      <Input
        showPrefixIcon={false}
        prefixIcon={<span data-testid="prefix">P</span>}
        aria-label="Test"
      />,
    )
    expect(screen.queryByTestId('prefix')).not.toBeInTheDocument()
  })

  it('renders suffix icon', () => {
    render(
      <Input suffix="icon" suffixIcon={<span data-testid="suffix">S</span>} aria-label="Test" />,
    )
    expect(screen.getByTestId('suffix')).toBeInTheDocument()
  })

  it('renders suffix button', () => {
    render(
      <Input
        suffix="button"
        suffixButton={<button data-testid="suffix-btn">Clear</button>}
        aria-label="Test"
      />,
    )
    expect(screen.getByTestId('suffix-btn')).toBeInTheDocument()
  })

  it('disables input', () => {
    render(<Input disabled aria-label="Test" />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('forwards placeholder', () => {
    render(<Input placeholder="Enter text" aria-label="Test" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('handles onChange', () => {
    const handler = vi.fn()
    render(<Input onChange={handler} aria-label="Test" />)
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'hello' },
    })
    expect(handler).toHaveBeenCalled()
  })
})

describe('TextInput', () => {
  it('renders with label', () => {
    render(<TextInput label="Email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('hides label when showLabel=false', () => {
    render(<TextInput label="Email" showLabel={false} />)
    expect(screen.queryByText('Email')).not.toBeInTheDocument()
  })

  it('shows helper text', () => {
    render(<TextInput label="Name" showHelper helperText="Enter your name" />)
    expect(screen.getByText('Enter your name')).toBeInTheDocument()
  })

  it('shows error text overriding helper', () => {
    render(
      <TextInput label="Email" showHelper helperText="Valid email" errorText="Invalid email" />,
    )
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    expect(screen.queryByText('Valid email')).not.toBeInTheDocument()
  })

  it('sets aria-invalid on error', () => {
    render(<TextInput label="Email" errorText="Bad" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('supports sm/md sizes', () => {
    const { rerender } = render(<TextInput size="sm" label="T" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    rerender(<TextInput size="md" label="T" />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})

describe('HelperText', () => {
  it('renders children', () => {
    render(<HelperText>Help message</HelperText>)
    expect(screen.getByText('Help message')).toBeInTheDocument()
  })

  it('supports all states', () => {
    const states = ['neutral', 'error', 'info'] as const
    states.forEach((state) => {
      const { unmount } = render(<HelperText state={state}>Msg</HelperText>)
      expect(screen.getByText('Msg')).toBeInTheDocument()
      unmount()
    })
  })

  // Per the Helper Text spec, the helper does NOT own the live region —
  // the parent composite sets aria-invalid and announces errors on blur.
  it('does not set role=alert for error state', () => {
    const { container } = render(<HelperText state="error">Error</HelperText>)
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument()
  })

  it('does not have role=alert for neutral', () => {
    const { container } = render(<HelperText state="neutral">Help</HelperText>)
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument()
  })
})
