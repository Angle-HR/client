import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { RichTextField } from '../rich-text-input/rich-text-field'

function Controlled({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <>
      <RichTextField
        aria-label="Description"
        placeholder="Write here"
        value={value}
        onChange={(next) => {
          setValue(next)
          onChange?.(next)
        }}
      />
      <button type="button" onClick={() => setValue('<p>Drafted</p>')}>
        Draft
      </button>
    </>
  )
}

describe('RichTextField, controlled', () => {
  it('does not rewrite what was typed when its value echoes back', () => {
    const onChange = vi.fn()
    render(<Controlled onChange={onChange} />)
    const editor = screen.getByRole('textbox', { name: 'Description' })

    // Typing, as the browser would leave it.
    editor.innerHTML = 'Hello'
    const typedNode = editor.firstChild
    fireEvent.input(editor)

    expect(onChange).toHaveBeenCalledWith('Hello')
    // Same text node: the caret the user is typing at has not been thrown away.
    expect(editor.firstChild).toBe(typedNode)
  })

  it('shows a value set from outside and hides the placeholder', () => {
    render(<Controlled />)
    expect(screen.getByText('Write here')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Draft' }))
    expect(screen.getByRole('textbox', { name: 'Description' }).innerHTML).toBe('<p>Drafted</p>')
    expect(screen.queryByText('Write here')).not.toBeInTheDocument()
  })

  it('offers the five formatting commands of the design', () => {
    render(<RichTextField aria-label="Description" />)
    expect(
      ['Bold', 'Italic', 'Underline', 'Bulleted list', 'Numbered list'].map((name) =>
        screen.getByRole('button', { name }),
      ),
    ).toHaveLength(5)
  })
})
