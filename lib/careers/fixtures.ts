import { createQuestion } from '../jobs/application-form'

import type { CareersJob, CareersPage, CareersRole } from './types'
import type { FormQuestion } from '../jobs/application-form'

/**
 * Stand-in careers data. There is no public careers endpoint yet, so
 * `requests.getCareersPage` resolves with these pages; swapping in the real API
 * means changing that one function and deleting this file.
 *
 * The company and its roles are the sample content of the applicant frames
 * (9346:561510, 9346:561611). Those frames draw two sets of roles: the
 * default list and the HR roles the filtered frame shows. Both are kept so
 * every drawn filter state can be reached.
 */

export const REVOLUT: CareersPage = {
  company: {
    name: 'Revolut',
    about:
      'Revolut is a global fintech that has grown from a currency exchange app into one of the world’s largest financial super-apps. Founded in London in 2015, it now serves more than 75 million personal customers and over 800,000 businesses, across more than 160 countries and territories, and operates as a bank in more than 30 countries. Its products span accounts, payments, savings, investing, crypto, insurance and business banking. In 2025 Revolut reported $6 billion in revenue and $1.7 billion in net profit, and in 2026 it secured a full UK banking licence. It is backed by leading investors including SoftBank, Tiger Global, TCV, Coatue and DST Global, and was most recently valued at around $115 billion.',
  },
  roles: [
    {
      id: 'full-stack-engineer-creative-agents',
      title: 'Full-stack Engineer - Creative Agents',
      team: 'Engineering & Product',
      location: 'United Kingdom',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'data-scientist-insight-analytics',
      title: 'Data Scientist - Insight Analytics',
      team: 'Data Science',
      workplace: 'On-site',
      employmentType: 'Full time',
    },
    {
      id: 'ux-ui-designer-bright-ideas',
      title: 'UX/UI Designer - Bright Ideas',
      team: 'Design',
      workplace: 'Hybrid',
      employmentType: 'Contract',
    },
    {
      id: 'product-manager-tech-innovations',
      title: 'Product Manager - Tech Innovations',
      team: 'Product Management',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'marketing-specialist-growth-strategies',
      title: 'Marketing Specialist - Growth Strategies',
      team: 'Marketing',
      workplace: 'Remote',
      employmentType: 'Part time',
    },
    {
      id: 'devops-engineer-cloud-solutions',
      title: 'DevOps Engineer - Cloud Solutions',
      team: 'Engineering',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'sales-executive-global-ventures',
      title: 'Sales Executive - Global Ventures',
      team: 'Sales',
      workplace: 'On-site',
      employmentType: 'Full time',
    },
    {
      id: 'talent-acquisition-specialist-global-tech',
      title: 'Talent Acquisition Specialist - Global Tech Co.',
      team: 'HR & Recruitment',
      location: 'United States',
      workplace: 'Hybrid',
      employmentType: 'Full time',
    },
    {
      id: 'hr-business-partner-innovative-solutions',
      title: 'HR Business Partner - Innovative Solutions',
      team: 'HR Strategy & Operations',
      location: 'Australia',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'learning-development-manager-future-leaders',
      title: 'Learning and Development Manager - Future Leaders',
      team: 'Training & Development',
      location: 'Canada',
      workplace: 'On-site',
      employmentType: 'Full time',
    },
    {
      id: 'compensation-benefits-analyst-equity-partners',
      title: 'Compensation and Benefits Analyst - Equity Partners',
      team: 'HR Analytics',
      location: 'Germany',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'employee-engagement-coordinator-happy-workplace',
      title: 'Employee Engagement Coordinator - Happy Workplace',
      team: 'HR & Culture',
      location: 'Ireland',
      workplace: 'Hybrid',
      employmentType: 'Full time',
    },
    {
      id: 'recruitment-marketing-specialist-talent-growth',
      title: 'Recruitment Marketing Specialist - Talent Growth',
      team: 'Marketing & HR',
      location: 'Singapore',
      workplace: 'Remote',
      employmentType: 'Full time',
    },
    {
      id: 'diversity-inclusion-manager-inclusive-future',
      title: 'Diversity and Inclusion Manager - Inclusive Future',
      team: 'HR Strategy',
      location: 'Netherlands',
      workplace: 'On-site',
      employmentType: 'Full time',
    },
  ],
}

interface DescriptionSection {
  heading?: string
  lines: readonly string[]
}

/**
 * The job description as drawn in 9346:561642. Each block is a heading and its
 * lines; a line break inside a block is a `<br>`. The duplicate "So, what's in
 * it for you?" heading is kept as drawn in the file.
 */
const DESCRIPTION_SECTIONS: readonly DescriptionSection[] = [
  {
    heading: 'About the job',
    lines: [
      'Team - UK, Health, Advisor & Employer Product, Working Pattern - Hybrid - 2 days per week in the Vitality Bournemouth Office. Full time, 35 hours per week. We are happy to discuss flexible working!',
      'Top 3 skills needed for this role:',
      'End-to-End UX/UI Product Design',
      'Cross-Functional Stakeholder Influence, Business Understanding & Delivery',
      'Design Systems Leadership',
    ],
  },
  {
    heading: 'What this role is all about:',
    lines: [
      "At Vitality, Product Design plays a critical role in shaping the digital experiences that help customers get more from their health and wellbeing journey. This is an exciting opportunity for an experienced Lead Product Designer to join our Enterprise team, where you'll help define and deliver intuitive, user-centred experiences across our Health Policy journey. Working within a cross-functional environment, you'll combine strategic thinking, design leadership and hands-on execution to create products that delight customers while delivering meaningful business outcomes.",
    ],
  },
  {
    heading: 'Key Actions',
    lines: [
      'Be central to the design and evolution of digital experiences across native app and web platforms',
      'Shape and enhance the design system, ensuring consistency, scalability and adoption across products',
      'Create wireframes, prototypes, user flows and design artefacts that communicate ideas effectively',
      'Partner closely with Product Managers, Developers and Content Designers to deliver customer-centric solutions',
      'Drive rapid ideation, testing and iteration to continuously improve user experiences',
      'Establish and maintain high design quality from discovery through to delivery and implementation',
      'Use customer insight, analytics and research to inform design decisions and product direction',
      'Facilitate workshops and stakeholder sessions to gather requirements and align on solutions',
      'Contribute to the growth of the design community through mentoring, coaching and knowledge sharing',
      'Champion design best practices, accessibility and usability standards across the organisation',
    ],
  },
  {
    heading: 'What do you need to thrive?',
    lines: [
      'Degree level education or equivalent professional experience',
      'Experience using and contributing to design systems including governance and standards',
      'Proven experience designing digital products across both web and native app environments',
      'Strong understanding of web development practices',
      'Experience using digital analytics and conversion rate optimisation techniques',
      'Ability to prioritise and refine design backlogs in fast-moving environments',
      'Experience writing user stories and defining acceptance criteria',
      'Strong understanding of Agile delivery practices and sprint ceremonies',
      'Experience using Jira and Confluence',
      'Excellent communication and stakeholder management skills',
      'Ability to lead workshops and facilitate discussions across business and technical teams',
      'Strong collaboration skills with multidisciplinary teams',
    ],
  },
  {
    heading: 'So, what’s in it for you?',
    lines: [
      'Bonus Schemes - A bonus that regularly rewards you for your performance',
      'A pension of up to 12%- We will match your contributions up to 6% of your salary',
      'Our award-winning Vitality health insurance - With its own set of rewards and benefits',
      'Life Assurance - Four times annual salary',
      'These are just some of the many perks that we offer! To view the extensive range of benefits we offer, please visit our careers page.',
      'Fantastic Benefits. Exciting rewards. Great career opportunities!',
    ],
  },
  {
    heading: 'So, what’s in it for you?',
    lines: [
      'Bonus Schemes - A bonus that regularly rewards you for your performance',
      'A pension of up to 12%- We will match your contributions up to 6% of your salary',
      'Our award-winning Vitality health insurance - With its own set of rewards and benefits',
      'Life Assurance - Four times annual salary',
    ],
  },
  {
    heading: undefined,
    lines: [
      'If you are successful in your application and join us at Vitality, this is our promise to you, we will:',
      'Help you to be the healthiest you’ve ever been',
      'Create an environment that embraces you as you are and enables you to be your best self',
      'Give you flexibility on how, where and when you work',
      'Help you advance your career by playing you to your strengths',
      'Give you a voice to help our business grow and make Vitality a great place to be',
      'Give you the space to try, fail and learn',
      'Provide a healthy balance of challenge and support',
      'Recognise and reward you with a competitive salary and amazing benefits',
      'Be there for you when you need us',
      'Provide opportunities for you to be a force for good in society',
      'We commit to all these things because we want you to feel that you belong, and are supported to be happy and healthy.',
    ],
  },
]

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function descriptionHtml(sections: readonly DescriptionSection[]): string {
  return sections
    .map((section) => {
      const heading = section.heading
        ? `<p><strong>${escapeHtml(section.heading)}</strong></p>`
        : ''
      return `<section>${heading}<p>${section.lines.map(escapeHtml).join('<br>')}</p></section>`
    })
    .join('')
}

/**
 * The application form as drawn in 9346:561694, in the order shown. Full name
 * and Email are locked, as the builder's default rows are.
 */
const APPLICATION_QUESTIONS: readonly FormQuestion[] = [
  {
    ...createQuestion('autofill-resume', 'autofill_resume', 'personal_information'),
    label: 'Autofill with resume',
    description: 'Upload your resume here to autofill key application fields.',
    system_key: 'autofill_resume',
  },
  {
    ...createQuestion('full-name', 'short_text', 'personal_information'),
    label: 'Full name',
    required: true,
    locked: true,
    system_key: 'full_name',
  },
  {
    ...createQuestion('email-address', 'email', 'personal_information'),
    label: 'Email address',
    required: true,
    locked: true,
    system_key: 'email',
  },
  {
    ...createQuestion('phone-number', 'phone_number', 'personal_information'),
    label: 'Phone number',
    description: 'Add your country code and drop the leading 0, e.g. +44 XXXXXXXXX',
    required: true,
  },
  {
    ...createQuestion('location', 'short_text', 'personal_information'),
    label: 'Location',
    description: "Country you're currently residing in",
    required: true,
  },
  {
    ...createQuestion('resume', 'file_upload', 'profile'),
    label: 'Resume',
    required: true,
    config: { accept: ['.docx', '.dotx', '.pdf'], max_mb: 5 },
  },
  {
    ...createQuestion('portfolio', 'link', 'profile'),
    label: 'Portfolio Link / Github',
    required: true,
  },
]

/** Input placeholders by question key, as drawn. The form model has no placeholder field. */
const PLACEHOLDERS: Readonly<Record<string, string>> = {
  'email-address': 'hello@example.com...',
  'phone-number': '+ [country code] XXXXXXXXX',
  location: 'Start typing...',
}

const JOB_CONTENT = {
  descriptionHtml: descriptionHtml(DESCRIPTION_SECTIONS),
  questions: APPLICATION_QUESTIONS,
  placeholders: PLACEHOLDERS,
}

/**
 * The public job for a role. The drawn job content is shared; the title and
 * meta come from the role.
 */
function jobForRole(role: CareersRole): CareersJob {
  return {
    id: role.id,
    title: role.title,
    team: role.team,
    location: role.location,
    workplace: role.workplace,
    employmentType: role.employmentType,
    ...JOB_CONTENT,
  }
}

/** Keyed by company slug, as the careers URL carries it. */
const CAREERS_FIXTURES: Record<string, CareersPage> = {
  revolut: REVOLUT,
}

export { CAREERS_FIXTURES, jobForRole }
