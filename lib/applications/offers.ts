/**
 * An offer as the candidate sees it (`/public/offers/{token}`). The token in the
 * link is the only credential: a link that is unknown, ended or withdrawn
 * answers 404 whatever the reason.
 */

interface ApiPublicOffer {
  title?: string
  body?: string
  compensation?: string
  start_date?: string
  expires_at?: string
  status?: string
  can_respond?: boolean
  candidate_name?: string
  company?: string
  job_title?: string
  consent_text?: string
  has_document?: boolean
  signed_at?: string
  signed_name?: string
}

/** sent | viewed | signed | declined | expired | withdrawn */
type PublicOfferStatus = string

interface PublicOffer {
  title: string
  body: string
  compensation: string
  startDate: string
  expiresAt: string
  status: PublicOfferStatus
  /** The offer is open: it can be signed or declined. */
  canRespond: boolean
  candidateName: string
  company: string
  jobTitle: string
  /** The sentence the candidate agrees to by signing. It is stored with the signature. */
  consentText: string
  hasDocument: boolean
  signedAt: string
  signedName: string
}

function toPublicOffer(row: ApiPublicOffer): PublicOffer {
  return {
    title: row.title ?? '',
    body: row.body ?? '',
    compensation: row.compensation ?? '',
    startDate: row.start_date ?? '',
    expiresAt: row.expires_at ?? '',
    status: row.status ?? '',
    canRespond: row.can_respond ?? false,
    candidateName: row.candidate_name ?? '',
    company: row.company ?? '',
    jobTitle: row.job_title ?? '',
    consentText: row.consent_text ?? '',
    hasDocument: row.has_document ?? false,
    signedAt: row.signed_at ?? '',
    signedName: row.signed_name ?? '',
  }
}

export { toPublicOffer }
export type { ApiPublicOffer, PublicOffer, PublicOfferStatus }
