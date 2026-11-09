const SUPPORT_EMAIL = 'support@tryopenhr.com'

/**
 * Stopgap for "Send us feedback": opens the user's mail client with the error
 * or request id prefilled. A real in-app flow needs design and a backend.
 */
function buildFeedbackMailto(options: { requestId?: string; subject?: string } = {}): string {
  const subject = options.subject ?? 'Open HR feedback'
  const lines = ['', '', '---']
  if (options.requestId) lines.push(`Error/request id: ${options.requestId}`)
  lines.push(`Page: ${typeof window === 'undefined' ? '' : window.location.href}`)
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`
}

export { SUPPORT_EMAIL, buildFeedbackMailto }
