import { fireEvent, render, screen } from '@testing-library/react'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { InputSelection } from '../input-selection/input-selection'

// jsdom has no ResizeObserver, which the list's scroll hints rely on.
beforeAll(() => {
  vi.stubGlobal('ResizeObserver', function ResizeObserver() {
    return { observe: () => {}, unobserve: () => {}, disconnect: () => {} }
  })
})

const options = [
  { value: 'cet', label: 'Berlin (Central European Time)', keywords: 'CET' },
  { value: 'gmt', label: 'Dublin (Greenwich Mean Time)', keywords: 'GMT' },
]

describe('InputSelection, searchable', () => {
  it('filters the options by label and by keyword', () => {
    render(<InputSelection label="Timezone" options={options} searchable />)
    const box = screen.getByRole('textbox', { name: 'Timezone' })

    fireEvent.change(box, { target: { value: 'dublin' } })
    expect(screen.getByText('Dublin (Greenwich Mean Time)')).toBeInTheDocument()
    expect(screen.queryByText('Berlin (Central European Time)')).not.toBeInTheDocument()

    fireEvent.change(box, { target: { value: 'CET' } })
    expect(screen.getByText('Berlin (Central European Time)')).toBeInTheDocument()
    expect(screen.queryByText('Dublin (Greenwich Mean Time)')).not.toBeInTheDocument()
  })

  it('picks the best match on Enter', () => {
    const onChange = vi.fn()
    render(<InputSelection label="Timezone" options={options} searchable onChange={onChange} />)
    const box = screen.getByRole('textbox', { name: 'Timezone' })

    fireEvent.change(box, { target: { value: 'gmt' } })
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith('gmt')
  })

  it('says so when nothing matches and custom values are off', () => {
    render(<InputSelection label="Timezone" options={options} searchable />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Timezone' }), {
      target: { value: 'mars' },
    })
    expect(screen.getByText('No matches')).toBeInTheDocument()
  })

  it('adds typed text as a value when custom values are allowed', () => {
    const onChange = vi.fn()
    render(
      <InputSelection
        label="Skills"
        options={[{ value: 'Figma', label: 'Figma' }]}
        multiple
        searchable
        allowCustom
        value={['Figma']}
        onChange={onChange}
      />,
    )
    const box = screen.getByRole('textbox', { name: 'Skills' })

    fireEvent.change(box, { target: { value: 'Rust' } })
    expect(screen.getByText('Add “Rust”')).toBeInTheDocument()
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(['Figma', 'Rust'])
  })
})

describe('InputSelection, footer action', () => {
  it('runs the action and closes the list', () => {
    const onClick = vi.fn()
    render(
      <InputSelection
        label="Team"
        options={[{ value: 'Design', label: 'Design' }]}
        footerAction={{ label: 'Create new team', onClick }}
      />,
    )
    fireEvent.click(screen.getByRole('combobox'))
    fireEvent.click(screen.getByText('Create new team'))
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('InputSelection, plain', () => {
  it('picks an option from the list and closes', () => {
    const onChange = vi.fn()
    render(
      <InputSelection
        label="Team"
        options={[
          { value: 'design', label: 'Design' },
          { value: 'sales', label: 'Sales' },
        ]}
        onChange={onChange}
      />,
    )
    const trigger = screen.getByRole('combobox')
    fireEvent.click(trigger)
    fireEvent.click(screen.getByText('Sales'))

    expect(onChange).toHaveBeenCalledWith('sales')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveTextContent('Sales')
  })
})
