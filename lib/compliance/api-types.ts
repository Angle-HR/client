/**
 * A job's compliance gates, screening rules, markets and share kit, read from
 * the OpenAPI document on 2026-10-20. The document types `value` as an array
 * of arrays; a rule's value is whatever its question's answer is compared to.
 */

/** One gate the job's markets, special categories or screening raise. */
interface ApiGate {
  id?: string
  requirement?: string
  detail?: string
  legal_basis?: string
  market_code?: string
  severity?: string
  /** Answered by the server from the job's own details: nobody confirms it. */
  auto?: boolean
  /** The platform's own gate, not the company's. */
  platform?: boolean
  confirmed?: boolean
  /** Confirmed against an older wording, so it no longer counts. */
  stale?: boolean
  version?: number
}

interface ApiRule {
  id?: string
  question_id?: string
  operator?: string
  value?: unknown
  /** Why a candidate is flagged; shown to the person who reviews it. */
  reason?: string
}

interface ApiRulesView {
  rules?: ApiRule[]
  automated_screening_enabled?: boolean
  dpia_scope_confirmed?: boolean
}

interface ApiRulesBody {
  rules: ApiRule[]
  dpia_scope_confirmed?: boolean
}

interface ApiMarketSelection {
  market_code?: string
  city?: string
  subdivision?: string
  timezone?: string
}

/** Body of `PUT /jobs/{id}/markets`. An anywhere job takes no places. */
interface ApiMarketsBody {
  location_mode: string
  markets: ApiMarketSelection[]
}

interface ApiShareLink {
  channel?: string
  label?: string
  url?: string
}

/** The job's public link and one link per channel, each carrying its channel as `src`. */
interface ApiShareKit {
  job_url?: string
  links?: ApiShareLink[]
}

export type {
  ApiGate,
  ApiMarketSelection,
  ApiMarketsBody,
  ApiRule,
  ApiRulesBody,
  ApiRulesView,
  ApiShareKit,
  ApiShareLink,
}
