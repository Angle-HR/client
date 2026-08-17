'use client'

import { usePathname, useRouter } from 'next/navigation'

const HERO_PATH = '/'
// sessionStorage rather than a query param/hash, so the flag never shows up
// in the URL — the hero page's own reload/back-button behavior is untouched.
const SCROLL_FLAG = 'oh-scroll-to-hero'

// Shared by the sticky nav and footer CTA buttons — both point back at the
// same email field rather than submitting anything themselves.
function scrollToHeroForm() {
  const input = document.getElementById('hero-email')
  if (!input) return false
  input.scrollIntoView({ behavior: 'smooth', block: 'center' })
  // preventScroll so focus() doesn't also jump the page on its own —
  // scrollIntoView already handles getting there smoothly.
  input.focus({ preventScroll: true })
  return true
}

// The footer CTA (and its "Get early access" button) also renders on pages
// that don't have the hero form at all — Privacy Policy, Terms & Conditions.
// scrollToHeroForm() finds nothing there and silently no-ops. This wraps it
// so the same button instead navigates back to the hero page first, which
// then finishes the scroll itself once mounted (see Hero's effect).
function useGoToHeroForm() {
  const router = useRouter()
  const pathname = usePathname()

  return () => {
    if (pathname === HERO_PATH && scrollToHeroForm()) return
    sessionStorage.setItem(SCROLL_FLAG, '1')
    router.push(HERO_PATH)
  }
}

export { scrollToHeroForm, useGoToHeroForm, SCROLL_FLAG }
