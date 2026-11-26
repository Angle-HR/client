import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar } from '../avatar/avatar'
import {
  AVATAR_COLOURS,
  AVATAR_COUNTRY,
  AVATAR_FIGMA,
  AVATAR_ICON,
  AVATAR_IMAGE_RADIUS,
  AVATAR_NOTIFICATION,
  AVATAR_RADIUS,
  AVATAR_SIZES,
  AVATAR_TEXT,
  type AvatarSize,
} from '../avatar/avatar.figma'

import { missingTokens } from './figma-spec'

// Checks avatar.tsx against the Figma spec in avatar.figma.ts.

function root(props: Parameters<typeof Avatar>[0]) {
  const { container, unmount } = render(<Avatar {...props} />)
  const el = container.firstElementChild as HTMLElement
  return { el, unmount }
}

const radiusClass = (r: number) => (r === 0 ? 'rounded-none' : `rounded-[${r}px]`)
const inset = (token: string) => `shadow-[inset_0_0_0_0.5px_var(--color-${token})]`

describe('Avatar matches Figma', () => {
  it('every token exists', () => {
    const names = [
      ...AVATAR_COLOURS.flatMap((c) => [AVATAR_FIGMA.bg(c), AVATAR_FIGMA.fg(c)]),
      AVATAR_FIGMA.stroke.token,
      AVATAR_FIGMA.imageStroke.token,
    ]
    for (const n of names) {
      expect(missingTokens({ rest: { bg: n, border: 'transparent', fg: 'transparent' } })).toEqual(
        [],
      )
    }
  })

  for (const size of AVATAR_SIZES) {
    it(`${size}px initials: ${AVATAR_TEXT[size].fontSize}px Medium, cap-trimmed, 0.5px stroke`, () => {
      const { el, unmount } = root({ size, text: 'L' })
      expect(el.className).toContain(`size-[${size}px]`)
      expect(el.className).toContain('rounded-full')
      const fill = el.firstElementChild as HTMLElement
      const letters = fill.firstElementChild as HTMLElement
      expect(fill.className).toContain(inset(AVATAR_FIGMA.stroke.token))
      expect(letters.className).toContain(AVATAR_TEXT[size].utility)
      expect(letters.className).toContain('text-trim-cap')
      expect(letters.className).toContain('font-medium')
      unmount()
    })

    it(`${size}px square: ${AVATAR_RADIUS[size]}px corners`, () => {
      const { el, unmount } = root({ size, text: 'L', circular: false })
      expect(el.className).toContain(radiusClass(AVATAR_RADIUS[size]))
      unmount()
    })

    it(`${size}px icon: coloured, ${AVATAR_ICON[size]}px glyph`, () => {
      const { el, unmount } = root({ size, type: 'icon', colour: 'purple' })
      const fill = el.firstElementChild as HTMLElement
      expect(fill.className).toContain(`bg-${AVATAR_FIGMA.bg('purple')}`)
      expect(fill.className).toContain(`text-${AVATAR_FIGMA.fg('purple')}`)
      expect(fill.className).toContain(inset(AVATAR_FIGMA.stroke.token))
      const glyph = fill.firstElementChild as HTMLElement
      expect(glyph.style.width).toBe(`${AVATAR_ICON[size]}px`)
      unmount()
    })

    it(`${size}px square image corners, with and without border`, () => {
      const r = AVATAR_IMAGE_RADIUS[size]
      const a = root({ size, type: 'image-border', src: '/x.png', circular: false })
      expect(a.el.querySelector('img')!.className).toContain(radiusClass(r.border))
      expect(a.el.querySelector('span')!.className).toContain(inset(AVATAR_FIGMA.imageStroke.token))
      a.unmount()
      const b = root({ size, type: 'image', src: '/x.png', circular: false })
      expect(b.el.querySelector('img')!.className).toContain(radiusClass(r.borderless))
      expect(b.el.querySelector('span')).toBeNull()
      b.unmount()
    })

    it(`${size}px notification: ${AVATAR_NOTIFICATION[size].px}px dot at the top-left`, () => {
      const { el, unmount } = root({ size, text: 'L', showNotification: true })
      const wrap = el.lastElementChild as HTMLElement
      expect(wrap.className).toContain('-top-[1px] -left-[1px]')
      const dot = wrap.firstElementChild as HTMLElement
      const px = AVATAR_NOTIFICATION[size].px
      expect(dot.className).toMatch(new RegExp(`h-\\[${px}px\\]|min-h-\\[${px}px\\]`))
      unmount()
    })
  }

  for (const colour of AVATAR_COLOURS) {
    it(`${colour}: bg and text tokens`, () => {
      const { el, unmount } = root({ size: 24, text: 'L', colour })
      const fill = el.firstElementChild as HTMLElement
      expect(fill.className).toContain(`bg-${AVATAR_FIGMA.bg(colour)}`)
      expect(fill.className).toContain(`text-${AVATAR_FIGMA.fg(colour)}`)
      unmount()
    })
  }

  for (const [s, c] of Object.entries(AVATAR_COUNTRY)) {
    const size = Number(s) as AvatarSize
    it(`${size}px country: square is a ${c!.width}×${size} flag, ${c!.radius}px corners`, () => {
      const sq = root({ size, type: 'country', countryCode: 'GB', circular: false })
      expect(sq.el.className).toContain(`w-[${c!.width}px] h-[${size}px] rounded-[${c!.radius}px]`)
      expect(sq.el.lastElementChild!.className).toContain(inset(AVATAR_FIGMA.countryStroke.token))
      sq.unmount()
      const round = root({ size, type: 'country', countryCode: 'GB' })
      expect(round.el.className).toContain(`size-[${size}px] rounded-full`)
      const flag = round.el.querySelector('[role="img"]') as HTMLElement
      expect(flag.style.width).toBe(`${c!.width}px`)
      round.unmount()
    })
  }
})
