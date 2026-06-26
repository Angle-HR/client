import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { Chip } from '../tags/chip'
import { ChipRemoveButton } from '../tags/chip-remove-button'
import { Tag } from '../tags/tag'
import { TagRemoveButton } from '../tags/tag-remove-button'

describe('Tag', () => {
  it('renders label', () => {
    render(<Tag label="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('defaults to empty color', () => {
    const { container } = render(<Tag label="Test" />)
    expect(container.querySelector('.border-border-tags-empty')).toBeInTheDocument()
  })

  it('supports all 11 colors', () => {
    const colors = [
      'empty',
      'red',
      'green',
      'teal',
      'aqua',
      'blue',
      'purple',
      'grey',
      'yellow',
      'fuchsia',
      'orange',
    ] as const
    colors.forEach((color) => {
      const { unmount } = render(<Tag label="T" color={color} />)
      expect(screen.getByText('T')).toBeInTheDocument()
      unmount()
    })
  })

  it('shows remove button when removable', () => {
    render(<Tag label="Engineering" removable onRemove={() => {}} />)
    expect(screen.getByRole('button', { name: 'Remove Engineering' })).toBeInTheDocument()
  })

  it('hides remove button when not removable', () => {
    render(<Tag label="Engineering" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onRemove when remove button clicked', () => {
    const handler = vi.fn()
    render(<Tag label="Test" removable onRemove={handler} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Test' }))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('applies medium weight', () => {
    render(<Tag label="Bold" weight="medium" />)
    expect(screen.getByText('Bold').className).toContain('font-medium')
  })
})

describe('TagRemoveButton', () => {
  it('renders as button with aria-label', () => {
    render(<TagRemoveButton aria-label="Remove Test" />)
    expect(screen.getByRole('button', { name: 'Remove Test' })).toBeInTheDocument()
  })

  it('has type=button', () => {
    render(<TagRemoveButton aria-label="Remove Test" />)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('fires onClick', () => {
    const handler = vi.fn()
    render(<TagRemoveButton aria-label="Remove Test" onClick={handler} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalled()
  })
})

describe('Chip', () => {
  it('renders label', () => {
    render(<Chip label="Victoria" />)
    expect(screen.getByText('Victoria')).toBeInTheDocument()
  })

  it('supports all fill variants', () => {
    const fills = ['default', 'accent', 'transparent'] as const
    fills.forEach((fill) => {
      const { unmount } = render(<Chip label="T" fill={fill} />)
      expect(screen.getByText('T')).toBeInTheDocument()
      unmount()
    })
  })

  it('shows remove button on hover when removable', () => {
    render(<Chip label="Test" removable onRemove={() => {}} />)
    expect(screen.getByRole('button', { name: 'Remove Test' })).toBeInTheDocument()
  })

  it('applies bold text', () => {
    render(<Chip label="Bold" boldText />)
    expect(screen.getByText('Bold').className).toContain('font-medium')
  })

  it('renders icon when withIcon=true', () => {
    render(<Chip label="Test" withIcon icon={<span data-testid="icon">I</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('hides icon when withIcon=false', () => {
    render(<Chip label="Test" withIcon={false} icon={<span data-testid="icon">I</span>} />)
    expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
  })

  it('renders as button when onClick provided', () => {
    render(<Chip label="Click" onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders as span without onClick', () => {
    render(<Chip label="Static" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('sets aria-disabled when disabled', () => {
    const { container } = render(<Chip label="Disabled" disabled />)
    expect(container.querySelector('[aria-disabled="true"]')).toBeInTheDocument()
  })
})

describe('ChipRemoveButton', () => {
  it('renders as button', () => {
    render(<ChipRemoveButton aria-label="Remove Test" />)
    expect(screen.getByRole('button', { name: 'Remove Test' })).toBeInTheDocument()
  })

  it('supports empty and blue colors', () => {
    const { rerender } = render(<ChipRemoveButton color="empty" aria-label="Remove" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<ChipRemoveButton color="blue" aria-label="Remove" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('supports transparent/rest/hover states', () => {
    const states = ['transparent', 'rest', 'hover'] as const
    states.forEach((state) => {
      const { unmount } = render(<ChipRemoveButton state={state} aria-label="Remove" />)
      expect(screen.getByRole('button')).toBeInTheDocument()
      unmount()
    })
  })
})
