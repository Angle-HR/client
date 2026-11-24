import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Button } from '../button'
import { BUTTON_FIGMA, type StateSpec } from '../button/button.figma'

import type { ButtonAccent, ButtonVariant } from '../button'

// Checks button.tsx against the Figma spec in button.figma.ts, class by class.
// If Figma changes, update the spec first; this test then says what to change.

const tokens = readFileSync(join(process.cwd(), 'styles/design-system/tokens.css'), 'utf8')

function expectedClasses(spec: Record<string, StateSpec>): string[] {
  const { rest, hover, pressed, focus, disabled } = spec as Record<
    'rest' | 'hover' | 'pressed' | 'focus' | 'disabled',
    StateSpec
  >
  const out = [
    `bg-${rest.bg}`,
    `border-${rest.border}`,
    `text-${rest.text}`,
    `hover:bg-${hover.bg}`,
    `hover:border-${hover.border}`,
    `active:bg-${pressed.bg}`,
    `active:border-${pressed.border}`,
    `focus-visible:bg-${focus.bg}`,
    focus.border === 'transparent'
      ? 'focus-visible:border-transparent'
      : `focus-visible:border-${focus.border}`,
    `disabled:bg-${disabled.bg}`,
    `disabled:border-${disabled.border}`,
  ]
  if (focus.ring) out.push(`focus-visible:shadow-[0_0_0_1px_var(--${focus.ring})]`)
  if (disabled.text !== rest.text) out.push(`disabled:text-${disabled.text}`)
  if (disabled.opacity) out.push(`disabled:opacity-${Math.round(disabled.opacity * 100)}`)
  return out
}

describe('Button matches Figma', () => {
  for (const [key, spec] of Object.entries(BUTTON_FIGMA)) {
    const [accent, variant] = key.split('-') as [ButtonAccent, ButtonVariant]

    it(`${key}: every state uses Figma's tokens`, () => {
      render(
        <Button accent={accent} variant={variant}>
          Button
        </Button>,
      )
      const classes = screen.getByRole('button').className.split(/\s+/)
      for (const expected of expectedClasses(spec)) expect(classes).toContain(expected)
      // Nothing Figma doesn't have: no ring unless the spec has one, no other opacity.
      if (!spec.focus.ring)
        expect(classes.some((c) => c.startsWith('focus-visible:shadow'))).toBe(false)
      if (!spec.disabled.opacity)
        expect(classes.some((c) => c.startsWith('disabled:opacity'))).toBe(false)
    })

    it(`${key}: every token in the spec exists`, () => {
      for (const state of Object.values(spec)) {
        for (const name of [state.bg, state.border, state.text, state.ring]) {
          if (!name || name === 'transparent') continue
          expect(tokens, `--${name}`).toContain(`--${name}:`)
        }
      }
    })
  }

  it('has no focus outline on top of the Figma focus style', () => {
    render(<Button>Button</Button>)
    const classes = screen.getByRole('button').className
    expect(classes).toContain('focus-visible:outline-none')
    expect(classes).not.toMatch(/focus-visible:outline-(2|offset)/)
  })

  it('matches the Figma layout at both sizes', () => {
    render(
      <>
        <Button size="sm">Small</Button>
        <Button size="md">Medium</Button>
      </>,
    )
    const [sm, md] = screen.getAllByRole('button')
    for (const el of [sm, md]) {
      // 8px from the edge in Figma = 7px inside the 1px border.
      expect(el).toHaveClass(
        'px-[7px]',
        'gap-[4px]',
        'rounded-sm-7',
        'border',
        'text-body-s',
        'font-medium',
      )
    }
    // Prototype: hover in 100ms ease in, out 100ms ease out, press 50ms ease out.
    expect(md).toHaveClass(
      'duration-100',
      'ease-figma-out',
      'hover:ease-figma-in',
      'active:duration-[50ms]',
      'active:ease-figma-out',
    )
    expect(sm).toHaveClass('h-[24px]')
    expect(md).toHaveClass('h-[32px]')
  })
})
