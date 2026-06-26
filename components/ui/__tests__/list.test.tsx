import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import { ListItemButton } from '../list/list-item-button'
import { ListItemContent } from '../list/list-item-content'
import { ListItemDefault } from '../list/list-item-default'
import { ListItemLocation } from '../list/list-item-location'
import { ListItemMultiSelect } from '../list/list-item-multi-select'
import { ListItemSelected } from '../list/list-item-selected'
import { ListItemToggle } from '../list/list-item-toggle'
import { ListItemWithIcon } from '../list/list-item-with-icon'

describe('ListItemContent', () => {
  it('renders main text', () => {
    render(<ListItemContent mainText="Settings" />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders sub text with none alignment', () => {
    render(<ListItemContent mainText="Main" subText="Sub" subTextAlignment="none" />)
    expect(screen.getByText('Sub')).toBeInTheDocument()
  })

  it('renders sub text with left alignment and separators', () => {
    render(<ListItemContent mainText="Main" subText="A" subText2="B" subTextAlignment="left" />)
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.getByText('·')).toBeInTheDocument()
  })

  it('renders icon when withIcon=true', () => {
    render(<ListItemContent mainText="Main" withIcon icon={<span data-testid="icon">I</span>} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('wraps icon in container', () => {
    const { container } = render(
      <ListItemContent mainText="Main" withIcon iconContainer icon={<span>I</span>} />,
    )
    expect(container.querySelector('.bg-bg-transparent-light')).toBeInTheDocument()
  })
})

describe('ListItemDefault', () => {
  it('renders as option role', () => {
    render(<ListItemDefault mainText="Item" />)
    expect(screen.getByRole('option')).toBeInTheDocument()
  })

  it('fires onClick', () => {
    const handler = vi.fn()
    render(<ListItemDefault mainText="Item" onClick={handler} />)
    fireEvent.click(screen.getByRole('option'))
    expect(handler).toHaveBeenCalled()
  })

  it('sets aria-disabled when disabled', () => {
    render(<ListItemDefault mainText="Item" disabled />)
    expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not fire onClick when disabled', () => {
    const handler = vi.fn()
    render(<ListItemDefault mainText="Item" disabled onClick={handler} />)
    fireEvent.click(screen.getByRole('option'))
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('ListItemButton', () => {
  it('renders trailing button', () => {
    render(
      <ListItemButton
        mainText="Item"
        trailingButton={<button data-testid="trail">X</button>}
        alwaysShowButton
      />,
    )
    expect(screen.getByTestId('trail')).toBeInTheDocument()
  })

  it('renders two trailing buttons', () => {
    render(
      <ListItemButton
        mainText="Item"
        button="two"
        trailingButton={<button data-testid="btn1">A</button>}
        trailingButton2={<button data-testid="btn2">B</button>}
        alwaysShowButton
      />,
    )
    expect(screen.getByTestId('btn1')).toBeInTheDocument()
    expect(screen.getByTestId('btn2')).toBeInTheDocument()
  })
})

describe('ListItemLocation', () => {
  it('renders address', () => {
    render(<ListItemLocation address="123 Main St" />)
    expect(screen.getByText('123 Main St')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<ListItemLocation address="123 Main St" title="Address:" showTitle />)
    expect(screen.getByText('Address:')).toBeInTheDocument()
  })

  it('has radio role', () => {
    render(<ListItemLocation address="123 Main St" />)
    expect(screen.getByRole('radio')).toBeInTheDocument()
  })

  it('reflects selected state', () => {
    render(<ListItemLocation address="123 Main St" state="selected" />)
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'true')
  })

  it('reflects unselected state', () => {
    render(<ListItemLocation address="123 Main St" state="rest" />)
    expect(screen.getByRole('radio')).toHaveAttribute('aria-checked', 'false')
  })

  it('fires onClick', () => {
    const handler = vi.fn()
    render(<ListItemLocation address="123 Main St" onClick={handler} />)
    fireEvent.click(screen.getByRole('radio'))
    expect(handler).toHaveBeenCalled()
  })
})

describe('ListItemMultiSelect', () => {
  it('renders as option', () => {
    render(<ListItemMultiSelect mainText="Dept A" />)
    expect(screen.getByRole('option')).toBeInTheDocument()
  })

  it('shows selected state', () => {
    render(<ListItemMultiSelect mainText="Dept A" selected />)
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true')
  })

  it('calls onChange on click', () => {
    const handler = vi.fn()
    render(<ListItemMultiSelect mainText="Dept" selected={false} onChange={handler} />)
    fireEvent.click(screen.getByRole('option'))
    expect(handler).toHaveBeenCalledWith(true)
  })

  it('renders tag type', () => {
    render(<ListItemMultiSelect type="tag" tagLabel="Active" tagColor="green" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})

describe('ListItemSelected', () => {
  it('renders main text', () => {
    render(<ListItemSelected mainText="Engineering" />)
    expect(screen.getByText('Engineering')).toBeInTheDocument()
  })

  it('shows check icon when selected', () => {
    render(<ListItemSelected mainText="Eng" selected />)
    expect(screen.getByRole('option')).toHaveAttribute('aria-selected', 'true')
  })

  it('renders tag type', () => {
    render(<ListItemSelected type="tag" tagLabel="Active" tagColor="green" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })
})

describe('ListItemToggle', () => {
  it('renders with label and toggle', () => {
    render(<ListItemToggle mainText="Email notifications" />)
    expect(screen.getByText('Email notifications')).toBeInTheDocument()
    expect(screen.getByRole('switch')).toBeInTheDocument()
  })

  it('reflects checked state', () => {
    render(<ListItemToggle mainText="Test" checked />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
  })

  it('calls onChange', () => {
    const handler = vi.fn()
    render(<ListItemToggle mainText="Test" checked={false} onChange={handler} />)
    fireEvent.click(screen.getByRole('switch'))
    expect(handler).toHaveBeenCalledWith(true)
  })
})

describe('ListItemWithIcon', () => {
  it('renders main text and trailing icon', () => {
    render(
      <ListItemWithIcon
        mainText="View profile"
        trailingIcon={<span data-testid="trail">→</span>}
      />,
    )
    expect(screen.getByText('View profile')).toBeInTheDocument()
    expect(screen.getByTestId('trail')).toBeInTheDocument()
  })

  it('sets aria-disabled when disabled', () => {
    render(<ListItemWithIcon mainText="Export" disabled />)
    expect(screen.getByText('Export').closest('li')).toHaveAttribute('aria-disabled', 'true')
  })
})
