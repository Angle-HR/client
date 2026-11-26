import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { TOGGLE_FOCUS_RING } from '../selection-controls/focus'
import { Toggle, type ToggleSize } from '../selection-controls/toggle'
import {
  TOGGLE_FIGMA,
  TOGGLE_LAYOUT,
  TOGGLE_OFF_HOVER_STROKE,
} from '../selection-controls/toggle.figma'

import { missingTokens, type States } from './figma-spec'

// Checks toggle.tsx against the Figma spec in toggle.figma.ts.

function parts(props: Parameters<typeof Toggle>[0]) {
  const { container, unmount } = render(<Toggle aria-label="t" {...props} />)
  const track = container.querySelector('button')!
  const out = { track: track.className, thumb: (track.firstElementChild as HTMLElement).className }
  unmount()
  return out
}

const inset = (w: number, token: string) => `shadow-[inset_0_0_0_${w}px_var(--color-${token})]`
const sizes: ToggleSize[] = ['sm', 'md']

describe('Toggle matches Figma', () => {
  it('every token exists', () => {
    const missing = Object.values(TOGGLE_FIGMA).flatMap((byState) =>
      Object.values(byState).flatMap((spec) =>
        missingTokens({
          rest: { bg: spec.track, border: spec.stroke?.token ?? 'transparent', fg: spec.thumb },
        } satisfies States),
      ),
    )
    expect(missing).toEqual([])
    expect(
      missingTokens({
        rest: { bg: 'transparent', border: TOGGLE_OFF_HOVER_STROKE.md, fg: 'transparent' },
      }),
    ).toEqual([])
  })

  for (const size of sizes) {
    const L = TOGGLE_LAYOUT[size]
    it(`${size}: ${L.width}×${L.height}, ${L.thumb}px thumb sliding ${L.travel}px`, () => {
      const off = parts({ size, toggled: false })
      expect(off.track).toContain(`h-[${L.height}px] w-[${L.width}px]`)
      expect(off.track).toContain('p-[2px]')
      expect(off.thumb).toContain(`size-[${L.thumb}px]`)
      expect(off.thumb).toContain('translate-x-0')
      expect(parts({ size, toggled: true }).thumb).toContain(`translate-x-[${L.travel}px]`)
    })

    it(`${size}: colours per state`, () => {
      const f = TOGGLE_FIGMA
      const off = parts({ size, toggled: false })
      expect(off.track).toContain(`bg-${f.off.rest.track}`)
      expect(off.thumb).toContain(`bg-${f.off.rest.thumb}`)
      expect(off.track).toContain(`enabled:hover:${inset(0.5, TOGGLE_OFF_HOVER_STROKE[size])}`)
      expect(off.track).toContain(`focus-visible:${inset(0.5, TOGGLE_OFF_HOVER_STROKE[size])}`)

      const on = parts({ size, toggled: true })
      expect(on.track).toContain(`bg-${f.on.rest.track}`)
      expect(on.thumb).toContain(`bg-${f.on.rest.thumb}`)
      expect(on.track).toContain(`enabled:hover:${inset(0.5, f.on.hoverFocus.stroke!.token)}`)
      expect(on.track).toContain(`focus-visible:${inset(0.5, f.on.hoverFocus.stroke!.token)}`)

      const offDisabled = parts({ size, toggled: false, disabled: true })
      expect(offDisabled.track).toContain(`bg-${f.off.disabled.track}`)
      expect(offDisabled.track).toContain(inset(1, f.off.disabled.stroke!.token))
      expect(offDisabled.thumb).toContain(`bg-${f.off.disabled.thumb}`)
      expect(offDisabled.track).not.toContain('hover:')
      expect(offDisabled.track).not.toContain('opacity-')

      const onDisabled = parts({ size, toggled: true, disabled: true })
      expect(onDisabled.track).toContain('opacity-40')
      expect(onDisabled.track).not.toContain('hover:')
    })
  }

  it('has no ring or thumb shadow (Figma has none)', () => {
    const p = parts({ toggled: true })
    expect(p.track).not.toMatch(/ring-/)
    expect(p.thumb).not.toContain('shadow')
  })

  it('Figma Focus: hover stroke plus a 1px ring 2px outside', () => {
    for (const toggled of [false, true]) {
      const p = parts({ toggled })
      expect(p.track).toContain(TOGGLE_FOCUS_RING)
      expect(p.track).toContain('focus-visible:shadow-[inset_0_0_0_0.5px')
    }
  })

  it('uses Figma motion: 50ms ease out', () => {
    const p = parts({})
    expect(p.track).toContain('duration-[50ms] ease-figma-out')
    expect(p.thumb).toContain('duration-[50ms] ease-figma-out')
  })
})
