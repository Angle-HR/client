import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { Checkbox } from '../selection-controls/checkbox'
import { RadioButton } from '../selection-controls/radio-button'
import { Toggle } from '../selection-controls/toggle'

describe('Checkbox', () => {
  it('renders unchecked by default', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders checked state', () => {
    render(<Checkbox checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('renders indeterminate state with aria-checked=mixed', () => {
    render(<Checkbox checked="indeterminate" onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'mixed')
  })

  it('supports uncontrolled defaultChecked', () => {
    render(<Checkbox defaultChecked />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('supports all sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    sizes.forEach((size) => {
      const { unmount } = render(<Checkbox size={size} />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      unmount()
    })
  })

  it('renders label with textPosition=right', () => {
    render(<Checkbox label="Accept terms" textPosition="right" />)
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('renders label with textPosition=left', () => {
    render(<Checkbox label="Accept" textPosition="left" />)
    expect(screen.getByText('Accept')).toBeInTheDocument()
  })

  it('hides label with textPosition=none', () => {
    render(<Checkbox label="Hidden" textPosition="none" />)
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('disables checkbox', () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('calls onChange', () => {
    const handler = vi.fn()
    render(<Checkbox onChange={handler} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(handler).toHaveBeenCalled()
  })
})

describe('RadioButton', () => {
  it('renders unchecked by default', () => {
    render(<RadioButton name="test" onChange={() => {}} />)
    expect(screen.getByRole('radio')).not.toBeChecked()
  })

  it('renders checked state', () => {
    render(<RadioButton checked name="test" onChange={() => {}} />)
    expect(screen.getByRole('radio')).toBeChecked()
  })

  it('renders label', () => {
    render(<RadioButton label="Option A" name="test" onChange={() => {}} />)
    expect(screen.getByText('Option A')).toBeInTheDocument()
  })

  it('supports textPosition=left', () => {
    render(<RadioButton label="Left" textPosition="left" name="test" onChange={() => {}} />)
    expect(screen.getByText('Left')).toBeInTheDocument()
  })

  it('hides label with textPosition=none', () => {
    render(<RadioButton label="Hidden" textPosition="none" name="test" onChange={() => {}} />)
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument()
  })

  it('disables radio', () => {
    render(<RadioButton disabled name="test" onChange={() => {}} />)
    expect(screen.getByRole('radio')).toBeDisabled()
  })
})

describe('Toggle', () => {
  it('renders with role=switch', () => {
    render(<Toggle aria-label="Dark mode" />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('defaults to unchecked', () => {
    render(<Toggle aria-label="Test" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('reflects toggled state', () => {
    render(<Toggle toggled aria-label="Test" />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('supports sm/md sizes', () => {
    const { rerender } = render(<Toggle size="sm" aria-label="Test" />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
    rerender(<Toggle size="md" aria-label="Test" />)
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('calls onChange on click', () => {
    const handler = vi.fn()
    render(<Toggle toggled={false} onChange={handler} aria-label="Test" />)
    fireEvent.click(screen.getByRole('switch'))
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('disables toggle', () => {
    render(<Toggle disabled aria-label="Test" />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })
})
