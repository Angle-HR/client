'use client'

import Link from 'next/link'

import { IconButton } from '@/components/ui'

import { LinkedInIcon, XIcon } from './icons'

// Figma footer (Frame 60): centred social IconButtons (transparent, no counter)
// over a centred legal link row. Legal text: body-xs / weight 500 /
// text-secondary. Gap 14 between rows, gap 10 within the legal row.
const legalLinks = [
  { label: '©2026 OpenHR' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms & Conditions', href: '/terms' },
]

const socialLinks = [
  { label: 'Open HR on X', href: 'https://x.com/tryopenhr', icon: <XIcon /> },
  {
    label: 'Open HR on LinkedIn',
    href: 'https://www.linkedin.com/company/try-open-hr/',
    icon: <LinkedInIcon />,
  },
]

interface WaitlistFooterProps {
  /** The intro step already shows its own "By continuing… Terms & Conditions"
   * line above the submit button, so the footer's copy would be a second,
   * redundant one stacked right below it on mobile. Callers pass this only
   * where that's true — everywhere else relies on the footer as the sole
   * legal link. */
  hideTermsOnMobile?: boolean
}

function WaitlistFooter({ hideTermsOnMobile = false }: WaitlistFooterProps) {
  return (
    <footer className="flex flex-col items-center gap-14 py-5">
      <div className="flex items-center gap-8 text-text-secondary">
        {socialLinks.map((social) => (
          <IconButton
            key={social.label}
            variant="tertiary"
            size="md"
            iconSize={20}
            aria-label={social.label}
            icon={social.icon}
            onClick={() => window.open(social.href, '_blank', 'noopener,noreferrer')}
          />
        ))}
      </div>
      <nav className="flex items-center justify-center gap-10">
        {legalLinks.map((link) => {
          const className = `text-body-xs font-medium leading-19.2 text-text-secondary ${
            link.href ? 'underline' : 'no-underline'
          } ${link.label === 'Terms & Conditions' && hideTermsOnMobile ? 'hidden md:inline' : ''}`

          if (!link.href) {
            return (
              <span key={link.label} className={className}>
                {link.label}
              </span>
            )
          }

          return link.href.startsWith('/') ? (
            <Link key={link.label} href={link.href} className={className}>
              {link.label}
            </Link>
          ) : (
            <a key={link.label} href={link.href} className={className}>
              {link.label}
            </a>
          )
        })}
      </nav>
    </footer>
  )
}

export { WaitlistFooter }
