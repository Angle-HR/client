import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LabelButton } from '../button/label-button'
import { LABEL_BUTTON_FIGMA } from '../button/label-button.figma'

import { missingTokens, type States } from './figma-spec'

// Checks label-button.tsx against the Figma spec in label-button.figma.ts.

const F = LABEL_BUTTON_FIGMA
const classes = (selected: boolean) => {
  const { unmount } = render(<LabelButton selected={selected}>Remote</LabelButton>)
  const c = screen.getByRole('button').className.split(/\s+/)
  unmount()
  return c
}

describe('Label Button matches Figma', () => {
  it('rest, hover, focus and disabled use Figma tokens', () => {
    const c = classes(false)
    expect(c).toEqual(
      expect.arrayContaining([
        `bg-${F.rest.bg}`,
        `border-${F.rest.border}`,
        `text-${F.rest.text}`,
        `hover:bg-${F.hover.bg}`,
        `hover:border-${F.hover.border}`,
        `focus-visible:bg-${F.focus.bg}`,
        `focus-visible:border-${F.focus.border}`,
        `disabled:bg-${F.disabled.bg}`,
        `disabled:border-${F.disabled.border}`,
        `disabled:text-${F.disabled.text}`,
      ]),
    )
  })

  it('selected uses Figma tokens and has no hover change', () => {
    const c = classes(true)
    expect(c).toEqual(
      expect.arrayContaining([`bg-${F.selected.bg}`, `border-${F.selected.border}`]),
    )
    expect(c.some((x) => x.startsWith('hover:bg-') || x.startsWith('hover:border-'))).toBe(false)
  })

  it('every token exists', () => {
    const states = Object.fromEntries(
      Object.entries(F).map(([k, s]) => [k, { bg: s.bg, border: s.border, fg: s.text }]),
    )
    expect(missingTokens(states as States)).toEqual([])
  })

  it('matches Figma layout', () => {
    expect(classes(false)).toEqual(
      expect.arrayContaining([
        'h-[24px]',
        'px-[7px]',
        'gap-[4px]',
        'rounded-sm-7',
        'border',
        'font-medium',
        'text-body-s',
      ]),
    )
  })

  it('uses Figma motion: hover 100ms ease in/out, select 50ms ease out', () => {
    expect(classes(false)).toEqual(
      expect.arrayContaining([
        'transition-colors',
        'duration-100',
        'ease-figma-out',
        'hover:ease-figma-in',
      ]),
    )
    expect(classes(true)).toEqual(expect.arrayContaining(['duration-[50ms]', 'ease-figma-out']))
  })

  it('has no outline on top of the Figma focus border', () => {
    expect(classes(false)).toContain('focus-visible:outline-none')
  })
})
