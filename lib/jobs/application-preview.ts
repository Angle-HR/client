import { draftFromView } from './draft-api'

import type { ApiJobView } from './api-types'

/**
 * What the application phone preview shows of the job. Figma: 9270:375985
 * (summary and Application tab) and 9270:378222 (Overview tab).
 */
interface PreviewJob {
  title: string
  companyName: string
  location: string
  workplace: string
  employmentType: string
  team: string
  /** The role description as HTML, shown on the Overview tab. */
  descriptionHtml: string
}

/**
 * The preview's job, read from the API job view with the same mapping the job
 * details form uses, so labels match what the hiring team entered.
 */
function previewJobFrom(view: ApiJobView, companyName: string): PreviewJob {
  // No lookups: the draft falls back to ids where a name is not in the view.
  const draft = draftFromView(view, {})
  return {
    title: draft.title,
    companyName,
    location: locationLabel(draft.hiringArea, draft.areas, draft.timezone),
    workplace: draft.workplace,
    employmentType: draft.employmentType,
    team: draft.team,
    descriptionHtml: draft.description,
  }
}

/** "Anywhere", the job's areas joined, or its timezone, as the hiring area says. */
function locationLabel(
  hiringArea: 'anywhere' | 'area' | 'timezone',
  areas: readonly string[],
  timezone: string,
): string {
  if (hiringArea === 'anywhere') return 'Anywhere'
  if (hiringArea === 'area') return areas.filter(Boolean).join(', ')
  return timezone
}

export { previewJobFrom }
export type { PreviewJob }
