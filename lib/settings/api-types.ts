/** Company-level hiring switches, read from the OpenAPI document on 2026-10-20. */

/** `GET`/`PUT /hiring/settings`. Turning screening on needs the Legal permission. */
interface ApiHiringSettings {
  automated_screening_enabled?: boolean
  automated_screening_enabled_at?: string
}

/** `GET`/`PUT /hiring/applicant-settings`. Changing them needs `job.retention.set`. */
interface ApiApplicantSettings {
  send_status_emails?: boolean
  /** 0 (off) or 6: a rejected candidate cannot apply again for that many months. */
  reapply_block_months?: number
  /** False when the server has no key for it, so the block cannot be turned on. */
  reapply_block_available?: boolean
}

interface ApiApplicantSettingsBody {
  send_status_emails?: boolean
  reapply_block_months?: number
}

export type { ApiApplicantSettings, ApiApplicantSettingsBody, ApiHiringSettings }
