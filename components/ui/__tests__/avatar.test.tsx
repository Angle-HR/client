import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { Avatar, getInitials } from '../avatar/avatar'
import { AvatarIcon } from '../avatar/avatar-icon'
import { AvatarPair } from '../avatar/avatar-pair'
import { AvatarStack } from '../avatar/avatar-stack'
import { CountryFlag } from '../avatar/country-flag'
import { NotificationBadge } from '../avatar/notification-badge'

describe('getInitials', () => {
  it('returns single initial for single name', () => {
    expect(getInitials('Victoria')).toBe('V')
  })

  it('returns two initials for full name', () => {
    expect(getInitials('Victoria Adetunji')).toBe('VA')
  })

  it('handles multiple names', () => {
    expect(getInitials('Emeka Chukwu Obi')).toBe('EO')
  })

  it('handles empty string', () => {
    expect(getInitials('')).toBe('')
  })
})

describe('Avatar', () => {
  it('renders initials by default', () => {
    render(<Avatar text={getInitials('Victoria Adetunji')} />)
    expect(screen.getByText('VA')).toBeInTheDocument()
  })

  it('renders all 8 sizes', () => {
    const sizes = [12, 14, 16, 18, 20, 24, 32, 44] as const
    sizes.forEach((size) => {
      const { unmount } = render(<Avatar size={size} text="T" />)
      expect(screen.getByText('T')).toBeInTheDocument()
      unmount()
    })
  })

  it('renders all 10 colours', () => {
    const colours = [
      'green',
      'purple',
      'aqua',
      'orange',
      'yellow',
      'blue',
      'fuchsia',
      'red',
      'grey',
      'teal',
    ] as const
    colours.forEach((colour) => {
      const { unmount } = render(<Avatar colour={colour} text="T" />)
      expect(screen.getByText('T')).toBeInTheDocument()
      unmount()
    })
  })

  it('supports circular and square shapes', () => {
    const { rerender } = render(<Avatar circular text="T" />)
    expect(screen.getByText('T')).toBeInTheDocument()
    rerender(<Avatar circular={false} text="T" />)
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('shows notification badge', () => {
    const { container } = render(<Avatar text="T" showNotification />)
    expect(container.querySelector('.bg-bg-notification')).toBeInTheDocument()
  })

  it('shows notification count at size 44', () => {
    render(<Avatar size={44} text="T" showNotification notificationCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})

describe('AvatarIcon', () => {
  it('renders children', () => {
    render(
      <AvatarIcon>
        <span data-testid="icon">I</span>
      </AvatarIcon>,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('wraps in container when wrapped=true', () => {
    const { container } = render(
      <AvatarIcon wrapped>
        <span>I</span>
      </AvatarIcon>,
    )
    expect(container.querySelector('.bg-bg-transparent-light')).toBeInTheDocument()
  })

  it('supports all sizes', () => {
    const sizes = ['xs', 'sm', 'md', 'lg'] as const
    sizes.forEach((size) => {
      const { unmount } = render(
        <AvatarIcon size={size}>
          <span>I</span>
        </AvatarIcon>,
      )
      unmount()
    })
  })
})

describe('AvatarPair', () => {
  it('renders primary and secondary', () => {
    render(
      <AvatarPair
        primary={<span data-testid="primary">P</span>}
        secondary={<span data-testid="secondary">S</span>}
      />,
    )
    expect(screen.getByTestId('primary')).toBeInTheDocument()
    expect(screen.getByTestId('secondary')).toBeInTheDocument()
  })
})

describe('AvatarStack', () => {
  it('renders visible children up to maxVisible', () => {
    render(
      <AvatarStack maxVisible={2}>
        {[<span key="1">A</span>, <span key="2">B</span>, <span key="3">C</span>]}
      </AvatarStack>,
    )
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.queryByText('C')).not.toBeInTheDocument()
  })

  it('shows overflow count', () => {
    render(
      <AvatarStack maxVisible={2} showOverflow>
        {[
          <span key="1">A</span>,
          <span key="2">B</span>,
          <span key="3">C</span>,
          <span key="4">D</span>,
        ]}
      </AvatarStack>,
    )
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('hides overflow when showOverflow=false', () => {
    render(
      <AvatarStack maxVisible={2} showOverflow={false}>
        {[<span key="1">A</span>, <span key="2">B</span>, <span key="3">C</span>]}
      </AvatarStack>,
    )
    expect(screen.queryByText('+1')).not.toBeInTheDocument()
  })
})

describe('NotificationBadge', () => {
  it('renders at all sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const
    sizes.forEach((size) => {
      const { unmount, container } = render(<NotificationBadge size={size} />)
      expect(container.querySelector('.bg-bg-notification')).toBeInTheDocument()
      unmount()
    })
  })

  it('shows number only at xl size with showNumber', () => {
    render(<NotificationBadge size="xl" showNumber count={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('caps at 99+', () => {
    render(<NotificationBadge size="xl" showNumber count={150} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('does not show number at non-xl size', () => {
    render(<NotificationBadge size="lg" showNumber count={5} />)
    expect(screen.queryByText('5')).not.toBeInTheDocument()
  })
})

describe('CountryFlag', () => {
  it('renders the flag artwork for an ISO code with an accessible label', () => {
    const { container } = render(<CountryFlag code="NG" name="Nigeria" />)
    expect(screen.getByRole('img', { name: 'Nigeria flag' })).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', '/flags/ng.svg')
  })

  it('resolves the EU region and the non-ISO UK alias', () => {
    const { container: eu } = render(<CountryFlag code="EU" name="European Union" />)
    expect(eu.querySelector('img')).toHaveAttribute('src', '/flags/eu.svg')

    const { container: uk } = render(<CountryFlag code="UK" name="United Kingdom" />)
    expect(uk.querySelector('img')).toHaveAttribute('src', '/flags/gb.svg')
  })

  it('labels with the code when no name is given', () => {
    render(<CountryFlag code="DE" />)
    expect(screen.getByRole('img', { name: 'DE flag' })).toBeInTheDocument()
  })

  it('hides the flag from assistive tech when decorative', () => {
    render(<CountryFlag code="NG" name="Nigeria" decorative />)
    expect(screen.queryByRole('img', { name: 'Nigeria flag' })).not.toBeInTheDocument()
  })

  it('falls back to a neutral placeholder when the artwork fails to load', () => {
    const { container } = render(<CountryFlag code="ZZ" name="Unknown" />)
    fireEvent.error(container.querySelector('img')!)
    expect(container.querySelector('img')).toBeNull()
    expect(screen.getByRole('img', { name: 'Unknown flag' })).toBeInTheDocument()
  })
})
