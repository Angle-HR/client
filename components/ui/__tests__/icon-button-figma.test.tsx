import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { IconButton, type IconButtonVariant } from '../button'
import { ICON_BUTTON_FIGMA, type IconStateSpec } from '../button/icon-button.figma'

import { expectedClasses, missingTokens, type States } from './figma-spec'

// Checks icon-button.tsx against the Figma spec in icon-button.figma.ts.

const toStates = (spec: Record<string, IconStateSpec | undefined>): States =>
  Object.fromEntries(
    Object.entries(spec).flatMap(([k, s]) =>
      s ? [[k, { bg: s.bg, border: s.border, fg: s.icon }]] : [],
    ),
  )

const icon = <svg data-testid="icon" />

describe('Icon Button matches Figma', () => {
  for (const [variant, spec] of Object.entries(ICON_BUTTON_FIGMA)) {
    it(`${variant}: every state uses Figma's tokens`, () => {
      render(<IconButton variant={variant as IconButtonVariant} icon={icon} aria-label="Search" />)
      const classes = screen.getByRole('button').className.split(/\s+/)
      for (const expected of expectedClasses(toStates(spec))) expect(classes).toContain(expected)
      // Figma has no focus variant for light and light-w-hover: no focus colours at all.
      if (!spec.focus)
        expect(
          classes.some(
            (c) => c.startsWith('focus-visible:bg-') || c.startsWith('focus-visible:border-'),
          ),
        ).toBe(false)
      expect(classes.some((c) => c.startsWith('focus-visible:shadow'))).toBe(false)
    })

    it(`${variant}: every token exists`, () => {
      expect(missingTokens(toStates(spec))).toEqual([])
    })
  }

  it('has no outline on top of the Figma focus style', () => {
    render(<IconButton icon={icon} aria-label="Search" />)
    const classes = screen.getByRole('button').className
    expect(classes).toContain('focus-visible:outline-none')
    expect(classes).not.toMatch(/focus-visible:outline-(2|offset)/)
  })

  it('matches the Figma sizes, padding and radius', () => {
    render(
      <>
        <IconButton size="xs" icon={icon} aria-label="xs" />
        <IconButton size="sm" icon={icon} aria-label="sm" />
        <IconButton size="md" icon={icon} aria-label="md" />
        <IconButton size="sm" variant="light-w-hover" icon={icon} aria-label="lwh" />
      </>,
    )
    const [xs, sm, md, lwh] = screen.getAllByRole('button')
    expect(xs).toHaveClass('h-[16px]', 'w-[16px]', 'p-[5px]', 'rounded-xs-4')
    expect(sm).toHaveClass('h-[24px]', 'w-[24px]', 'p-[5px]', 'rounded-sm-7')
    expect(md).toHaveClass('h-[32px]', 'w-[32px]', 'rounded-sm-7')
    // Figma oddity kept: light-w-hover at 24px is 6px round.
    expect(lwh).toHaveClass('rounded-[6px]')
    expect(lwh).not.toHaveClass('rounded-sm-7')
    expect(md).toHaveClass(
      'duration-100',
      'ease-figma-out',
      'hover:ease-figma-in',
      'active:duration-[50ms]',
      'active:ease-figma-out',
    )
  })

  it('draws the counter as Figma does', () => {
    render(<IconButton icon={icon} aria-label="Messages, 4 unread" showCounter counter={4} />)
    const badge = screen.getByText('4')
    expect(badge).toHaveClass(
      'h-[12px]',
      'min-w-[12px]',
      'px-[3px]',
      'rounded-full',
      'text-[9px]',
      'font-semibold',
      'bg-bg-btn-blue-pri-focus',
      'text-text-inverted',
    )
  })
})
