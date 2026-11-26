import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Textarea } from '../textarea/textarea'
import { TextareaField } from '../textarea/textarea-field'
import {
  TEXT_AREA_FIGMA,
  TEXTAREA_LAYOUT,
  TEXTAREA_MOTION,
  TEXTAREA_STATES,
  TEXTAREA_TOOLBAR,
} from '../textarea/textarea.figma'

const globals = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
const classes = (el: Element) => (el.getAttribute('class') ?? '').split(/\s+/)
const field = () => screen.getByRole('textbox').closest('[class*="group/textarea"]')!
const PLAIN = { showToolbar: false } as const

afterEach(() => vi.restoreAllMocks())

/** jsdom has no editing commands: record them and report `bold` as on once run. */
function stubEditing() {
  const ran: string[] = []
  Object.assign(document, {
    execCommand: vi.fn((command: string) => {
      ran.push(command)
      return true
    }),
    queryCommandState: vi.fn((command: string) => ran.includes(command)),
  })
  return ran
}

describe('TextareaField matches Figma (946:25327)', () => {
  it(`${TEXTAREA_LAYOUT.padding}px padding (− 1px border), ${TEXTAREA_LAYOUT.gap}px gap, radius ${TEXTAREA_LAYOUT.radius}, ${TEXTAREA_LAYOUT.minHeight}–${TEXTAREA_LAYOUT.maxHeight}px`, () => {
    render(<TextareaField aria-label="Notes" />)
    expect(classes(field())).toEqual(
      expect.arrayContaining([
        'border',
        `p-[${TEXTAREA_LAYOUT.padding - 1}px]`,
        `gap-[${TEXTAREA_LAYOUT.gap}px]`,
        `rounded-sm-${TEXTAREA_LAYOUT.radius}`,
        `min-h-[${TEXTAREA_LAYOUT.minHeight}px]`,
        `max-h-[${TEXTAREA_LAYOUT.maxHeight}px]`,
      ]),
    )
  })

  for (const [mode, props] of [
    ['rich editor', {}],
    ['plain text area', PLAIN],
  ] as const) {
    it(`${mode}: ${TEXTAREA_LAYOUT.text.style}, ${TEXTAREA_LAYOUT.text.lineHeight}px lines, Figma's Text box padding`, () => {
      render(<TextareaField aria-label="Notes" {...props} />)
      const c = classes(screen.getByRole('textbox'))
      expect(c).toContain(`md:${TEXTAREA_LAYOUT.text.utility}`)
      expect(c).toContain(`md:leading-[${TEXTAREA_LAYOUT.text.lineHeight}px]`)
      expect(c).toEqual(expect.arrayContaining(['-mt-[1px]', 'pb-[6.5px]', 'flex-1']))
    })
  }

  it('toolbar: five 20px buttons, 12px icons, rest and Hover/Selected colours, no fill', () => {
    render(<TextareaField aria-label="Notes" />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual(
      TEXTAREA_TOOLBAR.items.map((item) => item.label),
    )
    for (const [index, button] of buttons.entries()) {
      const c = classes(button)
      expect(c).toContain(`size-[${TEXTAREA_TOOLBAR.item.size}px]`)
      expect(c).toContain(`p-[${TEXTAREA_TOOLBAR.item.padding}px]`)
      expect(c).toContain(`text-${TEXTAREA_TOOLBAR.rest.icon}`)
      expect(c).toContain(`hover:text-${TEXTAREA_TOOLBAR.hoverSelected.icon}`)
      expect(c.filter((x) => x.startsWith('bg-') || x.startsWith('hover:bg-'))).toEqual([])
      expect(button.innerHTML).toContain(TEXTAREA_TOOLBAR.items[index]!.icon)
    }
  })

  it('with the toolbar, the field is a rich-text editor', () => {
    render(<TextareaField aria-label="Notes" defaultValue="<b>Hi</b>" />)
    const editor = screen.getByRole('textbox', { name: 'Notes' })
    expect(editor.tagName).toBe('DIV')
    expect(editor).toHaveAttribute('contenteditable', 'true')
    expect(editor).toHaveAttribute('aria-multiline', 'true')
    expect(editor.innerHTML).toBe('<b>Hi</b>')
  })

  it('each toolbar button runs its formatting command and shows it as selected', () => {
    const ran = stubEditing()
    const onValueChange = vi.fn()
    render(<TextareaField aria-label="Notes" onValueChange={onValueChange} />)
    const expected = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList']
    for (const item of TEXTAREA_TOOLBAR.items) {
      fireEvent.click(screen.getByRole('button', { name: item.label }))
    }
    expect(ran).toEqual(expected)
    const bold = screen.getByRole('button', { name: 'Bold' })
    expect(bold).toHaveAttribute('aria-pressed', 'true')
    expect(classes(bold)).toContain(`text-${TEXTAREA_TOOLBAR.hoverSelected.icon}`)
    expect(onValueChange).toHaveBeenCalled()
  })

  it('typing reports the HTML, and pasted text comes in plain', () => {
    const ran = stubEditing()
    const onValueChange = vi.fn()
    render(<TextareaField aria-label="Notes" onValueChange={onValueChange} />)
    const editor = screen.getByRole('textbox')
    editor.innerHTML = '<b>Yes</b>'
    fireEvent.input(editor)
    expect(onValueChange).toHaveBeenLastCalledWith('<b>Yes</b>')
    fireEvent.paste(editor, { clipboardData: { getData: () => 'plain' } })
    expect(ran).toEqual(['insertText'])
  })

  it('without the toolbar it is a plain text area that grows with its text', () => {
    render(<TextareaField aria-label="Notes" {...PLAIN} />)
    expect(screen.queryAllByRole('button')).toEqual([])
    const c = classes(screen.getByRole('textbox'))
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
    expect(c).toContain('[field-sizing:content]')
    expect(c).toContain('resize-none')
  })

  it('the corner handle drags the field taller (never under 80px); a double-click undoes it', () => {
    const { container } = render(<TextareaField aria-label="Notes" />)
    const handle = container.querySelector<HTMLElement>('[data-resize-handle]')!
    Object.assign(handle, {
      setPointerCapture: () => {},
      hasPointerCapture: () => true,
    })
    vi.spyOn(field(), 'getBoundingClientRect').mockReturnValue({ height: 81 } as DOMRect)
    fireEvent.pointerDown(handle, { clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(handle, { clientY: 250, pointerId: 1 })
    expect((field() as HTMLElement).style.height).toBe('231px')
    expect((field() as HTMLElement).style.maxHeight).toBe('none')
    fireEvent.pointerMove(handle, { clientY: 0, pointerId: 1 })
    expect((field() as HTMLElement).style.height).toBe(`${TEXTAREA_LAYOUT.minHeight}px`)
    fireEvent.doubleClick(handle)
    expect((field() as HTMLElement).style.height).toBe('')
  })

  it('a disabled field has no resize handle', () => {
    const { container } = render(<TextareaField aria-label="Notes" disabled />)
    expect(container.querySelector('[data-resize-handle]')).toBeNull()
  })

  it('empty: placeholder tokens; hover with ease in; focus turns it blue with ease out', () => {
    render(<TextareaField aria-label="Notes" placeholder="Write" {...PLAIN} />)
    const c = classes(field())
    const { placeholder, hover, focus } = TEXTAREA_STATES
    expect(c).toContain(`bg-${placeholder.bg}`)
    expect(c).toContain(`border-${placeholder.border}`)
    expect(c).toContain(`hover:border-${hover.border}`)
    expect(c).toContain(`hover:${TEXTAREA_MOTION.hoverIn}`)
    expect(c).toContain(`has-[:focus]:border-${focus.border}!`)
    expect(c).toContain(`duration-${TEXTAREA_MOTION.duration}`)
    expect(c).toContain(TEXTAREA_MOTION.out)
    expect(classes(screen.getByRole('textbox'))).toContain(`placeholder:text-${placeholder.text}`)
  })

  it('the rich editor draws the placeholder until there is text', () => {
    render(<TextareaField aria-label="Notes" placeholder="Write" />)
    const shown = screen.getByText('Write')
    expect(classes(shown)).toContain(`text-${TEXTAREA_STATES.placeholder.text}`)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-placeholder', 'Write')
  })

  it('filled: filled tokens and no hover, also once typed into', () => {
    render(<TextareaField aria-label="Notes" {...PLAIN} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Hi' } })
    const c = classes(field())
    expect(c).toContain(`bg-${TEXTAREA_STATES.filled.bg}`)
    expect(c).toContain(`border-${TEXTAREA_STATES.filled.border}`)
    expect(c.filter((x) => x.startsWith('hover:'))).toEqual([])
  })

  it('selected: the focus look with the 22% blue Text box fill', () => {
    render(<TextareaField aria-label="Notes" state="selected" defaultValue="Hi" />)
    expect(classes(field())).toContain(`border-${TEXTAREA_STATES.selected.border}`)
    const c = classes(screen.getByRole('textbox'))
    expect(c).toContain(`bg-${TEXTAREA_STATES.selected.textBox}`)
    expect(c).toContain(`selection:bg-${TEXTAREA_STATES.selected.textBox}`)
  })

  it('error and disabled: fixed tokens, 20% text, no opacity', () => {
    const { rerender } = render(<TextareaField aria-label="Notes" aria-invalid />)
    expect(classes(field())).toContain(`border-${TEXTAREA_STATES.error.border}`)
    rerender(<TextareaField aria-label="Notes" disabled />)
    const c = classes(field())
    expect(c).toContain(`bg-${TEXTAREA_STATES.disabled.bg}`)
    expect(c.filter((x) => x.startsWith('opacity'))).toEqual([])
    const editor = screen.getByRole('textbox')
    expect(classes(editor)).toContain(`text-${TEXTAREA_STATES.disabled.text}`)
    expect(editor).toHaveAttribute('contenteditable', 'false')
    const bold = screen.getByRole('button', { name: 'Bold' })
    expect(bold).toHaveAttribute('aria-disabled', 'true')
    expect(bold.tabIndex).toBe(-1)
  })

  it('with the toolbar, the action sits 10px from the top right, beside the toolbar', () => {
    render(<TextareaField aria-label="Notes" action={<button type="button">Go</button>} />)
    const slot = screen.getByRole('button', { name: 'Go' }).parentElement!
    expect(classes(slot)).toEqual(expect.arrayContaining(['absolute', 'top-[9px]', 'right-[9px]']))
  })

  it('without the toolbar, the action has its own row (10px in) and the text starts below it', () => {
    render(
      <TextareaField aria-label="Notes" {...PLAIN} action={<button type="button">Go</button>} />,
    )
    const slot = screen.getByRole('button', { name: 'Go' }).parentElement!
    expect(classes(slot)).toEqual(
      expect.arrayContaining(['flex', 'justify-end', '-mt-[2px]', '-mx-[2px]', '-mb-[8px]']),
    )
    expect(classes(slot)).not.toContain('absolute')
    expect(slot.compareDocumentPosition(screen.getByRole('textbox'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it("has Figma's scrollbar over its right edge, with the browser's hidden", () => {
    const { container } = render(<TextareaField aria-label="Notes" />)
    expect(container.querySelector('[data-scrollbar]')).not.toBeNull()
    expect(screen.getByRole('textbox').className).toContain('[scrollbar-width:none]')
  })

  it('draws no ring, outline or shadow on the field', () => {
    render(<TextareaField aria-label="Notes" />)
    expect(field().className).not.toMatch(/\b(ring|shadow|outline)-/)
  })

  it('every token the spec names exists', () => {
    for (const state of Object.values(TEXTAREA_STATES))
      for (const token of [state.bg, state.border, state.text, state.textBox].filter(Boolean))
        expect(globals, token).toContain(`--color-${token}:`)
    for (const token of [TEXTAREA_TOOLBAR.rest.icon, TEXTAREA_TOOLBAR.hoverSelected.icon])
      expect(globals, token).toContain(`--color-${token}:`)
  })
})

describe('Textarea matches Figma (1053:47776)', () => {
  it(`label, field and helper ${TEXT_AREA_FIGMA.gap}px apart; toolbar off`, () => {
    const { container } = render(<Textarea label="Notes" helperText="Keep it short" />)
    expect(classes(container.firstElementChild!)).toContain(`gap-[${TEXT_AREA_FIGMA.gap}px]`)
    expect(screen.getByRole('textbox', { name: 'Notes' }).tagName).toBe('TEXTAREA')
    expect(screen.queryByRole('group', { name: 'Formatting' })).toBeNull()
  })

  it('with the toolbar on, the rich editor is still named by the label', () => {
    render(<Textarea label="Notes" showToolbar />)
    expect(screen.getByRole('textbox', { name: 'Notes' }).tagName).toBe('DIV')
  })

  it('the helper is not inset, light grey, and red with an error', () => {
    const { rerender } = render(<Textarea label="Notes" helperText="Keep it short" />)
    const helper = screen.getByText('Keep it short').parentElement!
    expect(classes(helper)).not.toContain('pl-[3px]')
    expect(classes(helper)).toContain(`text-${TEXT_AREA_FIGMA.helper.neutral}`)
    rerender(<Textarea label="Notes" errorText="Too short" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Too short')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('textbox')).toHaveAccessibleDescription('Too short')
  })

  it('the action button is Tertiary, Blue, 24px', () => {
    render(<Textarea label="Notes" showActionButton actionButtonLabel="Generate" />)
    const button = screen.getByRole('button', { name: 'Generate' })
    expect(button.className).toContain('bg-bg-btn-blue-tet-rest')
    expect(classes(button)).toContain('h-[24px]')
  })
})
