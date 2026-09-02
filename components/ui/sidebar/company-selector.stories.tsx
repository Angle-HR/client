import { ArrowRightStartOnRectangle, Cog6Tooth, ComputerDesktop, Moon, Sun, User } from '../icons'

import { CompanySelector, type CompanySelectorMenuItem } from './company-selector'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const menuItems: CompanySelectorMenuItem[] = [
  { key: 'account', label: 'Account settings', icon: <User /> },
  { key: 'workspace', label: 'Workspace settings', icon: <Cog6Tooth /> },
  {
    key: 'theme',
    label: 'Light mode',
    icon: <Sun />,
    submenu: [
      { key: 'light', label: 'Light mode', icon: <Sun />, selected: true },
      { key: 'dark', label: 'Dark mode', icon: <Moon /> },
      { key: 'system', label: 'System theme', icon: <ComputerDesktop /> },
    ],
  },
  { key: 'sign-out', label: 'Sign out', icon: <ArrowRightStartOnRectangle /> },
]

const meta: Meta<typeof CompanySelector> = {
  title: 'UI/Sidebar/CompanySelector',
  component: CompanySelector,
  args: {
    currentCompany: { name: 'Revolut International' },
    menuItems,
  },
}

export default meta
type Story = StoryObj<typeof CompanySelector>

export const Closed: Story = {}

export const Open: Story = {
  args: { open: true },
}

export const WithCompanySwitching: Story = {
  args: {
    open: true,
    companies: [
      { id: '1', name: 'Revolut International' },
      { id: '2', name: 'Revolut Europe' },
      { id: '3', name: 'Revolut Americas' },
    ],
  },
}
