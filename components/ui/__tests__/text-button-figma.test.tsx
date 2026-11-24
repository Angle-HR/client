import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TextButton, type TextButtonSize, type TextButtonUnderline } from '../button/text-button'
import { TEXT_BUTTON_FIGMA, TEXT_BUTTON_LAYOUT } from '../button/text-button.figma'

import { missingTokens, type States } from './figma-spec'

// Checks text-button.tsx against the Figma spec in text-button.figma.ts.

const classesOf = (el: HTMLElement) => el.className.split(/\s+/)
const icon = <svg data-testid="left" />

describe('Text Button matches Figma', () => {
  for (const mode of ['never', 'hover', 'always'] as TextButtonUnderline[]) {
    it(`underline=${mode}: colours per state`, () => {
      render(<TextButton underline={mode}>Link</TextButton>)
      const c = classesOf(screen.getByRole('button'))
      expect(c).toContain(`text-${TEXT_BUTTON_FIGMA.rest[mode]}`)
      expect(c).toContain(`hover:text-${TEXT_BUTTON_FIGMA.hover}`)
      expect(c).toContain(`active:text-${TEXT_BUTTON_FIGMA.pressed}`)
      expect(c).toContain(`focus-visible:text-${TEXT_BUTTON_FIGMA.focus}`)
      expect(c).toContain(`disabled:text-${TEXT_BUTTON_FIGMA.disabled}`)
    })
  }

  it('every token exists', () => {
    const t = TEXT_BUTTON_FIGMA
    const all = [
      ...Object.values(t.rest),
      t.hover,
      t.pressed,
      t.focus,
      t.disabled,
      t.leftIconPressedFocusMdLg,
    ]
    const asStates = Object.fromEntries(
      all.map((fg, i) => [
        i === 0 ? 'rest' : `s${i}`,
        { bg: 'transparent', border: 'transparent', fg },
      ]),
    )
    expect(missingTokens(asStates as States)).toEqual([])
  })

  it('underlines on hover and press only, never on focus or when disabled', () => {
    render(<TextButton underline="hover">Link</TextButton>)
    const label = classesOf(screen.getByText('Link'))
    expect(label).toContain('group-[:hover:not(:disabled)]/text-button:underline')
    expect(label).toContain('group-[:active:not(:disabled)]/text-button:underline')
    expect(label.some((x) => x.includes('focus') && x.endsWith('underline'))).toBe(false)
    expect(label).toContain('underline-offset-[10%]')
  })

  it('has no ring or outline: Figma focus is the blue text', () => {
    render(<TextButton>Link</TextButton>)
    const c = screen.getByRole('button').className
    expect(c).toContain('focus-visible:outline-none')
    expect(c).not.toMatch(/focus-visible:(outline-(2|offset)|shadow|ring)/)
  })

  it('trims the label to cap height at every size', () => {
    for (const size of Object.keys(TEXT_BUTTON_LAYOUT) as TextButtonSize[]) {
      const { unmount } = render(<TextButton size={size}>Link</TextButton>)
      expect(screen.getByText('Link')).toHaveClass('leading-[0.727em]', 'whitespace-nowrap')
      expect(screen.getByRole('button')).toHaveClass('gap-[2px]')
      unmount()
    }
  })

  it('keeps the left icon grey on press and focus at md and lg only', () => {
    for (const size of Object.keys(TEXT_BUTTON_LAYOUT) as TextButtonSize[]) {
      const { unmount } = render(
        <TextButton size={size} iconLeft={icon}>
          Link
        </TextButton>,
      )
      const wrap = screen.getByTestId('left').parentElement!
      const px = TEXT_BUTTON_LAYOUT[size].leftIcon
      expect(wrap).toHaveClass(`h-[${px}px]`, `w-[${px}px]`)
      const kept = wrap.className.includes('group-active/text-button:text-text-primary')
      expect(kept).toBe(size === 'md' || size === 'lg')
      unmount()
    }
  })

  it('wrapped: 6px padding, faint 4px fill on hover only', () => {
    render(
      <TextButton wrapped underline="never">
        Link
      </TextButton>,
    )
    expect(screen.getByRole('button')).toHaveClass(
      'p-[6px]',
      'rounded-xs-4',
      'hover:bg-bg-transparent-light',
      'active:bg-transparent',
      'disabled:bg-transparent',
    )
  })

  it('uses Figma motion: 100ms, ease in on hover and press, ease out on leave', () => {
    render(<TextButton>Link</TextButton>)
    expect(screen.getByRole('button')).toHaveClass(
      'duration-100',
      'ease-figma-out',
      'hover:ease-figma-in',
      'active:ease-figma-in',
    )
  })
})
