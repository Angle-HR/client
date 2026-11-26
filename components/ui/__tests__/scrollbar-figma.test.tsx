import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { render } from '@testing-library/react'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { ScrollContainer } from '../list/scrollbar'
import { SCROLLBAR_LAYOUT, SCROLLBAR_MOTION, SCROLLBAR_STATES } from '../list/scrollbar.figma'
import { Slots } from '../slots/slots'

const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/)

// jsdom has no layout: every element is 100px tall with 300px of content.
const original = {
  scrollHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight'),
  clientHeight: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight'),
}
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => 300,
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get: () => 100,
  })
})
afterAll(() => {
  for (const [key, desc] of Object.entries(original))
    if (desc) Object.defineProperty(HTMLElement.prototype, key, desc)
})

const parts = (container: HTMLElement) => {
  const track = container.querySelector('[data-scrollbar]')!
  return { track, thumb: track.firstElementChild! }
}

describe('Scrollbar matches Figma (3478:17263)', () => {
  it(`track: ${SCROLLBAR_LAYOUT.trackWidth}px on the right edge, full height`, () => {
    const { container } = render(<ScrollContainer>content</ScrollContainer>)
    const c = classes(parts(container).track)
    expect(c).toEqual(
      expect.arrayContaining([
        'absolute',
        'inset-y-0',
        'right-0',
        `w-[${SCROLLBAR_LAYOUT.trackWidth}px]`,
      ]),
    )
    expect(c).not.toContain('hidden')
  })

  it('rest: no track fill, a 2px round thumb in text/input/hover, 4px from the right', () => {
    const { container } = render(<ScrollContainer>content</ScrollContainer>)
    const { track, thumb } = parts(container)
    const r = SCROLLBAR_STATES.rest
    expect(classes(track).filter((x) => x.startsWith('bg-'))).toEqual([])
    expect(classes(thumb)).toEqual(
      expect.arrayContaining([
        `w-[${r.thumbWidth}px]`,
        `bg-${r.thumb}`,
        'rounded-full',
        `right-[${SCROLLBAR_LAYOUT.paddingRight}px]`,
      ]),
    )
  })

  it('thumb sits 6px from the top, sized by the content', () => {
    const { container } = render(<ScrollContainer>content</ScrollContainer>)
    const thumb = parts(container).thumb as HTMLElement
    expect(thumb.style.top).toBe(`${SCROLLBAR_LAYOUT.paddingY}px`)
    // 88px of track × 100 / 300 visible.
    expect(parseFloat(thumb.style.height)).toBeCloseTo(((100 - 12) * 100) / 300, 1)
  })

  it('hover and drag: track fills, thumb widens to 4px in text/light', () => {
    const { container } = render(<ScrollContainer>content</ScrollContainer>)
    const { track, thumb } = parts(container)
    const h = SCROLLBAR_STATES.hover
    expect(classes(track)).toEqual(
      expect.arrayContaining([`hover:bg-${h.track}`, `data-dragging:bg-${h.track}`]),
    )
    expect(classes(thumb)).toEqual(
      expect.arrayContaining([
        `group-hover/scrollbar:w-[${h.thumbWidth}px]`,
        `group-hover/scrollbar:bg-${h.thumb}`,
        `group-data-dragging/scrollbar:w-[${h.thumbWidth}px]`,
      ]),
    )
  })

  it(`motion: ${SCROLLBAR_MOTION.enter}ms in, ${SCROLLBAR_MOTION.leave}ms out, ease in both ways`, () => {
    const { container } = render(<ScrollContainer>content</ScrollContainer>)
    const { track, thumb } = parts(container)
    for (const el of [track, thumb]) {
      expect(classes(el)).toContain(`duration-[${SCROLLBAR_MOTION.leave}ms]`)
      expect(classes(el)).toContain(SCROLLBAR_MOTION.easing)
    }
    expect(classes(track)).toContain(`hover:duration-${SCROLLBAR_MOTION.enter}`)
    expect(classes(thumb)).toContain(`group-hover/scrollbar:duration-${SCROLLBAR_MOTION.enter}`)
  })

  it("hides the browser's own bar", () => {
    const { container } = render(<ScrollContainer>content</ScrollContainer>)
    expect(container.querySelector('.overflow-y-auto')!.className).toContain(
      '[scrollbar-width:none]',
    )
  })

  it('scrollable Slots use it', () => {
    const { container } = render(<Slots scrollable>content</Slots>)
    expect(container.querySelector('[data-scrollbar]')).not.toBeNull()
    expect(container.querySelector('.overflow-y-auto')!.className).toContain(
      '[scrollbar-width:none]',
    )
  })

  it('every token the spec names exists', () => {
    for (const state of Object.values(SCROLLBAR_STATES))
      for (const token of [state.track, state.thumb].filter(Boolean))
        expect(globals, token).toContain(`--color-${token}:`)
  })
})
