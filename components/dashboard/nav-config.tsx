import { MaskIcon } from '@/components/dashboard/mask-icon'
import {
  ArrowRightStartOnRectangle,
  Briefcase,
  ChatBubbleOvalLeftEllipsis,
  Cog6Tooth,
  ComputerDesktop,
  ExclamationTriangle,
  Funnel,
  Inbox,
  Moon,
  Plus,
  PlusCircle,
  SidebarIcon,
  SquaresPlus,
  Sun,
  User,
} from '@/components/ui'

import type { ComponentType } from 'react'

/**
 * The dashboard's navigation, exactly as the Figma sidebar states define it.
 * Icons come from the design-system icon set (the same Figma library), so the
 * glyphs are the designer's own.
 */

/** Glyphs the design-system icon set already covers. */
const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  inbox: Inbox,
  briefcase: Briefcase,
  funnel: Funnel,
  'squares-plus': SquaresPlus,
  'chat-bubble': ChatBubbleOvalLeftEllipsis,
  'plus-circle': PlusCircle,
  user: User,
  'menu-user': User,
  'menu-plus': Plus,
  'menu-cog': Cog6Tooth,
  'menu-sun': Sun,
  'menu-moon': Moon,
  'menu-desktop': ComputerDesktop,
  'menu-sign-out': ArrowRightStartOnRectangle,
  'sidebar-toggle': SidebarIcon,
  'exclamation-triangle': ExclamationTriangle,
}

/**
 * Exported Figma vectors for glyphs the icon set doesn't have yet. Anything not
 * listed here falls back to /dashboard/icons, which still needs re-exporting.
 */
const ICON_ASSETS: Record<string, string> = {
  'question-mark': '/auth/preview/question-mark.svg',
}

/** One dashboard glyph at `size` px, tinted by the surrounding text colour. */
function DashboardIcon({ name, size }: { name: string; size: number }) {
  const Icon = ICONS[name]
  if (!Icon) {
    return <MaskIcon src={ICON_ASSETS[name] ?? `/dashboard/icons/${name}.svg`} size={size} />
  }
  return (
    <span aria-hidden="true" className="inline-flex shrink-0" style={{ width: size, height: size }}>
      <Icon className="size-full" />
    </span>
  )
}

/** Figma renders every nav glyph at 13px, tinted by the item's text colour. */
function NavIcon({ name }: { name: string }) {
  return <DashboardIcon name={name} size={13} />
}

interface NavLink {
  key: string
  label: string
  href: string
  icon: string
  /** Unread badge; collapses to a dot on the rail. */
  notificationCount?: number
  /** Unread with no count — a bare red dot. */
  unread?: boolean
}

interface NavGroup {
  key: string
  title: string
  items: NavLink[]
}

/** Sits above the groups, with no title of its own. */
const TOP_LINKS: NavLink[] = [
  { key: 'inbox', label: 'Inbox', href: '/dashboard/inbox', icon: 'inbox', notificationCount: 12 },
  {
    key: 'schedule',
    label: 'Schedule',
    href: '/dashboard/schedule',
    icon: 'calendar',
    unread: true,
  },
]

const NAV_GROUPS: NavGroup[] = [
  {
    key: 'hiring',
    title: 'Hiring',
    items: [
      { key: 'jobs', label: 'Jobs', href: '/dashboard/jobs', icon: 'briefcase' },
      { key: 'candidates', label: 'Candidates', href: '/dashboard/candidates', icon: 'funnel' },
      { key: 'workflow', label: 'Workflow', href: '/dashboard/workflow', icon: 'squares-plus' },
      { key: 'interview', label: 'Interview', href: '/dashboard/interview', icon: 'chat-bubble' },
      {
        key: 'onboarding',
        label: 'Onboarding',
        href: '/dashboard/onboarding',
        icon: 'plus-circle',
      },
    ],
  },
  {
    key: 'team',
    title: 'Team',
    items: [
      { key: 'employees', label: 'Employees', href: '/dashboard/employees', icon: 'user' },
      { key: 'documents', label: 'Documents', href: '/dashboard/documents', icon: 'document' },
      {
        key: 'compliance',
        label: 'Compliance',
        href: '/dashboard/compliance',
        icon: 'shield-check',
      },
      {
        key: 'analytics',
        label: 'Analytics',
        href: '/dashboard/analytics',
        icon: 'presentation-chart',
      },
    ],
  },
]

export { DashboardIcon, NavIcon, NAV_GROUPS, TOP_LINKS }
export type { NavGroup, NavLink }
