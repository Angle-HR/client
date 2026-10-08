import { MaskIcon } from '@/components/ui/icons/mask-icon'

/**
 * Short names for library icons. Anything not listed resolves to
 * /dashboard/icons/<name>.svg directly.
 *
 * The files are the icon library's own vectors, exported from Figma as
 * `<icon>-<outline|solid>.svg` inside the library's 16px frame. Keeping that
 * frame matters: Figma sizes an icon by its frame, so a "13px" icon is a 16px
 * frame scaled to 13 and the glyph inside is smaller still. A tightly cropped
 * glyph at 13px would be visibly too big.
 */
const ICON_ASSETS: Record<string, string> = {
  inbox: 'inbox-outline',
  calendar: 'calendar-outline',
  briefcase: 'briefcase-outline',
  funnel: 'funnel-outline',
  'squares-plus': 'squares-plus-outline',
  'chat-bubble': 'chat-bubble-oval-left-ellipsis-outline',
  'plus-circle': 'plus-circle-outline',
  user: 'user-outline',
  document: 'document-outline',
  'shield-check': 'shield-check-outline',
  'presentation-chart': 'presentation-chart-bar-outline',
  'question-mark': 'question-mark-circle-solid',
  'menu-user': 'user-outline',
  'menu-plus': 'plus-solid',
  'menu-cog': 'cog-6-tooth-outline',
  'menu-sun': 'sun-solid',
  'menu-moon': 'moon-outline',
  'menu-desktop': 'computer-desktop-solid',
  'menu-sign-out': 'arrow-right-start-on-rectangle-outline',
  'sidebar-toggle': 'sidebar-outline',
  'exclamation-triangle': 'exclamation-triangle-solid',
}

/** One dashboard glyph at `size` px, tinted by the surrounding text colour. */
function DashboardIcon({ name, size }: { name: string; size: number }) {
  return <MaskIcon src={`/dashboard/icons/${ICON_ASSETS[name] ?? name}.svg`} size={size} />
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
