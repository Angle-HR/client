// Shared by the sticky nav and footer CTA buttons — both point back at the
// same email field rather than submitting anything themselves.
function scrollToHeroForm() {
  const input = document.getElementById('hero-email')
  if (!input) return
  input.scrollIntoView({ behavior: 'smooth', block: 'center' })
  // preventScroll so focus() doesn't also jump the page on its own —
  // scrollIntoView already handles getting there smoothly.
  input.focus({ preventScroll: true })
}

export { scrollToHeroForm }
