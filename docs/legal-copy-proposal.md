# Legal copy proposal: waitlist wording

**DRAFT for legal review: not applied.** The waitlist has been removed from the product (no signup form, no survey, no API calls). The privacy policy and terms still describe it. Nothing in `components/open-hr/legal/` has been edited. Each item quotes the current text (file and line), then proposes neutral replacement text.

Open questions for legal first:

1. Existing waitlist records: are any still held? If yes, the retention sentences (90 days / 3 years, IP kept 30 days) must stay until those records are deleted. If none remain, the deletion can be recorded and the sentences removed. The proposals below assume none remain.
2. "Early access" wording (terms sections 1, 3, 6, 11 and 14, outside the waitlist scope) is untouched here. Decide whether the product is still early access. Proposals below keep it where it appears next to the waitlist.
3. The terms point to `tryopenhr.com/privacy`. The static site now serves the policy at both `/privacy` and `/privacy-policy`.

## Privacy policy (`privacy-policy-content.tsx`)

### P1. Controller list (line 70)

Old:
> Personal data you provide when joining our waitlist (email address, consent record)

New (DRAFT for legal review: not applied): delete the bullet. The next bullet (account creation) already covers email and consent records.

### P2. Section 4.1 heading and body (lines 146 and 150)

Old heading:
> 4.1 Joining the waitlist

Old body:
> When you join our waitlist, we ask for your name, email address, and country. We use this to manage the list and send you an invite when we launch. We collect this simply because you've asked us to, it's necessary to provide the waitlist service you're requesting. There's no separate marketing consent checkbox on the waitlist form; by submitting the form, you're agreeing to our Terms & Conditions, as shown at the point of sign-up. We also briefly collect your IP address to prevent spam and bot abuse, which we delete after 30 days. If you don't create an account within 90 days of getting your launch invite, we delete your waitlist details entirely. If you do create an account, we keep this record for 3 years.

New heading (DRAFT for legal review: not applied):
> 4.1 Before you create an account

New body (DRAFT for legal review: not applied):
> You can read our Terms and this Privacy Policy without giving us any personal data. When you visit the site we may collect your IP address and basic request information for security and to prevent spam and bot abuse, and we delete it after 30 days. By creating an account you agree to our Terms and this Privacy Policy, as shown at sign-up. There is no separate marketing consent checkbox at sign-up.

(If waitlist records still exist, keep a transitional paragraph: "If you joined our earlier waitlist, we keep your details only until [date], then delete them, unless you have created an account." Subsection numbers 4.2 onward are unchanged.)

### P3. Lawful basis summary (line 183)

Old:
> In practice: joining the waitlist and creating an account happen because you've asked us to, so our basis is contract.

New (DRAFT for legal review: not applied):
> In practice: creating an account happens because you've asked us to, so our basis is contract.

### P4. Processors and email (line 202)

Old:
> We also use a transactional email provider to send account, verification, and waitlist emails, ...

New (DRAFT for legal review: not applied):
> We also use a transactional email provider to send account and verification emails, ...

### P5. Retention (line 259)

Old:
> Waitlist details are deleted after 90 days if you don't go on to create an account, or kept for 3 years if you do.

New (DRAFT for legal review: not applied): delete the sentence. Start the paragraph at "Account information is kept for as long as you have an account, plus 30 days, ...". If records still exist (open question 1), replace with: "Any details from our earlier waitlist are deleted by [date]."

## Terms (`terms-content.tsx`)

### T1. Section 1 description (line 23)

Old:
> The platform is currently in early access, waitlist and onboarding only. Subscription tiers, pricing, and self-hosting options will be published at tryopenhr.com when available.

New (DRAFT for legal review: not applied):
> The platform is currently in early access. Subscription tiers, pricing, and self-hosting options will be published at tryopenhr.com when available.

### T2. Definition of "Platform" (line 61)

Old:
> ... currently available to waitlist and early-access users.

New (DRAFT for legal review: not applied):
> ... currently available to early-access users.

### T3. Acceptance (line 158)

Old:
> By joining the waitlist, registering for an account, completing email OTP verification, or using the Service, the User agrees to be bound by these Terms and the Privacy Policy at tryopenhr.com/privacy.

New (DRAFT for legal review: not applied):
> By registering for an account, completing email OTP verification, or using the Service, the User agrees to be bound by these Terms and the Privacy Policy at tryopenhr.com/privacy.

### T4. Section 6, early access (line 282)

Old:
> The Platform is currently available to waitlist and early-access users. Access during the early-access period is provided subject to these Terms.

New (DRAFT for legal review: not applied):
> The Platform is currently available during an early-access period. Access during the early-access period is provided subject to these Terms.

### T5. Data roles (line 440)

Old:
> As a controller: in respect of account holder data, waitlist data, and communications with Customers.

New (DRAFT for legal review: not applied):
> As a controller: in respect of account holder data and communications with Customers.
