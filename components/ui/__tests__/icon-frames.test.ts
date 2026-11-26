import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

// The icon components in icons.tsx are cropped to their drawing (a viewBox of
// e.g. 11.33 × 6.33), but Figma's icons sit at 80% of a 16px frame. Giving one
// a square box (size-[14px]) stretches the drawing to fill it. Use MaskIcon
// with the /dashboard/icons file, which keeps the frame, or size the svg to
// Figma's glyph.
const icons = readFileSync(join(process.cwd(), 'components/ui/icons/icons.tsx'), 'utf8')
const CROPPED = [
  ...icons.matchAll(
    /function (\w+)\([^)]*\)[^{]*\{\s*return \(\s*<svg[^>]*viewBox="0 0 ([\d.]+) ([\d.]+)"/g,
  ),
]
  .filter(([, , w, h]) => !(w === h && Number.isInteger(Number(w))))
  .map(([, name]) => name!)

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) return f === 'node_modules' || f === '__tests__' ? [] : files(p)
    return /\.tsx$/.test(f) && !/\.stories\.tsx$/.test(f) ? [p] : []
  })
}

describe('cropped icon components are never stretched to a square box', () => {
  it('finds the cropped icons', () => {
    expect(CROPPED).toContain('ChevronDown')
  })

  const sources = ['app', 'components'].flatMap((d) => files(join(process.cwd(), d)))
  for (const name of ['ChevronDown', 'ChevronUp', 'ChevronRight', 'Check', 'Sidebar']) {
    it(`<${name}> is never given size-[…]`, () => {
      expect(CROPPED).toContain(name)
      const bad = sources.filter((p) =>
        new RegExp(`<${name}\\b[^>]*\\bsize-\\[`).test(readFileSync(p, 'utf8')),
      )
      expect(bad).toEqual([])
    })
  }

  it('no cropped icon is given a square size-[…] box', () => {
    const bad = sources.flatMap((p) => {
      const src = readFileSync(p, 'utf8')
      return CROPPED.filter((n) => new RegExp(`<${n}\\b[^>]*\\bsize-\\[`).test(src)).map(
        (n) => `${n} in ${p}`,
      )
    })
    expect(bad).toEqual([])
  })
})
