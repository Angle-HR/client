import { describe, expect, it } from 'vitest'

import {
  GENERATE_STEPS,
  draftDescription,
  editSteps,
  improveDescription,
  lengthenDescription,
  mcpEndpoint,
  plainText,
  shortenDescription,
} from '../jobs/ai-description'

describe('draftDescription', () => {
  it('writes about the role and team it is given', () => {
    const html = draftDescription({ title: 'Product Designer', team: 'Design', context: '' })
    expect(plainText(html)).toContain('We are looking for a Product Designer in our Design team.')
    expect(html).toContain('<ul>')
  })

  it('carries the notes already in the editor into the draft, escaped', () => {
    const html = draftDescription({
      title: 'Engineer',
      team: '',
      context: '<p>Hybrid, two days in <b>London</b> & remote</p>',
    })
    expect(html).toContain('<p>Hybrid, two days in London &amp; remote</p>')
    expect(plainText(html)).not.toContain('in our')
  })

  it('escapes markup typed into the title', () => {
    expect(draftDescription({ title: '<script>', team: '', context: '' })).toContain(
      '&lt;script&gt;',
    )
  })
})

describe('edits', () => {
  const draft = draftDescription({ title: 'Engineer', team: 'Platform', context: '' })

  it('shortens to the opening and the first list', () => {
    const short = shortenDescription(draft)
    expect(short.length).toBeLessThan(draft.length)
    expect(short.startsWith('<p>We are looking for')).toBe(true)
    expect(short.match(/<ul>/g)).toHaveLength(1)
  })

  it('leaves an already short description alone', () => {
    expect(shortenDescription('<p>One line.</p>')).toBe('<p>One line.</p>')
  })

  it('lengthens by adding a section', () => {
    expect(plainText(lengthenDescription(draft))).toContain('Why join us')
  })

  it('adds an improvement once', () => {
    const once = improveDescription(draft, 'salary')
    expect(plainText(once)).toContain('Salary & benefits')
    expect(improveDescription(once, 'salary')).toBe(once)
  })
})

describe('progress steps', () => {
  it('reads first and polishes last, whatever is being done', () => {
    expect(GENERATE_STEPS).toHaveLength(4)
    expect(editSteps('Adding growth path')).toEqual([
      GENERATE_STEPS[0],
      'Adding growth path',
      GENERATE_STEPS[3],
    ])
  })
})

describe('mcpEndpoint', () => {
  it('builds the endpoint from the workspace name', () => {
    expect(mcpEndpoint('Revolut International')).toBe(
      'https://tryopenhr.com/mcp/revolut-international',
    )
    expect(mcpEndpoint('  ')).toBe('https://tryopenhr.com/mcp/workspace')
  })
})
