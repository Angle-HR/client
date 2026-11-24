# UI test report (client-ui branch)

Driven with the Orca browser against the Next dev server (port 3000, `/api/v1` proxied to the monolith API on
8080) and compared with the Figma file 7jCMwDng7HF5g7F3tGXf0E. Screenshots are in `docs/ui-shots/`
(`figma-*` are the Figma frames).

## Environment findings
- (Resolved later: the web-bff now accepts localhost:3000; the second pass below ran against the BFF on 8081.)
- The web-bff (8081) rejected every unsafe request that carries `Origin: http://localhost:3000` on `POST /auth/signup`
  with 403 `origin not allowed`, although its `CORS_ALLOWED_ORIGINS` lists localhost:3000. Its env has no
  `ALLOWED_ORIGINS`, which the monolith has. The monolith (8080) accepts the same request, so the client was
  tested against 8080. (Backend/config issue.)
- Partway through, the openhr-local containers were stopped (docker restarted); the live flows after job creation
  could not be driven. See "Not tested".

## Driven and passing
- Signup: empty/invalid email message, weak password message (8+ chars, letters and numbers), valid signup -> /verify.
  Matches Figma 3530:4039 (dark theme follows OS).
- Verify email: 6 digit boxes, 30s resend countdown, "Expires in N Secs", reload keeps the session,
  wrong code shows an error under the boxes, edit email (PATCH) works, correct code -> /onboarding.
- Onboarding (business): profile validation messages, country/role comboboxes, manual address (validation then
  save), compliance step, setup screen -> dashboard. Dashboard renders with the sidebar and "Verification in progress".
- Jobs page and the "Create a new job" form (about the role) render.

## Fixes made (commits on split/client-ui)
1. Waitlist removed (pages, survey, API calls, redirects, landing components, tests). Legal pages keep a slim header.
2. Wrong OTP showed the server's "incorrect otp"; now "Incorrect code. Check the email and try again.", and a 429
   shows the wait (new `verificationCodeError`, unit tested), used by signup verify and login verify.
3. "Edit email" returned to an empty signup form; the email is now kept.
4. Hydration mismatch on the verify page (clock-based countdown rendered on the server).
5. Onboarding setup stalled at 100% in dev (Strict Mode dropped the completion result) and showed
   "An account with this email already exists" when reloaded after completion (409); both fixed.

## Second pass (stack back up, client on the BFF 8081)
Driven and passing: login with password (wrong password message), login with OTP (wrong code, then right code),
session survives reload, sign out, protected route redirects to /login, 401 after the session cookie is deleted
redirects to /login, forgot password -> mail link -> reset (weak/mismatch messages, "same as current" rejected,
success -> /login), 429 on login (shows the wait; screenshot `login-429.png`), KYB submit from the dashboard
(Kenya, manual review) and admin approval through the admin API, job creation (details with validation messages,
create team modal, application form, permissions, publish), publish check blockers before and after verification,
publish -> "Job published" modal, jobs list, public job page, anonymous apply, applications list in the dashboard.

Fixes in this pass:
- API messages are capitalised ("wrong email or password" -> "Wrong email or password").
- Long rate-limit waits read "15 min" instead of "869s".
- Job details never sent `lawful_basis`, so every job was blocked by `lawful_basis_missing` and nothing could be
  published from the UI. Now `contract` is sent (product decision needed: no control for it in the form or Figma).
- Publish blockers for the DPA and privacy contact now have a "Fix this" link to company settings (unverified links to
  /dashboard/verification).
- Removed the hard-coded Inbox "12" badge and Schedule dot (both pages do not exist).

## Third pass (gaps branch, own stack openhr-client-gaps, client on 127.0.0.1:3100)
Driven in the Orca browser against a fresh stack (company, KYB approval, published job created with the server's
`scripts/e2e-apply.sh`), then fixed:

- Public job page: Pay (API amounts are minor units, shown as "GBP 50,000 - 80,000 per year"), Seniority, Experience
  and Skills rows added under the design's four rows (the Figma frame 9346:561642 has none of them, so they follow the
  same row style). Seniority and experience come back from the API as labels; not set on the test job, covered by unit tests.
- Apply form: a missing required file question (CV) now says "Attach a file for ...". Not driven live (uploads answer 503
  locally); unit-level only.
- Team modal and sidebar: Organization / workspace name is the company name from `/hiring/me`, not the user's name.
- Nav: Inbox, Schedule and every other entry whose page does not exist (Candidates, Workflow, Interview, Onboarding,
  Employees, Documents, Compliance, Analytics, Help) are hidden unless `NEXT_PUBLIC_SHOW_UNBUILT_NAV=true` (build time).
  Only Jobs shows. Verified in the browser.
- Secrets out of URLs: `/verify` no longer carries the email (kept in sessionStorage; reload keeps working). The reset
  token is read once from the address bar and the URL is cleaned with history.replaceState straight away; the invite token
  too (and "Back" from /invite/join, which used to say the token was missing, now works). `Referrer-Policy: no-referrer` on
  /reset-password, /verify, /invite, /invite/join (checked with curl -I). Reset driven end to end: mail link -> new password -> login.
- TOTP (new page Account settings, `/dashboard/settings/account`, opened from the sidebar menu): enrol (QR drawn in the
  browser, setup key, otpauth link), wrong code message, confirm with code, then disable with password and code (wrong
  password gives "Incorrect password."; success ends every session, as the server does, and returns to /login). The login
  step (/login/2fa) was driven too: wrong code message, right code lands on the dashboard. `/auth/totp/disable` was added to the
  endpoints whose 401 does not end the session. Recovery codes are NOT shown: the server has no recovery-code endpoint.
- Invite: invited a teammate by API, opened the link, accepted at /invite/join (weak password hint, then success -> dashboard).
- Individual onboarding path driven: signup -> verify (no email in URL) -> Individual -> profile -> compliance -> dashboard
  ("Verification in progress"). The compliance step asks business questions (business type, industry, employee count) even for an individual.
- Published job: the details step and the application form step now show a notice and disable saving when the job is not a
  draft (the API answers 409 "only draft jobs can be changed here" for both).
- Pay amounts were sent as typed (39,000 became 390.00 on the server); now converted to and from minor units.
- Lawful basis: new "Data protection" section on the details step, a select (Contract, Legitimate interests, Consent,
  Legal obligation) defaulting to Contract with a one-line hint per option, sent on every save, validation message when
  missing or unknown. Legitimate interests adds a required "assessment reference" field (the server blocks publishing with
  `lia_reference_missing` otherwise; max 500 bytes). Live check against the server: all four values accepted on create
  (consent returns the `lawful_basis_consent` warning), an unknown value is refused with a field error, and publish-check
  still reports `lawful_basis_missing` / `lia_reference_missing` / no blocker for LI with a reference.
  LEGAL REVIEW NEEDED: the per-option hint wording (lib/jobs/draft.ts, LAWFUL_BASIS_OPTIONS) is neutral and minimal but is
  legal copy for the owner to approve. No read-only mode was needed: a published job's details are locked as a whole.

## Remaining gaps (client)
- Medium: "Anywhere" jobs cannot receive applications (backend, see below); the client has no country picker for them.
- Low: no recovery codes in the TOTP UI (no server support).
- Low: individual accounts have no organization on the server (`/hiring/me` is 404 "no organization for this account"),
  so the hiring screens cannot work for them; product decision needed.
- Low: the lawful basis, the DPA and the "applicant notice" gate are only reachable by leaving the job flow (the lawful
  basis itself is now in the job form; its publish blocker has no "Fix this" link yet).
- Low: wrong-code wording ("Check the email") is shared by email code screens; TOTP screens use their own line.
- Not driven live: the CV-required error (no scanner locally), team modal name (code change only).

## Backend issues
- web-bff missing ALLOWED_ORIGINS (above).
- Anywhere-mode jobs publish with an empty market list, and the public apply endpoint then refuses every
  `candidate_country` (GB, UK, US, PH, KE all "this role is not open to candidates in that country"), so no one can
  apply. Specific-area jobs with a market work.
- `verify-email` gives no remaining-attempts info and no lockout was seen after 6 wrong codes.

## Fourth pass (individual accounts hire, branch split/client-individual, own stack openhr-client-individual)
Backend: split/individual-hiring (stack built at e24c4e7; the later 0ac0b2f only adds the personal case's country, a
script and docs). Client dev server on 127.0.0.1:3100 against the web-bff (monolith behind it). Driven in the Orca
browser, start to finish, as one individual:

signup -> email code (mailhog) -> Individual -> profile -> compliance -> setup -> dashboard -> verification page ->
hiring settings (accept DPA, privacy contact) -> create team -> job details (specific area, lawful basis Contract) ->
application form -> permissions -> publish (blocked) -> admin approves the case -> publish -> public job page ->
apply as a candidate -> "Your application was received" -> the hirer's applicants list shows the candidate.

Changes and what was seen:
- Landing/legal (task A): `/` redirects to `/dashboard` (signed out then goes on to `/login`) through `next.config` redirects;
  `/privacy` redirects to `/privacy-policy`. `scripts/build-landing.mjs` and `deploy-landing.yml` now publish only the legal
  pages (`/terms`, `/privacy-policy`, `/privacy`) and make the bucket root a redirect document to `APP_URL`
  (default https://app.tryopenhr.com). Waitlist wording proposals: `docs/legal-copy-proposal.md` (not applied).
- Compliance step for an individual asks one question ("What field do you mostly hire in?"); business type and employee
  count are neither shown nor sent; the account type comes from the server's onboarding status, not the draft. Verified live.
- Verification page for an individual: "Your identity is being reviewed" (pending), verified, and, after a rejection, the
  reason and "Request a new review" (`POST /organization/verification {}`). Pending and verified were seen live; the
  rejected state is covered by unit tests only.
- Hiring settings (`/dashboard/settings/company`): titled "Hiring settings", says the person is the data controller, prefills the
  privacy contact with the account email (a legal statement, so only saved on pressing Save). Found live: the field stayed empty
  because the server returns an empty string, fixed (`||`). DPIA text says screening is not available for personal accounts.
- Dashboard welcome state now follows the organization's verification status like the sidebar does.
- Publish step heading says "Your account is still unverified" for individuals (was "Company account ...").
- Team modal organization name is the person's name ("Sam Solo"); sidebar and public page too. `/hiring/me` returns 200.
- Not driven: rejected review re-request, TOTP-protected admin, CV upload (no scanner locally; the CV question was removed from
  the form for the test), mobile widths.

Gaps and notes:
- Low: the public job page keeps wording "our recruitment team" in the privacy blurb; reads oddly for a person. Legal copy, not changed.
- Low: no navigation link to hiring settings or verification except the sidebar status button and the publish blocker links.

Backend observations:
- At e24c4e7 the admin queue item and case showed `country_code: "individual"` instead of the person's country (fixed in 0ac0b2f, not re-checked live).
- Verification emails are still branded "Angle HR".
- Share-link host in the publish dialog is the API origin (`/j/<id>`), not the careers page of the client app.
