# UI test report (client-ui branch)

Driven with the Orca browser against the Next dev server (port 3000, `/api/v1` proxied to the monolith API on
8080) and compared with the Figma file 7jCMwDng7HF5g7F3tGXf0E. Screenshots are in `docs/ui-shots/`
(`figma-*` are the Figma frames).

## Environment findings
- The web-bff (8081) rejects every unsafe request that carries `Origin: http://localhost:3000` on `POST /auth/signup`
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

## Not tested (stack went down) / remaining
- Login (password, OTP), forgot/reset password, TOTP, logout, 401 redirect, 429 display, job draft details/markets/form,
  publish-check blockers, KYB verification via admin API, public job page, candidate apply.
- Low: verify page puts the email in the URL query; the disabled "Resend in Ns" text is very low contrast in dark mode.
- Low: privacy policy / terms text still mention the waitlist (legal copy, owner to edit).
- Low: scripts/build-landing.mjs now builds only the legal pages (root copies /terms); the deploy-landing workflow
  needs a decision on what `/` should serve.

## Backend issues
- web-bff missing ALLOWED_ORIGINS (above).
- `verify-email` gives no remaining-attempts info and no lockout was seen after 6 wrong codes.
