import type { ApplicantAnswer } from './api'

type LinkKind = 'website' | 'linkedin' | 'github'

interface CandidateLink {
  kind: LinkKind
  url: string
}

interface CandidateContact {
  phone: string
  links: CandidateLink[]
  /** Set only when the form asked the question and the candidate answered yes or no. */
  authorizedToWork?: boolean
}

interface CurrentRole {
  role: string
  company: string
}

// A single word with a scheme, a www. prefix or a bare domain, e.g. "linkedin.com/in/ada".
const URL_PATTERN = /^(https?:\/\/\S+|www\.\S+|([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?)$/i
const LINK_TYPES = ['url', 'link', 'website']

/** The kind of link a URL is, by its host: LinkedIn and GitHub, anything else a website. */
function linkKind(url: string): LinkKind {
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`
  let host = ''
  try {
    host = new URL(withScheme).hostname.replace(/^www\./, '')
  } catch {
    return 'website'
  }
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'linkedin'
  if (host === 'github.com') return 'github'
  return 'website'
}

function isLinkAnswer(answer: ApplicantAnswer): boolean {
  return URL_PATTERN.test(answer.text.trim()) || LINK_TYPES.includes(answer.type)
}

/** The phone, links and work authorisation a candidate gave in their answers. */
function contactFromAnswers(answers: ApplicantAnswer[]): CandidateContact {
  const phone = answers.find((answer) => answer.type === 'phone_number')?.text.trim() ?? ''
  const links = answers
    .filter((answer) => answer.text.trim() && isLinkAnswer(answer))
    .map((answer) => ({ kind: linkKind(answer.text.trim()), url: answer.text.trim() }))
  const authorised = answers.find((answer) => /authori[sz]ed to work/i.test(answer.label))
  const answer = authorised?.text.trim().toLowerCase()
  return {
    phone,
    links,
    authorizedToWork: answer === 'yes' ? true : answer === 'no' ? false : undefined,
  }
}

/** The role and company from the answers to questions that ask for them. */
function currentRoleFromAnswers(answers: ApplicantAnswer[]): CurrentRole {
  const role = answers.find((answer) =>
    /^(current )?(job )?(role|title|position)\b/i.test(answer.label),
  )
  const company = answers.find((answer) => /^(current )?(company|employer)\b/i.test(answer.label))
  return { role: role?.text.trim() ?? '', company: company?.text.trim() ?? '' }
}

export { contactFromAnswers, currentRoleFromAnswers, linkKind }
export type { CandidateContact, CandidateLink, CurrentRole, LinkKind }
