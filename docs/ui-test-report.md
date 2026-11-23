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

## Remaining gaps (client)
- Medium: "Anywhere" jobs cannot receive applications (backend, see below); the client has no country picker for them.
- Medium: the public job page shows only workplace, employment type and team; pay, skills, seniority and experience
  that the API returns are not shown.
- Low: the apply form marks a missing CV only with a red dashed border, no message; a required CV cannot be tested
  locally (no malware scanner, upload answers 503).
- Low: the team modal's "Organization" field shows the user's legal full name, not the company name (/auth/me has no
  company name).
- Low: editing the application form of a published job is offered but refused (409 "only draft jobs can be changed
  here", shown as a toast).
- Low: the lawful basis, the DPA and the "applicant notice" gate are only reachable by leaving the job flow.
- Low: reset-password token stays in the URL; the verify page keeps the email in the query.
- Low: the "Inbox" and "Schedule" nav entries link to pages that 404.
- Not driven: TOTP enrol/disable (no UI found under settings), invite flows, onboarding "Individual" path.

## Backend issues
- web-bff missing ALLOWED_ORIGINS (above).
- Anywhere-mode jobs publish with an empty market list, and the public apply endpoint then refuses every
  `candidate_country` (GB, UK, US, PH, KE all "this role is not open to candidates in that country"), so no one can
  apply. Specific-area jobs with a market work.
- `verify-email` gives no remaining-attempts info and no lockout was seen after 6 wrong codes.
