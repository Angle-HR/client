import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { BannerSmall } from '../banner/banner-small'

describe('BannerSmall', () => {
  it('renders message', () => {
    render(<BannerSmall>Changes saved.</BannerSmall>)
    expect(screen.getByText('Changes saved.')).toBeInTheDocument()
  })

  it('defaults to role=status', () => {
    const { container } = render(<BannerSmall>Msg</BannerSmall>)
    expect(container.querySelector('[role="status"]')).toBeInTheDocument()
  })

  it('uses role=alert for error state', () => {
    const { container } = render(<BannerSmall state="error">Error</BannerSmall>)
    expect(container.querySelector('[role="alert"]')).toBeInTheDocument()
  })

  it('uses aria-live=assertive for error', () => {
    const { container } = render(<BannerSmall state="error">Error</BannerSmall>)
    expect(container.querySelector('[aria-live="assertive"]')).toBeInTheDocument()
  })

  it('uses aria-live=polite for success', () => {
    const { container } = render(<BannerSmall state="success">OK</BannerSmall>)
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
  })

  it('supports all states', () => {
    const states = ['rest', 'success', 'error', 'info'] as const
    states.forEach((state) => {
      const { unmount } = render(<BannerSmall state={state}>Msg</BannerSmall>)
      expect(screen.getByText('Msg')).toBeInTheDocument()
      unmount()
    })
  })

  it('shows close button by default', () => {
    render(<BannerSmall>Msg</BannerSmall>)
    expect(screen.getByRole('button', { name: 'Dismiss notification' })).toBeInTheDocument()
  })

  it('hides close button when showCloseButton=false', () => {
    render(<BannerSmall showCloseButton={false}>Msg</BannerSmall>)
    expect(screen.queryByRole('button', { name: 'Dismiss notification' })).not.toBeInTheDocument()
  })

  it('fires onClose', () => {
    const handler = vi.fn()
    render(<BannerSmall onClose={handler}>Msg</BannerSmall>)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss notification' }))
    expect(handler).toHaveBeenCalledOnce()
  })

  it('shows outline by default', () => {
    const { container } = render(<BannerSmall>Msg</BannerSmall>)
    expect(container.querySelector('.border')).toBeInTheDocument()
  })

  it('hides outline when outline=false', () => {
    const { container } = render(<BannerSmall outline={false}>Msg</BannerSmall>)
    const banner = container.firstElementChild
    expect(banner?.className).not.toContain('border ')
  })

  it('has aria-atomic=true', () => {
    const { container } = render(<BannerSmall>Msg</BannerSmall>)
    expect(container.querySelector('[aria-atomic="true"]')).toBeInTheDocument()
  })
})
