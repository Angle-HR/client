'use client'

import { usePathname } from 'next/navigation'

import { DashboardIcon, NAV_GROUPS, NavIcon, TOP_LINKS } from '@/components/dashboard/nav-config'
import { Button, CompanySelector, Sidebar, SidebarGroupItem, SidebarItem } from '@/components/ui'
import { MaskIcon } from '@/components/ui/icons/mask-icon'

import type { VerificationState } from '@/components/dashboard/dashboard-states'

interface DashboardSidebarProps {
  workspaceName: string
  collapsed: boolean
  /** Swaps the CTA for the verification status button while KYB is running. */
  verification: VerificationState
  onToggleCollapsed: () => void
  onSignOut: () => void
}

/** 14px in the dropdown, against 13px in the nav. */
function MenuIcon({ name }: { name: string }) {
  return <DashboardIcon name={name} size={14} />
}

/**
 * The product's own navigation, wrapping the design-system Sidebar. Everything
 * here — the groups, their order, the icons — comes from the Figma sidebar
 * states; the collapsed rail is the same tree rendered icon-only.
 */
function DashboardSidebar({
  workspaceName,
  collapsed,
  verification,
  onToggleCollapsed,
  onSignOut,
}: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar
      collapsed={collapsed}
      companySelector={
        <CompanySelector
          currentCompany={{ name: workspaceName }}
          collapsed={collapsed}
          iconButtonLabel={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onIconButtonIcon={<MenuIcon name="sidebar-toggle" />}
          onIconButtonClick={onToggleCollapsed}
          menuItems={[
            { key: 'account', label: 'Account settings', icon: <MenuIcon name="menu-user" /> },
            {
              key: 'members',
              label: 'Invite and manage members',
              icon: <MenuIcon name="menu-plus" />,
            },
            {
              key: 'workspace',
              label: 'Workspace settings',
              icon: <MenuIcon name="menu-cog" />,
              dividerBefore: true,
            },
            {
              key: 'theme',
              // Figma labels the row "Light mode" even with System checked.
              label: 'Light mode',
              icon: <MenuIcon name="menu-sun" />,
              submenu: [
                { key: 'light', label: 'Light mode', icon: <MenuIcon name="menu-sun" /> },
                { key: 'dark', label: 'Dark mode', icon: <MenuIcon name="menu-moon" /> },
                {
                  key: 'system',
                  label: 'System theme',
                  icon: <MenuIcon name="menu-desktop" />,
                  selected: true,
                },
              ],
            },
            {
              key: 'signout',
              dividerBefore: true,
              label: 'Sign out',
              icon: <MenuIcon name="menu-sign-out" />,
              onClick: onSignOut,
            },
          ]}
        />
      }
      // While KYB is running the frame puts the verification status here in
      // place of the feedback button; both are the same secondary button. The
      // design drops it on the rail — there is no room for it at 52px.
      cta={
        collapsed ? undefined : verification === 'pending' ? (
          <Button
            variant="secondary"
            accent="default"
            size="sm"
            className="w-fit"
            iconPrefix={<MaskIcon src="/dashboard/icons/spinner-solid.svg" size={14} />}
          >
            Verification in progress
          </Button>
        ) : (
          <Button variant="secondary" accent="default" size="sm" className="w-fit">
            Send us feedback
          </Button>
        )
      }
      footer={
        <SidebarItem
          label="Help"
          href="/dashboard/help"
          icon={<NavIcon name="question-mark" />}
          collapsed={collapsed}
        />
      }
    >
      <div className="flex flex-col gap-[2px]">
        {TOP_LINKS.map((link) => (
          <SidebarItem
            key={link.key}
            label={link.label}
            href={link.href}
            icon={<NavIcon name={link.icon} />}
            notificationCount={link.notificationCount}
            unread={link.unread}
            active={pathname === link.href}
            collapsed={collapsed}
          />
        ))}
      </div>

      {NAV_GROUPS.map((group) => (
        <SidebarGroupItem
          key={group.key}
          title={group.title}
          collapsed={collapsed}
          items={group.items.map((item) => ({
            label: item.label,
            href: item.href,
            icon: <NavIcon name={item.icon} />,
            active: pathname === item.href,
            collapsed,
          }))}
        />
      ))}
    </Sidebar>
  )
}

export { DashboardSidebar }
