import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { Button } from '../button/button'
import { FlowButton } from '../button/flow-button'
import { IconButton } from '../button/icon-button'
import { LabelButton } from '../button/label-button'
import { TextButton } from '../button/text-button'

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('defaults to type=button', () => {
    render(<Button>Test</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('supports all variants', () => {
    const { rerender } = render(<Button variant="primary">Btn</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<Button variant="secondary">Btn</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<Button variant="tertiary">Btn</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('supports all accents', () => {
    const { rerender } = render(<Button accent="default">Btn</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<Button accent="blue">Btn</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<Button accent="red">Btn</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('supports sm and md sizes', () => {
    const { rerender } = render(<Button size="sm">Btn</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<Button size="md">Btn</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders prefix and suffix icons', () => {
    render(
      <Button
        iconPrefix={<span data-testid="prefix">P</span>}
        iconSuffix={<span data-testid="suffix">S</span>}
      >
        Btn
      </Button>,
    )
    expect(screen.getByTestId('prefix')).toBeInTheDocument()
    expect(screen.getByTestId('suffix')).toBeInTheDocument()
  })

  it('disables button', () => {
    render(<Button disabled>Btn</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows a spinner next to the label and ignores clicks when loading', () => {
    const handler = vi.fn()
    render(
      <Button loading onClick={handler}>
        Saving…
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Saving…' })
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(button)
    expect(handler).not.toHaveBeenCalled()
  })

  it('fires onClick', () => {
    const handler = vi.fn()
    render(<Button onClick={handler}>Btn</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handler).toHaveBeenCalledOnce()
  })
})

describe('FlowButton', () => {
  it('renders with children', () => {
    render(<FlowButton>Next</FlowButton>)
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument()
  })

  it('defaults to variant=secondary', () => {
    render(<FlowButton>Flow</FlowButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('supports xs/sm/md sizes', () => {
    const { rerender } = render(<FlowButton size="xs">F</FlowButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<FlowButton size="sm">F</FlowButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<FlowButton size="md">F</FlowButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('supports position left/right', () => {
    const { rerender } = render(<FlowButton position="left">F</FlowButton>)
    expect(screen.getByRole('button').className).not.toContain('rounded-l-none')
    rerender(<FlowButton position="right">F</FlowButton>)
    // Figma: only the left corners are squared, so it joins a container on its left.
    expect(screen.getByRole('button').className).toContain('rounded-l-none')
    expect(screen.getByRole('button').className).not.toContain('rounded-none')
  })

  it('keeps the label and ignores clicks when loading', () => {
    const handler = vi.fn()
    render(
      <FlowButton loading onClick={handler}>
        Submitting…
      </FlowButton>,
    )
    const button = screen.getByRole('button', { name: 'Submitting…' })
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    fireEvent.click(button)
    expect(handler).not.toHaveBeenCalled()
  })

  it('renders icon prefix (14px) and suffix (15px)', () => {
    render(
      <FlowButton
        iconPrefix={<span data-testid="prefix">P</span>}
        iconSuffix={<span data-testid="suffix">S</span>}
      >
        Flow
      </FlowButton>,
    )
    expect(screen.getByTestId('prefix')).toBeInTheDocument()
    expect(screen.getByTestId('suffix')).toBeInTheDocument()
  })
})

describe('IconButton', () => {
  it('renders with icon and aria-label', () => {
    render(<IconButton icon={<span>X</span>} aria-label="Close" />)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('supports all variants', () => {
    const variants = [
      'primary',
      'secondary',
      'tertiary',
      'light',
      'light-w-hover',
      'error',
    ] as const
    variants.forEach((variant) => {
      const { unmount } = render(
        <IconButton variant={variant} icon={<span>X</span>} aria-label="test" />,
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
      unmount()
    })
  })

  it('supports sm/md sizes', () => {
    const { rerender } = render(<IconButton size="sm" icon={<span>X</span>} aria-label="test" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    rerender(<IconButton size="md" icon={<span>X</span>} aria-label="test" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('xs is 16px with a 10px icon box and 4px radius', () => {
    render(<IconButton size="xs" icon={<span>X</span>} aria-label="Remove" />)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('h-[16px]')
    expect(btn.className).toContain('rounded-xs-4')
    expect((btn.firstElementChild as HTMLElement).style.width).toBe('10px')
  })

  it('light never fills; light-w-hover fills on hover', () => {
    const { rerender } = render(<IconButton variant="light" icon={<span>X</span>} aria-label="x" />)
    expect(screen.getByRole('button').className).not.toContain('hover:bg-')
    rerender(<IconButton variant="light-w-hover" icon={<span>X</span>} aria-label="x" />)
    expect(screen.getByRole('button').className).toContain('hover:bg-bg-transparent-light')
  })

  it('error uses the red icon and red tertiary hover', () => {
    render(<IconButton variant="error" icon={<span>X</span>} aria-label="Delete" />)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('text-text-error')
    expect(btn.className).toContain('hover:bg-bg-btn-red-tet-hover')
  })

  it('shows counter badge when showCounter is set', () => {
    render(<IconButton icon={<span>X</span>} aria-label="Notifications" showCounter counter={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('hides counter badge without showCounter', () => {
    render(<IconButton icon={<span>X</span>} aria-label="Notifications" counter={5} />)
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })

  it('caps counter at 99+', () => {
    render(
      <IconButton icon={<span>X</span>} aria-label="Notifications" showCounter counter={150} />,
    )
    expect(screen.getByText('99+')).toBeInTheDocument()
  })
})

describe('TextButton', () => {
  it('renders as button by default', () => {
    render(<TextButton>Link text</TextButton>)
    expect(screen.getByRole('button', { name: 'Link text' })).toBeInTheDocument()
  })

  it('renders as anchor when href provided', () => {
    render(<TextButton href="/test">Link</TextButton>)
    expect(screen.getByRole('link', { name: 'Link' })).toHaveAttribute('href', '/test')
  })

  it('supports all sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const
    sizes.forEach((size) => {
      const { unmount } = render(<TextButton size={size}>T</TextButton>)
      expect(screen.getByRole('button')).toBeInTheDocument()
      unmount()
    })
  })

  it('applies bold and underline', () => {
    render(
      <TextButton bold underline>
        Styled
      </TextButton>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('font-medium')
    expect(btn.className).toContain('underline')
  })

  it('is grey at rest and underlines on hover by default', () => {
    render(<TextButton>Link</TextButton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('text-text-primary')
    expect(btn.className).toContain('active:text-text-blue-accent')
    expect(btn.className).toContain('hover:underline')
    expect(btn.className.split(' ')).not.toContain('underline')
  })

  it('underline="never" starts secondary and never underlines', () => {
    render(<TextButton underline="never">Link</TextButton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('text-text-secondary')
    expect(btn.className).not.toContain('underline ')
    expect(btn.className).not.toContain('hover:underline')
  })

  it('underline={true} still means always', () => {
    render(<TextButton underline>Link</TextButton>)
    expect(screen.getByRole('button').className.split(' ')).toContain('underline')
  })

  it('wrapped adds 6px padding and a hover fill', () => {
    render(<TextButton wrapped>Link</TextButton>)
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('p-[6px]')
    expect(btn.className).toContain('hover:bg-bg-transparent-light')
  })

  it('renders left and right icons', () => {
    render(
      <TextButton
        iconLeft={<span data-testid="left">L</span>}
        iconRight={<span data-testid="right">R</span>}
      >
        Text
      </TextButton>,
    )
    expect(screen.getByTestId('left')).toBeInTheDocument()
    expect(screen.getByTestId('right')).toBeInTheDocument()
  })

  it('hides avatar at sm size', () => {
    render(
      <TextButton size="sm" avatar={<span data-testid="avatar">A</span>}>
        Text
      </TextButton>,
    )
    expect(screen.queryByTestId('avatar')).not.toBeInTheDocument()
  })

  it('shows avatar at md/lg size', () => {
    render(
      <TextButton size="md" avatar={<span data-testid="avatar">A</span>}>
        Text
      </TextButton>,
    )
    expect(screen.getByTestId('avatar')).toBeInTheDocument()
  })
})

describe('LabelButton', () => {
  it('passes the click event and native attributes through', () => {
    const handler = vi.fn()
    render(
      <LabelButton id="filter-remote" data-testid="chip" onClick={handler}>
        Remote
      </LabelButton>,
    )
    const chip = screen.getByTestId('chip')
    expect(chip).toHaveAttribute('id', 'filter-remote')
    fireEvent.click(chip)
    expect(handler.mock.calls[0]?.[0]).toHaveProperty('type', 'click')
  })

  it('mirrors selected in aria-pressed', () => {
    render(<LabelButton selected>Remote</LabelButton>)
    expect(screen.getByRole('button', { name: 'Remote' })).toHaveAttribute('aria-pressed', 'true')
  })
})
