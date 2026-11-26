import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AvatarStack } from '../avatar/avatar-stack'
import { AVATAR_STACK_OVERLAP, type StackDensity } from '../avatar/avatar-stack.figma'
import { AVATAR_SIZES } from '../avatar/avatar.figma'

const faces = (n: number) => Array.from({ length: n }, (_, i) => <span key={i} data-face={i} />)

function slots(container: HTMLElement) {
  return [...(container.firstElementChild as HTMLElement).children] as HTMLElement[]
}

describe('AvatarStack matches Figma (709:48349)', () => {
  const densities: StackDensity[] = ['standard', 'tight']

  for (const density of densities) {
    for (const size of AVATAR_SIZES) {
      it(`${density} ${size}px overlaps by ${AVATAR_STACK_OVERLAP[density][size]}px`, () => {
        const { container } = render(
          <AvatarStack size={size} density={density} maxVisible={3}>
            {faces(5)}
          </AvatarStack>,
        )
        const [first, ...rest] = slots(container)
        const ml = `-ml-[${AVATAR_STACK_OVERLAP[density][size]}px]`
        expect(first!.className).not.toMatch(/-ml-/)
        for (const slot of rest) expect(slot.className.split(' ')).toContain(ml)
      })
    }
  }

  it('draws no ring or cut-out around the faces', () => {
    const { container } = render(<AvatarStack maxVisible={2}>{faces(4)}</AvatarStack>)
    for (const slot of slots(container)) expect(slot.className).not.toMatch(/ring|outline|border/)
  })

  it('the more tile is a circular blue Icon avatar at the stack size', () => {
    for (const size of AVATAR_SIZES) {
      const { container, unmount } = render(
        <AvatarStack size={size} maxVisible={2}>
          {faces(4)}
        </AvatarStack>,
      )
      const tile = container.querySelector('[data-avatar-stack-more]')!
      expect(tile.getAttribute('aria-label')).toBe('2 more')
      const avatar = tile.firstElementChild as HTMLElement
      expect(avatar.className).toContain(`size-[${size}px]`)
      expect(avatar.className).toContain('rounded-full')
      const fill = avatar.firstElementChild as HTMLElement
      expect(fill.className).toContain('bg-bg-avatar-blue')
      expect(fill.className).toContain('text-text-avatar-blue')
      unmount()
    }
  })

  it('with the more tile, later faces sit on top and the tile is topmost', () => {
    const { container } = render(<AvatarStack maxVisible={3}>{faces(5)}</AvatarStack>)
    const z = slots(container).map((s) => Number(s.style.zIndex))
    expect(z).toEqual([1, 2, 3, 4])
  })

  it('without the more tile, the first face is on top', () => {
    const { container } = render(<AvatarStack maxVisible={4}>{faces(4)}</AvatarStack>)
    const z = slots(container).map((s) => Number(s.style.zIndex))
    expect(z).toEqual([4, 3, 2, 1])
  })

  it('showOverflow={false} hides the tile and keeps the first face on top', () => {
    const { container } = render(
      <AvatarStack maxVisible={2} showOverflow={false}>
        {faces(4)}
      </AvatarStack>,
    )
    expect(container.querySelector('[data-avatar-stack-more]')).toBeNull()
    expect(slots(container).map((s) => Number(s.style.zIndex))).toEqual([2, 1])
  })
})
