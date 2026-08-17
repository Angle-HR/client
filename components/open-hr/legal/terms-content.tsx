import { LegalLink } from './legal-page'

import type { LegalSection } from './legal-page'

const EMAIL = 'hello@tryopenhr.com'

const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: '1. Who We Are',
    blocks: [
      {
        kind: 'p',
        children:
          'Open HR is a product of Angle Open Source Ltd, a private limited company incorporated in England and Wales.',
      },
      { kind: 'p', children: 'Company number: 17066367' },
      { kind: 'p', children: 'Registered office: 71–75 Shelton Street, London, England, WC2H 9JQ' },
      { kind: 'p', children: `Contact: ${EMAIL}` },
      { kind: 'p', children: 'Website: tryopenhr.com' },
      {
        kind: 'p',
        children:
          'Open HR is a compliance-aware, open-source human resources management platform designed for startups and small businesses. The platform is currently in early access, waitlist and onboarding only. Subscription tiers, pricing, and self-hosting options will be published at tryopenhr.com when available.',
      },
      {
        kind: 'p',
        children:
          'Open HR is not an Employer of Record (EOR), payroll provider, or legal services provider. The platform supports compliance; it does not guarantee it. Employer-customers remain the data controller and the legally responsible party for compliance with employment law in their jurisdiction.',
      },
    ],
  },
  {
    heading: '2. Definitions',
    blocks: [
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"Angle Open Source" / "we" / "us" / "our" '}</strong>
            means Angle Open Source Ltd (company number 17066367).
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"Open HR" '}</strong>
            {'/ "the Platform" means the human resources management software developed and maintained by Angle Open Source Ltd.'}
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"Service"'}</strong>
            {' means the hosted version of Open HR operated by Angle Open Source Ltd, currently available to waitlist and early-access users.'}
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"Customer"'}</strong>
            {' means the organisation (employer) that has registered for or been granted access to the Platform.'}
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"Employee User"'}</strong>
            {" means an individual employee, contractor, or worker invited to access the Platform by a Customer under the Customer's account."}
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"User" '}</strong>
            means any individual, including Customers and Employee Users, who accesses the Platform.
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"Customer Data" '}</strong>
            means all data, records, and information uploaded to or processed through the Service by a Customer or
            its Employee Users.
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"DPA"'}</strong>
            {' means the Data Processing Agreement governing how Angle Open Source Ltd processes personal data on behalf of Customers. Acceptance of the DPA is a mandatory gate before any employee or applicant data can be entered into the Platform.'}
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"DSAR" '}</strong>
            means a Data Subject Access Request, a request from an individual to access, correct, or delete their
            personal data.
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"Documentation"'}</strong>
            {' means user guides, help articles, and technical specifications published by Angle Open Source Ltd at tryopenhr.com.'}
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">{'"Active Markets"'}</strong>
            {' means the jurisdictions in which Angle Open Source Ltd currently makes the Service available: the United Kingdom, European Union member states (including Germany), the United States, Nigeria, India, and Kenya.'}
          </>
        ),
      },
    ],
  },
  {
    heading: '3. Acceptance of Terms',
    blocks: [
      {
        kind: 'p',
        children:
          'By joining the waitlist, registering for an account, completing email OTP verification, or using the Service, the User agrees to be bound by these Terms and the Privacy Policy at tryopenhr.com/privacy.',
      },
      {
        kind: 'p',
        children:
          'If you are accepting these Terms on behalf of an organisation, you represent that you have authority to bind that organisation. If you do not have that authority, you must not use the Service.',
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">DPA gate: </strong>
            No employee or applicant data may be entered into the Platform until the Customer has accepted the Data
            Processing Agreement. This is a hard technical gate enforced at account creation — it cannot be skipped
            or deferred. The acceptance timestamp, DPA version, and account ID are retained for the duration of the
            account plus seven years.
          </>
        ),
      },
    ],
  },
  {
    heading: '4. Description of the Service',
    blocks: [
      {
        kind: 'p',
        children:
          'Open HR provides tools to help employers manage core HR functions including: employee records, leave management, onboarding workflows, compliance-aware job creation, applicant tracking, document storage, and reporting.',
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">Current stage:</strong>
            {' The Platform is currently in early access. Features available to early-access users are described at tryopenhr.com. Not all features described in the Documentation may be available during the early-access period. Angle Open Source Ltd will communicate feature availability changes to registered users by email.'}
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">Compliance by design:</strong>
            {" The Platform includes a jurisdiction-aware compliance engine. When an employer creates a job or manages employee data, the Platform surfaces jurisdiction-specific requirements, such as EU Pay Transparency Directive salary disclosure, works council consultation notices in Germany, Kenya DPA Section 50 data localisation warnings, Nigeria NDPA cross-border transfer requirements, and India DPDP Act employment legitimate-use notices, as gates and inline warnings within the product workflow. This compliance layer supports the employer's own obligations; it does not replace the employer's obligation to obtain independent legal advice."}
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">Data residency:</strong>
            {" Candidate and employee data is routed to a regional storage bucket based on the candidate's or employee's location, not the employer's headquarters. An employer in London hiring a candidate in Lagos routes that candidate's application data to the Africa-region storage infrastructure."}
          </>
        ),
      },
    ],
  },
  {
    heading: '5. Eligibility and Account Registration',
    blocks: [
      {
        kind: 'p',
        children:
          'The Service is intended for businesses and organisations. It is not a consumer product. Customers must be a legal entity (company, partnership, charity, or similar) or a sole trader acting in a professional capacity.',
      },
      {
        kind: 'p',
        children:
          'Individual users must be at least 18 years old. The Platform must not be used to create or maintain records for individuals below the legal working age in the relevant jurisdiction.',
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">Account creation flow: </strong>
            Registration requires: (a) email entry; (b) OTP verification, a 6-digit code sent to the registered
            email, valid for 15 minutes, single-use; (c) account type selection (Individual, Team/Business, or
            Employee); (d) for Team/Business accounts, company setup including country of operation, which
            determines data residency routing and applicable compliance gates; and (e) DPA acceptance before any
            employee data pipeline is accessible.
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">Employee accounts:</strong>
            {" Employee Users join via an employer-issued invitation link valid for 7 days. If the verified email matches an active invitation, the employee path is pre-selected. Employee Users are not required to accept the DPA independently, that obligation belongs to the employer-Customer."}
          </>
        ),
      },
      { kind: 'p', children: 'Each Customer is responsible for:' },
      {
        kind: 'list',
        items: [
          'Maintaining the confidentiality and security of its account credentials.',
          'All activity occurring under its account, whether by administrators or Employee Users.',
          <>
            Promptly notifying Angle Open Source Ltd at <LegalLink href={`mailto:${EMAIL}`}>{EMAIL}</LegalLink> upon
            suspecting unauthorised access.
          </>,
          'Keeping Employee User access permissions current as employment relationships change.',
        ],
      },
    ],
  },
  {
    heading: '6. Early Access and Future Pricing',
    blocks: [
      {
        kind: 'p',
        children:
          'The Platform is currently available to waitlist and early-access users. Access during the early-access period is provided subject to these Terms.',
      },
      {
        kind: 'p',
        children:
          'Angle Open Source Ltd intends to introduce paid subscription tiers in the future. When subscription pricing is introduced:',
      },
      {
        kind: 'list',
        items: [
          'Details will be published at tryopenhr.com and communicated to registered users by email at least 30 days before any paid tier takes effect.',
          'Early-access users will be given advance notice and the opportunity to review updated terms before any charges apply.',
          "No charges will be applied to any existing account without the Customer's explicit agreement to the applicable subscription terms at that time.",
        ],
      },
      {
        kind: 'p',
        children:
          'These Terms will be updated when subscription tiers are introduced. The version history in Section 19 will record all material changes.',
      },
    ],
  },
  {
    heading: '7. Acceptable Use Policy',
    blocks: [
      {
        kind: 'p',
        children: 'Customers and all Users must use Open HR only for lawful purposes. The following are prohibited:',
      },
      {
        kind: 'list',
        items: [
          'Processing personal data without a lawful basis under applicable data protection law.',
          'Using the Platform to facilitate or record employment decisions constituting unlawful discrimination on the basis of race, gender, age, disability, religion, sexual orientation, national origin, or any other protected characteristic.',
          'Uploading or transmitting content that is unlawful, defamatory, fraudulent, or that infringes third-party intellectual property rights.',
          'Reverse engineering, decompiling, or disassembling any part of the Service.',
          "Reselling, sublicensing, or making the Service available to third parties outside the Customer's own organisation without prior written consent.",
          'Using automated scripts, bots, or crawlers to extract data from the Service.',
          "Exceeding API rate limits or disrupting the Service's stability for other users.",
          'Disclosing comparative benchmark test results relating to Open HR without prior written consent.',
          'Using the Platform in violation of applicable employment law, tax law, or data protection law in any jurisdiction where the Customer operates.',
          'Using the Platform to process special category data (health, biometric, criminal record data) without a valid legal basis and, where required, an Appropriate Policy Document.',
        ],
      },
      {
        kind: 'p',
        children:
          'Angle Open Source Ltd reserves the right to suspend or terminate access where it reasonably believes a Customer is in breach of this policy.',
      },
    ],
  },
  {
    heading: '8. Customer Responsibilities',
    blocks: [
      { kind: 'p', children: 'Customers are responsible for their own legal compliance, including:' },
      {
        kind: 'list',
        items: [
          'Holding a valid legal basis under applicable data protection law before uploading or processing any employee or applicant personal data.',
          'Informing employees about the use of Open HR to manage their HR records, in accordance with applicable transparency obligations (including GDPR Articles 13 and 14, India DPDP Act notice requirements, Kenya DPA 2019, and Nigeria NDPA 2023).',
          'Configuring the Platform in accordance with their HR policies, local employment law, and any applicable collective agreements or works council requirements. German customers: the Betriebsrat (works council) has co-determination rights under BetrVG 87(1)(6) in respect of technical systems capable of monitoring employee behaviour, including HR software. Customers operating in Germany must obtain works council agreement before activating monitoring-adjacent features of the Platform.',
          'Ensuring Employee User access permissions are kept current.',
          'Maintaining accurate records within the Platform.',
          'Holding a valid legal basis for each category of special category data processed, including health, disability, biometric, and diversity monitoring data.',
          'Complying with employment law obligations including minimum wage, working time regulations, pay transparency reporting, and notification obligations such as WARN Act obligations in the United States or equivalent obligations in other Active Markets.',
          "EU customers: complying with the EU Pay Transparency Directive (Directive 2023/970), which includes publishing salary ranges in job postings, banning pay history questions, providing pay information to employees on request, and, for employers with 100 or more employees, preparing gender pay gap reports. The Platform's compliance gates support this obligation but do not replace the employer's independent legal obligation.",
          'Indian customers: noting that the Digital Personal Data Protection Act 2023 is in force. The employment "legitimate use" exception is available for routine HR processing. Full implementing Rules are expected by May 2027; employers should begin data mapping now.',
          'Kenyan customers: noting that Kenya DPA 2019 Section 50 requires at least one serving copy of Kenyan personal data to reside within Kenya. The Platform flags this at job creation; the compliance obligation rests with the employer-Customer.',
          'Nigerian customers: noting that cross-border transfers of Nigerian personal data require a Cross-Border Data Transfer Instrument (CBDTI) or equivalent safeguard under NDPA 2023 Section 43. The Platform flags this requirement at job creation.',
        ],
      },
      {
        kind: 'p',
        children:
          "Employee Users access the Platform under the Customer's account and authority. The Customer is responsible for ensuring Employee Users comply with these Terms.",
      },
      { kind: 'subheading', text: '8A. Restriction on Use of Customer Data' },
      {
        kind: 'p',
        children:
          'Angle Open Source Ltd may use Customer Data only to the extent necessary to provide, maintain, and support the Service.',
      },
      {
        kind: 'p',
        children:
          "Angle Open Source Ltd will not use Customer Data for any of the following without the Customer's explicit prior written consent: training, fine-tuning, or improving any artificial intelligence or machine learning model; developing new product features using Customer Data as training material; generating insights, benchmarks, or analytics for Angle Open Source Ltd's own commercial benefit; or sharing Customer Data with third parties for marketing or competitive intelligence purposes.",
      },
      {
        kind: 'p',
        children:
          'Aggregated, anonymised, and non-identifiable statistical data (e.g. feature usage counts) may be used to improve the Service, provided no Customer or individual can be identified.',
      },
      { kind: 'p', children: 'This restriction is in addition to, and not in place of, the obligations in the DPA.' },
    ],
  },
  {
    heading: '9. Intellectual Property',
    blocks: [
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">Platform IP:</strong>
            {' All intellectual property rights in the Service, including its software, architecture, design, Documentation, and branding, are owned by Angle Open Source Ltd or its licensors. These Terms grant a limited, non-exclusive, non-transferable right to access and use the Service while access is granted.'}
          </>
        ),
      },
      {
        kind: 'p',
        children:
          'Customer Data: Customers retain full ownership of Customer Data. Angle Open Source Ltd acquires no ownership rights in Customer Data.',
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">Open source code:</strong>
            {' The Open HR codebase will be made available as open-source software in due course. Details of the applicable licence will be published at tryopenhr.com when available. These Terms govern use of the hosted Service only.'}
          </>
        ),
      },
      {
        kind: 'p',
        children: (
          <>
            <strong className="font-bold">Feedback:</strong>
            {' Angle Open Source Ltd may use any feedback, suggestions, or improvement ideas provided by Customers or Employee Users freely and without compensation. This clause does not grant Angle Open Source Ltd any rights to Customer Data.'}
          </>
        ),
      },
      {
        kind: 'p',
        children:
          'Trademarks: "Open HR" and "Angle Open Source" are trademarks of Angle Open Source Ltd. Nothing in these Terms grants any right to use them.',
      },
    ],
  },
  {
    heading: '10. Data, Privacy and DSAR Routing',
    blocks: [
      { kind: 'p', children: 'Angle Open Source Ltd processes personal data in two capacities:' },
      {
        kind: 'list',
        items: [
          'As a controller: in respect of account holder data, waitlist data, and communications with Customers.',
          'As a processor: in respect of employee and applicant personal data uploaded by Customers.',
        ],
      },
      {
        kind: 'p',
        children:
          "The Customer is the data controller (or, under India DPDP Act terminology, the Data Fiduciary) for employee and applicant personal data entered into the Platform. Angle Open Source Ltd processes that data only on the Customer's instructions and in accordance with the DPA.",
      },
      {
        kind: 'p',
        children:
          'DPA gate: Customers must accept the DPA before any employee data pipeline is accessible. The DPA is available at tryopenhr.com/legal/dpa.',
      },
      { kind: 'p', children: 'DSAR routing: When an individual exercises data subject rights, two routes exist:' },
      {
        kind: 'list',
        items: [
          <>
            <strong className="font-bold">Route 1 – via the employer: </strong>
            Employee Users and applicants should contact their employer (the Customer) directly. The Customer, as
            data controller, is responsible for responding within applicable statutory timeframes.
          </>,
          <>
            <strong className="font-bold">Route 2 – via Angle Open Source Ltd directly: </strong>
            Where an individual contacts Angle Open Source Ltd directly, we will verify identity, determine whether
            we are the controller or processor for the relevant data, and for processor data redirect the
            individual to their employer. For data where we are the controller, we will respond within 30 days.
          </>,
        ],
      },
      {
        kind: 'p',
        children:
          'EU Art. 27 Representative: Angle Open Source Ltd has appointed Prighter (Vienna, Austria) as its EU GDPR Article 27 representative. Contact details are published in the Privacy Policy at tryopenhr.com/privacy.',
      },
      {
        kind: 'p',
        children: 'Full details of data processing are set out in the Privacy Policy at tryopenhr.com/privacy.',
      },
    ],
  },
  {
    heading: '11. Confidentiality, Service Availability and Security',
    blocks: [
      {
        kind: 'p',
        children:
          "Each party will keep the other's confidential information private and not disclose it without prior written consent. Confidential information excludes anything that is or becomes publicly available other than through breach, was already known to the recipient, is independently developed, or must be disclosed by law with prior notice where practicable. These obligations survive termination for five years.",
      },
      {
        kind: 'p',
        children:
          'We will use commercially reasonable efforts to keep the Service available. During early access, no formal uptime SLA applies. Planned maintenance will be communicated in advance where possible.',
      },
      {
        kind: 'p',
        children:
          "If we become aware of a security incident affecting Customer Data in our capacity as processor, we will notify the Customer within 72 hours with details of the nature of the incident, affected data subjects, likely consequences, and steps taken. The Customer, as data controller, remains responsible for notifying the relevant supervisory authority and affected individuals. On reasonable written request (no more than once per year), we will provide available security audit reports or certification documentation under a mutual NDA. Customers subject to NIS2 supply chain obligations may request additional assurance cooperation with 30 days' notice.",
      },
    ],
  },
  {
    heading: '12. Account Suspension and Termination',
    blocks: [
      {
        kind: 'p',
        children:
          "We may suspend access immediately if we have reasonable grounds to believe a Customer is in material breach of the Acceptable Use Policy, continued access would create legal risk, or a competent authority requires it. Where possible, 7 days' notice will be given.",
      },
      {
        kind: 'p',
        children: (
          <>
            Customers may close their account at any time by contacting{' '}
            <LegalLink href={`mailto:${EMAIL}`}>{EMAIL}</LegalLink>. On closure or termination, Customer Data is
            retained for 30 days during which a full export in CSV or JSON format is available on request at no
            charge. After 30 days, Customer Data is deleted from production systems; written confirmation is
            available on request. Anonymised or aggregated data from which no individual can be identified may be
            retained.
          </>
        ),
      },
      {
        kind: 'p',
        children:
          "Customers may export Customer Data at any time via the Platform's built-in export tools. For EU-based Customers, we comply with the EU Data Act (Regulation 2023/2854, in force from 12 September 2025) and maintain no technical or contractual barriers to switching providers.",
      },
    ],
  },
  {
    heading: '13. Warranties and Disclaimers',
    blocks: [
      {
        kind: 'p',
        children:
          'We warrant that the Service will materially conform to its published Documentation, that we will apply commercially reasonable security measures to protect Customer Data, and that we have the right to grant the access rights in these Terms. To the fullest extent permitted by law, we disclaim all other warranties, express or implied, including any implied warranty of fitness for a specific purpose or error-free operation.',
      },
      {
        kind: 'p',
        children:
          "The Platform's compliance features support Customer obligations; they do not constitute legal advice and do not replace independent legal counsel. Nothing in these Terms excludes statutory rights under the Consumer Rights Act 2015, applicable EU, US, Nigerian, Indian, or Kenyan mandatory law, or liability for death or personal injury caused by negligence, or for fraud.",
      },
    ],
  },
  {
    heading: '14. Limitation of Liability',
    blocks: [
      {
        kind: 'p',
        children:
          'Our total aggregate liability to the Customer, in contract, tort, or otherwise, shall not exceed £500 or the total fees paid by the Customer in the 12 months preceding the claim, whichever is greater. During the early-access period when no fees are charged, the cap is £500. We are not liable for indirect, consequential, or punitive damages, loss of profit or revenue, or data loss except where caused by our failure to maintain adequate backups. These exclusions do not apply to liability for death or personal injury caused by negligence, fraud, our DPA obligations in respect of a breach caused by our own default, or any liability that cannot be limited under applicable law.',
      },
    ],
  },
  {
    heading: '15. Indemnification',
    blocks: [
      {
        kind: 'p',
        children:
          'The Customer will defend, indemnify, and hold harmless Angle Open Source Ltd from any claims arising from breach of these Terms, failure to comply with applicable law, Customer Data infringing third-party rights, or use of the Platform without a valid legal basis. We will defend, indemnify, and hold harmless the Customer from third-party claims that the Service (as provided, unmodified) infringes their intellectual property rights, provided the Customer notifies us promptly, grants us control of the defence, and cooperates reasonably. This does not apply to claims arising from Customer modifications, Customer Data, or use in breach of these Terms.',
      },
    ],
  },
  {
    heading: '16. Changes to the Service and Terms',
    blocks: [
      {
        kind: 'p',
        children:
          'We may update or modify the Service at any time during early access. Material changes to these Terms — those substantially affecting Customer rights — will be notified by email at least 30 days before taking effect. Minor changes take effect immediately on publication. The current version is always at tryopenhr.com/terms. Continued use after any change takes effect constitutes acceptance.',
      },
    ],
  },
  {
    heading: '17. Governing Law and Dispute Resolution',
    blocks: [
      {
        kind: 'p',
        children:
          'These Terms are governed by the laws of England and Wales. This choice of law does not affect mandatory local protections that apply to Customers in each Active Market. For EU and German customers, these include Consumer Rights Directive withdrawal rights, EU GDPR, EU Data Act portability rights, EU Pay Transparency Directive obligations, NIS2 supply chain obligations for regulated-sector customers, and, specifically for Germany, BetrVG works council co-determination rights, BDSG, and KSchG employment protections. For US customers, applicable state consumer protection law applies, including CCPA/CPRA for California users and state AI transparency laws. For Nigerian customers, the NDPA 2023, GAID 2025, and Federal Competition and Consumer Protection Act 2018 apply. For Indian customers, the DPDP Act 2023 and Information Technology Act 2000 apply. For Kenyan customers, the Data Protection Act 2019 and Consumer Protection Act 2012 apply.',
      },
      {
        kind: 'p',
        children: (
          <>
            If you have a complaint, email <LegalLink href={`mailto:${EMAIL}`}>{EMAIL}</LegalLink> with the subject
            line &quot;Complaint&quot;. We will acknowledge within 5 business days and respond substantively within
            30 days. Data-related complaints from UK users will be acknowledged within 30 days in line with the
            Data (Use and Access) Act 2025 from 19 June 2026. If unresolved, UK users may escalate to the ICO at
            ico.org.uk; EU users to their national supervisory authority listed at edpb.europa.eu (German users may
            contact the BfDI or the relevant Landesbehörde); US users to the FTC or their state attorney general;
            Nigerian users to the NDPC at ndpc.gov.ng or the FCCPC at fccpc.gov.ng; Indian users to the Data
            Protection Board of India when established; and Kenyan users to the ODPC at odpc.go.ke or the
            Competition Authority of Kenya.
          </>
        ),
      },
      {
        kind: 'p',
        children:
          'For B2B disputes, both parties agree to attempt resolution through good-faith senior management discussions before commencing proceedings. If unresolved within 30 days, either party may refer the matter to the courts of England and Wales, subject to the mandatory jurisdiction provisions above.',
      },
    ],
  },
  {
    heading: '18. Third-Party Services',
    blocks: [
      {
        kind: 'p',
        children:
          "The Service may integrate with third-party identity providers and communication tools. Use of any third-party service is governed by that party's own terms. We are not responsible for the availability, performance, security, or data practices of third-party services. A current sub-processor list is published at tryopenhr.com/legal/sub-processors; Customers will be notified before any new sub-processor is engaged.",
      },
    ],
  },
  {
    heading: '19. General Provisions',
    blocks: [
      {
        kind: 'p',
        children: (
          <>
            These Terms, together with the Privacy Policy and DPA, are the entire agreement between the parties and
            supersede all prior representations. If any provision is found invalid, the remainder continues in full
            force. Failure to enforce any provision is not a waiver of future enforcement. The Customer may not
            assign its rights without our prior written consent; we may assign ours to a successor entity provided
            the successor is bound by these Terms. Formal legal notices must be sent in writing to our registered
            office; day-to-day communications may go to <LegalLink href={`mailto:${EMAIL}`}>{EMAIL}</LegalLink>.
            Neither party is liable for failure to perform due to circumstances beyond their reasonable control,
            provided prompt notice is given. The parties are independent contractors — nothing in these Terms
            creates a partnership, agency, or employment relationship.
          </>
        ),
      },
      {
        kind: 'p',
        children:
          'The following sections survive termination: Section 8A (data use restriction), Section 9 (intellectual property), Section 11 (confidentiality), Section 12 (termination obligations), Section 14 (limitation of liability), Section 15 (indemnification), Section 17 (governing law), and this Section 19.',
      },
      {
        kind: 'p',
        children: (
          <>
            We are committed to making Open HR accessible and target WCAG 2.1 Level AA compliance. We maintain
            business insurance including public liability, professional indemnity, and cyber liability cover.
            Certificates of insurance are available on written request to{' '}
            <LegalLink href={`mailto:${EMAIL}`}>{EMAIL}</LegalLink>.
          </>
        ),
      },
    ],
  },
  {
    heading: 'Legal Disclaimer',
    blocks: [
      { kind: 'p', children: 'These Terms were last reviewed pre-launch on 21 July 2026.' },
    ],
  },
]

export { TERMS_SECTIONS }
