import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  FlowButton,
  type FlowButtonPosition,
  type FlowButtonSize,
  type FlowButtonVariant,
} from '../button/flow-button'
import {
  FLOW_BUTTON_FIGMA,
  FLOW_PRIMARY_FOCUS_SMALL,
  type FlowStateSpec,
  flowHoverInMs,
  flowShadowStates,
} from '../button/flow-button.figma'

import { expectedClasses, missingTokens, type States } from './figma-spec'

// Checks flow-button.tsx against the Figma spec in flow-button.figma.ts.

const toStates = (spec: Partial<Record<string, FlowStateSpec>>): States =>
  Object.fromEntries(
    Object.entries(spec).map(([k, s]) => [
      k,
      { bg: s!.bg, border: s!.border, fg: s!.text, opacity: s!.opacity },
    ]),
  )

const variants = Object.keys(FLOW_BUTTON_FIGMA) as FlowButtonVariant[]
const sizes: FlowButtonSize[] = ['xs', 'sm', 'md']
const prefix = {
  rest: '',
  hover: 'hover:',
  pressed: 'active:',
  focus: 'focus-visible:',
  disabled: 'disabled:',
} as const

function classesFor(
  variant: FlowButtonVariant,
  size: FlowButtonSize,
  position: FlowButtonPosition = 'left',
) {
  const { unmount } = render(
    <FlowButton variant={variant} size={size} position={position}>
      Next
    </FlowButton>,
  )
  const c = screen.getByRole('button').className.split(/\s+/)
  unmount()
  return c
}

describe('Flow Button matches Figma', () => {
  for (const variant of variants) {
    for (const size of sizes) {
      it(`${variant} ${size}: every state uses Figma's tokens`, () => {
        const spec = { ...FLOW_BUTTON_FIGMA[variant] }
        if (variant === 'primary' && size !== 'md') spec.focus = FLOW_PRIMARY_FOCUS_SMALL
        const c = classesFor(variant, size)
        for (const expected of expectedClasses(toStates(spec))) expect(c).toContain(expected)
      })
    }
    it(`${variant}: every token exists`, () => {
      expect(
        missingTokens(toStates({ ...FLOW_BUTTON_FIGMA[variant], extra: FLOW_PRIMARY_FOCUS_SMALL })),
      ).toEqual([])
    })
  }

  it('only disables primary with opacity (24%)', () => {
    expect(classesFor('primary', 'sm')).toContain('disabled:opacity-24')
    expect(classesFor('secondary', 'sm').some((x) => x.includes('opacity'))).toBe(false)
    expect(classesFor('tertiary', 'sm').some((x) => x.includes('opacity'))).toBe(false)
  })

  for (const position of ['left', 'right'] as FlowButtonPosition[]) {
    for (const variant of variants) {
      for (const size of sizes) {
        it(`shadow: ${variant} ${size} ${position}`, () => {
          const on = flowShadowStates(variant, size, position)
          const c = classesFor(variant, size, position)
          const has = (state: keyof typeof prefix) => {
            const own = c.find((x) => x.startsWith(`${prefix[state]}shadow-`))
            if (own) return own.endsWith('shadow-flow-btn')
            return state !== 'disabled' && c.includes('shadow-flow-btn')
          }
          for (const state of Object.keys(prefix) as (keyof typeof prefix)[]) {
            if (state === 'disabled') {
              if (c.includes('shadow-flow-btn')) expect(c).toContain('disabled:shadow-none')
              continue
            }
            expect([state, has(state)]).toEqual([state, on.includes(state)])
          }
        })
      }
    }
  }

  it('has no outline on top of the Figma focus style', () => {
    const c = classesFor('secondary', 'sm').join(' ')
    expect(c).toContain('focus-visible:outline-none')
    expect(c).not.toMatch(/focus-visible:outline-(2|offset)/)
  })

  it('uses Figma motion per variant and height', () => {
    for (const variant of variants) {
      for (const size of sizes) {
        const c = classesFor(variant, size)
        expect(c).toEqual(
          expect.arrayContaining([
            'duration-100',
            'ease-figma-out',
            'hover:ease-figma-in',
            'active:duration-[50ms]',
            'active:ease-figma-out',
          ]),
        )
        const ms = flowHoverInMs(variant, size)
        expect(c).toContain(ms === 50 ? 'hover:duration-[50ms]' : 'hover:duration-100')
      }
    }
  })

  it('matches Figma sizes, padding (minus the 1px border), gap and radius', () => {
    expect(classesFor('secondary', 'xs')).toEqual(
      expect.arrayContaining(['h-[25px]', 'px-[7px]', 'gap-[4px]', 'rounded-sm-7']),
    )
    expect(classesFor('secondary', 'sm')).toEqual(
      expect.arrayContaining(['h-[32px]', 'px-[9px]', 'gap-[8px]', 'rounded-lg-10']),
    )
    expect(classesFor('secondary', 'md')).toEqual(
      expect.arrayContaining(['h-[40px]', 'px-[11px]', 'gap-[8px]', 'rounded-lg-10']),
    )
    expect(classesFor('primary', 'sm')).toContain('rounded-sm-7')
    expect(classesFor('primary', 'sm', 'right')).toEqual(
      expect.arrayContaining(['rounded-lg-10', 'rounded-l-none']),
    )
    expect(classesFor('secondary', 'xs', 'right')).toEqual(
      expect.arrayContaining(['rounded-sm-7', 'rounded-l-none']),
    )
  })
})
